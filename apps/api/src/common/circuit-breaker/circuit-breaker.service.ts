import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

/**
 * T-093: Circuit Breaker — Tashqi servislarni himoya qilish
 *
 * Holatlar:
 *   CLOSED    — normal ishlash
 *   OPEN      — 3 ketma-ket xato → OPEN (30s) → so'rov rad etiladi
 *   HALF_OPEN — 30s o'tgach test so'rov → muvaffaqiyatli → CLOSED
 *
 * Foydalanish:
 *   await this.cb.execute('fiscal-api', () => this.sendFiscal(data), async () => null)
 */

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitStats {
  state: CircuitState;
  failures: number;
  lastFailureAt: number | null;
  totalCalls: number;
  totalFailures: number;
  openedAt: number | null;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);

  // Per-service circuit state
  private readonly circuits = new Map<string, CircuitStats>();

  // Config
  private readonly FAILURE_THRESHOLD = 3;
  private readonly RESET_TIMEOUT_MS = 30_000; // 30 sekund

  private getOrCreate(name: string): CircuitStats {
    if (!this.circuits.has(name)) {
      this.circuits.set(name, {
        state: 'CLOSED',
        failures: 0,
        lastFailureAt: null,
        totalCalls: 0,
        totalFailures: 0,
        openedAt: null,
      });
    }
    return this.circuits.get(name)!;
  }

  /**
   * Tashqi servis chaqiruvini circuit breaker orqali o'tkazish.
   * @param name     - Servis nomi (e.g. 'fiscal-api', 'sms-gateway', 'cbu-exchange')
   * @param fn       - Asosiy chaqiruv funksiyasi
   * @param fallback - Fallback funksiyasi (circuit OPEN bo'lganda ishlatiladi)
   */
  async execute<T>(
    name: string,
    fn: () => Promise<T>,
    fallback?: () => Promise<T>,
  ): Promise<T> {
    const circuit = this.getOrCreate(name);
    circuit.totalCalls++;

    // OPEN holat — reset timeout o'tganmi tekshir
    if (circuit.state === 'OPEN') {
      const elapsed = Date.now() - (circuit.openedAt ?? 0);
      if (elapsed >= this.RESET_TIMEOUT_MS) {
        circuit.state = 'HALF_OPEN';
        this.logger.log(`[CB] ${name}: OPEN→HALF_OPEN (test so'rov)`);
      } else {
        this.logger.warn(`[CB] ${name}: OPEN — so'rov rad etildi (${Math.ceil((this.RESET_TIMEOUT_MS - elapsed) / 1000)}s qoldi)`);
        if (fallback) return fallback();
        throw new ServiceUnavailableException(`${name} service is currently unavailable`);
      }
    }

    // Chaqiruv (CLOSED yoki HALF_OPEN)
    try {
      const result = await fn();

      // Muvaffaqiyatli — counter reset
      if (circuit.state === 'HALF_OPEN') {
        this.logger.log(`[CB] ${name}: HALF_OPEN→CLOSED (test muvaffaqiyatli)`);
      }
      circuit.state = 'CLOSED';
      circuit.failures = 0;
      return result;
    } catch (err) {
      circuit.failures++;
      circuit.totalFailures++;
      circuit.lastFailureAt = Date.now();

      if (circuit.state === 'HALF_OPEN' || circuit.failures >= this.FAILURE_THRESHOLD) {
        circuit.state = 'OPEN';
        circuit.openedAt = Date.now();
        this.logger.error(
          `[CB] ${name}: →OPEN (${circuit.failures} xato, ${this.RESET_TIMEOUT_MS / 1000}s blok)`,
          { error: (err as Error).message },
        );
      } else {
        this.logger.warn(
          `[CB] ${name}: xato ${circuit.failures}/${this.FAILURE_THRESHOLD}`,
          { error: (err as Error).message },
        );
      }

      if (fallback) {
        this.logger.log(`[CB] ${name}: fallback ishlatilmoqda`);
        return fallback();
      }
      throw err;
    }
  }

  /** Barcha circuit holatlarini ko'rish (admin monitoring uchun) */
  getStats(): Record<string, CircuitStats> {
    const result: Record<string, CircuitStats> = {};
    this.circuits.forEach((stats, name) => {
      result[name] = { ...stats };
    });
    return result;
  }

  /** Aniq bir circuit ni qo'lda reset qilish (admin uchun) */
  reset(name: string): void {
    const circuit = this.circuits.get(name);
    if (circuit) {
      circuit.state = 'CLOSED';
      circuit.failures = 0;
      circuit.openedAt = null;
      this.logger.log(`[CB] ${name}: manually reset`);
    }
  }
}
