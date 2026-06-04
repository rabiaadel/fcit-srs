SET client_encoding = 'UTF8';

-- =============================================================================
-- 004_bylaw_config.sql — Bylaw configuration parameters
-- Extracted from migration_v3.sql. Idempotent: ON CONFLICT (key) DO NOTHING
-- =============================================================================

BEGIN;

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

COMMIT;
