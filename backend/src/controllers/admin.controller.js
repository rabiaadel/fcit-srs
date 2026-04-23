const bcrypt = require('bcrypt');
const { query, withTransaction } = require('../config/database');
const registrationService = require('../services/registration.service');
const bylawService = require('../services/bylaw.service');

// ── Dashboard ─────────────────────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const stats = (await query('SELECT * FROM v_admin_dashboard_stats')).rows[0];
    const specStats = (await query('SELECT * FROM v_specialization_stats')).rows;
    const currentSem = (await query(
      "SELECT * FROM semesters WHERE status IN ('registration','active','grading') ORDER BY start_date DESC LIMIT 1"
    )).rows[0];
    const recentWarnings = (await query(
      `SELECT aw.*, u.full_name_en, s.student_code, sem.label as semester_label
       FROM academic_warnings aw JOIN students s ON s.id = aw.student_id
       JOIN users u ON u.id = s.user_id JOIN semesters sem ON sem.id = aw.semester_id
       ORDER BY aw.issued_at DESC LIMIT 10`
    )).rows;

    return res.json({
      success: true,
      data: { stats, specializationStats: specStats, currentSemester: currentSem, recentWarnings }
    });
  } catch (err) { next(err); }
};

// ── User Management ───────────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let sql = `SELECT u.id, u.email, u.role, u.full_name_ar, u.full_name_en, u.is_active, u.last_login,
                      u.national_id, u.phone, u.created_at
               FROM users u WHERE 1=1`;
    const params = [];
    if (role) { params.push(role); sql += ` AND u.role = $${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (u.full_name_en ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.national_id ILIKE $${params.length})`;
    }
    params.push(parseInt(limit)); sql += ` ORDER BY u.created_at DESC LIMIT $${params.length}`;
    params.push(offset); sql += ` OFFSET $${params.length}`;

    const users = await query(sql, params);
    const totalRes = await query('SELECT COUNT(*) FROM users WHERE 1=1' + (role ? ' AND role = $1' : ''), role ? [role] : []);

    return res.json({
      success: true,
      data: { users: users.rows, total: parseInt(totalRes.rows[0].count), page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) { next(err); }
};

const createUser = async (req, res, next) => {
  try {
    const { email, password, role, fullNameAr, fullNameEn, nationalId, phone, specialization, enrollmentYear, departmentId, academicTitle } = req.body;

    if (!email || !password || !role || !fullNameAr || !fullNameEn) {
      return res.status(400).json({ success: false, message: 'email, password, role, fullNameAr, fullNameEn required' });
    }

    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (!strongPw.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must include uppercase, lowercase, number, and special character (min 8 chars)' });
    }

    return await withTransaction(async (client) => {
      const hash = await bcrypt.hash(password, 10);
      const user = (await client.query(
        'INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, national_id, phone) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [email.toLowerCase(), hash, role, fullNameAr, fullNameEn, nationalId || null, phone || null]
      )).rows[0];

      if (role === 'student') {
        const year = enrollmentYear || new Date().getFullYear();
        const specCode = specialization ? specialization.toUpperCase() : 'CS';
        // Generate student code
        const count = (await client.query('SELECT COUNT(*) FROM students WHERE enrollment_year = $1', [year])).rows[0].count;
        const code = `${year}${specCode}${String(parseInt(count) + 1).padStart(4, '0')}`;
        await client.query(
          `INSERT INTO students (user_id, student_code, enrollment_year, specialization, track) VALUES ($1,$2,$3,$4,'science_math')`,
          [user.id, code, year, specCode]
        );
      } else if (role === 'doctor') {
        await client.query(
          'INSERT INTO doctors (user_id, department_id, academic_title) VALUES ($1,$2,$3)',
          [user.id, departmentId || null, academicTitle || 'Dr.']
        );
      }

      return res.status(201).json({ success: true, message: 'User created', data: { userId: user.id } });
    });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Email or national ID already exists' });
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { fullNameAr, fullNameEn, phone, isActive, specialization, academicStatus } = req.body;

    await query(
      'UPDATE users SET full_name_ar = COALESCE($1, full_name_ar), full_name_en = COALESCE($2, full_name_en), phone = COALESCE($3, phone), is_active = COALESCE($4, is_active), updated_at = NOW() WHERE id = $5',
      [fullNameAr, fullNameEn, phone, isActive, userId]
    );

    if (specialization) {
      await query('UPDATE students SET specialization = $1 WHERE user_id = $2', [specialization, userId]);
    }
    if (academicStatus) {
      await query('UPDATE students SET academic_status = $1 WHERE user_id = $2', [academicStatus, userId]);
    }

    return res.json({ success: true, message: 'User updated' });
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ success: false, message: 'New password required' });
    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1, must_change_pw = TRUE WHERE id = $2', [hash, userId]);
    return res.json({ success: true, message: 'Password reset. User must change on next login.' });
  } catch (err) { next(err); }
};

// ── Student Management ────────────────────────────────────────────────────────
const getStudents = async (req, res, next) => {
  try {
    const { specialization, status, level, page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let sql = `SELECT s.*, u.email, u.full_name_ar, u.full_name_en, u.national_id
               FROM students s JOIN users u ON u.id = s.user_id WHERE 1=1`;
    const params = [];
    if (specialization) { params.push(specialization); sql += ` AND s.specialization = $${params.length}`; }
    if (status) { params.push(status); sql += ` AND s.academic_status = $${params.length}`; }
    if (level) { params.push(level); sql += ` AND s.current_level = $${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (u.full_name_en ILIKE $${params.length} OR s.student_code ILIKE $${params.length} OR u.national_id ILIKE $${params.length})`;
    }
    params.push(parseInt(limit)); sql += ` ORDER BY s.student_code LIMIT $${params.length}`;
    params.push(offset); sql += ` OFFSET $${params.length}`;

    const students = await query(sql, params);
    return res.json({ success: true, data: students.rows });
  } catch (err) { next(err); }
};

const getStudentDetail = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = (await query(
      `SELECT s.*, u.email, u.full_name_ar, u.full_name_en, u.national_id, u.phone
       FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1`,
      [studentId]
    )).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const transcript = (await query('SELECT * FROM v_student_transcript WHERE student_id = $1 ORDER BY semester_id, course_code', [studentId])).rows;
    const gpaHistory = (await query(
      `SELECT sg.*, sem.label FROM semester_gpa_records sg JOIN semesters sem ON sem.id = sg.semester_id WHERE sg.student_id = $1 ORDER BY sem.start_date`,
      [studentId]
    )).rows;
    const warnings = (await query(
      `SELECT aw.*, sem.label as semester_label FROM academic_warnings aw JOIN semesters sem ON sem.id = aw.semester_id WHERE aw.student_id = $1 ORDER BY aw.issued_at DESC`,
      [studentId]
    )).rows;
    const eligibility = await bylawService.checkGraduationEligibility(studentId);

    return res.json({ success: true, data: { student, transcript, gpaHistory, warnings, eligibility } });
  } catch (err) { next(err); }
};

// ── Semester Management ───────────────────────────────────────────────────────
const getSemesters = async (req, res, next) => {
  try {
    const sems = (await query('SELECT s.*, ay.year_label FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id ORDER BY s.start_date DESC')).rows;
    return res.json({ success: true, data: sems });
  } catch (err) { next(err); }
};

const updateSemesterStatus = async (req, res, next) => {
  try {
    const { semesterId } = req.params;
    const { status } = req.body;
    const validStatuses = ['upcoming', 'registration', 'active', 'grading', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }
    await query('UPDATE semesters SET status = $1 WHERE id = $2', [status, semesterId]);
    return res.json({ success: true, message: `Semester status updated to ${status}` });
  } catch (err) { next(err); }
};

const finalizeSemester = async (req, res, next) => {
  try {
    const { semesterId } = req.params;
    const result = await registrationService.finalizeSemester(semesterId, req.user.id);
    return res.json({ success: true, message: 'Semester finalized', data: result });
  } catch (err) {
    if (err.message) return res.status(400).json({ success: false, message: err.message });
    next(err);
  }
};

// ── Course Offerings Management ───────────────────────────────────────────────
const createOffering = async (req, res, next) => {
  try {
    const { semesterId, courseId, doctorId, section = 'A', capacity = 60, schedule, room } = req.body;
    const offering = (await query(
      'INSERT INTO course_offerings (semester_id, course_id, doctor_id, section, capacity, schedule, room) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [semesterId, courseId, doctorId || null, section, capacity, schedule ? JSON.stringify(schedule) : null, room || null]
    )).rows[0];
    return res.status(201).json({ success: true, data: offering });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Offering already exists for this semester/course/section' });
    next(err);
  }
};

// ── Announcements ─────────────────────────────────────────────────────────────
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, body, targetRole, isPinned, expiresAt } = req.body;
    const ann = (await query(
      'INSERT INTO announcements (title, body, target_role, created_by, is_pinned, expires_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, body, targetRole || null, req.user.id, isPinned || false, expiresAt || null]
    )).rows[0];
    return res.status(201).json({ success: true, data: ann });
  } catch (err) { next(err); }
};

const getAnnouncements = async (req, res, next) => {
  try {
    const anns = (await query(
      `SELECT a.*, u.full_name_en as created_by_name FROM announcements a
       LEFT JOIN users u ON u.id = a.created_by
       WHERE (expires_at IS NULL OR expires_at > NOW())
       ORDER BY is_pinned DESC, created_at DESC`
    )).rows;
    return res.json({ success: true, data: anns });
  } catch (err) { next(err); }
};

// ── Reports ───────────────────────────────────────────────────────────────────
const getAcademicReport = async (req, res, next) => {
  try {
    const topStudents = (await query(
      `SELECT s.student_code, u.full_name_en, s.specialization, s.cgpa, s.total_credits_passed, s.current_level
       FROM students s JOIN users u ON u.id = s.user_id
       WHERE s.academic_status IN ('active','graduated')
       ORDER BY s.cgpa DESC LIMIT 20`
    )).rows;

    const dismissedStudents = (await query(
      `SELECT s.student_code, u.full_name_en, s.specialization, s.cgpa, s.total_warnings
       FROM students s JOIN users u ON u.id = s.user_id
       WHERE s.academic_status = 'dismissed' ORDER BY s.student_code`
    )).rows;

    const gpaDistribution = (await query(
      `SELECT
         COUNT(*) FILTER (WHERE cgpa >= 3.5) as excellent,
         COUNT(*) FILTER (WHERE cgpa >= 3.0 AND cgpa < 3.5) as very_good,
         COUNT(*) FILTER (WHERE cgpa >= 2.5 AND cgpa < 3.0) as good,
         COUNT(*) FILTER (WHERE cgpa >= 2.0 AND cgpa < 2.5) as satisfactory,
         COUNT(*) FILTER (WHERE cgpa < 2.0) as below_average
       FROM students WHERE academic_status IN ('active','warning')`
    )).rows[0];

    return res.json({ success: true, data: { topStudents, dismissedStudents, gpaDistribution } });
  } catch (err) { next(err); }
};

module.exports = {
  getDashboard, getUsers, createUser, updateUser, resetPassword,
  getStudents, getStudentDetail,
  getSemesters, updateSemesterStatus, finalizeSemester,
  createOffering, createAnnouncement, getAnnouncements, getAcademicReport
};
