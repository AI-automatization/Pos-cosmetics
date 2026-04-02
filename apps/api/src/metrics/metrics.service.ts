import { Injectable, Logger } from '@nestjs/common';

// ─── Prometheus-format text encoder ──────────────────────────────────────────
// Generates basic metrics without prom-client dependency.
// When prom-client is installed, this can be replaced with the full registry.

interface GaugeSnapshot {
  name: string;
  help: string;
  type: 'gauge' | 'counter';
  labels?: Record<string, string>;
  value: number;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly startedAt = Date.now();

  // ─── Request counters (in-memory) ─────────────────────────────────────────
  private readonly requestCounts = new Map<string, number>();  // key = "method:route:status"
  private readonly requestDurations = new Map<string, number[]>(); // key = "method:route"

  // Record a request — called from LoggingInterceptor
  recordRequest(method: string, route: string, status: number, durationMs: number) {
    const countKey = `${method}:${route}:${status}`;
    this.requestCounts.set(countKey, (this.requestCounts.get(countKey) ?? 0) + 1);

    const durationKey = `${method}:${route}`;
    if (!this.requestDurations.has(durationKey)) {
      this.requestDurations.set(durationKey, []);
    }
    const durations = this.requestDurations.get(durationKey)!;
    durations.push(durationMs);
    // Keep last 1000 per route to avoid memory growth
    if (durations.length > 1000) durations.shift();
  }

  // ─── Generate Prometheus text format ──────────────────────────────────────

  async collect(): Promise<string> {
    // Try prom-client first (if installed)
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const promClient = require('prom-client');
      return await promClient.register.metrics();
    } catch {
      // fallback to built-in stats
    }

    const gauges: GaugeSnapshot[] = [
      // Process stats
      {
        name: 'process_uptime_seconds',
        help: 'Process uptime in seconds',
        type: 'gauge',
        value: Math.floor(process.uptime()),
      },
      {
        name: 'nodejs_heap_size_used_bytes',
        help: 'Used heap size in bytes',
        type: 'gauge',
        value: process.memoryUsage().heapUsed,
      },
      {
        name: 'nodejs_heap_size_total_bytes',
        help: 'Total heap size in bytes',
        type: 'gauge',
        value: process.memoryUsage().heapTotal,
      },
      {
        name: 'nodejs_rss_bytes',
        help: 'Resident set size in bytes',
        type: 'gauge',
        value: process.memoryUsage().rss,
      },
      {
        name: 'nodejs_external_memory_bytes',
        help: 'External memory (C++ objects bound to JS)',
        type: 'gauge',
        value: process.memoryUsage().external,
      },
    ];

    // HTTP request counters
    const lines: string[] = [
      '# HELP http_requests_total Total HTTP requests',
      '# TYPE http_requests_total counter',
    ];
    for (const [key, count] of this.requestCounts) {
      const [method, route, status] = key.split(':');
      const safeRoute = route.replace(/"/g, '\\"');
      lines.push(`http_requests_total{method="${method}",route="${safeRoute}",status="${status}"} ${count}`);
    }

    // Latency p50/p95 per route
    lines.push('');
    lines.push('# HELP http_request_duration_p50_ms HTTP request p50 latency in ms');
    lines.push('# TYPE http_request_duration_p50_ms gauge');
    lines.push('# HELP http_request_duration_p95_ms HTTP request p95 latency in ms');
    lines.push('# TYPE http_request_duration_p95_ms gauge');

    for (const [key, durations] of this.requestDurations) {
      if (durations.length === 0) continue;
      const sorted = [...durations].sort((a, b) => a - b);
      const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
      const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
      const [method, route] = key.split(':');
      const safeRoute = route.replace(/"/g, '\\"');
      lines.push(`http_request_duration_p50_ms{method="${method}",route="${safeRoute}"} ${p50}`);
      lines.push(`http_request_duration_p95_ms{method="${method}",route="${safeRoute}"} ${p95}`);
    }

    // Standard gauges
    for (const g of gauges) {
      lines.push('');
      lines.push(`# HELP ${g.name} ${g.help}`);
      lines.push(`# TYPE ${g.name} ${g.type}`);
      const labelStr = g.labels
        ? '{' + Object.entries(g.labels).map(([k, v]) => `${k}="${v}"`).join(',') + '}'
        : '';
      lines.push(`${g.name}${labelStr} ${g.value}`);
    }

    return lines.join('\n') + '\n';
  }
}
