# FCIT-SRS FORENSIC AUDIT — DISCREPANCY & RESOLUTION REPORT

**Date:** June 2026  
**Bylaw Source:** bylaw-2024-7-73-14-33.pdf  
**Schedule Source:** Official exam schedules, Academic Year 2025/2026  
**Migration Produced:** `FINAL_AUTHORITATIVE_BASELINE.sql`

---

## SECTION 1 — BYLAW TYPOGRAPHICAL ERRORS CONFIRMED

The following discrepancies were found in the official 2024 bylaw PDF between
the prerequisite **name** column and the prerequisite **code** column. Each was
confirmed by the user before the final migration was written.

| Course | Course Name | Bylaw Code | Bylaw Name | Actual Course at That Code | Resolution |
|--------|-------------|-----------|------------|---------------------------|------------|
| IS212  | Optimization Methods | BS112 | "Math 2" | Discrete Mathematics | Use BS113 (Math 2) — code is the typo |
| IS314  | Information Retrieval | BS115 | "Probability and Statistics" | Electronics | Use BS116 (Prob & Stats 1) — code is the typo |
| IT312  | Pattern Recognition | BS117 | "Probability and Statistics (2)" | Operations Research | Use BS116 (Prob & Stats 1) — code is the typo |
| IT411  | Robot Systems | IT315 | "Microprocessors" | Microprocessors | Keep IT314 (Signals & Systems) — user Q4 confirmed |

**User confirmations:** Q1 (IS314→BS116), Q2 (IT312→BS116), Q5 (IS212→BS113), Q4 (IT411→IT314).

---

## SECTION 2 — COURSE CODE CONFLICT IN BYLAW

| Issue | Bylaw Page | Finding | Resolution |
|-------|-----------|---------|-----------|
| CS315 = "Machine Learning" in IS plan (bylaw p.27) | 27 | Bylaw p.23 defines CS315 = Big Data Analysis. Bylaw p.27 uses CS315 again for Machine Learning in the IS plan. Two different courses, same code. | CS314 = Machine Learning throughout (confirmed Q3). CS315 = Big Data Analysis. The IS-plan reference to CS315 is a bylaw typo for CS314. |

---

## SECTION 3 — EXAM SCHEDULE CODE REGIME DIFFERENCE

The uploaded exam schedule images (16 files) are from the **old bylaw** system.
Level 1 and Level 2 schedules are explicitly labeled **(لائحة قديمة)**.
Level 3 and Level 4 are also old-bylaw (confirmed by code analysis):

| Old Schedule Code | Course Name | New 2024 Bylaw Code |
|------------------|-------------|---------------------|
| UNV102 | Societal Issues | UNV112 |
| UNV103 | English Language (1) | UNV113 |
| HU117  | Comparative Politics | UNV117 |
| MA112  | Discrete Mathematics | BS112 |
| HU114  | Communication Skills | UNV114 |
| HU118  | Technical Report Writing | UNV111 |
| IT111 (old) | Electronics | BS115 |
| IT113 (old) | Fundamentals of IT | IT111 |
| SE317 (old) | Advanced SE | SE315 |
| CS432 (old) | Computation Theory | CS411 |
| IT432 (old) | Communication Technology | IT413 |

**Resolution (Clarification A confirmed):** Use new 2024 bylaw codes throughout.
Use the exam schedules ONLY to determine semester placement of shared-code courses
(BS111, BS112, BS116, CS111, CS112, IT211, CS211, etc.).

---

## SECTION 4 — YEAR 1 SEMESTER DISTRIBUTION

**Evidence:** Fall 2025 exam schedule for Level 1 (old bylaw, but course placement
is consistent with new bylaw Y1S1 structure after code mapping).

| Semester | Courses (new bylaw codes) | Source |
|---------|--------------------------|--------|
| Y1S1 | BS111, BS112, BS116, CS111, IS111, UNV112, UNV113 | Schedule + bylaw |
| Y1S2 | BS113, BS115, CS112, IT111, UNV111, UNV114, UNV120(e) | Schedule + bylaw |
| Y2S1 | IT211, CS211, SE211, BS114, CS212, UNV119(e) | Schedule + bylaw |
| Y2S2 | CS214, CS213, IT212, IS212, IS211, BS117 | Bylaw p.22 |

---

## SECTION 5 — IS412 PLACEMENT CORRECTION

| Item | Migration 030 | Final Migration | Evidence |
|------|--------------|----------------|---------|
| IS412 (IS Project Management) | IS Y3S2 (mandatory) | IS Y4S1 (mandatory) | User Q7 confirmation |

**Impact:** IS Y3S2 now has 2 mandatory + 3 electives. IS Y4S1 now has 5 mandatory + project.
No courses added or removed — IS412 relocated only.

---

## SECTION 6 — SE SPECIALIZATION REMOVAL

| Course | Status | Appears In |
|--------|--------|-----------|
| SE211 | **ACTIVE** | GENERAL Y2S1 (mandatory) |
| SE315 | **ACTIVE** | CS Y3S2 (mandatory), IT Y3S2 (mandatory) |
| SE311–SE417, SE321–SE342, SE423–SE444 | **INACTIVE** (`is_active = FALSE`) | No curriculum plan |

SE courses remain in the `courses` table with `is_active = FALSE`.
They will not appear in registration, course selection, or curriculum pages.
Historical student records referencing SE courses are preserved.

---

## SECTION 7 — MIGRATION CHAIN ANALYSIS

| Migration | Type | Status |
|-----------|------|--------|
| 011–023 | Schema fixes, schedule fixes, non-curriculum | Preserved, run first |
| 024 | Curriculum fix | Superseded by final migration |
| 025 | Graduation projects sync | Preserved |
| 026 | SE enum fix, project offerings | Preserved |
| 027 | Official bylaw sync | Superseded by final migration |
| 028 | Complete rebuild (courses + prereqs + curriculum) | Preserved (course data is correct) |
| 029 | Forensic fix | Superseded by final migration |
| 030 | Definitive curriculum rebuild | Superseded by final migration |
| **FINAL_AUTHORITATIVE_BASELINE** | **Single final migration** | **Added as last entry in setup.js** |

The final migration runs AFTER all prior migrations (guarded by migration_logs).
It deletes and rebuilds only `course_prerequisites` and `curriculum_plans`.
It does NOT touch the `courses` table or any student/enrollment data.

---

## SECTION 8 — AUTHORITATIVE CURRICULUM SUMMARY

### GENERAL Plan (Years 1–2): 26 courses

| Semester | Courses |
|---------|---------|
| Y1S1 (7 mand) | BS111, BS112, BS116, CS111, IS111, UNV112, UNV113 |
| Y1S2 (6 mand + 1 elec) | BS113, BS115, CS112, IT111, UNV111, UNV114, *UNV120* |
| Y2S1 (5 mand + 1 elec) | IT211, CS211, SE211, BS114, CS212, *UNV119* |
| Y2S2 (6 mand) | CS214, CS213, IT212, IS212, IS211, BS117 |

### CS Plan (Years 3–4): 21 courses

| Semester | Courses |
|---------|---------|
| Y3S1 (6 mand) | CS311, CS312, CS313, IS311, IT311, IS318 |
| Y3S2 (5 mand + 1 elec) | SE315, CS314, CS316, CS411, CS315, *CS332* |
| Y4S1 (3 mand + 1 elec + proj) | CS412, CS413, CS414, *CS331*, PR411 |
| Y4S2 (2 mand + 2 elec + proj) | CS415, CS416, *CS433*, *CS423*, PR412 |

### IS Plan (Years 3–4): 22 courses

| Semester | Courses |
|---------|---------|
| Y3S1 (6 mand) | IS311, IS312, IS313, IS314, CS313, IS318 |
| Y3S2 (2 mand + 3 elec) | IS315, IS317, *IS321*, *IS322*, *IS342* |
| Y4S1 (5 mand + proj) | IS316, IS411, IS412, CS413, CS314, PR421 |
| Y4S2 (4 mand + 1 elec + proj) | IS413, IS414, IS415, CS414, *IS434*, PR422 |

### IT Plan (Years 3–4): 21 courses

| Semester | Courses |
|---------|---------|
| Y3S1 (6 mand) | IT311, IT312, IT313, IT314, IT315, CS313 |
| Y3S2 (5 mand + 1 elec) | SE315, IT316, IT317, IT318, IT319, *IT322* |
| Y4S1 (2 mand + 2 elec + proj) | CS412, IT415, *IT321*, *IT331*, PR431 |
| Y4S2 (3 mand + 1 elec + proj) | IT411, IT413, IT414, *IT444*, PR432 |

*Italics = elective*

---

## SECTION 9 — FILES MODIFIED

| File | Change |
|------|--------|
| `database/migrations/FINAL_AUTHORITATIVE_BASELINE.sql` | **NEW** — single authoritative migration |
| `backend/src/utils/setup.js` | Added final migration as last named entry |
| `backend/src/controllers/admin.extensions.js` | Fixed ON CONFLICT constraint name to `uq_curriculum_spec_year_sem_course` |

---

## SECTION 10 — PREREQUISITE CORRECTIONS APPLIED

| Course | Old Prereq | New Prereq | Bylaw Source | User Confirmation |
|--------|-----------|-----------|-------------|-------------------|
| IS212  | BS112 (Discrete Math) | **BS113** (Math 2) | p.22 typo | Q5 answer B |
| IS314  | BS115 (Electronics)   | **BS116** (Prob & Stats 1) | p.27 typo | Q1 answer B |
| IT312  | BS117 (Ops Research)  | **BS116** (Prob & Stats 1) | p.31 typo | Q2 answer B |
| IT411  | IT315 (Microprocessors) | **IT314** (Signals & Systems) | p.32 / codebase | Q4 (keep IT314) |

All other prerequisites unchanged from migration 028 (which is correct).

---

*Report generated: June 2026 — FCIT Student Registration System Forensic Audit*
