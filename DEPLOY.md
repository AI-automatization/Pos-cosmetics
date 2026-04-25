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
