SET client_encoding = 'UTF8';

-- =============================================================================
-- 001_admin_user.sql — Default system administrator
-- Idempotent: ON CONFLICT (email) DO NOTHING
-- =============================================================================

BEGIN;

INSERT INTO users (
    email,
    password_hash,
    role,
    full_name_ar,
    full_name_en,
    is_active,
    must_change_pw
) VALUES (
    'admin@fci.tanta.edu.eg',
    crypt('Admin@2026!', gen_salt('bf')),
    'admin',
    'مدير النظام',
    'System Administrator',
    true,
    false
)
ON CONFLICT (email) DO NOTHING;

COMMIT;
