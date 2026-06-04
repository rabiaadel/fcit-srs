SET client_encoding = 'UTF8';

-- =============================================================================
-- 010_demo_student.sql — Demo first-year student account
-- Matches frontend LoginPage.jsx demo credentials
-- Email: s.2024cs001@fci.tanta.edu.eg / Password: Student@2026!
-- =============================================================================

BEGIN;

-- Create demo student user
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    's.2024cs001@fci.tanta.edu.eg',
    crypt('Student@2026!', gen_salt('bf')),
    'student',
    'عمر أحمد الشريف',
    'Omar Ahmed ElSherif',
    true,
    false
  )
  ON CONFLICT (email) DO UPDATE SET
    password_hash = crypt('Student@2026!', gen_salt('bf')),
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en,
    must_change_pw = false
  RETURNING id
)
INSERT INTO students (user_id, student_code, enrollment_year, specialization, current_level, academic_status, cgpa, track)
SELECT
  new_user.id,
  '2024CS0001',
  2025,
  'CS',
  'الفرقة الأولى',
  'active',
  0.000,
  'science_math'
FROM new_user
ON CONFLICT (student_code) DO UPDATE SET
  specialization = EXCLUDED.specialization,
  current_level = EXCLUDED.current_level;

COMMIT;
