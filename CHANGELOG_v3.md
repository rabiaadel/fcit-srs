# FCIT SRS — Changelog v3 (May 2026)

## New Features

### 🗂️ Curriculum Plan Management (Admin)
- New `curriculum_plans` table maps courses to program Year/Semester per specialization
- Admin UI at `/admin/curriculum` — view, add, move, remove courses from plan
- Student registration page now groups available courses by curriculum plan semester

### ⚖️ Bylaw Configuration — Superadmin Override
- New `bylaw_config` table with 21 admin-editable academic parameters
- All bylaw thresholds (attendance %, credit limits, warning CGPA, graduation credits, etc.)
  are now read from the DB at runtime — no code changes needed
- Admin UI at `/admin/bylaw-config` with live editor, bounds validation, audit trail
- Reset-to-default button per parameter

### 🏛️ Department Management
- Full CRUD for academic departments at `/admin/departments`
- Doctor and course counts shown per department

### 📅 Doctor Schedule Assignment + PDF
- Admin can assign day/time/room slots to any course offering
- Doctor notified automatically when schedule is assigned
- Doctor schedule page at `/doctor/schedule` — weekly grid view
- 🖨️ Print / PDF export generates formatted printable schedule

### 🔔 Notification Detail Modal
- Clicking any notification (all 3 roles) opens a full detail popup
- Color-coded header by notification type
- Full message body, timestamp, navigation link
- Auto-marks as read on open

### 📋 Prerequisite Management UI
- Admin can add/remove/view course prerequisites directly via API
- `GET/DELETE /api/v1/admin/courses/:id/prerequisites`

### 📊 Enhanced Reports
- GPA distribution histogram
- Top 20 students by CGPA
- Dismissed students with dismissal reason
- Enrollment statistics per semester (fill %, drops, withdrawals)

### 🔨 Enhanced Semester Creation
- Deadlines auto-calculated from `bylaw_config` (add_drop_weeks, withdrawal_weeks)
- Changes to bylaw params immediately affect next semester creation

## Bug Fixes

| Bug | Fix |
|-----|-----|
| Clicking notification showed nothing | NotificationModal with full detail popup |
| Doctor had no schedule page or PDF | DoctorSchedulePage + browser print/PDF |
| No curriculum / course hierarchy | curriculum_plans table + admin UI |
| All bylaw params hardcoded | bylaw_config table with admin override |
| No department management UI | AdminDepartmentsPage |
| Doctor roster used wrong ID (BUG-001) | Fixed to use offering_id |
| Student dashboard level/credits = null | Fixed field mapping (current_level, total_credits_passed) |
| Admin dashboard students = null | Fixed to read from data.stats |
| Graduation checklist wrong JSON path | Fixed to read data.eligibility |
| Duplicate POST /admin/semesters route | Renamed to /create-enhanced |
| bcrypt native build fails on Node 22 | Patched to bcryptjs (pure JS) |

## Database Migrations
Run `database/migration_v3.sql` on existing installations.
Docker Compose automatically runs it as `06-migration-v3.sql`.

## New Routes (85 total)
See `backend/src/routes/index.js` for full list.
Key additions: `/admin/curriculum`, `/admin/bylaw-config`, `/admin/departments`,
`/admin/offerings/:id/schedule`, `/doctor/schedule`, `/notifications/:id/detail`,
`/student/semesters/:id/courses-by-plan`

## New Scenarios
111 new usage scenarios (US-221 → US-331) documented in:
`fcit-srs-scenarios-v3-extended.md`

Combined total: 331 scenarios across all 3 actors.
