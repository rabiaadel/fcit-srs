'use strict';
// =============================================================================
// seedHistorical.js — Phases 3-11 of the realistic university data population
//
// Called from setup.js after seeds when student count < 5.
// Creates 200 students, historical semesters, enrollments, grades, and GPA.
// =============================================================================
const path = require('path');
const fs   = require('fs');

// ─────────────────────────────────────────────────────────────────────────────
// GRADE SCALE  (prompt distribution: 4.0/3.7/3.3/3.0/2.7/2.3/2.0/1.7/1.3/1.0)
// ─────────────────────────────────────────────────────────────────────────────
const GRADE_SCALE = [
  { points: 4.0, letter: 'A+', totalGrade: 97, weight: 10 },
  { points: 3.7, letter: 'A',  totalGrade: 93, weight: 15 },
  { points: 3.3, letter: 'A-', totalGrade: 89, weight: 15 },
  { points: 3.0, letter: 'B+', totalGrade: 85, weight: 15 },
  { points: 2.7, letter: 'B',  totalGrade: 81, weight: 15 },
  { points: 2.3, letter: 'B-', totalGrade: 77, weight: 10 },
  { points: 2.0, letter: 'C+', totalGrade: 73, weight: 10 },
  { points: 1.7, letter: 'C',  totalGrade: 69, weight:  5 },
  { points: 1.3, letter: 'C-', totalGrade: 65, weight:  3 },
  { points: 1.0, letter: 'D',  totalGrade: 56, weight:  2 },
];
const CUM_WEIGHTS = [];
let _w = 0;
for (const g of GRADE_SCALE) { _w += g.weight; CUM_WEIGHTS.push(_w); }
const TOTAL_W = _w;

function randomGrade(rng) {
  const r = (rng || Math.random)() * TOTAL_W;
  for (let i = 0; i < CUM_WEIGHTS.length; i++) {
    if (r < CUM_WEIGHTS[i]) return GRADE_SCALE[i];
  }
  return GRADE_SCALE[GRADE_SCALE.length - 1];
}

// ─────────────────────────────────────────────────────────────────────────────
// EGYPTIAN NAMES
// ─────────────────────────────────────────────────────────────────────────────
const MALE_FIRST = [
  'محمد','أحمد','علي','عمر','خالد','يوسف','حسن','إبراهيم','مصطفى','كريم',
  'طارق','وائل','رامي','عادل','حسام','أيمن','ياسر','وليد','شريف','هشام',
  'نادر','زياد','ماهر','سامي','عصام','أشرف','ناصر','هاني','ربيع','منصور',
];
const FEMALE_FIRST = [
  'نور','فاطمة','مريم','دينا','هبة','سارة','رانا','أميرة','نورا','ياسمين',
  'رحمة','علياء','شيرين','ميار','ريم','سحر','إيمان','نيفين','شيماء','غادة',
  'أسماء','وفاء','حنان','رانيا','سمر','نادية','منى','لمياء','دعاء','سلمى',
];
const LAST_NAMES = [
  'محمد','أحمد','إبراهيم','حسن','حسين','السيد','عبدالله','عبدالرحمن','علي','عمر',
  'عبدالعزيز','مصطفى','كمال','سليمان','خليل','الجمال','الدسوقي','العربي','الزيات',
  'الشافعي','البحيري','الغنيمي','المصري','الطيب','العمري','النجار','الكيلاني',
  'الرفاعي','حمودة','صالح',
];

// Simple seeded RNG for reproducibility
function makeRng(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function pickName(idx) {
  const rng  = makeRng(idx * 31337 + 7);
  const male = rng() > 0.38;
  const first = male
    ? MALE_FIRST[Math.floor(rng() * MALE_FIRST.length)]
    : FEMALE_FIRST[Math.floor(rng() * FEMALE_FIRST.length)];
  const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
  return { nameAr: `${first} ${last}`, nameEn: `Student_${idx + 1}` };
}

// ─────────────────────────────────────────────────────────────────────────────
// CURRICULUM (from manual_curriculum_planning in JSON)
// GEN covers Years 1-2; CS/IS/IT cover Years 3-4.
// BS111 appears in both GEN_Y1S1 and GEN_Y1S2 — removed from S2 duplicate.
// IS_Y4S2 has duplicate IS414 — deduplicated.
// ─────────────────────────────────────────────────────────────────────────────
const CURRICULUM = {
  GEN: [
    { year:1, sem:1, courses:['UNV112','UNV117','BS111','UNV113','BS112','BS116','CS111'] },
    { year:1, sem:2, courses:['UNV120','CS112','UNV114','BS115','IT111','UNV111'] },
    { year:2, sem:1, courses:['BS117','IT211','CS211','SE211','BS114','CS212'] },
    { year:2, sem:2, courses:['CS214','CS213','IT212','IS212','IS211','UNV119'] },
  ],
  CS: [
    { year:3, sem:1, courses:['CS311','CS313','IT311','CS331','IS311','CS312'] },
    { year:3, sem:2, courses:['SE315','CS314','CS316','CS411','CS315','CS332'] },
    { year:4, sem:1, courses:['CS315','CS322','CS311','CS443','CS434','PR411'] },
    { year:4, sem:2, courses:['CS332','CS415','CS331','CS416','CS433','PR412'] },
  ],
  IS: [
    { year:3, sem:1, courses:['CS314','CS313','IS313','IS316','IS351','IS311'] },
    { year:3, sem:2, courses:['IS315','IS314','IS321','IS342','IS317','IS318'] },
    { year:4, sem:1, courses:['IS411','IS341','IS412','IS444','CS314','PR421'] },
    { year:4, sem:2, courses:['IS414','IS434','IS321','IS342','PR422'] },
  ],
  IT: [
    { year:3, sem:1, courses:['IT315','CS313','IT311','IT314','IT321','IT312'] },
    { year:3, sem:2, courses:['SE315','IT316','IT319','IT318','IT317','IT322'] },
    { year:4, sem:1, courses:['CS315','IT446','IT415','IT313','IT314','PR431'] },
    { year:4, sem:2, courses:['IT413','IT444','IT414','IT342','IT416','PR432'] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT DISTRIBUTION  (200 students total, not counting demo)
// ─────────────────────────────────────────────────────────────────────────────
const STUDENT_PLAN = [
  // Year 1 — enrolled 2025 (60 students)
  { enrollYear:2025, currentYear:1, spec:'CS', count:20 },
  { enrollYear:2025, currentYear:1, spec:'IS', count:20 },
  { enrollYear:2025, currentYear:1, spec:'IT', count:20 },
  // Year 2 — enrolled 2024 (50 students)
  { enrollYear:2024, currentYear:2, spec:'CS', count:17 },
  { enrollYear:2024, currentYear:2, spec:'IS', count:17 },
  { enrollYear:2024, currentYear:2, spec:'IT', count:16 },
  // Year 3 — enrolled 2023 (45 students)
  { enrollYear:2023, currentYear:3, spec:'CS', count:15 },
  { enrollYear:2023, currentYear:3, spec:'IS', count:15 },
  { enrollYear:2023, currentYear:3, spec:'IT', count:15 },
  // Year 4 — enrolled 2022 (45 students)
  { enrollYear:2022, currentYear:4, spec:'CS', count:15 },
  { enrollYear:2022, currentYear:4, spec:'IS', count:15 },
  { enrollYear:2022, currentYear:4, spec:'IT', count:15 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Build full academic history for a student
//
// Returns array of { semesterId, courses[], isCompleted }
//   isCompleted = false → "registered" (active semester, no grades)
//   isCompleted = true  → "completed" (generate grades)
// ─────────────────────────────────────────────────────────────────────────────
function buildStudentHistory(enrollYear, spec, semMap, activeSemId) {
  const plan = [...CURRICULUM.GEN, ...(CURRICULUM[spec] || [])];
  const history = [];
  const seen = new Set(); // For dedup across years

  for (const { year, sem, courses } of plan) {
    const calYear    = enrollYear + year - 1;
    const yearLabel  = `${calYear}-${calYear + 1}`;
    const semType    = sem === 1 ? 'first' : 'second';
    const semId      = semMap[`${yearLabel}_${semType}`];
    if (!semId) continue;

    // Deduplicate across all years for this student
    const newCourses = courses.filter(c => !seen.has(c));
    if (newCourses.length === 0) continue;

    const isCompleted = (semId !== activeSemId);
    history.push({ semesterId: semId, courses: newCourses, isCompleted });

    if (isCompleted) newCourses.forEach(c => seen.add(c));
  }

  return history;
}

// ─────────────────────────────────────────────────────────────────────────────
// Get or create a course offering (cached)
// ─────────────────────────────────────────────────────────────────────────────
async function getOrCreateOffering(client, semId, courseId, doctorId, cache) {
  const key = `${semId}_${courseId}`;
  if (cache[key] !== undefined) return cache[key];

  const existing = await client.query(
    'SELECT id FROM course_offerings WHERE semester_id=$1 AND course_id=$2 LIMIT 1',
    [semId, courseId]
  );
  if (existing.rows.length > 0) {
    cache[key] = existing.rows[0].id;
    return existing.rows[0].id;
  }

  const ins = await client.query(
    `INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, is_active, section_label, enrolled_count)
     VALUES ($1, $2, $3, 120, TRUE, 'A', 0) RETURNING id`,
    [semId, courseId, doctorId]
  );
  cache[key] = ins.rows[0].id;
  return ins.rows[0].id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch insert helper
// ─────────────────────────────────────────────────────────────────────────────
async function batchInsert(client, table, cols, rows, conflictClause = 'DO NOTHING') {
  if (rows.length === 0) return 0;
  const CHUNK = 200;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const vals = [], params = [];
    let pi = 1;
    for (const row of chunk) {
      vals.push(`(${cols.map(() => `$${pi++}`).join(',')})`);
      params.push(...row);
    }
    const r = await client.query(
      `INSERT INTO ${table} (${cols.join(',')}) VALUES ${vals.join(',')} ON CONFLICT ${conflictClause}`,
      params
    );
    inserted += r.rowCount;
  }
  return inserted;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
async function seedHistoricalData(pool, log) {
  const info  = log ? (m) => log.info(m) : console.log;
  const warn  = log ? (m) => log.warn(m) : console.warn;

  info('[seedHistorical] Starting — Phases 3-11');
  const client = await pool.connect();

  try {
    // ── Phase 3: Load semester map ─────────────────────────────────────────
    info('[seedHistorical] Phase 3: Loading semester map');
    const semRows = await client.query(`
      SELECT s.id, ay.year_label, s.semester_type
      FROM semesters s
      JOIN academic_years ay ON ay.id = s.academic_year_id
    `);
    const semMap = {};
    for (const r of semRows.rows) {
      semMap[`${r.year_label}_${r.semester_type}`] = r.id;
    }
    info(`[seedHistorical] Found ${Object.keys(semMap).length} semesters`);

    const activeSemId = semMap['2025-2026_second'];
    const s1_2026     = semMap['2025-2026_first'];
    if (!activeSemId) throw new Error('Active semester 2025-2026_second not found. Run seed 003 first.');

    // ── Phase 4: Load courses + default doctor ─────────────────────────────
    info('[seedHistorical] Phase 4: Loading courses and doctor');
    const courseRows = await client.query('SELECT id, code, credits FROM courses WHERE is_active = TRUE');
    const courseMap  = {};
    for (const c of courseRows.rows) courseMap[c.code] = { id: c.id, credits: c.credits };

    const doctorRow = await client.query('SELECT id FROM doctors LIMIT 1');
    const doctorId  = doctorRow.rows.length > 0 ? doctorRow.rows[0].id : null;
    if (!doctorId) warn('[seedHistorical] No doctors found — offerings created without doctor_id');

    const offeringsCache = {};

    // ── Phase 5: Generate 200 students ────────────────────────────────────
    info('[seedHistorical] Phase 5: Generating 200 students');
    const DEMO_CODE = '2024CS0001';

    // Pre-hash student password once for efficiency
    const bcrypt = require('bcryptjs');
    const pwHash = bcrypt.hashSync('Student@2026!', 10);

    const userRows     = [];
    const studentRows  = [];
    const studentMeta  = []; // { email, spec, enrollYear, currentYear, nameAr }
    let nameIdx = 0;

    for (const group of STUDENT_PLAN) {
      const specPad = group.spec.toLowerCase();
      const prefix  = `s.${group.enrollYear}${specPad}`;
      for (let n = 1; n <= group.count; n++) {
        const code    = `${group.enrollYear}${group.spec}${String(n).padStart(4,'0')}`;
        if (code === DEMO_CODE) continue; // Never overwrite demo student

        const { nameAr } = pickName(nameIdx++);
        const email = `${prefix}${String(n).padStart(3,'0')}@fci.tanta.edu.eg`;
        const levelName = ['الفرقة الأولى','الفرقة الثانية','الفرقة الثالثة','الفرقة الرابعة'][group.currentYear - 1];

        userRows.push([email, pwHash, 'student', nameAr, `Student_${code}`, true, false]);
        studentRows.push([null, code, group.enrollYear, group.spec, levelName, 'active', 0.000, 'science_math']);
        studentMeta.push({ email, spec: group.spec, enrollYear: group.enrollYear, currentYear: group.currentYear, code });
      }
    }

    // Insert users (email unique), then link students
    info(`[seedHistorical] Inserting ${userRows.length} users...`);
    for (let i = 0; i < userRows.length; i += 100) {
      const chunk = userRows.slice(i, i + 100);
      const vals = [], params = [];
      let pi = 1;
      for (const r of chunk) {
        vals.push(`($${pi++},$${pi++},$${pi++},$${pi++},$${pi++},$${pi++},$${pi++})`);
        params.push(...r);
      }
      await client.query(
        `INSERT INTO users (email,password_hash,role,full_name_ar,full_name_en,is_active,must_change_pw)
         VALUES ${vals.join(',')} ON CONFLICT (email) DO NOTHING`,
        params
      );
    }

    // Insert students linked to their user ids
    info('[seedHistorical] Inserting student records...');
    let insertedStudents = 0;
    for (const meta of studentMeta) {
      const userRes = await client.query('SELECT id FROM users WHERE email=$1', [meta.email]);
      if (userRes.rows.length === 0) continue;
      const userId = userRes.rows[0].id;
      const levelName = ['الفرقة الأولى','الفرقة الثانية','الفرقة الثالثة','الفرقة الرابعة'][meta.currentYear - 1];

      await client.query(
        `INSERT INTO students (user_id,student_code,enrollment_year,specialization,current_level,academic_status,cgpa,track)
         VALUES ($1,$2,$3,$4,$5,'active',0.000,'science_math')
         ON CONFLICT (student_code) DO NOTHING`,
        [userId, meta.code, meta.enrollYear, meta.spec, levelName]
      );
      insertedStudents++;
    }
    info(`[seedHistorical] Inserted ${insertedStudents} students`);

    // ── Phase 6-8: Enrollments + grades for all students ──────────────────
    info('[seedHistorical] Phases 6-8: Building enrollments and grades');
    const allStudents = await client.query(
      `SELECT s.id, s.student_code, s.specialization, s.enrollment_year, u.email
       FROM students s JOIN users u ON u.id=s.user_id
       WHERE u.email != 's.2024cs001@fci.tanta.edu.eg'`
    );

    let totalEnrollments = 0, totalGrades = 0;

    for (const student of allStudents.rows) {
      const spec = student.specialization;
      if (!CURRICULUM[spec] && spec !== 'CS' && spec !== 'IS' && spec !== 'IT') continue;

      const history = buildStudentHistory(student.enrollment_year, spec, semMap, activeSemId);
      if (history.length === 0) continue;

      const rng = makeRng(student.id.charCodeAt(0) * 997 + student.enrollment_year);

      for (const { semesterId, courses, isCompleted } of history) {
        for (const code of courses) {
          const course = courseMap[code];
          if (!course) continue;

          const offeringId = await getOrCreateOffering(client, semesterId, course.id, doctorId, offeringsCache);

          if (isCompleted) {
            const grade = randomGrade(rng);
            // Upsert enrollment (completed)
            await client.query(
              `INSERT INTO enrollments
                 (student_id, offering_id, semester_id, status, letter_grade, grade_points,
                  total_grade, is_counted_in_gpa, attempt_number)
               VALUES ($1,$2,$3,'completed',$4,$5,$6,TRUE,1)
               ON CONFLICT (student_id, offering_id) DO UPDATE SET
                 status='completed', letter_grade=EXCLUDED.letter_grade,
                 grade_points=EXCLUDED.grade_points, total_grade=EXCLUDED.total_grade,
                 is_counted_in_gpa=TRUE`,
              [student.id, offeringId, semesterId, grade.letter, grade.points, grade.totalGrade]
            );
            totalGrades++;
          } else {
            // Current semester — registered only
            await client.query(
              `INSERT INTO enrollments
                 (student_id, offering_id, semester_id, status, is_counted_in_gpa, attempt_number)
               VALUES ($1,$2,$3,'registered',FALSE,1)
               ON CONFLICT (student_id, offering_id) DO NOTHING`,
              [student.id, offeringId, activeSemId]
            );
          }
          totalEnrollments++;
        }
      }
    }
    info(`[seedHistorical] Created ${totalEnrollments} enrollments (${totalGrades} with grades)`);

    // ── Phase 7: Fix demo student ──────────────────────────────────────────
    info('[seedHistorical] Phase 7: Fixing demo student (Omar Ahmed ElSherif)');
    const demoRes = await client.query(
      `SELECT s.id FROM students s JOIN users u ON u.id=s.user_id
       WHERE u.email='s.2024cs001@fci.tanta.edu.eg' LIMIT 1`
    );

    if (demoRes.rows.length > 0) {
      const demoId = demoRes.rows[0].id;

      // Update enrollment_year to 2024 so demo has Year-2 history
      await client.query(
        `UPDATE students SET enrollment_year=2024, specialization='CS',
          current_level='الفرقة الثانية' WHERE id=$1`,
        [demoId]
      );

      // Build Year-2 CS history (enrolled 2024)
      const demoHistory = buildStudentHistory(2024, 'CS', semMap, activeSemId);
      const demoRng = makeRng(42);

      let demoEnr = 0;
      for (const { semesterId, courses, isCompleted } of demoHistory) {
        for (const code of courses) {
          const course = courseMap[code];
          if (!course) continue;

          const offeringId = await getOrCreateOffering(client, semesterId, course.id, doctorId, offeringsCache);

          if (isCompleted) {
            const grade = randomGrade(demoRng);
            await client.query(
              `INSERT INTO enrollments
                 (student_id, offering_id, semester_id, status, letter_grade, grade_points,
                  total_grade, is_counted_in_gpa, attempt_number)
               VALUES ($1,$2,$3,'completed',$4,$5,$6,TRUE,1)
               ON CONFLICT (student_id, offering_id) DO UPDATE SET
                 status='completed', letter_grade=EXCLUDED.letter_grade,
                 grade_points=EXCLUDED.grade_points, total_grade=EXCLUDED.total_grade,
                 is_counted_in_gpa=TRUE`,
              [demoId, offeringId, semesterId, grade.letter, grade.points, grade.totalGrade]
            );
          } else {
            await client.query(
              `INSERT INTO enrollments
                 (student_id, offering_id, semester_id, status, is_counted_in_gpa, attempt_number)
               VALUES ($1,$2,$3,'registered',FALSE,1)
               ON CONFLICT (student_id, offering_id) DO NOTHING`,
              [demoId, offeringId, activeSemId]
            );
          }
          demoEnr++;
        }
      }
      info(`[seedHistorical] Demo student: ${demoEnr} enrollments created`);
    } else {
      warn('[seedHistorical] Demo student not found — skipping Phase 7');
    }

    // ── Phase 9: Recalculate GPA for all students ──────────────────────────
    info('[seedHistorical] Phase 9: Recalculating GPA for all students');
    const allStudentIds = await client.query('SELECT id FROM students');
    for (const { id } of allStudentIds.rows) {
      await client.query('SELECT recompute_student_cgpa($1)', [id]);
    }
    info(`[seedHistorical] GPA recalculated for ${allStudentIds.rows.length} students`);

    // ── Phase 10: Update semesters_enrolled ───────────────────────────────
    info('[seedHistorical] Phase 10: Updating semesters_enrolled');
    await client.query(`
      UPDATE students s
      SET semesters_enrolled = sub.cnt
      FROM (
        SELECT e.student_id, COUNT(DISTINCT co.semester_id) AS cnt
        FROM enrollments e
        JOIN course_offerings co ON co.id = e.offering_id
        JOIN semesters sm ON sm.id = co.semester_id
        WHERE e.status = 'completed'
          AND sm.semester_type IN ('first','second')
        GROUP BY e.student_id
      ) sub
      WHERE s.id = sub.student_id
    `);

    // ── Phase 11: Sync enrolled_count on all offerings ────────────────────
    info('[seedHistorical] Phase 11: Syncing course offering enrolled counts');
    await client.query(`
      UPDATE course_offerings co
      SET enrolled_count = (
        SELECT COUNT(*) FROM enrollments e
        WHERE e.offering_id = co.id
          AND e.status IN ('registered','completed')
      )
    `);

    // ── Final report ──────────────────────────────────────────────────────
    const counts = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM students)           AS students,
        (SELECT COUNT(*) FROM semesters)          AS semesters,
        (SELECT COUNT(*) FROM enrollments)        AS enrollments,
        (SELECT COUNT(*) FROM enrollments WHERE status='completed') AS completed,
        (SELECT COUNT(*) FROM enrollments WHERE status='registered') AS registered,
        (SELECT ROUND(AVG(cgpa),3) FROM students WHERE cgpa > 0) AS avg_cgpa,
        (SELECT MAX(cgpa) FROM students)          AS max_cgpa,
        (SELECT MIN(cgpa) FROM students WHERE cgpa > 0) AS min_cgpa
    `);
    const r = counts.rows[0];
    info('[seedHistorical] ════════════ SEEDING COMPLETE ════════════');
    info(`[seedHistorical]  Students:    ${r.students}`);
    info(`[seedHistorical]  Semesters:   ${r.semesters}`);
    info(`[seedHistorical]  Enrollments: ${r.enrollments} (${r.completed} completed, ${r.registered} registered)`);
    info(`[seedHistorical]  CGPA range:  ${r.min_cgpa} – ${r.max_cgpa} (avg ${r.avg_cgpa})`);

    // Demo student summary
    const demo = await client.query(`
      SELECT s.student_code, s.cgpa, s.total_credits_passed, s.semesters_enrolled,
             s.current_level, s.specialization,
             (SELECT COUNT(*) FROM enrollments e
              JOIN course_offerings co ON co.id=e.offering_id
              WHERE e.student_id=s.id AND co.semester_id=(
                SELECT id FROM semesters WHERE semester_type='second'
                ORDER BY id DESC LIMIT 1)
              AND e.status='registered') AS registered_this_sem
      FROM students s JOIN users u ON u.id=s.user_id
      WHERE u.email='s.2024cs001@fci.tanta.edu.eg'
    `);
    if (demo.rows.length > 0) {
      const d = demo.rows[0];
      info(`[seedHistorical]  Demo student: ${d.student_code} | CGPA=${d.cgpa} | Level=${d.current_level}`);
      info(`[seedHistorical]               Credits passed=${d.total_credits_passed} | Sems enrolled=${d.semesters_enrolled} | Registered now=${d.registered_this_sem}`);
    }
    info('[seedHistorical] ═════════════════════════════════════════');

  } finally {
    client.release();
  }
}

module.exports = { seedHistoricalData };
