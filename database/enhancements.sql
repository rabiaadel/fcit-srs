-- =============================================================================
-- FCIT SRS - Database Enhancements
-- Additional views, functions, and performance tuning
-- =============================================================================

-- -------------------------------------------------------
-- Attendance percentage updater (called by backend)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION refresh_attendance_summary(p_enrollment_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total INT;
    v_attended INT;
    v_excused INT;
    v_pct NUMERIC;
BEGIN
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE ar.is_present = TRUE),
        COUNT(*) FILTER (WHERE ar.is_excused = TRUE AND ar.is_present = FALSE)
    INTO v_total, v_attended, v_excused
    FROM attendance_records ar
    JOIN attendance_sessions ats ON ats.id = ar.session_id
    WHERE ar.enrollment_id = p_enrollment_id;

    IF v_total > 0 THEN
        v_pct := ROUND(((v_attended::NUMERIC + v_excused) / v_total) * 100, 2);
    ELSE
        v_pct := 0;
    END IF;

    INSERT INTO attendance_summary (enrollment_id, total_sessions, attended_sessions, excused_absences, attendance_pct, last_updated)
    VALUES (p_enrollment_id, v_total, v_attended, v_excused, v_pct, NOW())
    ON CONFLICT (enrollment_id) DO UPDATE SET
        total_sessions = EXCLUDED.total_sessions,
        attended_sessions = EXCLUDED.attended_sessions,
        excused_absences = EXCLUDED.excused_absences,
        attendance_pct = EXCLUDED.attendance_pct,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- Grade entry: auto-compute total and letter grade
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION finalize_enrollment_grade(p_enrollment_id UUID)
RETURNS VOID AS $$
DECLARE
    v_rec enrollments%ROWTYPE;
    v_total NUMERIC;
    v_letter grade_code;
    v_points NUMERIC;
    v_passed BOOLEAN;
    v_min_final NUMERIC;
BEGIN
    SELECT * INTO v_rec FROM enrollments WHERE id = p_enrollment_id;

    -- Calculate total: seasonal (40%) + final (60%) by default
    -- Seasonal = midterm + coursework + practical
    -- Bylaw: minimum 40% total, 30% of final exam
    v_total := COALESCE(
        (COALESCE(v_rec.midterm_grade, 0) * 0.20) +
        (COALESCE(v_rec.coursework_grade, 0) * 0.10) +
        (COALESCE(v_rec.practical_grade, 0) * 0.10) +
        (COALESCE(v_rec.final_exam_grade, 0) * 0.60),
        0
    );

    v_total := ROUND(v_total, 2);

    -- Check minimum final exam (30% of final = 18% of total minimum)
    v_min_final := COALESCE(v_rec.final_exam_grade, 0);
    IF v_min_final < 30 THEN
        -- Below minimum final exam threshold -> Fail regardless
        v_letter := 'F';
        v_points := 0.0;
    ELSIF v_total < 50 THEN
        v_letter := 'F';
        v_points := 0.0;
    ELSE
        v_letter := percentage_to_letter_grade(v_total);
        v_points := percentage_to_grade_points(v_total);
    END IF;

    UPDATE enrollments SET
        total_grade = v_total,
        letter_grade = v_letter,
        grade_points = v_points,
        status = 'completed',
        updated_at = NOW()
    WHERE id = p_enrollment_id;

    -- Recompute student CGPA
    PERFORM recompute_student_cgpa(v_rec.student_id);
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- Handle improvement retake (bylaw: max grade capped at B=3.0)
-- After saving a retake, update the "counted" flag
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION process_retake_grade(
    p_student_id UUID,
    p_course_id INT
)
RETURNS VOID AS $$
DECLARE
    v_enrollments RECORD;
    v_best_grade NUMERIC := 0;
    v_best_enrollment_id UUID;
    v_retake_count INT;
    v_is_improvement BOOLEAN;
BEGIN
    -- Get all completed enrollments for this course by this student
    SELECT COUNT(*) INTO v_retake_count
    FROM enrollments e
    JOIN course_offerings co ON co.id = e.offering_id
    WHERE e.student_id = p_student_id
      AND co.course_id = p_course_id
      AND e.status = 'completed';

    -- Find the best grade
    SELECT e.id, e.total_grade INTO v_best_enrollment_id, v_best_grade
    FROM enrollments e
    JOIN course_offerings co ON co.id = e.offering_id
    WHERE e.student_id = p_student_id
      AND co.course_id = p_course_id
      AND e.status = 'completed'
    ORDER BY e.total_grade DESC NULLS LAST
    LIMIT 1;

    -- Bylaw: if retaking for improvement, cap at B (3.0 = 80%)
    -- Cap the grade_points at 3.0 if it's an improvement retake
    -- Mark all others as not counted
    UPDATE enrollments e SET is_counted_in_gpa = FALSE
    FROM course_offerings co
    WHERE co.id = e.offering_id
      AND e.student_id = p_student_id
      AND co.course_id = p_course_id
      AND e.status = 'completed';

    -- Mark best as counted
    UPDATE enrollments SET is_counted_in_gpa = TRUE
    WHERE id = v_best_enrollment_id;

    -- Apply cap for improvement retakes (max B = 3.0 points)
    UPDATE enrollments e SET
        grade_points = LEAST(grade_points, 3.0)
    FROM course_offerings co
    WHERE co.id = e.offering_id
      AND e.student_id = p_student_id
      AND co.course_id = p_course_id
      AND e.is_improvement_retake = TRUE;

    -- Update retake log
    UPDATE course_retake_log SET
        attempt_count = v_retake_count,
        best_grade = v_best_grade,
        updated_at = NOW()
    WHERE student_id = p_student_id AND course_id = p_course_id;

    -- Recompute CGPA
    PERFORM recompute_student_cgpa(p_student_id);
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- Check graduation eligibility (comprehensive)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION check_graduation_eligibility(p_student_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_student students%ROWTYPE;
    v_training1_done BOOLEAN;
    v_training2_done BOOLEAN;
    v_project1_done BOOLEAN;
    v_project2_done BOOLEAN;
    v_has_f_grades BOOLEAN;
    v_result JSONB;
BEGIN
    SELECT * INTO v_student FROM students WHERE id = p_student_id;

    SELECT EXISTS(SELECT 1 FROM training_records WHERE student_id = p_student_id AND training_number = 1 AND status = 'completed') INTO v_training1_done;
    SELECT EXISTS(SELECT 1 FROM training_records WHERE student_id = p_student_id AND training_number = 2 AND status = 'completed') INTO v_training2_done;
    SELECT EXISTS(SELECT 1 FROM graduation_projects WHERE student_id = p_student_id AND part = 1 AND is_passed = TRUE) INTO v_project1_done;
    SELECT EXISTS(SELECT 1 FROM graduation_projects WHERE student_id = p_student_id AND part = 2 AND is_passed = TRUE) INTO v_project2_done;
    SELECT EXISTS(
        SELECT 1 FROM enrollments e
        JOIN course_offerings co ON co.id = e.offering_id
        JOIN courses c ON c.id = co.course_id
        WHERE e.student_id = p_student_id AND e.letter_grade = 'F' AND e.is_counted_in_gpa = TRUE AND c.is_credit_bearing = TRUE
    ) INTO v_has_f_grades;

    v_result := jsonb_build_object(
        'student_id', p_student_id,
        'credits_passed', v_student.total_credits_passed,
        'credits_required', 132,
        'credits_met', v_student.total_credits_passed >= 132,
        'cgpa', v_student.cgpa,
        'cgpa_met', v_student.cgpa >= 2.0,
        'training1_done', v_training1_done,
        'training2_done', v_training2_done,
        'project1_done', v_project1_done,
        'project2_done', v_project2_done,
        'no_pending_f_grades', NOT v_has_f_grades,
        'remedial_math_ok', (NOT v_student.remedial_math_required OR v_student.remedial_math_passed),
        'is_eligible', (
            v_student.total_credits_passed >= 132 AND
            v_student.cgpa >= 2.0 AND
            v_training1_done AND v_training2_done AND
            v_project1_done AND v_project2_done AND
            NOT v_has_f_grades AND
            v_student.academic_status NOT IN ('dismissed', 'withdrawn')
        ),
        'honors_eligible', (
            v_student.cgpa >= 3.0 AND
            v_student.semesters_enrolled <= 8 AND
            NOT v_has_f_grades AND
            v_student.total_warnings = 0
        )
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- Dashboard statistics views
-- -------------------------------------------------------
CREATE OR REPLACE VIEW v_admin_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM students WHERE academic_status = 'active') AS active_students,
    (SELECT COUNT(*) FROM students WHERE academic_status = 'warning') AS warning_students,
    (SELECT COUNT(*) FROM students WHERE academic_status = 'dismissed') AS dismissed_students,
    (SELECT COUNT(*) FROM students WHERE academic_status = 'graduated') AS graduated_students,
    (SELECT COUNT(*) FROM doctors) AS total_doctors,
    (SELECT COUNT(*) FROM courses WHERE is_active = TRUE) AS active_courses,
    (SELECT COUNT(*) FROM enrollments WHERE status = 'registered') AS current_enrollments,
    (SELECT AVG(cgpa)::NUMERIC(4,3) FROM students WHERE academic_status IN ('active','warning')) AS avg_cgpa;

-- Students per specialization
CREATE OR REPLACE VIEW v_specialization_stats AS
SELECT
    s.specialization,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE s.academic_status = 'active') AS active,
    ROUND(AVG(s.cgpa), 3) AS avg_cgpa
FROM students s
WHERE s.specialization IS NOT NULL
GROUP BY s.specialization;

-- Semester credit load distribution
CREATE OR REPLACE VIEW v_semester_load_distribution AS
SELECT
    sem.label,
    sem.semester_type,
    COUNT(DISTINCT e.student_id) AS registered_students,
    ROUND(AVG(sub.total_credits), 2) AS avg_credits_per_student,
    SUM(sub.total_credits) AS total_credit_hours
FROM semesters sem
JOIN enrollments e ON e.semester_id = sem.id AND e.status = 'registered'
JOIN (
    SELECT e2.student_id, e2.semester_id, SUM(c.credits) AS total_credits
    FROM enrollments e2
    JOIN course_offerings co ON co.id = e2.offering_id
    JOIN courses c ON c.id = co.course_id
    WHERE e2.status = 'registered'
    GROUP BY e2.student_id, e2.semester_id
) sub ON sub.student_id = e.student_id AND sub.semester_id = sem.id
GROUP BY sem.id, sem.label, sem.semester_type;
