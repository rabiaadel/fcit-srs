SET client_encoding = 'UTF8';

-- =============================================================================
-- 007_curriculum_plans.sql — Curriculum plans from official 2024 bylaw
-- Generated from fcit_curriculum_terms_by_level_with_terms_v2.json
-- Idempotent: constraint alteration + ON CONFLICT DO NOTHING
-- =============================================================================

BEGIN;

-- Ensure the authoritative 4-column unique constraint exists
ALTER TABLE curriculum_plans
  DROP CONSTRAINT IF EXISTS curriculum_plans_specialization_course_id_key;
ALTER TABLE curriculum_plans
  DROP CONSTRAINT IF EXISTS curriculum_plans_spec_year_sem_course_key;

-- Delete existing curriculum plans for a clean rebuild
DELETE FROM curriculum_plans;

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  2,
  (SELECT id FROM courses WHERE code = 'UNV111'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV111');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  1,
  (SELECT id FROM courses WHERE code = 'UNV112'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV112');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  1,
  (SELECT id FROM courses WHERE code = 'UNV113'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV113');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  2,
  (SELECT id FROM courses WHERE code = 'UNV114'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV114');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  1,
  (SELECT id FROM courses WHERE code = 'UNV115'),
  false,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV115');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  2,
  (SELECT id FROM courses WHERE code = 'UNV120'),
  false,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV120');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  1,
  (SELECT id FROM courses WHERE code = 'UNV116'),
  false,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV116');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  1,
  (SELECT id FROM courses WHERE code = 'UNV117'),
  false,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV117');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  1,
  (SELECT id FROM courses WHERE code = 'UNV118'),
  false,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV118');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  1,
  (SELECT id FROM courses WHERE code = 'BS111'),
  true,
  7
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS111');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  1,
  (SELECT id FROM courses WHERE code = 'BS112'),
  true,
  8
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS112');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  2,
  (SELECT id FROM courses WHERE code = 'BS113'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS113');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  2,
  (SELECT id FROM courses WHERE code = 'BS115'),
  true,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS115');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  1,
  (SELECT id FROM courses WHERE code = 'BS116'),
  true,
  9
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS116');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  1,
  (SELECT id FROM courses WHERE code = 'CS111'),
  true,
  10
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS111');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  2,
  (SELECT id FROM courses WHERE code = 'CS112'),
  true,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS112');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  2,
  (SELECT id FROM courses WHERE code = 'IT111'),
  true,
  7
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT111');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  1,
  1,
  (SELECT id FROM courses WHERE code = 'IS111'),
  true,
  11
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS111');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  2,
  2,
  (SELECT id FROM courses WHERE code = 'UNV119'),
  false,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV119');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  2,
  2,
  (SELECT id FROM courses WHERE code = 'UNV121'),
  false,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV121');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  2,
  1,
  (SELECT id FROM courses WHERE code = 'BS114'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS114');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  2,
  2,
  (SELECT id FROM courses WHERE code = 'BS117'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS117');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  2,
  1,
  (SELECT id FROM courses WHERE code = 'CS211'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS211');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  2,
  1,
  (SELECT id FROM courses WHERE code = 'CS212'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS212');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  2,
  1,
  (SELECT id FROM courses WHERE code = 'SE211'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'SE211');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  2,
  2,
  (SELECT id FROM courses WHERE code = 'IS211'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS211');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  2,
  2,
  (SELECT id FROM courses WHERE code = 'IS212'),
  true,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS212');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  2,
  1,
  (SELECT id FROM courses WHERE code = 'IT211'),
  true,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT211');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  2,
  2,
  (SELECT id FROM courses WHERE code = 'IT212'),
  true,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT212');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  2,
  2,
  (SELECT id FROM courses WHERE code = 'CS213'),
  true,
  7
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS213');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'GENERAL',
  2,
  2,
  (SELECT id FROM courses WHERE code = 'CS214'),
  true,
  8
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS214');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'IS311'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS311');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'CS311'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS311');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'CS312'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS312');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'CS313'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS313');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'CS411'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS411');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'IT311'),
  true,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT311');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'CS314'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS314');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'CS315'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS315');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'CS316'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS316');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'SE315'),
  true,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'SE315');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IS318'),
  true,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS318');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'CS321'),
  false,
  7
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS321');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'CS322'),
  false,
  8
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS322');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'CS331'),
  false,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS331');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'CS332'),
  false,
  9
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS332');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IS351'),
  false,
  10
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS351');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'CS412'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS412');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'CS413'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS413');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'CS315'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS315');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'CS311'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS311');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'CS332'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS332');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'CS331'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS331');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'CS414'),
  true,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS414');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'CS322'),
  true,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS322');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'CS415'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS415');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'CS416'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS416');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'CS423'),
  false,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS423');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'CS424'),
  false,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS424');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'CS433'),
  false,
  7
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS433');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'CS434'),
  false,
  7
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS434');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'CS342'),
  false,
  8
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS342');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'CS443'),
  false,
  8
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS443');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IS444'),
  false,
  9
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS444');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'PR411'),
  true,
  9
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'PR411');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'CS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'PR412'),
  true,
  10
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'PR412');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'IS311'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS311');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IS342'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS342');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'IS312'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS312');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'IS313'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS313');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'CS313'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS313');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IS314'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS314');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IS315'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS315');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'IS316'),
  true,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS316');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IS317'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS317');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IS318'),
  true,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS318');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'CS314'),
  true,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS314');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IS321'),
  false,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS321');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IS322'),
  false,
  7
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS322');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IS331'),
  false,
  8
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS331');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IS332'),
  false,
  9
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS332');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'IS411'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS411');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'CS413'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS413');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IS434'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS434');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IS414'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS414');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'CS414'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS414');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'IS412'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS412');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'IS413'),
  true,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS413');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'CS314'),
  true,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS314');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IS321'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS321');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'IS415'),
  true,
  7
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS415');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'IS341'),
  false,
  8
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS341');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IS342'),
  false,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS342');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IS351'),
  false,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS351');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IS423'),
  false,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS423');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IS424'),
  false,
  7
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS424');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IS433'),
  false,
  8
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS433');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IS443'),
  false,
  9
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS443');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'IS444'),
  false,
  9
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS444');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'PR421'),
  true,
  10
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'PR421');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IS',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'PR422'),
  true,
  10
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'PR422');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'IT312'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT312');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'IT313'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT313');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'IT314'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT314');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'IT315'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT315');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'SE315'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'SE315');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IT316'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT316');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IT317'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT317');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'IT311'),
  true,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT311');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IT318'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT318');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IT319'),
  true,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT319');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'CS313'),
  true,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS313');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  1,
  (SELECT id FROM courses WHERE code = 'IT321'),
  false,
  7
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT321');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IT322'),
  false,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT322');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IT331'),
  false,
  7
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT331');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  3,
  2,
  (SELECT id FROM courses WHERE code = 'IT332'),
  false,
  8
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT332');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'IT411'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT411');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IT413'),
  true,
  1
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT413');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IT414'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT414');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'CS315'),
  true,
  2
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS315');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'IT313'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT313');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'IT446'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT446');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'IT314'),
  true,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT314');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IT444'),
  true,
  3
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT444');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IT342'),
  true,
  4
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT342');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IT416'),
  true,
  5
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT416');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'IT415'),
  true,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT415');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IT341'),
  false,
  6
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT341');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IT423'),
  false,
  7
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT423');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IT424'),
  false,
  8
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT424');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IT433'),
  false,
  9
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT433');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IT434'),
  false,
  10
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT434');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'IT443'),
  false,
  11
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT443');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  1,
  (SELECT id FROM courses WHERE code = 'PR431'),
  true,
  7
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'PR431');

INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  'IT',
  4,
  2,
  (SELECT id FROM courses WHERE code = 'PR432'),
  true,
  12
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'PR432');

-- Add the authoritative 4-column unique constraint
ALTER TABLE curriculum_plans
  ADD CONSTRAINT curriculum_plans_spec_year_sem_course_key
    UNIQUE (specialization, year_of_study, semester_in_year, course_id);

COMMIT;
