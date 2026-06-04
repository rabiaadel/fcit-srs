# UniSmart — FCIT Student Registration System
## Faculty of Computers & Informatics · Tanta University · 2024 Bylaws

<div align="center">

![Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20PostgreSQL%20%7C%20React%20%7C%20Docker-blue)
![Bylaws](https://img.shields.io/badge/bylaws-52%20rules%20enforced-green)
![Tests](https://img.shields.io/badge/test%20cases-215-orange)
![Language](https://img.shields.io/badge/language-Arabic%20RTL-informational)

**Production-grade academic management platform enforcing all 52 rules of the FCIT 2024 Faculty Regulations.**  
Built with Node.js 20 · PostgreSQL 16 · React 18 · Docker Compose · Prometheus · Grafana

</div>

---

## Table of Contents

1. [What This System Does](#1-what-this-system-does)
2. [Quick Start](#2-quick-start)
3. [Architecture](#3-architecture)
4. [Access Points & Demo Credentials](#4-access-points--demo-credentials)
5. [User Roles & Complete Workflows](#5-user-roles--complete-workflows)
6. [Bylaw Enforcement Reference](#6-bylaw-enforcement-reference)
7. [API Reference](#7-api-reference)
8. [Database Schema](#8-database-schema)
9. [Frontend Design System](#9-frontend-design-system)
10. [Security Model](#10-security-model)
11. [Monitoring & Observability](#11-monitoring--observability)
12. [Development Guide](#12-development-guide)
13. [Testing](#13-testing)
14. [Deployment](#14-deployment)
15. [Troubleshooting](#15-troubleshooting)
16. [Changelog](#16-changelog)

---

## 1. What This System Does

UniSmart is a complete Student Registration System for the Faculty of Computers and Informatics at Tanta University. It replaces manual paper-based registration with a digital platform that **automatically enforces the 2024 Faculty Bylaws** at every step.

### Core Capabilities

| Capability | Details |
|---|---|
| **Student Registration** | Self-service course enrollment during open registration windows |
| **Bylaw Enforcement** | 52 rules enforced server-side — credit limits, prerequisites, attendance, grading |
| **Grade Management** | Doctor-entered grades with automatic letter grade + GPA calculation |
| **Attendance Tracking** | Per-session attendance recording; automatic barring at 42% absence (Art. 14) |
| **GPA & Warnings** | Semester finalization triggers GPA computation, warnings, dismissals |
| **Graduation Check** | Real-time eligibility with honors calculation (Art. 27) |
| **Notifications** | Role-targeted push notifications for every academic event |
| **Admin Control** | Full user lifecycle, course catalog, semester management, academic reports |
| **Monitoring** | Prometheus metrics + Grafana dashboards for ops visibility |

### Bylaw Rules Enforced (52 total — FCIT 2024)

Every bylaw rule is enforced at the **API layer** (not just UI) — impossible to bypass even with direct API calls.

---

## 2. Quick Start

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Docker | ≥ 24.0 | Container runtime |
| Docker Compose | ≥ 2.20 | Service orchestration |
| Node.js | ≥ 20.0 | Local development only |

### Production Start (Recommended)

```bash
git clone <repo-url>
cd fcit-srs

# Copy environment template
cp .env.example .env
# Edit .env — set strong JWT secrets for production

# Start all services
docker compose up -d --build

# Watch startup
docker compose logs -f
```

**Access the app:** `http://localhost:3002`

### Development Start (Hot-reload)

```bash
# Terminal 1 — Database + Monitoring
docker compose up -d postgres prometheus grafana

# Terminal 2 — Backend (hot-reload)
cd backend && npm install && npm run dev

# Terminal 3 — Frontend (hot-reload)
cd frontend && npm install && npm start
```

### Verify Everything Works

```bash
# Health check all services
curl http://localhost:3000/health          # Backend API
curl http://localhost:3002                 # Frontend (HTML)
curl http://localhost:9090/-/healthy       # Prometheus
curl http://localhost:3050/api/health      # Grafana

# Database seed verification
docker exec -it fcit-srs-postgres psql -U fcit_user -d fcit_srs \
  -c "SELECT role, count(*) FROM users GROUP BY role;"
```

Expected output:
```
 role    | count
---------+-------
 admin   |     1
 doctor  |     3
 student |     5
```

---

## 3. Architecture

```
┌─────────────────── Docker Compose Network: fcit-srs-network ───────────────────┐
│                                                                                  │
│  Browser (RTL Arabic)                                                            │
│      │ :3002                                                                     │
│      ▼                                                                           │
│  ┌─────────────────────┐                                                         │
│  │   Nginx (frontend)  │  Serves React SPA + proxies /api/v1 → backend:3000    │
│  │   nginx:1.25-alpine │  try_files for SPA routing                             │
│  └─────────┬───────────┘                                                         │
│            │ /api/v1/*                                                           │
│            ▼                                                                     │
│  ┌─────────────────────┐     ┌──────────────────────┐                           │
│  │  Express.js API     │────▶│  PostgreSQL 16        │                           │
│  │  Node.js 20-alpine  │     │  · 20+ tables         │                           │
│  │  :3000              │     │  · 6 views            │                           │
│  │                     │     │  · 5 functions        │                           │
│  │  Middleware chain:  │     │  · 8 triggers         │                           │
│  │  helmet → cors →    │     │  · ACID transactions  │                           │
│  │  rate-limit →       │     │  · Row-level locking  │                           │
│  │  authenticate →     │     └──────────────────────┘                           │
│  │  requireRole →      │                                                         │
│  │  bylaw-validate     │     ┌──────────────────────┐                           │
│  └─────────┬───────────┘     │  Prometheus :9090     │                           │
│            │ /metrics        │  Scrapes every 15s    │                           │
│            └────────────────▶│                       │                           │
│                              │  → Grafana :3050      │                           │
│                              └──────────────────────┘                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Service Startup Order

```
postgres (healthcheck: pg_isready) 
    ↓ healthy
backend (depends_on postgres: healthy)
    ↓ running
frontend (depends_on backend: started)
prometheus (scrapes backend:3000/metrics)
grafana (reads prometheus datasource)
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Single `App.jsx` (1,600 lines) | Minimal build complexity; zero bundler config; fast iteration |
| `SELECT FOR UPDATE` on enrollment | Prevents race condition when multiple students compete for last seat |
| Bylaw rules in service layer (not DB) | Testable, readable, easy to update when bylaws change |
| `D()` unwrapper in frontend | Handles both `res.data` and `res.data.data` response shapes |
| JWT rotation on refresh | Old refresh token immediately revoked; prevents token reuse attacks |

---

## 4. Access Points & Demo Credentials

### Service URLs

| Service | URL | Purpose |
|---|---|---|
| **Frontend** | http://localhost:3002 | Main application (Arabic RTL) |
| **Backend API** | http://localhost:3000/api/v1 | REST API |
| **API Health** | http://localhost:3000/health | Service health check |
| **Prometheus** | http://localhost:9090 | Metrics explorer |
| **Grafana** | http://localhost:3050 | Dashboards (admin / admin123) |

### Demo Accounts

| Role | Email | Password | Notes |
|---|---|---|---|
| 🔑 Admin | admin@fci.tanta.edu.eg | Admin@2026! | Full system access |
| 👨‍🏫 Doctor | dr.ahmed@fci.tanta.edu.eg | Doctor@2026! | CS department |
| 👨‍🎓 Student | s.2024cs001@fci.tanta.edu.eg | Student@2026! | CS · Level 2 · CGPA 2.8 |

> **Note:** All demo users have `mustChangePw = false` so you can log in directly.

---

## 5. User Roles & Complete Workflows

### 5.1 Admin Workflow

```
Login → /admin (Dashboard)
  ├── /admin/students          View all students; search/filter; view full detail
  │   └── /admin/students/:id  GPA history chart, warnings, transcript, enrollment override
  ├── /admin/users             Create admin/doctor/student accounts
  ├── /admin/courses           Manage course catalog; filter by level; add courses
  ├── /admin/semesters         Full lifecycle management:
  │   ├── Create semester (auto-calculates add/drop and withdrawal deadlines)
  │   ├── Change status: upcoming → registration → active → grading → closed
  │   └── 🏁 Finalize Semester: GPA calc + warnings + dismissals + Abs grades
  ├── /admin/registration      Quick toggle to open/close registration window
  ├── /admin/reports           GPA distribution, top students, dismissed students
  ├── /admin/announcements     Publish role-targeted announcements
  └── /admin/notifications     System notifications for admin
```

**Critical Admin Action — Finalize Semester:**
1. Set semester status to `grading`
2. Wait for all doctors to enter grades
3. Click "🏁 إنهاء الفصل" — this triggers:
   - Assigns `Abs` grade to students with attendance < 42%
   - Computes semester GPA and cumulative CGPA for all students
   - Issues academic warnings (Art. 25) for CGPA < 2.0 (except first semester)
   - Resets consecutive warnings if CGPA recovered
   - Triggers dismissal if 4+ consecutive or 6+ total warnings (Art. 26)
   - Updates student levels based on credits earned (Art. 10)
   - Sends notifications to all affected students

### 5.2 Doctor Workflow

```
Login → /doctor (Dashboard)
  └── /doctor/courses          List of assigned course offerings
      └── /doctor/courses/:offeringId  Course roster:
          ├── Grades tab:  Enter per-component grades (midterm/coursework/practical/final)
          └── Attendance tab:
              ├── View session history with attendance %
              ├── "+ تسجيل جلسة حضور" → date/type → per-student toggle → save
              └── Red "خطر الحرمان" badge at < 42% per-student
```

**Grade Components (Art. 16):**
| Component | Max Marks | Min to Pass |
|---|---|---|
| Midterm | 20 | — |
| Coursework | 10 | — |
| Practical | 10 | — |
| Final Exam | 60 | 18 (30% of 60) |
| **Total** | **100** | **40 (40%)** |

### 5.3 Student Workflow

```
Login → /student (Dashboard: CGPA, credits, level, warnings)
  ├── /student/courses          Course registration:
  │   ├── Left panel: Available courses with canRegister status
  │   ├── Right panel: Selected courses with total credits
  │   └── Bottom: Graduation progress bar + checklist
  ├── /student/schedule         Current schedule with attendance % per course
  ├── /student/transcript       Full academic history grouped by semester
  ├── /student/graduation       Eligibility checklist + honors calculation
  └── /student/notifications    All academic notifications
```

---

## 6. Bylaw Enforcement Reference

### Art. 4 — Graduation Requirements
- **132 credit hours** minimum (non-training courses)
- **CGPA ≥ 2.0** required
- **Maximum 8 regular semesters** (then dismissal)

### Art. 10 — Level Classification
| Credits Passed | Level |
|---|---|
| 0–32 | First (Freshman) |
| 33–65 | Second (Sophomore) |
| 66–101 | Third (Junior) |
| 102+ | Fourth (Senior) |

### Art. 11 — Credit Hour Limits per Semester
| CGPA | Min | Max |
|---|---|---|
| < 2.0 | 2 | 20 |
| 2.0–2.49 | 2 | 18 |
| 2.5–2.99 | 2 | 18 |
| ≥ 3.0 | 2 | 20 |
| Summer | 2 | 7 |

### Art. 12 — Add/Drop Window
- Open during `registration` status
- Closes at `add_drop_deadline` (auto-set: registration_start + 14 days)
- After deadline: only withdrawal allowed (not free drop)

### Art. 13 — Course Withdrawal
- Available from day 1 through `withdrawal_deadline` (auto-set: start_date + 49 days)
- Withdrawal records **W grade** (not F); does not affect GPA
- Cannot drop below **2 credit hours** after withdrawal

### Art. 14 — Attendance Requirements
- Minimum **42%** attendance to sit final exam
- Below 42% → **Abs grade** assigned during semester finalization
- Abs = fail (grade_points = 0); shown on transcript

### Art. 16 — Grading Rules
- Minimum **40% of total grade** to pass (below = F)
- Minimum **30% of final exam component** to pass (below = F regardless of total)
- Grade scale: A+ (≥96%) down to D- (40-49%)

### Art. 17 — Full Grade Scale
| Grade | Range | Points | Arabic |
|---|---|---|---|
| A+ | 96-100% | 4.0 | ممتاز مرتفع |
| A  | 92-95%  | 3.7 | ممتاز |
| A- | 88-91%  | 3.4 | امتياز منخفض |
| B+ | 84-87%  | 3.2 | جيد جداً مرتفع |
| B  | 80-83%  | 3.0 | جيد جداً |
| B- | 76-79%  | 2.8 | جيد جداً منخفض |
| C+ | 72-75%  | 2.6 | جيد مرتفع |
| C  | 68-71%  | 2.4 | جيد |
| C- | 64-67%  | 2.2 | جيد منخفض |
| D+ | 60-63%  | 2.0 | مقبول مرتفع |
| D  | 55-59%  | 1.5 | مقبول |
| D- | 50-54%  | 1.0 | مقبول منخفض |
| D- | 40-49%  | 0.7 | حد أدنى المرور |
| F  | < 40%   | 0.0 | راسب |

### Art. 18 — GPA Formula
```
CGPA = Σ(credit_hours × grade_points) / Σ(credit_hours)
```
Precision: 3 decimal places. Recalculated after every semester finalization.

### Art. 22 — Failed Course Retake
- Students may retake failed courses
- Retake grade **capped at B (3.0 pts)** for GPA purposes
- All attempts shown on transcript; only best counted in CGPA

### Art. 23 — Voluntary Improvement Retake
- Only allowed when CGPA < 2.0
- Maximum **3 courses** total for voluntary improvement

### Art. 25 — Academic Warnings
- Issued when **semester CGPA < 2.0** (after finalization)
- **First semester exempt** (no warning even with low CGPA)
- Warning resets `consecutive_warnings` to 0 if CGPA recovers

### Art. 26 — Academic Dismissal
Triggered by **any** of:
- **4 consecutive** academic warnings
- **6 total** academic warnings (cumulative)
- Study duration exceeds **8 regular semesters**

### Art. 27 — Honors Graduation (مرتبة الشرف)
All 4 conditions must be met:
1. Cumulative CGPA ≥ **3.0**
2. **No F or Abs** grades in entire academic history
3. All individual grades ≥ **B (3.0 pts)**
4. Completed within **8 regular semesters**

---

## 7. API Reference

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
```
Authorization: Bearer <accessToken>
```

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | ✗ | Login → returns accessToken + refreshToken |
| POST | `/auth/refresh` | ✗ | Rotate refresh token → new token pair |
| POST | `/auth/logout` | ✓ | Revoke refresh token |
| GET | `/auth/me` | ✓ | Get current user + profile |
| PUT | `/auth/change-password` | ✓ | Change password (invalidates all tokens) |

### Student Endpoints (role: student)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/student/dashboard` | Stats, schedule, warnings |
| GET | `/student/semesters/:id/available-courses` | Courses with canRegister, blockReason |
| POST | `/student/register` | Enroll in offering `{offeringId}` |
| DELETE | `/student/enrollments/:id/drop` | Drop during add/drop window |
| POST | `/student/enrollments/:id/withdraw` | Withdraw with W grade |
| GET | `/student/transcript` | Full academic history |
| GET | `/student/semesters/:id/schedule` | Current schedule + attendance |
| GET | `/student/graduation-status` | Eligibility + honors check |
| GET | `/student/warnings` | Academic warnings list |
| GET | `/student/notifications` | Notifications feed |
| PUT | `/student/notifications/:id/read` | Mark notification read |
| PUT | `/student/notifications/read-all` | Mark all read |
| GET | `/student/notifications/unread-count` | `{count: N}` |

### Doctor Endpoints (role: doctor)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/doctor/dashboard` | Stats + courses list |
| GET | `/doctor/offerings/:id/roster` | Student roster with grades |
| PATCH | `/doctor/enrollments/:id/grades` | Enter grade components |
| POST | `/doctor/offerings/:id/attendance` | Record session attendance |
| GET | `/doctor/offerings/:id/attendance` | Get attendance report |
| GET | `/doctor/notifications` | Notifications |
| PUT | `/doctor/notifications/:id/read` | Mark read |
| PUT | `/doctor/notifications/read-all` | Mark all read |
| GET | `/doctor/notifications/unread-count` | Unread count |

### Admin Endpoints (role: admin)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard` | System stats + recent warnings |
| GET | `/admin/students` | Paginated list with search |
| GET | `/admin/students/:id` | Full profile (GPA history, warnings, transcript) |
| POST | `/admin/users` | Create user (any role) |
| GET | `/admin/users` | List users with role filter |
| GET | `/admin/semesters` | All semesters |
| POST | `/admin/semesters` | Create new semester |
| PATCH | `/admin/semesters/:id/status` | Lifecycle transition |
| POST | `/admin/semesters/:id/finalize` | Compute GPA + issue warnings |
| GET | `/admin/courses` | Course catalog with filters |
| POST | `/admin/courses` | Create course |
| POST | `/admin/offerings` | Create course offering |
| GET | `/admin/reports/academic` | GPA distribution + top/dismissed |
| GET | `/admin/announcements` | Announcements list |
| POST | `/admin/announcements` | Create announcement |
| POST | `/admin/students/:id/enroll` | Admin override enrollment |
| DELETE | `/admin/students/:id/enroll/:enrollmentId` | Admin force drop |

### Shared Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/semesters` | ✓ | All semesters (for semester selector) |
| GET | `/departments` | ✓ | Department list |
| GET | `/announcements` | ✓ | Public announcements |
| GET | `/health` | ✗ | Service health status |
| GET | `/metrics` | ✗ | Prometheus metrics |

### Response Envelope

Every response follows this shape:
```json
// Success
{ "success": true, "data": { ... }, "message": "optional" }

// Error
{ "success": false, "message": "Human-readable error", "code": "ERROR_CODE" }

// Paginated
{ "success": true, "data": { "items": [...], "pagination": { "page": 1, "limit": 15, "total": 87, "hasMore": true } } }
```

---

## 8. Database Schema

### Entity Relationship Overview

```
users (1) ──── (0,1) students
users (1) ──── (0,1) doctors
doctors (N) ── (1) departments
courses (N) ── (N) course_prerequisites
courses (N) ── (N) course_offerings (via offering_id + semester_id + doctor_id)
course_offerings (1) ── (N) enrollments
students (1) ── (N) enrollments
enrollments (1) ── (1) attendance_summary
enrollments (1) ── (N) attendance_records
students (1) ── (N) semester_gpa_records
students (1) ── (N) academic_warnings
users (1) ── (N) notifications
```

### Key Tables

```sql
-- Core entities
users              (id UUID PK, email UNIQUE, password_hash, role, is_active, must_change_pw)
students           (id UUID PK, user_id FK, student_code UNIQUE, specialization,
                    current_level, cgpa NUMERIC(4,3), total_credits_passed,
                    semesters_enrolled, total_warnings, consecutive_warnings,
                    academic_status [active|warning|dismissed])
doctors            (id UUID PK, user_id FK, academic_title, department_id FK)
departments        (id UUID PK, code UNIQUE, name_ar, name_en)

-- Academic catalog
academic_years     (id UUID PK, year_label UNIQUE, start_date, end_date)
semesters          (id UUID PK, academic_year_id FK, semester_type, label, status,
                    registration_start, registration_end,
                    add_drop_deadline, withdrawal_deadline)
courses            (id UUID PK, code UNIQUE, name_ar, name_en, credits, level,
                    category, is_mandatory, is_active, description)
course_prerequisites (course_id FK, prereq_course_id FK, is_strict BOOL)
course_offerings   (id UUID PK, course_id FK, semester_id FK, doctor_id FK,
                    section, capacity, enrolled_count DEFAULT 0)

-- Student academic records
enrollments        (id UUID PK, student_id FK, offering_id FK, semester_id FK,
                    status [registered|completed|withdrawn|dropped],
                    attempt_number, is_improvement_retake,
                    midterm_grade, coursework_grade, practical_grade, final_exam_grade,
                    total_grade, letter_grade, grade_points,
                    is_counted_in_gpa, is_credit_bearing, grade_locked)
attendance_sessions (id UUID PK, offering_id FK, session_date, session_type)
attendance_records  (id UUID PK, session_id FK, enrollment_id FK, is_present, is_excused)
attendance_summary  (enrollment_id PK, total_sessions, attended, absent, attendance_pct)
semester_gpa_records (id UUID PK, student_id FK, semester_id FK,
                      semester_gpa, cumulative_gpa, credits_earned, classification)
academic_warnings  (id UUID PK, student_id FK, semester_id FK,
                    warning_type, cgpa_at_warning, consecutive_warnings, is_consecutive)

-- Communication
notifications      (id UUID PK, user_id FK, title, message, type, is_read, created_at)
announcements      (id UUID PK, title, body, target_role, is_pinned, created_by FK)

-- Security & audit
refresh_tokens     (id UUID PK, user_id FK, token_hash, expires_at, revoked)
audit_logs         (id UUID PK, user_id FK, action, entity_type, entity_id,
                    description, ip_address, created_at)
```

### Database Functions & Triggers

| Object | Type | Purpose |
|---|---|---|
| `calculate_student_cgpa(student_id)` | Function | Weighted GPA from all counted enrollments |
| `check_prerequisites(student_id, course_id)` | Function | Returns bool — prereqs satisfied? |
| `process_semester_warnings(semester_id)` | Function | Batch warning/dismissal processing |
| `update_student_level()` | Trigger fn | Auto-updates current_level from credits |
| `trg_enrollment_count` | Trigger | Auto-increments/decrements enrolled_count |
| `trg_updated_at` | Trigger | Auto-updates updated_at on every row change |

---

## 9. Frontend Design System

### Tech Stack
- React 18 (CRA / react-scripts)
- Inline CSS via `<style>` injection + CSS custom properties
- Arabic RTL layout throughout
- Cairo font (Google Fonts)
- No CSS framework dependencies

### Design Tokens

```css
:root {
  --p:       #1b4f9e;    /* Primary blue */
  --pd:      #1b3a6b;    /* Primary dark */
  --pl:      #2563b8;    /* Primary light */
  --active:  #3b82f6;    /* Active nav / interactive */
  --accent:  #f5c518;    /* Yellow accent (login card) */
  --sb-bg:   #f8fafc;    /* Sidebar background */
  --ok:      #16a34a;    /* Success green */
  --er:      #dc2626;    /* Error red */
  --wn:      #d97706;    /* Warning orange */
}
```

### Layout System

```
┌────── TopBar (64px fixed) ──────────────────────────────────────────┐
│  UniSmart logo │ Page title │ [spacer] │ Search │ 🔔 │ User ▼       │
├───────────────────────────────────────────┬─────────────────────────┤
│                                           │                         │
│         Main Content Area                │   Right Sidebar         │
│         (padding: 24px)                   │   (260px | 72px col.)   │
│         margin-right: 260px              │   · Role-filtered nav   │
│                                           │   · Collapse toggle     │
│                                           │   · User info           │
└───────────────────────────────────────────┴─────────────────────────┘
```

### Page Routing

| Path | Role | Page |
|---|---|---|
| `/login` | public | Login (farah-branch card design) |
| `/forgot` | public | Forgot password |
| `/admin` | admin | Dashboard |
| `/admin/students` | admin | Students list + detail |
| `/admin/users` | admin | User management |
| `/admin/semesters` | admin | Semester lifecycle + finalize |
| `/admin/courses` | admin | Course catalog |
| `/admin/registration` | admin | Registration window |
| `/admin/reports` | admin | Academic reports |
| `/admin/announcements` | admin | Announcements |
| `/admin/notifications` | admin | Notifications |
| `/doctor` | doctor | Dashboard |
| `/doctor/courses` | doctor | My courses |
| `/doctor/courses/:offeringId` | doctor | Roster + grades + attendance |
| `/student` | student | Dashboard |
| `/student/courses` | student | Course registration |
| `/student/schedule` | student | Schedule + attendance |
| `/student/transcript` | student | Transcript |
| `/student/graduation` | student | Graduation status |
| `/student/notifications` | student | Notifications |
| `/change-password` | all | Change password |

---

## 10. Security Model

### Authentication
- **JWT access tokens** — 15-minute expiry, signed with HS256
- **Refresh tokens** — 7-day expiry, stored as SHA-256 hash in DB, rotated on every refresh
- **Token rotation** — old refresh token revoked immediately on use (prevents reuse attacks)
- **Logout** — all refresh tokens for user revoked in DB

### Authorization (RBAC)
Every API route has both `authenticate` (JWT valid?) and `requireRole('admin'|'doctor'|'student')` middleware. Mismatched roles return `403`.

### Password Security
- bcrypt with cost factor 10
- Minimum 8 chars with uppercase, lowercase, digit, and special character
- New users created with `must_change_pw = true`
- `change-password` invalidates all existing tokens

### Security Headers
```
helmet() provides:
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Strict-Transport-Security (HSTS)
  Content-Security-Policy
```

### Rate Limiting
- Login endpoint: 10 requests/minute per IP
- General API: 100 requests/minute per IP

### Audit Trail
Every admin action is logged to `audit_logs` with: user_id, action type, entity affected, timestamp, IP address.

---

## 11. Monitoring & Observability

### Prometheus Metrics

```
# HTTP traffic
fcit_srs_http_requests_total{method, route, status}
fcit_srs_http_duration_seconds{method, route}

# Auth events
fcit_srs_login_attempts_total{result}       (success|failure)
fcit_srs_active_sessions_total

# Academic events  
fcit_srs_enrollments_total{semester}
fcit_srs_grade_entries_total{offering}
```

### Grafana Dashboard
Pre-built dashboard at `docker/grafana/dashboards/fcit-srs-overview.json`:
- Request rate and latency
- Login success/failure ratio
- Active sessions
- Enrollment activity

**Access:** http://localhost:3050 (admin / admin123)

### Health Check
```bash
curl http://localhost:3000/health
# {"status":"healthy","database":"connected","timestamp":"2026-05-11T...","version":"1.0.0"}
```

---

## 12. Development Guide

### Project Structure

```
fcit-srs/
├── .claude.md                    ← AI session tracking (read first)
├── FCIT_SRS_MASTER_TEST_PLAN.md  ← 215 test cases (full SDLC coverage)
├── .env.example                  ← Environment template
├── docker-compose.yml            ← Full stack orchestration
├── Dockerfile.backend            ← Node.js 20-alpine
├── Dockerfile.frontend           ← nginx-unprivileged with React build
├── Dockerfile.db                 ← PostgreSQL init helper
│
├── backend/
│   ├── src/
│   │   ├── server.js             ← Entry: helmet, cors, rate-limit, Prometheus
│   │   ├── config/
│   │   │   ├── database.js       ← pg Pool, withTransaction, healthCheck
│   │   │   └── constants.js      ← ALL bylaw constants (Art. 11, 16, 17, 25, 26, 27)
│   │   ├── controllers/          ← HTTP layer (req/res only, no business logic)
│   │   │   ├── auth.controller.js
│   │   │   ├── student.controller.js
│   │   │   ├── doctor.controller.js
│   │   │   └── admin.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.js           ← authenticate() + requireRole()
│   │   │   ├── metrics.js        ← Prometheus recording
│   │   │   └── errorHandler.js   ← Centralized error envelope
│   │   ├── routes/
│   │   │   └── index.js          ← All route definitions + middleware chains
│   │   ├── services/             ← Business logic
│   │   │   ├── bylaw.service.js  ← canStudentRegisterCourse, shouldReceiveWarning...
│   │   │   ├── gpa.service.js    ← percentageToLetter, calculateCGPA, applyRetakeCap
│   │   │   ├── registration.service.js  ← registerCourse (FOR UPDATE), finalizeSemester
│   │   │   └── notification.service.js  ← onCourseRegistered, onWarningIssued...
│   │   └── utils/
│   │       └── logger.js         ← Winston logger
│   └── entrypoint.sh             ← Wait for DB, run migrations, start server
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx               ← All pages, layout, routing (1,600 lines)
│   │   ├── index.js              ← React root render
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx   ← JWT restore, login/logout, session management
│   │   └── services/
│   │       └── api.js            ← axios instance, all API calls, token refresh interceptor
│   └── public/
│
├── database/
│   ├── schema.sql                ← Full DDL: tables, indexes, triggers, functions, views
│   ├── enhancements.sql          ← Additional views and stored procedures
│   └── seeds/
│       ├── 001_demo_users.sql    ← 1 admin, 3 doctors, 5 students
│       ├── 002_initial_setup.sql ← Departments, semesters, course offerings
│       └── 003_complete_curriculum.sql  ← Full 132-credit curriculum per specialization
│
├── docker/
│   ├── nginx.conf                ← SPA routing + /api/v1 proxy
│   ├── prometheus.yml            ← Scrape config
│   └── grafana/                  ← Datasource + dashboard provisioning
│
└── db-extracted/                 ← Bylaw source of truth
    ├── bylaws_complete.json      ← All 52 rules structured
    ├── specialization_courses_complete.json
    ├── BYLAW_RULES_EXTRACTED.txt
    └── extracted_pdf_content.txt
```

### Adding a New Bylaw Rule

1. Add constant to `backend/src/config/constants.js`
2. Implement check in `backend/src/services/bylaw.service.js`
3. Call check from `canStudentRegisterCourse()` or finalization flow
4. Add test case to `FCIT_SRS_MASTER_TEST_PLAN.md`
5. Update `.claude.md` Change Log

### Adding a New API Endpoint

```javascript
// 1. Add to backend/src/controllers/admin.controller.js
const myNewMethod = async (req, res, next) => {
  try {
    const data = await myQuery();
    return res.json({ success: true, data });
  } catch (err) { next(err); }
};
module.exports = { ..., myNewMethod };

// 2. Add route to backend/src/routes/index.js
router.get('/admin/my-route', authenticate, aOnly, adminCtrl.myNewMethod);

// 3. Add to frontend/src/services/api.js
export const adminAPI = {
  myNewMethod: () => api.get('/admin/my-route'),
};
```

---

## 13. Testing

### Test Plan
Full test plan with **215 test cases** is in `FCIT_SRS_MASTER_TEST_PLAN.md`.

### Quick Smoke Test
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fci.tanta.edu.eg","password":"Admin@2026!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

echo "Token: ${TOKEN:0:30}..."

# 2. Admin dashboard
curl -s http://localhost:3000/api/v1/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -20

# 3. RBAC check (should 403)
STUDENT_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"s.2024cs001@fci.tanta.edu.eg","password":"Student@2026!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/admin/dashboard \
  -H "Authorization: Bearer $STUDENT_TOKEN"
# Expected: 403
```

### Run Specific Bylaw Test
```bash
# Test Art. 11: max credits (student with CGPA < 2.0 should be blocked at 21 credits)
curl -s -X POST http://localhost:3000/api/v1/student/register \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"offeringId":"<offering-id-that-would-exceed-limit>"}' | python3 -m json.tool
```

---

## 14. Deployment

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
POSTGRES_DB=fcit_srs
POSTGRES_USER=fcit_user
POSTGRES_PASSWORD=<strong-password>

# Backend
NODE_ENV=production
JWT_ACCESS_SECRET=<min-32-char-random-string>
JWT_REFRESH_SECRET=<different-min-32-char-random-string>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Ports (override defaults)
BACKEND_PORT=3000
FRONTEND_PORT=3002
DB_PORT=5432
```

### Production Checklist

- [ ] Change all default passwords in `.env`
- [ ] JWT secrets are cryptographically random (≥ 32 chars)
- [ ] `NODE_ENV=production` in backend environment
- [ ] Postgres not exposed on public port (remove `ports` for postgres in production)
- [ ] Add TLS/SSL termination in front of Nginx
- [ ] Set up external backup for `postgres_data` volume
- [ ] Configure Grafana admin password
- [ ] Enable SMTP for password reset emails

### Scaling

For production load:
```yaml
# In docker-compose.yml — add replicas for backend
backend:
  deploy:
    replicas: 3
```

Database connections are pooled (default: 20 max per backend instance).

---

## 15. Troubleshooting

### Backend cannot connect to database

```bash
# Check postgres is healthy
docker compose ps postgres

# Check backend logs
docker compose logs backend | grep -i "error\|connect\|postgres"

# Manual connection test
docker exec -it fcit-srs-postgres pg_isready -U fcit_user -d fcit_srs
```

### Tables not created / seed data missing

```bash
# Re-run initialization
docker compose down -v  # WARNING: destroys all data
docker compose up -d --build
```

### Frontend shows blank page / 404 on reload

```bash
# Check nginx config has try_files
docker exec fcit-srs-frontend cat /etc/nginx/conf.d/default.conf | grep try_files
# Should see: try_files $uri $uri/ /index.html;
```

### JWT errors (401 on valid token)

```bash
# Verify JWT_ACCESS_SECRET matches between restarts
docker exec fcit-srs-backend env | grep JWT_ACCESS_SECRET
# If it changed, all tokens are invalid — users need to re-login
```

### Enrollment fails with "capacity full" unexpectedly

```bash
# Check actual enrolled_count vs capacity
docker exec -it fcit-srs-postgres psql -U fcit_user -d fcit_srs \
  -c "SELECT id, section, capacity, enrolled_count FROM course_offerings WHERE id = '<id>';"
```

---

## 16. Changelog

### v2.0.0 — 2026-05-11 (Session 2)

**🔴 Critical Fixes:**
- **BUG-008:** Art. 16 grade threshold: corrected minimum passing from 50% to 40% in `gpa.service.js` and grade scale in `constants.js`
- **BUG-009:** Art. 14 attendance barring: `finalizeSemester()` now assigns `Abs` grades to <42%-attendance students before computing GPA
- **BUG-010:** Race condition: `registerCourse()` now uses `SELECT FOR UPDATE` on `course_offerings` to serialize concurrent enrollment; capacity checked post-lock

**🟠 High-Priority Fixes:**
- **BUG-001:** Doctor roster link used `c.id` (course_id) instead of `c.offering_id` — wrong data loaded
- **BUG-002:** Missing `POST /admin/semesters` endpoint — admin could not create semesters via UI
- **BUG-003:** Semester finalization button absent — GPA computation / warnings never triggered from UI
- **BUG-004:** `AdminStudentDetail` was minimal — complete 3-tab page (overview/transcript/enrollment override)
- **BUG-005:** `SchedulePage` attendance fields not mapped — all columns now display correctly with color coding
- **BUG-006:** Doctor attendance tab was a placeholder — full `AttendanceTab` component with recording and history
- **BUG-007:** Admin semester page lacked create form — full form with auto-calculated deadlines added

**📊 New:**
- 215 test cases across 7 phases (`FCIT_SRS_MASTER_TEST_PLAN.md`)
- `finalizeSemester()` return shape includes `absGradesAssigned`, `dismissals`, `warningsIssued`

### v1.0.0 — 2026-05-07 (Session 1)

- Initial full-stack implementation
- 52 bylaw rules enforced server-side
- 3-role system (admin / doctor / student)
- Prometheus + Grafana monitoring
- farah-branch UI applied (Cairo font, light sidebar #f8fafc, blue active #3b82f6)
- Login page with polygon card design
- Collapsible sidebar with role-filtered navigation
