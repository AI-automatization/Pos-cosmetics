# ─── RAOS Backup Container (T-084) ───────────────────────────────────────────
# pg_dump (PG18) + gpg + MinIO/S3 client (mc) + crond
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

RUN apk add --no-cache gnupg curl dcron && rm -rf /var/cache/apk/*

# MinIO/S3 client (Railway builds on amd64)
RUN curl -fsSL "https://dl.min.io/client/mc/release/linux-amd64/mc" -o /usr/local/bin/mc \
    && chmod +x /usr/local/bin/mc

# Backup/restore scripts (paths relative to repo root build context)
COPY scripts/backup.sh /usr/local/bin/backup.sh
COPY scripts/restore.sh /usr/local/bin/restore.sh
RUN chmod +x /usr/local/bin/backup.sh /usr/local/bin/restore.sh

# Cron: daily 02:00 UTC (07:00 Asia/Tashkent)
RUN echo "0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1" | crontab -

# Run one backup on startup (verifies config on every deploy), then cron.
# `|| true` so a transient first-run failure doesn't crash-loop the service.
CMD ["sh", "-c", "/usr/local/bin/backup.sh || true; exec crond -f -d 8"]
