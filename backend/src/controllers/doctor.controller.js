// =============================================================================
// Doctor Controller
// [B4-FIX] Pending grade query now correctly identifies truly ungraded students
// [B6-FIX] Roster includes below_minimum attendance flag
// [B8-FIX] Rich dashboard analytics: grade distribution, pass rates per offering
// [B2-FIX] Grade entry triggers notifications via registration service
// =============================================================================
const { query, withTransaction } = require('../config/database');
const registrationService = require('../services/registration.service');
const gpaService = require('../services/gpa.service');

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const doctor = (await query(
      `SELECT d.*, dep.name_en as department_name, u.full_name_en, u.email
       FROM doctors d
       LEFT JOIN departments dep ON dep.id = d.department_id
       JOIN users u ON u.id = d.user_id
       WHERE d.user_id = $1`,
      [req.user.id]
    )).rows[0];
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const courses = (await query(
      `SELECT * FROM v_doctor_courses WHERE doctor_id = $1 ORDER BY semester_status DESC, course_code`,
      [doctor.id]
    )).rows;

    // [B4-FIX] Count students who need grading: enrolled in active/grading semesters, grade not yet locked
    const pendingGrades = (await query(
      `SELECT COUNT(*) FROM enrollments e
       JOIN course_offerings co ON co.id = e.offering_id
       JOIN semesters sem ON sem.id = co.semester_id
       WHERE co.doctor_id = $1
         AND sem.status IN ('active', 'grading')
         AND e.grade_locked = FALSE
         AND (e.total_grade IS NULL OR e.grade_entered_at IS NULL)
         AND e.status IN ('registered', 'completed')`,
      [doctor.id]
    )).rows[0];

    // [B8-FIX] Per-offering analytics for current/recent courses
    const offeringIds = courses.map(c => c.offering_id);
    let offeringAnalytics = [];

    if (offeringIds.length > 0) {
      offeringAnalytics = (await query(
        `SELECT
           co.id as offering_id,
           COUNT(e.id) as total_enrolled,
           COUNT(e.id) FILTER (WHERE e.total_grade IS NOT NULL) as graded_count,
           COUNT(e.id) FILTER (WHERE e.letter_grade NOT IN ('F','Abs') AND e.status = 'completed') as passed_count,
           COUNT(e.id) FILTER (WHERE e.letter_grade IN ('F','Abs') AND e.status = 'completed') as failed_count,
           ROUND(AVG(e.total_grade) FILTER (WHERE e.total_grade IS NOT NULL), 1) as avg_grade,
           COUNT(e.id) FILTER (WHERE asm.attendance_pct < 42 AND asm.total_sessions > 0) as attendance_flagged,
           -- Grade distribution buckets
           COUNT(e.id) FILTER (WHERE e.total_grade >= 88) as excellent_count,
           COUNT(e.id) FILTER (WHERE e.total_grade >= 76 AND e.total_grade < 88) as good_count,
           COUNT(e.id) FILTER (WHERE e.total_grade >= 60 AND e.total_grade < 76) as satisfactory_count,
           COUNT(e.id) FILTER (WHERE e.total_grade < 60 AND e.total_grade IS NOT NULL) as below_count
         FROM course_offerings co
         LEFT JOIN enrollments e ON e.offering_id = co.id AND e.status IN ('registered','completed')
         LEFT JOIN attendance_summary asm ON asm.enrollment_id = e.id
         WHERE co.id = ANY($1::int[])
         GROUP BY co.id`,
        [offeringIds]
      )).rows;
    }

    // Merge analytics into courses
    const analyticsMap = {};
    offeringAnalytics.forEach(a => { analyticsMap[a.offering_id] = a; });
    const enrichedCourses = courses.map(c => ({
      ...c,
      analytics: analyticsMap[c.offering_id] || null
    }));

    // [B8-FIX] Recent notifications for this doctor
    const recentNotifications = (await query(
      'SELECT * FROM notifications WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC LIMIT 5',
      [req.user.id]
    )).rows;

    return res.json({
      success: true,
      data: {
        doctor,
        courses: enrichedCourses,
        pendingGradeCount: parseInt(pendingGrades.count),
        recentNotifications,
      }
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET COURSE ROSTER
// [B6-FIX] below_minimum attendance flag now included in roster response
// ─────────────────────────────────────────────────────────────────────────────
const getCourseRoster = async (req, res, next) => {
  try {
    const { offeringId } = req.params;

    const offering = (await query(
      `SELECT co.*, c.name_en, c.name_ar, c.code, c.credits,
              sem.label as semester_label, sem.status as semester_status,
              sem.grade_entry_deadline
       FROM course_offerings co
       JOIN courses c ON c.id = co.course_id
       JOIN semesters sem ON sem.id = co.semester_id
       WHERE co.id = $1`,
      [offeringId]
    )).rows[0];
    if (!offering) return res.status(404).json({ success: false, message: 'Offering not found' });

    const doctor = (await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id])).rows[0];
    if (doctor && offering.doctor_id && offering.doctor_id !== doctor.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not your course' });
    }

    // [B6-FIX] Include below_minimum in roster so grade entry view can flag students
    const roster = (await query(
      `SELECT
         e.id as enrollment_id, e.status, e.attempt_number, e.is_improvement_retake,
         e.midterm_grade, e.coursework_grade, e.practical_grade, e.final_exam_grade,
         e.total_grade, e.letter_grade, e.grade_points, e.grade_locked,
         e.grade_entered_at,
         s.student_code, s.cgpa as student_cgpa,
         u.full_name_ar, u.full_name_en, u.email,
         COALESCE(a.attendance_pct, 0) as attendance_pct,
         COALESCE(a.attended_sessions, 0) as attended_sessions,
         COALESCE(a.total_sessions, 0) as total_sessions,
         COALESCE(a.excused_absences, 0) as excused_absences,
         CASE WHEN COALESCE(a.attendance_pct, 0) < 42 AND COALESCE(a.total_sessions, 0) > 0
              THEN TRUE ELSE FALSE END as below_minimum
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       JOIN users u ON u.id = s.user_id
       LEFT JOIN attendance_summary a ON a.enrollment_id = e.id
       WHERE e.offering_id = $1
       ORDER BY u.full_name_en`,
      [offeringId]
    )).rows;

    // [B8-FIX] Grade distribution summary for the offering
    const gradeDist = (await query(
      `SELECT
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE total_grade IS NOT NULL) as graded,
         COUNT(*) FILTER (WHERE letter_grade NOT IN ('F','Abs') AND status='completed') as passed,
         COUNT(*) FILTER (WHERE letter_grade IN ('F','Abs') AND status='completed') as failed,
         ROUND(AVG(total_grade) FILTER (WHERE total_grade IS NOT NULL), 2) as avg_grade,
         ROUND(MIN(total_grade) FILTER (WHERE total_grade IS NOT NULL), 2) as min_grade,
         ROUND(MAX(total_grade) FILTER (WHERE total_grade IS NOT NULL), 2) as max_grade
       FROM enrollments
       WHERE offering_id = $1 AND status IN ('registered','completed')`,
      [offeringId]
    )).rows[0];

    return res.json({
      success: true,
      data: {
        offering,
        roster,
        totalStudents: roster.length,
        gradeSummary: gradeDist,
        canEnterGrades: ['active', 'grading'].includes(offering.semester_status),
      }
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// ENTER GRADES (single student)
// ─────────────────────────────────────────────────────────────────────────────
const enterGrades = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;
    const grades = req.body;

    const enrollment = (await query(
      'SELECT e.*, co.doctor_id FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id WHERE e.id = $1',
      [enrollmentId]
    )).rows[0];
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    const doctor = (await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id])).rows[0];
    if (doctor && enrollment.doctor_id && enrollment.doctor_id !== doctor.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this course' });
    }

    const result = await registrationService.enterGrades(enrollmentId, grades, req.user.id);
    return res.json({ success: true, data: result });
  } catch (err) {
    if (err.message) return res.status(400).json({ success: false, message: err.message });
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// BULK GRADE ENTRY
// ─────────────────────────────────────────────────────────────────────────────
const bulkEnterGrades = async (req, res, next) => {
  try {
    const { grades } = req.body;
    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ success: false, message: 'grades array required' });
    }

    const results = [];
    const errors = [];

    for (const g of grades) {
      try {
        const result = await registrationService.enterGrades(g.enrollmentId, g, req.user.id);
        results.push({ enrollmentId: g.enrollmentId, ...result });
      } catch (err) {
        errors.push({ enrollmentId: g.enrollmentId, error: err.message });
      }
    }

    return res.json({
      success: true,
      data: { processed: results.length, errors: errors.length, results, errors }
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE RECORDING
// ─────────────────────────────────────────────────────────────────────────────
const recordAttendance = async (req, res, next) => {
  try {
    const { offeringId } = req.params;
    const { sessionDate, sessionType = 'lecture', attendanceData } = req.body;

    if (!Array.isArray(attendanceData) || !sessionDate) {
      return res.status(400).json({ success: false, message: 'sessionDate and attendanceData[] required' });
    }

    return await withTransaction(async (client) => {
      const session = (await client.query(
        'INSERT INTO attendance_sessions (offering_id, session_date, session_type, total_students, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [offeringId, sessionDate, sessionType, attendanceData.length, req.user.id]
      )).rows[0];

      for (const att of attendanceData) {
        await client.query(
          `INSERT INTO attendance_records (session_id, enrollment_id, is_present, is_excused, notes)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (session_id, enrollment_id)
           DO UPDATE SET is_present = $3, is_excused = $4`,
          [session.id, att.enrollmentId, att.isPresent, att.isExcused || false, att.notes || null]
        );
        await client.query('SELECT refresh_attendance_summary($1)', [att.enrollmentId]);
      }

      return res.json({ success: true, message: 'Attendance recorded', data: { sessionId: session.id } });
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE REPORT
// ─────────────────────────────────────────────────────────────────────────────
const getAttendanceReport = async (req, res, next) => {
  try {
    const { offeringId } = req.params;

    const report = (await query(
      `SELECT s.student_code, u.full_name_en, u.full_name_ar,
              COALESCE(a.total_sessions, 0) as total_sessions,
              COALESCE(a.attended_sessions, 0) as attended_sessions,
              COALESCE(a.excused_absences, 0) as excused_absences,
              COALESCE(a.attendance_pct, 0) as attendance_pct,
              CASE WHEN COALESCE(a.attendance_pct, 0) < 42 AND COALESCE(a.total_sessions, 0) > 0 THEN TRUE ELSE FALSE END as below_minimum,
              CASE WHEN (100 - COALESCE(a.attendance_pct, 0)) > 25 THEN TRUE ELSE FALSE END as excessive_absence
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       JOIN users u ON u.id = s.user_id
       LEFT JOIN attendance_summary a ON a.enrollment_id = e.id
       WHERE e.offering_id = $1 AND e.status IN ('registered','completed')
       ORDER BY u.full_name_en`,
      [offeringId]
    )).rows;

    const sessions = (await query(
      `SELECT id, session_date, session_type, total_students
       FROM attendance_sessions WHERE offering_id = $1 ORDER BY session_date DESC`,
      [offeringId]
    )).rows;

    return res.json({ success: true, data: { roster: report, sessions } });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// MY COURSES
// ─────────────────────────────────────────────────────────────────────────────
const getMyCourses = async (req, res, next) => {
  try {
    const doctor = (await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id])).rows[0];
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const courses = (await query(
      'SELECT * FROM v_doctor_courses WHERE doctor_id = $1 ORDER BY semester_status DESC, course_code',
      [doctor.id]
    )).rows;

    return res.json({ success: true, data: courses });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOCK GRADES (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const lockGrades = async (req, res, next) => {
  try {
    const { offeringId } = req.params;
    const result = await query(
      "UPDATE enrollments SET grade_locked = TRUE WHERE offering_id = $1 AND status = 'completed' RETURNING id",
      [offeringId]
    );
    return res.json({ success: true, message: `Locked ${result.rowCount} grade records` });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS for doctor (re-uses the shared path, separate route)
// ─────────────────────────────────────────────────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const notifs = (await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    )).rows;
    return res.json({ success: true, data: notifs });
  } catch (err) { next(err); }
};

const markNotificationRead = async (req, res, next) => {
  try {
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [req.params.notifId, req.user.id]
    );
    return res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = {
  getDashboard, getCourseRoster, enterGrades, bulkEnterGrades,
  recordAttendance, getAttendanceReport, getMyCourses, lockGrades,
  getNotifications, markNotificationRead,
};
