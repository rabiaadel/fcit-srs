// =============================================================================
// Admin Controller
// [B1-FIX] getDashboard: v_admin_dashboard_stats enhanced with probation count
// [B5-FIX] createUser: doctor creation accepts departmentId from departments list
// [B7-FIX] getDashboard: falls back gracefully if specialization view missing
// [B2-FIX] createAnnouncement: triggers notification dispatch
// [B2-FIX] updateSemesterStatus: triggers registration-open / grading notifications
// =============================================================================
const bcrypt = require('bcryptjs');
const { query, withTransaction } = require('../config/database');
const registrationService = require('../services/registration.service');
const bylawService = require('../services/bylaw.service');
const notifService = require('../services/notification.service');
const { generateStudentCode } = require('../utils/studentCode');

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// [B1-FIX] Added probation_students count; safe fallback for missing views
// ─────────────────────────────────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const statsResult = await query(
      `SELECT
         COUNT(*) FILTER (WHERE academic_status = 'active')   AS active_students,
         COUNT(*) FILTER (WHERE academic_status IN ('warning', 'probation'))  AS warning_students,
         COUNT(*) FILTER (WHERE academic_status = 'probation') AS probation_students,
         COUNT(*) FILTER (WHERE academic_status = 'dismissed') AS dismissed_students,
         COUNT(*) FILTER (WHERE academic_status = 'graduated') AS graduated_students,
         (SELECT COUNT(*) FROM doctors) AS total_doctors,
         (SELECT COUNT(*) FROM courses WHERE is_active = TRUE) AS active_courses,
         (SELECT COUNT(*) FROM enrollments WHERE status = 'registered') AS current_enrollments,
         (SELECT ROUND(AVG(cgpa)::NUMERIC, 3)
          FROM students WHERE academic_status IN ('active','warning','probation')) AS avg_cgpa
       FROM students`
    );
    const stats = statsResult.rows[0];

    // [B7-FIX] Use inline query instead of view (idempotent, no view dependency)
    const specStats = (await query(
      `SELECT
         s.specialization,
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE s.academic_status = 'active') AS active,
         ROUND(AVG(s.cgpa), 3) AS avg_cgpa
       FROM students s
       WHERE s.specialization IS NOT NULL
       GROUP BY s.specialization
       ORDER BY s.specialization`
    )).rows;

    const currentSem = (await query(
      `SELECT s.*, ay.year_label FROM semesters s
       JOIN academic_years ay ON ay.id = s.academic_year_id
       WHERE s.status IN ('registration','active','grading')
       ORDER BY s.start_date DESC LIMIT 1`
    )).rows[0];

    const recentWarnings = (await query(
      `SELECT s.id as student_id, u.full_name_ar as student_name, s.student_code, s.cgpa, s.total_warnings, s.current_level, s.academic_status, s.total_credits_passed
       FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE s.academic_status IN ('warning', 'probation')
       ORDER BY s.cgpa ASC LIMIT 10`
    )).rows;

    recentWarnings.forEach(w => {
      w.current_level = bylawService.creditsToLevel(w.total_credits_passed).name_ar;
    });

    return res.json({
      success: true,
      data: { stats, specializationStats: specStats, currentSemester: currentSem, recentWarnings }
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let baseSql = `FROM users u WHERE 1=1`;
    const filterParams = [];
    
    if (role) { filterParams.push(role); baseSql += ` AND u.role = $${filterParams.length}`; }
    if (search) {
      filterParams.push(`%${search}%`);
      baseSql += ` AND (u.full_name_en ILIKE $${filterParams.length} OR u.full_name_ar ILIKE $${filterParams.length} OR u.email ILIKE $${filterParams.length} OR u.national_id ILIKE $${filterParams.length})`;
    }
    
    const countSql = `SELECT COUNT(*) ${baseSql}`;
    const countRes = await query(countSql, filterParams);
    const total = parseInt(countRes.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    let sql = `SELECT u.id, u.email, u.role, u.full_name_ar, u.full_name_en,
                      u.is_active, u.last_login, u.national_id, u.phone, u.created_at
               ${baseSql}`;
    const params = [...filterParams];
    params.push(parseInt(limit)); sql += ` ORDER BY u.created_at DESC LIMIT $${params.length}`;
    params.push(offset);         sql += ` OFFSET $${params.length}`;

    const users = await query(sql, params);
    return res.json({ 
      success: true, 
      data: { 
        users: users.rows, 
        page: parseInt(page), 
        limit: parseInt(limit),
        total,
        totalPages
      } 
    });
  } catch (err) { next(err); }
};

// [B5-FIX] Doctor creation now accepts departmentId properly
const createUser = async (req, res, next) => {
  try {
    const {
      email, role, fullNameAr, fullNameEn,
      nationalId, phone, specialization, enrollmentYear,
      departmentId, academicTitle, track = 'science_math'
    } = req.body;
    // Admin can create user without specifying a password — system auto-generates a secure temp one.
    // User MUST change it on first login (must_change_pw = true).
    // Generate password that ALWAYS satisfies: upper + lower + digit + special
    const uppers='ABCDEFGHJKLMNPQRSTUVWXYZ', lowers='abcdefghijkmnpqrstuvwxyz', digits='23456789';
    const rnd=(s)=>s[Math.floor(Math.random()*s.length)];
    const mix=[rnd(uppers),rnd(lowers),rnd(digits),rnd(uppers),rnd(lowers),rnd(digits),rnd(uppers),rnd(lowers)];
    // shuffle
    for(let i=mix.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[mix[i],mix[j]]=[mix[j],mix[i]];}
    const password = req.body.password || `Tp@${mix.join('')}!`;

    const resolvedFullNameEn = fullNameEn && fullNameEn.trim() ? fullNameEn.trim() : fullNameAr.trim();

    if (!email || !role || !fullNameAr) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني والصلاحية والاسم بالعربي مطلوبة' });
    }
    // Only validate password strength if admin explicitly provided one
    // (auto-generated passwords always meet requirements)

    // Skip strength check for auto-generated passwords; only validate explicit passwords
    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (req.body.password && !strongPw.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must include uppercase, lowercase, number, and special character (min 8 chars)' });
    }

    return await withTransaction(async (client) => {
      const hash = await bcrypt.hash(password, 10);
      const user = (await client.query(
        'INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, national_id, phone) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [email.toLowerCase().trim(), hash, role, fullNameAr, resolvedFullNameEn, nationalId || null, phone || null]
      )).rows[0];

      if (role === 'student') {
        const year = enrollmentYear || new Date().getFullYear();
        // New students default to level 1 (عام / General Program) — no specialization
        // Specialization only applies for level 3+ students
        const specCode = specialization ? specialization.toUpperCase() : null;
        const codePrefix = specCode || 'GEN';
        const code = await generateStudentCode(year, codePrefix, client);
        const student = (await client.query(
          `INSERT INTO students (user_id, student_code, enrollment_year, specialization, track)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [user.id, code, year, specCode, track]
        )).rows[0];

        // [C9-FIX] Auto-enroll freshman in Semester 1 courses if a registration semester is active
        const activeSem = (await client.query(`SELECT id FROM semesters WHERE status = 'registration' ORDER BY start_date DESC LIMIT 1`)).rows[0];
        console.log('AUTO-ENROLL TRIGGERED for student:', student.id, 'activeSem:', activeSem?.id);
        if (activeSem) {
          const insertRes = await client.query(
            `INSERT INTO enrollments (student_id, offering_id, semester_id, status)
             SELECT $1, co.id, $2, 'registered'
             FROM course_offerings co
             JOIN curriculum_plans cp ON cp.course_id = co.course_id
             JOIN courses c ON c.id = co.course_id
             WHERE co.semester_id = $2 AND cp.year_of_study = 1 AND cp.semester_in_year = 1 AND co.is_active = TRUE
             ON CONFLICT DO NOTHING`,
            [student.id, activeSem.id]
          );
          console.log('AUTO-ENROLL INSERT COUNT:', insertRes.rowCount);
        }

      } else if (role === 'doctor') {
        // [B5-FIX] Resolve departmentId — use provided or fall back to first available dept
        let resolvedDeptId = departmentId || null;
        if (!resolvedDeptId) {
          const firstDept = (await client.query(
            'SELECT id FROM departments WHERE is_active = TRUE ORDER BY code LIMIT 1'
          )).rows[0];
          resolvedDeptId = firstDept?.id || null;
        }

        await client.query(
          'INSERT INTO doctors (user_id, department_id, academic_title) VALUES ($1, $2, $3)',
          [user.id, resolvedDeptId, academicTitle || 'Dr.']
        );
      }

      return res.status(201).json({ success: true, message: 'User created successfully', data: { userId: user.id } });
    });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Email or national ID already exists' });
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { fullNameAr, fullNameEn, phone, isActive, specialization, academicStatus, academicTitle } = req.body;

    await query(
      `UPDATE users SET
         full_name_ar = COALESCE($1, full_name_ar),
         full_name_en = COALESCE($2, full_name_en),
         phone = COALESCE($3, phone),
         is_active = COALESCE($4, is_active),
         updated_at = NOW()
       WHERE id = $5`,
      [fullNameAr, fullNameEn, phone, isActive, userId]
    );
    if (specialization) await query('UPDATE students SET specialization = $1 WHERE user_id = $2', [specialization, userId]);
    if (academicStatus) await query('UPDATE students SET academic_status = $1 WHERE user_id = $2', [academicStatus, userId]);
    if (academicTitle) await query('UPDATE doctors SET academic_title = $1 WHERE user_id = $2', [academicTitle, userId]);

    return res.json({ success: true, message: 'User updated' });
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ success: false, message: 'newPassword required' });
    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1, must_change_pw = TRUE, updated_at = NOW() WHERE id = $2', [hash, userId]);
    return res.json({ success: true, message: 'Password reset. User must change on next login.' });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// BULK IMPORT EXCEL
// ─────────────────────────────────────────────────────────────────────────────
const validateUsersBulk = async (req, res, next) => {
  try {
    const { rows } = req.body;
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'لا توجد بيانات للتحقق' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allowedRoles = ['admin', 'doctor', 'student'];
    const previewData = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      // Normalize keys
      const row = {};
      Object.keys(r).forEach(k => { row[k.trim().toLowerCase()] = r[k]; });

      const arabic_name = (row.arabic_name || '').toString().trim();
      const english_name = (row.english_name || '').toString().trim();
      const email = (row.email || '').toString().trim().toLowerCase();
      const password = (row.password || '').toString();
      const role = (row.role || '').toString().trim().toLowerCase();
      const enrollment_year = parseInt(row.enrollment_year) || null;
      const specialization = (row.specialization || '').toString().trim().toUpperCase() || null;
      const department_id = parseInt(row.department_id) || null;
      const academic_title = (row.academic_title || '').toString().trim() || null;

      let isValid = true;
      const errors = [];

      if (!arabic_name) { isValid = false; errors.push('الاسم بالعربي مطلوب'); }
      if (!email) { isValid = false; errors.push('البريد مطلوب'); }
      else if (!emailRegex.test(email)) { isValid = false; errors.push('صيغة البريد غير صحيحة'); }
      if (!password || password.length < 6) { isValid = false; errors.push('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); }
      if (!allowedRoles.includes(role)) { isValid = false; errors.push(`صلاحية غير صالحة. المسموح: ${allowedRoles.join(', ')}`); }

      if (role === 'student') {
        if (!enrollment_year) {
          isValid = false;
          errors.push(`Row ${i + 2}: enrollmentYear is required for students`);
        } else if (enrollment_year < 2000 || enrollment_year > 2100) {
          isValid = false;
          errors.push('سنة الالتحاق غير صالحة');
        }
        if (!specialization) {
          isValid = false;
          errors.push(`Row ${i + 2}: specialization is required for students`);
        }
      } else if (role === 'doctor') {
        if (!department_id) {
          isValid = false;
          errors.push(`Row ${i + 2}: departmentId is required for doctors`);
        } else {
          const deptExist = await query('SELECT id FROM departments WHERE id = $1 AND is_active = TRUE', [department_id]);
          if (deptExist.rows.length === 0) {
            isValid = false;
            errors.push('القسم غير موجود أو غير مفعل');
          }
        }
      }

      // Check DB for duplicate email if format is ok
      if (email && emailRegex.test(email)) {
        const exist = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (exist.rows.length > 0) {
          isValid = false;
          errors.push('البريد الإلكتروني مسجل مسبقاً');
        }
      }

      previewData.push({
        rowNum: i + 2,
        arabic_name,
        english_name,
        email,
        password,
        role,
        enrollment_year,
        specialization,
        department_id,
        academic_title,
        isValid,
        errors
      });
    }

    return res.json({ success: true, data: previewData });
  } catch (err) { next(err); }
};

const bulkImportUsers = async (req, res, next) => {
  try {
    const { users } = req.body;
    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'لا توجد بيانات للاستيراد' });
    }

    let imported = 0;
    const failed = [];

    await withTransaction(async (client) => {
      for (let i = 0; i < users.length; i++) {
        const u = users[i];
        if (!u.isValid) {
          failed.push({ email: u.email, reason: 'تم تخطيه (غير صالح)' });
          continue;
        }

        const spName = `sp_user_${i}`;
        await client.query(`SAVEPOINT ${spName}`);

        try {
          const hash = await bcrypt.hash(u.password, 10);
          const resolvedEn = u.english_name && u.english_name.trim() ? u.english_name.trim() : u.arabic_name.trim();

          const resDb = await client.query(
            `INSERT INTO users (full_name_ar, full_name_en, email, password_hash, role, is_active, must_change_pw)
             VALUES ($1, $2, $3, $4, $5, TRUE, TRUE) RETURNING id`,
            [u.arabic_name.trim(), resolvedEn, u.email, hash, u.role]
          );
          const userId = resDb.rows[0].id;

          // Insert into role-specific tables
          if (u.role === 'student') {
            const year = u.enrollment_year || new Date().getFullYear();
            // Bulk-imported students default to GEN if specialization not provided
            const specCode = u.specialization || null;
            const codePrefix = specCode || 'GEN';
            const studentCode = await generateStudentCode(year, codePrefix, client);
            
            await client.query(
              'INSERT INTO students (user_id, student_code, enrollment_year, specialization) VALUES ($1, $2, $3, $4)',
              [userId, studentCode, year, specCode]
            );
          } else if (u.role === 'doctor') {
            let resolvedDeptId = u.department_id || null;
            if (!resolvedDeptId) {
              const firstDept = (await client.query(
                'SELECT id FROM departments WHERE is_active = TRUE ORDER BY code LIMIT 1'
              )).rows[0];
              resolvedDeptId = firstDept?.id || null;
            }
            await client.query(
              'INSERT INTO doctors (user_id, department_id, academic_title) VALUES ($1, $2, $3)',
              [userId, resolvedDeptId, u.academic_title || 'Dr.']
            );
          }
          // No separate table insert needed for admin role — admins are identified
          // solely by users.role = 'admin'. There is no 'admins' table in the schema.

          await client.query(`RELEASE SAVEPOINT ${spName}`);
          imported++;
        } catch (e) {
          await client.query(`ROLLBACK TO SAVEPOINT ${spName}`);
          console.error(`Bulk import row ${i} error:`, e.message || e);
          
          let reason = 'خطأ أثناء الحفظ';
          if (e.code === '23505') {
            reason = 'مستخدم موجود مسبقاً (الإيميل مكرر)';
          }
          failed.push({ email: u.email, reason });
        }
      }
    });

    return res.json({
      success: true,
      message: `تم استيراد ${imported} مستخدم بنجاح`,
      data: { imported, failedCount: failed.length, failed }
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
const getStudents = async (req, res, next) => {
  try {
    const { specialization, status, level, page = 1, limit = 25, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = `SELECT s.id, s.student_code, s.enrollment_year, s.specialization,
                      s.current_level, s.academic_status, s.cgpa,
                      s.total_credits_passed, s.semesters_enrolled,
                      s.consecutive_warnings, s.total_warnings,
                      u.email, u.full_name_ar, u.full_name_en, u.national_id, u.is_active
               FROM students s JOIN users u ON u.id = s.user_id WHERE 1=1`;
    const params = [];

    if (specialization) { params.push(specialization); sql += ` AND s.specialization = $${params.length}`; }
    if (status)         { params.push(status);         sql += ` AND s.academic_status = $${params.length}`; }
    if (level)          { params.push(level);           sql += ` AND s.current_level = $${params.length}`; }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (u.full_name_en ILIKE $${params.length} OR u.full_name_ar ILIKE $${params.length} OR s.student_code ILIKE $${params.length} OR u.national_id ILIKE $${params.length})`;
    }

    // Count query (without pagination)
    const countSql = sql.replace(
      'SELECT s.id, s.student_code, s.enrollment_year, s.specialization,\n                      s.current_level, s.academic_status, s.cgpa,\n                      s.total_credits_passed, s.semesters_enrolled,\n                      s.consecutive_warnings, s.total_warnings,\n                      u.email, u.full_name_ar, u.full_name_en, u.national_id, u.is_active',
      'SELECT COUNT(*)'
    );

    params.push(parseInt(limit)); sql += ` ORDER BY s.student_code LIMIT $${params.length}`;
    params.push(offset);          sql += ` OFFSET $${params.length}`;

    const [students, countRes] = await Promise.all([
      query(sql, params),
      query(countSql, params.slice(0, -2))
    ]);

    // Format student level
    students.rows.forEach(s => {
      s.current_level = bylawService.creditsToLevel(s.total_credits_passed).name_ar;
    });

    return res.json({
      success: true,
      data: {
        students: students.rows,
        total: parseInt(countRes.rows[0]?.count || 0),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) { next(err); }
};

const getStudentDetail = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = (await query(
      `SELECT s.*, u.email, u.full_name_ar, u.full_name_en, u.national_id, u.phone, u.is_active
       FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1`,
      [studentId]
    )).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const [transcript, gpaHistory, warnings] = await Promise.all([
      query(
        `SELECT t.*, sem.semester_type, ay.year_label 
         FROM v_student_transcript t
         JOIN semesters sem ON sem.id = t.semester_id
         LEFT JOIN academic_years ay ON ay.id = sem.academic_year_id
         WHERE t.student_id = $1 ORDER BY sem.start_date, t.course_code`, 
         [studentId]
      ),
      query(
        `SELECT sg.*, sem.label, sem.semester_type, ay.year_label 
         FROM semester_gpa_records sg
         JOIN semesters sem ON sem.id = sg.semester_id
         LEFT JOIN academic_years ay ON ay.id = sem.academic_year_id
         WHERE sg.student_id = $1 ORDER BY sem.start_date`,
        [studentId]
      ),
      query(
        `SELECT aw.*, sem.label as semester_label, sem.semester_type, ay.year_label
         FROM academic_warnings aw 
         JOIN semesters sem ON sem.id = aw.semester_id
         LEFT JOIN academic_years ay ON ay.id = sem.academic_year_id
         WHERE aw.student_id = $1 ORDER BY aw.issued_at DESC`,
        [studentId]
      )
    ]);

    const eligibility = await bylawService.checkGraduationEligibility(studentId);

    // Construct academicInfo
    const academicInfo = {
      cgpa: student.cgpa,
      totalCreditsPassed: student.total_credits_passed,
      consecutiveWarnings: student.consecutive_warnings,
      totalWarnings: student.total_warnings,
      academicStatus: student.academic_status,
      requiredCredits: eligibility.credits_required || 138,
      totalPoints: transcript.rows.reduce((sum, r) => sum + (Number(r.grade_points) * Number(r.credits) || 0), 0).toFixed(2)
    };

    // Group transcript into semesters array
    const semestersMap = new Map();
    
    // First map the gpaHistory to get semester summaries
    gpaHistory.rows.forEach(r => {
      const sId = r.semester_id;
      semestersMap.set(sId, {
        semesterId: sId,
        semesterName: r.label,
        yearLabel: r.year_label,
        gpa: r.semester_gpa,
        courses: []
      });
    });

    // Then push courses into their respective semesters
    transcript.rows.forEach(r => {
      const sId = r.semester_id;
      if (!semestersMap.has(sId)) {
        semestersMap.set(sId, {
          semesterId: sId,
          semesterName: r.semester_name,
          yearLabel: r.year_label,
          gpa: 0,
          courses: []
        });
      }
      semestersMap.get(sId).courses.push({
        enrollmentId: r.enrollment_id,
        courseCode: r.course_code,
        courseName: r.course_name_ar || r.course_name_en || r.course_name,
        credits: r.credits,
        totalGrade: r.total_grade,
        letterGrade: r.letter_grade
      });
    });

    const semesters = Array.from(semestersMap.values()).sort((a, b) => b.semesterId - a.semesterId);

    return res.json({
      success: true,
      data: { 
        student, 
        academicInfo,
        semesters,
        transcript: transcript.rows, 
        gpaHistory: gpaHistory.rows, 
        warnings: warnings.rows, 
        eligibility, 
        graduationEligibility: eligibility 
      }
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// SEMESTER MANAGEMENT
// [B2-FIX] Status change triggers notifications
// ─────────────────────────────────────────────────────────────────────────────
const getSemesters = async (req, res, next) => {
  try {
    const sems = (await query(
      'SELECT s.*, ay.year_label FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id ORDER BY s.start_date DESC'
    )).rows;
    
    // Format semester label and compute dynamic status
    sems.forEach(s => { 
      s.label = bylawService.getSemesterLabel(s.semester_type, s.year_label) || s.label; 
      s.status = bylawService.computeSemesterStatus(s);
    });
    
    return res.json({ success: true, data: sems });
  } catch (err) { next(err); }
};

// IT-1: Create new semester (finds/creates academic_year automatically)
const createSemester = async (req, res, next) => {
  try {
    const {
      yearLabel,           // e.g. "2025-2026"
      semesterType,        // first | second | summer
      label,               // e.g. "First Semester 2025"
      startDate,
      endDate,
      registrationStart,
      registrationEnd,
      addDropDeadline,
      withdrawalDeadline,
      examStart,
      examEnd,
      minCredits = 2,
      maxCreditsDefault = 20,
    } = req.body;

    if (!yearLabel || !semesterType || !label || !startDate || !endDate ||
        !registrationStart || !registrationEnd) {
      return res.status(400).json({ success: false, message: 'yearLabel, semesterType, label, startDate, endDate, registrationStart, registrationEnd are required' });
    }

    const validTypes = ['first', 'second', 'summer'];
    if (!validTypes.includes(semesterType)) {
      return res.status(400).json({ success: false, message: 'semesterType must be first, second, or summer' });
    }

    // Find or create academic year
    let ayRow = (await query('SELECT id FROM academic_years WHERE year_label = $1', [yearLabel])).rows[0];
    if (!ayRow) {
      const yr = yearLabel.split('-');
      ayRow = (await query(
        'INSERT INTO academic_years (year_label, start_date, end_date) VALUES ($1, $2, $3) RETURNING id',
        [yearLabel, `${yr[0]}-09-01`, `${yr[1] || (+yr[0]+1)}-07-31`]
      )).rows[0];
    }

    // addDropDeadline defaults to 14 days after registrationStart
    const addDrop = addDropDeadline ||
      new Date(new Date(registrationStart).getTime() + 14 * 86400000).toISOString().slice(0, 10);
    // withdrawalDeadline defaults to 7 weeks after startDate
    const withdraw = withdrawalDeadline ||
      new Date(new Date(startDate).getTime() + 49 * 86400000).toISOString().slice(0, 10);

    const sem = (await query(
      `INSERT INTO semesters
         (academic_year_id, semester_type, label, status, start_date, end_date,
          registration_start, registration_end, add_drop_deadline, withdrawal_deadline,
          exam_start, exam_end, min_credits, max_credits_default)
       VALUES ($1,$2,$3,'upcoming',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [ayRow.id, semesterType, label, startDate, endDate,
       registrationStart, registrationEnd, addDrop, withdraw,
       examStart || null, examEnd || null, minCredits, maxCreditsDefault]
    )).rows[0];

    return res.status(201).json({ success: true, message: 'Semester created', data: { ...sem, year_label: yearLabel } });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'A semester of this type already exists for this academic year' });
    next(err);
  }
};

const updateSemesterStatus = async (req, res, next) => {
  try {
    const { semesterId } = req.params;
    const { status } = req.body;
    const validStatuses = ['upcoming', 'registration', 'active', 'grading', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const semester = (await query('SELECT * FROM semesters WHERE id = $1', [semesterId])).rows[0];
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });

    await query('UPDATE semesters SET status = $1 WHERE id = $2', [status, semesterId]);

    // [B2-FIX] Dispatch notifications based on transition
    if (status === 'registration') {
      notifService.onRegistrationOpened(semester.label);
    } else if (status === 'grading') {
      notifService.onGradingPeriodStarted(semester.label);
    }

    return res.json({ success: true, message: `Semester status updated to ${status}` });
  } catch (err) { next(err); }
};

const finalizeSemester = async (req, res, next) => {
  try {
    const { semesterId } = req.params;
    // Guard: only finalize semesters in 'grading' status
    const sem = (await query('SELECT * FROM semesters WHERE id = $1', [semesterId])).rows[0];
    if (!sem) return res.status(404).json({ success:false, message:'Semester not found' });
    
    const computedStatus = bylawService.computeSemesterStatus(sem);
    
    if (computedStatus !== 'grading') {
      return res.status(400).json({
        success: false,
        message: `لا يمكن إنهاء الفصل إلا عندما يكون في حالة الدرجات. الحالة الحالية: ${computedStatus}`,
      });
    }
    const result = await registrationService.finalizeSemester(semesterId, req.user.id);
    return res.json({ success: true, message: 'Semester finalized', data: result });
  } catch (err) {
    if (err.message) return res.status(400).json({ success: false, message: err.message });
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COURSE OFFERINGS
// ─────────────────────────────────────────────────────────────────────────────
// [FIX-SCHED-1] Helper: checks whether `doctorId` already has a schedule slot that
// overlaps with any slot in `slots` array [{day, startTime, endTime}], optionally
// excluding `excludeOfferingId` (used during updates).
async function checkDoctorScheduleConflict(client, doctorId, slots, excludeOfferingId = null) {
  if (!doctorId || !slots || slots.length === 0) return null;
  for (const slot of slots) {
    const conflict = (await client.query(
      `SELECT dss.offering_id, c.code AS course_code, dss.day_of_week, dss.start_time, dss.end_time
       FROM doctor_schedule_slots dss
       JOIN course_offerings co ON co.id = dss.offering_id
       JOIN courses c ON c.id = co.course_id
       WHERE co.doctor_id = $1
         AND dss.day_of_week = $2
         AND dss.start_time < $4::time          -- existing starts before new ends
         AND dss.end_time   > $3::time          -- existing ends   after new starts
         ${excludeOfferingId ? 'AND dss.offering_id != $5' : ''}`,
      excludeOfferingId
        ? [doctorId, slot.day, slot.startTime, slot.endTime, excludeOfferingId]
        : [doctorId, slot.day, slot.startTime, slot.endTime]
    )).rows[0];
    if (conflict) {
      return `تعارض في الجدول: الدكتور لديه محاضرة (${conflict.course_code}) في نفس الوقت (${conflict.day_of_week} ${conflict.start_time}–${conflict.end_time})`;
    }
  }
  return null;
}

const createOffering = async (req, res, next) => {
  try {
    const { semesterId, courseId, doctorId, capacity = 60, schedule, room } = req.body;
    if (!semesterId || !courseId) {
      return res.status(400).json({ success: false, message: 'semesterId and courseId required' });
    }
    
    return withTransaction(async (client) => {
      // [FIX-SCHED-2] Check for doctor schedule conflicts BEFORE inserting.
      if (doctorId && schedule && schedule.length > 0) {
        const conflict = await checkDoctorScheduleConflict(client, doctorId, schedule);
        if (conflict) return res.status(409).json({ success: false, message: conflict });
      }

      const offering = (await client.query(
        'INSERT INTO course_offerings (semester_id, course_id, doctor_id, capacity, schedule, room) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [semesterId, courseId, doctorId || null, capacity, schedule ? JSON.stringify(schedule) : null, room || null]
      )).rows[0];

      if (schedule && schedule.length > 0) {
        for (const slot of schedule) {
          await client.query(
            `INSERT INTO doctor_schedule_slots
               (offering_id, day_of_week, start_time, end_time, room, session_type)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (offering_id, day_of_week, start_time) DO UPDATE
               SET end_time = EXCLUDED.end_time,
                   room     = EXCLUDED.room,
                   session_type = EXCLUDED.session_type`,
            [offering.id, slot.day, slot.startTime, slot.endTime, slot.room || room || null, slot.type || 'lecture']
          );
        }
      }

      // [B2-FIX] Notify assigned doctor
      if (doctorId) {
        const doctorUser = (await client.query(
          'SELECT u.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE d.id = $1', [doctorId]
        )).rows[0];
        const courseInfo = (await client.query('SELECT code, name_en FROM courses WHERE id = $1', [courseId])).rows[0];
        const semInfo = (await client.query('SELECT label FROM semesters WHERE id = $1', [semesterId])).rows[0];
        if (doctorUser && courseInfo && semInfo) {
          await notifService.onCourseAssigned(
            doctorUser.id, courseInfo.code, courseInfo.name_en, semInfo.label
          );
        }
      }

      return res.status(201).json({ success: true, data: offering });
    });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Offering already exists for this semester/course' });
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ANNOUNCEMENTS
// [B2-FIX] createAnnouncement dispatches notifications
// ─────────────────────────────────────────────────────────────────────────────
const createAnnouncement = async (req, res, next) => {
  try {
    const title = req.body.title || req.body.titleAr || req.body.title_ar;
    const body  = req.body.body  || req.body.bodyAr  || req.body.body_ar;
    const { targetRole, isPinned, expiresAt } = req.body;
    if (!title || !body) return res.status(400).json({ success: false, message: 'title (or titleAr) and body (or bodyAr) required' });

    const ann = (await query(
      'INSERT INTO announcements (title, body, target_role, created_by, is_pinned, expires_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, body, (targetRole && targetRole !== 'all') ? targetRole : null, req.user.id, isPinned || false, expiresAt || null]
    )).rows[0];

    // [B2-FIX] Dispatch non-blocking notifications to target audience
    notifService.onAnnouncementPublished(ann.id, title, targetRole || null);

    return res.status(201).json({ success: true, data: ann });
  } catch (err) { next(err); }
};

const getAnnouncements = async (req, res, next) => {
  try {
    const anns = (await query(
      `SELECT a.*, u.full_name_en as created_by_name
       FROM announcements a LEFT JOIN users u ON u.id = a.created_by
       WHERE (expires_at IS NULL OR expires_at > NOW())
       ORDER BY is_pinned DESC, created_at DESC LIMIT 50`
    )).rows;
    return res.json({ success: true, data: anns });
  } catch (err) { next(err); }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const { announcementId } = req.params;
    const result = await query('DELETE FROM announcements WHERE id = $1 RETURNING id', [announcementId]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Announcement not found' });
    return res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────────────────────
const getAcademicReport = async (req, res, next) => {
  try {
    const [topStudents, dismissedStudents, gpaDistribution, levelStats] = await Promise.all([
      query(
        `SELECT s.student_code, u.full_name_ar, u.full_name_en, s.specialization, s.cgpa,
                s.total_credits_passed, s.current_level, s.semesters_enrolled
         FROM students s JOIN users u ON u.id = s.user_id
         WHERE s.academic_status IN ('active','graduated')
         ORDER BY s.cgpa DESC LIMIT 20`
      ),
      query(
        `SELECT s.student_code, u.full_name_ar, u.full_name_en, s.specialization, s.cgpa,
                s.total_warnings, s.semesters_enrolled
         FROM students s JOIN users u ON u.id = s.user_id
         WHERE s.academic_status = 'dismissed'
         ORDER BY s.student_code`
      ),
      query(
        `SELECT
           COUNT(*) FILTER (WHERE cgpa >= 3.5)::int as excellent,
           COUNT(*) FILTER (WHERE cgpa >= 3.0 AND cgpa < 3.5)::int as very_good,
           COUNT(*) FILTER (WHERE cgpa >= 2.5 AND cgpa < 3.0)::int as good,
           COUNT(*) FILTER (WHERE cgpa >= 2.0 AND cgpa < 2.5)::int as satisfactory,
           COUNT(*) FILTER (WHERE cgpa < 2.0)::int as below_average
         FROM students WHERE academic_status IN ('active','warning')`
      ),
      query(
        `SELECT current_level, COUNT(*)::int as count, ROUND(AVG(cgpa), 3) as avg_cgpa
         FROM students WHERE academic_status IN ('active','warning','probation')
         GROUP BY current_level ORDER BY current_level`
      ),
    ]);

    return res.json({
      success: true,
      data: {
        topStudents: topStudents.rows,
        dismissedStudents: dismissedStudents.rows,
        gpaDistribution: gpaDistribution.rows[0],
        levelStats: levelStats.rows,
      }
    });
  } catch (err) { next(err); }
};

// NOTE: Additional exports appended below via Object.assign — see end of file

// ─────────────────────────────────────────────────────────────────────────────
// COURSE MANAGEMENT  [C6-FIX]
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/courses — list all courses with offering counts
 */
const getCourses = async (req, res, next) => {
  try {
    const { department, level, category, active } = req.query;
    let sql = `
      SELECT c.*, dep.code as dept_code, dep.name_en as dept_name,
             COUNT(DISTINCT cp.prereq_course_id) as prereq_count
      FROM courses c
      LEFT JOIN departments dep ON dep.id = c.department_id
      LEFT JOIN course_prerequisites cp ON cp.course_id = c.id
      WHERE 1=1`;
    const params = [];
    if (department) { params.push(department); sql += ` AND dep.code = $${params.length}`; }
    if (level)      { params.push(parseInt(level)); sql += ` AND c.level = $${params.length}`; }
    if (category)   { params.push(category); sql += ` AND c.category::text = $${params.length}::text`; }
    if (active !== undefined) { params.push(active === 'true'); sql += ` AND c.is_active = $${params.length}`; }
    sql += ' GROUP BY c.id, dep.code, dep.name_en ORDER BY c.level, c.code';
    const result = await query(sql, params);
    return res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

/**
 * POST /admin/courses — create a new course
 */
const createCourse = async (req, res, next) => {
  try {
    const {
      code, nameAr, nameEn, credits, category, departmentCode,
      level, isMandatory = true, isCreditBearing = true, description
    } = req.body;

    if (!code || !nameAr || !nameEn || credits === undefined || !category || !level) {
      return res.status(400).json({ success: false, message: 'code, nameAr, nameEn, credits, category, level required' });
    }

    const deptResult = departmentCode
      ? (await query('SELECT id FROM departments WHERE code = $1', [departmentCode])).rows[0]
      : null;

    const course = (await query(
      `INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_credit_bearing, description)
       VALUES ($1, $2, $3, $4, $5::course_category, $6, $7, $8, $9, $10) RETURNING *`,
      [code.toUpperCase(), nameAr, nameEn, credits, category, deptResult?.id || null, level, isMandatory, isCreditBearing, description || null]
    )).rows[0];

    return res.status(201).json({ success: true, message: 'Course created', data: course });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Course code already exists' });
    next(err);
  }
};

/**
 * PATCH /admin/courses/:courseId — update a course
 */
const updateCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { nameAr, nameEn, credits, category, level, isMandatory, isActive, description } = req.body;

    const course = (await query(
      `UPDATE courses SET
         name_ar = COALESCE($1, name_ar),
         name_en = COALESCE($2, name_en),
         credits = COALESCE($3, credits),
         category = COALESCE($4::course_category, category),
         level = COALESCE($5, level),
         is_mandatory = COALESCE($6, is_mandatory),
         is_active = COALESCE($7, is_active),
         description = COALESCE($8, description)
       WHERE id = $9 RETURNING *`,
      [nameAr, nameEn, credits, category, level, isMandatory, isActive, description, courseId]
    )).rows[0];

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    return res.json({ success: true, data: course });
  } catch (err) { next(err); }
};

/**
 * DELETE /admin/courses/:courseId — soft delete (deactivate)
 */
const deleteCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    // Check for active enrollments
    const activeEnrollments = (await query(
      `SELECT COUNT(*) FROM enrollments e
       JOIN course_offerings co ON co.id = e.offering_id
       WHERE co.course_id = $1 AND e.status = 'registered'`,
      [courseId]
    )).rows[0].count;

    if (parseInt(activeEnrollments) > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot deactivate: ${activeEnrollments} students currently registered in this course`
      });
    }

    await query('UPDATE courses SET is_active = FALSE WHERE id = $1', [courseId]);
    return res.json({ success: true, message: 'Course deactivated' });
  } catch (err) { next(err); }
};

/**
 * POST /admin/courses/:courseId/prerequisites — add prerequisite
 */
const addPrerequisite = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { prereqCourseId, isStrict = true } = req.body;
    if (!prereqCourseId) return res.status(400).json({ success: false, message: 'prereqCourseId required' });
    // Prevent circular dependency
    if (prereqCourseId === courseId) return res.status(400).json({ success: false, message: 'Course cannot be its own prerequisite' });
    await query(
      'INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [courseId, prereqCourseId, isStrict]
    );
    return res.json({ success: true, message: 'Prerequisite added' });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN COURSE OFFERINGS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/offerings — list course offerings (with filters)
 */
const getOfferings = async (req, res, next) => {
  try {
    const { semesterId, courseId, doctorId } = req.query;
    let sql = `
      SELECT co.*, c.code, c.name_en, c.name_ar, c.credits, c.level,
             u.full_name_en as doctor_name, u.full_name_ar as doctor_name_ar,
             sem.label as semester_label, sem.status as semester_status,
             (SELECT json_agg(json_build_object(
               'id', dss.id, 'day', dss.day_of_week,
               'start', dss.start_time::text, 'end', dss.end_time::text,
               'room', dss.room, 'type', dss.session_type
             ) ORDER BY dss.day_of_week, dss.start_time)
              FROM doctor_schedule_slots dss WHERE dss.offering_id = co.id) as schedule_slots
      FROM course_offerings co
      JOIN courses c ON c.id = co.course_id
      LEFT JOIN doctors d ON d.id = co.doctor_id
      LEFT JOIN users u ON u.id = d.user_id
      JOIN semesters sem ON sem.id = co.semester_id
      WHERE 1=1`;
    const params = [];
    if (semesterId) { params.push(semesterId); sql += ` AND co.semester_id = $${params.length}`; }
    if (courseId)   { params.push(courseId);   sql += ` AND co.course_id = $${params.length}`; }
    if (doctorId)   { params.push(doctorId);   sql += ` AND co.doctor_id = $${params.length}`; }
    sql += ' ORDER BY sem.start_date DESC, c.level, c.code';
    const result = await query(sql, params);
    return res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

/**
 * PATCH /admin/offerings/:offeringId — update an offering (capacity, doctor, schedule)
 */
const updateOffering = async (req, res, next) => {
  try {
    const { offeringId } = req.params;
    const { capacity, doctorId, schedule, room, isActive } = req.body;

    return withTransaction(async (client) => {
      // [FIX-SCHED-3] When updating doctor or schedule, check for conflicts.
      // Determine effective doctorId: use supplied value or fall back to existing.
      let effectiveDoctorId = doctorId;
      if (!effectiveDoctorId) {
        const cur = (await client.query('SELECT doctor_id FROM course_offerings WHERE id = $1', [offeringId])).rows[0];
        effectiveDoctorId = cur?.doctor_id;
      }
      if (effectiveDoctorId && schedule && schedule.length > 0) {
        const conflict = await checkDoctorScheduleConflict(client, effectiveDoctorId, schedule, offeringId);
        if (conflict) return res.status(409).json({ success: false, message: conflict });
      }

      const offering = (await client.query(
        `UPDATE course_offerings SET
           capacity = COALESCE($1, capacity),
           doctor_id = COALESCE($2::uuid, doctor_id),
           schedule = COALESCE($3::jsonb, schedule),
           room = COALESCE($4, room),
           is_active = COALESCE($5, is_active)
         WHERE id = $6 RETURNING *`,
        [capacity, doctorId || null, schedule ? JSON.stringify(schedule) : null, room, isActive, offeringId]
      )).rows[0];

      if (!offering) return res.status(404).json({ success: false, message: 'Offering not found' });

      if (schedule && schedule.length > 0) {
        // Since we are updating, it's safer to clear existing and recreate or rely on ON CONFLICT
        // The user spec said ON CONFLICT DO UPDATE, which implies we should keep existing ones.
        // However, if a slot was removed from the schedule array, it would not be deleted here.
        // For now, I am strictly following the user's provided insert/upsert pattern:
        for (const slot of schedule) {
          await client.query(
            `INSERT INTO doctor_schedule_slots
               (offering_id, day_of_week, start_time, end_time, room, session_type)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (offering_id, day_of_week, start_time) DO UPDATE
               SET end_time = EXCLUDED.end_time,
                   room     = EXCLUDED.room,
                   session_type = EXCLUDED.session_type`,
            [offeringId, slot.day, slot.startTime, slot.endTime, slot.room || room || null, slot.type || 'lecture']
          );
        }
      }

      return res.json({ success: true, data: offering });
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN STUDENT ENROLLMENT OVERRIDE  [C7-FIX]
// Admin can enroll a student in ANY course, bypassing bylaw checks
// This is the "sudo" override for edge cases (late enrollment, makeup, etc.)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /admin/students/:studentId/enroll
 * Admin manual enrollment — bypasses credit limits, prerequisites, registration window
 */
const adminEnrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { offeringId, reason = 'Admin override enrollment' } = req.body;

    if (!offeringId) return res.status(400).json({ success: false, message: 'offeringId required' });

    const student = (await query('SELECT * FROM students WHERE id = $1', [studentId])).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    if (['dismissed', 'graduated', 'withdrawn'].includes(student.academic_status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot enroll student with status: ${student.academic_status}`
      });
    }

    const offering = (await query(
      `SELECT co.*, c.code, c.name_en, sem.label as sem_label, sem.id as semester_id
       FROM course_offerings co
       JOIN courses c ON c.id = co.course_id
       JOIN semesters sem ON sem.id = co.semester_id
       WHERE co.id = $1`,
      [offeringId]
    )).rows[0];
    if (!offering) return res.status(404).json({ success: false, message: 'Offering not found' });

    // Check if already enrolled
    const existing = (await query(
      "SELECT id FROM enrollments WHERE student_id = $1 AND offering_id = $2 AND status IN ('registered','completed')",
      [studentId, offeringId]
    )).rows[0];
    if (existing) return res.status(409).json({ success: false, message: 'Student already enrolled in this course' });

    const enrollment = (await query(
      `INSERT INTO enrollments (student_id, offering_id, semester_id, status, admin_override, admin_override_reason, admin_override_by)
       VALUES ($1, $2, $3, 'registered', TRUE, $4, $5) RETURNING *`,
      [studentId, offeringId, offering.semester_id, reason, req.user.id]
    )).rows[0];

    // Initialize attendance record
    await query(
      'INSERT INTO attendance_summary (enrollment_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [enrollment.id]
    );

    // Notify student of admin enrollment
    const studentUser = (await query('SELECT u.id FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1', [studentId])).rows[0];
    if (studentUser) {
      await query(
        'INSERT INTO notifications (user_id, title, message, link) VALUES ($1, $2, $3, $4)',
        [
          studentUser.id,
          `Enrolled: ${offering.code}`,
          `You have been enrolled in "${offering.name_en}" (${offering.sem_label}) by the administration. Reason: ${reason}`,
          '/student/schedule'
        ]
      );
    }

    return res.status(201).json({
      success: true,
      message: `Student enrolled in ${offering.code} via admin override`,
      data: { enrollment, offering }
    });
  } catch (err) { next(err); }
};

/**
 * DELETE /admin/students/:studentId/enroll/:enrollmentId
 * Admin force-drop (can drop even outside add/drop window, with reason)
 */
const adminForceDropStudent = async (req, res, next) => {
  try {
    const { studentId, enrollmentId } = req.params;
    const { reason = 'Admin force drop' } = req.body;

    const enrollment = (await query(
      `SELECT e.*, c.code, c.name_en
       FROM enrollments e
       JOIN course_offerings co ON co.id = e.offering_id
       JOIN courses c            ON c.id  = co.course_id
       WHERE e.id = $1
         AND e.student_id = $2`,
      [enrollmentId, studentId]
    )).rows[0];
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    await query(
      "UPDATE enrollments SET status = 'dropped', withdrawn_at = NOW(), withdrawal_reason = $1 WHERE id = $2",
      [reason, enrollmentId]
    );

    // Notify student
    const studentUser = (await query('SELECT u.id FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = $1', [studentId])).rows[0];
    if (studentUser) {
      await query(
        'INSERT INTO notifications (user_id, title, message, link) VALUES ($1, $2, $3, $4)',
        [
          studentUser.id,
          `Course Dropped: ${enrollment.code}`,
          `You have been removed from "${enrollment.name_en}" by the administration. Reason: ${reason}`,
          '/student/schedule'
        ]
      );
    }

    return res.json({ success: true, message: 'Student force-dropped from course' });
  } catch (err) { next(err); }
};

/**
 * GET /admin/students/:studentId/enrollments — view all enrollments for a student
 */
const getStudentEnrollments = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { semesterId } = req.query;

    let sql = `
      SELECT e.*, c.code, c.name_en, c.credits, c.level, c.category,
             sem.label as semester_label, sem.status as semester_status,
             u.full_name_en as doctor_name
      FROM enrollments e
      JOIN course_offerings co ON co.id = e.offering_id
      JOIN courses c ON c.id = co.course_id
      JOIN semesters sem ON sem.id = e.semester_id
      LEFT JOIN doctors d ON d.id = co.doctor_id
      LEFT JOIN users u ON u.id = d.user_id
      WHERE e.student_id = $1`;
    const params = [studentId];
    if (semesterId) { params.push(semesterId); sql += ` AND e.semester_id = $${params.length}`; }
    sql += ' ORDER BY sem.start_date DESC, c.code';

    const result = await query(sql, params);
    return res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

/**
 * GET /admin/registration/status — get registration status across all active semesters
 */
const getRegistrationStatus = async (req, res, next) => {
  try {
    const semesters = (await query(
      `SELECT s.*, ay.year_label,
              COUNT(DISTINCT e.student_id) FILTER (WHERE e.status = 'registered') as registered_students,
              COUNT(e.id) FILTER (WHERE e.status = 'registered') as total_enrollments
       FROM semesters s
       JOIN academic_years ay ON ay.id = s.academic_year_id
       LEFT JOIN enrollments e ON e.semester_id = s.id
       WHERE s.status NOT IN ('closed')
       GROUP BY s.id, ay.year_label
       ORDER BY s.start_date DESC`
    )).rows;

    return res.json({ success: true, data: semesters });
  } catch (err) { next(err); }
};

/**
 * POST /admin/registration/open — open registration for a semester
 * POST /admin/registration/close — close registration for a semester
 */
const toggleRegistration = async (req, res, next) => {
  try {
    const { semesterId, action } = req.body; // action: 'open' | 'close'
    if (!semesterId || !['open', 'close'].includes(action)) {
      return res.status(400).json({ success: false, message: 'semesterId and action (open|close) required' });
    }

    const newStatus = action === 'open' ? 'registration' : 'active';
    const semester = (await query(
      'UPDATE semesters SET status = $1 WHERE id = $2 RETURNING *',
      [newStatus, semesterId]
    )).rows[0];
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });

    // Notify all students when registration opens
    if (action === 'open') {
      await query(
        `INSERT INTO notifications (user_id, title, message, link)
         SELECT u.id,
           'Registration Open: ' || $1,
           'Course registration for ' || $1 || ' is now open. Log in to register before the deadline: ' || $2::date,
           '/student/courses'
         FROM users u WHERE u.role = 'student' AND u.is_active = TRUE`,
        [semester.label, semester.registration_end]
      );
    }

    return res.json({
      success: true,
      message: `Registration ${action === 'open' ? 'opened' : 'closed'} for ${semester.label}`,
      data: semester
    });
  } catch (err) { next(err); }
};

module.exports = {
  // Original
  getDashboard, getUsers, createUser, updateUser, resetPassword,
  validateUsersBulk, bulkImportUsers,
  getStudents, getStudentDetail,
  getSemesters, createSemester, updateSemesterStatus, finalizeSemester,
  createOffering, createAnnouncement, getAnnouncements, deleteAnnouncement, getAcademicReport,
  // [C6-FIX] Course management
  getCourses, createCourse, updateCourse, deleteCourse, addPrerequisite,
  // Offerings management
  getOfferings, updateOffering,
  // [C7-FIX] Admin student enrollment override
  adminEnrollStudent, adminForceDropStudent, getStudentEnrollments,
  // Registration control
  getRegistrationStatus, toggleRegistration,
};
