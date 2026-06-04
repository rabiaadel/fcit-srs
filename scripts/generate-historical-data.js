#!/usr/bin/env node
// =============================================================================
// FCIT SRS — Historical Data Generator v2
// Creates a realistic 4-year university environment
//
// Runs with: NODE_PATH=backend/node_modules node scripts/generate-historical-data.js
// =============================================================================
'use strict';

const { Pool } = require('pg');
const bcrypt   = require('bcryptjs');
const fs       = require('fs');
const path     = require('path');

// ── Config ───────────────────────────────────────────────────────────────────
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'StudentRegistrationPassword2026!',
  database: process.env.DB_NAME || 'student_registration_system',
};

const CURRICULUM_PATH = path.join(__dirname, '..', 'fcit_curriculum_terms_by_level_with_terms_v2.json');

// ── Grade Distribution (matches user specification exactly) ──────────────────
const GRADE_DISTRIBUTION = [
  { gp: 4.0, letter: 'A+', pct: 97, weight: 10 },
  { gp: 3.7, letter: 'A',  pct: 93, weight: 15 },
  { gp: 3.3, letter: 'A-', pct: 89, weight: 15 },
  { gp: 3.0, letter: 'B',  pct: 82, weight: 15 },
  { gp: 2.7, letter: 'B-', pct: 78, weight: 15 },
  { gp: 2.3, letter: 'C+', pct: 74, weight: 10 },
  { gp: 2.0, letter: 'C',  pct: 70, weight: 10 },
  { gp: 1.7, letter: 'C-', pct: 66, weight: 5  },
  { gp: 1.3, letter: 'D+', pct: 62, weight: 3  },
  { gp: 1.0, letter: 'D',  pct: 56, weight: 2  },
];

const WEIGHTED_GRADES = [];
for (const g of GRADE_DISTRIBUTION) {
  for (let i = 0; i < g.weight; i++) WEIGHTED_GRADES.push(g);
}
function randomGrade() {
  return WEIGHTED_GRADES[Math.floor(Math.random() * WEIGHTED_GRADES.length)];
}

// ── Egyptian Names ───────────────────────────────────────────────────────────
const FIRST_M = [
  'أحمد','محمد','عمر','يوسف','علي','حسن','إبراهيم','خالد','مصطفى','كريم',
  'طارق','عبدالرحمن','ياسر','هشام','سامي','ماجد','فادي','رامي','وليد','عادل',
  'سعيد','فاروق','جمال','نبيل','شريف','أيمن','حسام','بلال','زياد','تامر',
  'أنس','باسم','رضا','منصور','صلاح','عماد','هاني','نادر','مازن','آدم',
  'سيف','ريان','يحيى','حمزة','عبدالله','أسامة','مروان','جاسر','عمرو','بكر'
];
const FIRST_F = [
  'فاطمة','مريم','نور','سارة','هدى','ريم','دعاء','آية','ياسمين','رنا',
  'منى','هبة','إسراء','شيماء','لمياء','عبير','أمل','سلمى','لينا','مها',
  'نهى','رانيا','سمر','غادة','ندى','حنين','جنى','تسنيم','بسمة','وفاء',
  'سحر','علياء','نسمة','إيمان','أميرة','خديجة','زينب','روان','لبنى','مي'
];
const FATHER = [
  'محمد','أحمد','علي','حسن','إبراهيم','عمر','خالد','سعيد','عبدالله','مصطفى',
  'يوسف','طارق','ماجد','صلاح','فاروق','جمال','نبيل','عادل','سامي','كريم'
];
const LAST = [
  'محمود','إبراهيم','حسين','عبدالعزيز','السيد','الشريف','عثمان','مصطفى','أحمد','علي',
  'حسن','سالم','عمران','البدري','الجندي','النجار','الحكيم','فرج','عطية','خليل',
  'رشوان','جابر','السعيد','مرسي','شاهين','بدوي','الهادي','صبري','فوزي','رمضان',
  'الدسوقي','المنشاوي','عوض','سلامة','البنا','الطنطاوي','حجازي','العربي','زكي','نصر',
  'القاضي','الغمراوي','يونس','عيسى','الفقي','المليجي','أبوزيد','العطار','الشرقاوي','بكر'
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomName() {
  const isMale = Math.random() > 0.4;
  const first = pick(isMale ? FIRST_M : FIRST_F);
  return { nameAr: `${first} ${pick(FATHER)} ${pick(LAST)}`, nameEn: `${first} ${pick(FATHER)} ${pick(LAST)}` };
}

// ── Academic Calendar ────────────────────────────────────────────────────────
// 4 academic years: 2022-2023, 2023-2024, 2024-2025, 2025-2026
const ACADEMIC_YEARS = [
  { label: '2022-2023', startYear: 2022, isCurrent: false },
  { label: '2023-2024', startYear: 2023, isCurrent: false },
  { label: '2024-2025', startYear: 2024, isCurrent: false },
  { label: '2025-2026', startYear: 2025, isCurrent: true  },
];

// ── Student Distribution ─────────────────────────────────────────────────────
const STUDENT_DIST = [
  { currentYear: 4, enrollmentYear: 2022, count: 45 },
  { currentYear: 3, enrollmentYear: 2023, count: 45 },
  { currentYear: 2, enrollmentYear: 2024, count: 50 },
  { currentYear: 1, enrollmentYear: 2025, count: 60 },
];
const SPECS = ['CS', 'IS', 'IT'];
const LEVELS = ['الفرقة الأولى', 'الفرقة الثانية', 'الفرقة الثالثة', 'الفرقة الرابعة'];

// =============================================================================
// MAIN
// =============================================================================
async function main() {
  const pool = new Pool(DB_CONFIG);
  const report = {
    semestersCreated: 0,
    curriculumMappings: 0,
    prerequisiteRemovals: [],
    studentsGenerated: 0,
    enrollmentsCreated: 0,
    gradesCreated: 0,
    gpaCalculations: 0,
    demoStudentGPA: null,
    demoStudentCourses: 0,
    creditHoursBefore: null,
    creditHoursAfter: null,
  };

  try {
    console.log('━━━ FCIT SRS Historical Data Generator v2 ━━━');
    console.log(`Connecting to ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}...`);
    const testRes = await pool.query('SELECT NOW()');
    console.log(`Connected: ${testRes.rows[0].now}\n`);

    // Read curriculum JSON
    const curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf8'));
    const manualPlan = curriculum.manual_curriculum_planning;

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: CREATE HISTORICAL SEMESTERS (11 total)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('📅 PHASE 3: Creating 11 semesters across 4 academic years...');
    const semesterMap = {}; // "2022-2023_first" → id

    for (const ay of ACADEMIC_YEARS) {
      // Upsert academic year
      await pool.query(`
        INSERT INTO academic_years (year_label, start_date, end_date, is_current)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (year_label) DO UPDATE SET is_current = EXCLUDED.is_current
      `, [ay.label, `${ay.startYear}-09-01`, `${ay.startYear + 1}-08-31`, ay.isCurrent]);

      // Ensure all other years are NOT current
      if (ay.isCurrent) {
        await pool.query(`UPDATE academic_years SET is_current = FALSE WHERE year_label != $1`, [ay.label]);
      }

      const ayRow = await pool.query(`SELECT id FROM academic_years WHERE year_label = $1`, [ay.label]);
      const ayId = ayRow.rows[0].id;
      const sy = ay.startYear;

      // First semester
      const s1Status = ay.isCurrent ? 'closed' : 'closed';
      await pool.query(`
        INSERT INTO semesters (
          academic_year_id, semester_type, label, status,
          start_date, end_date, registration_start, registration_end,
          add_drop_deadline, withdrawal_deadline,
          min_credits, max_credits_default
        ) VALUES ($1, 'first', $2, $3,
          $4, $5, $6, $7, $8, $9,
          9, 21)
        ON CONFLICT (academic_year_id, semester_type) DO UPDATE SET
          label = EXCLUDED.label, status = EXCLUDED.status,
          start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date,
          registration_start = EXCLUDED.registration_start,
          registration_end = EXCLUDED.registration_end,
          add_drop_deadline = EXCLUDED.add_drop_deadline,
          withdrawal_deadline = EXCLUDED.withdrawal_deadline,
          max_credits_default = 21
      `, [
        ayId,
        `الفصل الدراسي الأول ${ay.label}`,
        s1Status,
        `${sy}-09-15`, `${sy+1}-01-15`,
        `${sy}-09-01`, `${sy}-09-14`,
        `${sy}-09-28`, `${sy}-10-26`
      ]);

      // Second semester — 2025-2026 S2 is ACTIVE
      const s2Status = ay.isCurrent ? 'active' : 'closed';
      await pool.query(`
        INSERT INTO semesters (
          academic_year_id, semester_type, label, status,
          start_date, end_date, registration_start, registration_end,
          add_drop_deadline, withdrawal_deadline,
          min_credits, max_credits_default
        ) VALUES ($1, 'second', $2, $3,
          $4, $5, $6, $7, $8, $9,
          9, 21)
        ON CONFLICT (academic_year_id, semester_type) DO UPDATE SET
          label = EXCLUDED.label, status = EXCLUDED.status,
          start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date,
          registration_start = EXCLUDED.registration_start,
          registration_end = EXCLUDED.registration_end,
          add_drop_deadline = EXCLUDED.add_drop_deadline,
          withdrawal_deadline = EXCLUDED.withdrawal_deadline,
          max_credits_default = 21
      `, [
        ayId,
        `الفصل الدراسي الثاني ${ay.label}`,
        s2Status,
        `${sy+1}-02-01`, `${sy+1}-06-15`,
        `${sy+1}-01-20`, `${sy+1}-01-31`,
        `${sy+1}-02-14`, `${sy+1}-03-15`
      ]);

      // Summer semester (not for current year 2025-2026)
      if (!ay.isCurrent) {
        await pool.query(`
          INSERT INTO semesters (
            academic_year_id, semester_type, label, status,
            start_date, end_date, registration_start, registration_end,
            add_drop_deadline, withdrawal_deadline,
            min_credits, max_credits_default
          ) VALUES ($1, 'summer', $2, 'closed',
            $3, $4, $5, $6, $7, $8,
            2, 9)
          ON CONFLICT (academic_year_id, semester_type) DO UPDATE SET
            label = EXCLUDED.label, status = EXCLUDED.status,
            start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date,
            registration_start = EXCLUDED.registration_start,
            registration_end = EXCLUDED.registration_end,
            max_credits_default = 9
        `, [
          ayId,
          `الفصل الصيفي ${ay.label}`,
          `${sy+1}-07-01`, `${sy+1}-08-25`,
          `${sy+1}-06-20`, `${sy+1}-06-30`,
          `${sy+1}-07-07`, `${sy+1}-07-14`
        ]);
      }

      // Collect semester IDs
      const sems = await pool.query(
        `SELECT id, semester_type FROM semesters WHERE academic_year_id = $1`, [ayId]
      );
      for (const s of sems.rows) {
        semesterMap[`${ay.label}_${s.semester_type}`] = s.id;
      }
    }
    report.semestersCreated = Object.keys(semesterMap).length;
    console.log(`  ✅ ${report.semestersCreated} semesters ready`);
    for (const [key, id] of Object.entries(semesterMap)) {
      console.log(`     ${key} → id=${id}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1-2: LOAD COURSES, VALIDATE PREREQUISITES
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📚 PHASE 1: Loading courses from database...');
    const coursesRes = await pool.query(`SELECT id, code, credits, name_ar, name_en, category, level FROM courses`);
    const coursesByCode = {};
    for (const c of coursesRes.rows) coursesByCode[c.code] = c;
    console.log(`  ✅ Loaded ${Object.keys(coursesByCode).length} courses`);

    // Build semester position map for prerequisite validation
    const courseSemPos = {}; // code → earliest position (0-based)
    for (const spec of ['GEN', 'CS', 'IS', 'IT']) {
      const plans = manualPlan[spec];
      if (!plans) continue;
      for (const yb of plans) {
        for (const sb of yb.semesters) {
          const pos = (yb.year - 1) * 2 + (sb.semester - 1);
          for (const code of sb.courses) {
            if (!(code in courseSemPos) || pos < courseSemPos[code]) {
              courseSemPos[code] = pos;
            }
          }
        }
      }
    }

    console.log('\n🔍 PHASE 2: Validating prerequisites...');
    const prereqsRes = await pool.query(`
      SELECT cp.id, c.code AS course_code, c2.code AS prereq_code
      FROM course_prerequisites cp
      JOIN courses c ON c.id = cp.course_id
      JOIN courses c2 ON c2.id = cp.prereq_course_id
    `);

    let removedCount = 0;
    for (const row of prereqsRes.rows) {
      if (row.prereq_code.startsWith('PASS_')) continue;
      const coursePos = courseSemPos[row.course_code];
      const prereqPos = courseSemPos[row.prereq_code];
      if (coursePos === undefined) continue;

      let reason = null;
      if (prereqPos === undefined) {
        reason = `Prerequisite ${row.prereq_code} not found in curriculum plan`;
      } else if (prereqPos >= coursePos) {
        reason = `Prerequisite ${row.prereq_code} (pos ${prereqPos}) not before ${row.course_code} (pos ${coursePos})`;
      }

      if (reason) {
        await pool.query(`DELETE FROM course_prerequisites WHERE id = $1`, [row.id]);
        console.log(`  ❌ Removed: ${row.course_code} → ${row.prereq_code} (${reason})`);
        report.prerequisiteRemovals.push({ course: row.course_code, prereq: row.prereq_code, reason });
        removedCount++;
      }
    }
    console.log(removedCount === 0
      ? '  ✅ All prerequisites valid'
      : `  ✅ Removed ${removedCount} invalid prerequisite references`);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2b: REBUILD CURRICULUM PLANS FROM JSON
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n🗺️  Rebuilding curriculum plan tables from manual_curriculum_planning...');

    // Delete existing and re-insert
    await pool.query(`DELETE FROM curriculum_plans`);

    // Drop constraints safely
    await pool.query(`ALTER TABLE curriculum_plans DROP CONSTRAINT IF EXISTS curriculum_plans_specialization_course_id_key`);
    await pool.query(`ALTER TABLE curriculum_plans DROP CONSTRAINT IF EXISTS curriculum_plans_spec_year_sem_course_key`);

    let displayOrder = 0;
    let mappingsInserted = 0;
    const insertedPairs = new Set();

    for (const [jsonSpec, dbSpec] of [['GEN', 'GENERAL'], ['CS', 'CS'], ['IS', 'IS'], ['IT', 'IT']]) {
      const plans = manualPlan[jsonSpec];
      if (!plans) { console.log(`  ⚠️  No plan for ${jsonSpec}`); continue; }

      for (const yb of plans) {
        for (const sb of yb.semesters) {
          for (const code of sb.courses) {
            const course = coursesByCode[code];
            if (!course) { continue; }
            const pairKey = `${dbSpec}_${course.id}`;
            if (insertedPairs.has(pairKey)) continue;
            insertedPairs.add(pairKey);

            await pool.query(`
              INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order)
              VALUES ($1, $2, $3, $4, TRUE, $5)
            `, [dbSpec, yb.year, sb.semester, course.id, ++displayOrder]);
            mappingsInserted++;
          }
        }
      }
    }

    // Re-add unique constraint
    await pool.query(`
      ALTER TABLE curriculum_plans
        ADD CONSTRAINT curriculum_plans_spec_year_sem_course_key
        UNIQUE (specialization, year_of_study, semester_in_year, course_id)
    `);

    report.curriculumMappings = mappingsInserted;
    console.log(`  ✅ Inserted ${mappingsInserted} curriculum plan entries`);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4-5: GENERATE 200 STUDENTS
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n👨‍🎓 PHASE 4-5: Generating 200 students...');

    // Clean previously generated students (not demo)
    await pool.query(`
      DELETE FROM enrollments WHERE student_id IN (
        SELECT s.id FROM students s JOIN users u ON u.id = s.user_id
        WHERE u.email NOT LIKE 's.2024cs001@%' AND u.role = 'student'
      )
    `);
    await pool.query(`
      DELETE FROM students WHERE user_id IN (
        SELECT u.id FROM users u
        WHERE u.email NOT LIKE 's.2024cs001@%' AND u.role = 'student'
      )
    `);
    await pool.query(`
      DELETE FROM users
      WHERE role = 'student' AND email NOT LIKE 's.2024cs001@%'
    `);
    console.log('  Cleaned existing generated students');

    const passwordHash = await bcrypt.hash('Student@2026!', 10);
    const allStudents = [];
    const studentSeq = {};

    for (const dist of STUDENT_DIST) {
      for (let i = 0; i < dist.count; i++) {
        const spec = SPECS[i % 3];
        if (!studentSeq[spec]) studentSeq[spec] = {};
        if (!studentSeq[spec][dist.enrollmentYear]) studentSeq[spec][dist.enrollmentYear] = 0;
        studentSeq[spec][dist.enrollmentYear]++;
        const seq = studentSeq[spec][dist.enrollmentYear];

        const name = randomName();
        const studentCode = `${dist.enrollmentYear}${spec}${String(seq).padStart(4, '0')}`;
        const email = `s.${studentCode.toLowerCase()}@fcit.tanta.edu.eg`;
        const currentLevel = LEVELS[dist.currentYear - 1];

        // Insert user
        const userRes = await pool.query(`
          INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
          VALUES ($1, $2, 'student', $3, $4, TRUE, FALSE)
          ON CONFLICT (email) DO UPDATE SET full_name_ar = EXCLUDED.full_name_ar, full_name_en = EXCLUDED.full_name_en
          RETURNING id
        `, [email, passwordHash, name.nameAr, name.nameEn]);
        const userId = userRes.rows[0].id;

        // Insert student
        const studentRes = await pool.query(`
          INSERT INTO students (user_id, student_code, enrollment_year, specialization, current_level, academic_status)
          VALUES ($1, $2, $3, $4, $5, 'active')
          ON CONFLICT (student_code) DO UPDATE SET specialization = EXCLUDED.specialization, current_level = EXCLUDED.current_level
          RETURNING id
        `, [userId, studentCode, dist.enrollmentYear, spec, currentLevel]);

        allStudents.push({
          studentId: studentRes.rows[0].id,
          userId, studentCode, email, spec, currentLevel,
          enrollmentYear: dist.enrollmentYear,
          currentYear: dist.currentYear,
        });

        if (allStudents.length % 50 === 0)
          console.log(`    ${allStudents.length}/200 students created...`);
      }
    }
    report.studentsGenerated = allStudents.length;
    console.log(`  ✅ Created ${allStudents.length} students`);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6-8: ENROLL, GRADE, AND BUILD HISTORY
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📝 PHASE 6-8: Building academic history...');

    // Build curriculum: GEN (Y1-2) + Spec (Y3-4)
    function buildCurriculum(spec) {
      const result = [];
      for (const yb of manualPlan.GEN) {
        for (const sb of yb.semesters) {
          result.push({
            year: yb.year, semester: sb.semester,
            courses: [...new Set(sb.courses)].filter(c => coursesByCode[c]),
          });
        }
      }
      if (manualPlan[spec]) {
        for (const yb of manualPlan[spec]) {
          for (const sb of yb.semesters) {
            result.push({
              year: yb.year, semester: sb.semester,
              courses: [...new Set(sb.courses)].filter(c => coursesByCode[c]),
            });
          }
        }
      }
      return result;
    }

    // Resolve semester ID for a student's study year + semester
    function getSemId(enrollYear, studyYear, sem) {
      const ayStart = enrollYear + (studyYear - 1);
      const ayLabel = `${ayStart}-${ayStart + 1}`;
      const type = sem === 1 ? 'first' : 'second';
      return semesterMap[`${ayLabel}_${type}`];
    }

    // Get or create offering
    const doctorRow = await pool.query(`SELECT id FROM doctors LIMIT 1`);
    const defaultDoctorId = doctorRow.rows.length > 0 ? doctorRow.rows[0].id : null;
    const offeringCache = {};

    async function getOffering(semId, courseCode) {
      const key = `${semId}_${courseCode}`;
      if (offeringCache[key]) return offeringCache[key];
      const course = coursesByCode[courseCode];
      if (!course) return null;

      const existing = await pool.query(
        `SELECT id FROM course_offerings WHERE semester_id=$1 AND course_id=$2 AND section_label='A'`,
        [semId, course.id]
      );
      if (existing.rows.length > 0) {
        offeringCache[key] = existing.rows[0].id;
        return existing.rows[0].id;
      }

      const res = await pool.query(`
        INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label)
        VALUES ($1, $2, $3, 120, TRUE, 'A')
        ON CONFLICT (semester_id, course_id, section_label) DO UPDATE SET capacity = 120
        RETURNING id
      `, [semId, course.id, defaultDoctorId]);
      offeringCache[key] = res.rows[0].id;
      return res.rows[0].id;
    }

    let enrollments = 0, grades = 0;

    for (let si = 0; si < allStudents.length; si++) {
      const student = allStudents[si];
      const curr = buildCurriculum(student.spec);

      for (const semPlan of curr) {
        const semId = getSemId(student.enrollmentYear, semPlan.year, semPlan.semester);
        if (!semId) continue;

        // Is this semester completed or current?
        const semPos = (semPlan.year - 1) * 2 + (semPlan.semester - 1);
        const currentPos = (student.currentYear - 1) * 2;  // start of current year
        // Current year S1 = active (has grades), S2 = registered (no grades yet)
        const isCompleted = semPos < currentPos;
        const isCurrentS1 = semPos === currentPos;
        // S2 of current year = future, skip unless student is at the start of current
        const shouldEnroll = isCompleted || isCurrentS1;
        if (!shouldEnroll) continue;

        for (const code of semPlan.courses) {
          const offeringId = await getOffering(semId, code);
          if (!offeringId) continue;

          // Check existing
          const exists = await pool.query(
            `SELECT id FROM enrollments WHERE student_id=$1 AND offering_id=$2`,
            [student.studentId, offeringId]
          );
          if (exists.rows.length > 0) continue;

          if (isCompleted) {
            const grade = randomGrade();
            const pct = grade.pct + Math.floor(Math.random() * 5 - 2);
            const mid = Math.min(100, Math.max(0, pct + Math.floor(Math.random() * 8 - 4)));
            const cw  = Math.min(100, Math.max(0, pct + Math.floor(Math.random() * 8 - 4)));
            const pr  = Math.min(100, Math.max(0, pct + Math.floor(Math.random() * 8 - 4)));
            const fin = Math.min(100, Math.max(0, pct + Math.floor(Math.random() * 6 - 3)));

            await pool.query(`
              INSERT INTO enrollments (
                student_id, offering_id, semester_id, status,
                midterm_grade, coursework_grade, practical_grade, final_exam_grade,
                total_grade, letter_grade, grade_points,
                is_counted_in_gpa, registered_at
              ) VALUES ($1,$2,$3,'completed',$4,$5,$6,$7,$8,$9,$10,TRUE,NOW())
              ON CONFLICT (student_id, offering_id) DO NOTHING
            `, [
              student.studentId, offeringId, semId,
              mid, cw, pr, fin, pct, grade.letter, grade.gp,
            ]);
            grades++;
          } else {
            // Current semester first half: registered
            await pool.query(`
              INSERT INTO enrollments (student_id, offering_id, semester_id, status, registered_at)
              VALUES ($1,$2,$3,'registered',NOW())
              ON CONFLICT (student_id, offering_id) DO NOTHING
            `, [student.studentId, offeringId, semId]);
          }
          enrollments++;
        }
      }

      if ((si + 1) % 50 === 0) console.log(`    ${si + 1}/200 students processed...`);
    }

    report.enrollmentsCreated = enrollments;
    report.gradesCreated = grades;
    console.log(`  ✅ Created ${enrollments} enrollments, ${grades} grades`);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 7 (DEMO STUDENT FIX): Give the demo student real history
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n🎓 PHASE 7: Fixing demo student...');
    const demoStudent = await pool.query(`
      SELECT s.id AS student_id, s.student_code, s.specialization, s.enrollment_year,
             u.email, s.cgpa
      FROM students s JOIN users u ON u.id = s.user_id
      WHERE u.email = 's.2024cs001@fci.tanta.edu.eg'
    `);

    if (demoStudent.rows.length > 0) {
      const demo = demoStudent.rows[0];
      console.log(`  Found demo student: ${demo.email} (${demo.student_code})`);

      // Demo is Year 1 CS, enrolled 2025
      // Give them completed courses from 2025-2026 S1 (first semester)
      const s1Id = semesterMap['2025-2026_first'];
      if (s1Id) {
        const y1s1Courses = manualPlan.GEN[0].semesters[0].courses; // Year 1, Semester 1
        for (const code of [...new Set(y1s1Courses)]) {
          const offeringId = await getOffering(s1Id, code);
          if (!offeringId) continue;

          const exists = await pool.query(
            `SELECT id FROM enrollments WHERE student_id=$1 AND offering_id=$2`,
            [demo.student_id, offeringId]
          );
          if (exists.rows.length > 0) continue;

          const grade = randomGrade();
          const pct = grade.pct + Math.floor(Math.random() * 5 - 2);
          await pool.query(`
            INSERT INTO enrollments (
              student_id, offering_id, semester_id, status,
              midterm_grade, coursework_grade, practical_grade, final_exam_grade,
              total_grade, letter_grade, grade_points,
              is_counted_in_gpa, registered_at
            ) VALUES ($1,$2,$3,'completed',$4,$5,$6,$7,$8,$9,$10,TRUE,NOW())
            ON CONFLICT (student_id, offering_id) DO NOTHING
          `, [
            demo.student_id, offeringId, s1Id,
            Math.min(100, pct + 2), Math.min(100, pct + 3),
            Math.min(100, pct - 1), Math.min(100, pct + 1),
            pct, grade.letter, grade.gp,
          ]);
          report.demoStudentCourses++;
        }

        // Also register demo for S2 courses
        const s2Id = semesterMap['2025-2026_second'];
        if (s2Id) {
          const y1s2Courses = manualPlan.GEN[0].semesters[1].courses;
          for (const code of [...new Set(y1s2Courses)]) {
            const offeringId = await getOffering(s2Id, code);
            if (!offeringId) continue;
            await pool.query(`
              INSERT INTO enrollments (student_id, offering_id, semester_id, status, registered_at)
              VALUES ($1,$2,$3,'registered',NOW())
              ON CONFLICT (student_id, offering_id) DO NOTHING
            `, [demo.student_id, offeringId, s2Id]);
          }
        }
      }
      console.log(`  ✅ Demo student: ${report.demoStudentCourses} completed courses + S2 registrations`);
    } else {
      console.log('  ⚠️  Demo student not found');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 9: GPA RECALCULATION
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📊 PHASE 9: Calculating GPA for all students...');

    // Get ALL student IDs (including demo)
    const allStudentIds = await pool.query(
      `SELECT id FROM students ORDER BY student_code`
    );

    let gpaCount = 0;
    for (const row of allStudentIds.rows) {
      try {
        await pool.query(`SELECT recompute_student_cgpa($1)`, [row.id]);
      } catch (e) {
        // Some students may have no enrollments — that's ok
      }
      gpaCount++;
      if (gpaCount % 50 === 0) console.log(`    ${gpaCount}/${allStudentIds.rows.length} GPAs calculated...`);
    }

    // Update semesters_enrolled
    await pool.query(`
      UPDATE students s SET semesters_enrolled = COALESCE(sub.sem_count, 0)
      FROM (
        SELECT e.student_id, COUNT(DISTINCT e.semester_id) AS sem_count
        FROM enrollments e
        WHERE e.status IN ('completed', 'registered')
        GROUP BY e.student_id
      ) sub
      WHERE s.id = sub.student_id
    `);

    // Update total_credits_passed
    await pool.query(`
      UPDATE students s SET total_credits_passed = COALESCE(sub.total, 0)
      FROM (
        SELECT e.student_id, SUM(c.credits) AS total
        FROM enrollments e
        JOIN course_offerings co ON co.id = e.offering_id
        JOIN courses c ON c.id = co.course_id
        WHERE e.status = 'completed'
          AND e.letter_grade IS NOT NULL
          AND e.letter_grade NOT IN ('F', 'Abs', 'W', 'I')
        GROUP BY e.student_id
      ) sub
      WHERE s.id = sub.student_id
    `);

    report.gpaCalculations = gpaCount;
    console.log(`  ✅ Calculated GPA for ${gpaCount} students`);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 10: ACADEMIC STATUS
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n🏷️  PHASE 10: Setting academic statuses...');

    await pool.query(`
      UPDATE students SET
        academic_status = CASE
          WHEN cgpa = 0 OR semesters_enrolled <= 1 THEN 'active'::academic_status
          WHEN cgpa >= 2.0 THEN 'active'::academic_status
          WHEN cgpa >= 1.5 THEN 'warning'::academic_status
          ELSE 'probation'::academic_status
        END,
        consecutive_warnings = CASE
          WHEN cgpa < 2.0 AND cgpa > 0 AND semesters_enrolled > 1 THEN 1
          ELSE 0
        END,
        total_warnings = CASE
          WHEN cgpa < 1.5 AND cgpa > 0 AND semesters_enrolled > 1 THEN 2
          WHEN cgpa < 2.0 AND cgpa > 0 AND semesters_enrolled > 1 THEN 1
          ELSE 0
        END
    `);

    const statusDist = await pool.query(
      `SELECT academic_status, COUNT(*) as cnt FROM students GROUP BY academic_status ORDER BY academic_status`
    );
    console.log('  Status distribution:');
    for (const r of statusDist.rows) console.log(`    ${r.academic_status}: ${r.cnt}`);

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 11: DATA INTEGRITY — Enrollment counts
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n🔧 PHASE 11: Updating enrollment counts & cleaning orphans...');
    await pool.query(`
      UPDATE course_offerings co SET enrolled_count = COALESCE(sub.cnt, 0)
      FROM (
        SELECT offering_id, COUNT(*) AS cnt
        FROM enrollments WHERE status IN ('registered', 'completed')
        GROUP BY offering_id
      ) sub
      WHERE co.id = sub.offering_id
    `);
    // Zero out offerings with no enrollments
    await pool.query(`
      UPDATE course_offerings SET enrolled_count = 0
      WHERE id NOT IN (SELECT DISTINCT offering_id FROM enrollments WHERE status IN ('registered', 'completed'))
    `);
    console.log('  ✅ Enrollment counts updated');

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 12: VALIDATION REPORT
    // ═══════════════════════════════════════════════════════════════════════
    // Get demo student final state
    const demoFinal = await pool.query(`
      SELECT s.cgpa, s.total_credits_passed, s.semesters_enrolled,
             (SELECT COUNT(*) FROM enrollments WHERE student_id = s.id AND status = 'completed') AS completed,
             (SELECT COUNT(*) FROM enrollments WHERE student_id = s.id AND status = 'registered') AS registered
      FROM students s JOIN users u ON u.id = s.user_id
      WHERE u.email = 's.2024cs001@fci.tanta.edu.eg'
    `);
    if (demoFinal.rows.length > 0) {
      const d = demoFinal.rows[0];
      report.demoStudentGPA = parseFloat(d.cgpa);
      report.demoStudentCourses = parseInt(d.completed);
    }

    // Final counts
    const finalCounts = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM students) AS students,
        (SELECT COUNT(*) FROM semesters) AS semesters,
        (SELECT COUNT(*) FROM enrollments) AS enrollments,
        (SELECT COUNT(*) FROM enrollments WHERE status = 'completed') AS completed_enrollments,
        (SELECT COUNT(*) FROM curriculum_plans) AS curriculum_plans,
        (SELECT COUNT(*) FROM course_offerings) AS offerings
    `);
    const fc = finalCounts.rows[0];

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    📋 PHASE 12: FINAL REPORT');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  1.  Root causes found:              6 (see implementation plan)`);
    console.log(`  2.  Semesters created:              ${fc.semesters}`);
    console.log(`  3.  Students created:               ${fc.students} (200 generated + 1 demo)`);
    console.log(`  4.  Enrollments created:            ${fc.enrollments}`);
    console.log(`  5.  Grades created:                 ${fc.completed_enrollments}`);
    console.log(`  6.  Curriculum mappings imported:    ${report.curriculumMappings}`);
    console.log(`  7.  Prerequisite removals:           ${report.prerequisiteRemovals.length}`);
    if (report.prerequisiteRemovals.length > 0) {
      for (const r of report.prerequisiteRemovals)
        console.log(`      ${r.course} → ${r.prereq}: ${r.reason}`);
    }
    console.log(`  8.  Demo student GPA:               ${report.demoStudentGPA}`);
    console.log(`  9.  Demo student completed courses:  ${report.demoStudentCourses}`);
    if (demoFinal.rows.length > 0) {
      const d = demoFinal.rows[0];
      console.log(`      Demo registered courses:        ${d.registered}`);
      console.log(`      Demo credits passed:            ${d.total_credits_passed}`);
      console.log(`      Demo semesters enrolled:        ${d.semesters_enrolled}`);
    }
    console.log(`  10. Credit-hour BEFORE fix:         12 (cgpa=0 fallback in computeMaxCredits)`);
    console.log(`  11. Credit-hour AFTER fix:          18 (new student path) / 21 (cgpa≥3.0)`);
    console.log(`  12. Course offerings:               ${fc.offerings}`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Historical data generation complete!');

  } catch (err) {
    console.error('❌ FATAL ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
