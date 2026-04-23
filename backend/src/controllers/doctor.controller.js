const { query, withTransaction } = require('../config/database');
const registrationService = require('../services/registration.service');
const gpaService = require('../services/gpa.service');

// ── Doctor Dashboard ─────────────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const doctor = (await query(
      `SELECT d.*, dep.name_en as department_name FROM doctors d
       LEFT JOIN departments dep ON dep.id = d.department_id WHERE d.user_id = $1`,
      [req.user.id]
    )).rows[0];
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const courses = await query(
      'SELECT * FROM v_doctor_courses WHERE doctor_id = $1 ORDER BY semester_status DESC, course_code',
      [doctor.id]
    );

    const pendingGrades = await query(
      `SELECT COUNT(*) FROM enrollments e
       JOIN course_offerings co ON co.id = e.offering_id
       WHERE co.doctor_id = $1 AND e.status = 'registered' AND e.total_grade IS NULL`,
      [doctor.id]
    );

    return res.json({
      success: true,
      data: {
        doctor,
        courses: courses.rows,
        pendingGradeCount: parseInt(pendingGrades.rows[0].count),
      }
    });
  } catch (err) { next(err); }
};

// ── Get course roster ─────────────────────────────────────────────────────────
const getCourseRoster = async (req, res, next) => {
  try {
    const { offeringId } = req.params;

    // Verify doctor owns this offering
    const offering = (await query(
      `SELECT co.*, c.name_en, c.code, c.credits, sem.label as semester_label
       FROM course_offerings co JOIN courses c ON c.id = co.course_id JOIN semesters sem ON sem.id = co.semester_id
       WHERE co.id = $1`,
      [offeringId]
    )).rows[0];
    if (!offering) return res.status(404).json({ success: false, message: 'Offering not found' });

    const doctor = (await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id])).rows[0];
    if (doctor && offering.doctor_id && offering.doctor_id !== doctor.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not your course' });
    }

    const roster = await query(
      `SELECT e.id as enrollment_id, e.status, e.attempt_number, e.is_improvement_retake,
              e.midterm_grade, e.coursework_grade, e.practical_grade, e.final_exam_grade,
              e.total_grade, e.letter_grade, e.grade_points, e.grade_locked,
              s.student_code, s.cgpa as student_cgpa,
              u.full_name_ar, u.full_name_en, u.email,
              a.attendance_pct, a.attended_sessions, a.total_sessions
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       JOIN users u ON u.id = s.user_id
       LEFT JOIN attendance_summary a ON a.enrollment_id = e.id
       WHERE e.offering_id = $1
       ORDER BY u.full_name_en`,
      [offeringId]
    );

    return res.json({
      success: true,
      data: {
        offering,
        roster: roster.rows,
        totalStudents: roster.rows.length,
      }
    });
  } catch (err) { next(err); }
};

// ── Enter grades (single student) ────────────────────────────────────────────
const enterGrades = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;
    const grades = req.body;

    // Verify doctor teaches this course
    const enrollment = (await query(
      `SELECT e.*, co.doctor_id FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id WHERE e.id = $1`,
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

// ── Bulk grade entry ──────────────────────────────────────────────────────────
const bulkEnterGrades = async (req, res, next) => {
  try {
    const { grades } = req.body; // [{enrollmentId, midterm_grade, coursework_grade, practical_grade, final_exam_grade}]
    if (!Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ success: false, message: 'Grades array required' });
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

// ── Attendance management ─────────────────────────────────────────────────────
const recordAttendance = async (req, res, next) => {
  try {
    const { offeringId } = req.params;
    const { sessionDate, sessionType = 'lecture', attendanceData } = req.body;
    // attendanceData: [{enrollmentId, isPresent, isExcused}]

    return await withTransaction(async (client) => {
      const session = (await client.query(
        'INSERT INTO attendance_sessions (offering_id, session_date, session_type, total_students, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [offeringId, sessionDate, sessionType, attendanceData.length, req.user.id]
      )).rows[0];

      for (const att of attendanceData) {
        await client.query(
          'INSERT INTO attendance_records (session_id, enrollment_id, is_present, is_excused, notes) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (session_id, enrollment_id) DO UPDATE SET is_present = $3, is_excused = $4',
          [session.id, att.enrollmentId, att.isPresent, att.isExcused || false, att.notes || null]
        );
        // Refresh attendance summary
        await client.query('SELECT refresh_attendance_summary($1)', [att.enrollmentId]);
      }

      return res.json({ success: true, message: 'Attendance recorded', data: { sessionId: session.id } });
    });
  } catch (err) { next(err); }
};

// ── Get attendance report for an offering ────────────────────────────────────
const getAttendanceReport = async (req, res, next) => {
  try {
    const { offeringId } = req.params;

    const report = await query(
      `SELECT s.student_code, u.full_name_en, u.full_name_ar,
              a.total_sessions, a.attended_sessions, a.excused_absences, a.attendance_pct,
              CASE WHEN a.attendance_pct < 42 THEN TRUE ELSE FALSE END as below_minimum,
              CASE WHEN (100 - a.attendance_pct) > 25 THEN TRUE ELSE FALSE END as excessive_absence
       FROM enrollments e
       JOIN students s ON s.id = e.student_id
       JOIN users u ON u.id = s.user_id
       LEFT JOIN attendance_summary a ON a.enrollment_id = e.id
       WHERE e.offering_id = $1 AND e.status IN ('registered','completed')
       ORDER BY u.full_name_en`,
      [offeringId]
    );

    return res.json({ success: true, data: report.rows });
  } catch (err) { next(err); }
};

// ── Get my courses ────────────────────────────────────────────────────────────
const getMyCourses = async (req, res, next) => {
  try {
    const doctor = (await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id])).rows[0];
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const courses = await query(
      'SELECT * FROM v_doctor_courses WHERE doctor_id = $1 ORDER BY semester_status DESC, course_code',
      [doctor.id]
    );

    return res.json({ success: true, data: courses.rows });
  } catch (err) { next(err); }
};

// ── Lock grades for an offering ───────────────────────────────────────────────
const lockGrades = async (req, res, next) => {
  try {
    const { offeringId } = req.params;
    await query(
      "UPDATE enrollments SET grade_locked = TRUE WHERE offering_id = $1 AND status = 'completed'",
      [offeringId]
    );
    return res.json({ success: true, message: 'Grades locked successfully' });
  } catch (err) { next(err); }
};

module.exports = {
  getDashboard, getCourseRoster, enterGrades, bulkEnterGrades,
  recordAttendance, getAttendanceReport, getMyCourses, lockGrades
};
