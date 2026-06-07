# RAOS — Deploy Guide

## Автодеплой через GitHub PR

### Как работает:

1. Ибрат создаёт ветку и пушит:
   ```bash
   git checkout -b ibrat/feat-my-task
   git push origin ibrat/feat-my-task
   ```

2. GitHub показывает кнопку **"Compare & pull request"**

3. Ибрат нажимает → создаётся PR

4. CI автоматически запускает:
   - `pnpm lint` для API и Web
   - `tsc --noEmit` для API и Web

5. Если всё зелёное → появляется кнопка **"Merge pull request"**

6. После merge в `main` → Railway автоматически деплоит:
   - `raos-api` — NestJS Backend
   - `raos-web` — Next.js Admin Panel

---

## Первоначальная настройка

### 1. Railway Token
```
Railway dashboard → Account Settings → Tokens → Create token
GitHub репо → Settings → Secrets → Actions → New secret
  Name: RAILWAY_TOKEN
  Value: <токен из Railway>
```

### 2. Branch Protection (GitHub)
```
GitHub репо → Settings → Branches → Add rule
  Pattern: main
  ✅ Require pull request before merging
  ✅ Require status checks: "✅ Lint & TypeCheck"
  ✅ Do not allow bypassing
```

### 3. Railway сервисы
Убедись что в Railway проекте сервисы называются:
- `raos-api` — Backend API
- `raos-web` — Frontend Web

### 4. Переменные WEB-сервиса
- `NEXT_PUBLIC_API_URL` — URL backend API.
- `SESSION_SIGNING_SECRET` — секрет подписи/проверки `role_sig` cookie (#141), который
  гейтит `/finance`, `/settings`, `/realestate`. **Вручную задавать не нужно:**
  `apps/web/Dockerfile` генерирует его на этапе build и пекёт одновременно в middleware-бандл
  и в рантайм (одно значение). Edge-middleware инлайнит env на build, поэтому runtime-only
  переменная из дашборда middleware НЕ видна — секрет обязан существовать на build.
  - Ротируется при каждом деплое; старые cookie само-восстанавливаются на следующей загрузке
    (`useCurrentUser → syncSignedRole`).
  - Чтобы зафиксировать секрет между деплоями — задай **build-переменную**
    `SESSION_SIGNING_SECRET` в Railway (прокинется как Docker ARG), Dockerfile возьмёт её
    вместо генерации.

---

## Ручной деплой (если нужно)

**НЕ используй** `railway up` — только `git push origin main`:

```bash
# Правильно:
git push origin main   # → Railway автодеплой

# Неправильно (не делай):
railway up             # прямой деплой в обход CI
```

---

## Структура CI/CD файлов

```
.github/
  workflows/
    ci.yml                  — главный пайплайн
  pull_request_template.md  — шаблон PR
  branch-protection.md      — инструкция по настройке защиты

apps/api/railway.toml       — конфиг Railway для API
apps/web/railway.toml       — конфиг Railway для Web
```

---

## DNS — Cloudflare Records (raos.uz)

**Cloudflare аккаунт:** Yormatov3@gmail.com
**Zone ID:** df70fe80b67d60209fc0acbc16cb6704
**Nameservers:** paige.ns.cloudflare.com + zahir.ns.cloudflare.com
**Регистратор:** Ahost.uz (clients.ahost.uz, аккаунт yormatov3@gmail.com)

| Type | Name | Target | Proxy | Сервис |
|------|------|--------|-------|--------|
| CNAME | `@` (raos.uz) | `landing-production-67f9.up.railway.app` | DNS only | Landing |
| CNAME | `www` | `landing-production-67f9.up.railway.app` | DNS only | Landing |
| CNAME | `api` | `p5cwgnj2.up.railway.app` | DNS only | Backend API |
| CNAME | `app` | `web-production-5b0b7.up.railway.app` | DNS only | Admin Panel |

### Правила:
1. **Railway домены = DNS only (серая иконка).** Proxied (оранжевая) ломает Railway SSL.
2. При удалении/пересоздании Railway сервиса — домен меняется! Обнови CNAME.
3. Проверка: `nslookup app.raos.uz` должен вернуть Railway target.
4. Если видишь `DNS_PROBE_FINISHED_NXDOMAIN` — CNAME удалена/пропала в Cloudflare.

### ⚠️ Критичные уроки (2026-06-04):
- **Nameservers:** Ahost → paige/zahir (Yormatov3 аккаунт). НЕ МЕНЯТЬ без согласования.
- **Cloudflare аккаунт:** Только Yormatov3@gmail.com управляет DNS. Старый аккаунт (savanna/salvador) больше не используется.
- **CNAME target:** Всегда проверяй `railway domain` перед записью в Cloudflare. Railway может выдать новый hostname при пересоздании сервиса.

---

## Uptime Monitoring

Настрой бесплатный мониторинг (UptimeRobot / Better Uptime):

| URL | Интервал | Алерт |
|-----|----------|-------|
| `https://api.raos.uz/api/v1/health/ping` | 5 мин | Telegram @raos_alerts |
| `https://app.raos.uz/api/health` | 5 мин | Telegram @raos_alerts |
| `https://raos.uz` | 5 мин | Telegram @raos_alerts |

Если сайт упал — Telegram уведомление приходит за 5 минут, а не когда клиент позвонит.

---

## Railway Service IDs (production)

| Сервис | ID | Домен |
|--------|----|-------|
| api | e00dc192-918f-4c80-a2bc-5c17f8a31884 | api.raos.uz |
| web | 4ff3300a-76e3-491f-bf08-22ccfa0321ef | app.raos.uz |
| super-admin | 5024f43b-7036-4a31-ba3a-a1b63a60efed | super-admin-production-*.up.railway.app |
| worker | 135eeefd-024d-4af1-90aa-d9d644f451d2 | — |
| bot | 63a3e7d4-f05d-40c3-95e7-b408a2577006 | — |

**Project:** c984191a-3115-4574-968d-ae3aff3e4e80
**Environment:** d8f93b58-2d7d-45e4-8b42-8b9d24d8fbcb

### Railway CLI quick commands:
```bash
railway service link web && railway logs --lines 50   # web логи
railway service link api && railway logs --lines 50   # api логи
railway domain                                         # проверить домены
railway service status                                 # статус деплоя
```

---

## Troubleshooting

**CI не запускается:**
- Проверь `.github/workflows/ci.yml` синтаксис на [yaml lint](https://www.yamllint.com/)

**Deploy падает с "RAILWAY_TOKEN not found":**
- Добавь секрет в GitHub Settings → Secrets → Actions

**TypeCheck падает:**
```bash
cd apps/web && npx tsc --noEmit
cd apps/api && npx tsc --noEmit
```
Исправь все ошибки перед merge.

**DNS_PROBE_FINISHED_NXDOMAIN (сайт не открывается):**
1. Проверь DNS: `nslookup app.raos.uz` — должен вернуть Railway target
2. Если NXDOMAIN → зайди в Cloudflare → DNS Records → добавь CNAME (см. таблицу выше)
3. Proxy status = **DNS only** (серая иконка), НЕ Proxied
4. Подожди 1-5 мин → проверь: `curl -I https://app.raos.uz/api/health`

**Railway сервис крашится (502/503):**
1. `railway service link web && railway logs --lines 100`
2. Ищи: MODULE_NOT_FOUND, OOM, ENOENT
3. Если OOM → добавь в Railway env: `NODE_OPTIONS=--max-old-space-size=512`
4. Redeploy: `git commit --allow-empty -m "chore: trigger redeploy" && git push origin main`

**Railway домен поменялся после пересоздания сервиса:**
1. `railway domain` — посмотри новый Railway-generated домен
2. Обнови CNAME в Cloudflare → новый target
3. Обнови эту таблицу в DEPLOY.md
