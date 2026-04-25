# Branch Protection Rules — настрой в GitHub

Зайди: GitHub репо → Settings → Branches → Add rule

**Branch name pattern:** `main`

## Настройки:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Добавь: `✅ Lint & TypeCheck`
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

## Это означает:
- Напрямую push в `main` ЗАПРЕЩЁН
- Только через PR с зелёными проверками
- После merge → автодеплой на Railway

## RAILWAY_TOKEN настройка:
GitHub репо → Settings → Secrets and variables → Actions → New repository secret
- Name: `RAILWAY_TOKEN`
- Value: токен из Railway dashboard → Account Settings → Tokens
