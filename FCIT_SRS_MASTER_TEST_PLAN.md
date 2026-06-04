# FCIT SRS — Master SDLC Test Plan (200+ Test Cases)
**Faculty of Computers and Informatics, Tanta University — UniSmart System**  
**Version:** 2.0 | **Date:** 2026-05-11 | **Total Test Cases:** 215

---

## 📋 Bug Lifecycle Process

```
DISCOVERED → LOGGED (severity, steps, expected, actual, root cause)
     ↓
REPRODUCED (confirm on clean Docker state)
     ↓
ROOT CAUSE ANALYSIS (frontend / backend / DB layer)
     ↓
FIX APPLIED (file:line documented)
     ↓
VERIFIED (re-run TC, confirm pass)
     ↓
CLOSED → Added to regression suite → .claude.md updated
```

**Severity Levels:**
| Level | Badge | Definition | Response |
|---|---|---|---|
| CRITICAL | 🔴 | System down / data loss / security breach / bylaw bypass | Fix same session |
| HIGH | 🟠 | Core workflow broken / bylaw not enforced / RBAC failure | Fix before release |
| MEDIUM | 🟡 | Feature incomplete, workaround exists | Next sprint |
| LOW | 🟢 | UI glitch, cosmetic, typo | Backlog |

---

## 📦 Test Environments

```bash
# Start full stack
docker compose up -d --build

# Demo credentials
Admin:   admin@fci.tanta.edu.eg     / Admin@2026!
Doctor:  dr.ahmed@fci.tanta.edu.eg  / Doctor@2026!
Student: s.2024cs001@fci.tanta.edu.eg / Student@2026!

# Direct DB access
docker exec -it fcit-srs-postgres psql -U fcit_user -d fcit_srs

# Reset to seed state
docker compose down -v && docker compose up -d --build
```

---

## PHASE 1 — Infrastructure & DevOps (TC-001 to TC-020)

### TC-001 🔴 Docker Full Stack Startup
**Steps:** `docker compose up -d --build` → wait 90s → `docker compose ps`  
**Expected:** postgres(healthy), backend(running), frontend(running), prometheus(running), grafana(running)  
**Bug Pattern:** Backend starts before postgres is ready → connection refused on first request

### TC-002 🔴 PostgreSQL Healthcheck Gate
**Steps:** Check docker compose logs; backend must not log "connected to DB" before postgres is healthy  
**Expected:** `condition: service_healthy` properly gates backend startup  
**Verify:** `docker compose logs backend | head -5` shows no DB error on start

### TC-003 🔴 All 20+ DB Tables Created
```sql
SELECT count(*) FROM information_schema.tables WHERE table_schema='public';
```
**Expected:** ≥ 20 tables including: users, students, doctors, departments, courses, semesters, academic_years, course_offerings, enrollments, attendance_sessions, attendance_records, attendance_summary, semester_gpa_records, academic_warnings, notifications, announcements, refresh_tokens, course_prerequisites, bylaw_rules, audit_logs

### TC-004 🔴 Demo Seed Data
```sql
SELECT count(*) FROM users;      -- ≥ 9
SELECT count(*) FROM courses;    -- ≥ 40
SELECT count(*) FROM students;   -- ≥ 5
SELECT count(*) FROM doctors;    -- ≥ 3
SELECT count(*) FROM semesters;  -- ≥ 2
```

### TC-005 🟠 DB Views Created
```sql
SELECT viewname FROM pg_views WHERE schemaname='public';
```
**Expected:** v_student_transcript, v_doctor_courses, v_graduation_eligibility, v_student_schedule

### TC-006 🔴 DB Functions & Triggers Exist
```sql
SELECT routine_name FROM information_schema.routines WHERE routine_schema='public';
```
**Expected:** calculate_student_cgpa, check_prerequisites, process_semester_warnings, update_student_level, finalize_enrollment_grade

### TC-007 🔴 Nginx SPA Routing (no 404 on deep link)
**Steps:** Navigate directly to `http://localhost:8080/admin/students`  
**Expected:** React app loads (not Nginx 404)  
**Root Cause if fails:** `try_files $uri $uri/ /index.html` missing in nginx.conf

### TC-008 🔴 Nginx API Proxy
**Steps:** `curl http://localhost:8080/api/v1/health`  
**Expected:** `{"status":"healthy","database":"connected"}`

### TC-009 🔴 JWT Secrets Non-Empty
**Steps:** `docker exec fcit-srs-backend env | grep JWT`  
**Expected:** Both JWT_ACCESS_SECRET and JWT_REFRESH_SECRET ≥ 32 chars, not default "secret"

### TC-010 🟠 Volume Persistence After Restart
**Steps:** Create user via API → `docker compose restart backend` → query user again  
**Expected:** Data persists (postgres_data volume survives restart)

### TC-011 🟠 Prometheus Scraping Backend
**Steps:** `curl http://localhost:9090/api/v1/targets`  
**Expected:** fcit-srs-backend target state="up"

### TC-012 🟢 Grafana Dashboard Auto-Provisioned
**Steps:** Login to `http://localhost:3050` (admin/admin123)  
**Expected:** "FCIT SRS Overview" dashboard visible with at least 1 panel

### TC-013 🟠 Backend Health Endpoint Response Time
**Steps:** `curl -w "%{time_total}" http://localhost:3000/health`  
**Expected:** response_time < 0.1s  
**Bug Indicator:** DB connection pool exhausted

### TC-014 🟠 CORS Headers Present
**Steps:** `curl -H "Origin: http://localhost:3001" http://localhost:3000/api/v1/health -v`  
**Expected:** `Access-Control-Allow-Origin` header present

### TC-015 🟠 Rate Limiter Active
**Steps:** Send 20 rapid requests without token to `/api/v1/auth/login`  
**Expected:** `429 Too Many Requests` after threshold  
**Bylaw Impact:** Prevents brute-force on student/staff accounts

### TC-016 🟠 Request Logging (Audit Trail)
**Steps:** Make any authenticated API call; check `audit_logs` table  
**Expected:** Row inserted with user_id, action, timestamp, ip_address

### TC-017 🟢 Compression Enabled
**Steps:** `curl -H "Accept-Encoding: gzip" http://localhost:3000/api/v1/admin/students -v`  
**Expected:** `Content-Encoding: gzip` in response headers

### TC-018 🟠 Environment Separation (.env not committed)
**Steps:** `ls /home/claude/project/fcit-srs/.env` in git status  
**Expected:** `.env` in `.gitignore`, `.env.example` present with dummy values

### TC-019 🟢 Prometheus Metrics Counter Increments
**Steps:** Make 5 API calls → query `fcit_srs_http_requests_total`  
**Expected:** Counter > previous value

### TC-020 🟠 Docker Build Determinism
**Steps:** Build twice from clean state; compare image digests  
**Expected:** Same result; no random seeds in Dockerfiles

---

## PHASE 2 — Authentication & Security (TC-021 to TC-050)

### TC-021 🔴 Login Admin — Valid Credentials
**Steps:** POST `/api/v1/auth/login` `{email:"admin@fci.tanta.edu.eg", password:"Admin@2026!"}`  
**Expected:** `200` `{success:true, data:{accessToken, refreshToken, user:{role:"admin"}}}`

### TC-022 🔴 Login Doctor — Valid Credentials
**Steps:** POST with doctor credentials  
**Expected:** `200` `{data:{user:{role:"doctor"}}}`

### TC-023 🔴 Login Student — Valid Credentials  
**Expected:** `200` `{data:{user:{role:"student"}, profile:{studentCode, specialization, cgpa}}}`

### TC-024 🟠 Login — Wrong Password
**Expected:** `401` `{success:false, message:"Invalid email or password"}`  
**Security:** Same message for wrong password and nonexistent email (no enumeration)

### TC-025 🟠 Login — Nonexistent Email
**Expected:** `401` with identical message to TC-024 and identical response time (timing-safe)

### TC-026 🟠 Login — Inactive Account
**Steps:** Admin deactivates user → attempt login  
**Expected:** `401` "Account is disabled"

### TC-027 🔴 Login — Response Contains mustChangePw Flag
**Steps:** Check new user login response  
**Expected:** `user.mustChangePw === true` for newly created users

### TC-028 🔴 Frontend Login — Valid Flow
**Steps:** Open /login → enter admin demo → click تسجيل الدخول  
**Expected:** Redirected to /admin; TopBar shows fullNameAr; localStorage has accessToken

### TC-029 🔴 Frontend Login — mustChangePw Redirect
**Steps:** Create new user (mustChangePw=true) → login  
**Expected:** Redirected to /change-password, NOT to /admin

### TC-030 🔴 Frontend Login — Cairo Font Loads
**Steps:** Inspect font-family on any Arabic text  
**Expected:** Computed font = "Cairo"; Arabic text renders correctly RTL

### TC-031 🟠 Frontend Login — Demo Buttons Fill Form
**Steps:** Click "مسؤول" demo button  
**Expected:** email and pw inputs filled with admin credentials

### TC-032 🟠 Token Refresh — Valid Token
**Steps:** POST `/api/v1/auth/refresh` `{refreshToken:"<valid>"}`  
**Expected:** `200` with new `accessToken` and ROTATED `refreshToken` (old one invalidated)

### TC-033 🔴 Token Refresh — Token Reuse Attack
**Steps:** Refresh token once → try to use OLD refresh token again  
**Expected:** `401` — token rotation security prevents reuse

### TC-034 🟠 Token Refresh — Expired Token
**Expected:** `401`

### TC-035 🔴 Protected Route — No Token
**Steps:** GET `/api/v1/student/dashboard` without Authorization header  
**Expected:** `401`

### TC-036 🔴 Protected Route — Malformed Token
**Steps:** GET with `Authorization: Bearer invalid_token`  
**Expected:** `401`

### TC-037 🔴 RBAC — Student Accessing Admin Route
**Steps:** GET `/api/v1/admin/dashboard` with student JWT  
**Expected:** `403`

### TC-038 🔴 RBAC — Student Accessing Doctor Route
**Steps:** GET `/api/v1/doctor/courses` with student JWT  
**Expected:** `403`

### TC-039 🔴 RBAC — Doctor Accessing Admin Route
**Steps:** GET `/api/v1/admin/students` with doctor JWT  
**Expected:** `403`

### TC-040 🔴 RBAC — Doctor Accessing Student Route
**Steps:** GET `/api/v1/student/transcript` with doctor JWT  
**Expected:** `403`

### TC-041 🔴 RBAC — Frontend Sidebar Shows Correct Links
**Steps:** Login as each role; check right sidebar links  
**Expected:**
- Admin: 8 links (طلاب, مقررات, مستخدمون, فصول, تسجيل, تقارير, إعلانات, إشعارات)
- Doctor: 3 links (لوحة التحكم, مقرراتي, إشعارات)
- Student: 6 links (لوحة التحكم, تسجيل المقررات, جدولي, كشف الدرجات, حالة التخرج, إشعارات)

### TC-042 🟠 Change Password — Valid Flow
**Steps:** PUT `/api/v1/auth/change-password` `{currentPassword, newPassword}`  
**Expected:** `200`; old refresh tokens revoked; mustChangePw = false

### TC-043 🟠 Change Password — Wrong Current Password
**Expected:** `401`

### TC-044 🟠 Change Password — Weak New Password
**Steps:** Try `newPassword:"abc"`  
**Expected:** `422` validation error — min 8 chars with mixed case, digit, special char

### TC-045 🔴 Change Password — Frontend Form Validates Match
**Steps:** Enter mismatched confirm password → submit  
**Expected:** Toast error "كلمتا المرور غير متطابقتين"; no API call made

### TC-046 🟠 Logout — Refresh Token Revoked
**Steps:** POST `/api/v1/auth/logout` → attempt refresh with old token  
**Expected:** `401` on refresh attempt; `refresh_tokens` row deleted from DB

### TC-047 🟠 Frontend Logout — All State Cleared
**Steps:** Click logout in TopBar profile dropdown  
**Expected:** Redirected to /login; localStorage.clear() called; cannot navigate back to protected route

### TC-048 🟠 Frontend Profile Dropdown
**Steps:** Click user avatar in TopBar  
**Expected:** Dropdown shows: user fullNameAr, email, "تغيير كلمة المرور" link, logout button

### TC-049 🟠 Frontend Notification Bell — Badge Count
**Steps:** Create unread notification for logged-in user  
**Expected:** Red badge with count appears on bell icon in TopBar; refreshes every 30s

### TC-050 🟢 JWT — Token Expiry in Payload
**Steps:** Decode the accessToken JWT  
**Expected:** exp claim = (now + 15 minutes); iat, role, userId claims present

---

## PHASE 3 — Admin Role Full Workflow (TC-051 to TC-095)

### TC-051 🟠 Admin Dashboard — Loads All Stats
**Steps:** Login as admin → /admin  
**Expected:** 4 stat cards: totalStudents, totalDoctors, totalCourses, activeWarnings with real DB values

### TC-052 🟠 Admin Dashboard — Recent Warnings Table
**Expected:** Table shows students with CGPA < 2.0; link to student detail

### TC-053 🟠 Admin Students List — Pagination
**Steps:** GET `/api/v1/admin/students?page=1&limit=15`  
**Expected:** Array of students + `{pagination:{page, limit, total, hasMore}}`

### TC-054 🟠 Admin Students List — Search by Name
**Steps:** GET `/api/v1/admin/students?search=Ahmed`  
**Expected:** Only students whose fullNameAr or fullNameEn contains "Ahmed"

### TC-055 🟠 Admin Students List — Search by Student Code
**Steps:** GET `/api/v1/admin/students?search=2024CS`  
**Expected:** Students with matching student code

### TC-056 🟠 Admin Students List — CGPA Color Coding in UI
**Expected:** CGPA < 2.0 = red text; ≥ 3.0 = green text; 2.0–3.0 = orange

### TC-057 🟠 Admin Student Detail — Loads Full Profile
**Steps:** Click "تفاصيل" → /admin/students/:id  
**Expected:** 5 stat boxes (code, specialization, level, CGPA, warnings); 3 tabs visible

### TC-058 🟠 Admin Student Detail — Overview Tab: GPA History Bar Chart
**Expected:** Visual bar chart with one bar per semester; bars colored by GPA level; CGPA values labelled

### TC-059 🟠 Admin Student Detail — Overview Tab: Graduation Eligibility
**Expected:** 6 checklist items with ✓/✗; honorsEligible field shown; progress bar

### TC-060 🟠 Admin Student Detail — Transcript Tab
**Expected:** Grouped by semester; each course shows grade pill (A+, B, etc.); grade points shown

### TC-061 🟠 Admin Student Detail — Enrollment Tab: Enroll Override
**Steps:** Select semester → offerings populate → select offering → click ✓ تسجيل  
**Expected:** `201`; enrollment created bypassing bylaw checks; list refreshes

### TC-062 🟠 Admin Student Detail — Enrollment Tab: Force Drop
**Steps:** Click "حذف" on active enrollment  
**Expected:** Confirm dialog → `DELETE` call → enrollment removed; list refreshes

### TC-063 🟠 Admin Users — List with Role Filter
**Steps:** GET `/api/v1/admin/users?role=student`  
**Expected:** Only student-role users returned

### TC-064 🟠 Admin Users — Create Student
**Steps:** Fill form (email, password, fullNameAr, specialization CS, enrollmentYear 2024) → submit  
**Expected:** `201`; user + student profile created; mustChangePw = true; listed in users table

### TC-065 🟠 Admin Users — Create Doctor
**Steps:** Fill form (role=doctor, email, academicTitle=Dr., departmentId=...)  
**Expected:** `201`; doctor profile created with department link

### TC-066 🟠 Admin Users — Create Admin
**Steps:** Fill form (role=admin)  
**Expected:** `201`; admin user created with no student/doctor profile

### TC-067 🟠 Admin Users — Duplicate Email Rejected
**Steps:** Submit form with email that already exists  
**Expected:** `409` toast error "البريد الإلكتروني مسجل مسبقاً"

### TC-068 🟠 Admin Semesters — List
**Steps:** GET `/api/v1/admin/semesters`  
**Expected:** Array with yearLabel, semesterType, status, registrationStart, registrationEnd

### TC-069 🟠 Admin Semesters — Create New (IT-1 fix)
**Steps:** Fill semester form (yearLabel, semesterType=fall, label, startDate, endDate, regStart, regEnd) → submit  
**Expected:** `201`; semester appears in list with status=upcoming; academic_year auto-created

### TC-070 🔴 Admin Semesters — Status Lifecycle: upcoming → registration
**Steps:** Change dropdown to "registration"  
**Expected:** `PATCH` call succeeds; status updates; students can now register

### TC-071 🔴 Admin Semesters — Status Lifecycle: registration → active
**Expected:** Status updates; add/drop window closes; students cannot drop anymore

### TC-072 🔴 Admin Semesters — Status Lifecycle: active → grading
**Expected:** Status updates; doctors can now enter grades; "إنهاء الفصل" button appears

### TC-073 🔴 Admin Semesters — Finalize Semester Button (IT-3 fix)
**Steps:** Semester in "grading" status → click "🏁 إنهاء الفصل" → confirm dialog  
**Expected:**
- GPA computed for all enrolled students
- academic_warnings issued where CGPA < 2.0 (except first semester students)
- consecutive_warnings incremented
- Dismissal triggered for students with 4+ consecutive or 6+ total warnings
- Notifications sent to affected students
- Toast shows count: "X إنذار، Y طالب"

### TC-074 🔴 Admin Finalize — First Semester Exempt from Warning
**Setup:** Student in very first semester with CGPA = 1.5  
**After finalize:** No warning row in academic_warnings; total_warnings unchanged

### TC-075 🔴 Admin Finalize — Dismissal After 4 Consecutive Warnings
**Setup:** Student with consecutive_warnings = 3; CGPA = 1.9 this semester  
**After finalize:** academic_status = "dismissed"; dismissed notification sent

### TC-076 🟠 Admin Courses — List with Level Filter
**Steps:** Select "الثاني" from level dropdown  
**Expected:** Only level=2 courses shown

### TC-077 🟠 Admin Courses — Create Course
**Steps:** Fill form (code=TEST101, nameAr, nameEn, credits=3, level=1, category=basic_computing, isMandatory=true)  
**Expected:** `201`; course appears in list; toggles correctly between إجباري/اختياري

### TC-078 🟠 Admin Courses — Duplicate Code Rejected
**Steps:** Create course with code that already exists  
**Expected:** `409` error toast

### TC-079 🟠 Admin Registration — Semester Selection & Status Toggle
**Steps:** Select semester → see current status with date range → click status button  
**Expected:** Status changes; toast confirms

### TC-080 🟠 Admin Reports — GPA Distribution Chart
**Steps:** Navigate to /admin/reports → Distribution tab  
**Expected:** 5 colored cards (ممتاز/جيد جداً/جيد/مقبول/ضعيف) with counts; progress bars

### TC-081 🟠 Admin Reports — Top Students
**Steps:** Click "أوائل الطلاب" tab  
**Expected:** Table sorted by CGPA descending; specialization badges; GPA badges

### TC-082 🟠 Admin Reports — Dismissed Students
**Steps:** Click "الفصل الأكاديمي" tab  
**Expected:** Students with academic_status=dismissed; red CGPA values

### TC-083 🟠 Admin Announcements — Create Pinned for Students
**Steps:** Fill form (title, body, targetRole=student, isPinned=true)  
**Expected:** `201`; announcement stored; pinned badge shown; student notifications dispatched

### TC-084 🟠 Admin Announcements — Target Role Filter
**Expected:** Only students see student-targeted announcements in their notifications

### TC-085 🟠 Admin Notifications — Shows Admin-Targeted Notifications
**Steps:** Navigate to /admin/notifications  
**Expected:** Notifications for admin role; mark-as-read works; unread badge updates

### TC-086 🟠 Admin Users — Deactivate Account
**Steps:** Toggle user isActive to false  
**Expected:** User cannot login; `is_active=false` in DB

### TC-087 🟠 Admin Users — Password Reset
**Expected:** `POST /api/v1/admin/users/{id}/reset-password` → `200`; mustChangePw=true; old tokens revoked

### TC-088 🟠 Admin Student Detail — Warnings History
**Steps:** View student with 2+ warnings  
**Expected:** Warnings table shows: semester label, warning type, CGPA at warning, consecutive count

### TC-089 🟠 Admin — Enrollment Override Creates Audit Log
**Steps:** Admin enrolls student manually  
**Expected:** Row in audit_logs with action="admin_enroll", admin user_id, student_id, offering_id

### TC-090 🟠 Admin Semesters — Create: Correct Add/Drop Deadline Auto-Calculation
**Steps:** Create semester with registrationStart = 2026-09-01  
**Expected:** add_drop_deadline = 2026-09-15 (14 days later; auto-calculated)

### TC-091 🟠 Admin Semesters — Create: Correct Withdrawal Deadline Auto-Calculation
**Expected:** withdrawal_deadline = startDate + 49 days (7 weeks)

### TC-092 🟠 Admin Offerings — Create Offering
**Steps:** POST `/api/v1/admin/offerings` `{semesterId, courseId, doctorId, section:"A", capacity:60}`  
**Expected:** `201`; doctor sees course in dashboard; enrolled_count=0

### TC-093 🟠 Admin Offerings — Capacity Validation
**Steps:** Create offering with capacity=0  
**Expected:** `422` validation error

### TC-094 🟢 Admin — Sidebar Collapse Persists Navigation
**Steps:** Collapse sidebar → navigate to another page  
**Expected:** Sidebar stays collapsed after navigation

### TC-095 🟢 Admin — TopBar Search Input (Future Feature)
**Steps:** Type in search box  
**Expected:** Input works; no console errors (functional when search API implemented)

---

## PHASE 4 — Doctor Role Full Workflow (TC-096 to TC-130)

### TC-096 🟠 Doctor Dashboard — My Courses Cards
**Steps:** Login as doctor → /doctor  
**Expected:** 3 stat cards (مقرراتي, إجمالي الطلاب, درجات منتظرة); courses table with correct data

### TC-097 🟠 Doctor Dashboard — Pending Grades Count
**Expected:** pendingGrades = enrollments where total_grade IS NULL and status=active in current semester

### TC-098 🟠 Doctor Courses Page — List All Assigned Courses
**Steps:** /doctor/courses  
**Expected:** All offerings assigned to this doctor; offering_id used for roster link (IT-2 fix)

### TC-099 🔴 Doctor Courses — Roster Link Uses offering_id Not course_id
**Steps:** Click "عرض الطلاب" → URL = /doctor/courses/{offering_id}  
**Expected:** Roster loads correctly (not 404 or wrong data)

### TC-100 🟠 Doctor Roster — Shows All Enrolled Students
**Steps:** GET `/api/v1/doctor/offerings/{offeringId}/roster`  
**Expected:** All students enrolled in this offering with current grade components

### TC-101 🟠 Doctor Roster — Info Cards (code, section, count, semester)
**Expected:** 4 info cards at top of roster page with correct values from API

### TC-102 🟠 Doctor Roster — Grade Entry: Valid Full Grades
**Steps:** Enter {midterm:18, coursework:9, practical:8, final_exam:52} → Save  
**Expected:** `PATCH` succeeds; total=87; letter_grade=B+; grade_points=3.2

### TC-103 🔴 Doctor Roster — Grade Entry: Final < 30% of 60 = Fail (Art. 16)
**Steps:** Enter {midterm:20, coursework:10, practical:10, final_exam:15} (15/60 = 25%)  
**Expected:** Final is saved; when semester finalized → letter_grade=F  
**Bylaw:** Art. 16: "Minimum 30% of final exam grade" (18/60)

### TC-104 🔴 Doctor Roster — Grade Entry: Total < 40% = Fail (Art. 16)
**Steps:** Enter grades totaling 38%  
**Expected:** letter_grade=F when finalized (threshold is 40% per bylaw, not 50%)

### TC-105 🟠 Doctor Roster — Grade Entry: Per-Component Validation
**Steps:** Enter midterm=25 (exceeds max 20)  
**Expected:** `422` validation error "Midterm cannot exceed 20"

### TC-106 🟠 Doctor Roster — Grade Entry: Empty = No Change
**Steps:** Leave all fields empty → Save  
**Expected:** Existing grades unchanged (null stays null); no error

### TC-107 🟠 Doctor Roster — Grade Lock After Finalization
**Steps:** Finalize semester → attempt grade entry  
**Expected:** `403` "Grades are locked for this enrollment"

### TC-108 🟠 Doctor Roster — Bulk Grade Save
**Steps:** Enter grades for 5 students → save each individually  
**Expected:** Each save independent; failure on one doesn't block others

### TC-109 🟠 Doctor Roster — Grade Table Shows Running Total
**Expected:** Total column updates with computed sum from component inputs

### TC-110 🟠 Doctor Roster — Tabs: Switch Grades ↔ Attendance
**Steps:** Click "الحضور والغياب" tab  
**Expected:** Attendance tab loads; existing sessions shown; "تسجيل جلسة حضور" button visible

### TC-111 🟠 Doctor Attendance — Record New Session (IT-8 fix)
**Steps:** Click "+ تسجيل جلسة حضور" → set date/type → mark students → "حفظ الحضور"  
**Expected:** `201`; session appears in sessions table; attendance_summary updated in DB

### TC-112 🟠 Doctor Attendance — "حضور الكل" Button
**Steps:** Click "حضور الكل"  
**Expected:** All student buttons flip to green "حاضر ✓"

### TC-113 🟠 Doctor Attendance — "غياب الكل" Button
**Steps:** Click "غياب الكل"  
**Expected:** All student buttons flip to red "غائب ✗"

### TC-114 🟠 Doctor Attendance — Individual Toggle
**Steps:** Click one student's button  
**Expected:** That student's status flips; others unchanged

### TC-115 🟠 Doctor Attendance — Sessions History Table
**Expected:** Table shows: date, session type, present count, absent count, attendance %

### TC-116 🔴 Doctor Attendance — Attendance % < 42% Shows Danger Badge
**Expected:** Sessions table shows red "خطر الحرمان" badge when cumulative < 42%

### TC-117 🟠 Doctor Notifications — Role-Isolated
**Steps:** GET `/api/v1/doctor/notifications` with doctor JWT  
**Expected:** Only this doctor's notifications (user_id filter enforced)

### TC-118 🟠 Doctor Notifications — Mark Single as Read
**Steps:** Click unread notification  
**Expected:** Blue dot disappears; is_read=true in DB; unread count decrements

### TC-119 🟠 Doctor Notifications — Mark All as Read
**Steps:** Click "تعليم الكل كمقروء"  
**Expected:** All notifications read; bell badge disappears; toast confirms

### TC-120 🔴 Doctor — Cannot Read Another Doctor's Roster
**Steps:** Use Doctor A's JWT to GET `/api/v1/doctor/offerings/{offeringId_of_Doctor_B}/roster`  
**Expected:** `403` or filtered empty response (data isolation)

### TC-121 🟠 Doctor Dashboard — No Courses in Off-Semester
**Setup:** No offerings for current active semester  
**Expected:** Empty state "لا توجد مقررات حالياً" shown

### TC-122 🟠 Doctor Roster — Student List Empty Offering
**Setup:** Offering with no enrolled students  
**Expected:** Empty state "لا يوجد طلاب"; no JS errors

### TC-123 🟠 Doctor — Grade Entry Appears on Student Transcript
**Steps:** Doctor enters grade → finalize semester → check student transcript  
**Expected:** Grade appears in transcript with correct letter grade and GPA impact

### TC-124 🟠 Doctor Attendance — Date Validation
**Steps:** Try to record attendance with future date  
**Expected:** `400` validation error or frontend blocks future dates

### TC-125 🟠 Doctor Attendance — Duplicate Session Date
**Steps:** Record attendance for same date and type twice  
**Expected:** `409` "Attendance already recorded for this session date and type"

### TC-126 🟠 Doctor — Sidebar Collapse / Expand
**Steps:** Click › button to collapse sidebar  
**Expected:** Sidebar collapses to 72px; only icons visible; content expands

### TC-127 🟢 Doctor — Course Offerings Show Capacity vs Enrolled
**Expected:** "38/60 مسجل" display shows current occupancy

### TC-128 🟢 Doctor — Grade Entry: A+ Grade Scale Correct (Art. 17)
**Steps:** Enter total = 97%  
**Expected:** letter_grade=A+, grade_points=4.0 (bylaw: 96%+ = A+)

### TC-129 🟢 Doctor — Grade Entry: D- Grade Scale (Art. 17)
**Steps:** Enter total = 52% (50-54%)  
**Expected:** letter_grade=D-, grade_points=1.0

### TC-130 🟢 Doctor — Grade Entry: A Grade Scale (Art. 17)
**Steps:** Enter total = 93% (92-95%)  
**Expected:** letter_grade=A, grade_points=3.7

---

## PHASE 5 — Student Role Full Workflow (TC-131 to TC-165)

### TC-131 🟠 Student Dashboard — Stat Cards Correct
**Steps:** Login as student → /student  
**Expected:** 4 cards with real values: CGPA (3 decimal), totalCredits, currentLevel, warnings count

### TC-132 🟠 Student Dashboard — Current Schedule Table
**Expected:** Shows courses from active/grading semester; doctor names; attendance % where available

### TC-133 🟠 Student Dashboard — Academic Warning Alert
**Setup:** Student with active warnings  
**Expected:** Warning alert shown with count and description (bylaw Art. 25)

### TC-134 🔴 Student Course Registration — Correct Semester Auto-Selected
**Steps:** /student/courses; check semester dropdown  
**Expected:** Semester with status="registration" auto-selected; if none → most recent

### TC-135 🔴 Student Course Registration — Available Courses Load
**Expected:** Each course shows: canRegister, registerBlockReason, prerequisites, level, credits, enrolled/capacity

### TC-136 🔴 Student Registration — Enroll in Available Course
**Steps:** Click "اضافة" on canRegister=true course  
**Expected:** `201`; course moves to "المواد المختارة"; enrolled_count increments in DB

### TC-137 🔴 Student Registration — Already Enrolled Shows as Enrolled
**Expected:** Course with alreadyRegistered=true shows in selected panel; no duplicate enrollment possible

### TC-138 🔴 Student Registration — Registration Window Closed
**Setup:** Semester status = "active" (not "registration")  
**Expected:** canRegister=false for all courses; "مغلق" badge shown; registration attempt returns `400`

### TC-139 🟠 Student Registration — Drop Course (During Add/Drop)
**Steps:** Click "حذف" during add/drop window  
**Expected:** `200`; course removed from selected; enrolled_count decrements

### TC-140 🟠 Student Registration — Withdrawal After Add/Drop Window (Art. 13)
**Setup:** After add/drop deadline but before withdrawal deadline (week 7)  
**Expected:** Drop button still present but triggers withdrawal (W grade); enrollment status="withdrawn"

### TC-141 🟠 Student Registration — Confirm Button Works
**Steps:** Select courses → click "تأكيد التسجيل"  
**Expected:** Spinner → success toast "تم تأكيد التسجيل"; button re-enables after 900ms

### TC-142 🟠 Student Registration — Total Credits Counter
**Expected:** "إجمالي الساعات: X" updates as courses added/removed; max 18 shown

### TC-143 🟠 Student Registration — Graduation Progress Bar
**Expected:** Progress bar fills correctly (e.g., 114/132 = 86.4% fill); green color

### TC-144 🟠 Student Registration — Graduation Checklist
**Expected:** 4 items shown; مكتمل (green) / غير مكتمل (red); honors badge if eligible

### TC-145 🟠 Student Schedule — Loads Current Semester
**Steps:** /student/schedule  
**Expected:** Table with courses: code, name, doctor, section, attendance count, absence count, percentage

### TC-146 🔴 Student Schedule — Attendance % Color Coding
**Expected:** % < 42% = red + "خطر الحرمان" badge; 42-75% = orange; > 75% = green

### TC-147 🟠 Student Schedule — Semester Selector Works
**Steps:** Change semester in dropdown  
**Expected:** Table reloads for selected semester

### TC-148 🟠 Student Transcript — All Semesters Listed
**Steps:** /student/transcript  
**Expected:** Grouped by semester; semester GPA shown; cumulative GPA in header cards

### TC-149 🟠 Student Transcript — Grade Pills Correct Colors
**Expected:** A+ = dark green; B = blue; C = yellow; D = light red; F = pink

### TC-150 🟠 Student Transcript — Grade Points Shown
**Expected:** Each course shows grade_points (e.g., 3.7 for A)

### TC-151 🟠 Student Graduation — Eligibility Checklist Complete
**Steps:** /student/graduation  
**Expected:** 5 checklist items; progress bar; eligible/ineligible banner

### TC-152 🟠 Student Graduation — Honors Eligibility Flag
**Setup:** Student with CGPA ≥ 3.0, all grades ≥ B (3.0), ≤ 8 semesters, no failures  
**Expected:** 🏆 banner visible "مؤهل للتخرج بمرتبة الشرف"

### TC-153 🟠 Student Graduation — Progress Bar Accurate
**Setup:** Student with 114 credits out of 132  
**Expected:** Bar = 86.4% width; "114/132" label

### TC-154 🟠 Student Notifications — Unread Count in Bell
**Expected:** Bell badge shows correct count; refreshes every 30s via polling

### TC-155 🟠 Student Notifications — Mark Single Read
**Steps:** Click unread notification  
**Expected:** Blue dot removed; is_read=true; bell badge decrements

### TC-156 🟠 Student Notifications — Mark All Read
**Expected:** All dots gone; bell badge = 0; toast confirms

### TC-157 🟠 Student Notifications — Warning Notification Received
**Steps:** Finalize semester where student CGPA < 2.0  
**Expected:** Notification appears with type="warning", Arabic title, CGPA value in message

### TC-158 🟠 Student Notifications — Enrollment Notification
**Steps:** Student registers for a course  
**Expected:** Notification type="enrollment" created with course name

### TC-159 🔴 Student — Cannot Access Admin Routes
**Steps:** Navigate to /admin with student role  
**Expected:** Redirected back to /student (Guard component redirects)

### TC-160 🔴 Student — Cannot Access Doctor Routes
**Steps:** Navigate to /doctor  
**Expected:** Redirected to /student

### TC-161 🟠 Student — Correct Level Displayed After Credit Threshold
**Setup:** Student passes credits pushing them from sophomore → junior (66 credits)  
**Expected:** currentLevel = 3; dashboard shows "الثالث"

### TC-162 🟠 Student — Sidebar Correct 6 Links
**Expected:** All 6 student nav links visible and active link highlighted blue

### TC-163 🟠 Student — Collapsed Sidebar Shows Icons Only
**Steps:** Click collapse button  
**Expected:** Labels hidden; emoji icons remain; all links still functional

### TC-164 🟢 Student — Profile Dropdown Shows Student Code
**Expected:** TopBar profile dropdown shows studentCode (e.g., 2024CS0001)

### TC-165 🟢 Student — Forgot Password Flow
**Steps:** Click "نسيت كلمة المرور؟" → enter email → submit  
**Expected:** Success message shown (simulated); no actual API error

---

## PHASE 6 — Bylaw Enforcement (TC-166 to TC-200)

### TC-166 🔴 Art. 11 — Min 2 Credits per Semester
**Steps:** Try to register only 1-credit course  
**Expected:** Registration allowed; but trying to drop to below 2 during add/drop → `400`

### TC-167 🔴 Art. 11 — Max Credits by CGPA: CGPA < 2.0 → Max 20
**Setup:** Student with CGPA = 1.8  
**Steps:** Attempt to register courses totaling 21 credits  
**Expected:** `400` "Exceeds maximum allowed credit hours for your CGPA level (20)"

### TC-168 🔴 Art. 11 — Max Credits by CGPA: CGPA 2.0–2.5 → Max 18
**Setup:** Student with CGPA = 2.3  
**Steps:** Register 19 credits  
**Expected:** `400`

### TC-169 🔴 Art. 11 — Max Credits by CGPA: CGPA ≥ 3.0 → Max 20
**Setup:** Student with CGPA = 3.2  
**Steps:** Register 20 credits  
**Expected:** `201` (allowed)

### TC-170 🔴 Art. 11 — Summer Semester Max 7 Credits
**Setup:** Registration open for summer semester  
**Steps:** Register 8 credits  
**Expected:** `400` "Summer semester maximum is 7 credit hours"

### TC-171 🔴 Art. 12 — Add/Drop Deadline Enforced (End of Week 2)
**Setup:** add_drop_deadline has passed  
**Steps:** Attempt to drop a course (not withdraw)  
**Expected:** `400` "Add/drop deadline has passed. Use course withdrawal instead."

### TC-172 🔴 Art. 13 — Withdrawal Deadline Enforced (End of Week 7)
**Setup:** withdrawal_deadline has passed  
**Steps:** Attempt withdrawal  
**Expected:** `400` "Withdrawal deadline has passed"

### TC-173 🔴 Art. 13 — Withdrawal Records W Grade
**Steps:** Withdraw from course within withdrawal window  
**Expected:** enrollment status="withdrawn"; letter_grade="W"; CGPA unaffected; credit hours still listed on transcript

### TC-174 🔴 Art. 13 — Cannot Withdraw Below 2 Credits
**Setup:** Student enrolled in courses totaling 3 credits; withdraw from 2-credit course  
**Expected:** `400` "Cannot withdraw; minimum 2 credit hours must remain"

### TC-175 🔴 Art. 14 — Attendance < 42% → Barred from Final Exam
**Setup:** Record attendance making student < 42% in one course  
**Steps:** After semester finalization  
**Expected:** enrollment letter_grade = "Abs"; grade_points = 0; student notified

### TC-176 🔴 Art. 14 — Attendance > 25% Absence Warning
**Setup:** Record 26% absence for a student  
**Expected:** Attendance warning notification sent before reaching 42% critical level

### TC-177 🔴 Art. 16 — Minimum Passing: 40% of Total (not 50%)
**Note:** Bylaw Art. 16 states 40% minimum; DB schema must use correct threshold  
**Steps:** Check `finalize_enrollment_grade()` function  
**Expected:** Grades in 40-49% range get D- (1.0), NOT F  
**Bug Risk:** If DB trigger uses 50% cutoff → incorrect F grades issued 🔴 CRITICAL

### TC-178 🔴 Art. 16 — Minimum Final Exam: 30% of Final Component
**Setup:** Final exam component is 60 marks; minimum = 18 marks (30% of 60)  
**Steps:** Enter final_exam_grade = 17  
**Expected:** Grade = F regardless of other components (bylaw hard floor)

### TC-179 🟠 Art. 17 — Full Grade Scale Verification
**Verify all thresholds in DB trigger or service:**

| Total % | Expected Grade | Grade Points |
|---|---|---|
| 96+ | A+ | 4.0 |
| 92-95 | A | 3.7 |
| 88-91 | A- | 3.4 |
| 84-87 | B+ | 3.2 |
| 80-83 | B | 3.0 |
| 76-79 | B- | 2.8 |
| 72-75 | C+ | 2.6 |
| 68-71 | C | 2.4 |
| 64-67 | C- | 2.2 |
| 60-63 | D+ | 2.0 |
| 55-59 | D | 1.5 |
| 50-54 | D- | 1.0 |
| < 40 | F | 0.0 |

### TC-180 🔴 Art. 18 — CGPA Weighted Average Formula
**Setup:** Student completes 2 courses: CS101 (3cr, A=3.7), CS102 (4cr, B=3.0)  
**Expected CGPA:** (3×3.7 + 4×3.0) / (3+4) = (11.1+12.0)/7 = 23.1/7 = 3.300  
**Steps:** Query `SELECT cgpa FROM students WHERE ...` after finalization  
**Verify:** Precision to 3 decimal places

### TC-181 🔴 Art. 22 — Failed Course Retake Grade Capped at B (3.0)
**Setup:** Student fails CS101 → retakes → scores A+ (4.0)  
**Expected:** For GPA purposes, capped at B (3.0), NOT 4.0; all attempts visible on transcript

### TC-182 🔴 Art. 23 — Voluntary Retake Max 3 Courses
**Setup:** Student has already improved 3 courses voluntarily (CGPA < 2.0)  
**Steps:** Try to register 4th improvement retake  
**Expected:** `400` "Maximum of 3 voluntary improvement retakes reached"

### TC-183 🔴 Art. 23 — Voluntary Retake Requires CGPA < 2.0
**Setup:** Student with CGPA = 2.5 tries to retake a passed course  
**Expected:** `400` "Voluntary retakes only allowed for students with CGPA below 2.0"

### TC-184 🔴 Art. 21 — Graduation Project Requires 85+ Credits
**Setup:** Student with 80 passed credits; tries to register PR411  
**Expected:** `400` "Graduation project requires 85+ passed credit hours (currently: 80)"

### TC-185 🔴 Art. 21 — PR412 Requires PR411 Completion
**Setup:** Student registers PR411 without completing it  
**Steps:** Try to register PR412  
**Expected:** `400` "PR412 requires completion of PR411"

### TC-186 🔴 Art. 25 — Warning Issued When CGPA < 2.0 (Semester 2+)
**Setup:** Student in semester 3; CGPA drops to 1.95 after finalization  
**Expected:** Warning inserted in academic_warnings; total_warnings+1; consecutive_warnings+1; warning notification sent; student dashboard shows warning

### TC-187 🔴 Art. 25 — First Semester Exempt (No Warning)
**Setup:** Student in semester 1; CGPA = 1.5  
**After finalize:** NO warning; total_warnings = 0; consecutive_warnings = 0

### TC-188 🔴 Art. 25 — Warning Reset When CGPA Recovers
**Setup:** Student had consecutive_warnings=2; this semester CGPA = 2.3  
**After finalize:** consecutive_warnings resets to 0; total_warnings unchanged

### TC-189 🔴 Art. 26 — Dismissal: 4 Consecutive Warnings
**Setup:** Student with consecutive_warnings=3; CGPA = 1.8 again  
**After finalize:** consecutive_warnings=4; academic_status="dismissed"; dismissal notification; cannot register next semester

### TC-190 🔴 Art. 26 — Dismissal: 6 Total (Non-Consecutive) Warnings
**Setup:** Student with total_warnings=5; consecutive_warnings=1  
**After finalize (CGPA < 2.0):** total_warnings=6; academic_status="dismissed"

### TC-191 🔴 Art. 26 — Dismissal: Exceeds 8 Semesters
**Setup:** Student has completed 8 regular semesters without graduating  
**Expected:** academic_status="dismissed" (duration-based); cannot register new semester

### TC-192 🔴 Art. 27 — Honors: CGPA ≥ 3.0 Required
**Setup:** Student with CGPA = 2.95 completing all requirements  
**Expected:** honorsEligible = false; graduation proceeds without honors

### TC-193 🔴 Art. 27 — Honors: No Failures Allowed
**Setup:** Student with CGPA = 3.2 but has one historical F grade (retook and passed)  
**Expected:** honorsEligible = false (any F in history disqualifies)

### TC-194 🔴 Art. 27 — Honors: All Grades Must Be ≥ B (3.0)
**Setup:** Student with CGPA = 3.1 but one course graded C+ (2.6)  
**Expected:** honorsEligible = false (any grade below B = 3.0 disqualifies)

### TC-195 🔴 Art. 27 — Honors: Maximum 8 Semesters
**Setup:** Student with CGPA = 3.5 but took 9 semesters  
**Expected:** honorsEligible = false

### TC-196 🔴 Prerequisite Enforcement — Cannot Register Without Passing Prereq
**Setup:** CS212 (Data Structures) requires CS112 (OOP); student hasn't passed CS112  
**Steps:** Try to register CS212  
**Expected:** `400` "Missing prerequisite: CS112"; canRegister=false in course list

### TC-197 🔴 Prerequisite Enforcement — Being Enrolled Doesn't Satisfy Strict Prereq
**Setup:** Student is currently enrolled in CS112 (not yet completed)  
**Steps:** Try to register CS212  
**Expected:** `400` — enrolled but not PASSED; strict prereq requires pass

### TC-198 🟠 Prerequisite Enforcement — Concurrent Enrollment OK for Co-Requisites
**Setup:** Course has co-requisite (not strict prereq)  
**Expected:** Registration allowed while co-requisite course is being taken simultaneously

### TC-199 🔴 Training Course — Non-Credit Bearing (Art. 20)
**Steps:** Register for TR401 (Training); complete it with P grade  
**Expected:** grade_points = null or 0; NOT counted in CGPA; IS counted in total_credits; is_credit_bearing = false

### TC-200 🟠 Art. 4 — 132 Credits Required for Graduation
**Setup:** Student with 131 credits passed; CGPA ≥ 2.0  
**Expected:** graduation-status API returns isEligible=false; creditsComplete=false

---

## PHASE 7 — API Contract & Data Integrity (TC-201 to TC-215)

### TC-201 🟠 API Response Envelope — All Endpoints Return Consistent Shape
**Expected:** Every successful response: `{success: true, data: {...}}`  
**Expected:** Every error: `{success: false, message: "...", code?: "..."}`

### TC-202 🟠 Pagination Consistent Shape
**Expected:** All paginated endpoints: `{data:{items, pagination:{page, limit, total, hasMore}}}`

### TC-203 🟠 camelCase Field Names in API Responses
**Expected:** `currentLevel` (not `current_level`), `studentCode` (not `student_code`)  
**Note:** Frontend handles both formats with `||` fallbacks as safety net

### TC-204 🔴 DB Constraint: CGPA Range 0.0–4.0
```sql
UPDATE students SET cgpa = 4.5 WHERE id = '<any>';
```
**Expected:** PostgreSQL CHECK violation

### TC-205 🔴 DB Constraint: Unique Student Code
```sql
INSERT INTO students (student_code, ...) VALUES ('2024CS0001', ...);
```
**Expected:** Unique violation error

### TC-206 🔴 DB Trigger: enrolled_count Auto-Increments
**Steps:** Enroll student via API  
**Expected:** `SELECT enrolled_count FROM course_offerings WHERE id = ...` incremented by 1

### TC-207 🔴 DB Trigger: enrolled_count Auto-Decrements on Drop
**Steps:** Drop enrollment via API  
**Expected:** enrolled_count decremented by 1

### TC-208 🔴 DB: Cannot Enroll Beyond Capacity
**Setup:** Offering with capacity=1; already 1 enrolled  
**Steps:** Try to enroll second student  
**Expected:** `400` "Course offering is at full capacity (1/1)"  
**DB Verify:** `enrolled_count` stays at 1; no phantom over-enrollment

### TC-209 🟠 Concurrent Enrollment Race Condition (No Over-Enrollment)
**Steps:** Send 2 simultaneous POST enroll requests for same last-seat offering  
**Expected:** Exactly 1 succeeds (201); 1 fails (409/400); enrolled_count = capacity, never exceeds

### TC-210 🟠 DB Function: calculate_student_cgpa() Accuracy
```sql
SELECT calculate_student_cgpa('<student_id>');
-- Should match students.cgpa column
```

### TC-211 🟠 DB Function: check_prerequisites() Returns Correct Boolean
```sql
SELECT check_prerequisites('<student_id>', '<course_id_with_prereq>');
```
**Expected:** false if prereq not passed; true if passed

### TC-212 🟠 DB View: v_student_transcript Returns All Completed Courses
```sql
SELECT * FROM v_student_transcript WHERE student_id = '<id>';
```
**Expected:** All enrolled courses with grades, sorted by semester then course_code

### TC-213 🟠 DB View: v_doctor_courses Returns Correct offering_id
```sql
SELECT offering_id FROM v_doctor_courses WHERE doctor_id = '<id>';
```
**Expected:** offering_id (not course_id) returned — critical for roster link (IT-2 fix verified here)

### TC-214 🔴 DB: FK Cascade — Deleting User Removes Student Profile
```sql
DELETE FROM users WHERE id = '<student_user_id>';
SELECT count(*) FROM students WHERE user_id = '<student_user_id>';
-- Expected: 0
```

### TC-215 🟠 DB: Audit Log — Every Admin Action Recorded
**Steps:** Perform admin actions: create user, enroll student, force drop  
**Expected:** Each action has row in audit_logs with: user_id, action, entity_type, entity_id, timestamp, ip_address

---

## 📊 Summary & Test Execution Matrix

| Phase | Test Cases | 🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW |
|---|---|---|---|---|---|
| Phase 1: Infrastructure | TC-001–020 | 5 | 9 | 0 | 6 |
| Phase 2: Auth & Security | TC-021–050 | 12 | 14 | 0 | 4 |
| Phase 3: Admin Workflow | TC-051–095 | 8 | 28 | 0 | 9 |
| Phase 4: Doctor Workflow | TC-096–130 | 8 | 18 | 0 | 9 |
| Phase 5: Student Workflow | TC-131–165 | 10 | 17 | 0 | 8 |
| Phase 6: Bylaw Enforcement | TC-166–200 | 28 | 7 | 0 | 0 |
| Phase 7: API & DB Integrity | TC-201–215 | 6 | 9 | 0 | 0 |
| **TOTAL** | **215** | **77** | **102** | **0** | **36** |

---

## 🔧 Bugs Found and Fixed in This Session

| Bug ID | Severity | Description | Fix |
|---|---|---|---|
| BUG-001 | 🔴 | Doctor roster link uses `c.id` (course_id) instead of `c.offering_id` — wrong roster loaded | IT-2: Fixed `DoctorCoursesPage` to use `c.offering_id\|\|c.offeringId\|\|c.id` |
| BUG-002 | 🟠 | Missing `POST /admin/semesters` — admin cannot create new semesters via UI | IT-1: Added `createSemester` controller + route + frontend form |
| BUG-003 | 🟠 | "Finalize Semester" button missing — GPA computation / warnings never triggered from UI | IT-3: Added 🏁 button in AdminSemestersPage with confirm dialog and result toast |
| BUG-004 | 🟠 | AdminStudentDetail showed minimal info — no GPA history chart, no eligibility, no enrollment override | IT-4+IT-7: Complete 3-tab page with GPA bar chart, eligibility checklist, enrollment CRUD |
| BUG-005 | 🟠 | SchedulePage attendance data not displayed — wrong field names from API | IT-5: Fixed field mapping for `attendancePercentage`, `absenceCount`, `attendanceCount`; added color coding |
| BUG-006 | 🟠 | Doctor attendance tab showed placeholder "قيد التطوير" — not functional | IT-8: Full `AttendanceTab` component with session recording, bulk attendance, history table |
| BUG-007 | 🟡 | AdminSemestersPage lacked create form and finalize integration | IT-3: Added full semester creation form with auto-calculated deadline dates |

---

## ✅ Sprint Execution Order (Priority)

**Sprint 1 — Must Pass Before Any Release:**
TC-001, TC-002, TC-003, TC-007, TC-008, TC-021, TC-022, TC-023, TC-035, TC-037, TC-038, TC-041, TC-070, TC-073, TC-102, TC-136, TC-177, TC-178, TC-180, TC-186, TC-189, TC-196

**Sprint 2 — Core Workflow:**
TC-004 through TC-006, TC-051 through TC-070, TC-096 through TC-130, TC-131 through TC-165

**Sprint 3 — Bylaw Complete Coverage:**
All TC-166 through TC-200

**Sprint 4 — API & DB Integrity:**
All TC-201 through TC-215

**Regression After Any Fix:**
Re-run all 🔴 CRITICAL and 🟠 HIGH cases
