// =============================================================================
// Registration Service — Course registration, withdrawal, grade finalization
// [B2-FIX] Integrated notification triggers throughout
// [B4-FIX] enterGrades now covers both registered+completed status
// =============================================================================
const { query, withTransaction } = require('../config/database');
const bylawService = require('./bylaw.service');
const gpaService = require('./gpa.service');
const { recordEnrollment, recordGradeEntry } = require('../middleware/metrics');
const notifService = require('./notification.service');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER COURSE
// ─────────────────────────────────────────────────────────────────────────────
async function registerCourse(studentId, offeringId) {
  return withTransaction(async (client) => {
    const offering = (await client.query(
      `SELECT co.*, c.id as course_id, c.credits, c.name_en, c.code,
              sem.label as semester_label
       FROM course_offerings co
       JOIN courses c ON c.id = co.course_id
       JOIN semesters sem ON sem.id = co.semester_id
       WHERE co.id = $1`,
      [offeringId]
    )).rows[0];
    if (!offering) throw new Error('Course offering not found');

    // Bylaw validation
    const check = await bylawService.canStudentRegisterCourse(studentId, offering.course_id, offering.semester_id);
    if (!check.allowed) throw new Error(check.reason);

    // Determine attempt number
    const previousAttempts = (await client.query(
      `SELECT COUNT(*) FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id
       WHERE e.student_id = $1 AND co.course_id = $2 AND e.status = 'completed'`,
      [studentId, offering.course_id]
    )).rows[0].count;

    const attemptNumber = parseInt(previousAttempts) + 1;

    const hasPreviousPass = (await client.query(
      `SELECT 1 FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id
       WHERE e.student_id = $1 AND co.course_id = $2 AND e.status = 'completed'
       AND e.letter_grade NOT IN ('F','Abs')`,
      [studentId, offering.course_id]
    )).rows[0];

    const isImprovementRetake = !!hasPreviousPass;

    if (isImprovementRetake || attemptNumber > 1) {
      const retakeType = isImprovementRetake ? 'improvement' : 'failed';
      await client.query(
        `INSERT INTO course_retake_log (student_id, course_id, retake_type, attempt_count)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (student_id, course_id)
         DO UPDATE SET attempt_count = $4, updated_at = NOW()`,
        [studentId, offering.course_id, retakeType, attemptNumber]
      );
    }

    const enrollment = (await client.query(
      `INSERT INTO enrollments (student_id, offering_id, semester_id, status, attempt_number, is_improvement_retake)
       VALUES ($1, $2, $3, 'registered', $4, $5) RETURNING *`,
      [studentId, offeringId, offering.semester_id, attemptNumber, isImprovementRetake]
    )).rows[0];

    await client.query(
      'INSERT INTO attendance_summary (enrollment_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [enrollment.id]
    );

    // [B2-FIX] Notify student
    const studentUser = (await client.query(
      'SELECT u.id FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1',
      [studentId]
    )).rows[0];
    if (studentUser) {
      await notifService.onCourseRegistered(
        client, studentUser.id,
        offering.code, offering.name_en, offering.semester_label
      );
    }

    logger.info('Student registered for course', { studentId, courseCode: offering.code });
    recordEnrollment('register', 'success');
    return enrollment;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DROP COURSE (within add/drop window — no W grade)
// ─────────────────────────────────────────────────────────────────────────────
async function dropCourse(enrollmentId, studentId) {
  return withTransaction(async (client) => {
    const enrollment = (await client.query(
      `SELECT e.*, sem.add_drop_deadline, c.code, c.name_en
       FROM enrollments e
       JOIN semesters sem ON sem.id = e.semester_id
       JOIN course_offerings co ON co.id = e.offering_id
       JOIN courses c ON c.id = co.course_id
       WHERE e.id = $1 AND e.student_id = $2 AND e.status = 'registered'`,
      [enrollmentId, studentId]
    )).rows[0];

    if (!enrollment) throw new Error('Enrollment not found or not in registered status');
    if (new Date() > new Date(enrollment.add_drop_deadline)) {
      throw new Error('Add/drop deadline has passed. Use withdrawal instead.');
    }

    await client.query(
      'UPDATE enrollments SET status = $1, withdrawn_at = NOW(), updated_at = NOW() WHERE id = $2',
      ['dropped', enrollmentId]
    );

    // [B2-FIX] Notify student
    const studentUser = (await client.query(
      'SELECT u.id FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1',
      [studentId]
    )).rows[0];
    if (studentUser) {
      await notifService.onCourseDropped(client, studentUser.id, enrollment.code, enrollment.name_en);
    }

    logger.info('Student dropped course', { enrollmentId, studentId });
    recordEnrollment('drop', 'success');
    return { success: true };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// WITHDRAW COURSE (after add/drop window — W grade recorded)
// ─────────────────────────────────────────────────────────────────────────────
async function withdrawCourse(enrollmentId, studentId, reason = '') {
  return withTransaction(async (client) => {
    const check = await bylawService.canWithdrawCourse(enrollmentId, studentId);
    if (!check.allowed) throw new Error(check.reason);

    const courseInfo = (await client.query(
      `SELECT c.code, c.name_en FROM enrollments e
       JOIN course_offerings co ON co.id = e.offering_id
       JOIN courses c ON c.id = co.course_id
       WHERE e.id = $1`,
      [enrollmentId]
    )).rows[0];

    const enrollment = (await client.query(
      `UPDATE enrollments SET status = $1, withdrawn_at = NOW(), withdrawal_reason = $2,
       letter_grade = $3, grade_points = NULL, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      ['withdrawn', reason, 'W', enrollmentId]
    )).rows[0];

    // [B2-FIX] Notify student
    const studentUser = (await client.query(
      'SELECT u.id FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1',
      [studentId]
    )).rows[0];
    if (studentUser && courseInfo) {
      await notifService.onCourseWithdrawn(client, studentUser.id, courseInfo.code, courseInfo.name_en);
    }

    logger.info('Student withdrew from course', { enrollmentId, studentId });
    recordEnrollment('withdraw', 'success');
    return enrollment;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTER GRADES
// [B4-FIX] Works on both 'registered' and 'completed' status (re-entry before lock)
// [B2-FIX] Triggers student notification after grade entry
// ─────────────────────────────────────────────────────────────────────────────
async function enterGrades(enrollmentId, grades, enteredById) {
  return withTransaction(async (client) => {
    const { midterm_grade, coursework_grade, practical_grade, final_exam_grade } = grades;

    const errors = gpaService.validateGradeEntry({
      midterm: midterm_grade, coursework: coursework_grade,
      practical: practical_grade, final_exam: final_exam_grade
    });
    if (errors.length > 0) throw new Error(errors.join(', '));

    // [B4-FIX] Accept both registered and completed — allows grade updates before lock
    const existing = (await client.query(
      `SELECT e.*, c.code as course_code, c.name_en as course_name,
              sem.label as semester_label, sem.status as semester_status,
              u.id as student_user_id
       FROM enrollments e
       JOIN course_offerings co ON co.id = e.offering_id
       JOIN courses c ON c.id = co.course_id
       JOIN semesters sem ON sem.id = e.semester_id
       JOIN students s ON s.id = e.student_id
       JOIN users u ON u.id = s.user_id
       WHERE e.id = $1`,
      [enrollmentId]
    )).rows[0];

    if (!existing) throw new Error('Enrollment not found');
    if (existing.grade_locked) throw new Error('Grades are locked and cannot be modified');

    // [B4-FIX] Allow grade entry on 'registered' status (semester in grading/active)
    if (!['registered', 'completed'].includes(existing.status)) {
      throw new Error(`Cannot enter grades for enrollment in status: ${existing.status}`);
    }

    if (!['active', 'grading'].includes(existing.semester_status)) {
      throw new Error(`Grade entry is only allowed when semester is active or in grading period`);
    }

    const total = gpaService.calculateTotalGrade({
      midterm: midterm_grade, coursework: coursework_grade,
      practical: practical_grade, final_exam: final_exam_grade
    });

    let letter, points;
    if (parseFloat(final_exam_grade) < 30) {
      letter = 'F'; points = 0.0;
    } else {
      letter = gpaService.percentageToLetter(total);
      points = gpaService.percentageToPoints(total);
    }

    await client.query(
      `UPDATE enrollments SET
         midterm_grade = $1, coursework_grade = $2, practical_grade = $3,
         final_exam_grade = $4, total_grade = $5, letter_grade = $6,
         grade_points = $7, status = 'completed',
         grade_entered_by = $8, grade_entered_at = NOW(), updated_at = NOW()
       WHERE id = $9`,
      [midterm_grade, coursework_grade, practical_grade, final_exam_grade,
       total, letter, points, enteredById, enrollmentId]
    );

    // Handle retake grade logic
    const courseRef = (await client.query(
      'SELECT e.student_id, co.course_id FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id WHERE e.id = $1',
      [enrollmentId]
    )).rows[0];

    if (existing.attempt_number > 1 || existing.is_improvement_retake) {
      await client.query('SELECT process_retake_grade($1, $2)', [courseRef.student_id, courseRef.course_id]);
    } else {
      await client.query('SELECT recompute_student_cgpa($1)', [courseRef.student_id]);
    }

    // [B2-FIX] Notify student of grade posting
    if (existing.student_user_id) {
      await notifService.onGradeEntered(
        client, existing.student_user_id,
        existing.course_code, total, letter, existing.semester_label
      );
    }

    logger.info('Grades entered', { enrollmentId, total, letter, enteredById });
    recordGradeEntry('success');
    return { success: true, total_grade: total, letter_grade: letter, grade_points: points };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FINALIZE SEMESTER
// [B2-FIX] Notification triggers integrated
// ─────────────────────────────────────────────────────────────────────────────
async function finalizeSemester(semesterId, adminId) {
  return withTransaction(async (client) => {
    const semester = (await client.query('SELECT * FROM semesters WHERE id = $1', [semesterId])).rows[0];
    if (!semester) throw new Error('Semester not found');
    if (semester.status === 'closed') throw new Error('Semester already closed');

    const students = (await client.query(
      'SELECT DISTINCT student_id FROM enrollments WHERE semester_id = $1 AND status = $2',
      [semesterId, 'completed']
    )).rows;

    const results = [];

    for (const { student_id } of students) {
      const semEnrollments = (await client.query(
        `SELECT e.grade_points, e.is_counted_in_gpa, c.credits, c.is_credit_bearing
         FROM enrollments e
         JOIN course_offerings co ON co.id = e.offering_id
         JOIN courses c ON c.id = co.course_id
         WHERE e.student_id = $1 AND e.semester_id = $2 AND e.status = 'completed'`,
        [student_id, semesterId]
      )).rows;

      const semGPA = gpaService.calculateSemesterGPA(semEnrollments);
      const student = (await client.query('SELECT * FROM students WHERE id = $1', [student_id])).rows[0];

      await client.query(
        `INSERT INTO semester_gpa_records
           (student_id, semester_id, semester_gpa, cumulative_gpa, classification,
            credits_attempted, credits_passed, grade_points_earned)
         VALUES ($1, $2, $3, $4, $5,
           (SELECT COALESCE(SUM(c.credits),0) FROM enrollments e JOIN course_offerings co ON co.id=e.offering_id JOIN courses c ON c.id=co.course_id WHERE e.student_id=$1 AND e.semester_id=$2 AND e.status='completed'),
           (SELECT COALESCE(SUM(CASE WHEN e.letter_grade NOT IN ('F','Abs','W') THEN c.credits ELSE 0 END),0) FROM enrollments e JOIN course_offerings co ON co.id=e.offering_id JOIN courses c ON c.id=co.course_id WHERE e.student_id=$1 AND e.semester_id=$2 AND e.status='completed'),
           $6
         )
         ON CONFLICT (student_id, semester_id)
         DO UPDATE SET semester_gpa=$3, cumulative_gpa=$4, classification=$5, computed_at=NOW()`,
        [student_id, semesterId, semGPA, student.cgpa,
         gpaService.getCGPAClassification(student.cgpa),
         semEnrollments.reduce((s, e) => s + (e.credits * (e.grade_points || 0)), 0)]
      );

      await client.query(
        'UPDATE students SET semesters_enrolled = semesters_enrolled + 1 WHERE id = $1',
        [student_id]
      );

      const updatedStudent = (await client.query('SELECT * FROM students WHERE id = $1', [student_id])).rows[0];
      const needsWarning = bylawService.shouldReceiveWarning(updatedStudent);

      // Get student user_id for notifications
      const studentUser = (await client.query(
        'SELECT u.id as user_id FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1',
        [student_id]
      )).rows[0];

      if (needsWarning) {
        await client.query(
          `INSERT INTO academic_warnings (student_id, semester_id, warning_type, cgpa_at_warning, is_consecutive)
           VALUES ($1, $2, 'academic', $3, $4)
           ON CONFLICT (student_id, semester_id, warning_type) DO NOTHING`,
          [student_id, semesterId, updatedStudent.cgpa, updatedStudent.consecutive_warnings > 0]
        );
        await client.query(
          `UPDATE students SET
             consecutive_warnings = consecutive_warnings + 1,
             total_warnings = total_warnings + 1,
             academic_status = 'warning'
           WHERE id = $1`,
          [student_id]
        );

        // [B2-FIX] Warning notification
        if (studentUser) {
          const newConsecutive = updatedStudent.consecutive_warnings + 1;
          await notifService.onAcademicWarning(
            client, studentUser.user_id,
            updatedStudent.cgpa, semester.label, newConsecutive
          );
        }
      } else {
        await client.query(
          `UPDATE students SET consecutive_warnings = 0,
           academic_status = CASE WHEN academic_status = 'warning' THEN 'active' ELSE academic_status END
           WHERE id = $1`,
          [student_id]
        );
      }

      const finalStudent = (await client.query('SELECT * FROM students WHERE id = $1', [student_id])).rows[0];
      const dismissal = bylawService.checkDismissalConditions(finalStudent);

      if (dismissal.shouldDismiss) {
        await client.query(
          "UPDATE students SET academic_status = 'dismissed', updated_at = NOW() WHERE id = $1",
          [student_id]
        );
        // [B2-FIX] Dismissal notification
        if (studentUser) {
          await notifService.onDismissal(client, studentUser.user_id, dismissal.reasons);
        }
      }

      results.push({
        student_id, semGPA, cgpa: finalStudent.cgpa, dismissed: dismissal.shouldDismiss
      });
    }

    await client.query("UPDATE semesters SET status = 'closed' WHERE id = $1", [semesterId]);

    // [B2-FIX] Broadcast semester-closed notification (non-blocking)
    notifService.onSemesterClosed(semester.label);

    logger.info('Semester finalized', { semesterId, studentsProcessed: students.length });
    return { processed: students.length, results };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET STUDENT SCHEDULE
// ─────────────────────────────────────────────────────────────────────────────
async function getStudentSchedule(studentId, semesterId) {
  const res = await query(
    `SELECT e.id as enrollment_id, e.status, e.attempt_number,
            e.total_grade, e.letter_grade, e.grade_points,
            c.code, c.name_ar, c.name_en, c.credits, c.category,
            co.section, co.schedule, co.room, co.capacity, co.enrolled_count,
            u.full_name_en as doctor_name,
            a.attendance_pct,
            CASE WHEN a.attendance_pct < 42 AND a.total_sessions > 0 THEN TRUE ELSE FALSE END as below_attendance_minimum
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
