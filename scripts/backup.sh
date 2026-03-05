#!/bin/sh
# ─── RAOS Database Backup Script (T-084) ─────────────────────────────────────
# Kunlik pg_dump → GPG encrypt → MinIO upload
# Environment vars (docker-compose dan keladi):
#   DATABASE_URL   — postgresql://user:pass@host:port/dbname
#   MINIO_ENDPOINT — e.g. http://minio:9000
#   MINIO_ACCESS   — MinIO access key
#   MINIO_SECRET   — MinIO secret key
#   MINIO_BUCKET   — e.g. raos-backups
#   GPG_PASSPHRASE — encryption password
#   TELEGRAM_BOT_TOKEN — (optional) notification
#   TELEGRAM_CHAT_ID   — (optional) notification
#   RETENTION_DAYS     — default 30

set -e

# ─── Config ──────────────────────────────────────────────────────────────────
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
DATE=$(date -u +"%Y/%m/%d")
BACKUP_NAME="raos-backup-${TIMESTAMP}.sql.gz.gpg"
TMP_DIR="/tmp/raos-backup"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

mkdir -p "${TMP_DIR}"
BACKUP_FILE="${TMP_DIR}/${BACKUP_NAME}"

# ─── Notify helper ────────────────────────────────────────────────────────────
notify() {
  if [ -n "${TELEGRAM_BOT_TOKEN}" ] && [ -n "${TELEGRAM_CHAT_ID}" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_CHAT_ID}" \
      -d "text=${1}" \
      -d "parse_mode=Markdown" \
      > /dev/null 2>&1 || true
  fi
}

echo "[$(date -u)] Starting RAOS backup: ${BACKUP_NAME}"
notify "🟡 *RAOS Backup* started: \`${TIMESTAMP}\`"

# ─── 1. pg_dump ────────────────────────────────────────────────────────────────
echo "[$(date -u)] Dumping database..."
pg_dump "${DATABASE_URL}" \
  --no-owner \
  --no-acl \
  --format=plain \
  --compress=6 \
  | gpg \
      --batch \
      --yes \
      --symmetric \
      --cipher-algo AES256 \
      --passphrase "${GPG_PASSPHRASE}" \
      --output "${BACKUP_FILE}"

BACKUP_SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
echo "[$(date -u)] Backup created: ${BACKUP_FILE} (${BACKUP_SIZE})"

# ─── 2. Upload to MinIO ────────────────────────────────────────────────────────
echo "[$(date -u)] Uploading to MinIO..."
mc alias set raos "${MINIO_ENDPOINT}" "${MINIO_ACCESS}" "${MINIO_SECRET}" --quiet

# Create bucket if not exists
mc mb "raos/${MINIO_BUCKET}" --quiet --ignore-existing || true

# Upload with date prefix for organization
mc cp "${BACKUP_FILE}" "raos/${MINIO_BUCKET}/${DATE}/${BACKUP_NAME}" --quiet

echo "[$(date -u)] Uploaded: ${MINIO_BUCKET}/${DATE}/${BACKUP_NAME}"

# ─── 3. Retention — delete old backups ────────────────────────────────────────
echo "[$(date -u)] Cleaning up backups older than ${RETENTION_DAYS} days..."
CUTOFF_DATE=$(date -u -d "${RETENTION_DAYS} days ago" +"%Y/%m/%d" 2>/dev/null || \
              date -u -v-${RETENTION_DAYS}d +"%Y/%m/%d" 2>/dev/null || echo "")

if [ -n "${CUTOFF_DATE}" ]; then
  # List all date prefixes and delete those before cutoff
  mc ls "raos/${MINIO_BUCKET}/" --quiet 2>/dev/null | while read -r line; do
    PREFIX=$(echo "${line}" | awk '{print $NF}' | tr -d '/')
    if [ "${PREFIX}" \< "${CUTOFF_DATE//\//-}" ] 2>/dev/null; then
      mc rm --recursive --force "raos/${MINIO_BUCKET}/${PREFIX}/" --quiet || true
      echo "[$(date -u)] Deleted old backup dir: ${PREFIX}"
    fi
  done
fi

# ─── 4. Cleanup temp files ────────────────────────────────────────────────────
rm -f "${BACKUP_FILE}"
rmdir "${TMP_DIR}" 2>/dev/null || true

echo "[$(date -u)] Backup complete."
notify "✅ *RAOS Backup* success: \`${TIMESTAMP}\` (${BACKUP_SIZE})"
