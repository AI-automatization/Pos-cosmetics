#!/bin/sh
# ─── RAOS Backup Scheduler (in-container, replaces Railway cron) ──────────────
# Why this exists: Railway-native cron never armed the scheduler for this service
# (the service's cronSchedule field was "0 2 * * *", but every deployment had
# meta.cronSchedule = null and no run ever fired — backups silently never ran).
# busybox `crond` is not an option either: as PID 1 it calls setpgid() on the
# session leader → "setpgid: Operation not permitted" → crond exits → crash-loop.
#
# So we schedule ourselves: a dependency-free sh loop that is PID 1, runs one
# backup immediately on start (so a fresh dump exists right after deploy), then
# one backup per day at 02:00 UTC (07:00 Asia/Tashkent). A failed backup is
# logged and the loop continues — one bad run never stops the scheduler.
#
# Requirements for this to keep running: the Railway service must be a normal
# always-on service (numReplicas=1, NO cronSchedule). With a cronSchedule set,
# Railway uses run-once/scale-to-0 semantics and would kill this loop.
set -u

TARGET_SECS=7200   # 02:00 UTC expressed as seconds since 00:00 UTC

run_backup() {
  echo "[scheduler] $(date -u) running backup.sh"
  /usr/local/bin/backup.sh || echo "[scheduler] backup.sh exited non-zero — continuing; next run still scheduled"
}

echo "[scheduler] $(date -u) started — immediate backup, then daily at 02:00 UTC"
run_backup

while true; do
  now=$(date -u +%s)
  secs_today=$(( now % 86400 ))
  if [ "$secs_today" -lt "$TARGET_SECS" ]; then
    wait=$(( TARGET_SECS - secs_today ))
  else
    wait=$(( 86400 - secs_today + TARGET_SECS ))
  fi
  echo "[scheduler] $(date -u) sleeping ${wait}s until next 02:00 UTC run"
  sleep "$wait"
  run_backup
done
