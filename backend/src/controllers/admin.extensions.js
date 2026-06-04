// =============================================================================
// Admin Controller — Extensions v3
// New capabilities:
//   • Curriculum plan CRUD (academic plan per year/semester/specialization)
//   • Bylaw config read/update with audit logging
//   • Department CRUD
//   • Doctor schedule slot assignment
//   • Enhanced offering management (schedule, room, capacity)
//   • Notification detail endpoint (all roles)
//   • Prerequisite management UI
// =============================================================================
const { query, withTransaction } = require('../config/database');
const notifService = require('../services/notification.service');
const logger = require('../utils/logger');
const bylawService = require('../services/bylaw.service');

// ─────────────────────────────────────────────────────────────────────────────
// CURRICULUM PLANS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/curriculum
 * Get full curriculum plan, optionally filtered by specialization
 */
const getCurriculumPlan = async (req, res, next) => {
  try {
    const { specialization = 'GENERAL' } = req.query;

    const rows = (await query(
      `SELECT cp.id, cp.specialization, cp.year_of_study, cp.semester_in_year,
              cp.is_mandatory, cp.display_order, cp.notes,
              c.id AS course_id, c.code, c.name_ar, c.name_en,
              c.credits, c.category, c.level, c.is_credit_bearing, c.is_active,
              (SELECT COUNT(*) FROM course_prerequisites WHERE course_id = c.id) AS prereq_count,
              (SELECT STRING_AGG(pc.code, ', ')
               FROM course_prerequisites cp2
               JOIN courses pc ON pc.id = cp2.prereq_course_id
               WHERE cp2.course_id = c.id) AS prereq_codes
       FROM curriculum_plans cp
       JOIN courses c ON c.id = cp.course_id
       WHERE cp.specialization = $1
       ORDER BY cp.year_of_study, cp.semester_in_year, cp.display_order, c.code`,
      [specialization]
    )).rows;

    // Group by year then semester
    const grouped = {};
    for (const row of rows) {
      const yearKey = `year_${row.year_of_study}`;
      const semKey = `sem_${row.semester_in_year}`;
      if (!grouped[yearKey]) grouped[yearKey] = { year: row.year_of_study, semesters: {} };
      if (!grouped[yearKey].semesters[semKey]) {
        grouped[yearKey].semesters[semKey] = { semester: row.semester_in_year, courses: [] };
      }
      grouped[yearKey].semesters[semKey].courses.push(row);
    }

    // Get all available specializations
    const specs = (await query(
      'SELECT DISTINCT specialization FROM curriculum_plans ORDER BY specialization'
    )).rows.map(r => r.specialization);

    return res.json({
      success: true,
      data: {
        specialization,
        grouped: Object.values(grouped).map(y => ({
          ...y,
          semesters: Object.values(y.semesters)
        })),
        flat: rows,
        specializations: specs,
        total: rows.length,
      }
    });
  } catch (err) { next(err); }
};

/**
 * POST /admin/curriculum
 * Add course to curriculum plan
 */
const addCourseToCurriculum = async (req, res, next) => {
  try {
    const { specialization, yearOfStudy, semesterInYear, courseId, isMandatory = true, displayOrder = 0, notes } = req.body;
    if (!specialization || !yearOfStudy || !semesterInYear || !courseId) {
      return res.status(400).json({ success: false, message: 'specialization, yearOfStudy, semesterInYear, courseId required' });
    }

    const course = (await query('SELECT * FROM courses WHERE id = $1', [courseId])).rows[0];
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // [FINAL-BASELINE] ON CONFLICT target matches the authoritative 4-col
    // constraint created by FINAL_AUTHORITATIVE_BASELINE.sql (Step 1).
    // Constraint: uq_curriculum_spec_year_sem_course
    // (specialization, year_of_study, semester_in_year, course_id)
    const row = (await query(
      `INSERT INTO curriculum_plans (specialization, year_of_study, semester_in_year, course_id, is_mandatory, display_order, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT ON CONSTRAINT uq_curriculum_spec_year_sem_course DO UPDATE SET
         is_mandatory = EXCLUDED.is_mandatory,
         display_order = EXCLUDED.display_order,
         notes = EXCLUDED.notes,
         updated_at = NOW()
       RETURNING *`,
      [specialization, yearOfStudy, semesterInYear, courseId, isMandatory, displayOrder, notes, req.user.id]
    )).rows[0];

    logger.info('Course added to curriculum plan', { specialization, courseId, adminId: req.user.id });
    return res.status(201).json({ success: true, data: row, message: 'Course added to curriculum plan' });
  } catch (err) { next(err); }
};

/**
 * PUT /admin/curriculum/:planId
 * Update curriculum plan entry
 */
const updateCurriculumEntry = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const { yearOfStudy, semesterInYear, isMandatory, displayOrder, notes } = req.body;

    const row = (await query(
      `UPDATE curriculum_plans SET
         year_of_study = COALESCE($1, year_of_study),
         semester_in_year = COALESCE($2, semester_in_year),
         is_mandatory = COALESCE($3, is_mandatory),
         display_order = COALESCE($4, display_order),
         notes = COALESCE($5, notes),
         updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [yearOfStudy, semesterInYear, isMandatory, displayOrder, notes, planId]
    )).rows[0];

    if (!row) return res.status(404).json({ success: false, message: 'Plan entry not found' });
    return res.json({ success: true, data: row });
  } catch (err) { next(err); }
};

/**
 * DELETE /admin/curriculum/:planId
 * Remove course from curriculum plan
 */
const removeCourseFromCurriculum = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const row = (await query('DELETE FROM curriculum_plans WHERE id = $1 RETURNING *', [planId])).rows[0];
    if (!row) return res.status(404).json({ success: false, message: 'Plan entry not found' });
    return res.json({ success: true, message: 'Course removed from curriculum plan' });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// BYLAW CONFIG
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/bylaw-config
 * Get all configurable bylaw parameters
 */
const getBylawConfig = async (req, res, next) => {
  try {
    const rows = (await query(
      `SELECT bc.*, u.full_name_en as updated_by_name
       FROM bylaw_config bc
       LEFT JOIN users u ON u.id = bc.updated_by
       WHERE bc.is_active = TRUE
       ORDER BY bc.category, bc.key`
    )).rows;

    const byCategory = {};
    for (const row of rows) {
      if (!byCategory[row.category]) byCategory[row.category] = [];
      byCategory[row.category].push(row);
    }

    return res.json({ success: true, data: { params: rows, byCategory } });
  } catch (err) { next(err); }
};

/**
 * PUT /admin/bylaw-config/:key
 * Update a single bylaw parameter (admin override)
 */
const updateBylawConfig = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    if (value === undefined || value === null || value === '') {
      return res.status(400).json({ success: false, message: 'value is required' });
    }

    const existing = (await query('SELECT * FROM bylaw_config WHERE key = $1', [key])).rows[0];
    if (!existing) return res.status(404).json({ success: false, message: 'Bylaw config key not found' });

    // Validate numeric bounds
    if (existing.value_type === 'number') {
      const num = parseFloat(value);
      if (isNaN(num)) return res.status(400).json({ success: false, message: 'Value must be a number' });
      if (existing.min_value !== null && num < existing.min_value) {
        return res.status(400).json({ success: false, message: `Value cannot be less than ${existing.min_value}` });
      }
      if (existing.max_value !== null && num > existing.max_value) {
        return res.status(400).json({ success: false, message: `Value cannot exceed ${existing.max_value}` });
      }
    }

    const updated = (await query(
      `UPDATE bylaw_config SET value = $1, updated_by = $2, updated_at = NOW() WHERE key = $3 RETURNING *`,
      [String(value), req.user.id, key]
    )).rows[0];

    bylawService.clearBylawCache();

    logger.info('Bylaw config updated', { key, oldValue: existing.value, newValue: value, adminId: req.user.id });
    return res.json({
      success: true,
      data: updated,
      message: `Bylaw parameter "${key}" updated from ${existing.value} to ${value}`
    });
  } catch (err) { next(err); }
};

/**
 * POST /admin/bylaw-config/:key/reset
 * Reset a bylaw parameter to its default value
 */
const resetBylawConfig = async (req, res, next) => {
  try {
    const { key } = req.params;
    const updated = (await query(
      `UPDATE bylaw_config SET value = default_value, updated_by = $1, updated_at = NOW()
       WHERE key = $2 RETURNING *`,
      [req.user.id, key]
    )).rows[0];
    if (!updated) return res.status(404).json({ success: false, message: 'Key not found' });
    
    bylawService.clearBylawCache();

    return res.json({ success: true, data: updated, message: 'Reset to default value' });
  } catch (err) { next(err); }
};

/**
 * POST /admin/cache/invalidate
 * Explicitly invalidate the bylaw JSON cache
 */
const invalidateBylawCache = async (req, res, next) => {
  try {
    bylawService.clearBylawCache();
    require('./student.extensions').clearBylawCache?.();
    return res.json({ success: true, message: 'Bylaw cache invalidated' });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENTS
// ─────────────────────────────────────────────────────────────────────────────

const getDepartments = async (req, res, next) => {
  try {
    const rows = (await query(
      `SELECT d.*, u.full_name_en as head_name,
              (SELECT COUNT(*) FROM doctors dr WHERE dr.department_id = d.id) AS doctor_count,
              (SELECT COUNT(*) FROM courses c WHERE c.department_id = d.id AND c.is_active = TRUE) AS course_count
       FROM departments d
       LEFT JOIN users u ON u.id = d.head_id
       ORDER BY d.code`
    )).rows;
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const createDepartment = async (req, res, next) => {
  try {
    const { code, nameAr, nameEn, headId } = req.body;
    if (!code || !nameAr || !nameEn) {
      return res.status(400).json({ success: false, message: 'code, nameAr, nameEn required' });
    }
    const row = (await query(
      'INSERT INTO departments (code, name_ar, name_en, head_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [code.toUpperCase(), nameAr, nameEn, headId || null]
    )).rows[0];
    return res.status(201).json({ success: true, data: row });
  } catch (err) { next(err); }
};

const updateDepartment = async (req, res, next) => {
  try {
    const { deptId } = req.params;
    const { nameAr, nameEn, headId, isActive } = req.body;
    const row = (await query(
      `UPDATE departments SET
         name_ar = COALESCE($1, name_ar),
         name_en = COALESCE($2, name_en),
         head_id = COALESCE($3::uuid, head_id),
         is_active = COALESCE($4, is_active)
       WHERE id = $5 RETURNING *`,
      [nameAr, nameEn, headId, isActive, deptId]
    )).rows[0];
    if (!row) return res.status(404).json({ success: false, message: 'Department not found' });
    return res.json({ success: true, data: row });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR SCHEDULE ASSIGNMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /admin/doctor-schedule/:doctorId
 * Get a doctor's full schedule across all active offerings
 */
const getDoctorSchedule = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { semesterId } = req.query;

    let semFilter = '';
    const params = [doctorId];
    if (semesterId) {
      semFilter = 'AND co.semester_id = $2';
      params.push(semesterId);
    }

    const offerings = (await query(
      `SELECT co.id as offering_id, co.capacity, co.enrolled_count,
              co.room, co.schedule,
              c.code, c.name_ar, c.name_en, c.credits, c.category,
              sem.id as semester_id, sem.label as semester_label, sem.status as semester_status,
              -- Schedule slots
              (SELECT json_agg(json_build_object('day', dss.day_of_week, 'start', dss.start_time, 'end', dss.end_time, 'room', dss.room, 'type', dss.session_type))
               FROM doctor_schedule_slots dss WHERE dss.offering_id = co.id) as schedule_slots
       FROM course_offerings co
       JOIN courses c ON c.id = co.course_id
       JOIN semesters sem ON sem.id = co.semester_id
       JOIN doctors d ON d.id = co.doctor_id
       WHERE d.id = $1 ${semFilter}
       ORDER BY sem.start_date DESC, c.code`,
      params
    )).rows;

    return res.json({ success: true, data: offerings });
  } catch (err) { next(err); }
};

/**
 * POST /admin/offerings/:offeringId/schedule
 * Assign schedule slots to an offering (and notify the doctor)
 */
const assignScheduleToOffering = async (req, res, next) => {
  try {
    const { offeringId } = req.params;
    const { slots, room } = req.body; // slots: [{dayOfWeek, startTime, endTime, room, sessionType}]

    const offering = (await query(
      `SELECT co.*, c.name_en, c.code, d.user_id as doctor_user_id, sem.label as semester_label
       FROM course_offerings co
       JOIN courses c ON c.id = co.course_id
       LEFT JOIN doctors d ON d.id = co.doctor_id
       JOIN semesters sem ON sem.id = co.semester_id
       WHERE co.id = $1`,
      [offeringId]
    )).rows[0];

    if (!offering) return res.status(404).json({ success: false, message: 'Offering not found' });

    // --- Validation: Check for overlaps ---
    if (slots && slots.length > 0) {
      for (const slot of slots) {
        if (slot.startTime >= slot.endTime) {
          return res.status(400).json({ success: false, message: 'وقت البدء يجب أن يكون قبل وقت الانتهاء' });
        }
        
        const checkRoom = slot.room || room;
        
        // 1. Room Overlap Check
        if (checkRoom) {
          const roomOverlap = (await query(
            `SELECT co.id 
             FROM doctor_schedule_slots dss
             JOIN course_offerings co ON co.id = dss.offering_id
             WHERE co.semester_id = $1 AND co.id != $2
               AND dss.room = $3 AND dss.day_of_week = $4
               AND dss.start_time < $6::time AND dss.end_time > $5::time
             LIMIT 1`,
            [offering.semester_id, offeringId, checkRoom, slot.dayOfWeek, slot.startTime, slot.endTime]
          )).rows[0];
          
          if (roomOverlap) {
            return res.status(400).json({ success: false, message: `تعارض في القاعة: القاعة ${checkRoom} محجوزة مسبقاً في هذا الوقت` });
          }
        }
        
        // 2. Doctor Overlap Check
        if (offering.doctor_id) {
          const docOverlap = (await query(
            `SELECT co.id 
             FROM doctor_schedule_slots dss
             JOIN course_offerings co ON co.id = dss.offering_id
             WHERE co.semester_id = $1 AND co.id != $2
               AND co.doctor_id = $3 AND dss.day_of_week = $4
               AND dss.start_time < $6::time AND dss.end_time > $5::time
             LIMIT 1`,
            [offering.semester_id, offeringId, offering.doctor_id, slot.dayOfWeek, slot.startTime, slot.endTime]
          )).rows[0];
          
          if (docOverlap) {
            return res.status(400).json({ success: false, message: `تعارض للدكتور: الدكتور لديه محاضرة أخرى في نفس الوقت` });
          }
        }
      }
    }

    return withTransaction(async (client) => {
      // Remove existing slots
      await client.query('DELETE FROM doctor_schedule_slots WHERE offering_id = $1', [offeringId]);

      // Insert new slots
      const savedSlots = [];
      if (slots && slots.length > 0) {
        for (const slot of slots) {
          const saved = (await client.query(
            `INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [offeringId, slot.dayOfWeek, slot.startTime, slot.endTime, slot.room || room, slot.sessionType || 'lecture']
          )).rows[0];
          savedSlots.push(saved);
        }
      }

      // Update room on offering
      if (room) {
        await client.query('UPDATE course_offerings SET room = $1 WHERE id = $2', [room, offeringId]);
      }

      // Notify the doctor
      if (offering.doctor_user_id) {
        const slotDesc = savedSlots.map(s => `${s.day_of_week} ${s.start_time}-${s.end_time}`).join(', ');
        await client.query(
          `INSERT INTO notifications (user_id, title, message, link, type)
           VALUES ($1, $2, $3, $4, 'schedule_assigned')`,
          [offering.doctor_user_id,
           `جدول جديد: ${offering.code}`,
           `تم تعيين جدول مقرر ${offering.name_en} (${offering.semester_label}) — ${slotDesc}`,
           '/doctor/courses']
        );
      }

      logger.info('Schedule assigned to offering', { offeringId, slotCount: savedSlots.length });
      return res.json({ success: true, data: savedSlots, message: 'Schedule assigned and doctor notified' });
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// PREREQUISITE MANAGEMENT (UI-friendly)
// ─────────────────────────────────────────────────────────────────────────────

const getPrerequisites = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const rows = (await query(
      `SELECT cp.id, cp.is_strict, c.id as prereq_id, c.code, c.name_en, c.name_ar, c.credits
       FROM course_prerequisites cp
       JOIN courses c ON c.id = cp.prereq_course_id
       WHERE cp.course_id = $1
       ORDER BY c.code`,
      [courseId]
    )).rows;
    return res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const removePrerequisite = async (req, res, next) => {
  try {
    const { courseId, prereqId } = req.params;
    const row = (await query(
      'DELETE FROM course_prerequisites WHERE course_id = $1 AND prereq_course_id = $2 RETURNING *',
      [courseId, prereqId]
    )).rows[0];
    if (!row) return res.status(404).json({ success: false, message: 'Prerequisite not found' });
    return res.json({ success: true, message: 'Prerequisite removed' });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION DETAIL (all roles)
// ─────────────────────────────────────────────────────────────────────────────

const getNotificationDetail = async (req, res, next) => {
  try {
    const { notifId } = req.params;
    const userId = req.user.id;

    const notif = (await query(
      `SELECT n.*, u.full_name_en as created_by_name
       FROM notifications n
       LEFT JOIN users u ON u.id = n.user_id
       WHERE n.id = $1 AND n.user_id = $2`,
      [notifId, userId]
    )).rows[0];

    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });

    // Auto-mark as read
    if (!notif.is_read) {
      await query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [notifId]);
      notif.is_read = true;
    }

    return res.json({ success: true, data: notif });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR: get own schedule (with PDF data)
// ─────────────────────────────────────────────────────────────────────────────

const getDoctorOwnSchedule = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const doctor = (await query('SELECT * FROM doctors WHERE user_id = $1', [userId])).rows[0];
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const { semesterId } = req.query;

    // Get active semester if not specified
    let targetSemId = semesterId;
    if (!targetSemId) {
      const activeSem = (await query(
        `SELECT id FROM semesters WHERE status IN ('registration','active','grading') ORDER BY start_date DESC LIMIT 1`
      )).rows[0];
      if (activeSem) targetSemId = activeSem.id;
    }

    const offerings = (await query(
      `SELECT co.id as offering_id, co.capacity, (SELECT COUNT(*) FROM enrollments e WHERE e.offering_id = co.id AND e.status IN ('registered','completed')) AS enrolled_count, co.room,
              c.id as course_id, c.code, c.name_ar, c.name_en, c.credits, c.category, c.level,
              sem.id as semester_id, sem.label as semester_label,
              sem.start_date, sem.end_date, sem.status as semester_status,
              u.full_name_ar as doctor_name_ar, u.full_name_en as doctor_name_en,
              doc.academic_title,
              (SELECT json_agg(json_build_object(
                'id', dss.id, 'day', dss.day_of_week,
                'start', dss.start_time::text, 'end', dss.end_time::text,
                'room', dss.room, 'type', dss.session_type
              ) ORDER BY dss.day_of_week, dss.start_time)
               FROM doctor_schedule_slots dss WHERE dss.offering_id = co.id) as schedule_slots,
              (SELECT COUNT(*) FROM enrollments e WHERE e.offering_id = co.id AND e.status = 'registered') as registered_count
       FROM course_offerings co
       JOIN courses c ON c.id = co.course_id
       JOIN semesters sem ON sem.id = co.semester_id
       JOIN doctors doc ON doc.id = co.doctor_id
       JOIN users u ON u.id = doc.user_id
       WHERE doc.id = $1 AND ($2::int IS NULL OR co.semester_id = $2::int)
       ORDER BY c.level, c.code`,
      [doctor.id, targetSemId || null]
    )).rows;

    // Map the level ID back to a human-readable Arabic string (e.g., الفرقة الأولى)
    const bylawLevels = bylawService.getBylaw().levels || [];
    let uniqueOfferingsMap = new Map();

    offerings.forEach(off => {
      const levelObj = bylawLevels.find(l => l.id === off.level) || bylawLevels[0];
      off.level_name = levelObj ? levelObj.name_ar : 'الفرقة الأولى';

      if (!uniqueOfferingsMap.has(off.code)) {
        uniqueOfferingsMap.set(off.code, { ...off });
      } else {
        const existing = uniqueOfferingsMap.get(off.code);
        existing.enrolled_count = (parseInt(existing.enrolled_count)||0) + (parseInt(off.enrolled_count)||0);
        existing.registered_count = (parseInt(existing.registered_count)||0) + (parseInt(off.registered_count)||0);
        existing.capacity = (parseInt(existing.capacity)||0) + (parseInt(off.capacity)||0);
        if (off.schedule_slots) {
          existing.schedule_slots = (existing.schedule_slots || []).concat(off.schedule_slots);
        }
      }
    });
    
    const uniqueOfferings = Array.from(uniqueOfferingsMap.values());

    // Build weekly grid for schedule display
    const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    const weeklyGrid = {};
    for (const day of DAYS) weeklyGrid[day] = [];

    const seenSlots = new Set();
    for (const offering of uniqueOfferings) {
      if (offering.schedule_slots) {
        for (const slot of offering.schedule_slots) {
          if (weeklyGrid[slot.day]) {
            const dedupKey = `${offering.course_id}-${slot.day}-${slot.start}`;
            if (seenSlots.has(dedupKey)) continue;
            seenSlots.add(dedupKey);
            weeklyGrid[slot.day].push({
              ...slot,
              courseCode: offering.code,
              courseName: offering.name_en,
              courseNameAr: offering.name_ar,
              capacity: offering.capacity,
              enrolled_count: offering.enrolled_count,
            });
          }
        }
      }
    }

    // [FIX-SCHEDULE-OVERLAP] Detect time conflicts: mark any slot whose time range
    // overlaps with another slot on the same day. Adds hasConflict=true flag so the
    // frontend can display a clear warning instead of silently showing two side-by-side
    // blocks that look like valid data.
    const toMin = (t) => {
      if (!t) return 0;
      const [h, m] = String(t).split(':').map(Number);
      return h * 60 + (m || 0);
    };
    const scheduleConflicts = [];
    for (const day of DAYS) {
      const slots = weeklyGrid[day];
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const a = slots[i], b = slots[j];
          const aStart = toMin(a.start), aEnd = toMin(a.end);
          const bStart = toMin(b.start), bEnd = toMin(b.end);
          if (aStart < bEnd && aEnd > bStart) {
            // Mark both slots as conflicting
            a.hasConflict = true;
            b.hasConflict = true;
            scheduleConflicts.push({
              day,
              courses: [a.courseCode, b.courseCode],
              time: `${a.start?.slice(0,5)}–${a.end?.slice(0,5)}`,
              message: `تعارض في الجدول: ${a.courseCode} و ${b.courseCode} متداخلان في يوم ${day} الساعة ${a.start?.slice(0,5)}–${a.end?.slice(0,5)}`,
            });
          }
        }
      }
    }

    return res.json({
      success: true,
      data: {
        offerings: uniqueOfferings,
        weeklyGrid,
        // [FIX-ENROLLED] use live enrolled_count (was registered_count which excluded 'completed')
        totalStudents: uniqueOfferings.reduce((s, o) => s + (parseInt(o.enrolled_count) || 0), 0),
        semesterId: targetSemId,
        // Populated only when conflicts exist; empty array means schedule is clean
        scheduleConflicts,
      }
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT: get available courses grouped by curriculum plan semester
// ─────────────────────────────────────────────────────────────────────────────

const getCoursesGroupedByPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { semesterId } = req.params;

    const student = (await query('SELECT * FROM students WHERE user_id = $1', [userId])).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const spec = student.specialization || 'CS';

    // Get curriculum plan for this student's specialization + GENERAL
    const plan = (await query(
      `SELECT c.id as course_id, c.code, c.name_ar, c.name_en, c.credits, c.level, c.category, c.hours_lecture, c.hours_lab,
              co.id as offering_id, co.capacity, co.enrolled_count, co.room,
              u.full_name_ar as doctor_name_ar, u.full_name_en as doctor_name_en,
              -- Enrollment status for this student
              e.id as enrollment_id, e.status as enrollment_status,
              e.letter_grade, e.total_grade
       FROM curriculum_plans cp
       JOIN courses c ON c.id = cp.course_id
       LEFT JOIN course_offerings co ON co.course_id = c.id AND co.semester_id = $1 AND (co.is_active = TRUE OR EXISTS(SELECT 1 FROM enrollments e2 WHERE e2.offering_id = co.id AND e2.student_id = $2))
       LEFT JOIN doctors d ON d.id = co.doctor_id
       LEFT JOIN users u ON u.id = d.user_id
       LEFT JOIN enrollments e ON e.offering_id = co.id AND e.student_id = $2
         AND e.status IN ('registered','completed','withdrawn')
       WHERE cp.specialization IN ($3, 'GENERAL')
         AND c.is_active = TRUE
       ORDER BY cp.year_of_study, cp.semester_in_year, c.code`,
      [semesterId, student.id, spec]
    )).rows;

    // Group by year/semester for display
    const grouped = {};
    for (const row of plan) {
      const key = `${row.year_of_study}_${row.semester_in_year}`;
      if (!grouped[key]) {
        grouped[key] = {
          year: row.year_of_study,
          semester: row.semester_in_year,
          label: `السنة ${row.year_of_study} - الفصل ${row.semester_in_year}`,
          courses: []
        };
      }
      grouped[key].courses.push(row);
    }

    return res.json({
      success: true,
      data: {
        grouped: Object.values(grouped),
        studentLevel: student.current_level,
        studentSpec: spec,
      }
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN REPORTS: enhanced
// ─────────────────────────────────────────────────────────────────────────────

const getDetailedReports = async (req, res, next) => {
  try {
    const { type = 'overview', semesterId } = req.query;

    if (type === 'gpa_distribution') {
      const dist = (await query(
        `SELECT
           CASE WHEN cgpa >= 3.5 THEN '3.5 - 4.0'
                WHEN cgpa >= 3.0 THEN '3.0 - 3.5'
                WHEN cgpa >= 2.5 THEN '2.5 - 3.0'
                WHEN cgpa >= 2.0 THEN '2.0 - 2.5'
                WHEN cgpa >= 1.0 THEN '1.0 - 2.0'
                ELSE '0.0 - 1.0' END AS range,
           COUNT(*) AS count
         FROM students WHERE academic_status NOT IN ('graduated','withdrawn')
         GROUP BY 1 ORDER BY 1 DESC`
      )).rows;
      return res.json({ success: true, data: dist });
    }

    if (type === 'top_students') {
      const top = (await query(
        `SELECT s.student_code, u.full_name_en, u.full_name_ar,
                s.specialization, s.current_level, s.cgpa, s.total_credits_passed
         FROM students s JOIN users u ON u.id = s.user_id
         WHERE s.academic_status NOT IN ('dismissed','withdrawn')
           AND s.semesters_enrolled > 0
         ORDER BY s.cgpa DESC, s.total_credits_passed DESC LIMIT 20`
      )).rows;
      return res.json({ success: true, data: top });
    }

    if (type === 'dismissed') {
      const dismissed = (await query(
        `SELECT s.student_code, u.full_name_en, u.full_name_ar,
                s.specialization, s.total_warnings, s.consecutive_warnings,
                s.semesters_enrolled, s.cgpa
         FROM students s JOIN users u ON u.id = s.user_id
         WHERE s.academic_status = 'dismissed'
         ORDER BY s.updated_at DESC`
      )).rows;
      return res.json({ success: true, data: dismissed });
    }

    if (type === 'enrollment_stats' && semesterId) {
      const stats = (await query(
        `SELECT c.code, c.name_en, 
                co.capacity, co.enrolled_count, 
                co.capacity - co.enrolled_count AS spare_capacity,
                (co.enrolled_count::float / NULLIF(co.capacity, 0) * 100)::int AS fill_pct,
                u.full_name_en as doctor_name,
                COUNT(e.id) FILTER (WHERE e.status = 'withdrawn') AS withdrawals,
                COUNT(e.id) FILTER (WHERE e.status = 'dropped') AS drops
         FROM course_offerings co
         JOIN courses c ON c.id = co.course_id
         LEFT JOIN doctors d ON d.id = co.doctor_id
         LEFT JOIN users u ON u.id = d.user_id
         LEFT JOIN enrollments e ON e.offering_id = co.id
         WHERE co.semester_id = $1
         GROUP BY c.code, c.name_en, co.capacity, co.enrolled_count, u.full_name_en
         ORDER BY co.enrolled_count DESC`,
        [semesterId]
      )).rows;
      return res.json({ success: true, data: stats });
    }

    // Default overview
    const overview = (await query(
      `SELECT
         (SELECT COUNT(*) FROM students WHERE academic_status = 'active') AS active_students,
         (SELECT COUNT(*) FROM students WHERE academic_status = 'warning') AS warning_students,
         (SELECT COUNT(*) FROM students WHERE academic_status = 'dismissed') AS dismissed_students,
         (SELECT COUNT(*) FROM students WHERE academic_status = 'graduated') AS graduated_students,
         (SELECT ROUND(AVG(cgpa)::numeric, 3) FROM students WHERE semesters_enrolled > 0) AS avg_cgpa,
         (SELECT COUNT(*) FROM enrollments WHERE status = 'registered') AS active_enrollments,
         (SELECT COUNT(*) FROM course_offerings co JOIN semesters s ON s.id = co.semester_id WHERE s.id = (SELECT id FROM semesters WHERE status IN ('registration','active','grading') ORDER BY CASE WHEN status = 'active' THEN 1 WHEN status = 'registration' THEN 2 ELSE 3 END, start_date DESC LIMIT 1)) AS active_offerings`
    )).rows[0];
    return res.json({ success: true, data: overview });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// SEMESTER MANAGEMENT: create with auto-deadlines
// ─────────────────────────────────────────────────────────────────────────────
const createSemesterEnhanced = async (req, res, next) => {
  try {
    const {
      label, semesterType, startDate, endDate,
      registrationStart, registrationEnd,
      academicYearId, minCredits = 2, maxCredits = 20
    } = req.body;

    if (!label || !semesterType || !startDate || !registrationStart) {
      return res.status(400).json({ success: false, message: 'label, semesterType, startDate, registrationStart required' });
    }

    // Auto-calculate deadlines
    const start = new Date(startDate);
    const addDropWeeks = (await query("SELECT value FROM bylaw_config WHERE key = 'add_drop_weeks'")).rows[0]?.value || '2';
    const withdrawalWeeks = (await query("SELECT value FROM bylaw_config WHERE key = 'withdrawal_weeks'")).rows[0]?.value || '7';

    const addDropDeadline = new Date(start);
    addDropDeadline.setDate(addDropDeadline.getDate() + parseInt(addDropWeeks) * 7);

    const withdrawalDeadline = new Date(start);
    withdrawalDeadline.setDate(withdrawalDeadline.getDate() + parseInt(withdrawalWeeks) * 7);

    // Get or create academic year
    let yearId = academicYearId;
    if (!yearId) {
      const startYear = new Date(startDate).getFullYear();
      const yearLabel = `${startYear}-${startYear + 1}`;
      const ay = (await query(
        `INSERT INTO academic_years (year_label, start_date, end_date)
         VALUES ($1, $2, $3)
         ON CONFLICT (year_label) DO UPDATE SET start_date = $2
         RETURNING id`,
        [yearLabel, `${startYear}-09-01`, `${startYear + 1}-06-30`]
      )).rows[0];
      yearId = ay.id;
    }

    const semEndDate = endDate || withdrawalDeadline.toISOString().split('T')[0];
    const addDropStr = addDropDeadline.toISOString().split('T')[0];
    const withdrawStr = withdrawalDeadline.toISOString().split('T')[0];
    const regEndStr = registrationEnd || registrationStart;

    const semester = (await query(
      `INSERT INTO semesters (
         academic_year_id, semester_type, label, status,
         start_date, end_date, registration_start, registration_end,
         add_drop_deadline, withdrawal_deadline,
         min_credits, max_credits_default
       ) VALUES ($1, $2, $3, 'upcoming', $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [yearId, semesterType, label,
       startDate, semEndDate,
       registrationStart, regEndStr,
       addDropStr, withdrawStr,
       minCredits, maxCredits]
    )).rows[0];

    logger.info('Semester created', { semesterId: semester.id, label, adminId: req.user.id });
    return res.status(201).json({ success: true, data: semester, message: 'Semester created successfully' });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// JSON BYLAW EDITOR
// ─────────────────────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');

const getBylawPath = () => {
  let p = path.join(__dirname, '../../../database/academic-regulations.json');
  if (!fs.existsSync(p)) {
    p = path.join(process.cwd(), 'database/academic-regulations.json');
  }
  return p;
};

const getBylawFull = async (req, res, next) => {
  try {
    const data = require('../services/bylaw.service').getBylaw();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const updateBylawFull = async (req, res, next) => {
  try {
    const newBylaw = req.body;
    // basic validation
    if (!newBylaw.metadata || !newBylaw.curriculum || !newBylaw.grading_system) {
      return res.status(400).json({ success: false, message: 'Invalid bylaw structure: missing required root keys.' });
    }

    const currentRaw = fs.readFileSync(getBylawPath(), 'utf8');
    
    // Ensure backups directory exists
    const backupDir = path.join(path.dirname(getBylawPath()), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupPath = path.join(backupDir, `academic-regulations-${Date.now()}.json`);
    
    // Save backup
    fs.writeFileSync(backupPath, currentRaw, 'utf8');
    logger.info('Bylaw backup created', { backupPath });

    // Write new bylaw
    fs.writeFileSync(getBylawPath(), JSON.stringify(newBylaw, null, 2), 'utf8');
    // Clear caches
    require('../services/bylaw.service').clearBylawCache?.();
    require('./student.extensions').clearBylawCache?.();
    
    return res.json({ success: true, message: 'Bylaw updated successfully' });
  } catch (err) {
    next(err);
  }
};



module.exports = {
  // Curriculum
  getCurriculumPlan, addCourseToCurriculum, updateCurriculumEntry, removeCourseFromCurriculum,
  // Bylaw config
  getBylawConfig, updateBylawConfig, resetBylawConfig, getBylawFull, updateBylawFull, invalidateBylawCache,
  // Departments
  getDepartments, createDepartment, updateDepartment,
  // Doctor schedule
  getDoctorSchedule, assignScheduleToOffering, getDoctorOwnSchedule,
  // Prerequisites
  getPrerequisites, removePrerequisite,
  // Notification detail
  getNotificationDetail,
  // Student grouped courses
  getCoursesGroupedByPlan,
  // Reports
  getDetailedReports,
  // Semester
  createSemesterEnhanced,
};
