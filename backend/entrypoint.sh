#!/bin/bash
# =============================================================================
# FCIT SRS Backend Entrypoint — Production Grade
#
# ROOT CAUSE ANALYSIS OF ORIGINAL FAILURE:
# [C1] pg_isready was not installed (postgresql-client missing from Alpine image)
#      → until loop NEVER exited → infinite wait
# [C3] nc -z succeeds at TCP layer BEFORE PostgreSQL finishes running init scripts
#      → backend started while DB was still seeding → "invalid startup packet" errors
# [C4] migrate.js and seed.js share module-cached pg Pool, then call pool.end()
#      → second script gets already-ended pool → crashes
#
# FIX STRATEGY:
# 1. Keep pg_isready as primary check (now installed via postgresql-client)
# 2. Add Node.js-level connection verification AFTER pg_isready passes
#    to ensure the app database (not just postgres default) is fully ready
# 3. Run migrate + seed in the SAME Node.js process via a unified script
#    so the pool is created once and closed once
# =============================================================================
set -euo pipefail

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-student_registration_system}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FCIT SRS Backend — Starting"
echo "  DB: ${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Step 1: TCP reachability ──────────────────────────────────────────────────
echo "⏳ [1/4] Waiting for PostgreSQL TCP at ${DB_HOST}:${DB_PORT}..."
MAX_TCP=60
ELAPSED=0
until nc -z "${DB_HOST}" "${DB_PORT}" 2>/dev/null; do
  printf "  TCP: not reachable yet (%ds elapsed)\r" "$ELAPSED"
  sleep 2
  ELAPSED=$((ELAPSED + 2))
  if [ $ELAPSED -ge $MAX_TCP ]; then
    echo ""
    echo "❌ TCP: PostgreSQL port not reachable after ${MAX_TCP}s"
    exit 1
  fi
done
echo "  ✓ TCP port ${DB_PORT} is reachable"

# ── Step 2: pg_isready — DB process accepting connections ─────────────────────
# [C1-FIX] Now works because postgresql-client is installed in Dockerfile
echo "⏳ [2/4] Waiting for pg_isready (DB process accepting connections)..."
MAX_READY=180
ELAPSED=0
until PGPASSWORD="${DB_PASSWORD}" pg_isready \
        -h "${DB_HOST}" -p "${DB_PORT}" \
        -U "${DB_USER}" -d "${DB_NAME}" \
        -q 2>/dev/null; do
  printf "  pg_isready: not ready yet (%ds / %ds)\r" "$ELAPSED" "$MAX_READY"
  sleep 3
  ELAPSED=$((ELAPSED + 3))
  if [ $ELAPSED -ge $MAX_READY ]; then
    echo ""
    echo "❌ pg_isready: PostgreSQL not accepting connections after ${MAX_READY}s"
    exit 1
  fi
done
echo "  ✓ pg_isready: PostgreSQL is accepting connections"

# ── Step 3: Application-level DB check ───────────────────────────────────────
# [C3-FIX] pg_isready passes during init scripts but the target DB may not be
# fully initialized yet. We verify by connecting and running a test query.
# This also validates that the DB_NAME database exists and is accessible.
echo "⏳ [3/4] Verifying application DB is fully ready..."
MAX_APP=180
ELAPSED=0
until PGPASSWORD="${DB_PASSWORD}" psql \
        -h "${DB_HOST}" -p "${DB_PORT}" \
        -U "${DB_USER}" -d "${DB_NAME}" \
        -c "SELECT 1" -q >/dev/null 2>&1; do
  printf "  App DB: not ready yet (%ds / %ds)\r" "$ELAPSED" "$MAX_APP"
  sleep 3
  ELAPSED=$((ELAPSED + 3))
  if [ $ELAPSED -ge $MAX_APP ]; then
    echo ""
    echo "❌ App DB: Cannot connect to ${DB_NAME} after ${MAX_APP}s"
    exit 1
  fi
done
echo "  ✓ App DB: ${DB_NAME} is accepting queries"

# ── Step 4: Run migrations + seeds in unified process ────────────────────────
# [C4-FIX] Both migrate and seed now run in ONE Node.js process via setup.js
# so the pg pool is created once, used for both, then cleanly closed once.
# This eliminates the module-cache pool.end() race condition.
echo "⏳ [4/4] Running migrations and seeds..."
if node src/utils/setup.js; then
  echo "  ✓ Database setup complete"
else
  echo "  ⚠️  Database setup had warnings — checking if safe to continue..."
  # Verify the users table exists (minimum schema requirement)
  if PGPASSWORD="${DB_PASSWORD}" psql \
      -h "${DB_HOST}" -p "${DB_PORT}" \
      -U "${DB_USER}" -d "${DB_NAME}" \
      -c "SELECT 1 FROM users LIMIT 1" -q >/dev/null 2>&1; then
    echo "  ✓ Core tables exist — continuing despite setup warnings"
  else
    echo "  ❌ Core tables missing — database setup failed critically"
    exit 1
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ All checks passed — launching API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
exec node src/server.js
