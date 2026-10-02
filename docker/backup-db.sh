#!/bin/sh
set -e

# ==============================================================
# Script Otomasi Backup Database PostgreSQL GadgetBdg
# ==============================================================

BACKUP_DIR="${BACKUP_DIR:-/app/data/backups}"
mkdir -p "$BACKUP_DIR"

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-gadgetbdg}"
POSTGRES_HOST="${POSTGRES_HOST:-127.0.0.1}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${POSTGRES_DB}_${TIMESTAMP}.sql.gz"

echo "=========================================================="
echo "📦 Memulai backup database PostgreSQL [${POSTGRES_DB}]..."
echo "⏰ Waktu: $(date)"
echo "📂 Lokasi file: ${BACKUP_FILE}"
echo "=========================================================="

# Eksekusi pg_dump terkompresi gzip
pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_FILE"

# Verifikasi ukuran file
BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
echo "✅ Backup database berhasil diselesaikan! (Ukuran: ${BACKUP_SIZE})"

# ==============================================================
# Logika Rotasi: Hapus backup yang lebih lama dari 7 hari
# ==============================================================
echo "🧹 Membersihkan file backup yang berusia lebih dari 7 hari..."
find "$BACKUP_DIR" -type f -name "backup_*.sql.gz" -mtime +7 -exec rm -f {} \; -print
echo "🎉 Rotasi backup selesai. Ruang disk VPS tetap aman!"
