import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../logger';

const SYSTEM_PROMPT = `Ты — RAOS Support Bot, бот технической поддержки POS-системы RAOS для розничной торговли в Узбекистане.

Твоя задача — помогать клиентам с вопросами по работе с системой RAOS.

RAOS — это:
- POS-система (точка продаж) для магазинов: продукты, косметика, электроника, аптека, ресторан
- Веб-админка: app.raos.uz (управление товарами, отчёты, сотрудники, филиалы)
- Мобильное приложение для сотрудников и владельцев
- Работает офлайн — продажи сохраняются без интернета
- Поддержка: наличные, карта, Click, Payme, насия (долг)

Основные функции:
- Каталог товаров (добавление, редактирование, штрих-коды, категории)
- Продажи (сканирование, корзина, оплата, чеки)
- Возвраты товаров
- Управление складом (приход, расход, перемещение, инвентаризация)
- Клиенты и долги (насия)
- Смены кассиров (открытие/закрытие, Z-отчёт)
- Отчёты (продажи, прибыль, остатки, ABC-анализ)
- Сотрудники и роли (Owner, Admin, Manager, Cashier)
- Филиалы (несколько магазинов в одном аккаунте)
- Печать чеков и этикеток
- Уведомления через Telegram

Правила ответов:
1. Отвечай кратко и по делу, максимум 5-7 предложений
2. Давай пошаговые инструкции если нужно
3. Если не знаешь точного ответа — скажи честно и предложи создать тикет (/ticket)
4. Отвечай на том языке, на котором спросили (русский или узбекский)
5. Не выдумывай функции которых нет
6. Если вопрос не про RAOS — вежливо скажи что помогаешь только по RAOS`;

let client: Anthropic | null = null;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_HOUR = Number(process.env.AI_RATE_LIMIT_PER_HOUR ?? 50);

function getClient(): Anthropic | null {
  if (client) return client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  client = new Anthropic({ apiKey: key });
  return client;
}

function checkRateLimit(chatId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(chatId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(chatId, { count: 1, resetAt: now + 3600_000 });
    return true;
  }

  if (entry.count >= MAX_PER_HOUR) return false;
  entry.count++;
  return true;
}

export async function askAI(chatId: string, question: string): Promise<string | null> {
  const ai = getClient();
  if (!ai) return null;

  if (!checkRateLimit(chatId)) {
    return '⚠️ Вы превысили лимит вопросов (50 в час). Попробуйте позже или создайте тикет: /ticket';
  }

  try {
    const response = await ai.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: question }],
    });

    const text = response.content[0];
    if (text?.type === 'text') {
      logger.log('[AI] Response generated', { chatId, tokens: response.usage.output_tokens });
      return text.text;
    }
    return null;
  } catch (err) {
    logger.error('[AI] Error', { error: (err as Error).message });
    return null;
  }
}

export function isAIAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
