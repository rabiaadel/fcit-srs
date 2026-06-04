-- 1a. Confirm seed execution order
SELECT seed_name, applied_at FROM seed_logs ORDER BY applied_at;

-- 1b. Check every semester's current status and active flag
SELECT id, label, semester_type, status, is_active
FROM semesters ORDER BY start_date;

-- 1c. Count enrollments per semester for the demo student
SELECT sem.label, COUNT(e.id) AS enrollment_count, 
       ARRAY_AGG(DISTINCT e.status) AS statuses
FROM enrollments e
JOIN course_offerings co ON co.id = e.offering_id
JOIN semesters sem ON sem.id = co.semester_id
WHERE e.student_id = (
  SELECT id FROM students WHERE user_id = '00000000-0000-0000-0000-000000000003'
)
GROUP BY sem.label ORDER BY sem.label;

-- 1d. Total enrollment count for ALL students in Fall 2025
SELECT COUNT(*) AS total_fall_2025_enrollments
FROM enrollments e
JOIN course_offerings co ON co.id = e.offering_id
JOIN semesters s ON s.id = co.semester_id
WHERE s.label = 'Fall 2025';

-- 1e. Find courses with MORE THAN ONE offering in the same semester
SELECT s.label AS semester, c.code, c.name_ar,
       COUNT(co.id) AS offering_count,
       ARRAY_AGG(co.section_label ORDER BY co.id) AS sections,
       ARRAY_AGG(u.full_name_en ORDER BY co.id) AS doctors
FROM course_offerings co
JOIN semesters s ON s.id = co.semester_id
JOIN courses c ON c.id = co.course_id
LEFT JOIN doctors d ON d.id = co.doctor_id
LEFT JOIN users u ON u.id = d.user_id
GROUP BY s.label, c.code, c.name_ar
HAVING COUNT(co.id) > 1
ORDER BY s.label, c.code;

-- 1f. Find offerings in Spring 2026 for Year-1-Term-1 courses
-- (These should NOT exist in Spring 2026)
SELECT c.code, c.name_ar, c.level, co.section_label,
       co.is_active, u.full_name_en AS doctor
FROM course_offerings co
JOIN semesters s ON s.id = co.semester_id AND s.label = 'Spring 2026'
JOIN courses c ON c.id = co.course_id AND c.level = 1
LEFT JOIN doctors d ON d.id = co.doctor_id
LEFT JOIN users u ON u.id = d.user_id
ORDER BY c.code;

-- 1g. Check demo student's students row
SELECT s.user_id, s.student_code, s.enrollment_year,
       s.current_level, s.cgpa, s.total_credits_passed,
       s.total_credits_attempted, s.academic_status
FROM students s
WHERE s.user_id = '00000000-0000-0000-0000-000000000003';

-- 1h. Check which semester the frontend considers "current"
SELECT id, label, status, is_active, start_date, end_date
FROM semesters
WHERE status IN ('active', 'registration')
   OR is_active = TRUE
ORDER BY start_date;

-- D1. Do ANY Fall 2025 enrollments exist?
SELECT COUNT(*) AS fall_2025_enrollment_count
FROM enrollments e
JOIN course_offerings co ON co.id = e.offering_id
JOIN semesters s ON s.id = co.semester_id
WHERE s.label = 'Fall 2025';

-- D2. How many enrollments exist per semester, total?
SELECT s.label, s.status, COUNT(e.id) AS total_enrollments
FROM semesters s
LEFT JOIN course_offerings co ON co.semester_id = s.id
LEFT JOIN enrollments e ON e.offering_id = co.id
GROUP BY s.id, s.label, s.status
ORDER BY s.start_date;

-- D3. Does Fall 2025 semester exist with the exact label 'Fall 2025'?
SELECT id, label, status, is_active, academic_year_id
FROM semesters
WHERE label = 'Fall 2025';

-- D4. What is the actual label of the semester that covers Sep 2025?
SELECT id, label, status, is_active, start_date, end_date
FROM semesters
WHERE start_date BETWEEN '2025-09-01' AND '2025-10-15'
ORDER BY start_date;

-- D5. Do Fall 2025 course offerings exist and have doctor_ids?
SELECT c.code, co.section_label, co.is_active,
       co.doctor_id IS NULL AS doctor_is_null,
       u.full_name_en AS doctor
FROM course_offerings co
JOIN courses c ON c.id = co.course_id
JOIN semesters s ON s.id = co.semester_id AND s.label = 'Fall 2025'
LEFT JOIN doctors d ON d.id = co.doctor_id
LEFT JOIN users u ON u.id = d.user_id
ORDER BY c.code;

-- D6. Does seed 005 show in seed_logs?
SELECT seed_name, applied_at FROM seed_logs
WHERE seed_name LIKE '005%'
ORDER BY applied_at;

-- D7. Specifically check the offerings seed 005 would look up:
-- Can seed 005's exact lookup logic find Fall 2025 BS112?
SELECT co.id, co.doctor_id, co.is_active, co.section_label,
       (SELECT id FROM doctors WHERE user_id =
         '00000000-0000-0000-0000-000000000010') AS expected_doctor_id
FROM course_offerings co
JOIN semesters s ON s.id = co.semester_id AND s.label = 'Fall 2025'
JOIN courses c ON c.id = co.course_id AND c.code = 'BS112';

-- D8. If enrollments DO exist (D1 > 0), check whether the frontend
-- semester filter is wrong (display bug, not data bug):
SELECT s.label, s.id, s.status, s.is_active
FROM semesters s
WHERE s.is_active = TRUE OR s.status IN ('active', 'registration', 'grading');
