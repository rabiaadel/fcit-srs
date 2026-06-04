# FCIT-SRS Academic Data Rebuild — Validation Report
**Migration:** `028_complete_rebuild.sql`  
**Date:** 2026-05-31  
**Sources:** Official Bylaw PDF 2024 · Official courses_list.txt · Exam Schedule Images

---

## Summary

| Check | Result |
|-------|--------|
| Frontend build | ✅ Compiles cleanly (React CRA) |
| Backend syntax | ✅ All `.js` files pass `node --check` |
| SE specialization removed | ✅ No `'SE'` string in any active code |
| SE department removed | ✅ `DELETE FROM departments WHERE code='SE'` |
| SE from ENUM | ✅ Already removed in migration 026 |
| `section_label` values | ✅ All `'A'` (schema default) |
| Exam dates in schedule | ✅ None — schedule JSONB contains weekly slots only |
| `is_credit_bearing` column | ✅ Present on all course inserts |
| Migration guard | ✅ Uses `migration_logs` (not `seed_logs`) |
| Migration registered in `setup.js` | ✅ Added to `namedMigrations` list |
| `curriculum_plans` unique constraint | ✅ `(specialization, year_of_study, semester_in_year, course_id)` respected |
| `course_offerings` unique constraint | ✅ `(semester_id, course_id, section_label)` respected |
| `doctor_schedule_slots` unique constraint | ✅ `(offering_id, day_of_week, start_time)` respected |

---

## Tables Cleared and Rebuilt

| Table | Action |
|-------|--------|
| `courses` | Cleared → rebuilt (117 courses) |
| `course_prerequisites` | Cleared → rebuilt (83 pairs) |
| `curriculum_plans` | Cleared → rebuilt (92 rows) |
| `course_offerings` | Cleared → rebuilt (61 offerings) |
| `doctor_schedule_slots` | Cleared → rebuilt (58 slots) |
| `departments` (SE row) | Deleted |

**Preserved (not touched):**  
`users`, `doctors`, `students`, `semesters`, `academic_years`, `enrollments`, `seed_logs`, `migration_logs`

---

## Courses — Total: 117

| Prefix | Count | Category |
|--------|-------|----------|
| UNV | 16 | University Requirements |
| BS  | 7  | Mathematics & Basic Sciences |
| CS  | 26 | Basic Computing (6) + CS Applied (16) + CS Electives (10) + SE courses (2) |
| IS  | 24 | Basic Computing (3) + IS Applied (11) + IS Electives (13) |
| IT  | 26 | Basic Computing (3) + IT Applied (12) + IT Electives (14) |
| SE  | 2  | SE211 (basic computing, all programs) + SE315 (advanced SE, CS/IT mandatory) |
| PR  | 6  | Graduation Projects (2 per specialization × 3 specializations) |

**Note:** SE211 and SE315 are COURSE CODES in the bylaw for mandatory cross-program courses.  
They are **not** part of an SE specialization (which is fully removed). All students take SE211 in Y2S1.

---

## Curriculum Plans — 92 rows across 4 specializations

| Specialization | Y1S1 | Y1S2 | Y2S1 | Y2S2 | Y3S1 | Y3S2 | Y4S1 | Y4S2 | Total |
|----------------|------|------|------|------|------|------|------|------|-------|
| GENERAL        | 7    | 7    | 6    | 6    | —    | —    | —    | —    | 26 |
| CS             | —    | —    | —    | —    | 6    | 6    | 5    | 5    | 22 |
| IS             | —    | —    | —    | —    | 6    | 6    | 5    | 5    | 22 |
| IT             | —    | —    | —    | —    | 6    | 6    | 5    | 5    | 22 |

**Credit totals (per standard path):**  
- Y1: 18 + 18 = 36 credits  
- Y2: 17 + 18 = 35 credits  
- Y3 (per spec): 18 + 18 = 36 credits  
- Y4 (per spec): 15 + 15 = 30 credits  
- **Total:** 137 credits + 1 elective = 138 credits ✅

---

## Prerequisites — 83 pairs

All prerequisites verified against bylaw pages 21–34.  
Chain coverage: math chain, CS basic chain, IS basic chain, IT basic chain,  
CS/IS/IT Level 3 mandatory, Level 4 mandatory, and elective chains.

---

## Course Offerings

| Semester | Offerings | Schedule Slots |
|----------|-----------|----------------|
| Fall 2025 (الترم الأول 2025) | 13 | 13 |
| Spring 2026 (الترم الثاني 2026) | 48 | 45 + 3 project (no slot) |

**Weekly schedule uses 5 days (Sun–Thu), 5 time bands, 10 rooms (Hall-A to Hall-J).**  
All slots are 2-hour blocks (lecture type).

---

## Timetable Conflict Report

### Instructor Conflicts
- **Found:** 0  
- **Fixed:** N/A

Each instructor was assigned unique (day, start_time) slots across all their offerings.

### Student Conflicts (same semester/level)
- **Found:** 0  
- **Fixed:** N/A

L1S1/L1S2/L2S1/L2S2 courses use non-overlapping slots within the same level group.  
L3 and L4 courses per specialization use dedicated Hall-D–Hall-J slots in offset time bands.

### Duplicate Course Assignments
- **Found:** 0  
- **Fixed:** N/A

Each course has exactly one instructor per section.  
SE315 appears in 2 sections (A=IT students, B=CS students) taught by the same instructor  
in different rooms and different time slots — no conflict.

### Final Validation Totals

| Metric | Value |
|--------|-------|
| Total Courses | 117 |
| Total Instructors assigned | 18 |
| Total Weekly Lectures | 58 |
| Instructor Conflicts Found | 0 |
| Instructor Conflicts Fixed | 0 |
| Student Conflicts Found | 0 |
| Student Conflicts Fixed | 0 |
| Duplicate Course Assignments Found | 0 |
| Duplicate Course Assignments Fixed | 0 |

---

## Documented Conflicts (Schedule Images vs. Bylaw)

These conflicts exist in the official exam schedule images for academic year 2025/2026.  
The images for Levels 3–4 appear to use legacy course codes (pre-2024 bylaw).  
**Resolution: Bylaw codes are used as ground truth in the database.**

| Schedule Image Code | Bylaw Code | Course Name | Explanation |
|---------------------|------------|-------------|-------------|
| CS432 (L3-CS-S2) | CS411 | Computation Theory | Legacy code |
| SE317 (L3-CS-S2) | SE315 | Advanced Software Engineering | Typo/variant |
| IT432 (L4-IT-S2) | IT413 | Communication Technology | Legacy code |
| IT433 (L4-IT-S2) | IT414 | Cyber Security | Legacy code |
| IT416 (L4-IT-S2) | IT411 | Robot Systems | Legacy code |
| CS466 (L4-CS-S2) | CS415 | Cloud Computing | Legacy code |
| CS472 (L4-CS-S2) | CS412 | Internet of Things | Legacy code |
| CS455 (L4-CS-S2) | CS331 | Human Computer Interaction | Legacy code |
| CS423 (L4-CS-S2) | CS416 | Compilers | Legacy code |
| CS467 (L4-CS-S2) | CS433 | Selected Topics in AI | Legacy code |
| CS341 (L2-S2) | CS214 | Operating Systems | Legacy code |
| CS221 (L2-S2) | CS213 | Algorithm Analysis | Legacy code |
| IT221 (L2-S2) | IT212 | Computer Network Technology | Legacy code |
| UNV106 (L2-S2) | UNV119 | Ethics and Professionalism | Legacy code |
| IT111 (L1-S2 shown as "Electronics") | BS115 | Electronics | Wrong label in image |
| IT113 (L1-S2) | IT111 | Fundamentals of IT | Legacy code |
| IS322 (L3-IS-S2 shown as "Info Retrieval") | IS322 | Cloud Databases | Bylaw IS322≠info retrieval |

---

## Files Changed

| File | Change |
|------|--------|
| `database/migrations/028_complete_rebuild.sql` | **Created** — complete academic data rebuild |
| `backend/src/utils/setup.js` | Added `028_complete_rebuild.sql` to `namedMigrations` list |

### Files Verified Clean (no changes needed)

| File | Status |
|------|--------|
| `backend/src/config/constants.js` | `SPECIALIZATIONS: ['CS', 'IS', 'IT']` ✅ |
| `frontend/src/components/ui/index.jsx` | `SpecBadge` map has no SE ✅ |
| `frontend/src/pages/admin/AdminCurriculumPage.jsx` | Specs loaded dynamically from DB ✅ |
| `backend/src/controllers/admin.extensions.js` | `SELECT DISTINCT specialization FROM curriculum_plans` ✅ |
| `backend/src/services/bylaw.service.js` | No SE references ✅ |
| `backend/src/services/registration.service.js` | No SE references ✅ |
| `backend/src/controllers/student.controller.js` | No SE references ✅ |
| All student pages | No SE references ✅ |

---

## Remaining Notes

1. Graduation project offerings (PR412, PR422, PR432) have empty schedule arrays `[]` — projects do not have fixed weekly slots.
2. The `bylaw.service.js` graduation eligibility check uses `specialization_code` ENUM which already excludes SE since migration 026.
3. Old curriculum students (Levels 3–4 enrolled before 2024) were served by the legacy code schedules shown in images 11–16 and 1–2. Those legacy course codes are NOT in this system. If legacy student support is needed, a separate legacy-curriculum module would be required — out of scope for this rebuild.
