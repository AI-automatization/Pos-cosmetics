import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service';

const CBU_API_URL = 'https://cbu.uz/oz/arkhiv-kursov-valyut/json/';
const CBU_CACHE_KEY = 'exchange_rate:usd_uzs:latest';
const RATE_CACHE_TTL = 86400; // 24 hours

interface CbuRateItem {
  id: string;
  Code: string;
  Ccy: string;
  CcyNm_UZ: string;
  CcyNm_UZC: string;
  CcyNm_RU: string;
  CcyNm_EN: string;
  Nominal: string;
  Rate: string;
  Diff: string;
  Date: string;
}

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly cb: CircuitBreakerService,
  ) {}

  // ─── GET LATEST RATE ─────────────────────────────────────────────────────────

  async getLatestRate(): Promise<{ usdUzs: number; date: string; source: string }> {
    // 1. Try cache first
    const cached = await this.cache.get<{ usdUzs: number; date: string; source: string }>(
      CBU_CACHE_KEY,
    );
    if (cached) return cached;

    // 2. Try DB
    const latest = await this.prisma.exchangeRate.findFirst({
      orderBy: { date: 'desc' },
    });

    if (latest) {
      const result = {
        usdUzs: Number(latest.usdUzs),
        date: latest.date.toISOString().slice(0, 10),
        source: latest.source,
      };
      await this.cache.set(CBU_CACHE_KEY, result, RATE_CACHE_TTL);
      return result;
    }

    // 3. Fallback: fetch from CBU
    return this.syncFromCbu();
  }

  // ─── GET RATE FOR SPECIFIC DATE ───────────────────────────────────────────────

  async getRateForDate(date: Date): Promise<number> {
    const dateStr = date.toISOString().slice(0, 10);
    const record = await this.prisma.exchangeRate.findFirst({
      where: { date: { lte: date } },
      orderBy: { date: 'desc' },
    });

    if (record) return Number(record.usdUzs);

    this.logger.warn(`[ExchangeRate] No rate found for date ${dateStr}, fetching from CBU`);
    const fetched = await this.syncFromCbu();
    return fetched.usdUzs;
  }

  // ─── CONVERT USD → UZS ───────────────────────────────────────────────────────

  async convertUsdToUzs(usdAmount: number): Promise<number> {
    const { usdUzs } = await this.getLatestRate();
    return Math.round(usdAmount * usdUzs);
  }

  // ─── SYNC FROM CBU API ────────────────────────────────────────────────────────

  async syncFromCbu(): Promise<{ usdUzs: number; date: string; source: string }> {
    let usdRate: number | null = null;
    let rateDate: string | null = null;

    // T-093: Circuit breaker — CBU API fail bo'lsa oxirgi cached kurs ishlatiladi
    const fetched = await this.cb.execute(
      'cbu-exchange-rate',
      async () => {
        const response = await fetch(CBU_API_URL, {
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error(`CBU API status: ${response.status}`);

        const data = (await response.json()) as CbuRateItem[];
        const usdItem = data.find((item) => item.Ccy === 'USD');
        if (!usdItem) throw new Error('USD rate not found in CBU response');

        return {
          rate: parseFloat(usdItem.Rate) / parseInt(usdItem.Nominal, 10),
          date: usdItem.Date,
        };
      },
      async () => {
        // Fallback: oxirgi saqlangan kursni qaytarish
        const latest = await this.prisma.exchangeRate.findFirst({ orderBy: { date: 'desc' } });
        if (!latest) throw new Error('CBU API xatosi va cached kurs yo\'q');
        this.logger.warn('[ExchangeRate] CBU circuit OPEN — cached kurs ishlatilmoqda');
        return {
          rate: Number(latest.usdUzs),
          date: latest.date.toISOString().slice(0, 10),
          isFallback: true,
        };
      },
    );

    if ('isFallback' in fetched && fetched.isFallback) {
      return { usdUzs: fetched.rate, date: fetched.date as string, source: 'CACHED' };
    }

    usdRate = (fetched as { rate: number; date: string }).rate;
    rateDate = (fetched as { rate: number; date: string }).date;

    this.logger.log(`[ExchangeRate] CBU USD/UZS = ${usdRate} (${rateDate})`);

    if (!usdRate || !rateDate) {
      throw new Error('CBU kurs olishda xatolik: ma\'lumot bo\'sh');
    }

    // Parse date: DD.MM.YYYY → Date
    const [day, month, year] = rateDate.split('.');
    const parsedDate = new Date(`${year}-${month}-${day}`);

    // Upsert to DB
    const record = await this.prisma.exchangeRate.upsert({
      where: {
        date_source: {
          date: parsedDate,
          source: 'CBU',
        },
      },
      update: { usdUzs: usdRate },
      create: {
        date: parsedDate,
        usdUzs: usdRate,
        source: 'CBU',
      },
    });

    const result = {
      usdUzs: Number(record.usdUzs),
      date: record.date.toISOString().slice(0, 10),
      source: record.source,
    };

    // Cache it
    await this.cache.set(CBU_CACHE_KEY, result, RATE_CACHE_TTL);

    return result;
  }

  // ─── GET HISTORY ─────────────────────────────────────────────────────────────

  async getRateHistory(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.prisma.exchangeRate.findMany({
      where: { date: { gte: since } },
      orderBy: { date: 'desc' },
      select: {
        date: true,
        usdUzs: true,
        source: true,
      },
    });
  }
}
