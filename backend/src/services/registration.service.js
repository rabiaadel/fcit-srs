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
    // BUG-010 FIX: SELECT FOR UPDATE locks the offering row to prevent concurrent over-enrollment.
    // Two simultaneous requests will serialize here — second sees updated enrolled_count.
    const offering = (await client.query(
      `SELECT co.*, c.id as course_id, c.credits, c.name_en, c.code,
              sem.label as semester_label
       FROM course_offerings co
       JOIN courses c ON c.id = co.course_id
       JOIN semesters sem ON sem.id = co.semester_id
       WHERE co.id = $1
       FOR UPDATE OF co`,
      [offeringId]
    )).rows[0];
    if (!offering) throw new Error('Course offering not found');

    // Capacity check AFTER lock (prevents race condition — TC-209)
    if (offering.enrolled_count >= offering.capacity) {
      throw Object.assign(new Error(`هذه الشعبة ممتلئة (${offering.enrolled_count}/${offering.capacity}). يرجى اختيار شعبة أخرى.`), { statusCode: 409 });
    }

    // Bylaw validation
    const check = await bylawService.canStudentRegisterCourse(studentId, offering.course_id, offering.semester_id, offering.id);
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
    // Art. 23 vs Art. 24 distinction:
    // - 'improvement' retake = student previously PASSED but wants a better grade (Art. 24, capped at 3)
    // - 'avoidance' retake   = student previously FAILED and is at risk of dismissal (Art. 23, uncapped)
    // - 'failed' retake      = student previously FAILED, no dismissal risk
    const studentForRetake = isImprovementRetake ? null :
      (await client.query('SELECT cgpa FROM students WHERE id = $1', [studentId])).rows[0];
    const isAvoidanceRetake = !isImprovementRetake && studentForRetake && parseFloat(studentForRetake.cgpa) < 2.0;

    const previousEnrollments = (await client.query(
      `SELECT e.id FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id
       WHERE e.student_id = $1 AND co.course_id = $2 AND e.status = 'completed'
       ORDER BY e.created_at DESC LIMIT 1`,
      [studentId, offering.course_id]
    )).rows;
    
    const originalEnrollmentId = previousEnrollments.length > 0 ? previousEnrollments[0].id : null;

    if (isImprovementRetake || attemptNumber > 1) {
      // Art. 23: avoidance retake (CGPA < 2.0, failed course) is uncapped; Art. 24: improvement is capped at 3
      const retakeType = isImprovementRetake ? 'improvement' : (isAvoidanceRetake ? 'avoidance' : 'failed');
      await client.query(
        `INSERT INTO course_retake_log (student_id, course_id, retake_type, attempt_count, original_enrollment_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (student_id, course_id, retake_type, original_enrollment_id)
         DO UPDATE SET attempt_count = $4, updated_at = NOW()`,
        [studentId, offering.course_id, retakeType, attemptNumber, originalEnrollmentId]
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

    // Decrement enrolled_count so the seat becomes available for other students
    await client.query(
      'UPDATE course_offerings SET enrolled_count = GREATEST(0, enrolled_count - 1) WHERE id = $1',
      [enrollment.offering_id]
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
    // [FIX-GRADES-1] Normalize: empty strings → null, otherwise parse to float.
    // Empty strings ('') cannot be stored in numeric columns and cause a 400 DB error.
    const toNum = (v) => (v === '' || v === null || v === undefined) ? null : parseFloat(v);
    const midterm_grade    = toNum(grades.midterm_grade);
    const coursework_grade = toNum(grades.coursework_grade);
    const practical_grade  = toNum(grades.practical_grade);
    const final_exam_grade = toNum(grades.final_exam_grade);

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

    // [FIX-GRADE-NULL] If total is null it means ALL four components were null —
    // the doctor sent an empty save (e.g. bulk-save for a not-yet-graded student).
    // Do NOT write anything to the DB in this case; the row stays ungraded.
    if (total === null) {
      logger.info('enterGrades: all components null — skipping write for ungraded student', { enrollmentId });
      return { success: true, total_grade: null, letter_grade: null, grade_points: null };
    }

    let letter, points;
    // [FIX-GRADES-2] final_exam_grade is null when not yet entered; only auto-fail
    // when a value is actually provided AND it is below 30 (i.e. < 50% of 60).
    if (final_exam_grade !== null && final_exam_grade < 30) {
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
      const pRetakeType = existing.is_improvement_retake ? 'improvement' : 'failed';
      await client.query('SELECT process_retake_grade($1, $2, $3)', [courseRef.student_id, courseRef.course_id, pRetakeType]);
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

    // ── Art. 14 — Attendance barring must run BEFORE grade processing ──
    // Students with < 75% attendance AND at least 1 recorded session get Abs grade
    const MIN_ATTEND = require('../config/constants').MIN_ATTENDANCE_PCT || 75;
    const barredEnrollments = (await client.query(
      `SELECT e.id AS enrollment_id, e.student_id, e.offering_id,
              a.attendance_pct, u.id AS student_user_id
       FROM enrollments e
       JOIN course_offerings co ON co.id = e.offering_id
       LEFT JOIN attendance_summary a ON a.enrollment_id = e.id
       JOIN students s ON s.id = e.student_id
       JOIN users u ON u.id = s.user_id
       WHERE co.semester_id = $1
         AND e.status = 'registered'
         AND a.total_sessions > 0
         AND a.attendance_pct < $2`,
      [semesterId, MIN_ATTEND]
    )).rows;

    let absCount = 0;
    for (const barred of barredEnrollments) {
      // Assign Abs grade — counts as fail for GPA (grade_points = 0), not counted in credits passed
      await client.query(
        `UPDATE enrollments SET
           letter_grade = 'Abs', grade_points = 0.0, total_grade = 0,
           is_counted_in_gpa = TRUE, status = 'completed',
           grade_entered_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [barred.enrollment_id]
      );
      // Recompute CGPA with Abs grade
      await client.query('SELECT recompute_student_cgpa($1)', [barred.student_id]);
      // Notify student (Art. 14)
      if (barred.student_user_id) {
        try {
          await client.query(
            `INSERT INTO notifications (user_id, title, message, type, created_at)
             VALUES ($1, 'تحذير: حرمان من الامتحان', $2, 'warning', NOW())`,
            [barred.student_user_id,
             `تم حرمانك من الامتحان النهائي بسبب الغياب الزائد (نسبة حضورك: ${barred.attendance_pct?.toFixed(1)}%). سيتم تسجيل درجة غياب (Abs) في سجلك الأكاديمي.`]
          );
        } catch (err) {
          if (err.code === '42703') {
            await client.query(
              `INSERT INTO notifications (user_id, title, message, created_at)
               VALUES ($1, 'تحذير: حرمان من الامتحان', $2, NOW())`,
              [barred.student_user_id,
               `تم حرمانك من الامتحان النهائي بسبب الغياب الزائد (نسبة حضورك: ${barred.attendance_pct?.toFixed(1)}%). سيتم تسجيل درجة غياب (Abs) في سجلك الأكاديمي.`]
            );
          } else {
            throw err;
          }
        }
      }
      absCount++;
    }

    // ── Art. 14 — Incomplete (I) grade for excused absence from final exam ──
    // Students who: (1) have a valid excuse approved, (2) attended ≥75%, AND (3) scored
    // ≥60% of non-final coursework should receive grade I instead of Abs or 0.
    const incompleteEnrollments = (await client.query(
      `SELECT e.id AS enrollment_id, e.student_id,
              e.midterm_grade, e.coursework_grade, e.practical_grade
       FROM enrollments e
       JOIN course_offerings co ON co.id = e.offering_id
       LEFT JOIN attendance_summary a ON a.enrollment_id = e.id
       WHERE co.semester_id = $1
         AND e.status = 'registered'
         AND e.final_exam_grade IS NULL
         AND e.excuse_approved = TRUE
         AND (a.attendance_pct IS NULL OR a.attendance_pct >= $2)
         AND (
           COALESCE(e.midterm_grade, 0) + COALESCE(e.coursework_grade, 0) + COALESCE(e.practical_grade, 0)
         ) >= 24`,   // 60% of 40 non-final marks
      [semesterId, MIN_ATTEND]
    )).rows;

    for (const inc of incompleteEnrollments) {
      await client.query(
        `UPDATE enrollments SET
           letter_grade = 'I', grade_points = NULL, is_counted_in_gpa = FALSE,
           status = 'completed', grade_entered_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [inc.enrollment_id]
      );
    }

    // Also process students who are still 'registered' but have no attendance recorded
    // (sessions = 0 or NULL) — mark as completed with null grades (not penalized for missing attendance data)
    await client.query(
      `UPDATE enrollments SET status = 'completed', updated_at = NOW()
       WHERE offering_id IN (SELECT id FROM course_offerings WHERE semester_id = $1)
         AND status = 'registered'
         AND id NOT IN (SELECT enrollment_id FROM attendance_summary WHERE total_sessions > 0 AND attendance_pct < $2)`,
      [semesterId, MIN_ATTEND]
    );

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

      // WARNING: process_semester_warnings() SQL function must NEVER be called for the same
      // semester — it duplicates this logic and will double-count warnings.
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

    logger.info('Semester finalized', { semesterId, studentsProcessed: students.length, absCount });
    return {
      processed: students.length,
      studentsProcessed: students.length,
      warningsIssued: results.filter(r => !r.dismissed).length,
      dismissals: results.filter(r => r.dismissed).length,
      absGradesAssigned: absCount,
      results,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET STUDENT SCHEDULE
// ─────────────────────────────────────────────────────────────────────────────
async function getStudentSchedule(studentId, semesterId) {
  const enrollments = (await query(
    `SELECT e.id as enrollment_id, e.status, e.attempt_number,
            e.total_grade, e.letter_grade, e.grade_points,
            c.code, c.name_ar, c.name_en, c.credits, c.category,
            co.id as offering_id, co.room, co.capacity, co.enrolled_count,
            u.full_name_en as doctor_name, u.full_name_ar as doctor_name_ar,
            a.attendance_pct,
            (SELECT json_agg(json_build_object(
              'id', dss.id, 'day', dss.day_of_week,
              'start', dss.start_time::text, 'end', dss.end_time::text,
              'room', dss.room, 'type', dss.session_type
            ) ORDER BY dss.day_of_week, dss.start_time)
             FROM doctor_schedule_slots dss WHERE dss.offering_id = co.id) as schedule_slots,
            CASE WHEN a.attendance_pct < 75 AND a.total_sessions > 0 THEN TRUE ELSE FALSE END as below_attendance_minimum
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
  )).rows;

  const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  const weeklyGrid = {};
  for (const day of DAYS) weeklyGrid[day] = [];

  for (const enrollment of enrollments) {
    if (enrollment.schedule_slots) {
      for (const slot of enrollment.schedule_slots) {
        if (weeklyGrid[slot.day]) {
          weeklyGrid[slot.day].push({
            ...slot,
            courseCode: enrollment.code,
            courseName: enrollment.name_en,
            courseNameAr: enrollment.name_ar,
            offeringId: enrollment.offering_id,
            doctorName: enrollment.doctor_name,
            doctorNameAr: enrollment.doctor_name_ar,
          });
        }
      }
    }
  }

  return { enrollments, weeklyGrid };
}

module.exports = {
  registerCourse,
  withdrawCourse,
  dropCourse,
  enterGrades,
  finalizeSemester,
  getStudentSchedule,
};
