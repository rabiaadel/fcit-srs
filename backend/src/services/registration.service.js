// =============================================================================
// Registration Service - Course registration, withdrawal, grade finalization
// =============================================================================
const { query, withTransaction } = require('../config/database');
const bylawService = require('./bylaw.service');
const gpaService = require('./gpa.service');
const logger = require('../utils/logger');

/**
 * Register a student for a course
 */
async function registerCourse(studentId, offeringId) {
  return withTransaction(async (client) => {
    // Get offering
    const offering = (await client.query(
      'SELECT co.*, c.id as course_id, c.credits, c.name_en, c.code FROM course_offerings co JOIN courses c ON c.id = co.course_id WHERE co.id = $1',
      [offeringId]
    )).rows[0];
    if (!offering) throw new Error('Course offering not found');

    // Validate per bylaws
    const check = await bylawService.canStudentRegisterCourse(studentId, offering.course_id, offering.semester_id);
    if (!check.allowed) throw new Error(check.reason);

    // Check if this is a retake
    const previousAttempts = (await client.query(
      `SELECT COUNT(*) FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id
       WHERE e.student_id = $1 AND co.course_id = $2 AND e.status = 'completed'`,
      [studentId, offering.course_id]
    )).rows[0].count;

    const attemptNumber = parseInt(previousAttempts) + 1;

    // Determine if improvement retake
    const hasPreviousPass = (await client.query(
      `SELECT 1 FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id
       WHERE e.student_id = $1 AND co.course_id = $2 AND e.status = 'completed'
       AND e.letter_grade NOT IN ('F','Abs')`,
      [studentId, offering.course_id]
    )).rows[0];

    const isImprovementRetake = !!hasPreviousPass;

    // If improvement retake, track it
    if (isImprovementRetake) {
      await client.query(
        `INSERT INTO course_retake_log (student_id, course_id, retake_type, attempt_count)
         VALUES ($1, $2, 'improvement', $3)
         ON CONFLICT (student_id, course_id) DO UPDATE SET attempt_count = $3, updated_at = NOW()`,
        [studentId, offering.course_id, attemptNumber]
      );
    } else if (attemptNumber > 1) {
      // Failed retake
      await client.query(
        `INSERT INTO course_retake_log (student_id, course_id, retake_type, attempt_count)
         VALUES ($1, $2, 'failed', $3)
         ON CONFLICT (student_id, course_id) DO UPDATE SET attempt_count = $3, updated_at = NOW()`,
        [studentId, offering.course_id, attemptNumber]
      );
    }

    // Create enrollment
    const enrollment = (await client.query(
      `INSERT INTO enrollments (student_id, offering_id, semester_id, status, attempt_number, is_improvement_retake)
       VALUES ($1, $2, $3, 'registered', $4, $5)
       RETURNING *`,
      [studentId, offeringId, offering.semester_id, attemptNumber, isImprovementRetake]
    )).rows[0];

    // Initialize attendance summary
    await client.query(
      'INSERT INTO attendance_summary (enrollment_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [enrollment.id]
    );

    logger.info('Student registered for course', { studentId, courseCode: offering.code, semester: offering.semester_id });
    return enrollment;
  });
}

/**
 * Withdraw from a course
 */
async function withdrawCourse(enrollmentId, studentId, reason = '') {
  return withTransaction(async (client) => {
    const check = await bylawService.canWithdrawCourse(enrollmentId, studentId);
    if (!check.allowed) throw new Error(check.reason);

    const enrollment = (await client.query(
      'UPDATE enrollments SET status = $1, withdrawn_at = NOW(), withdrawal_reason = $2, letter_grade = $3, grade_points = NULL, updated_at = NOW() WHERE id = $4 RETURNING *',
      ['withdrawn', reason, 'W', enrollmentId]
    )).rows[0];

    logger.info('Student withdrew from course', { enrollmentId, studentId });
    return enrollment;
  });
}

/**
 * Drop a course (within add/drop period - no W recorded)
 */
async function dropCourse(enrollmentId, studentId) {
  return withTransaction(async (client) => {
    const enrollment = (await client.query(
      `SELECT e.*, sem.add_drop_deadline FROM enrollments e
       JOIN semesters sem ON sem.id = e.semester_id
       WHERE e.id = $1 AND e.student_id = $2 AND e.status = 'registered'`,
      [enrollmentId, studentId]
    )).rows[0];

    if (!enrollment) throw new Error('Enrollment not found or not in registered status');

    const now = new Date();
    if (now > new Date(enrollment.add_drop_deadline)) {
      throw new Error('Add/drop deadline has passed. Use withdrawal instead.');
    }

    await client.query(
      'UPDATE enrollments SET status = $1, withdrawn_at = NOW(), updated_at = NOW() WHERE id = $2',
      ['dropped', enrollmentId]
    );

    logger.info('Student dropped course', { enrollmentId, studentId });
    return { success: true };
  });
}

/**
 * Enter/update grades for an enrollment (doctor action)
 */
async function enterGrades(enrollmentId, grades, enteredById) {
  return withTransaction(async (client) => {
    const { midterm_grade, coursework_grade, practical_grade, final_exam_grade } = grades;

    // Validate
    const errors = gpaService.validateGradeEntry({
      midterm: midterm_grade, coursework: coursework_grade,
      practical: practical_grade, final_exam: final_exam_grade
    });
    if (errors.length > 0) throw new Error(errors.join(', '));

    // Check grade entry is not locked
    const existing = (await client.query('SELECT * FROM enrollments WHERE id = $1', [enrollmentId])).rows[0];
    if (!existing) throw new Error('Enrollment not found');
    if (existing.grade_locked) throw new Error('Grades are locked and cannot be modified');

    // Calculate total
    const total = gpaService.calculateTotalGrade({ midterm: midterm_grade, coursework: coursework_grade, practical: practical_grade, final_exam: final_exam_grade });

    // Determine letter and points
    let letter, points;
    if (final_exam_grade < 30) {
      // Below minimum final exam threshold
      letter = 'F'; points = 0.0;
    } else {
      letter = gpaService.percentageToLetter(total);
      points = gpaService.percentageToPoints(total);
    }

    // Update enrollment
    await client.query(
      `UPDATE enrollments SET
         midterm_grade = $1, coursework_grade = $2, practical_grade = $3,
         final_exam_grade = $4, total_grade = $5, letter_grade = $6,
         grade_points = $7, status = 'completed', grade_entered_by = $8,
         grade_entered_at = NOW(), updated_at = NOW()
       WHERE id = $9`,
      [midterm_grade, coursework_grade, practical_grade, final_exam_grade, total, letter, points, enteredById, enrollmentId]
    );

    // Handle retake grade capping and CGPA update
    const enrollment = (await client.query(
      'SELECT e.student_id, co.course_id FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id WHERE e.id = $1',
      [enrollmentId]
    )).rows[0];

    // Process retake grade logic (keeps best grade, clears others from CGPA)
    // Must run for ALL retakes: both failed-course retakes AND voluntary improvement retakes
    if (existing.attempt_number > 1 || existing.is_improvement_retake) {
      // process_retake_grade marks only the best grade as is_counted_in_gpa=TRUE,
      // then recomputes CGPA — handles both retake types correctly
      await client.query('SELECT process_retake_grade($1, $2)', [enrollment.student_id, enrollment.course_id]);
    } else {
      // First attempt — just recompute CGPA
      await client.query('SELECT recompute_student_cgpa($1)', [enrollment.student_id]);
    }

    logger.info('Grades entered', { enrollmentId, total, letter, enteredById });
    return { success: true, total_grade: total, letter_grade: letter, grade_points: points };
  });
}

/**
 * Finalize semester - computes GPA records, issues warnings
 */
async function finalizeSemester(semesterId, adminId) {
  return withTransaction(async (client) => {
    const semester = (await client.query('SELECT * FROM semesters WHERE id = $1', [semesterId])).rows[0];
    if (!semester) throw new Error('Semester not found');

    // Get all students enrolled this semester
    const students = (await client.query(
      'SELECT DISTINCT student_id FROM enrollments WHERE semester_id = $1 AND status = $2',
      [semesterId, 'completed']
    )).rows;

    const results = [];
    for (const { student_id } of students) {
      // Compute semester GPA
      const semEnrollments = (await client.query(
        `SELECT e.grade_points, e.is_counted_in_gpa, c.credits, c.is_credit_bearing
         FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id JOIN courses c ON c.id = co.course_id
         WHERE e.student_id = $1 AND e.semester_id = $2 AND e.status = 'completed'`,
        [student_id, semesterId]
      )).rows;

      const semGPA = gpaService.calculateSemesterGPA(semEnrollments);
      const student = (await client.query('SELECT * FROM students WHERE id = $1', [student_id])).rows[0];

      // Record semester GPA
      await client.query(
        `INSERT INTO semester_gpa_records (student_id, semester_id, semester_gpa, cumulative_gpa, classification)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (student_id, semester_id) DO UPDATE SET semester_gpa = $3, cumulative_gpa = $4, classification = $5, computed_at = NOW()`,
        [student_id, semesterId, semGPA, student.cgpa, gpaService.getCGPAClassification(student.cgpa)]
      );

      // Increment semester count
      await client.query(
        'UPDATE students SET semesters_enrolled = semesters_enrolled + 1 WHERE id = $1',
        [student_id]
      );

      // Check warning
      const updatedStudent = (await client.query('SELECT * FROM students WHERE id = $1', [student_id])).rows[0];
      const needsWarning = bylawService.shouldReceiveWarning(updatedStudent);

      if (needsWarning) {
        await client.query(
          `INSERT INTO academic_warnings (student_id, semester_id, warning_type, cgpa_at_warning)
           VALUES ($1, $2, 'academic', $3) ON CONFLICT DO NOTHING`,
          [student_id, semesterId, updatedStudent.cgpa]
        );
        await client.query(
          'UPDATE students SET consecutive_warnings = consecutive_warnings + 1, total_warnings = total_warnings + 1, academic_status = $1 WHERE id = $2',
          ['warning', student_id]
        );
      } else {
        // Reset consecutive warnings if recovered
        await client.query(
          `UPDATE students SET consecutive_warnings = 0,
           academic_status = CASE WHEN academic_status = 'warning' THEN 'active' ELSE academic_status END
           WHERE id = $1`,
          [student_id]
        );
      }

      // Check dismissal
      const finalStudent = (await client.query('SELECT * FROM students WHERE id = $1', [student_id])).rows[0];
      const dismissal = bylawService.checkDismissalConditions(finalStudent);
      if (dismissal.shouldDismiss) {
        await client.query(
          "UPDATE students SET academic_status = 'dismissed', updated_at = NOW() WHERE id = $1",
          [student_id]
        );
        // Notify student
        await client.query(
          `INSERT INTO notifications (user_id, title, message)
           SELECT user_id, 'Academic Dismissal Notice', $1 FROM students WHERE id = $2`,
          [`You have been dismissed due to: ${dismissal.reasons.join(', ')}`, student_id]
        );
      }

      results.push({ student_id, semGPA, cgpa: finalStudent.cgpa, dismissed: dismissal.shouldDismiss });
    }

    // Mark semester as closed
    await client.query("UPDATE semesters SET status = 'closed' WHERE id = $1", [semesterId]);

    logger.info('Semester finalized', { semesterId, studentsProcessed: students.length });
    return { processed: students.length, results };
  });
}

/**
 * Get student schedule for a semester
 */
async function getStudentSchedule(studentId, semesterId) {
  const res = await query(
    `SELECT e.id as enrollment_id, e.status, e.attempt_number,
            e.total_grade, e.letter_grade, e.grade_points,
            c.code, c.name_ar, c.name_en, c.credits, c.category,
            co.section, co.schedule, co.room, co.capacity, co.enrolled_count,
            u.full_name_en as doctor_name,
            a.attendance_pct
     FROM enrollments e
     JOIN course_offerings co ON co.id = e.offering_id
     JOIN courses c ON c.id = co.course_id
     LEFT JOIN doctors d ON d.id = co.doctor_id
     LEFT JOIN users u ON u.id = d.user_id
     LEFT JOIN attendance_summary a ON a.enrollment_id = e.id
     WHERE e.student_id = $1 AND e.semester_id = $2
     AND e.status IN ('registered', 'completed')
     ORDER BY c.code`,
    [studentId, semesterId]
  );
  return res.rows;
}

module.exports = {
  registerCourse,
  withdrawCourse,
  dropCourse,
  enterGrades,
  finalizeSemester,
  getStudentSchedule,
};
