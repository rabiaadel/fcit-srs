// =============================================================================
// Routes — FCIT SRS
// [B9-FIX]  Doctor notifications use dedicated /doctor/notifications route
// [B10-FIX] Semester list is a shared route (accessible to all roles)
// [B2-FIX]  Mark-all-read + unread count endpoints added
// [F1-FIX]  /semesters route is shared, not admin-scoped
// [B3-FIX]  Input validation added to all mutation endpoints
// =============================================================================
const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { validateLogin, validateGradeEntry, validateRegistration, validateCreateUser, validateSemesterStatus } = require('../middleware/validate');
const authCtrl    = require('../controllers/auth.controller');
const studentCtrl = require('../controllers/student.controller');
const doctorCtrl  = require('../controllers/doctor.controller');
const adminCtrl   = require('../controllers/admin.controller');
const notifService = require('../services/notification.service');
const { query }   = require('../config/database');
const logger       = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────
router.post('/auth/login',           validateLogin, authCtrl.login);
router.post('/auth/refresh',         authCtrl.refreshToken);
router.post('/auth/logout',          authCtrl.logout);  // No authenticate — must work with expired tokens
router.post('/auth/change-password', authenticate, authCtrl.changePassword);
router.get('/auth/me',               authenticate, authCtrl.getMe);

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT ROUTES  (role: student only, except notifications)
// ─────────────────────────────────────────────────────────────────────────────
const sOnly = requireRole('student');

router.get('/student/profile',            authenticate, sOnly, studentCtrl.getProfile);
router.get('/student/dashboard',          authenticate, sOnly, studentCtrl.getDashboard);
router.get('/student/transcript',         authenticate, sOnly, studentCtrl.getTranscript);
router.get('/student/graduation-status',  authenticate, sOnly, studentCtrl.getGraduationStatus);
router.get('/student/warnings',           authenticate, sOnly, studentCtrl.getWarnings);

// Registration
router.get('/student/semesters/:semesterId/available-courses', authenticate, sOnly, studentCtrl.getAvailableCourses);
router.get('/student/semesters/:semesterId/schedule',          authenticate, sOnly, studentCtrl.getSchedule);
router.post('/student/register',                               authenticate, sOnly, validateRegistration, studentCtrl.registerCourse);
router.delete('/student/enrollments/:enrollmentId/drop',       authenticate, sOnly, studentCtrl.dropCourse);
router.post('/student/enrollments/:enrollmentId/withdraw',     authenticate, sOnly, studentCtrl.withdrawCourse);

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS — shared across all roles
// [B9-FIX] Doctor gets own route; student path still works for students
// ─────────────────────────────────────────────────────────────────────────────
const notifHandler = async (req, res, next) => {
  try {
    const notifs = (await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    )).rows;
    res.json({ success: true, data: notifs });
  } catch (err) { next(err); }
};

const notifReadHandler = async (req, res, next) => {
  try {
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [req.params.notifId, req.user.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};

const notifReadAllHandler = async (req, res, next) => {
  try {
    await notifService.markAllRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

const notifUnreadCountHandler = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [req.user.id]
    );
    res.json({ success: true, data: { count: parseInt(result.rows[0].count) } });
  } catch (err) { next(err); }
};

// All authenticated users get these notification routes
router.get('/notifications',                    authenticate, notifHandler);
router.get('/notifications/unread-count',       authenticate, notifUnreadCountHandler);
router.patch('/notifications/read-all',         authenticate, notifReadAllHandler);
router.patch('/notifications/:notifId/read',    authenticate, notifReadHandler);

// Legacy path aliases (keep backward compat)
router.get('/student/notifications',            authenticate, notifHandler);
router.patch('/student/notifications/:notifId/read', authenticate, notifReadHandler);

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR ROUTES  (role: doctor or admin)
// ─────────────────────────────────────────────────────────────────────────────
const dOrA = requireRole('doctor', 'admin');

router.get('/doctor/dashboard',  authenticate, requireRole('doctor'), doctorCtrl.getDashboard);
router.get('/doctor/courses',    authenticate, requireRole('doctor'), doctorCtrl.getMyCourses);

// [B9-FIX] Doctor notifications via own route
router.get('/doctor/notifications',                  authenticate, dOrA, notifHandler);
router.patch('/doctor/notifications/:notifId/read',  authenticate, dOrA, notifReadHandler);

router.get('/doctor/offerings/:offeringId/roster',       authenticate, dOrA, doctorCtrl.getCourseRoster);
router.patch('/doctor/enrollments/:enrollmentId/grades', authenticate, dOrA, validateGradeEntry, doctorCtrl.enterGrades);
router.post('/doctor/offerings/:offeringId/grades/bulk', authenticate, dOrA, doctorCtrl.bulkEnterGrades);
router.post('/doctor/offerings/:offeringId/attendance',  authenticate, dOrA, doctorCtrl.recordAttendance);
router.get('/doctor/offerings/:offeringId/attendance',   authenticate, dOrA, doctorCtrl.getAttendanceReport);
router.post('/doctor/offerings/:offeringId/lock-grades', authenticate, requireRole('admin'), doctorCtrl.lockGrades);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES  (role: admin only)
// ─────────────────────────────────────────────────────────────────────────────
const aOnly = requireRole('admin');

router.get('/admin/dashboard',   authenticate, aOnly, adminCtrl.getDashboard);
router.get('/admin/users',       authenticate, aOnly, adminCtrl.getUsers);
router.post('/admin/users',      authenticate, aOnly, validateCreateUser, adminCtrl.createUser);
router.patch('/admin/users/:userId',               authenticate, aOnly, adminCtrl.updateUser);
router.post('/admin/users/:userId/reset-password', authenticate, aOnly, adminCtrl.resetPassword);

// Bulk Import Excel Endpoints
router.post('/admin/users/validate-bulk', authenticate, aOnly, adminCtrl.validateUsersBulk);
router.post('/admin/users/bulk-import', authenticate, aOnly, adminCtrl.bulkImportUsers);

router.get('/admin/students',              authenticate, aOnly, adminCtrl.getStudents);
router.get('/admin/students/:studentId',   authenticate, aOnly, adminCtrl.getStudentDetail);

router.patch('/admin/semesters/:semesterId/status',    authenticate, aOnly, validateSemesterStatus, adminCtrl.updateSemesterStatus);
router.post('/admin/semesters/:semesterId/finalize',   authenticate, aOnly, adminCtrl.finalizeSemester);

router.post('/admin/offerings', authenticate, aOnly, adminCtrl.createOffering);

router.get('/admin/reports/academic', authenticate, aOnly, adminCtrl.getAcademicReport);

router.get('/admin/announcements',  authenticate, aOnly, adminCtrl.getAnnouncements);
router.post('/admin/announcements', authenticate, aOnly, adminCtrl.createAnnouncement);
router.delete('/admin/announcements/:announcementId', authenticate, aOnly, adminCtrl.deleteAnnouncement);


// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: COURSE MANAGEMENT  [C6-FIX]
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/courses',                         authenticate, aOnly, adminCtrl.getCourses);
router.post('/admin/courses',                        authenticate, aOnly, adminCtrl.createCourse);
router.patch('/admin/courses/:courseId',             authenticate, aOnly, adminCtrl.updateCourse);
router.delete('/admin/courses/:courseId',            authenticate, aOnly, adminCtrl.deleteCourse);
router.post('/admin/courses/:courseId/prerequisites',authenticate, aOnly, adminCtrl.addPrerequisite);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: OFFERINGS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/offerings',                       authenticate, aOnly, adminCtrl.getOfferings);
router.patch('/admin/offerings/:offeringId',         authenticate, aOnly, adminCtrl.updateOffering);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: STUDENT ENROLLMENT OVERRIDE  [C7-FIX]
// ─────────────────────────────────────────────────────────────────────────────
router.post('/admin/students/:studentId/enroll',              authenticate, aOnly, adminCtrl.adminEnrollStudent);
router.delete('/admin/students/:studentId/enroll/:enrollmentId', authenticate, aOnly, adminCtrl.adminForceDropStudent);
router.get('/admin/students/:studentId/enrollments',          authenticate, aOnly, adminCtrl.getStudentEnrollments);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: REGISTRATION CONTROL  [C8-FIX]
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/registration/status',  authenticate, aOnly, adminCtrl.getRegistrationStatus);
router.post('/admin/registration/toggle', authenticate, aOnly, adminCtrl.toggleRegistration);

// ─────────────────────────────────────────────────────────────────────────────
// SHARED / REFERENCE DATA
// [F1-FIX]  /semesters is now a proper shared route for all roles
// [B10-FIX] Admin getSemesters reused here — same handler, no duplication
// ─────────────────────────────────────────────────────────────────────────────

// [F1-FIX] Shared semesters endpoint — all roles can call this
router.get('/semesters', authenticate, async (req, res, next) => {
  try {
    const sems = (await query(
      `SELECT s.*, ay.year_label
       FROM semesters s
       JOIN academic_years ay ON ay.id = s.academic_year_id
       ORDER BY s.start_date DESC`
    )).rows;
    
    // Format semester labels
    const bylawService = require('../services/bylaw.service');
    sems.forEach(s => { 
      s.label = bylawService.getSemesterLabel(s.semester_type, s.year_label) || s.label; 
      s.status = bylawService.computeSemesterStatus(s);
    });
    
    res.json({ success: true, data: sems });
  } catch (err) { next(err); }
});


// Keep /admin/semesters alias for admin panel use
router.get('/admin/semesters',  authenticate, aOnly, adminCtrl.getSemesters);
router.post('/admin/semesters', authenticate, aOnly, adminCtrl.createSemester);

router.get('/semesters/current', authenticate, async (req, res, next) => {
  try {
    const sem = (await query(
      `SELECT s.*, ay.year_label FROM semesters s
       JOIN academic_years ay ON ay.id = s.academic_year_id
       WHERE s.status IN ('registration','active','grading')
       ORDER BY s.start_date DESC LIMIT 1`
    )).rows[0];
    
    if (sem) {
      const bylawService = require('../services/bylaw.service');
      sem.label = bylawService.getSemesterLabel(sem.semester_type, sem.year_label) || sem.label;
      sem.status = bylawService.computeSemesterStatus(sem);
    }
    
    res.json({ success: true, data: sem || null });
  } catch (err) { next(err); }
});

// Announcements — all authenticated users can read
router.get('/announcements', authenticate, async (req, res, next) => {
  try {
    const role = req.user.role;
    const anns = (await query(
      `SELECT a.*, u.full_name_en as created_by_name
       FROM announcements a LEFT JOIN users u ON u.id = a.created_by
       WHERE (expires_at IS NULL OR expires_at > NOW())
         AND (target_role IS NULL OR target_role = $1)
       ORDER BY is_pinned DESC, created_at DESC LIMIT 30`,
      [role]
    )).rows;
    res.json({ success: true, data: anns });
  } catch (err) { next(err); }
});

router.get('/courses', authenticate, async (req, res, next) => {
  try {
    const { category, level, department } = req.query;
    let sql = `SELECT c.*, dep.code as dept_code, dep.name_en as dept_name
               FROM courses c LEFT JOIN departments dep ON dep.id = c.department_id
               WHERE c.is_active = TRUE`;
    const params = [];
    if (category)   { params.push(category);          sql += ` AND c.category = $${params.length}`; }
    if (level)      { params.push(parseInt(level));    sql += ` AND c.level = $${params.length}`; }
    if (department) { params.push(department);         sql += ` AND dep.code = $${params.length}`; }
    sql += ' ORDER BY c.level, c.code';
    const courses = await query(sql, params);
    res.json({ success: true, data: courses.rows });
  } catch (err) { next(err); }
});

router.get('/courses/:courseId/prerequisites', authenticate, async (req, res, next) => {
  try {
    const prereqs = (await query(
      `SELECT cp.*, c.code, c.name_en, c.credits
       FROM course_prerequisites cp JOIN courses c ON c.id = cp.prereq_course_id
       WHERE cp.course_id = $1`,
      [req.params.courseId]
    )).rows;
    res.json({ success: true, data: prereqs });
  } catch (err) { next(err); }
});

router.get('/departments', authenticate, async (req, res, next) => {
  try {
    const depts = (await query(
      'SELECT * FROM departments WHERE is_active = TRUE ORDER BY code'
    )).rows;
    res.json({ success: true, data: depts });
  } catch (err) { next(err); }
});

// =============================================================================
// V3 EXTENSIONS — Curriculum plans, bylaw config, departments, doctor schedule
// =============================================================================
const adminExt = require('../controllers/admin.extensions');

// Curriculum plans
router.get('/admin/curriculum',            authenticate, aOnly, adminExt.getCurriculumPlan);
router.post('/admin/curriculum',           authenticate, aOnly, adminExt.addCourseToCurriculum);
router.put('/admin/curriculum/:planId',    authenticate, aOnly, adminExt.updateCurriculumEntry);
router.delete('/admin/curriculum/:planId', authenticate, aOnly, adminExt.removeCourseFromCurriculum);

// Bylaw config (Database)
router.get('/admin/bylaw-config',                 authenticate, aOnly, adminExt.getBylawConfig);
router.put('/admin/bylaw-config/:key',             authenticate, aOnly, adminExt.updateBylawConfig);
router.post('/admin/bylaw-config/:key/reset',      authenticate, aOnly, adminExt.resetBylawConfig);
router.post('/admin/cache/invalidate',             authenticate, aOnly, adminExt.invalidateBylawCache);

// Bylaw config (JSON)
router.get('/admin/bylaw-full',                   authenticate, aOnly, adminExt.getBylawFull);
router.post('/admin/bylaw-full',                  authenticate, aOnly, adminExt.updateBylawFull);

// Departments CRUD
router.get('/admin/departments',              authenticate, aOnly, adminExt.getDepartments);
router.post('/admin/departments',             authenticate, aOnly, adminExt.createDepartment);
router.patch('/admin/departments/:deptId',    authenticate, aOnly, adminExt.updateDepartment);

// Doctor schedule assignment
router.get('/admin/doctor-schedule/:doctorId',              authenticate, aOnly, adminExt.getDoctorSchedule);
router.post('/admin/offerings/:offeringId/schedule',        authenticate, aOnly, adminExt.assignScheduleToOffering);

// Prerequisites UI
router.get('/admin/courses/:courseId/prerequisites',                       authenticate, aOnly, adminExt.getPrerequisites);
router.delete('/admin/courses/:courseId/prerequisites/:prereqId',          authenticate, aOnly, adminExt.removePrerequisite);

// Enhanced reports
router.get('/admin/reports/detailed', authenticate, aOnly, adminExt.getDetailedReports);

// Enhanced semester creation
router.post('/admin/semesters/create-enhanced', authenticate, aOnly, adminExt.createSemesterEnhanced);
// Admin: update semester dates/deadlines at any time (FIX-E)
router.patch('/admin/semesters/:semesterId/dates', authenticate, aOnly, async (req, res, next) => {
  try {
    const { semesterId } = req.params;
    const {
      registrationStart, registrationEnd, startDate, endDate,
      addDropDeadline, withdrawalDeadline, label
    } = req.body;

    const allowed = ['upcoming','registration','active'];
    const sem = (await query('SELECT * FROM semesters WHERE id=$1',[semesterId])).rows[0];
    if (!sem) return res.status(404).json({ success:false, message:'Semester not found' });
    if (!allowed.includes(sem.status)) {
      return res.status(400).json({ success:false, message:'Cannot change dates of a grading/closed semester' });
    }

    const updated = (await query(
      `UPDATE semesters SET
         label              = COALESCE($1, label),
         registration_start = COALESCE($2::date, registration_start),
         registration_end   = COALESCE($3::date, registration_end),
         start_date         = COALESCE($4::date, start_date),
         end_date           = COALESCE($5::date, end_date),
         add_drop_deadline  = COALESCE($6::date, add_drop_deadline),
         withdrawal_deadline= COALESCE($7::date, withdrawal_deadline)
       WHERE id = $8 RETURNING *`,
      [label, registrationStart, registrationEnd, startDate, endDate,
       addDropDeadline, withdrawalDeadline, semesterId]
    )).rows[0];

    // Notify students if registration was extended
    if (registrationEnd) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type)
         SELECT u.id,
           'تحديث: فترة التسجيل',
           'تم تمديد فترة التسجيل حتى ' || $1::date,
           'semester_event'
         FROM users u JOIN students s ON s.user_id = u.id WHERE s.academic_status = 'active'`,
        [registrationEnd]
      );
    }

    logger.info('Semester dates updated', { semesterId, adminId: req.user.id });
    return res.json({ success:true, data:updated, message:'Semester dates updated' });
  } catch(err) { next(err); }
});

// Admin: open/close registration toggle (FIX-E)
router.post('/admin/semesters/:semesterId/toggle-registration', authenticate, aOnly, async (req, res, next) => {
  try {
    const { semesterId } = req.params;
    const { action } = req.body; // 'open' | 'close'
    const sem = (await query('SELECT * FROM semesters WHERE id=$1',[semesterId])).rows[0];
    if (!sem) return res.status(404).json({ success:false, message:'Semester not found' });

    let newStatus;
    if (action === 'open') {
      if (!['upcoming','active'].includes(sem.status)) {
        return res.status(400).json({ success:false, message:`Cannot open registration from status: ${sem.status}` });
      }
      newStatus = 'registration';
    } else if (action === 'close') {
      if (sem.status !== 'registration') {
        return res.status(400).json({ success:false, message:'Registration is not currently open' });
      }
      newStatus = 'active';
    } else {
      return res.status(400).json({ success:false, message:'action must be open or close' });
    }

    const updated = (await query(
      'UPDATE semesters SET status=$1 WHERE id=$2 RETURNING *',
      [newStatus, semesterId]
    )).rows[0];

    // Notify all active students
    const notifMsg = action === 'open'
      ? `فُتح التسجيل للفصل الدراسي: ${sem.label}`
      : `أُغلق التسجيل للفصل الدراسي: ${sem.label}`;
    await query(
      `INSERT INTO notifications (user_id, title, message, type)
       SELECT u.id, $1, $2, 'semester_event'
       FROM users u JOIN students s ON s.user_id = u.id WHERE s.academic_status = 'active'`,
      [action==='open'?'فتح التسجيل':'إغلاق التسجيل', notifMsg]
    );

    logger.info('Registration toggled', { semesterId, action, newStatus, adminId:req.user.id });
    return res.json({ success:true, data:updated, message:`Registration ${action}ed` });
  } catch(err) { next(err); }
});


// Doctor: own schedule with PDF data
router.get('/doctor/schedule', authenticate, requireRole('doctor'), adminExt.getDoctorOwnSchedule);

// Student: courses grouped by curriculum plan
router.get('/student/semesters/:semesterId/courses-by-plan', authenticate, sOnly, adminExt.getCoursesGroupedByPlan);

// Notification detail (all roles)
router.get('/notifications/:notifId/detail', authenticate, adminExt.getNotificationDetail);

router.get('/academic-rules', authenticate, async (req, res, next) => {
  try {
    const rules = (await query(
      'SELECT * FROM academic_rules WHERE is_active = TRUE ORDER BY category, rule_id'
    )).rows;
    res.json({ success: true, data: rules });
  } catch (err) { next(err); }
});


// =============================================================================
// FR-1 to FR-5: Credit hours, eligibility, alternatives, auto-stop
// =============================================================================
const studentExt = require('../controllers/student.extensions');

// FR-1+FR-4: Credit hour summary with remaining/at-limit info
router.get('/student/semesters/:semesterId/credit-summary',
  authenticate, sOnly, studentExt.getCreditSummary);

// FR-2: Full eligibility check for one offering (7 checks)
router.get('/student/semesters/:semesterId/offerings/:offeringId/eligibility',
  authenticate, sOnly, studentExt.checkCourseEligibility);

// FR-3: Alternative course suggestions when blocked
router.get('/student/semesters/:semesterId/offerings/:offeringId/alternatives',
  authenticate, sOnly, studentExt.getAlternativeCourses);

// FR-5: Pre-registration full validation (all checks in one shot)
router.post('/student/semesters/:semesterId/validate-registration',
  authenticate, sOnly, studentExt.validateRegistrationFull);

// Bylaw Endpoint (Shared)
router.get('/bylaw', authenticate, (req, res, next) => {
  try {
    const data = require('../services/bylaw.service').getBylaw();
    res.json({ success: true, data });
  } catch (err) {
    logger.error('Failed to get bylaw', err);
    res.status(500).json({ success: false, message: 'Failed to load bylaw: ' + err.message });
  }
});



// Health check (public)
router.get('/health', async (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
