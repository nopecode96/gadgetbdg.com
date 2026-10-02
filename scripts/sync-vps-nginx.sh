#!/usr/bin/env bash
set -e

echo "==> Menyalin konfigurasi Nginx gadgetbdg ke LocallyTrip Nginx..."
cp docker/vps-nginx/gadgetbdg.conf /opt/locallytrip/nginx/conf.d/

echo "==> Menguji sintaks konfigurasi Nginx..."
docker exec locallytrip-nginx-prod nginx -t

echo "==> Memuat ulang (reload) Nginx locallytrip..."
docker exec locallytrip-nginx-prod nginx -s reload

echo "==> Selesai! Domain gadgetbdg.com & *.gadgetbdg.com sudah aktif terhubung ke port 8080."
