SET client_encoding = 'UTF8';

-- =============================================================================
-- 003_academic_calendar.sql — Four academic years: 2022-2023 through 2025-2026
-- Total: 11 semesters (3 historical years × 3 sems + current year × 2 sems)
-- Idempotent: ON CONFLICT DO UPDATE
--
-- ROOT CAUSE FIX: Original seed only created 2 semesters (2025-2026 S1 + S2).
-- Historical semesters were missing entirely.
--
-- REGISTRATION FIX: 2025-2026 S2 registration_end and add_drop_deadline updated
-- to 2026-07-15 / 2026-08-01 so computeSemesterStatus() returns 'registration'
-- as of June 2026, making canRegisterNew = true.
--
-- CREDIT FIX: max_credits_default set to 21 (regular) and 9 (summer) throughout.
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- ACADEMIC YEARS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO academic_years (year_label, start_date, end_date, is_current)
VALUES
  ('2022-2023', '2022-09-01', '2023-06-30', false),
  ('2023-2024', '2023-09-01', '2024-06-30', false),
  ('2024-2025', '2024-09-01', '2025-06-30', false),
  ('2025-2026', '2025-09-01', '2026-10-30', true)
ON CONFLICT (year_label) DO UPDATE SET
  start_date = EXCLUDED.start_date,
  end_date   = EXCLUDED.end_date,
  is_current = EXCLUDED.is_current;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2022-2023
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO semesters (academic_year_id,semester_type,label,status,start_date,end_date,registration_start,registration_end,add_drop_deadline,withdrawal_deadline,min_credits,max_credits_default)
SELECT ay.id,'first','الفصل الدراسي الأول 2022-2023','closed','2022-09-15','2023-01-20','2022-09-01','2022-09-14','2022-09-28','2022-10-26',9,21
FROM academic_years ay WHERE ay.year_label='2022-2023'
ON CONFLICT (academic_year_id,semester_type) DO UPDATE SET
  status=EXCLUDED.status,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,
  registration_start=EXCLUDED.registration_start,registration_end=EXCLUDED.registration_end,
  add_drop_deadline=EXCLUDED.add_drop_deadline,withdrawal_deadline=EXCLUDED.withdrawal_deadline,
  min_credits=EXCLUDED.min_credits,max_credits_default=EXCLUDED.max_credits_default;

INSERT INTO semesters (academic_year_id,semester_type,label,status,start_date,end_date,registration_start,registration_end,add_drop_deadline,withdrawal_deadline,min_credits,max_credits_default)
SELECT ay.id,'second','الفصل الدراسي الثاني 2022-2023','closed','2023-02-01','2023-06-20','2023-01-20','2023-01-31','2023-02-14','2023-03-15',9,21
FROM academic_years ay WHERE ay.year_label='2022-2023'
ON CONFLICT (academic_year_id,semester_type) DO UPDATE SET
  status=EXCLUDED.status,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,
  registration_start=EXCLUDED.registration_start,registration_end=EXCLUDED.registration_end,
  add_drop_deadline=EXCLUDED.add_drop_deadline,withdrawal_deadline=EXCLUDED.withdrawal_deadline,
  min_credits=EXCLUDED.min_credits,max_credits_default=EXCLUDED.max_credits_default;

INSERT INTO semesters (academic_year_id,semester_type,label,status,start_date,end_date,registration_start,registration_end,add_drop_deadline,withdrawal_deadline,min_credits,max_credits_default)
SELECT ay.id,'summer','الفصل الصيفي 2022-2023','closed','2023-07-01','2023-08-31','2023-06-21','2023-06-30','2023-07-07','2023-07-21',2,9
FROM academic_years ay WHERE ay.year_label='2022-2023'
ON CONFLICT (academic_year_id,semester_type) DO UPDATE SET
  status=EXCLUDED.status,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,
  registration_start=EXCLUDED.registration_start,registration_end=EXCLUDED.registration_end,
  add_drop_deadline=EXCLUDED.add_drop_deadline,withdrawal_deadline=EXCLUDED.withdrawal_deadline,
  min_credits=EXCLUDED.min_credits,max_credits_default=EXCLUDED.max_credits_default;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2023-2024
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO semesters (academic_year_id,semester_type,label,status,start_date,end_date,registration_start,registration_end,add_drop_deadline,withdrawal_deadline,min_credits,max_credits_default)
SELECT ay.id,'first','الفصل الدراسي الأول 2023-2024','closed','2023-09-15','2024-01-20','2023-09-01','2023-09-14','2023-09-28','2023-10-26',9,21
FROM academic_years ay WHERE ay.year_label='2023-2024'
ON CONFLICT (academic_year_id,semester_type) DO UPDATE SET
  status=EXCLUDED.status,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,
  registration_start=EXCLUDED.registration_start,registration_end=EXCLUDED.registration_end,
  add_drop_deadline=EXCLUDED.add_drop_deadline,withdrawal_deadline=EXCLUDED.withdrawal_deadline,
  min_credits=EXCLUDED.min_credits,max_credits_default=EXCLUDED.max_credits_default;

INSERT INTO semesters (academic_year_id,semester_type,label,status,start_date,end_date,registration_start,registration_end,add_drop_deadline,withdrawal_deadline,min_credits,max_credits_default)
SELECT ay.id,'second','الفصل الدراسي الثاني 2023-2024','closed','2024-02-01','2024-06-20','2024-01-20','2024-01-31','2024-02-14','2024-03-15',9,21
FROM academic_years ay WHERE ay.year_label='2023-2024'
ON CONFLICT (academic_year_id,semester_type) DO UPDATE SET
  status=EXCLUDED.status,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,
  registration_start=EXCLUDED.registration_start,registration_end=EXCLUDED.registration_end,
  add_drop_deadline=EXCLUDED.add_drop_deadline,withdrawal_deadline=EXCLUDED.withdrawal_deadline,
  min_credits=EXCLUDED.min_credits,max_credits_default=EXCLUDED.max_credits_default;

INSERT INTO semesters (academic_year_id,semester_type,label,status,start_date,end_date,registration_start,registration_end,add_drop_deadline,withdrawal_deadline,min_credits,max_credits_default)
SELECT ay.id,'summer','الفصل الصيفي 2023-2024','closed','2024-07-01','2024-08-31','2024-06-21','2024-06-30','2024-07-07','2024-07-21',2,9
FROM academic_years ay WHERE ay.year_label='2023-2024'
ON CONFLICT (academic_year_id,semester_type) DO UPDATE SET
  status=EXCLUDED.status,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,
  registration_start=EXCLUDED.registration_start,registration_end=EXCLUDED.registration_end,
  add_drop_deadline=EXCLUDED.add_drop_deadline,withdrawal_deadline=EXCLUDED.withdrawal_deadline,
  min_credits=EXCLUDED.min_credits,max_credits_default=EXCLUDED.max_credits_default;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2024-2025
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO semesters (academic_year_id,semester_type,label,status,start_date,end_date,registration_start,registration_end,add_drop_deadline,withdrawal_deadline,min_credits,max_credits_default)
SELECT ay.id,'first','الفصل الدراسي الأول 2024-2025','closed','2024-09-15','2025-01-20','2024-09-01','2024-09-14','2024-09-28','2024-10-26',9,21
FROM academic_years ay WHERE ay.year_label='2024-2025'
ON CONFLICT (academic_year_id,semester_type) DO UPDATE SET
  status=EXCLUDED.status,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,
  registration_start=EXCLUDED.registration_start,registration_end=EXCLUDED.registration_end,
  add_drop_deadline=EXCLUDED.add_drop_deadline,withdrawal_deadline=EXCLUDED.withdrawal_deadline,
  min_credits=EXCLUDED.min_credits,max_credits_default=EXCLUDED.max_credits_default;

INSERT INTO semesters (academic_year_id,semester_type,label,status,start_date,end_date,registration_start,registration_end,add_drop_deadline,withdrawal_deadline,min_credits,max_credits_default)
SELECT ay.id,'second','الفصل الدراسي الثاني 2024-2025','closed','2025-02-01','2025-06-20','2025-01-20','2025-01-31','2025-02-14','2025-03-15',9,21
FROM academic_years ay WHERE ay.year_label='2024-2025'
ON CONFLICT (academic_year_id,semester_type) DO UPDATE SET
  status=EXCLUDED.status,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,
  registration_start=EXCLUDED.registration_start,registration_end=EXCLUDED.registration_end,
  add_drop_deadline=EXCLUDED.add_drop_deadline,withdrawal_deadline=EXCLUDED.withdrawal_deadline,
  min_credits=EXCLUDED.min_credits,max_credits_default=EXCLUDED.max_credits_default;

INSERT INTO semesters (academic_year_id,semester_type,label,status,start_date,end_date,registration_start,registration_end,add_drop_deadline,withdrawal_deadline,min_credits,max_credits_default)
SELECT ay.id,'summer','الفصل الصيفي 2024-2025','closed','2025-07-01','2025-08-31','2025-06-21','2025-06-30','2025-07-07','2025-07-21',2,9
FROM academic_years ay WHERE ay.year_label='2024-2025'
ON CONFLICT (academic_year_id,semester_type) DO UPDATE SET
  status=EXCLUDED.status,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,
  registration_start=EXCLUDED.registration_start,registration_end=EXCLUDED.registration_end,
  add_drop_deadline=EXCLUDED.add_drop_deadline,withdrawal_deadline=EXCLUDED.withdrawal_deadline,
  min_credits=EXCLUDED.min_credits,max_credits_default=EXCLUDED.max_credits_default;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2025-2026  (current year)
-- ─────────────────────────────────────────────────────────────────────────────

-- S1 — closed (completed in Jan 2026)
INSERT INTO semesters (academic_year_id,semester_type,label,status,start_date,end_date,registration_start,registration_end,add_drop_deadline,withdrawal_deadline,min_credits,max_credits_default)
SELECT ay.id,'first','الفصل الدراسي الأول 2025-2026','closed','2025-09-15','2026-01-20','2025-09-01','2025-09-14','2025-09-28','2025-10-26',9,21
FROM academic_years ay WHERE ay.year_label='2025-2026'
ON CONFLICT (academic_year_id,semester_type) DO UPDATE SET
  status=EXCLUDED.status,start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,
  registration_start=EXCLUDED.registration_start,registration_end=EXCLUDED.registration_end,
  add_drop_deadline=EXCLUDED.add_drop_deadline,withdrawal_deadline=EXCLUDED.withdrawal_deadline,
  min_credits=EXCLUDED.min_credits,max_credits_default=EXCLUDED.max_credits_default;

-- S2 — ACTIVE (registration open as of June 2026)
-- REGISTRATION FIX: registration_end=2026-07-15 and add_drop_deadline=2026-08-01
-- so computeSemesterStatus() returns 'registration' while today is June 2026,
-- making canRegisterNew=true and courses visible in the student registration page.
INSERT INTO semesters (academic_year_id,semester_type,label,status,start_date,end_date,registration_start,registration_end,add_drop_deadline,withdrawal_deadline,min_credits,max_credits_default)
SELECT ay.id,'second','الفصل الدراسي الثاني 2025-2026','registration','2026-05-25','2026-10-30','2026-05-20','2026-07-15','2026-08-01','2026-08-20',9,21
FROM academic_years ay WHERE ay.year_label='2025-2026'
ON CONFLICT (academic_year_id,semester_type) DO UPDATE SET
  label=EXCLUDED.label,
  status=EXCLUDED.status,
  start_date=EXCLUDED.start_date,
  end_date=EXCLUDED.end_date,
  registration_start=EXCLUDED.registration_start,
  registration_end=EXCLUDED.registration_end,
  add_drop_deadline=EXCLUDED.add_drop_deadline,
  withdrawal_deadline=EXCLUDED.withdrawal_deadline,
  min_credits=EXCLUDED.min_credits,
  max_credits_default=EXCLUDED.max_credits_default;

COMMIT;
