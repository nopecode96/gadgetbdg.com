FROM node:20-alpine AS base

# Install OS dependencies: PostgreSQL, Nginx, Supervisor, su-exec, netcat-openbsd, openssl, libc6-compat, curl, bash
RUN apk update && apk add --no-cache \
    postgresql \
    postgresql-contrib \
    nginx \
    supervisor \
    su-exec \
    netcat-openbsd \
    openssl \
    libc6-compat \
    bash \
    curl

# Setup directories
RUN mkdir -p /var/lib/postgresql/data /run/postgresql /app /app/public/uploads /var/log /run \
    && chown -R postgres:postgres /var/lib/postgresql /run/postgresql

WORKDIR /app

# Copy dependency manifests and prisma schema
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies and generate prisma client for Alpine musl OpenSSL 3.0.x
RUN npm install
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Copy configurations and scripts
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint-postgres.sh /usr/local/bin/docker-entrypoint-postgres.sh
COPY docker/entrypoint-nextjs.sh /usr/local/bin/docker-entrypoint-nextjs.sh

RUN chmod +x /usr/local/bin/docker-entrypoint-postgres.sh /usr/local/bin/docker-entrypoint-nextjs.sh

# Expose HTTP and HTTPS
EXPOSE 80 443

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
