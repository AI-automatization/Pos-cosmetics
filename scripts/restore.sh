#!/bin/sh
# ─── RAOS Database Restore Script (T-084) ────────────────────────────────────
# MinIO dan backup yuklab olish → GPG decrypt → psql restore
# Usage: BACKUP_KEY="2026/03/01/raos-backup-2026-03-01T02-00-00Z.sql.gz.gpg" ./restore.sh

set -e

BACKUP_KEY="${1:-${BACKUP_KEY}}"

if [ -z "${BACKUP_KEY}" ]; then
  echo "Usage: $0 <backup-key>"
  echo "Example: $0 2026/03/01/raos-backup-2026-03-01T02-00-00Z.sql.gz.gpg"
  echo ""
  echo "List available backups:"
  echo "  mc ls raos/${MINIO_BUCKET}/"
  exit 1
fi

TMP_DIR="/tmp/raos-restore"
BACKUP_NAME=$(basename "${BACKUP_KEY}")
ENCRYPTED_FILE="${TMP_DIR}/${BACKUP_NAME}"
SQL_GZ_FILE="${TMP_DIR}/${BACKUP_NAME%.gpg}"

mkdir -p "${TMP_DIR}"

echo "[$(date -u)] Starting RAOS restore from: ${BACKUP_KEY}"
echo "[$(date -u)] ⚠️  WARNING: This will overwrite the database!"
echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
sleep 5

# ─── 1. Download from MinIO ────────────────────────────────────────────────────
echo "[$(date -u)] Downloading backup..."
mc alias set raos "${MINIO_ENDPOINT}" "${MINIO_ACCESS}" "${MINIO_SECRET}" --quiet
mc cp "raos/${MINIO_BUCKET}/${BACKUP_KEY}" "${ENCRYPTED_FILE}" --quiet

echo "[$(date -u)] Downloaded: ${BACKUP_NAME}"

# ─── 2. Decrypt ────────────────────────────────────────────────────────────────
echo "[$(date -u)] Decrypting..."
gpg \
  --batch \
  --yes \
  --passphrase "${GPG_PASSPHRASE}" \
  --output "${SQL_GZ_FILE}" \
  --decrypt "${ENCRYPTED_FILE}"

# ─── 3. Restore ────────────────────────────────────────────────────────────────
echo "[$(date -u)] Restoring database..."
gunzip -c "${SQL_GZ_FILE}" | psql "${DATABASE_URL}"

echo "[$(date -u)] Restore complete!"

# ─── 4. Cleanup ───────────────────────────────────────────────────────────────
rm -f "${ENCRYPTED_FILE}" "${SQL_GZ_FILE}"
rmdir "${TMP_DIR}" 2>/dev/null || true

echo "[$(date -u)] Done."
