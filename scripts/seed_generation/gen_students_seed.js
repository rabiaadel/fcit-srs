const fs = require('fs');
const { rawYear1, rawYear2, rawYear3_CS, rawYear3_IS, rawYear3_IT, rawYear4_CS, rawYear4_IS, rawYear4_IT } = require('./raw_tables');

const v_student_pw = '$2b$10$wTfK4l25D/X5t.dD8K0y/.y.g.1g1/A468.Zg3o80O9E9M58957uO'; // Valid hash for 'Student@2026!'

function parseTable(raw, year, dept, groupBase) {
  return raw.trim().split('\n').filter(l => l.trim()).map(line => {
    let parts = line.split('|').map(x => x.trim()).filter(x => x);
    let group = year <= 2 ? parts[5] : groupBase;
    let gender = year <= 2 ? parts[6] : parts[5];
    let natId = year <= 2 ? parts[7] : parts[6];
    let phone = year <= 2 ? parts[8] : parts[7];
    let gpa = parseFloat(year <= 2 ? parts[9] : parts[8]);
    let standing = year <= 2 ? parts[10] : parts[9];
    
    // uuid suffix: …000000030 -> 00000000-0000-0000-0000-000000000030
    let uuidSuffix = parts[1].replace('…', '').padStart(12, '0');
    let uuid = `00000000-0000-0000-0000-${uuidSuffix}`;
    
    return {
      uuid,
      code: parts[2],
      nameEn: parts[3],
      nameAr: parts[4],
      group,
      gender,
      natId,
      phone,
      gpa,
      standing,
      year,
      dept
    };
  });
}

const students = [
  ...parseTable(rawYear1, 1, null, null),
  ...parseTable(rawYear2, 2, null, null),
  ...parseTable(rawYear3_CS, 3, 'CS', 'A'),
  ...parseTable(rawYear3_IS, 3, 'IS', 'B'),
  ...parseTable(rawYear3_IT, 3, 'IT', 'C'),
  ...parseTable(rawYear4_CS, 4, 'CS', 'A'),
  ...parseTable(rawYear4_IS, 4, 'IS', 'B'),
  ...parseTable(rawYear4_IT, 4, 'IT', 'C')
];

const gradeScale = [
  { letter: 'A', points: 4.0 },
  { letter: 'B+', points: 3.5 },
  { letter: 'B', points: 3.0 },
  { letter: 'C+', points: 2.5 },
  { letter: 'C', points: 2.0 },
  { letter: 'D+', points: 1.5 },
  { letter: 'D', points: 1.0 },
  { letter: 'F', points: 0.0 }
];

function assignGrades(targetGpa, coursesList) {
  let totalCredits = coursesList.reduce((sum, c) => sum + c.cr, 0);
  let targetPoints = targetGpa * totalCredits;
  
  let bestDist = null;
  let bestDiff = Infinity;
  
  function search(index, currentPoints, currentDist) {
    if (index === coursesList.length) {
      let diff = Math.abs(currentPoints - targetPoints);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestDist = [...currentDist];
      }
      return;
    }
    if (bestDiff < 0.1) return;
    
    let allowedGrades = [];
    if (targetGpa >= 3.75) allowedGrades = ['A', 'B+'];
    else if (targetGpa >= 3.5) allowedGrades = ['A', 'B+', 'B'];
    else if (targetGpa >= 3.0) allowedGrades = ['A', 'B+', 'B', 'C+'];
    else if (targetGpa >= 2.5) allowedGrades = ['A', 'B+', 'B', 'C+', 'C'];
    else if (targetGpa >= 2.0) allowedGrades = ['B', 'C+', 'C', 'D+'];
    else if (targetGpa >= 1.5) allowedGrades = ['C+', 'C', 'D+', 'D', 'F'];
    else allowedGrades = ['C', 'D+', 'D', 'F'];
    
    for (let g of gradeScale) {
      if (!allowedGrades.includes(g.letter)) continue;
      currentDist.push(g);
      search(index + 1, currentPoints + g.points * coursesList[index].cr, currentDist);
      currentDist.pop();
    }
  }
  search(0, 0, []);
  if (bestDiff > 0.5) {
    bestDiff = Infinity;
    function searchAll(index, currentPoints, currentDist) {
      if (index === coursesList.length) {
        let diff = Math.abs(currentPoints - targetPoints);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestDist = [...currentDist];
        }
        return;
      }
      if (bestDiff < 0.1) return;
      for (let g of gradeScale) {
        currentDist.push(g);
        searchAll(index + 1, currentPoints + g.points * coursesList[index].cr, currentDist);
        currentDist.pop();
      }
    }
    searchAll(0, 0, []);
  }
  
  return coursesList.map((c, i) => ({
    ...c,
    grade: bestDist[i].letter,
    grade_points: bestDist[i].points
  }));
}

// Map courses to their credits and dr
const y1First Semester = [
  { c: 'BS112', cr: 3, dr: 'v_dr_aida' }, { c: 'CS111', cr: 3, dr: 'v_dr_osama' }, { c: 'IS111', cr: 3, dr: 'v_dr_omnia' },
  { c: 'BS111', cr: 3, dr: 'v_dr_nancy' }, { c: 'BS116', cr: 3, dr: 'v_dr_shimaa' }, { c: 'UNV113', cr: 2, dr: 'v_dr_walid_s' }
];
const y1Second Semester = [
  { c: 'BS115', cr: 3, dr: 'v_dr_aida' }, { c: 'UNV112', cr: 2, dr: 'v_dr_ahmed' }, { c: 'BS113', cr: 3, dr: 'v_dr_mostafa' },
  { c: 'UNV114', cr: 2, dr: 'v_dr_arwa' }, { c: 'UNV111', cr: 2, dr: 'v_dr_shimaa' }, { c: 'CS112', cr: 3, dr: 'v_dr_osama' }
];
const y2First Semester = [
  { c: 'BS114', cr: 3, dr: 'v_dr_hanaa_h' }, { c: 'BS117', cr: 3, dr: 'v_dr_nancy' }, { c: 'CS211', cr: 3, dr: 'v_dr_osama' },
  { c: 'SE211', cr: 3, dr: 'v_dr_arwa' }, { c: 'CS212', cr: 3, dr: 'v_dr_mostafa' }, { c: 'IT211', cr: 3, dr: 'v_dr_aida' }
];
const y2Second Semester = [
  { c: 'IS211', cr: 3, dr: 'v_dr_omnia' }, { c: 'CS214', cr: 3, dr: 'v_dr_hanaa_e' }, { c: 'IT317', cr: 3, dr: 'v_dr_marian' },
  { c: 'IS212', cr: 3, dr: 'v_dr_nancy' }, { c: 'CS213', cr: 3, dr: 'v_dr_osama' }
];
const y3FallCS = [
  { c: 'IT311', cr: 3, dr: 'v_dr_ahmed' }, { c: 'CS313', cr: 3, dr: 'v_dr_ahmed' }, { c: 'CS311', cr: 3, dr: 'v_dr_mostafa' },
  { c: 'IS311', cr: 3, dr: 'v_dr_shimaa' }, { c: 'CS312', cr: 3, dr: 'v_dr_walid_k' }, { c: 'CS331', cr: 3, dr: 'v_dr_osama' }
];
const y3SpringCS = [
  { c: 'CS314', cr: 3, dr: 'v_dr_walid_k' }, { c: 'CS332', cr: 3, dr: 'v_dr_ahmed' }, { c: 'CS411', cr: 3, dr: 'v_dr_mostafa' },
  { c: 'SE315', cr: 3, dr: 'v_dr_arwa' }, { c: 'CS315', cr: 3, dr: 'v_dr_walid_k' }, { c: 'CS316', cr: 3, dr: 'v_dr_ahmed' }
];
const y3FallIS = [
  { c: 'CS314', cr: 3, dr: 'v_dr_ahmed' }, { c: 'IS313', cr: 3, dr: 'v_dr_hany' }, { c: 'IS311', cr: 3, dr: 'v_dr_shimaa' },
  { c: 'IS312', cr: 3, dr: 'v_dr_shimaa' }, { c: 'CS313', cr: 3, dr: 'v_dr_ahmed' }, { c: 'IS351', cr: 3, dr: 'v_dr_omnia' }
];
const y3SpringIS = [
  { c: 'IS315', cr: 3, dr: 'v_dr_shimaa' }, { c: 'IS317', cr: 3, dr: 'v_dr_ibrahim' }, { c: 'IS321', cr: 3, dr: 'v_dr_shimaa' },
  { c: 'IS318', cr: 3, dr: 'v_dr_omnia' }, { c: 'IS314', cr: 3, dr: 'v_dr_omnia' }
];
const y3FallIT = [
  { c: 'IT311', cr: 3, dr: 'v_dr_ahmed' }, { c: 'IT321', cr: 3, dr: 'v_dr_hany' }, { c: 'CS313', cr: 3, dr: 'v_dr_ahmed' },
  { c: 'IT315', cr: 3, dr: 'v_dr_tahani' }, { c: 'IT312', cr: 3, dr: 'v_dr_marian' }, { c: 'IT314', cr: 3, dr: 'v_dr_aida' }
];
const y3SpringIT = [
  { c: 'IT319', cr: 3, dr: 'v_dr_marian' }, { c: 'IT322', cr: 3, dr: 'v_dr_aida' }, { c: 'IT318', cr: 3, dr: 'v_dr_arwa' },
  { c: 'IT317', cr: 3, dr: 'v_dr_tahani' }, { c: 'IT316', cr: 3, dr: 'v_dr_marian' }
];
const y4FallCS = [
  { c: 'CS315', cr: 3, dr: 'v_dr_walid_k' }, { c: 'CS443', cr: 3, dr: 'v_dr_marian' }, { c: 'SE321', cr: 3, dr: 'v_dr_ahmed' },
  { c: 'CS434', cr: 3, dr: 'v_dr_walid_k' }, { c: 'CS413', cr: 3, dr: 'v_dr_hanaa_h' }
];
const y4SpringCS = [
  { c: 'CS331', cr: 3, dr: 'v_dr_hanaa_h' }, { c: 'CS332', cr: 3, dr: 'v_dr_ahmed' }, { c: 'CS416', cr: 3, dr: 'v_dr_hanaa_h' },
  { c: 'CS415', cr: 3, dr: 'v_dr_walid_k' }, { c: 'CS433', cr: 3, dr: 'v_dr_mostafa' }
];
const y4FallIS = [
  { c: 'IS341', cr: 3, dr: 'v_dr_ibrahim' }, { c: 'IS411', cr: 3, dr: 'v_dr_shimaa' }, { c: 'IS412', cr: 3, dr: 'v_dr_hany' },
  { c: 'IS351', cr: 3, dr: 'v_dr_omnia' }, { c: 'CS314', cr: 3, dr: 'v_dr_ahmed' } // CS314 has no time slot, but enrolls
];
const y4SpringIS = [
  { c: 'IS413', cr: 3, dr: 'v_dr_ibrahim' }, { c: 'IS342', cr: 3, dr: 'v_dr_shimaa' }, { c: 'IS415', cr: 3, dr: 'v_dr_iman' },
  { c: 'IS414', cr: 3, dr: 'v_dr_shimaa' }, { c: 'IS321', cr: 3, dr: 'v_dr_hany' }
];
const y4FallIT = [
  { c: 'IT415', cr: 3, dr: 'v_dr_arwa' }, { c: 'IT315', cr: 3, dr: 'v_dr_tahani' }, { c: 'CS315', cr: 3, dr: 'v_dr_walid_k' },
  { c: 'IT444', cr: 3, dr: 'v_dr_marian' }, { c: 'IT313', cr: 3, dr: 'v_dr_aida' }
];
const y4SpringIT = [
  { c: 'IT319', cr: 3, dr: 'v_dr_marian' }, { c: 'IT414', cr: 3, dr: 'v_dr_aida' }, { c: 'IT413', cr: 3, dr: 'v_dr_arwa' },
  { c: 'IT314', cr: 3, dr: 'v_dr_marwa' }, { c: 'IT411', cr: 3, dr: 'v_dr_iman' }
];

let sql = `
-- =================================================================================
-- Seed 005 — 100 Real Students
-- Generates students with past and current enrollments, GPAs, and precise grades
-- =================================================================================

DO $$
DECLARE
  v_student_pw     TEXT := '${v_student_pw}';
  
  v_fall2023_id    INT;
  v_spring2024_id  INT;
  v_fall2024_id    INT;
  v_spring2025_id  INT;
  v_fall2025_id    INT;
  v_spring2026_id  INT;
  
  v_cs_dept        INT;
  v_is_dept        INT;
  v_it_dept        INT;

  v_dr_ahmed       UUID := '00000000-0000-0000-0000-000000000002';
  v_dr_aida        UUID := '00000000-0000-0000-0000-000000000010';
  v_dr_osama       UUID := '00000000-0000-0000-0000-000000000011';
  v_dr_omnia       UUID := '00000000-0000-0000-0000-000000000012';
  v_dr_nancy       UUID := '00000000-0000-0000-0000-000000000013';
  v_dr_shimaa      UUID := '00000000-0000-0000-0000-000000000014';
  v_dr_walid_s     UUID := '00000000-0000-0000-0000-000000000015';
  v_dr_mostafa     UUID := '00000000-0000-0000-0000-000000000016';
  v_dr_arwa        UUID := '00000000-0000-0000-0000-000000000017';
  v_dr_hanaa_h     UUID := '00000000-0000-0000-0000-000000000018';
  v_dr_hanaa_e     UUID := '00000000-0000-0000-0000-000000000019';
  v_dr_marian      UUID := '00000000-0000-0000-0000-000000000020';
  v_dr_walid_k     UUID := '00000000-0000-0000-0000-000000000021';
  v_dr_hany        UUID := '00000000-0000-0000-0000-000000000022';
  v_dr_tahani      UUID := '00000000-0000-0000-0000-000000000023';
  v_dr_ibrahim     UUID := '00000000-0000-0000-0000-000000000024';
  v_dr_iman        UUID := '00000000-0000-0000-0000-000000000025';
  v_dr_marwa       UUID := '00000000-0000-0000-0000-000000000026';
  
  v_student_id     UUID;
  v_offering_id    INT;
BEGIN
  IF EXISTS (SELECT 1 FROM seed_logs WHERE seed_name = '005_real_students.sql') THEN
    RAISE NOTICE 'Seed 005 already run, skipping.';
    RETURN;
  END IF;

  INSERT INTO academic_years (id, year_label, start_date, end_date, is_current)
  VALUES
    (101, '2022-2023', '2022-09-01', '2023-06-30', false)
  ON CONFLICT (year_label) DO NOTHING;

  INSERT INTO semesters (academic_year_id, label, semester_type, start_date, end_date, status, registration_start, registration_end, add_drop_deadline, withdrawal_deadline)
  VALUES
    (101, 'First Semester 2022',   'first',   '2022-09-15', '2023-01-31', 'closed', '2022-09-01', '2022-09-14', '2022-09-29', '2022-11-03'),
    (101, 'Second Semester 2023', 'second', '2023-02-15', '2023-06-30', 'closed', '2023-02-01', '2023-02-14', '2023-03-01', '2023-04-05'),
    (1,   'First Semester 2023',   'first',   '2023-09-15', '2024-01-31', 'closed', '2023-09-01', '2023-09-14', '2023-09-29', '2023-11-03'),
    (1,   'Second Semester 2024', 'second', '2024-02-15', '2024-06-30', 'closed', '2024-02-01', '2024-02-14', '2024-03-01', '2024-04-05'),
    (2,   'First Semester 2024',   'first',   '2024-09-15', '2025-01-31', 'closed', '2024-09-01', '2024-09-14', '2024-09-29', '2024-11-03'),
    (2,   'Second Semester 2025', 'second', '2025-02-15', '2025-06-30', 'closed', '2025-02-01', '2025-02-14', '2025-03-01', '2025-04-05')
  ON CONFLICT (academic_year_id, semester_type) DO NOTHING;

  SELECT id INTO v_fall2023_id   FROM semesters WHERE label = 'First Semester 2023';
  SELECT id INTO v_spring2024_id FROM semesters WHERE label = 'Second Semester 2024';
  SELECT id INTO v_fall2024_id   FROM semesters WHERE label = 'First Semester 2024';
  SELECT id INTO v_spring2025_id FROM semesters WHERE label = 'Second Semester 2025';
  SELECT id INTO v_fall2025_id   FROM semesters WHERE label = 'First Semester 2025';
  SELECT id INTO v_spring2026_id FROM semesters WHERE label = 'Second Semester 2026';
  
  SELECT id INTO v_cs_dept FROM departments WHERE code = 'CS';
  SELECT id INTO v_is_dept FROM departments WHERE code = 'IS';
  SELECT id INTO v_it_dept FROM departments WHERE code = 'IT';

  -- ── 1. INSERT 100 user accounts ──────────────────────────────────────
  INSERT INTO users (id, email, password_hash, role, full_name_ar, full_name_en, national_id, phone, must_change_pw, is_active)
  VALUES
`;

let userVals = students.map(s => {
  return `    ('${s.uuid}', 's.${s.code.toLowerCase()}@fci.tanta.edu.eg', v_student_pw, 'student', '${s.nameAr}', '${s.nameEn.replace(/'/g, "''")}', '${s.natId}', '${s.phone}', FALSE, TRUE)`;
});
sql += userVals.join(',\n') + '\n  ON CONFLICT (id) DO NOTHING;\n\n';

sql += '  -- ── 2. INSERT 100 student profiles ───────────────────────────────────\n';
sql += '  INSERT INTO students (user_id, student_code, enrollment_year, specialization, current_level, cgpa, total_credits_passed, total_credits_attempted, semesters_enrolled)\n  VALUES\n';

let studentVals = students.map(s => {
  let enrollment_year = s.year === 1 ? 2025 : s.year === 2 ? 2024 : s.year === 3 ? 2023 : 2022;
  let current_level = s.year === 1 ? 'الفرقة الأولى' : s.year === 2 ? 'الفرقة الثانية' : s.year === 3 ? 'الفرقة الثالثة' : 'الفرقة الرابعة';
  let specStr = s.dept ? `'${s.dept}'` : 'NULL';
  let completed = s.year === 1 ? 17 : s.year === 2 ? 50 : s.year === 3 ? 83 : 116;
  let sems = s.year === 1 ? 1 : s.year === 2 ? 3 : s.year === 3 ? 5 : 7;
  return `    ('${s.uuid}', '${s.code}', ${enrollment_year}, ${specStr}, '${current_level}', ${s.gpa}, ${completed}, ${completed}, ${sems})`;
});
sql += studentVals.join(',\n') + '\n  ON CONFLICT (user_id) DO NOTHING;\n\n';

sql += '  -- ── 3. ENROLLMENTS ─────────────────────────────────────────────\n';

// For each student, generate the block
for (let s of students) {
  sql += `  -- Student: ${s.nameEn} (${s.code})\n`;
  sql += `  SELECT id INTO v_student_id FROM students WHERE user_id = '${s.uuid}';\n`;
  
  let semesters = [];
  if (s.year >= 1) {
    semesters.push({ label: 'First Semester 2025', var: 'v_fall2025_id', status: 'completed', courses: y1First Semester });
    semesters.push({ label: 'Second Semester 2026', var: 'v_spring2026_id', status: 'enrolled', courses: y1Second Semester });
  }
  if (s.year >= 2) {
    semesters[0] = { label: 'First Semester 2024', var: 'v_fall2024_id', status: 'completed', courses: y1First Semester };
    semesters[1] = { label: 'Second Semester 2025', var: 'v_spring2025_id', status: 'completed', courses: y1Second Semester };
    semesters.push({ label: 'First Semester 2025', var: 'v_fall2025_id', status: 'completed', courses: y2First Semester });
    semesters.push({ label: 'Second Semester 2026', var: 'v_spring2026_id', status: 'enrolled', courses: y2Second Semester });
  }
  if (s.year >= 3) {
    semesters[0] = { label: 'First Semester 2023', var: 'v_fall2023_id', status: 'completed', courses: y1First Semester };
    semesters[1] = { label: 'Second Semester 2024', var: 'v_spring2024_id', status: 'completed', courses: y1Second Semester };
    semesters[2] = { label: 'First Semester 2024', var: 'v_fall2024_id', status: 'completed', courses: y2First Semester };
    semesters[3] = { label: 'Second Semester 2025', var: 'v_spring2025_id', status: 'completed', courses: y2Second Semester };
    
    let fallCourses = s.dept === 'CS' ? y3FallCS : s.dept === 'IS' ? y3FallIS : y3FallIT;
    let springCourses = s.dept === 'CS' ? y3SpringCS : s.dept === 'IS' ? y3SpringIS : y3SpringIT;
    
    semesters.push({ label: 'First Semester 2025', var: 'v_fall2025_id', status: 'completed', courses: fallCourses });
    semesters.push({ label: 'Second Semester 2026', var: 'v_spring2026_id', status: 'enrolled', courses: springCourses });
  }
  if (s.year >= 4) {
    // Shifting everything
    semesters[0] = { label: 'First Semester 2022', var: 'NULL', status: 'completed', courses: y1First Semester }; // Optional past tracking
    semesters[1] = { label: 'Second Semester 2023', var: 'NULL', status: 'completed', courses: y1Second Semester };
    semesters[2] = { label: 'First Semester 2023', var: 'v_fall2023_id', status: 'completed', courses: y2First Semester };
    semesters[3] = { label: 'Second Semester 2024', var: 'v_spring2024_id', status: 'completed', courses: y2Second Semester };
    
    let y3fall = s.dept === 'CS' ? y3FallCS : s.dept === 'IS' ? y3FallIS : y3FallIT;
    let y3spring = s.dept === 'CS' ? y3SpringCS : s.dept === 'IS' ? y3SpringIS : y3SpringIT;
    semesters[4] = { label: 'First Semester 2024', var: 'v_fall2024_id', status: 'completed', courses: y3fall };
    semesters[5] = { label: 'Second Semester 2025', var: 'v_spring2025_id', status: 'completed', courses: y3spring };
    
    let y4fall = s.dept === 'CS' ? y4FallCS : s.dept === 'IS' ? y4FallIS : y4FallIT;
    let y4spring = s.dept === 'CS' ? y4SpringCS : s.dept === 'IS' ? y4SpringIS : y4SpringIT;
    semesters.push({ label: 'First Semester 2025', var: 'v_fall2025_id', status: 'completed', courses: y4fall });
    semesters.push({ label: 'Second Semester 2026', var: 'v_spring2026_id', status: 'enrolled', courses: y4spring });
  }
  
  // Clean up any semesters with NULL var
  semesters = semesters.filter(x => x.var !== 'NULL');
  
  for (let sem of semesters) {
    let gradedCourses = sem.status === 'completed' ? assignGrades(s.gpa, sem.courses) : sem.courses;
    
    for (let course of gradedCourses) {
      sql += `  SELECT id INTO v_offering_id FROM course_offerings WHERE course_id = (SELECT id FROM courses WHERE code = '${course.c}') AND semester_id = ${sem.var} AND doctor_id = (SELECT id FROM doctors WHERE user_id = ${course.dr});\n`;
      sql += `  IF v_offering_id IS NULL THEN\n`;
      sql += `    RAISE WARNING 'Offering not found: ${course.c} ${sem.label} — skipping';\n`;
      sql += `  ELSE\n`;
      
      if (sem.status === 'completed') {
        sql += `    INSERT INTO enrollments (student_id, offering_id, semester_id, letter_grade, grade_points, status)\n`;
        sql += `    VALUES (v_student_id, v_offering_id, ${sem.var}, '${course.grade}', ${course.grade_points.toFixed(1)}, 'completed')\n`;
      } else {
        sql += `    INSERT INTO enrollments (student_id, offering_id, semester_id, letter_grade, grade_points, status)\n`;
        sql += `    VALUES (v_student_id, v_offering_id, ${sem.var}, NULL, NULL, 'registered')\n`;
      }
      sql += `    ON CONFLICT (student_id, offering_id) DO NOTHING;\n`;
      sql += `  END IF;\n`;
    }
  }
}

sql += `
  INSERT INTO seed_logs (seed_name, rows_affected)
  VALUES ('005_real_students.sql', 100);

END $$;
`;

fs.writeFileSync('database/seeds/005_real_students.sql', sql);
console.log('Done generating 005_real_students.sql');
