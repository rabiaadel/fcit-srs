#!/usr/bin/env node
// =============================================================================
// generate_seeds.js — Generates seed SQL files 005–009 from authoritative JSONs
// Run:  node scripts/generate_seeds.js
// =============================================================================
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT       = path.resolve(__dirname, '..');
const SEEDS_DIR  = path.join(ROOT, 'database', 'seeds');
const CURRICULUM = JSON.parse(fs.readFileSync(path.join(ROOT, 'fcit_curriculum_terms_by_level_with_terms_v2.json'), 'utf8'));
const SCHEDULE   = JSON.parse(fs.readFileSync(path.join(ROOT, 'final_doctors_schedule_modified.json'), 'utf8'));

// =============================================================================
// HELPERS
// =============================================================================

/** Escape single quotes for SQL string literals */
function esc(s) { return s.replace(/'/g, "''"); }

/** Map JSON category → DB ENUM value */
function mapCategory(cat) {
  const MAP = {
    university_req:     'university_req',
    math_science:       'math_science',
    basic_computing:    'basic_computing',
    applied_computing:  'applied_computing',
    elective:           'elective',
    project:            'project',
    cs_specialization:  'applied_computing',
    is_specialization:  'applied_computing',
    it_specialization:  'applied_computing',
  };
  return MAP[cat] || 'applied_computing';
}

/** Get department code from course code prefix */
function deptCode(code) {
  if (code.startsWith('CS')) return 'CS';
  if (code.startsWith('IS')) return 'IS';
  if (code.startsWith('IT')) return 'IT';
  if (code.startsWith('SE')) return 'CS'; // SE courses assigned to CS dept
  return null; // BS*, UNV*, PR*
}

/** Determine is_mandatory from the array type the course was found in */
function isMandatory(arrayType) {
  if (arrayType === 'mandatory' || arrayType === 'projects') return true;
  return false; // electives
}

// =============================================================================
// PHASE 1: Extract all courses from curriculum JSON
// =============================================================================

const coursesMap = new Map(); // code → { first occurrence data }
const prerequisitesSet = new Set(); // "courseCode->prereqCode"
const curriculumEntries = []; // { specialization, year_of_study, semester_in_year, code, is_mandatory, display_order }

function extractCourses(courseArray, arrayType, specialization, yearOverride) {
  if (!courseArray || !Array.isArray(courseArray)) return;
  courseArray.forEach((course, idx) => {
    const code = course.code;
    // Deduplicate: first occurrence wins for course metadata
    if (!coursesMap.has(code)) {
      coursesMap.set(code, {
        code:         course.code,
        name_ar:      course.name_ar,
        name_en:      course.name_en,
        credits:      course.credits,
        category:     mapCategory(course.category),
        level:        course.level,
        is_mandatory: isMandatory(arrayType),
        dept:         deptCode(code),
      });
    }

    // Prerequisites
    if (course.prerequisites && course.prerequisites.length > 0) {
      course.prerequisites.forEach(prereq => {
        if (prereq === 'PASS_55_CREDITS') return; // skip credit threshold
        const key = `${code}->${prereq}`;
        prerequisitesSet.add(key);
      });
    }

    // Curriculum plan entry
    const year = yearOverride !== undefined ? yearOverride : course.level;
    const sem  = course.term || 1;
    curriculumEntries.push({
      specialization,
      year_of_study:    year,
      semester_in_year: sem,
      code:             code,
      is_mandatory:     isMandatory(arrayType),
      display_order:    idx + 1,
    });
  });
}

// Level 1 — GENERAL
const l1 = CURRICULUM.terms.level_1;
if (l1.university_requirements) {
  extractCourses(l1.university_requirements.mandatory, 'mandatory', 'GENERAL');
  extractCourses(l1.university_requirements.electives, 'electives', 'GENERAL');
}
if (l1.college_requirements) {
  extractCourses(l1.college_requirements.math_and_science, 'mandatory', 'GENERAL');
  extractCourses(l1.college_requirements.basic_computing, 'mandatory', 'GENERAL');
}

// Level 2 — GENERAL
const l2 = CURRICULUM.terms.level_2;
if (l2.university_requirements) {
  extractCourses(l2.university_requirements.mandatory, 'mandatory', 'GENERAL');
  extractCourses(l2.university_requirements.electives, 'electives', 'GENERAL');
}
if (l2.college_requirements) {
  extractCourses(l2.college_requirements.math_and_science, 'mandatory', 'GENERAL');
  extractCourses(l2.college_requirements.basic_computing, 'mandatory', 'GENERAL');
}

// Level 3 — specializations CS, IS, IT
const l3 = CURRICULUM.terms.level_3;
for (const spec of ['CS', 'IS', 'IT']) {
  if (!l3[spec]) continue;
  // level_3 block
  if (l3[spec].level_3) {
    const block = l3[spec].level_3;
    extractCourses(block.mandatory, 'mandatory', spec, 3);
    extractCourses(block.electives, 'electives', spec, 3);
    extractCourses(block.projects,  'projects',  spec, 3);
  }
  // level_4 block
  if (l3[spec].level_4) {
    const block = l3[spec].level_4;
    extractCourses(block.mandatory, 'mandatory', spec, 4);
    extractCourses(block.electives, 'electives', spec, 4);
    extractCourses(block.projects,  'projects',  spec, 4);
  }
}

// Add SE321 as inactive course (Anomaly A decision: include)
if (!coursesMap.has('SE321')) {
  coursesMap.set('SE321', {
    code: 'SE321',
    name_ar: 'هندسة البرمجيات التطبيقية',
    name_en: 'Applied Software Engineering',
    credits: 3,
    category: 'applied_computing',
    level: 3,
    is_mandatory: false,
    dept: 'CS',
    is_active: false,
  });
}

console.log(`Unique courses extracted: ${coursesMap.size}`);
console.log(`Prerequisites extracted: ${prerequisitesSet.size}`);
console.log(`Curriculum plan entries: ${curriculumEntries.length}`);

// =============================================================================
// GENERATE 005_courses.sql
// =============================================================================

let sql005 = `SET client_encoding = 'UTF8';

-- =============================================================================
-- 005_courses.sql — All courses from official 2024 bylaw curriculum
-- Generated from fcit_curriculum_terms_by_level_with_terms_v2.json
-- Total unique courses: ${coursesMap.size}
-- Idempotent: ON CONFLICT (code) DO UPDATE
-- =============================================================================

BEGIN;

`;

for (const [code, c] of coursesMap) {
  const deptExpr = c.dept
    ? `(SELECT id FROM departments WHERE code = '${c.dept}')`
    : 'NULL';
  const isActive = c.is_active === false ? 'false' : 'true';
  sql005 += `INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  '${esc(code)}',
  '${esc(c.name_ar)}',
  '${esc(c.name_en)}',
  ${c.credits},
  '${c.category}',
  ${deptExpr},
  ${c.level},
  ${c.is_mandatory},
  ${isActive}
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

`;
}

sql005 += 'COMMIT;\n';
fs.writeFileSync(path.join(SEEDS_DIR, '005_courses.sql'), sql005, 'utf8');
console.log(`✅ 005_courses.sql written (${coursesMap.size} courses)`);

// =============================================================================
// GENERATE 006_prerequisites.sql
// =============================================================================

let sql006 = `SET client_encoding = 'UTF8';

-- =============================================================================
-- 006_prerequisites.sql — Course prerequisites from official 2024 bylaw
-- Generated from fcit_curriculum_terms_by_level_with_terms_v2.json
-- Total prerequisite relationships: ${prerequisitesSet.size}
-- Idempotent: ON CONFLICT DO NOTHING
-- =============================================================================

BEGIN;

`;

for (const entry of prerequisitesSet) {
  const [courseCode, prereqCode] = entry.split('->');
  sql006 += `INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
SELECT
  (SELECT id FROM courses WHERE code = '${esc(courseCode)}'),
  (SELECT id FROM courses WHERE code = '${esc(prereqCode)}'),
  true
WHERE EXISTS (SELECT 1 FROM courses WHERE code = '${esc(courseCode)}')
  AND EXISTS (SELECT 1 FROM courses WHERE code = '${esc(prereqCode)}')
ON CONFLICT (course_id, prereq_course_id) DO NOTHING;

`;
}

sql006 += 'COMMIT;\n';
fs.writeFileSync(path.join(SEEDS_DIR, '006_prerequisites.sql'), sql006, 'utf8');
console.log(`✅ 006_prerequisites.sql written (${prerequisitesSet.size} prerequisites)`);

// =============================================================================
// GENERATE 007_curriculum_plans.sql
// =============================================================================

// Deduplicate curriculum entries by (specialization, year, semester, code)
const planDedup = new Map();
for (const entry of curriculumEntries) {
  const key = `${entry.specialization}|${entry.year_of_study}|${entry.semester_in_year}|${entry.code}`;
  if (!planDedup.has(key)) {
    planDedup.set(key, entry);
  }
}

// Count by specialization for verification
const specCounts = {};
for (const [, entry] of planDedup) {
  specCounts[entry.specialization] = (specCounts[entry.specialization] || 0) + 1;
}
console.log('Curriculum plan counts by specialization:', specCounts);

let sql007 = `SET client_encoding = 'UTF8';

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

`;

let displayCounter = {};
for (const [, entry] of planDedup) {
  const specKey = `${entry.specialization}|${entry.year_of_study}|${entry.semester_in_year}`;
  displayCounter[specKey] = (displayCounter[specKey] || 0) + 1;

  sql007 += `INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
SELECT
  '${entry.specialization}',
  ${entry.year_of_study},
  ${entry.semester_in_year},
  (SELECT id FROM courses WHERE code = '${esc(entry.code)}'),
  ${entry.is_mandatory},
  ${displayCounter[specKey]}
WHERE EXISTS (SELECT 1 FROM courses WHERE code = '${esc(entry.code)}');

`;
}

// Add the 4-column constraint back after data is loaded
sql007 += `-- Add the authoritative 4-column unique constraint
ALTER TABLE curriculum_plans
  ADD CONSTRAINT curriculum_plans_spec_year_sem_course_key
    UNIQUE (specialization, year_of_study, semester_in_year, course_id);

COMMIT;
`;

fs.writeFileSync(path.join(SEEDS_DIR, '007_curriculum_plans.sql'), sql007, 'utf8');
console.log(`✅ 007_curriculum_plans.sql written (${planDedup.size} entries)`);

// =============================================================================
// PHASE 2: Extract doctors from schedule JSON
// =============================================================================

/** Parse Arabic academic title prefix from name */
function parseDoctor(fullName) {
  const prefixes = [
    { ar: 'أ.م.د.', title: 'أستاذ مشارك دكتور' },
    { ar: 'أ.د.',   title: 'أستاذ دكتور' },
    { ar: 'د.',     title: 'دكتور' },
    { ar: 'م.',     title: 'مدرس مساعد' },
  ];
  for (const p of prefixes) {
    if (fullName.startsWith(p.ar)) {
      const name = fullName.slice(p.ar.length).trim();
      return { name_ar: name, title: p.title, prefix_en: prefixToEn(p.ar) };
    }
  }
  return { name_ar: fullName, title: 'دكتور', prefix_en: 'Dr.' };
}

function prefixToEn(arPrefix) {
  const map = {
    'أ.م.د.': 'Assoc. Prof.',
    'أ.د.':   'Prof.',
    'د.':     'Dr.',
    'م.':     'TA',
  };
  return map[arPrefix] || 'Dr.';
}

/** Simple Arabic-to-English transliteration */
function transliterate(arName) {
  const map = {
    'نانسي': 'Nancy',
    'الحفناوي': 'El-Hefnawy',
    'أمنية': 'Omnia',
    'البربري': 'El-Barbary',
    'إيمان': 'Iman',
    'البقري': 'El-Baqary',
    'أحمد': 'Ahmed',
    'سليم': 'Saleem',
    'أروى': 'Arwa',
    'أبو الوفا': 'Abu-Elwafa',
    'أسامة': 'Osama',
    'غنيم': 'Ghonaim',
    'إبراهيم': 'Ibrahim',
    'جاد': 'Gad',
    'تهاني': 'Tahany',
    'علام': 'Allam',
    'شيماء': 'Shimaa',
    'هجرس': 'Hagras',
    'عايدة': 'Aida',
    'نصر': 'Nasr',
    'مروة': 'Marwa',
    'مريان': 'Marian',
    'وجدي': 'Wagdy',
    'مصطفى': 'Mostafa',
    'العشري': 'El-Ashry',
    'هاني': 'Hany',
    'الغايش': 'El-Ghayesh',
    'هناء': 'Hanaa',
    'عبد الهادي': 'Abdel-Hady',
    'عيسى': 'Eissa',
    'وليد': 'Waleed',
    'سمير': 'Samir',
    'عبد الخالق': 'Abdel-Khalek',
  };

  let parts = arName;
  let result = arName;

  // Try compound names first (e.g. "أبو الوفا", "عبد الهادي")
  for (const [ar, en] of Object.entries(map)) {
    if (ar.includes(' ') && result.includes(ar)) {
      result = result.replace(ar, en);
    }
  }
  // Then single tokens
  const tokens = result.split(/\s+/);
  const translated = tokens.map(t => map[t] || t);
  return translated.join(' ');
}

/** Generate email slug from English name */
function emailSlug(enName) {
  const parts = enName.toLowerCase()
    .replace(/[^a-z\s-]/g, '')
    .split(/[\s-]+/)
    .filter(Boolean);
  if (parts.length === 0) return 'doctor';
  if (parts.length === 1) return parts[0];
  // firstname.lastname format
  return `${parts[0]}.${parts[parts.length - 1]}`;
}

/** Infer department from majority of course codes */
function inferDept(courses) {
  const counts = { CS: 0, IS: 0, IT: 0 };
  for (const c of courses) {
    const code = c.code;
    if (code.startsWith('CS')) counts.CS++;
    else if (code.startsWith('IS')) counts.IS++;
    else if (code.startsWith('IT')) counts.IT++;
    else if (code.startsWith('SE')) counts.CS++; // SE → CS
  }
  const max = Math.max(counts.CS, counts.IS, counts.IT);
  if (max === 0) return null;
  if (counts.CS === max) return 'CS';
  if (counts.IS === max) return 'IS';
  return 'IT';
}

// Process all doctors
const doctors = SCHEDULE.doctors.map(d => {
  const parsed = parseDoctor(d.name);
  const enName = transliterate(parsed.name_ar);
  const slug   = emailSlug(enName);
  const dept   = inferDept(d.courses);
  return {
    raw_name:  d.name,
    name_ar:   parsed.name_ar,
    name_en:   enName,
    title:     parsed.title,
    prefix_en: parsed.prefix_en,
    email:     `${slug}@fcit.tanta.edu.eg`,
    dept:      dept,
    courses:   d.courses,
  };
});

console.log(`Doctors extracted: ${doctors.length}`);

// Check for duplicate emails
const emailCheck = new Map();
for (const d of doctors) {
  if (emailCheck.has(d.email)) {
    console.warn(`⚠️ Duplicate email: ${d.email} (${d.name_ar} vs ${emailCheck.get(d.email)})`);
    // Make unique by appending a number
    d.email = d.email.replace('@', '2@');
  }
  emailCheck.set(d.email, d.name_ar);
}

// =============================================================================
// GENERATE 008_doctors.sql
// =============================================================================

let sql008 = `SET client_encoding = 'UTF8';

-- =============================================================================
-- 008_doctors.sql — Doctor roster from official schedule
-- Generated from final_doctors_schedule_modified.json
-- Total doctors: ${doctors.length}
-- Idempotent: ON CONFLICT DO UPDATE / DO NOTHING
-- =============================================================================

BEGIN;

`;

for (const d of doctors) {
  const deptExpr = d.dept
    ? `(SELECT id FROM departments WHERE code = '${d.dept}')`
    : 'NULL';

  sql008 += `-- ${d.raw_name}
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    '${esc(d.email)}',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    '${esc(d.name_ar)}',
    '${esc(d.name_en)}',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, ${deptExpr}, '${esc(d.title)}'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

`;
}

sql008 += 'COMMIT;\n';
fs.writeFileSync(path.join(SEEDS_DIR, '008_doctors.sql'), sql008, 'utf8');
console.log(`✅ 008_doctors.sql written (${doctors.length} doctors)`);

// =============================================================================
// GENERATE 009_course_offerings_and_slots.sql
// =============================================================================

/** Map Arabic semester to DB lookup */
function semesterLookup(semAr) {
  if (semAr === 'الترم الأول') {
    return `(SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'first' AND ay.year_label = '2025-2026')`;
  }
  if (semAr === 'الترم الثاني') {
    return `(SELECT s.id FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.semester_type = 'second' AND ay.year_label = '2025-2026')`;
  }
  console.warn(`⚠️ Unknown semester: "${semAr}"`);
  return 'NULL';
}

// Group schedule entries by (doctor_name_ar, course_code, semester) → offering
// Each offering has one or more schedule slots
const offeringsMap = new Map(); // "doctorName|code|semester" → { doctor, code, semester, slots: [{day,start,end,room}] }

for (const d of doctors) {
  for (const c of d.courses) {
    // Anomaly B: IS421 → link to PR421
    const effectiveCode = c.code === 'IS421' ? 'PR421' : c.code;

    const key = `${d.name_ar}|${effectiveCode}|${c.semester}`;

    if (!offeringsMap.has(key)) {
      offeringsMap.set(key, {
        doctor_name_ar: d.name_ar,
        code:           effectiveCode,
        semester:       c.semester,
        slots:          [],
      });
    }

    const offering = offeringsMap.get(key);

    // Anomaly D: IT319 exact duplicate — deduplicate same day+time
    const isDuplicate = offering.slots.some(
      s => s.day === c.day && s.start === c.start && s.end === c.end
    );
    if (!isDuplicate) {
      offering.slots.push({
        day:   c.day,
        start: c.start,
        end:   c.end,
        room:  c.room,
      });
    }
  }
}

console.log(`Unique offerings: ${offeringsMap.size}`);

// Track section labels per (course, semester) to handle multiple doctors teaching same course
const sectionCounter = new Map(); // "code|semester" → next section letter

function nextSection(code, semester) {
  const key = `${code}|${semester}`;
  if (!sectionCounter.has(key)) {
    sectionCounter.set(key, 0);
  }
  const idx = sectionCounter.get(key);
  sectionCounter.set(key, idx + 1);
  return String.fromCharCode(65 + idx); // A, B, C, ...
}

let sql009 = `SET client_encoding = 'UTF8';

-- =============================================================================
-- 009_course_offerings_and_slots.sql — Course offerings and schedule slots
-- Generated from final_doctors_schedule_modified.json
-- Total unique offerings: ${offeringsMap.size}
-- Idempotent: ON CONFLICT DO UPDATE / DO NOTHING
-- =============================================================================

BEGIN;

`;

for (const [, offering] of offeringsMap) {
  const section = nextSection(offering.code, offering.semester);
  const semExpr = semesterLookup(offering.semester);

  // Build slots SQL
  const slotsSql = offering.slots.map(s =>
    `  SELECT offering_row.id, '${s.day}', '${s.start}', '${s.end}', '${esc(s.room)}'`
  ).join('\n  UNION ALL\n');

  sql009 += `-- ${offering.doctor_name_ar} → ${offering.code} (${offering.semester}) Section ${section}
WITH offering_row AS (
  INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
  SELECT
    ${semExpr},
    (SELECT id FROM courses WHERE code = '${esc(offering.code)}'),
    (SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.full_name_ar = '${esc(offering.doctor_name_ar)}'),
    60,
    true,
    '${section}'
  WHERE EXISTS (SELECT 1 FROM courses WHERE code = '${esc(offering.code)}')
  ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET
    doctor_id = EXCLUDED.doctor_id
  RETURNING id
)
INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room)
SELECT offering_row.id, slots.day_of_week::varchar, slots.start_time::time, slots.end_time::time, slots.room::varchar FROM offering_row CROSS JOIN (
${slotsSql.replace(/offering_row\.id, /g, '')}
) AS slots(day_of_week, start_time, end_time, room)
ON CONFLICT (offering_id, day_of_week, start_time) DO NOTHING;

`;
}

sql009 += 'COMMIT;\n';
fs.writeFileSync(path.join(SEEDS_DIR, '009_course_offerings_and_slots.sql'), sql009, 'utf8');
console.log(`✅ 009_course_offerings_and_slots.sql written (${offeringsMap.size} offerings)`);

// =============================================================================
// Summary
// =============================================================================
console.log('\n=== GENERATION COMPLETE ===');
console.log(`  Courses:      ${coursesMap.size}`);
console.log(`  Prerequisites: ${prerequisitesSet.size}`);
console.log(`  Curriculum:    ${planDedup.size} entries`);
console.log(`  Doctors:       ${doctors.length}`);
console.log(`  Offerings:     ${offeringsMap.size}`);
console.log(`  Spec counts:   ${JSON.stringify(specCounts)}`);
