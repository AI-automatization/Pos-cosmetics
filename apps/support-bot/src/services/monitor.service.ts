import { config } from '../config';
import { logger } from '../logger';
import { DIAGNOSTIC_RULES } from '../data/diagnostic-rules';

export interface EndpointState {
  url: string;
  name: string;
  status: 'up' | 'down' | 'degraded';
  consecutiveFailures: number;
  lastCheck: Date | null;
  lastResponseMs: number;
  lastError: string;
  alertSent: boolean;
}

const endpoints: EndpointState[] = [
  { url: config.endpoints.apiPing, name: 'API', status: 'up', consecutiveFailures: 0, lastCheck: null, lastResponseMs: 0, lastError: '', alertSent: false },
  { url: config.endpoints.apiReady, name: 'API Ready', status: 'up', consecutiveFailures: 0, lastCheck: null, lastResponseMs: 0, lastError: '', alertSent: false },
  { url: config.endpoints.app, name: 'Web Admin', status: 'up', consecutiveFailures: 0, lastCheck: null, lastResponseMs: 0, lastError: '', alertSent: false },
  { url: config.endpoints.landing, name: 'Landing', status: 'up', consecutiveFailures: 0, lastCheck: null, lastResponseMs: 0, lastError: '', alertSent: false },
];

async function checkEndpoint(ep: EndpointState): Promise<void> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(ep.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'RAOS-SupportBot/1.0' },
    });
    clearTimeout(timeout);

    ep.lastResponseMs = Date.now() - start;
    ep.lastCheck = new Date();

    if (res.ok) {
      if (ep.consecutiveFailures > 0) {
        logger.log(`[Monitor] ${ep.name} recovered`, { url: ep.url, ms: ep.lastResponseMs });
      }
      ep.consecutiveFailures = 0;
      ep.status = ep.lastResponseMs > 3000 ? 'degraded' : 'up';
      ep.lastError = '';
      ep.alertSent = false;
    } else {
      ep.consecutiveFailures++;
      ep.status = 'down';
      ep.lastError = `HTTP ${res.status}`;
      logger.warn(`[Monitor] ${ep.name} returned ${res.status}`, { url: ep.url });
    }
  } catch (err) {
    ep.lastResponseMs = Date.now() - start;
    ep.lastCheck = new Date();
    ep.consecutiveFailures++;
    ep.status = 'down';

    const msg = (err as Error).message ?? 'Unknown error';
    if (msg.includes('abort')) {
      ep.lastError = 'TIMEOUT';
    } else if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
      ep.lastError = 'NXDOMAIN';
    } else if (msg.includes('ECONNREFUSED')) {
      ep.lastError = 'ECONNREFUSED';
    } else if (msg.includes('certificate') || msg.includes('SSL') || msg.includes('TLS')) {
      ep.lastError = 'SSL';
    } else {
      ep.lastError = msg.slice(0, 100);
    }

    logger.warn(`[Monitor] ${ep.name} check failed`, { url: ep.url, error: ep.lastError });
  }
}

export async function checkAllEndpoints(): Promise<EndpointState[]> {
  await Promise.all(endpoints.map(checkEndpoint));
  return endpoints;
}

export function getEndpointStates(): EndpointState[] {
  return endpoints;
}

export function getDownEndpoints(): EndpointState[] {
  return endpoints.filter(
    (ep) => ep.consecutiveFailures >= config.monitorAlertThreshold,
  );
}

export function getNewlyDownEndpoints(): EndpointState[] {
  return endpoints.filter(
    (ep) => ep.consecutiveFailures >= config.monitorAlertThreshold && !ep.alertSent,
  );
}

export function getNewlyRecoveredEndpoints(): EndpointState[] {
  return endpoints.filter(
    (ep) => ep.status === 'up' && ep.alertSent,
  );
}

export function markAlertSent(ep: EndpointState): void {
  ep.alertSent = true;
}

export function markAlertCleared(ep: EndpointState): void {
  ep.alertSent = false;
}

export function getDiagnostic(errorPattern: string): string | null {
  const rule = DIAGNOSTIC_RULES.find((r) =>
    errorPattern.toUpperCase().includes(r.pattern),
  );
  if (!rule) return null;

  return (
    `🔍 *${rule.title_ru}*\n\n` +
    `*Причина:* ${rule.cause_ru}\n\n` +
    `*Как исправить:*\n${rule.fix_ru}`
  ).replace(/([_\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

export function formatStatusMessage(): string {
  const lines = ['📊 *Статус сервисов RAOS*\n'];

  for (const ep of endpoints) {
    const icon = ep.status === 'up' ? '🟢' : ep.status === 'degraded' ? '🟡' : '🔴';
    const ms = ep.lastResponseMs ? ` \\(${ep.lastResponseMs}ms\\)` : '';
    const err = ep.lastError ? ` — ${ep.lastError}` : '';
    lines.push(`${icon} *${ep.name}*${ms}${err}`);
  }

  const lastCheck = endpoints[0]?.lastCheck;
  if (lastCheck) {
    lines.push(`\n_Последняя проверка: ${lastCheck.toLocaleTimeString('ru-RU', { timeZone: 'Asia/Tashkent' })}_`);
  }

  return lines.join('\n').replace(/([_\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}
