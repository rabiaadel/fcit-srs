const fs = require('fs');

const classes = [
  // Year 1 - First Semester 2025
  { sem: 'fall2025', c: 'BS112', dr: 'aida', day: 'Sat', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'fall2025', c: 'CS111', dr: 'osama', day: 'Sun', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'IS111', dr: 'omnia', day: 'Sun', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'BS111', dr: 'nancy', day: 'Mon', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'BS116', dr: 'shimaa', day: 'Mon', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'fall2025', c: 'UNV113', dr: 'walid_s', day: 'Mon', start: '13:00', end: '15:00', room: 'Online', section: 'Main' },
  // Year 1 - Second Semester 2026
  { sem: 'spring2026', c: 'BS115', dr: 'aida', day: 'Sat', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'UNV112', dr: 'ahmed', day: 'Sat', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'BS113', dr: 'mostafa', day: 'Sun', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'BS115', dr: 'nancy', day: 'Mon', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Section 2' },
  { sem: 'spring2026', c: 'UNV114', dr: 'arwa', day: 'Tue', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'UNV111', dr: 'shimaa', day: 'Wed', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'CS112', dr: 'osama', day: 'Wed', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  // Year 2 - First Semester 2025
  { sem: 'fall2025', c: 'BS114', dr: 'hanaa_h', day: 'Sat', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'BS117', dr: 'nancy', day: 'Sat', start: '13:00', end: '15:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'CS211', dr: 'osama', day: 'Tue', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'fall2025', c: 'SE211', dr: 'arwa', day: 'Wed', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'fall2025', c: 'CS212', dr: 'mostafa', day: 'Thu', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'IT211', dr: 'aida', day: 'Thu', start: '13:00', end: '15:00', room: 'Online', section: 'Main' },
  // Year 2 - Second Semester 2026
  { sem: 'spring2026', c: 'IS211', dr: 'omnia', day: 'Sun', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'CS214', dr: 'hanaa_e', day: 'Mon', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'IT317', dr: 'marian', day: 'Tue', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'IS212', dr: 'nancy', day: 'Tue', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'CS213', dr: 'osama', day: 'Thu', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  // Year 3 CS - First Semester 2025
  { sem: 'fall2025', c: 'IT311', dr: 'ahmed', day: 'Sun', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'CS313', dr: 'ahmed', day: 'Sun', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'CS311', dr: 'mostafa', day: 'Mon', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'fall2025', c: 'IS311', dr: 'shimaa', day: 'Mon', start: '11:00', end: '13:00', room: 'Central Hall (Lower)', section: 'Main' },
  { sem: 'fall2025', c: 'CS312', dr: 'walid_k', day: 'Wed', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'CS331', dr: 'osama', day: 'Thu', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  // Year 3 CS - Second Semester 2026
  { sem: 'spring2026', c: 'CS314', dr: 'walid_k', day: 'Sat', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'CS332', dr: 'ahmed', day: 'Wed', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'CS411', dr: 'mostafa', day: 'Wed', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'SE315', dr: 'arwa', day: 'Wed', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'CS315', dr: 'walid_k', day: 'Thu', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'CS316', dr: 'ahmed', day: 'Thu', start: '07:00', end: '09:00', room: 'Central Hall (Upper)', section: 'Main' },
  // Year 3 IT - First Semester 2025
  { sem: 'fall2025', c: 'IT311', dr: 'ahmed', day: 'Sun', start: '11:00', end: '13:00', room: 'Online', section: 'Section B' },
  { sem: 'fall2025', c: 'IT321', dr: 'hany', day: null, start: null, end: null, room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'CS313', dr: 'ahmed', day: 'Tue', start: '11:00', end: '13:00', room: 'Online', section: 'Section B' },
  { sem: 'fall2025', c: 'IT315', dr: 'tahani', day: 'Wed', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'IT312', dr: 'marian', day: 'Thu', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'IT314', dr: 'aida', day: 'Thu', start: '09:00', end: '11:00', room: 'Hall 2', section: 'Main' },
  // Year 3 IT - Second Semester 2026
  { sem: 'spring2026', c: 'IT319', dr: 'marian', day: 'Sun', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'IT322', dr: 'aida', day: 'Sun', start: '11:00', end: '13:00', room: 'Hall 3', section: 'Main' },
  { sem: 'spring2026', c: 'IT318', dr: 'arwa', day: 'Mon', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IT317', dr: 'tahani', day: 'Thu', start: '07:00', end: '09:00', room: 'Online', section: 'Section B' },
  { sem: 'spring2026', c: 'IT316', dr: 'marian', day: 'Thu', start: '15:00', end: '17:00', room: 'Online', section: 'Main' },
  // Year 3 IS - First Semester 2025
  { sem: 'fall2025', c: 'CS314', dr: 'ahmed', day: 'Sun', start: '09:00', end: '11:00', room: 'Hall 3', section: 'Main' },
  { sem: 'fall2025', c: 'IS313', dr: 'hany', day: 'Sun', start: '11:00', end: '13:00', room: 'Hall 3', section: 'Main' },
  { sem: 'fall2025', c: 'IS311', dr: 'shimaa', day: 'Sun', start: '11:00', end: '13:00', room: 'Central Hall (Lower)', section: 'Section B' },
  { sem: 'fall2025', c: 'IS312', dr: 'shimaa', day: 'Mon', start: '09:00', end: '11:00', room: 'Hall 1', section: 'Main' },
  { sem: 'fall2025', c: 'CS313', dr: 'ahmed', day: 'Tue', start: '07:00', end: '09:00', room: 'Online', section: 'Section C' },
  { sem: 'fall2025', c: 'IS351', dr: 'omnia', day: 'Tue', start: '09:00', end: '11:00', room: 'Hall 2', section: 'Main' },
  // Year 3 IS - Second Semester 2026
  { sem: 'spring2026', c: 'IS315', dr: 'shimaa', day: 'Sat', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IS317', dr: 'ibrahim', day: 'Sun', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IS321', dr: 'shimaa', day: 'Tue', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IS318', dr: 'omnia', day: 'Tue', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IS314', dr: 'omnia', day: 'Wed', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IS321', dr: 'hany', day: 'Thu', start: '11:00', end: '13:00', room: 'Hall 3', section: 'Section B' },
  // Year 4 CS - First Semester 2025
  { sem: 'fall2025', c: 'CS315', dr: 'walid_k', day: 'Sat', start: '09:00', end: '11:00', room: 'Central Hall (Lower)', section: 'Main' },
  { sem: 'fall2025', c: 'CS443', dr: 'marian', day: 'Sat', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'fall2025', c: 'SE321', dr: 'ahmed', day: 'Sun', start: '09:00', end: '11:00', room: 'Central Hall (Lower)', section: 'Main' },
  { sem: 'fall2025', c: 'CS434', dr: 'walid_k', day: 'Mon', start: '09:00', end: '11:00', room: 'Central Hall (Lower)', section: 'Main' },
  { sem: 'fall2025', c: 'CS413', dr: 'hanaa_h', day: 'Wed', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  // Year 4 CS - Second Semester 2026
  { sem: 'spring2026', c: 'CS331', dr: 'hanaa_h', day: 'Sat', start: '07:00', end: '09:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'CS332', dr: 'ahmed', day: 'Sun', start: '07:00', end: '09:00', room: 'Central Hall (Upper)', section: 'Section B' },
  { sem: 'spring2026', c: 'CS416', dr: 'hanaa_h', day: 'Mon', start: '07:00', end: '09:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'CS415', dr: 'walid_k', day: 'Mon', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'CS433', dr: 'mostafa', day: null, start: null, end: null, room: 'Online', section: 'Main' },
  // Year 4 IT - First Semester 2025
  { sem: 'fall2025', c: 'IT415', dr: 'arwa', day: 'Sat', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'IT315', dr: 'tahani', day: 'Sat', start: '11:00', end: '13:00', room: 'Online', section: 'Section B' },
  { sem: 'fall2025', c: 'CS315', dr: 'walid_k', day: 'Sun', start: '09:00', end: '11:00', room: 'Central Hall (Lower)', section: 'Section B' },
  { sem: 'fall2025', c: 'IT444', dr: 'marian', day: 'Tue', start: '09:00', end: '11:00', room: 'Hall 1', section: 'Main' },
  { sem: 'fall2025', c: 'IT313', dr: 'aida', day: 'Wed', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  // Year 4 IT - Second Semester 2026
  { sem: 'spring2026', c: 'IT319', dr: 'marian', day: 'Sun', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Section B' },
  { sem: 'spring2026', c: 'IT414', dr: 'aida', day: 'Mon', start: '09:00', end: '11:00', room: 'Hall 2', section: 'Main' },
  { sem: 'spring2026', c: 'IT413', dr: 'arwa', day: 'Tue', start: '11:00', end: '13:00', room: 'Hall 3', section: 'Main' },
  { sem: 'spring2026', c: 'IT314', dr: 'marwa', day: 'Tue', start: '09:00', end: '11:00', room: 'Hall 1', section: 'Main' },
  { sem: 'spring2026', c: 'IT411', dr: 'iman', day: 'Wed', start: '09:00', end: '11:00', room: 'Hall 2', section: 'Main' },
  // Year 4 IS - First Semester 2025
  { sem: 'fall2025', c: 'IS341', dr: 'ibrahim', day: 'Sat', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'IS411', dr: 'shimaa', day: 'Sat', start: '07:00', end: '09:00', room: 'Hall 3', section: 'Main' },
  { sem: 'fall2025', c: 'IS412', dr: 'hany', day: 'Sat', start: '11:00', end: '13:00', room: 'Hall 1', section: 'Main' },
  { sem: 'fall2025', c: 'CS314', dr: 'ahmed', day: null, start: null, end: null, room: 'Hall 3', section: 'Section B' },
  { sem: 'fall2025', c: 'IS351', dr: 'omnia', day: 'Sun', start: '09:00', end: '11:00', room: 'Hall 2', section: 'Section B' },
  // Year 4 IS - Second Semester 2026
  { sem: 'spring2026', c: 'IS413', dr: 'ibrahim', day: 'Sun', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IS342', dr: 'shimaa', day: 'Mon', start: '09:00', end: '11:00', room: 'Hall 1', section: 'Main' },
  { sem: 'spring2026', c: 'IS415', dr: 'iman', day: 'Mon', start: '11:00', end: '13:00', room: 'Hall 1', section: 'Main' },
  { sem: 'spring2026', c: 'IS414', dr: 'shimaa', day: 'Tue', start: '09:00', end: '11:00', room: 'Hall 3', section: 'Main' },
  { sem: 'spring2026', c: 'IS421', dr: 'hany', day: 'Thu', start: '11:00', end: '13:00', room: 'Hall 3', section: 'Main' }
];

function getCapacity(room) {
  if (room && room.includes('Online')) return 80;
  if (room && room.includes('Central Hall')) return 60;
  return 50;
}

let out = `-- =============================================================================
-- Seed 004: Real Professors & Official Timetable Schedule
-- Source: FCIT Official Timetable PDF (All Years, All Specializations)
-- Professors: 18 total (1 existing demo updated + 17 new)
-- Password for all doctors: Doctor@2026!
-- BCrypt hash (10 rounds): $2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW
-- =============================================================================

ALTER TABLE course_offerings ADD COLUMN IF NOT EXISTS section_label VARCHAR(50) DEFAULT 'Main';
ALTER TABLE course_offerings DROP CONSTRAINT IF EXISTS course_offerings_semester_id_course_id_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_offerings_semester_id_course_id_section_key'
  ) THEN
    ALTER TABLE course_offerings ADD CONSTRAINT course_offerings_semester_id_course_id_section_key UNIQUE (semester_id, course_id, section_label);
  END IF;
END $$;

DO $$
DECLARE
  v_fall2025_id    INT;
  v_spring2026_id  INT;
  v_cs_dept        INT;
  v_is_dept        INT;
  v_it_dept        INT;
  v_se_dept        INT;
  
  v_dr_ahmed       UUID;   -- Dr. Ahmed Selim        (…000000002, existing)
  v_dr_aida        UUID;   -- Dr. Aida Nasr          (…000000010)
  v_dr_osama       UUID;   -- Dr. Osama Ghoneim      (…000000011)
  v_dr_omnia       UUID;   -- Assoc.Prof. Omnia El Barbary (…000000012)
  v_dr_nancy       UUID;   -- Prof. Nancy Al-Hafnawi (…000000013)
  v_dr_shimaa      UUID;   -- Dr. Shimaa Hagras      (…000000014)
  v_dr_walid_s     UUID;   -- Dr. Walid Samir        (…000000015)
  v_dr_mostafa     UUID;   -- Dr. Mostafa Al-Ashri   (…000000016)
  v_dr_arwa        UUID;   -- Dr. Arwa Abu Al-Wafa   (…000000017)
  v_dr_hanaa_h     UUID;   -- Dr. Hanaa Abd Al-Hadi  (…000000018)
  v_dr_hanaa_e     UUID;   -- Dr. Hanaa Eissa        (…000000019)
  v_dr_marian      UUID;   -- Dr. Marian Wagdy       (…000000020)
  v_dr_walid_k     UUID;   -- Dr. Walid Abd Al-Khaliq(…000000021)
  v_dr_hany        UUID;   -- Dr. Hany Al-Ghayesh    (…000000022)
  v_dr_tahani      UUID;   -- Dr. Tahani Allam       (…000000023)
  v_dr_ibrahim     UUID;   -- Dr. Ibrahim Gad        (…000000024)
  v_dr_iman        UUID;   -- Assoc.Prof. Iman El Baqari (…000000025)
  v_dr_marwa       UUID;   -- Dr. Marwa Salama       (…000000026)
  
  v_offering_id    INT;
  v_active_offering_ids INT[] := ARRAY[]::INT[];
BEGIN
  IF EXISTS (SELECT 1 FROM seed_logs WHERE seed_name = '004_real_professors.sql') THEN
    RAISE NOTICE 'Seed 004 already applied, skipping execution.';
    RETURN;
  END IF;

  -- Resolve foreign keys
  SELECT id INTO v_fall2025_id   FROM semesters WHERE label = 'First Semester 2025';
  SELECT id INTO v_spring2026_id FROM semesters WHERE label = 'Second Semester 2026';
  SELECT id INTO v_cs_dept FROM departments WHERE code = 'CS';
  SELECT id INTO v_is_dept FROM departments WHERE code = 'IS';
  SELECT id INTO v_it_dept FROM departments WHERE code = 'IT';
  SELECT id INTO v_se_dept FROM departments WHERE code = 'SE';

  -- ── 1. Clean up retired data and update demo doctor ──────────────────
  -- Remove duplicate Dr. Arwa Essam if she exists
  DELETE FROM course_offerings WHERE doctor_id = (SELECT id FROM doctors WHERE user_id = '00000000-0000-0000-0000-000000000027');
  DELETE FROM doctors WHERE user_id = '00000000-0000-0000-0000-000000000027';
  DELETE FROM users WHERE id = '00000000-0000-0000-0000-000000000027';

  UPDATE users SET
    full_name_ar = 'د. أحمد سليم',
    full_name_en = 'Dr. Ahmed Selim',
    national_id  = '19750310112233'
  WHERE id = '00000000-0000-0000-0000-000000000002';

  UPDATE doctors SET
    academic_title  = 'Dr.',
    department_id   = v_cs_dept,
    office_location = 'Building A, Room 201',
    specialization  = 'Artificial Intelligence & Data Science'
  WHERE user_id = '00000000-0000-0000-0000-000000000002';

  SELECT id INTO v_dr_ahmed FROM doctors WHERE user_id = '00000000-0000-0000-0000-000000000002';

  -- ── 2. INSERT 17 new doctor users ─────────────────────────────────────
  INSERT INTO users (id, email, password_hash, role, full_name_ar, full_name_en, national_id, phone, must_change_pw, is_active)
  VALUES
    ('00000000-0000-0000-0000-000000000010', 'dr.aida@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. عايده نصر', 'Dr. Aida Nasr', '19780215223344', '01011112233', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000011', 'dr.osama.g@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. أسامة غنيم', 'Dr. Osama Ghoneim', '19790315223344', '01011112234', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000012', 'dr.omnia@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'أ.م.د. أمنية البربري', 'Assoc. Prof. Omnia El Barbary', '19800415223344', '01011112235', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000013', 'dr.nancy@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'أ.د. نانسي الحفناوي', 'Prof. Nancy Al-Hafnawi', '19750515223344', '01011112236', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000014', 'dr.shimaa@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. شيماء هجرس', 'Dr. Shimaa Hagras', '19810615223344', '01011112237', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000015', 'dr.walid.s@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. وليد سمير', 'Dr. Walid Samir', '19820715223344', '01011112238', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000016', 'dr.mostafa@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. مصطفى العشري', 'Dr. Mostafa Al-Ashri', '19830815223344', '01011112239', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000017', 'dr.arwa@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. أروى أبو الوفا', 'Dr. Arwa Abu Al-Wafa', '19840915223344', '01011112240', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000018', 'dr.hanaa.h@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. هناء عبد الهادي', 'Dr. Hanaa Abd Al-Hadi', '19851015223344', '01011112241', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000019', 'dr.hanaa.e@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. هناء عيسى', 'Dr. Hanaa Eissa', '19861115223344', '01011112242', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000020', 'dr.marian@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. مريان وجدي', 'Dr. Marian Wagdy', '19871215223344', '01011112243', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000021', 'dr.walid.k@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. وليد عبد الخالق', 'Dr. Walid Abd Al-Khaliq', '19880115223344', '01011112244', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000022', 'dr.hany@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. هاني الغايش', 'Dr. Hany Al-Ghayesh', '19890215223344', '01011112245', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000023', 'dr.tahani@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. تهاني علام', 'Dr. Tahani Allam', '19900315223344', '01011112246', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000024', 'dr.ibrahim@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. إبراهيم جاد', 'Dr. Ibrahim Gad', '19910415223344', '01011112247', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000025', 'dr.iman.b@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'أ.م.د. إيمان البقري', 'Assoc. Prof. Iman El Baqari', '19920515223344', '01011112248', FALSE, TRUE),
    ('00000000-0000-0000-0000-000000000026', 'dr.marwa@fci.tanta.edu.eg', '$2b$10$cOqt6YZKmMqMr6noJ5ymiu7D6T08JdSNlVT3dXyM9f/.y9WHgT7tW', 'doctor', 'د. مروة سلامة', 'Dr. Marwa Salama', '19930615223344', '01011112249', FALSE, TRUE)
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email, 
    full_name_ar = EXCLUDED.full_name_ar, 
    full_name_en = EXCLUDED.full_name_en;

  -- ── 3. INSERT doctor profiles ──────────────────────────────────────────
  INSERT INTO doctors (user_id, academic_title, department_id, office_location, specialization)
  VALUES
    ('00000000-0000-0000-0000-000000000010', 'Dr.', v_cs_dept, 'Building B, Room 101', 'Electronics, Cybersecurity, Signals'),
    ('00000000-0000-0000-0000-000000000011', 'Dr.', v_cs_dept, 'Building B, Room 102', 'CS Fundamentals, OOP, HCI'),
    ('00000000-0000-0000-0000-000000000012', 'Assoc. Prof.', v_is_dept, 'Building B, Room 103', 'Information Systems, Databases'),
    ('00000000-0000-0000-0000-000000000013', 'Prof.', v_cs_dept, 'Building B, Room 104', 'Mathematics, Operations Research'),
    ('00000000-0000-0000-0000-000000000014', 'Dr.', v_is_dept, 'Building B, Room 105', 'IS Analysis, Data Science, Security'),
    ('00000000-0000-0000-0000-000000000015', 'Dr.', v_cs_dept, 'Building B, Room 106', 'English Language'),
    ('00000000-0000-0000-0000-000000000016', 'Dr.', v_cs_dept, 'Building B, Room 107', 'Algorithms, OS, Theory'),
    ('00000000-0000-0000-0000-000000000017', 'Dr.', v_se_dept, 'Building B, Room 108', 'Software Engineering'),
    ('00000000-0000-0000-0000-000000000018', 'Dr.', v_cs_dept, 'Building B, Room 109', 'Mathematics, HCI, Compilers'),
    ('00000000-0000-0000-0000-000000000019', 'Dr.', v_cs_dept, 'Building B, Room 110', 'Operating Systems'),
    ('00000000-0000-0000-0000-000000000020', 'Dr.', v_it_dept, 'Building B, Room 111', 'Networks, Multimedia, Image Processing'),
    ('00000000-0000-0000-0000-000000000021', 'Dr.', v_cs_dept, 'Building B, Room 112', 'AI, Big Data, Cloud, HPC'),
    ('00000000-0000-0000-0000-000000000022', 'Dr.', v_is_dept, 'Building B, Room 113', 'Network OS, IS Engineering'),
    ('00000000-0000-0000-0000-000000000023', 'Dr.', v_it_dept, 'Building B, Room 114', 'Microprocessors, Networks'),
    ('00000000-0000-0000-0000-000000000024', 'Dr.', v_is_dept, 'Building B, Room 115', 'Web IS, Data Management'),
    ('00000000-0000-0000-0000-000000000025', 'Assoc. Prof.', v_it_dept, 'Building B, Room 116', 'Robotics, SOA'),
    ('00000000-0000-0000-0000-000000000026', 'Dr.', v_it_dept, 'Building B, Room 117', 'Digital Signal Processing')
  ON CONFLICT (user_id) DO NOTHING;

  -- ── 4. Resolve doctor integer IDs ─────────────────────────────────────
  SELECT id INTO v_dr_aida    FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000010';
  SELECT id INTO v_dr_osama   FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000011';
  SELECT id INTO v_dr_omnia   FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000012';
  SELECT id INTO v_dr_nancy   FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000013';
  SELECT id INTO v_dr_shimaa  FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000014';
  SELECT id INTO v_dr_walid_s FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000015';
  SELECT id INTO v_dr_mostafa FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000016';
  SELECT id INTO v_dr_arwa    FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000017';
  SELECT id INTO v_dr_hanaa_h FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000018';
  SELECT id INTO v_dr_hanaa_e FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000019';
  SELECT id INTO v_dr_marian  FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000020';
  SELECT id INTO v_dr_walid_k FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000021';
  SELECT id INTO v_dr_hany    FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000022';
  SELECT id INTO v_dr_tahani  FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000023';
  SELECT id INTO v_dr_ibrahim FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000024';
  SELECT id INTO v_dr_iman    FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000025';
  SELECT id INTO v_dr_marwa   FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000026';
  
  -- Create missing courses if any
  INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_credit_bearing)
  VALUES ('UNV115', 'تسويق ومبيعات', 'Marketing & Sales', 2, 'university_req', v_cs_dept, 1, FALSE)
  ON CONFLICT (code) DO NOTHING;

  INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_credit_bearing)
  VALUES ('IT444', 'الواقع الافتراضي', 'Virtual Reality', 3, 'elective', v_it_dept, 4, TRUE)
  ON CONFLICT (code) DO NOTHING;

  INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_credit_bearing)
  VALUES ('IT417', 'معالجة الإشارات الرقمية', 'Digital Signal Processing', 3, 'applied_computing', v_it_dept, 4, TRUE)
  ON CONFLICT (code) DO NOTHING;

  INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_credit_bearing)
  VALUES ('IS421', 'مواضيع متقدمة في نظم المعلومات', 'Advanced Topics in IS', 3, 'elective', v_is_dept, 4, TRUE)
  ON CONFLICT (code) DO NOTHING;

  -- ── 5. INSERT / UPDATE course_offerings ─────────────────────────────
`;

for (let cls of classes) {
  let cap = getCapacity(cls.room);
  
  out += `  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room, is_active, section_label)
  VALUES (v_${cls.sem}_id, (SELECT id FROM courses WHERE code='${cls.c}'), v_dr_${cls.dr}, ${cap}, '[]'::jsonb, '${cls.room}', TRUE, '${cls.section}')
  ON CONFLICT (semester_id, course_id, section_label)
  DO UPDATE SET doctor_id = EXCLUDED.doctor_id, capacity = EXCLUDED.capacity, room = EXCLUDED.room, is_active = TRUE;\n\n`;
  
  out += `  SELECT id INTO v_offering_id FROM course_offerings 
  WHERE course_id=(SELECT id FROM courses WHERE code='${cls.c}') 
    AND semester_id=v_${cls.sem}_id AND section_label='${cls.section}';\n\n`;
  
  out += `  v_active_offering_ids := array_append(v_active_offering_ids, v_offering_id);\n\n`;

  if (cls.day) {
      out += `  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, '${cls.day}', '${cls.start}', '${cls.end}', '${cls.room}', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;\n\n`;
  } else {
      out += `  -- No schedule slot: time unspecified in timetable PDF\n\n`;
  }
}

out += `  -- ── 6. Deactivate orphaned offerings not in the timetable ────────────
  UPDATE course_offerings
  SET doctor_id = NULL, is_active = FALSE
  WHERE id != ALL(v_active_offering_ids);

  -- ── 7. Mark seed as complete ──────────────────────────────────────────
  INSERT INTO seed_logs (seed_name, rows_affected)
  VALUES ('004_real_professors.sql', 18);

  RAISE NOTICE 'Seed 004 complete — 18 real professors loaded';
END $$;
`;

fs.writeFileSync('database/seeds/004_real_professors.sql', out, 'utf8');
