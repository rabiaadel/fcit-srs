#!/bin/bash
set -e

echo "⏳ Waiting for PostgreSQL..."
until nc -z "${DB_HOST:-postgres}" "${DB_PORT:-5432}"; do
  echo "  PostgreSQL is unavailable - sleeping 2s"
  sleep 2
done
echo "✅ PostgreSQL is up"

echo "🔄 Running migrations..."
node src/utils/migrate.js || echo "⚠️  Migration warning (may already be applied)"

echo "🌱 Running seeds..."
node src/utils/seed.js || echo "⚠️  Seed warning (may already be seeded)"

echo "🚀 Starting FCIT SRS Backend..."
exec node src/server.js
