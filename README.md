# FCIT SRS — Student Registration System
## Faculty of Computers & Informatics, Tanta University

> A full-stack, production-grade Student Registration System encoding all 52 rules from the FCIT 2024 Bylaws document. Built with Node.js, PostgreSQL, React, and Docker.

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [System Architecture](#system-architecture)
3. [Access Points & Credentials](#access-points--credentials)
4. [User Roles & Workflows](#user-roles--workflows)
5. [Bylaw Enforcement Reference](#bylaw-enforcement-reference)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [Security](#security)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

**Prerequisites:** Docker, Docker Compose, Node.js 20+, npm

```bash
git clone <repo-url>
cd fcit-srs
bash quick-start.sh
```

That single command:
- Checks all prerequisites
- Installs npm dependencies (backend + frontend)
- Builds all Docker images
- Starts PostgreSQL, Backend API, Frontend, Prometheus, Grafana
- Runs database migrations and seeds
- Configures demo accounts
- Verifies health of all services

**Then open:** `http://localhost:3002`

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                    │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │   Frontend   │   │   Backend    │   │   PostgreSQL   │  │
│  │  React + Nginx│──▶│ Node/Express │──▶│  pg 16-alpine  │  │
│  │  Port: 3002  │   │  Port: 3000  │   │  Port: 5432    │  │
│  └──────────────┘   └──────────────┘   └────────────────┘  │
│         │                  │                               │
│         │            ┌─────▼──────┐   ┌──────────────┐    │
│         └───/api/───▶│ Prometheus │   │   Grafana    │    │
│                      │ Port: 9090 │──▶│  Port: 3050  │    │
│                      └────────────┘   └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Stack:**
- **Frontend:** React 18, React Router v6, Axios, React Hot Toast — no CSS framework (pure inline styles)
- **Backend:** Node.js 20, Express 4, JWT (access + refresh token rotation), bcrypt, Winston, Prometheus metrics
- **Database:** PostgreSQL 16 with full PL/pgSQL stored procedures encoding bylaw logic
- **Infra:** Docker, Docker Compose, Nginx (reverse proxy + SPA), Prometheus + Grafana

---

## Access Points & Credentials

| Service     | URL                        | Notes                            |
|-------------|----------------------------|----------------------------------|
| Frontend    | http://localhost:3002      | Main application                 |
| Backend API | http://localhost:3000/api/v1 | REST API                       |
| API Health  | http://localhost:3000/health | Health check endpoint           |
| Prometheus  | http://localhost:9090      | Metrics collection               |
| Grafana     | http://localhost:3050      | Dashboards (admin / admin123)    |
| PostgreSQL  | localhost:5432             | DB direct access                 |

### Demo Accounts

| Role    | Email                             | Password       |
|---------|-----------------------------------|----------------|
| Admin   | admin@fci.tanta.edu.eg            | Admin@2026!    |
| Doctor  | dr.ahmed@fci.tanta.edu.eg         | Doctor@2026!   |
| Student | s.2024cs001@fci.tanta.edu.eg      | Student@2026!  |

> **Password Policy:** Min 8 chars, must contain uppercase, lowercase, digit, and special character (`@$!%*?&#`).

---

## User Roles & Workflows

### 🛡️ Admin Workflow

The Admin is responsible for the overall system operation. They have full access to all features.

**Key capabilities:**
1. **User Management** — Create/edit/deactivate admin, doctor, and student accounts; reset passwords
2. **Semester Management** — Control semester lifecycle: `upcoming → registration → active → grading → closed`
3. **Course Offerings** — Assign courses to semesters, assign doctors, set capacity
4. **Semester Finalization** — Triggers automatic GPA computation, academic warning issuance, dismissal evaluation for all students
5. **Student Oversight** — Full view of any student's transcript, GPA history, warnings, graduation eligibility
6. **Academic Reports** — GPA distribution, top students, dismissed students, enrollment statistics
7. **Announcements** — Post pinned or role-targeted announcements to all users

**Typical admin workflow:**
```
1. Set up Academic Year → Create Semesters
2. Set semester status to "registration"
3. Create course offerings (assign courses + doctors)
4. Monitor enrollment during registration period
5. At semester end: Set status to "grading" → doctors enter grades
6. Run "Finalize Semester" → system auto-computes GPA, issues warnings
7. Set status to "closed"
```

---

### 👨‍🏫 Doctor Workflow

Doctors manage their assigned courses and enter student grades.

**Key capabilities:**
1. **Dashboard** — Overview of all assigned courses, pending grade counts
2. **Course Roster** — Full student list for each section with current grades
3. **Grade Entry** — Enter per-student grade components (midterm, coursework, practical, final)
4. **Bulk Grade Entry** — Upload grades for all students in a course at once
5. **Attendance** — Record session-by-session attendance; system auto-computes attendance %
6. **Attendance Reports** — See which students are below the 42% minimum (bylaw Art. 14)

**Grade components:**
| Component     | Weight | Bylaw Reference |
|---------------|--------|-----------------|
| Midterm Exam  | 20%    | Art. 17         |
| Coursework    | 10%    | Art. 17         |
| Practical     | 10%    | Art. 17         |
| Final Exam    | 60%    | Art. 17         |

**Automatic fail conditions:**
- Final exam score < 30% (regardless of total) — Art. 16
- Total weighted score < 50% (grade F)

---

### 👨‍🎓 Student Workflow

Students register for courses, track grades, and monitor graduation progress.

**Key capabilities:**
1. **Dashboard** — Current semester schedule, GPA summary, warnings, notifications
2. **Course Registration** — Browse available courses filtered by eligibility; one-click register
3. **Drop / Withdraw** — Drop (within week 2, no W recorded) or Withdraw (within week 7, W grade recorded)
4. **Schedule** — View enrolled courses per semester with attendance %
5. **Transcript** — Complete academic history grouped by semester with all GPA calculations
6. **Graduation Status** — Real-time checklist of all 9 graduation requirements with pass/fail status
7. **Notifications** — Academic warnings, dismissal notices, announcements

**Registration eligibility is auto-enforced:**
- Prerequisites must be passed (strict chain per course)
- Credit hour limits respected per level and CGPA (Art. 11)
- Add/drop deadline (end of week 2) enforced
- Graduation project requires 85+ credits (Art. 21)
- Max 3 voluntary improvement retakes (Art. 23)
- Summer semester max 7 credits (Art. 11)

---

## Bylaw Enforcement Reference

Every rule from the 2024 bylaws is enforced in code. Here is the complete mapping:

| Bylaw Article | Rule | Enforcement Location |
|---------------|------|----------------------|
| Art. 1 | Admission requires General Secondary Certificate | Admin user creation |
| Art. 4 | 132 credits required, min CGPA 2.0, max 8 semesters | `bylaw.service.js`, DB functions |
| Art. 4 | Summer semester: 7-8 weeks, optional | Semester model, credit limits |
| Art. 10 | Level advancement: Freshman(<33) / Sophomore(33-65) / Junior(66-101) / Senior(102+) | `credits_to_level()` DB function |
| Art. 11 | New student: max 20 credits first semester | `getMaxCreditsForSemester()` |
| Art. 11 | Freshman max 27cr / Sophomore 30cr / Junior 22cr | Credit limit enforcement |
| Art. 11 | CGPA-based limits: ≥3.0=20cr, 2.5-3.0=20cr, 2.0-2.49=18cr, <2.0=15cr | `CGPA_CREDIT_LIMITS` constants |
| Art. 11 | Summer semester: min 2cr, max 7cr | Summer semester validation |
| Art. 12 | Add/drop deadline: end of week 2 | `add_drop_deadline` column check |
| Art. 13 | Withdrawal deadline: end of week 7 | `withdrawal_deadline` column check |
| Art. 13 | Withdrawal records W grade, doesn't count as fail | `withdrawCourse()` service |
| Art. 13 | Minimum 2cr must remain after withdrawal | Credit floor check in withdrawal |
| Art. 14 | Minimum 42% attendance to sit final exam | `attendance_summary` table, `attendance_pct` check |
| Art. 14 | >25% absence triggers warning | `excessive_absence` flag in reports |
| Art. 16 | Min 40% total grade to pass | Grade finalization logic |
| Art. 16 | Min 30% of final exam to pass | `finalize_enrollment_grade()` DB function |
| Art. 17 | Grade scale: A+(4.0/96%) down to F(0/below 50%) | `GRADE_SCALE` constants, DB functions |
| Art. 18 | GPA calculated as weighted avg: Σ(credits × points) / Σ(credits) | `calculateCGPA()` service |
| Art. 18 | CGPA to 3 decimal places | All GPA fields `NUMERIC(4,3)` |
| Art. 18 | Classifications: Poor/Weak/Satisfactory/Good/Very Good/Excellent | `getCGPAClassification()` |
| Art. 20 | Training non-credit bearing (P/F only) | `is_credit_bearing=FALSE` on TR courses |
| Art. 21 | Graduation project: 85+ credits prerequisite for PR411 | `canStudentRegisterCourse()` special check |
| Art. 21 | PR412 requires PR411 completion | `course_prerequisites` table |
| Art. 21 | Project min 40% total, 15% final defense | `graduation_projects` grading fields |
| Art. 22 | Failed course must be retaken | Retake tracking in `course_retake_log` |
| Art. 22 | Retake grade capped at B (3.0 points) | `applyRetakeCap()`, `process_retake_grade()` |
| Art. 22 | Only highest attempt counts for GPA | `is_counted_in_gpa` flag logic |
| Art. 22 | All attempts shown on transcript | All enrollments preserved with `attempt_number` |
| Art. 23 | Max 3 voluntary improvement retakes allowed | `MAX_VOLUNTARY_RETAKES=3` constant |
| Art. 23 | Improvement retake grade capped at B | `is_improvement_retake` flag + cap |
| Art. 25 | Academic warning if CGPA < 2.0 (from semester 2+) | `shouldReceiveWarning()`, `process_semester_warnings()` |
| Art. 25 | First semester exempt from warnings | `semesters_enrolled <= 1` check |
| Art. 26 | Dismissal after 4 consecutive warnings | `consecutive_warnings >= 4` check |
| Art. 26 | Dismissal after 6 total warnings | `total_warnings >= 6` check |
| Art. 26 | Dismissal after exceeding 8 regular semesters | `semesters_enrolled > 8` check |
| Art. 27 | Honors: CGPA ≥ 3.0, all grades ≥ Very Good (B+), ≤8 semesters, no F ever | `checkHonorsEligibility()` |
| Art. 27 | Honors: no dismissals, no warnings on record | Included in honors check |
| Art. 28 | Ranking by CGPA; tie-break by sum of grades | `v_graduation_eligibility` view |
| Art. 15 | Leave: max 4 consecutive / 6 total semesters | `checkLeaveEligibility()` |
| Art. 29 | Specialization change: Junior minimum, max 1 change | Admin `updateUser()` with controls |

---

## API Reference

### Authentication
```
POST   /api/v1/auth/login           Login (returns access + refresh tokens)
POST   /api/v1/auth/refresh         Refresh access token (rotates refresh token)
POST   /api/v1/auth/logout          Revoke refresh token
POST   /api/v1/auth/change-password Change password (requires current password)
GET    /api/v1/auth/me              Get current user + profile
```

### Student Endpoints
```
GET    /api/v1/student/profile                           Student profile
GET    /api/v1/student/dashboard                         Dashboard data
GET    /api/v1/student/transcript                        Full transcript
GET    /api/v1/student/graduation-status                 Graduation checklist
GET    /api/v1/student/warnings                          Academic warnings
GET    /api/v1/student/semesters/:id/available-courses   Courses available to register
GET    /api/v1/student/semesters/:id/schedule            Current enrollment
POST   /api/v1/student/register                          Register {offeringId}
DELETE /api/v1/student/enrollments/:id/drop              Drop (within add/drop period)
POST   /api/v1/student/enrollments/:id/withdraw          Withdraw (W grade, within week 7)
GET    /api/v1/student/notifications                     All notifications
PATCH  /api/v1/student/notifications/:id/read            Mark notification read
```

### Doctor Endpoints
```
GET    /api/v1/doctor/dashboard                          Doctor dashboard
GET    /api/v1/doctor/courses                            Assigned courses
GET    /api/v1/doctor/offerings/:id/roster               Course student roster
PATCH  /api/v1/doctor/enrollments/:id/grades             Enter grades {midterm_grade, coursework_grade, practical_grade, final_exam_grade}
POST   /api/v1/doctor/offerings/:id/grades/bulk          Bulk grade entry
POST   /api/v1/doctor/offerings/:id/attendance           Record attendance session
GET    /api/v1/doctor/offerings/:id/attendance           Attendance report
```

### Admin Endpoints
```
GET    /api/v1/admin/dashboard                           System statistics
GET    /api/v1/admin/users                               All users (filter: role, search)
POST   /api/v1/admin/users                               Create user
PATCH  /api/v1/admin/users/:id                           Update user
POST   /api/v1/admin/users/:id/reset-password            Reset password
GET    /api/v1/admin/students                            Students (filter: spec, status, level)
GET    /api/v1/admin/students/:id                        Student detail + transcript
GET    /api/v1/admin/semesters                           All semesters
PATCH  /api/v1/admin/semesters/:id/status                Update semester status
POST   /api/v1/admin/semesters/:id/finalize              Finalize semester (GPA + warnings)
POST   /api/v1/admin/offerings                           Create course offering
GET    /api/v1/admin/reports/academic                    Academic report
GET    /api/v1/announcements                             All announcements (all roles)
POST   /api/v1/admin/announcements                       Create announcement
```

### Shared Endpoints
```
GET    /api/v1/courses                                   Course catalog
GET    /api/v1/courses/:id/prerequisites                 Course prerequisites
GET    /api/v1/departments                               Departments list
GET    /api/v1/semesters/current                         Current open semester
GET    /api/v1/academic-rules                            All bylaw rules reference
```

---

## Database Schema

### Core Tables
| Table | Purpose |
|-------|---------|
| `users` | All users (admin, doctor, student) |
| `students` | Student-specific data: CGPA, credits, level, status |
| `doctors` | Doctor profiles linked to departments |
| `departments` | CS / IS / IT / SE |
| `courses` | Full catalog with 120+ courses |
| `course_prerequisites` | Prerequisite DAG (directed acyclic graph) |
| `semesters` | Academic calendar with all key dates |
| `course_offerings` | Courses offered per semester (with doctor, capacity) |
| `enrollments` | Student-course registrations with grades |
| `attendance_sessions` | Per-session attendance tracking |
| `attendance_records` | Per-student per-session attendance |
| `attendance_summary` | Materialized summary of attendance % |
| `semester_gpa_records` | Semester and cumulative GPA history |
| `academic_warnings` | Warning records per student per semester |
| `academic_leaves` | Leave of absence records |
| `graduation_projects` | PR411 / PR412 records |
| `training_records` | Summer training records |
| `course_retake_log` | Tracks retake counts per course per student |
| `notifications` | User notifications |
| `announcements` | System announcements |
| `academic_rules` | Bylaw reference table |
| `refresh_tokens` | JWT refresh token store (with rotation) |
| `seed_logs` | Tracks which seed files have run |

### Key DB Functions
| Function | Purpose |
|----------|---------|
| `recompute_student_cgpa(uuid)` | Recalculate CGPA after any grade change |
| `finalize_enrollment_grade(uuid)` | Compute total + letter grade from components |
| `process_retake_grade(uuid, int)` | Apply retake cap and update GPA |
| `process_semester_warnings(int)` | Batch issue warnings after semester close |
| `check_graduation_eligibility(uuid)` | Returns JSON eligibility report |
| `student_meets_prerequisites(uuid,int)` | Check prerequisite chain |
| `credits_to_level(int)` | Map credits → academic level |
| `percentage_to_grade_points(numeric)` | Convert % to 4.0 scale |
| `percentage_to_letter_grade(numeric)` | Convert % to letter grade |
| `cgpa_to_classification(numeric)` | Map CGPA to Poor/Weak/Satisfactory/Good/Very Good/Excellent |
| `refresh_attendance_summary(uuid)` | Update attendance % for enrollment |

---

## Security

### Authentication Flow
```
1. POST /auth/login → returns {accessToken (15m), refreshToken (7d)}
2. Frontend stores both in localStorage
3. Every API request: Authorization: Bearer <accessToken>
4. On 401 TOKEN_EXPIRED: frontend auto-calls /auth/refresh
5. Refresh token is rotated on every refresh (old token revoked)
6. Logout revokes refresh token in database
```

### Security Measures
- **bcrypt** password hashing (10 rounds)
- **Refresh token rotation** — stolen refresh tokens become invalid after first use
- **Rate limiting** — 200 req/15min globally, 10 login attempts/15min
- **Helmet.js** — sets 12 security headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS** — explicit origin whitelist
- **SQL injection prevention** — all queries use parameterized `$1, $2` placeholders
- **Role-based access control** — every route checks role at middleware level
- **Strong password policy** — enforced on creation and change (uppercase + lowercase + digit + special)
- **Constant-time comparison** — dummy bcrypt compare prevents timing attacks on non-existent users
- **Non-root Docker user** — backend runs as `nodejs:1001`

### Secrets to Change Before Production
```bash
# In .env:
JWT_SECRET=<generate with: openssl rand -hex 64>
JWT_REFRESH_SECRET=<generate with: openssl rand -hex 64>
DB_PASSWORD=<strong password>
GRAFANA_PASSWORD=<strong password>
```

---

## Monitoring

- **Prometheus** at `http://localhost:9090` — scrapes backend `/metrics` every 15s
- **Grafana** at `http://localhost:3050` — pre-configured with Prometheus datasource
- **Metrics exported:** Node.js default metrics (memory, CPU, event loop lag, HTTP request duration, active connections)
- **Backend `/health`** — returns DB status + timestamp; used by Docker health checks

---

## Troubleshooting

### Courses not appearing in registration
```bash
docker-compose exec postgres psql -U postgres -d student_registration_system -c "SELECT COUNT(*) FROM courses;"
# Expected: 100+
# If 0, re-run seeds:
docker-compose exec backend npm run seed
```

### Login fails for demo accounts
```bash
docker-compose exec postgres psql -U postgres -d student_registration_system -c "SELECT email, is_active FROM users;"
# Verify users exist and are active
```

### Backend crashes on startup
```bash
docker-compose logs backend --tail=50
# Check for DB connection errors or migration failures
```

### Fresh start (wipe all data)
```bash
docker-compose down -v   # -v removes named volumes (deletes DB data)
bash quick-start.sh
```

### Database direct access
```bash
docker-compose exec postgres psql -U postgres -d student_registration_system
```

### View all seed status
```bash
docker-compose exec postgres psql -U postgres -d student_registration_system -c "SELECT * FROM seed_logs;"
```

---

## Project Structure

```
fcit-srs/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js         # PG connection pool
│   │   │   └── constants.js        # ALL bylaw numeric thresholds
│   │   ├── controllers/
│   │   │   ├── auth.controller.js  # Login, refresh, logout, change-pw
│   │   │   ├── student.controller.js
│   │   │   ├── doctor.controller.js
│   │   │   └── admin.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verify + RBAC
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   └── index.js            # All API routes
│   │   ├── services/
│   │   │   ├── bylaw.service.js    # Bylaw enforcement logic
│   │   │   ├── gpa.service.js      # GPA calculations
│   │   │   └── registration.service.js  # Enrollment operations
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── migrate.js
│   │   │   └── seed.js
│   │   └── server.js               # Express app entry point
│   ├── entrypoint.sh               # Docker startup script
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── contexts/
│       │   └── AuthContext.jsx     # Global auth state
│       ├── services/
│       │   └── api.js              # Axios + auto token refresh
│       ├── App.jsx                 # All pages + routing (single-file)
│       └── index.js
├── database/
│   ├── schema.sql                  # Full schema with all constraints + functions
│   ├── enhancements.sql            # Extra views, reporting functions
│   └── seeds/
│       ├── 001_demo_users.sql      # 3 demo accounts
│       ├── 002_initial_setup.sql   # Departments, semesters, bylaw rules
│       └── 003_complete_curriculum.sql  # All 120+ courses + prerequisites
├── docker/
│   ├── nginx.conf                  # Nginx reverse proxy config
│   ├── prometheus.yml
│   └── grafana/provisioning/       # Auto-configured Grafana
├── Dockerfile.backend
├── Dockerfile.frontend
├── Dockerfile.db
├── docker-compose.yml
├── .env.example
├── quick-start.sh
└── README.md
```

---

*Built for كلية الحاسبات والمعلومات — جامعة طنطا*
*Academic Year 2024/2025 • Credit Hour System*
