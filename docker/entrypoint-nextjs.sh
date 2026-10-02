#!/bin/sh
set -e

echo "==> Menunggu PostgreSQL siap di port 5432..."
TRIES=0
while ! nc -z 127.0.0.1 5432; do
  sleep 1
  TRIES=$((TRIES+1))
  if [ $TRIES -ge 30 ]; then
    echo "Peringatan: Timeout menunggu Postgres, melanjutkan..."
    break
  fi
done
echo "==> Port PostgreSQL 5432 terdeteksi aktif."

cd /app

# Push skema database
npx prisma db push --skip-generate || true

# Jalankan ensure-demo.js untuk menjamin toko demo selalu siap
echo "==> Memastikan data demo toko berkahcell & gamersgadget tersedia..."
node ./prisma/ensure-demo.js || true

echo "==> Memulai Next.js di internal port 3001..."
exec npm run start -- -p 3001
