SET client_encoding = 'UTF8';

-- =============================================================================
-- 006_prerequisites.sql — Course prerequisites from official 2024 bylaw
-- Generated from fcit_curriculum_terms_by_level_with_terms_v2.json
-- Total prerequisite relationships: 91
-- Idempotent: ON CONFLICT DO NOTHING
-- =============================================================================

BEGIN;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'BS113'),
  (SELECT id FROM courses WHERE code = 'BS111'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS113')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS111')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'UNV121'),
  (SELECT id FROM courses WHERE code = 'UNV113'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV121')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'UNV113')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'BS114'),
  (SELECT id FROM courses WHERE code = 'BS113'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS114')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS113')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'BS117'),
  (SELECT id FROM courses WHERE code = 'BS111'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS117')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS111')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'BS117'),
  (SELECT id FROM courses WHERE code = 'BS116'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS117')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS116')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS211'),
  (SELECT id FROM courses WHERE code = 'CS112'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS211')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS112')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS212'),
  (SELECT id FROM courses WHERE code = 'CS112'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS212')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS112')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'SE211'),
  (SELECT id FROM courses WHERE code = 'CS112'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'SE211')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS112')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS211'),
  (SELECT id FROM courses WHERE code = 'CS112'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS211')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS112')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS212'),
  (SELECT id FROM courses WHERE code = 'BS113'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS212')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS113')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT211'),
  (SELECT id FROM courses WHERE code = 'BS115'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT211')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS115')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT212'),
  (SELECT id FROM courses WHERE code = 'CS111'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT212')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS111')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS213'),
  (SELECT id FROM courses WHERE code = 'CS212'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS213')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS212')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS214'),
  (SELECT id FROM courses WHERE code = 'CS212'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS214')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS212')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS311'),
  (SELECT id FROM courses WHERE code = 'IS211'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS311')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS211')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS311'),
  (SELECT id FROM courses WHERE code = 'IT212'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS311')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT212')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS312'),
  (SELECT id FROM courses WHERE code = 'IT211'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS312')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT211')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS313'),
  (SELECT id FROM courses WHERE code = 'CS212'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS313')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS212')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS411'),
  (SELECT id FROM courses WHERE code = 'BS112'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS411')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS112')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT311'),
  (SELECT id FROM courses WHERE code = 'CS112'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT311')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS112')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS314'),
  (SELECT id FROM courses WHERE code = 'CS211'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS314')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS211')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS315'),
  (SELECT id FROM courses WHERE code = 'IS311'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS315')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS311')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS316'),
  (SELECT id FROM courses WHERE code = 'CS214'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS316')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS214')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'SE315'),
  (SELECT id FROM courses WHERE code = 'SE211'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'SE315')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'SE211')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS318'),
  (SELECT id FROM courses WHERE code = 'BS116'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS318')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS116')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS321'),
  (SELECT id FROM courses WHERE code = 'CS311'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS321')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS311')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS322'),
  (SELECT id FROM courses WHERE code = 'CS311'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS322')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS311')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS331'),
  (SELECT id FROM courses WHERE code = 'CS213'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS331')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS213')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS332'),
  (SELECT id FROM courses WHERE code = 'CS331'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS332')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS331')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS351'),
  (SELECT id FROM courses WHERE code = 'IS311'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS351')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS311')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS412'),
  (SELECT id FROM courses WHERE code = 'IT212'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS412')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT212')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS413'),
  (SELECT id FROM courses WHERE code = 'CS213'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS413')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS213')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS414'),
  (SELECT id FROM courses WHERE code = 'CS314'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS414')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS314')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS415'),
  (SELECT id FROM courses WHERE code = 'CS316'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS415')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS316')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS416'),
  (SELECT id FROM courses WHERE code = 'CS411'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS416')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS411')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS423'),
  (SELECT id FROM courses WHERE code = 'CS316'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS423')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS316')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS424'),
  (SELECT id FROM courses WHERE code = 'CS423'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS424')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS423')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS433'),
  (SELECT id FROM courses WHERE code = 'CS313'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS433')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS313')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS434'),
  (SELECT id FROM courses WHERE code = 'CS214'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS434')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS214')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS342'),
  (SELECT id FROM courses WHERE code = 'IS351'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS342')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS351')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'CS443'),
  (SELECT id FROM courses WHERE code = 'CS314'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS443')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS314')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS444'),
  (SELECT id FROM courses WHERE code = 'IS351'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS444')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS351')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'PR412'),
  (SELECT id FROM courses WHERE code = 'PR411'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'PR412')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'PR411')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS342'),
  (SELECT id FROM courses WHERE code = 'IS313'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS342')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS313')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS312'),
  (SELECT id FROM courses WHERE code = 'IS211'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS312')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS211')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS313'),
  (SELECT id FROM courses WHERE code = 'CS212'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS313')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS212')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS314'),
  (SELECT id FROM courses WHERE code = 'BS116'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS314')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS116')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS315'),
  (SELECT id FROM courses WHERE code = 'IS311'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS315')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS311')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS316'),
  (SELECT id FROM courses WHERE code = 'IS315'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS316')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS315')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS317'),
  (SELECT id FROM courses WHERE code = 'CS211'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS317')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS211')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS321'),
  (SELECT id FROM courses WHERE code = 'IS311'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS321')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS311')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS322'),
  (SELECT id FROM courses WHERE code = 'IS312'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS322')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS312')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS331'),
  (SELECT id FROM courses WHERE code = 'IS317'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS331')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS317')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS332'),
  (SELECT id FROM courses WHERE code = 'IS412'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS332')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS412')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS411'),
  (SELECT id FROM courses WHERE code = 'BS116'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS411')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS116')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS412'),
  (SELECT id FROM courses WHERE code = 'IS311'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS412')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS311')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS413'),
  (SELECT id FROM courses WHERE code = 'IS317'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS413')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS317')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS414'),
  (SELECT id FROM courses WHERE code = 'IS312'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS414')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS312')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS415'),
  (SELECT id FROM courses WHERE code = 'IS311'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS415')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS311')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS341'),
  (SELECT id FROM courses WHERE code = 'IS111'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS341')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS111')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS423'),
  (SELECT id FROM courses WHERE code = 'IS211'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS423')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS211')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS424'),
  (SELECT id FROM courses WHERE code = 'IS311'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS424')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS311')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS433'),
  (SELECT id FROM courses WHERE code = 'IS332'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS433')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS332')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS434'),
  (SELECT id FROM courses WHERE code = 'IS412'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS434')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS412')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IS443'),
  (SELECT id FROM courses WHERE code = 'IS311'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS443')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IS311')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'PR422'),
  (SELECT id FROM courses WHERE code = 'PR421'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'PR422')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'PR421')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT312'),
  (SELECT id FROM courses WHERE code = 'BS116'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT312')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS116')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT313'),
  (SELECT id FROM courses WHERE code = 'IT111'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT313')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT111')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT314'),
  (SELECT id FROM courses WHERE code = 'BS114'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT314')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS114')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT315'),
  (SELECT id FROM courses WHERE code = 'IT211'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT315')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT211')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT316'),
  (SELECT id FROM courses WHERE code = 'IT314'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT316')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT314')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT317'),
  (SELECT id FROM courses WHERE code = 'IT212'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT317')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT212')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT318'),
  (SELECT id FROM courses WHERE code = 'BS115'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT318')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS115')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT319'),
  (SELECT id FROM courses WHERE code = 'IT311'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT319')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT311')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT321'),
  (SELECT id FROM courses WHERE code = 'CS214'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT321')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS214')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT322'),
  (SELECT id FROM courses WHERE code = 'IT111'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT322')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT111')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT331'),
  (SELECT id FROM courses WHERE code = 'BS115'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT331')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'BS115')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT332'),
  (SELECT id FROM courses WHERE code = 'IT315'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT332')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT315')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT411'),
  (SELECT id FROM courses WHERE code = 'IT314'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT411')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT314')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT413'),
  (SELECT id FROM courses WHERE code = 'IT317'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT413')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT317')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT414'),
  (SELECT id FROM courses WHERE code = 'IT313'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT414')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT313')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT415'),
  (SELECT id FROM courses WHERE code = 'IT111'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT415')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT111')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT341'),
  (SELECT id FROM courses WHERE code = 'CS111'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT341')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'CS111')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT342'),
  (SELECT id FROM courses WHERE code = 'IT341'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT342')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT341')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT423'),
  (SELECT id FROM courses WHERE code = 'IT321'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT423')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT321')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT424'),
  (SELECT id FROM courses WHERE code = 'IT317'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT424')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT317')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT433'),
  (SELECT id FROM courses WHERE code = 'IT312'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT433')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT312')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT434'),
  (SELECT id FROM courses WHERE code = 'IT331'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT434')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT331')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT443'),
  (SELECT id FROM courses WHERE code = 'IT316'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT443')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT316')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'IT444'),
  (SELECT id FROM courses WHERE code = 'IT319'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT444')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'IT319')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = 'PR432'),
  (SELECT id FROM courses WHERE code = 'PR431'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'PR432')
  AND EXISTS (SELECT 1 FROM courses WHERE code = 'PR431')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

COMMIT;
