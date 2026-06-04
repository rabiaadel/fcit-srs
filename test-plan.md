# FCIT SRS — Test Plan & Test Cases
*Version 5 · May 2026*

---

## Test Strategy
**Approach:** Black-box API testing + Frontend integration testing
**Environments:** Local (Node.js + PostgreSQL 16) · Docker Compose
**Seed state:** 1 admin · 3 doctors · 5 students · 128 courses · 6 semesters

---

## TC-001 to TC-030 — Authentication

| ID | Description | Method | Endpoint | Expected |
|---|---|---|---|---|
| TC-001 | Admin login correct credentials | POST | /auth/login | 200, accessToken present |
| TC-002 | Admin login wrong password | POST | /auth/login | 401, no token |
| TC-003 | Doctor login first time (must_change_pw) | POST | /auth/login | 200, redirect /change-password |
| TC-004 | Student login first time | POST | /auth/login | 200, redirect /change-password |
| TC-005 | Login with deactivated account | POST | /auth/login | 401 "Account is disabled" |
| TC-006 | Refresh token rotation | POST | /auth/refresh | 200, new token pair |
| TC-007 | Reuse old refresh token | POST | /auth/refresh | 401 "invalid" |
| TC-008 | Logout clears tokens | POST | /auth/logout | 200, tokens revoked in DB |
| TC-009 | Change password (valid) | POST | /change-password | 200, must_change_pw=false |
| TC-010 | Change password (weak) | POST | /change-password | 422 validation error |
| TC-011 | Rate limit: 11th login in 1min | POST | /auth/login | 429 Too Many Requests |
| TC-012 | JWT access token expires (15min) | GET | any protected | 401, interceptor refreshes |
| TC-013 | Student → Admin route | GET | /admin/dashboard | 403 Forbidden |
| TC-014 | Doctor → Student route | GET | /student/dashboard | 403 Forbidden |
| TC-015 | Admin → Doctor route | GET | /doctor/courses | 403 Forbidden |

---

## TC-016 to TC-060 — Admin Core

| ID | Description | Expected |
|---|---|---|
| TC-016 | Admin dashboard loads 4 stat cards | 200, totalStudents/Doctors/Courses/Warnings |
| TC-017 | Student list (paginated, 15/page) | 200, array of students |
| TC-018 | Search students by Arabic name | 200, filtered results |
| TC-019 | Search students by code | 200, filtered by student_code |
| TC-020 | Filter students by specialization | 200, CS/IS/IT/SE filter works |
| TC-021 | Filter students by status | 200, active/warning/dismissed |
| TC-022 | Student detail: 3 tabs | 200, student + gpaHistory + warnings + graduationEligibility |
| TC-023 | Admin enroll override (bypasses credit limit) | 201, enrollment created |
| TC-024 | Admin force-drop enrollment | 200, enrollment deleted |
| TC-025 | Admin force-drop locked grades | 400 "grades are locked" |
| TC-026 | Create student user (no password) | 201, auto-generated temp password |
| TC-027 | Create doctor user | 201, doctor profile linked |
| TC-028 | Create user duplicate email | 409 Conflict |
| TC-029 | Deactivate user account | 200, is_active=false |
| TC-030 | Users list filter by role | 200, doctor/student/admin filter |

---

## TC-031 to TC-060 — Semester Lifecycle

| ID | Description | Expected |
|---|---|---|
| TC-031 | Create semester (enhanced) | 201, add_drop/withdrawal auto-calculated from bylaw_config |
| TC-032 | Semester status transition upcoming→registration | 200, students notified |
| TC-033 | Semester status transition registration→active | 200 |
| TC-034 | Semester status transition active→grading | 200, doctors notified |
| TC-035 | Semester status transition grading→closed | 200 (via finalize) |
| TC-036 | Invalid jump: registration→closed | 400 "invalid transition" |
| TC-037 | Invalid jump: closed→any | 400 "no transitions from closed" |
| TC-038 | Admin update semester dates | 200, new dates saved |
| TC-039 | Toggle registration: open | 200, status→registration, students notified |
| TC-040 | Toggle registration: close | 200, status→active |
| TC-041 | Finalize non-grading semester | 400 "must be in grading status" |
| TC-042 | Finalize grading semester | 200, Abs assigned, warnings issued, dismissals checked |
| TC-043 | Finalization assigns Abs (<42% attendance) | Abs grade, grade_points=0 |
| TC-044 | Finalization computes semester GPA | Weighted formula (Art.18) |
| TC-045 | Finalization updates student level | level based on total_credits_passed (Art.10) |
| TC-046 | Finalization issues warnings (CGPA<2.0) | total_warnings++, notification sent |
| TC-047 | First semester exempt from warning | No warning issued |
| TC-048 | 4 consecutive warnings → dismissed | academic_status=dismissed |
| TC-049 | 6 total warnings → dismissed | academic_status=dismissed |

---

## TC-050 to TC-090 — Course & Registration

| ID | Description | Expected |
|---|---|---|
| TC-050 | Course catalog (128 courses) | 200, paginated list |
| TC-051 | Filter courses by level | 200, level 1/2/3/4 filter |
| TC-052 | Filter courses by category (elective) | 200, n>0, no 500 |
| TC-053 | Create course | 201, course in catalog |
| TC-054 | Create course duplicate code | 409 |
| TC-055 | Create course offering | 201, offering linked to semester+doctor |
| TC-056 | Student: available courses (reg open) | 200, can_register flags present |
| TC-057 | Student: registration_open=true in meta | meta.registration_open==true |
| TC-058 | Student: registeredCredits in meta | meta.registeredCredits present |
| TC-059 | Student registers course (happy path) | 201, enrolled_count increments |
| TC-060 | Student double-registers | 409 already enrolled |
| TC-061 | Student registers missing offeringId | 400 |
| TC-062 | Student blocked: window closed | 400 "registration closed" |
| TC-063 | Student blocked: credit limit CGPA<2.0 | 400, max 20 credits |
| TC-064 | Student blocked: credit limit CGPA 2.0-2.49 | 400, max 20 credits |
| TC-065 | Student blocked: summer max 7 credits | 400 |
| TC-066 | Student blocked: strict prereq not passed | 400 "missing prerequisite" |
| TC-067 | Student blocked: enrolled not passed ≠ prereq | 400 still blocked |
| TC-068 | Student blocked: course full | 400 "section full" |
| TC-069 | Student blocked: dismissed status | 400 "academic dismissal" |
| TC-070 | Drop course in add/drop window | 200, enrolled_count decrements |
| TC-071 | Drop course after deadline | 400, withdrawal suggested |
| TC-072 | Withdraw course (W grade) | 200, letter_grade=W, CGPA unaffected |
| TC-073 | Withdraw below 2 credits | 400 |
| TC-074 | Withdraw after withdrawal deadline | 400 |
| TC-075 | Race condition: 2 students last seat | One 201, one 400 |
| TC-076 | DB trigger: enrolled_count auto-increments | verified by DB query |
| TC-077 | Graduation Project 1 (need 85 credits) | blocked if <85 |
| TC-078 | Graduation Project 2 (need PR411 passed) | blocked without PR411 |

---

## TC-079 to TC-120 — Doctor Workflow

| ID | Description | Expected |
|---|---|---|
| TC-079 | Doctor dashboard: totalCourses/totalStudents/pendingGrades | 200, all keys present |
| TC-080 | Doctor my courses list | 200, offering_id present in each course |
| TC-081 | Doctor course roster | 200, enrollment_id + midterm aliases present |
| TC-082 | Grade entry valid (18+9+8+45=80 → B) | 200, letter_grade=B, grade_points=3.0 |
| TC-083 | Grade entry: over-max midterm (25>20) | 400 |
| TC-084 | Grade entry: Art.16 40% floor (total=40 → D-) | 200, letter_grade=D-, NOT F |
| TC-085 | Grade entry: Art.16 below floor (total=39 → F) | 200, letter_grade=F |
| TC-086 | Grade entry: final exam <30% → F | 200, letter_grade=F despite total ≥40% |
| TC-087 | Grade entry locked after all 4 components | grade_locked=true |
| TC-088 | Edit locked grades | 400 |
| TC-089 | Improvement retake: cap at B (3.0) | grade_points capped at 3.0 |
| TC-090 | Training course grade (non-GPA) | grade_points=null, not in GPA |
| TC-091 | Attendance: create session | 201 |
| TC-092 | Attendance: duplicate session same day+type | 409 |
| TC-093 | Attendance: mark absent | saved in attendance_records |
| TC-094 | Attendance: >42% absent → khatar badge | attendance_pct < 42 flagged |
| TC-095 | Attendance: early warning at >25% | orange badge |
| TC-096 | Doctor cannot access other doctor's course | 403 |
| TC-097 | Doctor schedule API | 200, weeklyGrid present |
| TC-098 | Doctor bulk grade entry | 200 |

---

## TC-099 to TC-140 — Student UX

| ID | Description | Expected |
|---|---|---|
| TC-099 | Student dashboard: cgpa, currentLevel, totalCreditsPassed | 200, all fields present |
| TC-100 | Student dashboard: gpaHistory present | gpaHistory or recentGPA in response |
| TC-101 | Student transcript: grouped by semester | 200, semesters array |
| TC-102 | Transcript W grade (withdrawn) | letter_grade=W, CGPA unaffected |
| TC-103 | Transcript Abs grade | letter_grade=Abs, attendance note |
| TC-104 | Transcript both attempts (retake) | attempt 1 is_counted_in_gpa=false |
| TC-105 | GPA formula (weighted) | verified to 3 decimal places |
| TC-106 | Graduation status | 200, is_eligible present |
| TC-107 | Graduation: 132 credits + CGPA≥2.0 = eligible | is_eligible=true |
| TC-108 | Graduation honors: all 4 conditions | is_honors_eligible=true |
| TC-109 | Graduation honors: F in history disqualifies | honors.reasons contains F note |
| TC-110 | Graduation honors: CGPA<3.0 disqualifies | not eligible for honors |
| TC-111 | Notifications list | 200 |
| TC-112 | Notification detail modal data | 200, title/message/type present |
| TC-113 | Mark notification read | 200, is_read=true |
| TC-114 | Mark all read | 200, all is_read=true |
| TC-115 | Unread count endpoint | 200, count integer |
| TC-116 | Schedule page | 200 |
| TC-117 | Warnings endpoint | 200 |

---

## TC-118 to TC-160 — FR-1 to FR-5

| ID | Description | Expected |
|---|---|---|
| TC-118 | FR-1: credit-summary endpoint | 200, maxCredits/registeredCredits/remainingCredits |
| TC-119 | FR-1: fillPercent calculation | fillPercent = (registered/max)*100 |
| TC-120 | FR-4: atLimit flag when at max | atLimit=true |
| TC-121 | FR-4: nearLimit flag when within 3 credits | nearLimit=true |
| TC-122 | FR-4: warningMessage when at limit | warningMessage present |
| TC-123 | FR-4: warningMessage null when not near limit | warningMessage=null |
| TC-124 | FR-2: eligibility endpoint 7 checks | checks array length = 7 |
| TC-125 | FR-2: window check (reg open) | check.id=window, ok=true |
| TC-126 | FR-2: status check (not dismissed) | check.id=status, ok=true |
| TC-127 | FR-2: enrolled check (not already registered) | check.id=enrolled, ok=true |
| TC-128 | FR-2: capacity check (seats available) | check.id=capacity, ok=true |
| TC-129 | FR-2: credits check (under limit) | check.id=credits, ok=true |
| TC-130 | FR-2: prereqs check | check.id=prereqs, ok based on status |
| TC-131 | FR-2: schedule check (no conflict) | check.id=schedule, ok=true |
| TC-132 | FR-2: summary message present | summary field in response |
| TC-133 | FR-2: canRegister=false with reason | failed checks listed |
| TC-134 | FR-3: alternatives endpoint | 200 |
| TC-135 | FR-3: blocked course info | blocked object in response |
| TC-136 | FR-3: suggestions list (≤8) | suggestions array present |
| TC-137 | FR-3: alternatives have no schedule conflict | verified per suggestion |
| TC-138 | FR-3: alternatives meet prereqs | no failed strict prereqs |
| TC-139 | FR-3: remainingCredits in response | remainingCredits calculated |
| TC-140 | FR-5: validate-registration endpoint | 200, same 7 checks |

---

## TC-141 to TC-180 — Admin Superadmin (v3)

| ID | Description | Expected |
|---|---|---|
| TC-141 | Bylaw config GET (21 params) | 200, params.length >= 21 |
| TC-142 | Bylaw config UPDATE | 200, new value saved |
| TC-143 | Bylaw config bounds validation | 400 if below min_value |
| TC-144 | Bylaw config RESET to default | 200, value = default_value |
| TC-145 | Bylaw audit log on change | audit_logs row created |
| TC-146 | Curriculum plan GET (GENERAL) | 200, grouped by year/semester |
| TC-147 | Curriculum plan GET (CS spec) | 200 |
| TC-148 | Add course to curriculum | 201 |
| TC-149 | Remove course from curriculum | 200 |
| TC-150 | Departments list | 200, doctor_count + course_count |
| TC-151 | Create department | 201 |
| TC-152 | Edit department | 200 |
| TC-153 | Doctor schedule assignment | 200, notification sent to doctor |
| TC-154 | Doctor weekly schedule API | 200, weeklyGrid present |
| TC-155 | Schedule PDF (browser print) | window.print() triggered |
| TC-156 | Prereq GET for course | 200, strict/advisory flags |
| TC-157 | Prereq DELETE | 200 |
| TC-158 | Reports: GPA distribution | 200, bands array |
| TC-159 | Reports: top students | 200, sorted by CGPA desc |
| TC-160 | Reports: dismissed students | 200 |
| TC-161 | Reports: enrollment stats (per semester) | 200 |
| TC-162 | Reports: overview stats | 200, active/warning/dismissed counts |

---

## TC-181 to TC-200 — Infrastructure

| ID | Description | Expected |
|---|---|---|
| TC-181 | Health endpoint | 200, status=ok |
| TC-182 | Prometheus scrapes backend metrics | fcit_srs_http_requests_total present |
| TC-183 | Prometheus scrapes postgres-exporter | pg_stat_activity_count present |
| TC-184 | postgres-exporter healthcheck | wget :9187/metrics → 200 |
| TC-185 | Grafana provisioned dashboard | "FCIT SRS Overview" loads |
| TC-186 | No "startup packet" errors in PG logs | pg logs clean (no HTTP probes) |
| TC-187 | Docker compose up builds all 5 services | postgres, backend, frontend, postgres-exporter, prometheus, grafana |
| TC-188 | DB init: all 7 SQL files run in order | seeds applied, migration_v3 applied |
| TC-189 | ON DELETE CASCADE: delete user removes student | student row cascaded |
| TC-190 | Rate limiter: 429 after 10 rapid logins | 11th request returns 429 |

---

## Bylaw Coverage

| Article | Topic | Test IDs |
|---|---|---|
| Art.4 | 132 credits, CGPA≥2.0, max 8 semesters | TC-031, TC-107, TC-108 |
| Art.10 | Level classification | TC-045 |
| Art.11 | Credit limits by CGPA | TC-063–065 |
| Art.12 | Add/drop window | TC-070–071 |
| Art.13 | Withdrawal (W grade, min 2 credits) | TC-072–074 |
| Art.14 | Attendance ≥42% barring | TC-043, TC-094 |
| Art.16 | 40% total floor, 30% final floor | TC-084–086 |
| Art.17 | Grade scale | TC-082 |
| Art.18 | Weighted GPA formula | TC-044, TC-105 |
| Art.20 | Training course non-credit | TC-090 |
| Art.21 | Graduation project prereqs | TC-077–078 |
| Art.22 | Retake cap at B (3.0) | TC-089 |
| Art.25 | Academic warnings | TC-046–048 |
| Art.26 | Dismissal | TC-048–049 |
| Art.27 | Honors graduation | TC-108–111 |

---

## Scenario Coverage
Total scenarios: **331** (US-001 → US-331)
- Section A (Admin): US-001–078 — 78 scenarios
- Section B (Doctor): US-079–135 — 57 scenarios
- Section C (Student): US-136–220 — 85 scenarios
- Section D (Admin Superadmin v3): US-221–253 — 33 scenarios
- Section E (Notification Detail): US-254–263 — 10 scenarios
- Section F (Semester v3): US-264–270 — 7 scenarios
- Section G (Registration v3): US-271–286 — 16 scenarios
- Section H (Doctor Advanced): US-287–298 — 12 scenarios
- Section I (Student Advanced): US-299–313 — 15 scenarios
- Section J (Security): US-314–321 — 8 scenarios
- Section K (Reports): US-322–326 — 5 scenarios
- Section L (Integration): US-327–331 — 5 scenarios

See `fcit-srs-scenarios-v3-extended.md` for full scenario descriptions.
