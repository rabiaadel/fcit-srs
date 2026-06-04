-- =============================================================================
-- FCIT SRS — Migration v3
-- New tables: curriculum_plans, bylaw_config
-- Enhancements: notifications.type, course_offerings.schedule detail,
--               departments CRUD support, academic_plans view
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. notifications — add type column (enum) if not exists
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM
    ('enrollment','grade','warning','dismissal','announcement','semester_event',
     'attendance_warning','system','password_reset','schedule_assigned');
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS type notification_type DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS link VARCHAR(500);

-- Back-fill existing notifications with a sensible default
UPDATE notifications SET type = 'system' WHERE type IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. curriculum_plans — canonical study plan per specialization
--    Defines which courses belong to Year X, Semester Y of the program.
--    Admin can override the defaults at any time (superadmin control).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS curriculum_plans (
    id                  SERIAL PRIMARY KEY,
    specialization      VARCHAR(10) NOT NULL,        -- CS, IS, IT, SE, or 'GENERAL'
    year_of_study       INT NOT NULL CHECK (year_of_study BETWEEN 1 AND 4),
    semester_in_year    INT NOT NULL CHECK (semester_in_year IN (1, 2, 3)), -- 1=fall, 2=spring, 3=summer
    course_id           INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    is_mandatory        BOOLEAN DEFAULT TRUE,         -- advisory field
    display_order       INT DEFAULT 0,
    notes               TEXT,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (specialization, course_id)               -- each course in plan once per spec
);

CREATE INDEX IF NOT EXISTS idx_curriculum_spec ON curriculum_plans(specialization);
CREATE INDEX IF NOT EXISTS idx_curriculum_year_sem ON curriculum_plans(year_of_study, semester_in_year);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. bylaw_config — admin-overridable bylaw parameter store
--    System reads these at runtime; admins can change without code deploy.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bylaw_config (
    id              SERIAL PRIMARY KEY,
    key             VARCHAR(100) UNIQUE NOT NULL,
    value           TEXT NOT NULL,
    value_type      VARCHAR(20) DEFAULT 'number' CHECK (value_type IN ('number','boolean','json','string')),
    category        VARCHAR(50) NOT NULL DEFAULT 'general',
    label_ar        VARCHAR(255),
    description     TEXT,
    article_ref     VARCHAR(50),
    default_value   TEXT NOT NULL,
    min_value       NUMERIC,
    max_value       NUMERIC,
    is_active       BOOLEAN DEFAULT TRUE,
    updated_by      UUID REFERENCES users(id),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default bylaw parameters
INSERT INTO bylaw_config (key, value, value_type, category, label_ar, description, article_ref, default_value, min_value, max_value) VALUES
('total_credits_required',      '138',  'number',  'graduation',    'إجمالي الساعات المطلوبة',           'Total credit hours required for graduation',           'Art.4',   '138',  60,   200),
('min_cgpa_for_graduation',     '2.0',  'number',  'graduation',    'الحد الأدنى للمعدل للتخرج',          'Minimum CGPA required to graduate',                    'Art.4',   '2.0',  0.0,  4.0),
('max_regular_semesters',       '8',    'number',  'graduation',    'الحد الأقصى للفصول الدراسية',        'Maximum number of regular semesters allowed',          'Art.4',   '8',    4,    16),
('min_attendance_pct',          '42',   'number',  'attendance',    'الحد الأدنى لنسبة الحضور',           'Minimum attendance percentage to sit exam (42%)',       'Art.14',  '42',   20,   80),
('excessive_absence_threshold', '25',   'number',  'attendance',    'حد الغياب الزائد للإنذار المبكر',    'Absence % that triggers early warning',                'Art.14',  '25',   10,   50),
('min_passing_total_pct',       '40',   'number',  'grading',       'الحد الأدنى للنجاح',                 'Minimum total percentage to pass (Art.16 BUG-008 fix)','Art.16',  '40',   30,   60),
('min_passing_final_pct',       '30',   'number',  'grading',       'الحد الأدنى لدرجة الامتحان النهائي', 'Minimum final exam percentage to pass',                'Art.16',  '30',   20,   50),
('warning_cgpa_threshold',      '2.0',  'number',  'warnings',      'حد المعدل للإنذار',                  'CGPA below which a warning is issued',                 'Art.25',  '2.0',  1.0,  3.0),
('max_consecutive_warnings',    '4',    'number',  'warnings',      'الحد الأقصى للإنذارات المتتالية',    'Consecutive warnings before dismissal',                'Art.26',  '4',    2,    8),
('max_total_warnings',          '6',    'number',  'warnings',      'الحد الأقصى للإنذارات الإجمالية',    'Total warnings before dismissal',                      'Art.26',  '6',    3,    10),
('summer_max_credits',          '9',    'number',  'registration',  'الحد الأقصى لساعات الفصل الصيفي',    'Max credit hours in summer semester',                  'Art.11',  '9',    3,    12),
('cgpa_limit_low',              '18',   'number',  'registration',  'حد الساعات لمعدل أقل من 2.0',        'Max credits when CGPA < 2.0',                          'Art.11',  '18',   12,   30),
('cgpa_limit_mid',              '21',   'number',  'registration',  'حد الساعات لمعدل 2.0-2.99',          'Max credits when CGPA 2.0-2.99',                       'Art.11',  '21',   15,   25),
('cgpa_limit_high',             '24',   'number',  'registration',  'حد الساعات لمعدل ≥ 3.0',             'Max credits when CGPA >= 3.0',                         'Art.11',  '24',   18,   30),
('max_voluntary_retakes',       '3',    'number',  'retakes',       'الحد الأقصى لإعادات التحسين',        'Maximum voluntary improvement retakes',                'Art.23',  '3',    1,    5),
('project_min_credits',         '85',   'number',  'graduation',    'الحد الأدنى لساعات مشروع التخرج',    'Credits required before Graduation Project 1',         'Art.21',  '85',   60,   110),
('honors_min_cgpa',             '3.0',  'number',  'graduation',    'الحد الأدنى للمعدل لمرتبة الشرف',    'Minimum CGPA for honors graduation',                   'Art.27',  '3.0',  2.5,  4.0),
('honors_max_semesters',        '8',    'number',  'graduation',    'الحد الأقصى للفصول لمرتبة الشرف',    'Max semesters for honors graduation',                  'Art.27',  '8',    6,    12),
('add_drop_weeks',              '2',    'number',  'calendar',      'مدة فترة الحذف والإضافة (أسابيع)',   'Add/drop period in weeks from semester start',         'Art.12',  '2',    1,    4),
('withdrawal_weeks',            '7',    'number',  'calendar',      'مدة فترة الانسحاب (أسابيع)',          'Withdrawal period in weeks from semester start',       'Art.13',  '7',    4,    12),
('min_credits_per_semester',    '9',    'number',  'registration',  'الحد الأدنى للساعات في الفصل',       'Minimum credit hours to be registered per semester',   'Art.13',  '9',    1,    18)
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. doctor_schedule_slots — structured weekly schedule per offering
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_schedule_slots (
    id              SERIAL PRIMARY KEY,
    offering_id     INT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
    day_of_week     VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Sun','Mon','Tue','Wed','Thu','Fri','Sat')),
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    room            VARCHAR(50),
    session_type    VARCHAR(20) DEFAULT 'lecture' CHECK (session_type IN ('lecture','lab','tutorial','project')),
    UNIQUE (offering_id, day_of_week, start_time)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. View: curriculum plan with course details (admin & student)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_curriculum_plan AS
SELECT
    cp.id,
    cp.specialization,
    cp.year_of_study,
    cp.semester_in_year,
    cp.is_mandatory,
    cp.display_order,
    cp.notes,
    c.id AS course_id,
    c.code AS course_code,
    c.name_ar AS course_name_ar,
    c.name_en AS course_name_en,
    c.credits,
    c.category,
    c.level AS course_level,
    c.is_credit_bearing,
    c.is_active,
    -- prerequisites count
    (SELECT COUNT(*) FROM course_prerequisites WHERE course_id = c.id) AS prereq_count
FROM curriculum_plans cp
JOIN courses c ON c.id = cp.course_id
ORDER BY cp.specialization, cp.year_of_study, cp.semester_in_year, cp.display_order, c.code;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Function: get_bylaw_value — runtime bylaw parameter lookup
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_bylaw_value(p_key VARCHAR)
RETURNS NUMERIC AS $$
DECLARE v_val TEXT;
BEGIN
    SELECT value INTO v_val FROM bylaw_config WHERE key = p_key AND is_active = TRUE;
    IF v_val IS NULL THEN
        SELECT default_value INTO v_val FROM bylaw_config WHERE key = p_key;
    END IF;
    RETURN v_val::NUMERIC;
EXCEPTION WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Audit log for bylaw config changes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id   VARCHAR(100),
    old_value   JSONB,
    new_value   JSONB,
    description TEXT,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Trigger: log bylaw_config changes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION log_bylaw_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.value != NEW.value THEN
        INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, old_value, new_value, description)
        VALUES (
            NEW.updated_by,
            'BYLAW_CONFIG_CHANGED',
            'bylaw_config',
            NEW.key,
            jsonb_build_object('value', OLD.value),
            jsonb_build_object('value', NEW.value),
            'Bylaw parameter "' || NEW.key || '" changed from ' || OLD.value || ' to ' || NEW.value
        );
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bylaw_config_log ON bylaw_config;
CREATE TRIGGER trg_bylaw_config_log
    BEFORE UPDATE ON bylaw_config
    FOR EACH ROW EXECUTE FUNCTION log_bylaw_change();

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Populate curriculum_plans with FCIT standard curriculum (all specializations)
--    Based on bylaws extracted from the FCIT 2024 regulation document.
--    GENERAL = courses required by all specializations regardless.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    v_cs_count INT;
BEGIN
    SELECT COUNT(*) INTO v_cs_count FROM curriculum_plans;
    IF v_cs_count = 0 THEN
        -- Insert plans using course codes (fail silently if course doesn't exist)
        INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, display_order)
        SELECT 'GENERAL', c.year_study, c.sem, co.id, c.ord
        FROM (VALUES
            (1, 1, 1,  'CS101'), (1, 1, 2,  'CS102'), (1, 1, 3,  'MA101'),
            (1, 2, 4,  'MA102'), (1, 2, 5,  'BS113'), (1, 2, 6,  'CS112'),
            (2, 1, 1,  'CS211'), (2, 1, 2,  'CS212'), (2, 1, 3,  'MA211'),
            (2, 2, 4,  'CS221'), (2, 2, 5,  'CS222'), (2, 2, 6,  'BS214'),
            (3, 1, 1,  'CS311'), (3, 1, 2,  'CS312'), (3, 1, 3,  'CS313'),
            (3, 2, 4,  'CS321'), (3, 2, 5,  'CS322'), (3, 2, 6,  'CS323'),
            (4, 1, 1,  'CS411'), (4, 1, 2,  'CS412'), (4, 1, 3,  'PR411'),
            (4, 2, 4,  'CS421'), (4, 2, 5,  'PR412'), (4, 2, 6,  'CS422')
        ) AS c(year_study, sem, ord, code)
        JOIN courses co ON co.code = c.code
        ON CONFLICT (specialization, course_id) DO NOTHING;
    END IF;
END $$;

-- (Auto-population removed in favor of fix_curriculum.js)
-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Index on notifications for notification detail fetch
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_id_user ON notifications(id, user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. attendance_sessions unique constraint (prevents duplicate sessions)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- clean any existing duplicates first
  DELETE FROM attendance_sessions a
  USING attendance_sessions b
  WHERE a.id < b.id
    AND a.offering_id = b.offering_id
    AND a.session_date::date = b.session_date::date
    AND a.session_type = b.session_type;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE attendance_sessions
  DROP CONSTRAINT IF EXISTS uq_att_offering_date_type;
ALTER TABLE attendance_sessions
  ADD CONSTRAINT uq_att_offering_date_type
  UNIQUE (offering_id, session_date, session_type);
