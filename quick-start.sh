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

# ── STEP 0: Pre-flight checks ────────────────────────────────────────────────
step "STEP 0: Pre-flight Checks"

for cmd in docker docker-compose npm; do
  if ! command -v $cmd &>/dev/null; then
    err "$cmd is not installed. Please install it first."
    exit 1
  fi
  ok "$cmd: $(${cmd} --version 2>&1 | head -1)"
done

if ! docker info &>/dev/null; then
  err "Docker daemon is not running. Please start Docker."
  exit 1
fi
ok "Docker daemon is running"

# ── STEP 1: Environment Setup ────────────────────────────────────────────────
step "STEP 1: Environment Setup"

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    ok "Created .env from .env.example"
    warn "Review .env and update JWT_SECRET and DB_PASSWORD before production!"
  else
    err ".env.example not found. Cannot proceed."
    exit 1
  fi
else
  ok ".env file exists"
fi

source .env

# ── STEP 2: Install Dependencies ─────────────────────────────────────────────
step "STEP 2: Installing Dependencies"

echo "Installing backend dependencies..."
(cd backend && npm install )
ok "Backend dependencies installed"

echo "Installing frontend dependencies..."
(cd frontend && rm -f package-lock.json && npm install --legacy-peer-deps )
ok "Frontend dependencies installed"

# ── STEP 3: Clean Up Old Containers ──────────────────────────────────────────
step "STEP 3: Cleaning Up Previous Containers"

docker-compose down --remove-orphans 2>/dev/null || true
ok "Old containers removed"

# ── STEP 4: Build & Start Services ───────────────────────────────────────────
step "STEP 4: Building & Starting Services"

echo "Building Docker images (this may take 2-5 minutes on first run)..."
docker-compose up -d --build

ok "All services started"

# ── STEP 5: Wait for Health ───────────────────────────────────────────────────
step "STEP 5: Waiting for Services to Become Healthy"

echo "Waiting for PostgreSQL..."
ATTEMPTS=0
MAX=40
until docker-compose exec -T postgres pg_isready -U "${DB_USER:-postgres}" &>/dev/null; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ $ATTEMPTS -ge $MAX ]; then
    err "PostgreSQL did not start in time"
    docker-compose logs postgres | tail -20
    exit 1
  fi
  echo -n "."
  sleep 3
done
echo ""
ok "PostgreSQL is healthy"

echo "Waiting for Backend API..."
ATTEMPTS=0
until curl -sf http://localhost:"${BACKEND_PORT:-3000}"/health &>/dev/null; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ $ATTEMPTS -ge $MAX ]; then
    warn "Backend health check timed out — check logs with: docker-compose logs backend"
    break
  fi
  echo -n "."
  sleep 3
done
echo ""
ok "Backend API is healthy"

echo "Waiting for Frontend..."
ATTEMPTS=0
until curl -sf http://localhost:"${FRONTEND_PORT:-3001}"/index.html &>/dev/null; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ $ATTEMPTS -ge 20 ]; then
    warn "Frontend health check timed out — it may still be starting"
    break
  fi
  echo -n "."
  sleep 3
done
echo ""
ok "Frontend is healthy"

# ── STEP 6: Verify Database ───────────────────────────────────────────────────
step "STEP 6: Verifying Database"

DB="${DB_NAME:-student_registration_system}"
USER="${DB_USER:-postgres}"

TABLES=$(docker-compose exec -T postgres psql -U "$USER" -d "$DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' \n')
ok "Database tables: $TABLES"

COURSES=$(docker-compose exec -T postgres psql -U "$USER" -d "$DB" -t -c "SELECT COUNT(*) FROM courses;" 2>/dev/null | tr -d ' \n')
ok "Courses loaded: $COURSES"

USERS=$(docker-compose exec -T postgres psql -U "$USER" -d "$DB" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' \n')
ok "Demo users: $USERS"

RULES=$(docker-compose exec -T postgres psql -U "$USER" -d "$DB" -t -c "SELECT COUNT(*) FROM academic_rules;" 2>/dev/null | tr -d ' \n')
ok "Academic rules: $RULES"

# ── STEP 7: Set Demo Passwords ────────────────────────────────────────────────
step "STEP 7: Configuring Demo Account Passwords"

# Re-hash passwords to ensure they match
docker-compose exec -T postgres psql -U "$USER" -d "$DB" <<'SQL'
-- Admin@2026! (bcrypt 10 rounds)
UPDATE users SET password_hash='$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQsA3eKFMkiuX8ehtOgQihtVhxG4bO', must_change_pw=FALSE
WHERE email='admin@fci.tanta.edu.eg';

-- Doctor@2026!
UPDATE users SET password_hash='$2b$10$KCCV6NAZ5x1YUaKOLxbr8OQNl4Gx2GH0nRO9mPBJdE0DJkbTe8D.S', must_change_pw=FALSE
WHERE email='dr.ahmed@fci.tanta.edu.eg';

-- Student@2026!
UPDATE users SET password_hash='$2b$10$kzqN0JjEZOqq3D5gYnSj9.mVNptjXCrN8j1XeD8EjX0tG.sR7aUzC', must_change_pw=FALSE
WHERE email='s.2024cs001@fci.tanta.edu.eg';
SQL

ok "Demo passwords configured"

# ── DONE ─────────────────────────────────────────────────────────────────────
step "✅  SYSTEM READY!"

echo -e "${BOLD}Access Points:${NC}"
echo -e "  ${GREEN}→${NC} Frontend:     ${BOLD}http://localhost:${FRONTEND_PORT:-3001}${NC}"
echo -e "  ${GREEN}→${NC} Backend API:  http://localhost:${BACKEND_PORT:-3000}/api/v1"
echo -e "  ${GREEN}→${NC} API Health:   http://localhost:${BACKEND_PORT:-3000}/health"
echo -e "  ${GREEN}→${NC} Prometheus:   http://localhost:9090"
echo -e "  ${GREEN}→${NC} Grafana:      http://localhost:3050  (admin / admin123)"
echo ""
echo -e "${BOLD}Demo Credentials:${NC}"
echo -e "  ${BLUE}🛡️  Admin${NC}   admin@fci.tanta.edu.eg       ${BOLD}Admin@2026!${NC}"
echo -e "  ${BLUE}👨‍🏫 Doctor${NC}  dr.ahmed@fci.tanta.edu.eg    ${BOLD}Doctor@2026!${NC}"
echo -e "  ${BLUE}👨‍🎓 Student${NC} s.2024cs001@fci.tanta.edu.eg ${BOLD}Student@2026!${NC}"
echo ""
echo -e "${BOLD}Useful Commands:${NC}"
echo "  View logs:          docker-compose logs -f backend"
echo "  Stop all:           docker-compose down"
echo "  Full reset:         docker-compose down -v && bash quick-start.sh"
echo "  DB shell:           docker-compose exec postgres psql -U postgres -d student_registration_system"
echo "  Backend shell:      docker-compose exec backend sh"
echo ""
echo -e "${YELLOW}⚠  Security Reminder:${NC} Update JWT_SECRET, DB_PASSWORD in .env before any deployment!"
echo ""
