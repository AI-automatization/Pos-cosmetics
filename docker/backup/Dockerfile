# ─── RAOS Backup Container (T-084) ───────────────────────────────────────────
# pg_dump + gpg + MinIO client (mc) + crond
FROM alpine:3.19

# PostgreSQL client (pg_dump), GPG, curl for Telegram
RUN apk add --no-cache \
    postgresql16-client \
    gnupg \
    curl \
    dcron \
    && rm -rf /var/cache/apk/*

# MinIO client
RUN wget -q "https://dl.min.io/client/mc/release/linux-amd64/mc" -O /usr/local/bin/mc \
    && chmod +x /usr/local/bin/mc

# Copy scripts
COPY ../../scripts/backup.sh /usr/local/bin/backup.sh
COPY ../../scripts/restore.sh /usr/local/bin/restore.sh
RUN chmod +x /usr/local/bin/backup.sh /usr/local/bin/restore.sh

# Cron: har kuni 02:00 UTC (Asia/Tashkent uchun 07:00)
RUN echo "0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1" \
    | crontab -

# Startup: run cron in foreground
CMD ["crond", "-f", "-d", "8"]
