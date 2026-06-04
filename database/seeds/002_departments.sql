SET client_encoding = 'UTF8';

-- =============================================================================
-- 002_departments.sql — Three active academic departments
-- Idempotent: ON CONFLICT (code) DO NOTHING
-- =============================================================================

BEGIN;

INSERT INTO departments (code, name_ar, name_en, is_active) VALUES
    ('CS', 'علوم الحاسب', 'Computer Science', true),
    ('IS', 'نظم المعلومات', 'Information Systems', true),
    ('IT', 'تقنية المعلومات', 'Information Technology', true)
ON CONFLICT (code) DO NOTHING;

COMMIT;
