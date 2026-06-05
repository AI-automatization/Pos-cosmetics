# SECURITY INCIDENT: Railway DB Password Leaked to GitHub

## Date: 2026-06-05
## Severity: CRITICAL
## Status: RESOLVED — password rotated 2026-06-05

---

## What happened

Railway PostgreSQL connection string (including password) was committed to GitHub in 5 files:
- `docs/clean_and_seed.js`
- `docs/db_survey.js`
- `docs/query_users.js`
- `docs/reset_password.js`
- `scripts/backup-db.js`

Commits: `e231e24` (2026-05-12), `a045c90` (2026-05-12)

## What was fixed

All 5 files now use `process.env.DATABASE_URL` with fail-fast if missing.
Commit: `d74f2cc` (2026-06-05)

## What MUST be done (manual steps)

### 1. Rotate Railway DB password — DONE (2026-06-05)

Password rotated via Railway CLI:
```
railway service Postgres
railway variables --set "PGPASSWORD=<new-password>"
```
Railway auto-propagated new DATABASE_URL to all linked services (api, worker).
API + Worker redeployed. Health check: api.raos.uz → HTTP 200.

### 2. Verify no unauthorized access

1. Railway Dashboard > PostgreSQL > Metrics > check for unusual queries
2. Check `audit_logs` table for suspicious activity
3. Review recent `sessions` table entries

### 3. Consider BFG Repo Cleaner (optional)

The password remains in git history. To fully purge:
```bash
# Only if team agrees — rewrites ALL history
bfg --replace-text passwords.txt Pos-cosmetics.git
git push --force
```

This is OPTIONAL since the password will be rotated anyway.

---

## Prevention

- All scripts now require `DATABASE_URL` env var
- Pre-commit hook should scan for connection strings (TODO)
- Never hardcode credentials — always use env vars
