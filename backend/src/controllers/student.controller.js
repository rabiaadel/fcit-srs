const { query } = require('../config/database');
const registrationService = require('../services/registration.service');
const bylawService = require('../services/bylaw.service');
const gpaService = require('../services/gpa.service');

// ── Get student profile ──────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT s.*, u.email, u.full_name_ar, u.full_name_en, u.phone, u.national_id,
              dep.name_en as department_name,
              adv.full_name_en as advisor_name
       FROM students s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN departments dep ON dep.code::text = s.specialization::text
       LEFT JOIN users adv ON adv.id = s.advisor_id
       WHERE s.user_id = $1`,
      [userId]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Student not found' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// ── Dashboard summary ────────────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = (await query('SELECT * FROM students WHERE user_id = $1', [userId])).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const currentSem = (await query(
      "SELECT * FROM semesters WHERE status IN ('registration','active','grading') ORDER BY start_date DESC LIMIT 1"
    )).rows[0];

    const schedule = currentSem
      ? await registrationService.getStudentSchedule(student.id, currentSem.id)
      : [];

    const recentGPA = (await query(
      `SELECT sg.semester_gpa, sg.cumulative_gpa, sg.classification, sem.label
       FROM semester_gpa_records sg JOIN semesters sem ON sem.id = sg.semester_id
       WHERE sg.student_id = $1 ORDER BY sem.start_date DESC LIMIT 4`,
      [student.id]
    )).rows;

    const notifications = (await query(
      'SELECT * FROM notifications WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC LIMIT 5',
      [userId]
    )).rows;

    const warnings = (await query(
      `SELECT aw.*, sem.label as semester_label FROM academic_warnings aw
       JOIN semesters sem ON sem.id = aw.semester_id
       WHERE aw.student_id = $1 ORDER BY aw.issued_at DESC LIMIT 3`,
      [student.id]
    )).rows;

    const eligibility = await bylawService.checkGraduationEligibility(student.id);

    return res.json({
      success: true,
      data: {
        student,
        currentSemester: currentSem,
        schedule,
        recentGPA,
        notifications,
        warnings,
        graduationEligibility: eligibility,
      }
    });
  } catch (err) { next(err); }
};

// ── Get available courses for registration ───────────────────────────────────
const getAvailableCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { semesterId } = req.params;

    const student = (await query('SELECT * FROM students WHERE user_id = $1', [userId])).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Get all offerings for the semester
    const offerings = await query(
      `SELECT co.id as offering_id, co.section, co.capacity, co.enrolled_count, co.schedule, co.room,
              c.id as course_id, c.code, c.name_ar, c.name_en, c.credits, c.category, c.level, c.is_mandatory,
              u.full_name_en as doctor_name,
              dep.code as department_code,
              -- check if already registered
              CASE WHEN e.id IS NOT NULL THEN TRUE ELSE FALSE END as already_registered,
              e.id as enrollment_id,
              e.status as enrollment_status
       FROM course_offerings co
       JOIN courses c ON c.id = co.course_id
       LEFT JOIN doctors d ON d.id = co.doctor_id
       LEFT JOIN users u ON u.id = d.user_id
       LEFT JOIN departments dep ON dep.id = c.department_id
       LEFT JOIN enrollments e ON e.offering_id = co.id AND e.student_id = $1
         AND e.status IN ('registered','completed')
       WHERE co.semester_id = $2 AND co.is_active = TRUE AND c.is_active = TRUE
       ORDER BY c.level, c.code`,
      [student.id, semesterId]
    );

    // For each offering, check if student meets prerequisites
    const enriched = await Promise.all(offerings.rows.map(async (o) => {
      if (!o.already_registered) {
        const check = await bylawService.canStudentRegisterCourse(student.id, o.course_id, semesterId);
        return { ...o, can_register: check.allowed, register_block_reason: check.reason };
      }
      return { ...o, can_register: false, register_block_reason: 'Already registered' };
    }));

    return res.json({ success: true, data: enriched });
  } catch (err) { next(err); }
};

// ── Register for a course ────────────────────────────────────────────────────
const registerCourse = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { offeringId } = req.body;

    const student = (await query('SELECT id FROM students WHERE user_id = $1', [userId])).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const enrollment = await registrationService.registerCourse(student.id, offeringId);
    return res.status(201).json({ success: true, message: 'Registered successfully', data: enrollment });
  } catch (err) {
    if (err.message) return res.status(400).json({ success: false, message: err.message });
    next(err);
  }
};

// ── Drop a course (within add/drop period) ───────────────────────────────────
const dropCourse = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { enrollmentId } = req.params;

    const student = (await query('SELECT id FROM students WHERE user_id = $1', [userId])).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await registrationService.dropCourse(enrollmentId, student.id);
    return res.json({ success: true, message: 'Course dropped successfully' });
  } catch (err) {
    if (err.message) return res.status(400).json({ success: false, message: err.message });
    next(err);
  }
};

// ── Withdraw from a course ───────────────────────────────────────────────────
const withdrawCourse = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { enrollmentId } = req.params;
    const { reason } = req.body;

    const student = (await query('SELECT id FROM students WHERE user_id = $1', [userId])).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const result = await registrationService.withdrawCourse(enrollmentId, student.id, reason);
    return res.json({ success: true, message: 'Withdrawn with W grade recorded', data: result });
  } catch (err) {
    if (err.message) return res.status(400).json({ success: false, message: err.message });
    next(err);
  }
};

// ── Get transcript ────────────────────────────────────────────────────────────
const getTranscript = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const studentFull = (await query(
      `SELECT s.*, u.full_name_ar, u.full_name_en FROM students s
       JOIN users u ON u.id = s.user_id WHERE s.user_id = $1`,
      [userId]
    )).rows[0];
    if (!studentFull) return res.status(404).json({ success: false, message: 'Student not found' });

    const transcript = await query(
      `SELECT * FROM v_student_transcript WHERE student_id = $1 ORDER BY semester_id, course_code`,
      [studentFull.id]
    );

    const gpaHistory = await query(
      `SELECT sg.*, sem.label, sem.semester_type FROM semester_gpa_records sg
       JOIN semesters sem ON sem.id = sg.semester_id
       WHERE sg.student_id = $1 ORDER BY sem.start_date`,
      [studentFull.id]
    );

    return res.json({
      success: true,
      data: {
        student: {
          studentCode: studentFull.student_code,
          fullNameAr: studentFull.full_name_ar,
          fullNameEn: studentFull.full_name_en,
          specialization: studentFull.specialization,
          currentLevel: studentFull.current_level,
          cgpa: studentFull.cgpa,
          totalCreditsPassed: studentFull.total_credits_passed,
          academicStatus: studentFull.academic_status,
          gpaClassification: gpaService.getCGPAClassification(parseFloat(studentFull.cgpa)),
        },
        courses: transcript.rows,
        gpaHistory: gpaHistory.rows,
      }
    });
  } catch (err) { next(err); }
};

// ── Get schedule ──────────────────────────────────────────────────────────────
const getSchedule = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { semesterId } = req.params;
    const student = (await query('SELECT id FROM students WHERE user_id = $1', [userId])).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const schedule = await registrationService.getStudentSchedule(student.id, semesterId);
    return res.json({ success: true, data: schedule });
  } catch (err) { next(err); }
};

// ── Get academic warnings ─────────────────────────────────────────────────────
const getWarnings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = (await query('SELECT id FROM students WHERE user_id = $1', [userId])).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const warnings = await query(
      `SELECT aw.*, sem.label as semester_label FROM academic_warnings aw
       JOIN semesters sem ON sem.id = aw.semester_id
       WHERE aw.student_id = $1 ORDER BY aw.issued_at DESC`,
      [student.id]
    );

    return res.json({ success: true, data: warnings.rows });
  } catch (err) { next(err); }
};

// ── Get notifications ─────────────────────────────────────────────────────────
const getNotifications = async (req, res, next) => {
  try {
    const notifs = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    return res.json({ success: true, data: notifs.rows });
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

// ── Graduation eligibility ────────────────────────────────────────────────────
const getGraduationStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = (await query('SELECT id FROM students WHERE user_id = $1', [userId])).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const eligibility = await bylawService.checkGraduationEligibility(student.id);
    const honors = await bylawService.checkHonorsEligibility(student.id);

    return res.json({ success: true, data: { eligibility, honors } });
  } catch (err) { next(err); }
};

module.exports = {
  getProfile, getDashboard, getAvailableCourses, registerCourse,
  dropCourse, withdrawCourse, getTranscript, getSchedule,
  getWarnings, getNotifications, markNotificationRead, getGraduationStatus
};
