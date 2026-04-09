// Structured JSON logger for grammY bot — CLAUDE.md standartiga mos
const fmt = (level: string, msg: string, ctx?: object) =>
  JSON.stringify({ level, msg, ...ctx, ts: new Date().toISOString() });

export const logger = {
  log:   (msg: string, ctx?: object) => console.log(fmt('info', msg, ctx)),
  warn:  (msg: string, ctx?: object) => console.warn(fmt('warn', msg, ctx)),
  error: (msg: string, ctx?: object) => console.error(fmt('error', msg, ctx)),
};
