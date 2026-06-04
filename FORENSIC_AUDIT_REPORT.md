# FCIT Student Registration System — Forensic Audit Report
**Date:** June 2026  
**Scope:** Full end-to-end forensic audit of curriculum data, registration logic, and database integrity

---

## 1. Audit Methodology

Sources cross-referenced in order of authority:
1. **Official Bylaw PDF** (`bylaw-2024-7-73-14-33.pdf`) — primary source of truth
2. **Official Exam Schedule Images** (16 screenshots from schedule.zip)
3. **UI Screenshots** (student registration pages, admin curriculum page)
4. **Database schema** (`schema.sql`, `migration_v3.sql`)
5. **Migration files** (001–029)
6. **Backend controllers** (student.controller.js, admin.extensions.js)
7. **Frontend pages** (AdminCurriculumPage.jsx, CourseRegPage.jsx)

---

## 2. Forensic Findings — Root Causes

### RC-1: UNIQUE Constraint Mismatch (CRITICAL)

**Location:** `database/migration_v3.sql` vs `migrations/014_fix_curriculum_constraint.sql`

| Migration | Constraint |
|-----------|-----------|
| migration_v3 | `UNIQUE (specialization, course_id)` — 2-column |
| migration_014 | `UNIQUE (specialization, year_of_study, semester_in_year, course_id)` — 4-column |
| migration_028 | Uses `ON CONFLICT (specialization, course_id)` → **wrong after 014** |
| migration_029 | Uses `ON CONFLICT (specialization, year_of_study, semester_in_year, course_id)` → correct |
| admin.extensions.js | Uses `ON CONFLICT (specialization, year_of_study, semester_in_year, course_id)` → was correct for 014+ but **constraint name not referenced by name** |

**Effect:** `addCourseToCurriculum` API fails when a duplicate insert is attempted because the ON CONFLICT clause doesn't reference the constraint by name, making upsert semantics unreliable across different DB states.

---

### RC-2: Migration 029 Order-of-Operations Bug (CRITICAL)

**Location:** `migrations/029_forensic_fix.sql`, Section A2

Migration 029 attempts to insert `IT415` into `IT Y4S1` (step A2) before deleting `IT415` from `IT Y4S2` (step A3). When the constraint is the 4-column form, these are two different rows `(IT,4,1,IT415)` vs `(IT,4,2,IT415)` — no conflict. However, when migration 028 ran before migration 014 was checked, the `ON CONFLICT` clause in migration 028 (`ON CONFLICT (specialization, course_id)`) references the old 2-column constraint which may no longer exist → **migration 028 fails on first insert**.

**Net effect:** The live database is still in migration 014's state (confirmed by screenshot evidence: CS Y4S1 shows CS315, CS443, SE321, CS434 — exactly matching migration 014, not migration 028).

---

### RC-3: IS311 Missing from IS Curriculum Plan (HIGH)

**Location:** `migrations/028_complete_rebuild.sql`, IS Y3S1 block

Migration 028 IS Y3S1: `IS312, IS313, IS314, CS313, IS316, IS341(elec)`  
**Bylaw page 27 requires:** `IS311` (Analysis and Design of IS) as the **first and most critical** IS mandatory course.

**Effect:** IS311 is missing from the IS specialization curriculum plan entirely.  
Without IS311 in the IS plan, IS students cannot see or register IS311 (the filter `cp.specialization = ANY(['IS','GENERAL'])` returns no row for IS311). Since IS311 is the prerequisite for IS315, IS317, IS412, IS413, IS415 — IS students in Year 3+ cannot advance through the program at all.

---

### RC-4: IS Y4S1 Missing CS314 (Machine Learning) (HIGH)

**Location:** `migrations/028_complete_rebuild.sql`, IS Y4S1 block

Migration 028 IS Y4S1: `IS411, IS412, IS413, IS331(elec), PR421`  
**Bylaw page 27 requires:** CS314 (Machine Learning) as mandatory for IS.  
**Effect:** IS Year 4 students cannot register the mandatory Machine Learning course, blocking CS414 (Data Science, prereq CS314) in Y4S2.

---

### RC-5: IS Y4S2 Wrong Courses (HIGH)

**Location:** `migrations/028_complete_rebuild.sql`, IS Y4S2 block

Migration 028 IS Y4S2: `IS434(elec), IS414, IS424(elec), IS443(elec), PR422`  
**Bylaw pages 27-28 require (mandatory):** IS415, CS414 — both missing.  
**Missing:** IS415 (IS Development Methodologies), CS414 (Data Science)  
**Wrong electives:** IS424, IS443 not in official schedule; bylaw places them as optional electives with different prerequisites.

---

### RC-6: IT Y3S1 Missing CS313 (HIGH)

**Location:** `migrations/028_complete_rebuild.sql`, IT Y3S1 block

Migration 028 IT Y3S1: `IT311, IT312, IT313, IT314, IT315, IT321(elec)`  
**Bylaw page 32 requires:** CS313 (Artificial Intelligence) as mandatory for IT.  
**Effect:** IT students cannot access the AI course that is listed as mandatory in their program's applied computing requirements.

---

### RC-7: IT Y4S1/Y4S2 Inverted Course Distribution (HIGH)

**Location:** `migrations/028_complete_rebuild.sql`, IT Y4 blocks

| Semester | Migration 028 | Correct (Bylaw p.32) |
|----------|--------------|---------------------|
| Y4S1 | IT411, IT413, IT331(e), IT332(e), PR431 | CS412(mand), IT415(mand), IT321(e), IT331(e), PR431 |
| Y4S2 | IT444(e), IT414, **IT415**, IT433(e), PR432 | IT411(mand), IT413(mand), IT414(mand), IT444(e), PR432 |

IT415 (Cloud Computing Networks) is in the wrong semester; IT411/IT413 are in the wrong semester; CS412 (IoT) is entirely missing from IT plan.

---

### RC-8: Missing Spring 2026 Offerings for IS Y4S2 Courses

**Location:** `migrations/028_complete_rebuild.sql`, course offerings section

Migration 028 creates Spring 2026 offerings for: IS315, IS322, IS321, IS342, IS317, IS318, IS434, IS414, IS424, IS443 — but **not for IS415, CS414, IS413**.  
After the curriculum plan fix (RC-3 through RC-5), IS Y4S2 students need IS415, CS414, IS413 in Spring 2026.

---

### RC-9: SE Courses in CS Curriculum (MEDIUM)

**Location:** Admin curriculum page (from migration 014 data)

Screenshots show SE315 and SE321 in CS and IT admin curriculum pages:
- **SE315 (Advanced Software Engineering):** IS correct — bylaw pages 23 and 31 list SE315 as mandatory for both CS and IT programs. Keep as a course; exclude SE as a specialization.
- **SE321 (Software Security):** Migration 014 incorrectly placed this in CS Y4S1. This is an SE program elective, not a CS course. **Remove from CS plan.**

---

### RC-10: IS341 and IS316 Wrong Semester in IS Y3S1 (MEDIUM)

**Location:** `migrations/028_complete_rebuild.sql` and `029_forensic_fix.sql`

IS316 (Data Analytics) requires IS315 → IS311. Placing IS316 in IS Y3S1 (before IS311 is completed) violates the prerequisite chain. Students cannot actually register IS316 in Y3S1 because IS311 is a prerequisite they are taking concurrently.

**Fix:** IS316 moved to IS Y4S1 (after IS315 from Y3S2 is passed).

---

## 3. Complete Discrepancy Table

| Course | Official (Bylaw) | In DB (Migration 028 State) | Status |
|--------|-----------------|---------------------------|--------|
| IS311 (IS plan) | IS Y3S1 mandatory | **MISSING from IS plan entirely** | ❌ CRITICAL |
| CS313 (IT plan) | IT Y3S1 mandatory | **MISSING from IT plan** | ❌ HIGH |
| CS314 (IS plan) | IS Y4S1 mandatory | IS plan has IS331(elec) instead | ❌ HIGH |
| IS415 (IS plan) | IS Y4S2 mandatory | **MISSING from IS plan** | ❌ HIGH |
| CS414 (IS plan) | IS Y4S2 mandatory | **MISSING from IS plan** | ❌ HIGH |
| CS412 (IT plan) | IT Y4S1 mandatory | **MISSING from IT plan** | ❌ HIGH |
| IT415 (IT plan) | IT Y4S1 mandatory | Wrong: placed in IT Y4S2 | ❌ HIGH |
| IT411 (IT plan) | IT Y4S2 mandatory | Wrong: placed in IT Y4S1 | ❌ HIGH |
| IT413 (IT plan) | IT Y4S2 mandatory | Wrong: placed in IT Y4S1 | ❌ HIGH |
| IT321 (IT plan) | IT Y4S1 elective | Wrong: in IT Y3S1 as elective | ❌ MEDIUM |
| IS316 (IS plan) | IS Y4S1 mandatory | Wrong: in IS Y3S1 (prereq violation) | ❌ MEDIUM |
| IS341 (IS plan) | IS elective (not in Y3S1) | Wrong: in IS Y3S1 | ❌ MEDIUM |
| SE321 (CS plan) | CS program: NOT listed | In CS Y4S1 (migration 014 error) | ❌ MEDIUM |
| SE315 (CS plan) | CS Y3S2 mandatory | Correct ✓ | ✅ |
| SE315 (IT plan) | IT Y3S2 mandatory | Correct ✓ | ✅ |
| SE211 (GENERAL) | GENERAL Y2S1 mandatory | Correct ✓ | ✅ |
| IS315 Spring 2026 | Offered | Has offering ✓ | ✅ |
| IS415 Spring 2026 | Offered | **NO offering** | ❌ HIGH |
| CS414 Spring 2026 | Offered | **NO offering** | ❌ HIGH |
| IS413 Spring 2026 | Offered | **NO offering** | ❌ HIGH |

---

## 4. Root Cause of "0 Available Courses" in Spring 2026 (Screenshot 12)

Screenshot 12 shows a student with **0 registered courses** in Spring 2026 "الترم الثاني 2025-2026". The registration status shows **مغلق (closed)**. This is NOT a data bug — registration was legitimately closed for that semester period. The correct interpretation: the student has 21 credit hours available but registration window has not yet opened.

For IS Year 4 students who CAN register, the courses they would see (with fixes applied) in Spring 2026:
- IS413, IS414, IS415, CS414, IS434, PR422

---

## 5. Files Modified by Migration 030

### Database
- `database/migrations/030_definitive_curriculum_rebuild.sql` — **NEW**: definitive curriculum fix

### Backend
- `backend/src/controllers/admin.extensions.js` — Fix `addCourseToCurriculum` ON CONFLICT clause

### No Changes Needed
- `database/schema.sql` — SE already excluded from `specialization_code` enum
- `frontend/src/pages/admin/AdminCurriculumPage.jsx` — SE already excluded from default specs list
- `backend/src/controllers/student.controller.js` — Logic correct; data was the source of truth problem
- All other frontend pages — No curriculum-related hardcoding found

---

## 6. Final System State After Migration 030

### GENERAL Plan (Years 1–2, shared by all programs)
| Semester | Courses | Credits |
|----------|---------|---------|
| Y1S1 | BS111, BS112, BS116, CS111, IS111, UNV112, UNV113 | 20 |
| Y1S2 | BS113, BS115, CS112, IT111, UNV111, UNV114, UNV120(e) | 18 |
| Y2S1 | IT211, CS211, SE211, BS114, CS212, UNV119(e) | 17 |
| Y2S2 | CS214, CS213, IT212, IS212, IS211, BS117 | 18 |

### CS Plan (Years 3–4)
| Semester | Courses | Credits |
|----------|---------|---------|
| Y3S1 | CS311, CS312, CS313, IS311, IT311, IS318 (all mandatory) | 18 |
| Y3S2 | SE315, CS314, CS316, CS411, CS315 (mand) + CS332(e) | 18 |
| Y4S1 | CS412, CS413, CS414 (mand) + CS331(e) + PR411 | 15 |
| Y4S2 | CS415, CS416 (mand) + CS433(e) + CS423(e) + PR412 | 15 |

### IS Plan (Years 3–4)
| Semester | Courses | Credits |
|----------|---------|---------|
| Y3S1 | IS311, IS312, IS313, IS314, CS313, IS318 (all mandatory) | 18 |
| Y3S2 | IS315, IS317, IS412 (mand) + IS321(e) + IS322(e) + IS342(e) | 18 |
| Y4S1 | IS316, IS411, CS413, CS314, PR421 (all mandatory) | 15 |
| Y4S2 | IS413, IS414, IS415, CS414 (mand) + IS434(e) + PR422 | 18 |

### IT Plan (Years 3–4)
| Semester | Courses | Credits |
|----------|---------|---------|
| Y3S1 | IT311, IT312, IT313, IT314, IT315, CS313 (all mandatory) | 18 |
| Y3S2 | SE315, IT316, IT317, IT318, IT319 (mand) + IT322(e) | 18 |
| Y4S1 | CS412, IT415 (mand) + IT321(e) + IT331(e) + PR431 | 15 |
| Y4S2 | IT411, IT413, IT414 (mand) + IT444(e) + PR432 | 15 |

---

## 7. Acceptance Verification Checklist

- [x] CS311 in CS Y3S1 with mandatory status
- [x] IS311 in both CS Y3S1 (for CS students) and IS Y3S1 (for IS students)
- [x] CS313 in CS Y3S1, IS Y3S1, AND IT Y3S1
- [x] SE315 in CS Y3S2 AND IT Y3S2 (mandatory for both per bylaw)
- [x] CS412 in CS Y4S1 AND IT Y4S1
- [x] CS413 in CS Y4S1 AND IS Y4S1
- [x] CS314 in CS Y3S2 AND IS Y4S1 (separate rows per specialization)
- [x] IS315 before IS316 in IS plan (Y3S2 then Y4S1)
- [x] IS415 in IS Y4S2 with Spring 2026 offering
- [x] CS414 in IS Y4S2 with Spring 2026 offering
- [x] IT411/IT413 in IT Y4S2 (Spring 2026 offerings already exist)
- [x] IT415/CS412 in IT Y4S1 (Fall 2025 — completed semester)
- [x] SE removed as specialization from curriculum_plans
- [x] SE not in `specialization_code` enum
- [x] Admin curriculum page dropdown shows GENERAL, CS, IS, IT only
- [x] Student registration query filters by specialization curriculum plan
- [x] `addCourseToCurriculum` uses named constraint for reliable upsert
- [x] No SE student specialization possible (enforced by enum)

