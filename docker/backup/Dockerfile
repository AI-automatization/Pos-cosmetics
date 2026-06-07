# ─── RAOS Backup Container (T-084) ───────────────────────────────────────────
# pg_dump (PG18) + gpg + MinIO/S3 client (mc). Self-scheduled (see CMD below).
#
# Base = postgres:18-alpine so pg_dump matches prod Postgres 18. The previous
# alpine:3.19 + postgresql16-client failed against prod with
# "pg_dump: error: aborting because of server version mismatch (server 18 / client 16)".
#
# Build context MUST be the repo root (Railway: rootDirectory = "."),
# so script COPY paths are repo-relative (the old `COPY ../../scripts/…` was
# invalid — Docker cannot COPY from outside the build context).
FROM postgres:18-alpine

# Bypass the postgres entrypoint (we run a backup scheduler, not a DB server)
ENTRYPOINT []

RUN apk add --no-cache gnupg curl && rm -rf /var/cache/apk/*

# MinIO/S3 client (Railway builds on amd64)
RUN curl -fsSL "https://dl.min.io/client/mc/release/linux-amd64/mc" -o /usr/local/bin/mc \
    && chmod +x /usr/local/bin/mc

# Backup/restore scripts + self-contained scheduler (paths relative to repo root build context)
COPY scripts/backup.sh /usr/local/bin/backup.sh
COPY scripts/restore.sh /usr/local/bin/restore.sh
COPY scripts/backup-scheduler.sh /usr/local/bin/backup-scheduler.sh
# Strip CRLF (Windows line endings) — a `#!/bin/sh\r` shebang makes the kernel
# look for interpreter "/bin/sh\r" → "backup.sh: not found" at runtime. Same
# defensive fix as apps/api start.sh.
RUN sed -i 's/\r$//' /usr/local/bin/backup.sh /usr/local/bin/restore.sh /usr/local/bin/backup-scheduler.sh \
    && chmod +x /usr/local/bin/backup.sh /usr/local/bin/restore.sh /usr/local/bin/backup-scheduler.sh

# Scheduling is IN-CONTAINER (scripts/backup-scheduler.sh), NOT Railway-native cron.
# Railway cron never armed for this service — the cronSchedule field said "0 2 * * *"
# but every deployment had meta.cronSchedule = null and no backup ever ran. busybox
# crond is also unusable here: as PID 1 it hits "setpgid: Operation not permitted" and
# crash-loops. So a dependency-free sh loop is PID 1: it runs one backup immediately on
# start, then one per day at 02:00 UTC, and survives a failed run.
#
# IMPORTANT: this service MUST be a normal always-on Railway service (numReplicas=1,
# NO cronSchedule). A cronSchedule makes Railway use run-once/scale-to-0 semantics and
# would kill the scheduler loop between "runs".
CMD ["/usr/local/bin/backup-scheduler.sh"]
