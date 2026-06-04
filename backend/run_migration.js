const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: 'postgres://postgres:StudentRegistrationPassword2026!@localhost:5432/student_registration_system' });

async function run() {
  const sql = `
DO $$
BEGIN
  -- 1. Fix Credits & Names for UNV Courses
  UPDATE courses SET credits = 1 WHERE code = 'UNV112';
  UPDATE courses SET credits = 1 WHERE code = 'UNV113';
  UPDATE courses SET credits = 1 WHERE code = 'UNV211';
  UPDATE courses SET name_en = 'Comparative Politics', name_ar = 'نظم سياسية مقارنة', credits = 1 WHERE code = 'UNV111';
  UPDATE courses SET name_en = 'Fundamentals of Economics', name_ar = 'أساسيات الاقتصاد', credits = 1 WHERE code = 'UNV114';
  UPDATE courses SET name_en = 'Fundamentals of Management', name_ar = 'أساسيات الإدارة', credits = 1 WHERE code = 'UNV115';

  INSERT INTO courses (code, name_en, name_ar, credits, category, level, is_credit_bearing, is_active)
  VALUES ('UNV116', 'Human Rights', 'حقوق الإنسان', 1, 'university_req', 1, TRUE, TRUE)
  ON CONFLICT (code) DO UPDATE SET credits = 1, name_en = 'Human Rights', name_ar = 'حقوق الإنسان', category = 'university_req';

  -- 2. Fix Credits for CS112 (Intro to Programming) -> 4 cr
  UPDATE courses SET name_en = 'Introduction to Programming', name_ar = 'مقدمة في البرمجة', credits = 4 WHERE code = 'CS112';

  -- 3. Rebuild Curriculum Plans for GENERAL Level 1
  DELETE FROM curriculum_plans 
  WHERE specialization = 'GENERAL' AND year_of_study = 1 AND semester_in_year IN (1, 2);

  INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory)
  SELECT 'GENERAL', 1, 1, id, TRUE FROM courses WHERE code IN (
    'UNV112', 'UNV111', 'BS111', 'UNV113', 'BS112', 'BS116', 'CS111'
  );

  INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory)
  SELECT 'GENERAL', 1, 2, id, TRUE FROM courses WHERE code IN (
    'UNV114', 'UNV115', 'UNV116', 'UNV211', 'BS113', 'BS115', 'IS111', 'CS112'
  );

  -- 4. Cleanup invalid enrollments for the test student
  DELETE FROM enrollments e
  USING course_offerings co, courses c, students s, users u
  WHERE e.offering_id = co.id AND co.course_id = c.id
  AND e.student_id = s.id AND s.user_id = u.id
  AND u.full_name_ar LIKE '%محمد علي حسن%'
  AND c.code NOT IN (
    'UNV112', 'UNV111', 'BS111', 'UNV113', 'BS112', 'BS116', 'CS111',
    'UNV114', 'UNV115', 'UNV116', 'UNV211', 'BS113', 'BS115', 'IS111', 'CS112'
  );

  -- 5. Recalculate CGPA and credit hours for the affected student
  UPDATE students s
  SET cgpa = COALESCE(sub.new_cgpa, 0),
      total_credits_passed = COALESCE(sub.new_credits, 0)
  FROM (
    SELECT
      e.student_id,
      ROUND(SUM(e.grade_points * c.credits)::NUMERIC / NULLIF(SUM(c.credits), 0), 3) AS new_cgpa,
      SUM(CASE WHEN e.letter_grade NOT IN ('F','Abs','W') THEN c.credits ELSE 0 END) AS new_credits
    FROM enrollments e
    JOIN course_offerings co ON co.id = e.offering_id
    JOIN courses c ON c.id = co.course_id
    WHERE e.status = 'completed'
    GROUP BY e.student_id
  ) sub, users u
  WHERE s.id = sub.student_id
    AND s.user_id = u.id
    AND u.full_name_ar LIKE '%محمد علي حسن%';

END $$;
  `;
  try {
    await pool.query(sql);
    console.log("Migration executed successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
