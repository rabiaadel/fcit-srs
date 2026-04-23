const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const authCtrl = require('../controllers/auth.controller');
const studentCtrl = require('../controllers/student.controller');
const doctorCtrl = require('../controllers/doctor.controller');
const adminCtrl = require('../controllers/admin.controller');
const { query } = require('../config/database');

// ═══════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════
router.post('/auth/login', authCtrl.login);
router.post('/auth/refresh', authCtrl.refreshToken);
router.post('/auth/logout', authenticate, authCtrl.logout);
router.post('/auth/change-password', authenticate, authCtrl.changePassword);
router.get('/auth/me', authenticate, authCtrl.getMe);

// ═══════════════════════════════════════════════════════════
// STUDENT ROUTES
// ═══════════════════════════════════════════════════════════
const s = requireRole('student');
router.get('/student/profile', authenticate, s, studentCtrl.getProfile);
router.get('/student/dashboard', authenticate, s, studentCtrl.getDashboard);
router.get('/student/transcript', authenticate, s, studentCtrl.getTranscript);
router.get('/student/graduation-status', authenticate, s, studentCtrl.getGraduationStatus);
router.get('/student/warnings', authenticate, s, studentCtrl.getWarnings);
router.get('/student/notifications', authenticate, requireRole('student','doctor','admin'), studentCtrl.getNotifications);
router.patch('/student/notifications/:notifId/read', authenticate, studentCtrl.markNotificationRead);

// Registration
router.get('/student/semesters/:semesterId/available-courses', authenticate, s, studentCtrl.getAvailableCourses);
router.get('/student/semesters/:semesterId/schedule', authenticate, s, studentCtrl.getSchedule);
router.post('/student/register', authenticate, s, studentCtrl.registerCourse);
router.delete('/student/enrollments/:enrollmentId/drop', authenticate, s, studentCtrl.dropCourse);
router.post('/student/enrollments/:enrollmentId/withdraw', authenticate, s, studentCtrl.withdrawCourse);

// ═══════════════════════════════════════════════════════════
// DOCTOR ROUTES
// ═══════════════════════════════════════════════════════════
const d = requireRole('doctor', 'admin');
router.get('/doctor/dashboard', authenticate, requireRole('doctor'), doctorCtrl.getDashboard);
router.get('/doctor/courses', authenticate, requireRole('doctor'), doctorCtrl.getMyCourses);
router.get('/doctor/offerings/:offeringId/roster', authenticate, d, doctorCtrl.getCourseRoster);
router.patch('/doctor/enrollments/:enrollmentId/grades', authenticate, d, doctorCtrl.enterGrades);
router.post('/doctor/offerings/:offeringId/grades/bulk', authenticate, d, doctorCtrl.bulkEnterGrades);
router.post('/doctor/offerings/:offeringId/attendance', authenticate, d, doctorCtrl.recordAttendance);
router.get('/doctor/offerings/:offeringId/attendance', authenticate, d, doctorCtrl.getAttendanceReport);
router.post('/doctor/offerings/:offeringId/lock-grades', authenticate, requireRole('admin'), doctorCtrl.lockGrades);

// ═══════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════
const a = requireRole('admin');
router.get('/admin/dashboard', authenticate, a, adminCtrl.getDashboard);
router.get('/admin/users', authenticate, a, adminCtrl.getUsers);
router.post('/admin/users', authenticate, a, adminCtrl.createUser);
router.patch('/admin/users/:userId', authenticate, a, adminCtrl.updateUser);
router.post('/admin/users/:userId/reset-password', authenticate, a, adminCtrl.resetPassword);
router.get('/admin/students', authenticate, a, adminCtrl.getStudents);
router.get('/admin/students/:studentId', authenticate, a, adminCtrl.getStudentDetail);
router.get('/admin/semesters', authenticate, requireRole('admin','doctor','student'), adminCtrl.getSemesters);
router.patch('/admin/semesters/:semesterId/status', authenticate, a, adminCtrl.updateSemesterStatus);
router.post('/admin/semesters/:semesterId/finalize', authenticate, a, adminCtrl.finalizeSemester);
router.post('/admin/offerings', authenticate, a, adminCtrl.createOffering);
router.get('/admin/reports/academic', authenticate, a, adminCtrl.getAcademicReport);

// Announcements (admin creates, all can read)
router.get('/announcements', authenticate, adminCtrl.getAnnouncements);
router.post('/admin/announcements', authenticate, a, adminCtrl.createAnnouncement);

// ═══════════════════════════════════════════════════════════
// SHARED / REFERENCE DATA ROUTES
// ═══════════════════════════════════════════════════════════
router.get('/courses', authenticate, async (req, res, next) => {
  try {
    const { category, level, department } = req.query;
    let sql = 'SELECT c.*, dep.code as dept_code, dep.name_en as dept_name FROM courses c LEFT JOIN departments dep ON dep.id = c.department_id WHERE c.is_active = TRUE';
    const params = [];
    if (category) { params.push(category); sql += ` AND c.category = $${params.length}`; }
    if (level) { params.push(parseInt(level)); sql += ` AND c.level = $${params.length}`; }
    if (department) { params.push(department); sql += ` AND dep.code = $${params.length}`; }
    sql += ' ORDER BY c.level, c.code';
    const courses = await query(sql, params);
    res.json({ success: true, data: courses.rows });
  } catch (err) { next(err); }
});

router.get('/courses/:courseId/prerequisites', authenticate, async (req, res, next) => {
  try {
    const prereqs = await query(
      `SELECT cp.*, c.code, c.name_en, c.credits FROM course_prerequisites cp
       JOIN courses c ON c.id = cp.prereq_course_id WHERE cp.course_id = $1`,
      [req.params.courseId]
    );
    res.json({ success: true, data: prereqs.rows });
  } catch (err) { next(err); }
});

router.get('/departments', authenticate, async (req, res, next) => {
  try {
    const depts = await query('SELECT * FROM departments WHERE is_active = TRUE ORDER BY code');
    res.json({ success: true, data: depts.rows });
  } catch (err) { next(err); }
});

router.get('/semesters/current', authenticate, async (req, res, next) => {
  try {
    const sem = await query(
      "SELECT s.*, ay.year_label FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.status IN ('registration','active','grading') ORDER BY s.start_date DESC LIMIT 1"
    );
    res.json({ success: true, data: sem.rows[0] || null });
  } catch (err) { next(err); }
});

router.get('/academic-rules', authenticate, async (req, res, next) => {
  try {
    const rules = await query('SELECT * FROM academic_rules WHERE is_active = TRUE ORDER BY category, rule_id');
    res.json({ success: true, data: rules.rows });
  } catch (err) { next(err); }
});

module.exports = router;
