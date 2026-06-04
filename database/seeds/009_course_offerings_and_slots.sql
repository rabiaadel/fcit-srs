SET client_encoding = 'UTF8';

-- =============================================================================
-- 009_course_offerings_and_slots.sql — Course offerings and schedule slots
-- Generated from final_doctors_schedule_modified.json
-- Total unique offerings: 79
-- Idempotent: ON CONFLICT DO UPDATE / DO NOTHING
-- =============================================================================

BEGIN;

-- نانسي الحفناوي → BS111 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'BS111'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'نانسي الحفناوي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS111')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '11:00', '13:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- نانسي الحفناوي → BS115 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'BS115'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'نانسي الحفناوي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS115')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '09:00', '11:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- نانسي الحفناوي → BS117 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'BS117'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'نانسي الحفناوي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS117')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '13:00', '15:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- نانسي الحفناوي → IS212 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS212'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'نانسي الحفناوي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS212')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Tue', '11:00', '13:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أمنية البربري → IS111 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS111'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أمنية البربري'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS111')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sun', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أمنية البربري → IS211 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS211'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أمنية البربري'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS211')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sun', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أمنية البربري → IS351 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS351'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أمنية البربري'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS351')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Tue', '09:00', '11:00', 'Hall 2'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أمنية البربري → IS318 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS318'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أمنية البربري'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS318')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Tue', '11:00', '13:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أمنية البربري → IS314 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS314'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أمنية البربري'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS314')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Wed', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- إيمان البقري → IT411 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT411'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'إيمان البقري'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT411')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Wed', '09:00', '11:00', 'Hall 2'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- إيمان البقري → IS415 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS415'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'إيمان البقري'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS415')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '11:00', '13:00', 'Hall 1'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أحمد سليم → UNV112 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'UNV112'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أحمد سليم'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV112')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '11:00', '13:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أحمد سليم → IT311 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT311'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أحمد سليم'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT311')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sun', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أحمد سليم → CS313 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS313'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أحمد سليم'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS313')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sun', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أحمد سليم → CS332 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS332'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أحمد سليم'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS332')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Wed', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أحمد سليم → CS316 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS316'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أحمد سليم'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS316')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Thu', '07:00', '09:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أحمد سليم → CS314 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS314'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أحمد سليم'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS314')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sun', '09:00', '11:00', 'Hall 3'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أحمد سليم → SE321 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'SE321'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أحمد سليم'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'SE321')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sun', '09:00', '11:00', 'Central Hall (Lower)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أروى أبو الوفا → UNV114 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'UNV114'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أروى أبو الوفا'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV114')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Tue', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أروى أبو الوفا → SE211 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'SE211'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أروى أبو الوفا'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'SE211')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Wed', '11:00', '13:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أروى أبو الوفا → SE315 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'SE315'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أروى أبو الوفا'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'SE315')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Wed', '11:00', '13:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أروى أبو الوفا → IT318 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT318'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أروى أبو الوفا'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT318')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '11:00', '13:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أروى أبو الوفا → IT415 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT415'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أروى أبو الوفا'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT415')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أروى أبو الوفا → IT413 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT413'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أروى أبو الوفا'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT413')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Tue', '11:00', '13:00', 'Hall 3'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أسامة غنيم → CS111 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS111'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أسامة غنيم'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS111')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sun', '11:00', '13:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أسامة غنيم → CS112 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS112'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أسامة غنيم'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS112')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Wed', '11:00', '13:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أسامة غنيم → CS211 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS211'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أسامة غنيم'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS211')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Tue', '11:00', '13:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أسامة غنيم → CS213 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS213'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أسامة غنيم'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS213')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Thu', '11:00', '13:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- أسامة غنيم → CS331 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS331'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'أسامة غنيم'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS331')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Thu', '11:00', '13:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- إبراهيم جاد → IS317 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS317'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'إبراهيم جاد'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS317')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sun', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- إبراهيم جاد → IS341 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS341'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'إبراهيم جاد'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS341')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- إبراهيم جاد → IS413 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS413'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'إبراهيم جاد'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS413')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sun', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- تهاني علام → IT317 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT317'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'تهاني علام'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT317')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Thu', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- تهاني علام → IT315 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT315'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'تهاني علام'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT315')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '11:00', '13:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- شيماء هجرس → BS116 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'BS116'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'شيماء هجرس'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS116')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '09:00', '11:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- شيماء هجرس → UNV111 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'UNV111'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'شيماء هجرس'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV111')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Wed', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- شيماء هجرس → IS311 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS311'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'شيماء هجرس'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS311')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '11:00', '13:00', 'Central Hall (Lower)'
  UNION ALL
  SELECT 'Sun', '11:00', '13:00', 'Central Hall (Lower)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- شيماء هجرس → IS312 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS312'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'شيماء هجرس'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS312')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '09:00', '11:00', 'Hall 1'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- شيماء هجرس → IS315 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS315'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'شيماء هجرس'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS315')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- شيماء هجرس → IS321 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS321'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'شيماء هجرس'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS321')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Tue', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- شيماء هجرس → IS411 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS411'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'شيماء هجرس'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS411')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '07:00', '09:00', 'Hall 3'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- شيماء هجرس → IS342 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS342'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'شيماء هجرس'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS342')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '09:00', '11:00', 'Hall 1'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- شيماء هجرس → IS414 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS414'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'شيماء هجرس'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS414')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Tue', '09:00', '11:00', 'Hall 3'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- عايدة نصر → BS112 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'BS112'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'عايدة نصر'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS112')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '09:00', '11:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- عايدة نصر → BS115 (الترم الثاني) Section B
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'BS115'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'عايدة نصر'),
    60,
    true,
    'B'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS115')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- عايدة نصر → IT211 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT211'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'عايدة نصر'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT211')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Thu', '13:00', '15:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- عايدة نصر → IT314 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT314'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'عايدة نصر'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT314')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Thu', '09:00', '11:00', 'Hall 2'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- عايدة نصر → IT322 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT322'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'عايدة نصر'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT322')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sun', '11:00', '13:00', 'Hall 3'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- عايدة نصر → IT313 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT313'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'عايدة نصر'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT313')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Wed', '09:00', '11:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- عايدة نصر → IT414 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT414'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'عايدة نصر'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT414')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '09:00', '11:00', 'Hall 2'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- مروة → IT314 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT314'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'مروة'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT314')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Tue', '09:00', '11:00', 'Hall 1'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- مريان وجدي → IT212 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT212'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'مريان وجدي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT212')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Tue', '09:00', '11:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- مريان وجدي → IT312 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT312'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'مريان وجدي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT312')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Thu', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- مريان وجدي → IT319 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT319'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'مريان وجدي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT319')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sun', '09:00', '11:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- مريان وجدي → IT316 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT316'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'مريان وجدي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT316')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Thu', '15:00', '17:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- مريان وجدي → CS443 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS443'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'مريان وجدي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS443')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '11:00', '13:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- مريان وجدي → IT444 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT444'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'مريان وجدي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT444')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Tue', '09:00', '11:00', 'Hall 1'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- مصطفى العشري → BS113 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'BS113'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'مصطفى العشري'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS113')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sun', '11:00', '13:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- مصطفى العشري → CS212 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS212'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'مصطفى العشري'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS212')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Thu', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- مصطفى العشري → CS311 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS311'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'مصطفى العشري'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS311')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '09:00', '11:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- مصطفى العشري → CS411 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS411'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'مصطفى العشري'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS411')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Wed', '09:00', '11:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- مصطفى العشري → CS433 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS433'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'مصطفى العشري'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS433')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '13:00', '15:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- هاني الغايش → IT321 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IT321'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'هاني الغايش'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IT321')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Wed', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- هاني الغايش → IS313 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS313'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'هاني الغايش'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS313')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sun', '11:00', '13:00', 'Hall 3'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- هاني الغايش → IS321 (الترم الثاني) Section B
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS321'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'هاني الغايش'),
    60,
    true,
    'B'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS321')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Thu', '11:00', '13:00', 'Hall 3'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- هاني الغايش → IS412 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'IS412'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'هاني الغايش'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'IS412')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '11:00', '13:00', 'Hall 1'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- هاني الغايش → PR421 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'PR421'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'هاني الغايش'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'PR421')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Thu', '11:00', '13:00', 'Hall 3'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- هناء عبد الهادي → BS114 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'BS114'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'هناء عبد الهادي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'BS114')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- هناء عبد الهادي → CS413 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS413'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'هناء عبد الهادي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS413')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Wed', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- هناء عبد الهادي → CS331 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS331'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'هناء عبد الهادي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS331')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '07:00', '09:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- هناء عبد الهادي → CS416 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS416'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'هناء عبد الهادي'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS416')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '07:00', '09:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- هناء عيسى → CS214 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS214'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'هناء عيسى'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS214')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '09:00', '11:00', 'Central Hall (Upper)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- وليد سمير → UNV113 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'UNV113'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'وليد سمير'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'UNV113')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '13:00', '15:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- وليد عبد الخالق → CS312 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS312'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'وليد عبد الخالق'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS312')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Wed', '11:00', '13:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- وليد عبد الخالق → CS314 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS314'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'وليد عبد الخالق'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS314')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '11:00', '13:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- وليد عبد الخالق → CS315 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS315'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'وليد عبد الخالق'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS315')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Thu', '07:00', '09:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- وليد عبد الخالق → CS315 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS315'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'وليد عبد الخالق'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS315')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Sat', '09:00', '11:00', 'Central Hall (Lower)'
  UNION ALL
  SELECT 'Sun', '09:00', '11:00', 'Central Hall (Lower)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- وليد عبد الخالق → CS434 (الترم الأول) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS434'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'وليد عبد الخالق'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS434')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '09:00', '11:00', 'Central Hall (Lower)'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

-- وليد عبد الخالق → CS415 (الترم الثاني) Section A
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    (SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026'),
    (SELECT id FROM courses WHERE code = 'CS415'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = 'وليد عبد الخالق'),
    60,
    true,
    'A'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = 'CS415')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
  SELECT 'Mon', '11:00', '13:00', 'Online'
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

COMMIT;
