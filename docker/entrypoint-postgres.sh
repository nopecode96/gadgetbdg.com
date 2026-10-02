#!/bin/sh
set -e

DATA_DIR="/var/lib/postgresql/data"
RUN_DIR="/run/postgresql"

mkdir -p "$DATA_DIR" "$RUN_DIR"
chown -R postgres:postgres "$DATA_DIR" "$RUN_DIR"
chmod 0700 "$DATA_DIR"
chmod 0775 "$RUN_DIR"

# Jika cluster belum di-initdb
if [ ! -s "$DATA_DIR/PG_VERSION" ]; then
    echo "==> Inisialisasi PostgreSQL Cluster..."
    su-exec postgres initdb -D "$DATA_DIR" --auth-local=trust --auth-host=md5
    echo "host all all 0.0.0.0/0 md5" >> "$DATA_DIR/pg_hba.conf"
    echo "listen_addresses='*'" >> "$DATA_DIR/postgresql.conf"
    
    su-exec postgres pg_ctl -D "$DATA_DIR" -w start
    su-exec postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"
    su-exec postgres createdb -U postgres -O postgres gadgetbdg || true
    su-exec postgres pg_ctl -D "$DATA_DIR" -m fast -w stop
fi

echo "==> Menjalankan PostgreSQL Server..."
exec su-exec postgres postgres -D "$DATA_DIR"
