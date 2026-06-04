export interface DiagnosticRule {
  pattern: string;
  title_ru: string;
  cause_ru: string;
  fix_ru: string;
}

export const DIAGNOSTIC_RULES: DiagnosticRule[] = [
  {
    pattern: 'NXDOMAIN',
    title_ru: 'DNS запись не найдена',
    cause_ru: 'CNAME запись отсутствует или удалена в Cloudflare DNS',
    fix_ru: '1. Cloudflare Dashboard → DNS → Records\n2. Проверь наличие CNAME для нужного поддомена\n3. Target должен быть *.up.railway.app\n4. Proxy status = DNS only (серая иконка)',
  },
  {
    pattern: 'TIMEOUT',
    title_ru: 'Таймаут соединения',
    cause_ru: 'Сервис не отвечает — возможно крашнулся или Railway перезапускает',
    fix_ru: '1. railway service link <name> && railway logs --lines 50\n2. Ищи: OOM, MODULE_NOT_FOUND, ENOENT\n3. Если OOM: NODE_OPTIONS=--max-old-space-size=512\n4. Redeploy: git commit --allow-empty -m "chore: trigger redeploy" && git push origin main',
  },
  {
    pattern: '502',
    title_ru: 'Bad Gateway (502)',
    cause_ru: 'Railway прокси не может подключиться к контейнеру — приложение крашится при старте',
    fix_ru: '1. railway logs --lines 100 — ищи ошибку при старте\n2. Проверь PORT — Railway инжектирует свой\n3. Проверь healthcheck path в railway.toml\n4. Если Prisma: npx prisma migrate deploy',
  },
  {
    pattern: '503',
    title_ru: 'Service Unavailable (503)',
    cause_ru: 'Сервис временно недоступен — идёт деплой или healthcheck не проходит',
    fix_ru: '1. Подожди 2-3 мин — может идти деплой\n2. railway service status — проверь статус\n3. Если FAILED: railway logs для диагностики',
  },
  {
    pattern: '500',
    title_ru: 'Internal Server Error (500)',
    cause_ru: 'Ошибка в коде приложения',
    fix_ru: '1. Проверь logs/errors-*.log на сервере\n2. railway logs --lines 200 | grep ERROR\n3. Скорее всего проблема в новом коде — проверь последний коммит',
  },
  {
    pattern: 'SSL',
    title_ru: 'Ошибка SSL сертификата',
    cause_ru: 'Railway не смог выпустить SSL — CNAME неправильный или DNS ещё не пропагирован',
    fix_ru: '1. nslookup <domain> — проверь что указывает на Railway\n2. CNAME target должен совпадать с railway domain\n3. Proxy status в Cloudflare = DNS only\n4. Подожди 15 мин для выпуска сертификата',
  },
  {
    pattern: 'ECONNREFUSED',
    title_ru: 'Соединение отклонено',
    cause_ru: 'Сервис не слушает на нужном порту',
    fix_ru: '1. Проверь что приложение слушает на PORT из env\n2. Railway всегда даёт свой PORT\n3. Не хардкодь порт в Dockerfile',
  },
  {
    pattern: 'DB',
    title_ru: 'Ошибка базы данных',
    cause_ru: 'PostgreSQL недоступен или миграции не применены',
    fix_ru: '1. Проверь DATABASE_URL в Railway env\n2. npx prisma migrate deploy\n3. Проверь что PostgreSQL сервис запущен в Railway',
  },
  {
    pattern: 'REDIS',
    title_ru: 'Ошибка Redis',
    cause_ru: 'Redis недоступен — кэш и очереди не работают',
    fix_ru: '1. Проверь REDIS_URL в Railway env\n2. Проверь что Redis сервис запущен\n3. Worker и Bot зависят от Redis',
  },
];
