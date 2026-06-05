# ─── RAOS Backup Container (T-084) ───────────────────────────────────────────
# pg_dump (PG18) + gpg + MinIO/S3 client (mc). Railway cron-triggered.
#
# Base = postgres:18-alpine so pg_dump matches prod Postgres 18. The previous
# alpine:3.19 + postgresql16-client failed against prod with
# "pg_dump: error: aborting because of server version mismatch (server 18 / client 16)".
#
# Build context MUST be the repo root (Railway: rootDirectory = "."),
# so script COPY paths are repo-relative (the old `COPY ../../scripts/…` was
# invalid — Docker cannot COPY from outside the build context).
FROM postgres:18-alpine

# Bypass the postgres entrypoint (we run cron, not a DB server)
ENTRYPOINT []

RUN apk add --no-cache gnupg curl && rm -rf /var/cache/apk/*

# MinIO/S3 client (Railway builds on amd64)
RUN curl -fsSL "https://dl.min.io/client/mc/release/linux-amd64/mc" -o /usr/local/bin/mc \
    && chmod +x /usr/local/bin/mc

# Backup/restore scripts (paths relative to repo root build context)
COPY scripts/backup.sh /usr/local/bin/backup.sh
COPY scripts/restore.sh /usr/local/bin/restore.sh
# Strip CRLF (Windows line endings) — a `#!/bin/sh\r` shebang makes the kernel
# look for interpreter "/bin/sh\r" → "backup.sh: not found" at runtime. Same
# defensive fix as apps/api start.sh.
RUN sed -i 's/\r$//' /usr/local/bin/backup.sh /usr/local/bin/restore.sh \
    && chmod +x /usr/local/bin/backup.sh /usr/local/bin/restore.sh

# Scheduling is Railway-native cron (service Settings → Cron Schedule = "0 2 * * *",
# 02:00 UTC / 07:00 Asia/Tashkent), NOT an in-container daemon. Railway starts this
# container on schedule; it runs ONE backup and exits 0.
#
# Why not crond: `exec crond` made crond PID 1, and busybox/dcron crond calls
# setpgid() on the session leader → "setpgid: Operation not permitted" → it exits
# → the container restarts → on ON_FAILURE it crash-looped (one pg_dump per restart)
# until restartPolicyMaxRetries, then died with no scheduler running at all.
# A run-once container + Railway cron removes that failure mode and the 24/7 idle replica.
CMD ["/usr/local/bin/backup.sh"]
