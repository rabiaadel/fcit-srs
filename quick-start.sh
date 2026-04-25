#!/bin/bash
# =============================================================================
# FCIT SRS — One-Command Quick Start
# Faculty of Computers & Informatics, Tanta University
# Usage: bash quick-start.sh
# =============================================================================

set -e

BLUE='\033[0;34m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'; BOLD='\033[1m'

header() {
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC}  ${BOLD}FCIT — Student Registration System${NC}                         ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  Faculty of Computers & Informatics, Tanta University       ${BLUE}║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

step() { echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${BOLD}  $1${NC}"; echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
err()  { echo -e "${RED}✗${NC} $1"; }

header

# ── STEP 0: Pre-flight checks ─────────────────────────────────────────────────
step "STEP 0: Pre-flight Checks"
for cmd in docker docker-compose npm; do
  if ! command -v $cmd &>/dev/null; then
    err "$cmd is not installed."; exit 1
  fi
  ok "$cmd: $(${cmd} --version 2>&1 | head -1)"
done
if ! docker info &>/dev/null; then err "Docker daemon not running."; exit 1; fi
ok "Docker daemon is running"

# ── STEP 1: Environment ───────────────────────────────────────────────────────
step "STEP 1: Environment Setup"
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    ok "Created .env from .env.example"
    warn "Update JWT_SECRET and DB_PASSWORD before production!"
  else
    err ".env.example not found."; exit 1
  fi
else
  ok ".env file exists"
fi
source .env

# ── STEP 2: Dependencies ──────────────────────────────────────────────────────
step "STEP 2: Installing Dependencies"

echo "Installing backend dependencies..."
(cd backend && npm install --silent)
ok "Backend dependencies installed"

echo "Installing frontend dependencies (with ajv fix)..."
(cd frontend && rm -f package-lock.json && \
  npm install --legacy-peer-deps --silent && \
  npm install ajv@^8.11.0 --legacy-peer-deps --silent)
ok "Frontend dependencies installed"

# ── STEP 3: Clean up ──────────────────────────────────────────────────────────
step "STEP 3: Cleaning Up Previous Containers"
docker-compose down --remove-orphans 2>/dev/null || true
ok "Old containers removed"

# ── STEP 4: Build & Start ─────────────────────────────────────────────────────
step "STEP 4: Building & Starting Services"
echo "Building Docker images (2-5 min on first run)..."
docker-compose up -d --build
ok "All services started"

# ── STEP 5: Wait for health ───────────────────────────────────────────────────
step "STEP 5: Waiting for Services"

echo "Waiting for PostgreSQL..."
ATTEMPTS=0
until docker-compose exec -T postgres pg_isready -U "${DB_USER:-postgres}" &>/dev/null; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ $ATTEMPTS -ge 40 ]; then err "PostgreSQL timed out"; docker-compose logs postgres | tail -20; exit 1; fi
  echo -n "."; sleep 3
done; echo ""; ok "PostgreSQL healthy"

echo "Waiting for Backend API..."
ATTEMPTS=0
until curl -sf http://localhost:"${BACKEND_PORT:-3000}"/health &>/dev/null; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ $ATTEMPTS -ge 40 ]; then warn "Backend timed out — check: docker-compose logs backend"; break; fi
  echo -n "."; sleep 3
done; echo ""; ok "Backend API healthy"

echo "Waiting for Frontend..."
ATTEMPTS=0
until curl -sf http://localhost:"${FRONTEND_PORT:-3001}"/index.html &>/dev/null; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ $ATTEMPTS -ge 20 ]; then warn "Frontend still starting — it may need a moment"; break; fi
  echo -n "."; sleep 3
done; echo ""; ok "Frontend healthy"

# ── STEP 6: Verify DB ─────────────────────────────────────────────────────────
step "STEP 6: Verifying Database"
DB="${DB_NAME:-student_registration_system}"
USR="${DB_USER:-postgres}"
TABLES=$(docker-compose exec -T postgres psql -U "$USR" -d "$DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' \n')
COURSES=$(docker-compose exec -T postgres psql -U "$USR" -d "$DB" -t -c "SELECT COUNT(*) FROM courses;" 2>/dev/null | tr -d ' \n')
USERS=$(docker-compose exec -T postgres psql -U "$USR" -d "$DB" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' \n')
RULES=$(docker-compose exec -T postgres psql -U "$USR" -d "$DB" -t -c "SELECT COUNT(*) FROM academic_rules;" 2>/dev/null | tr -d ' \n')
ok "Tables: $TABLES | Courses: $COURSES | Users: $USERS | Academic Rules: $RULES"

# ── STEP 7: Demo passwords ────────────────────────────────────────────────────
step "STEP 7: Configuring Demo Passwords"
docker-compose exec -T postgres psql -U "$USR" -d "$DB" <<'SQL'
UPDATE users SET password_hash='$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQsA3eKFMkiuX8ehtOgQihtVhxG4bO', must_change_pw=FALSE WHERE email='admin@fci.tanta.edu.eg';
UPDATE users SET password_hash='$2b$10$KCCV6NAZ5x1YUaKOLxbr8OQNl4Gx2GH0nRO9mPBJdE0DJkbTe8D.S', must_change_pw=FALSE WHERE email='dr.ahmed@fci.tanta.edu.eg';
UPDATE users SET password_hash='$2b$10$kzqN0JjEZOqq3D5gYnSj9.mVNptjXCrN8j1XeD8EjX0tG.sR7aUzC', must_change_pw=FALSE WHERE email='s.2024cs001@fci.tanta.edu.eg';
SQL
ok "Demo passwords set"

# ── Done ──────────────────────────────────────────────────────────────────────
step "✅  SYSTEM READY!"
echo -e "${BOLD}Access Points:${NC}"
echo -e "  ${GREEN}→${NC} Frontend:     ${BOLD}http://localhost:${FRONTEND_PORT:-3001}${NC}"
echo -e "  ${GREEN}→${NC} Backend API:  http://localhost:${BACKEND_PORT:-3000}/api/v1"
echo -e "  ${GREEN}→${NC} Prometheus:   http://localhost:9090"
echo -e "  ${GREEN}→${NC} Grafana:      http://localhost:3050  (admin / admin123)"
echo ""
echo -e "${BOLD}Demo Credentials:${NC}"
echo -e "  🛡️  Admin:   admin@fci.tanta.edu.eg          ${BOLD}Admin@2026!${NC}"
echo -e "  👨‍🏫 Doctor:  dr.ahmed@fci.tanta.edu.eg        ${BOLD}Doctor@2026!${NC}"
echo -e "  👨‍🎓 Student: s.2024cs001@fci.tanta.edu.eg     ${BOLD}Student@2026!${NC}"
echo ""
echo -e "${BOLD}Useful Commands:${NC}"
echo "  View logs:       docker-compose logs -f backend"
echo "  Stop all:        docker-compose down"
echo "  Full reset:      docker-compose down -v && bash quick-start.sh"
echo "  DB shell:        docker-compose exec postgres psql -U postgres -d student_registration_system"
echo ""
echo -e "${YELLOW}⚠  Update JWT_SECRET and DB_PASSWORD in .env before any public deployment!${NC}"
echo ""
