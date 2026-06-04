// =============================================================================
// student.extensions.js — FR-1 through FR-5
// FR-1: Remaining credit hours calculation + display
// FR-2: Full eligibility check (prereqs, schedule conflict, credit limit, availability)
// FR-3: Alternative course suggestions when blocked
// FR-4: Auto-stop registration at credit limit
// FR-5: Real-university UX improvements
// =============================================================================
const { query } = require('../config/database');
const logger = require('../utils/logger');
const { getBylaw, clearCache: clearBylawCache } = require('../services/bylaw.service');

// ── Helper: compute max credits for student based on CGPA + semester type ────
//
// ROOT CAUSE FIX (credit hours showing 12):
//   1. For CGPA = 0 with semesters_enrolled > 0 the bylaw JSON rule
//      { min_cgpa: 0.0, max_hours: 12 } used to fire, returning 12.
//      This happened whenever a student had completed a semester but
//      the GPA recompute hadn't run yet (cgpa field still 0.000).
//   2. The JSON itself was also updated: min_cgpa=0.0 → max_hours changed
//      from 12 to 18 in database/academic-regulations.json.
//   3. Fallback at bottom changed from 12 to 18 as a final safety net.
//
async function computeMaxCredits(student, semester) {
  const bylaw = getBylaw();
  const isSummer = (semester.semester_type || semester.semesterType || '').toLowerCase() === 'summer';

  // Summer semester: fixed 9 credit maximum per bylaw
  if (isSummer) return bylaw.registration_rules.summer_semester.max_hours;

  // Art. 11: First-semester students (never enrolled before) → 18
  if (parseInt(student.semesters_enrolled || 0) === 0) {
    return bylaw.registration_rules.regular_semester.max_hours_new_students;
  }

  const cgpa = parseFloat(student.cgpa || 0);

  // CGPA = 0 with prior semesters means GPA hasn't been recalculated yet
  // (student has enrollments but the recompute hasn't run).
  // Treat them as new students to avoid unfairly capping them at 12.
  if (cgpa === 0) {
    return bylaw.registration_rules.regular_semester.max_hours_new_students; // 18
  }

  const rules = bylaw.registration_rules.regular_semester.max_hours_by_gpa;
  for (const rule of rules) {
    if (cgpa >= rule.min_cgpa) return rule.max_hours;
  }

  // Graduating student exception — if remaining credits ≤ 21, allow up to 21
  const totalRequired = bylaw.metadata.total_credit_hours;
  const passed = parseInt(student.total_credits_passed || 0);
  const remaining = totalRequired - passed;
  if (remaining <= 21) return 21;

  // Safe fallback — never return 12 again
  return 18;
}

// ─────────────────────────────────────────────────────────────────────────────
// FR-1 + FR-4: Get credit hour summary for a student in a semester
// GET /student/semesters/:semesterId/credit-summary
// ─────────────────────────────────────────────────────────────────────────────
const getCreditSummary = async (req, res, next) => {
  try {
    const { semesterId } = req.params;
    const userId = req.user.id;

    const student = (await query('SELECT * FROM students WHERE user_id=$1', [userId])).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const semester = (await query('SELECT * FROM semesters WHERE id=$1', [semesterId])).rows[0];
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });

    const maxCredits = await computeMaxCredits(student, semester);

    // Registered credits this semester
    const regResult = (await query(
      `SELECT COALESCE(SUM(c.credits),0) AS total
       FROM enrollments e
       JOIN course_offerings co ON co.id = e.offering_id
       JOIN courses c ON c.id = co.course_id
       WHERE e.student_id=$1 AND co.semester_id=$2
         AND e.status IN ('registered','completed')`,
      [student.id, semesterId]
    )).rows[0];
    const registeredCredits = parseInt(regResult.total) || 0;
    const remainingCredits = Math.max(0, maxCredits - registeredCredits);
    const atLimit = registeredCredits >= maxCredits;

    // List registered courses
    const registeredCourses = (await query(
      `SELECT c.code, c.name_ar, c.name_en, c.credits,
              e.id AS enrollment_id, e.status
       FROM enrollments e
       JOIN course_offerings co ON co.id = e.offering_id
       JOIN courses c ON c.id = co.course_id
       WHERE e.student_id=$1 AND co.semester_id=$2
         AND e.status IN ('registered','completed')
       ORDER BY c.code`,
      [student.id, semesterId]
    )).rows;

    return res.json({
      success: true,
      data: {
        maxCredits,
        registeredCredits,
        remainingCredits,
        atLimit,
        fillPercent: Math.min(100, Math.round((registeredCredits / maxCredits) * 100)),
        cgpa: student.cgpa,
        academicStatus: student.academic_status,
        semesterType: semester.semester_type,
        registeredCourses,
        // FR-4: warning if near limit
        nearLimit: registeredCredits >= maxCredits - 3,
        warningMessage: atLimit
          ? `وصلت إلى الحد الأقصى (${maxCredits} ساعة). لا يمكنك تسجيل مزيد من المقررات.`
          : registeredCredits >= maxCredits - 3
            ? `تنبيه: متبقٍ ${remainingCredits} ساعة فقط من حدك المسموح به (${maxCredits} ساعة).`
            : null,
      }
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// FR-2: Full eligibility check for a single offering
// GET /student/semesters/:semesterId/offerings/:offeringId/eligibility
// ─────────────────────────────────────────────────────────────────────────────
const checkCourseEligibility = async (req, res, next) => {
  try {
    const semesterId = parseInt(req.params.semesterId) || req.params.semesterId;
    const offeringId = parseInt(req.params.offeringId) || req.params.offeringId;
    const userId = req.user.id;

    const student = (await query('SELECT * FROM students WHERE user_id=$1', [userId])).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const semester = (await query('SELECT * FROM semesters WHERE id=$1', [semesterId])).rows[0];
    if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });

    const offering = (await query(
      `SELECT co.*, c.code, c.name_ar, c.name_en, c.credits, c.level AS course_level,
              c.category, c.is_credit_bearing,
              u.full_name_en AS doctor_name
       FROM course_offerings co
       JOIN courses c ON c.id = co.course_id
       LEFT JOIN doctors d ON d.id = co.doctor_id
       LEFT JOIN users u ON u.id = d.user_id
       WHERE co.id=$1 AND co.semester_id=$2`,
      [offeringId, semesterId]
    )).rows[0];
    if (!offering) return res.status(404).json({ success: false, message: 'Offering not found' });

    const checks = [];
    let canRegister = true;

    // 1. Registration window open?
    semester.status = require('../services/bylaw.service').computeSemesterStatus(semester);
    const regOpen = semester.status === 'registration';
    const addDropOpen = semester.status === 'active' && new Date() <= new Date(semester.add_drop_deadline);
    if (!regOpen && !addDropOpen) {
      checks.push({
        id: 'window', label: 'نافذة التسجيل', ok: false,
        message: 'التسجيل مغلق حاليًا'
      });
      canRegister = false;
    } else {
      checks.push({ id: 'window', label: 'نافذة التسجيل', ok: true, message: 'التسجيل مفتوح' });
    }

    // 2. Academic status
    if (student.academic_status === 'dismissed') {
      checks.push({
        id: 'status', label: 'الحالة الأكاديمية', ok: false,
        message: 'حسابك في حالة فصل — لا يمكن التسجيل'
      });
      canRegister = false;
    } else {
      checks.push({
        id: 'status', label: 'الحالة الأكاديمية', ok: true,
        message: `الحالة: ${student.academic_status}`
      });
    }

    // 3. Already enrolled?
    const existing = (await query(
      `SELECT id, status FROM enrollments
       WHERE student_id=$1 AND offering_id=$2 AND status IN ('registered','completed')`,
      [student.id, offeringId]
    )).rows[0];
    if (existing) {
      checks.push({
        id: 'enrolled', label: 'التسجيل المسبق', ok: false,
        message: `مسجل بالفعل (الحالة: ${existing.status})`
      });
      canRegister = false;
    } else {
      checks.push({ id: 'enrolled', label: 'التسجيل المسبق', ok: true, message: 'غير مسجل — متاح' });
    }

    // 4. Capacity
    const capacityOk = offering.enrolled_count < offering.capacity;
    checks.push({
      id: 'capacity', label: 'السعة المتاحة', ok: capacityOk,
      message: capacityOk
        ? `${offering.enrolled_count}/${offering.capacity} — متاح (${offering.capacity - offering.enrolled_count} مكان)`
        : `القسم ممتلئ (${offering.enrolled_count}/${offering.capacity})`
    });
    if (!capacityOk) canRegister = false;

    // 5. Credit limit
    const maxCredits = await computeMaxCredits(student, semester);
    const regResult = (await query(
      `SELECT COALESCE(SUM(c.credits),0) AS total
       FROM enrollments e JOIN course_offerings co ON co.id=e.offering_id
       JOIN courses c ON c.id=co.course_id
       WHERE e.student_id=$1 AND co.semester_id=$2 AND e.status IN ('registered','completed')`,
      [student.id, semesterId]
    )).rows[0];
    const currentCredits = parseInt(regResult.total) || 0;
    const wouldBe = currentCredits + (offering.credits || 0);
    const creditOk = wouldBe <= maxCredits;
    checks.push({
      id: 'credits', label: 'حد الساعات', ok: creditOk,
      message: creditOk
        ? `${currentCredits} + ${offering.credits} = ${wouldBe} / ${maxCredits} ✓`
        : `سيصبح ${wouldBe} ساعة — يتجاوز الحد (${maxCredits}) بمقدار ${wouldBe - maxCredits} ساعة`
    });
    if (!creditOk) canRegister = false;

    // 6. Prerequisites
    const prereqs = (await query(
      `SELECT c2.code, c2.name_ar, cp.is_strict,
              EXISTS(
                SELECT 1 FROM enrollments e2
                JOIN course_offerings co2 ON co2.id=e2.offering_id
                WHERE e2.student_id=$1 AND co2.course_id=cp.prereq_course_id
                  AND e2.status='completed' AND e2.letter_grade NOT IN ('F','Abs','W')
              ) AS is_passed
       FROM course_prerequisites cp
       JOIN courses c2 ON c2.id=cp.prereq_course_id
       WHERE cp.course_id=$2`,
      [student.id, offering.course_id]
    )).rows;

    const strictFailed = prereqs.filter(p => p.is_strict && !p.is_passed);
    if (strictFailed.length > 0) {
      checks.push({
        id: 'prereqs', label: 'المتطلبات السابقة', ok: false,
        message: `متطلبات غير مستوفاة: ${strictFailed.map(p => `${p.code} (${p.name_ar})`).join(', ')}`,
        details: prereqs
      });
      canRegister = false;
    } else {
      checks.push({
        id: 'prereqs', label: 'المتطلبات السابقة', ok: true,
        message: prereqs.length === 0 ? 'لا توجد متطلبات' : `جميع المتطلبات مستوفاة (${prereqs.length})`,
        details: prereqs
      });
    }

    // 7. Schedule conflict
    const mySlots = (await query(
      `SELECT dss.day_of_week, dss.start_time, dss.end_time, c2.code AS enrolled_course
       FROM enrollments e
       JOIN course_offerings co ON co.id=e.offering_id
       JOIN courses c2 ON c2.id=co.course_id
       JOIN doctor_schedule_slots dss ON dss.offering_id=co.id
       WHERE e.student_id=$1 AND co.semester_id=$2 AND e.status='registered'`,
      [student.id, semesterId]
    )).rows;

    const newSlots = (await query(
      'SELECT day_of_week, start_time, end_time FROM doctor_schedule_slots WHERE offering_id=$1',
      [offeringId]
    )).rows;

    const conflicts = [];
    for (const ns of newSlots) {
      for (const ms of mySlots) {
        if (ns.day_of_week === ms.day_of_week) {
          const nsStart = ns.start_time, nsEnd = ns.end_time;
          const msStart = ms.start_time, msEnd = ms.end_time;
          if (nsStart < msEnd && nsEnd > msStart) {
            conflicts.push(`تعارض مع ${ms.enrolled_course} يوم ${ms.day_of_week} ${ms.start_time}-${ms.end_time}`);
          }
        }
      }
    }
    if (conflicts.length > 0) {
      checks.push({
        id: 'schedule', label: 'تعارض المواعيد', ok: false,
        message: conflicts.join(' | '), conflicts
      });
      canRegister = false;
    } else {
      checks.push({
        id: 'schedule', label: 'تعارض المواعيد', ok: true,
        message: newSlots.length === 0 ? 'لا يوجد جدول محدد (لا تعارض)' : 'لا يوجد تعارض في المواعيد'
      });
    }

    return res.json({
      success: true,
      data: {
        canRegister,
        checks,
        offering: {
          id: offeringId, code: offering.code, nameAr: offering.name_ar,
          credits: offering.credits, enrolledCount: offering.enrolled_count, capacity: offering.capacity,
        },
        summary: canRegister
          ? `✅ يمكنك التسجيل في ${offering.code}`
          : `❌ لا يمكن التسجيل: ${checks.filter(c => !c.ok).map(c => c.label).join(' · ')}`,
      }
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// FR-3: Suggest alternative courses when blocked
// GET /student/semesters/:semesterId/offerings/:offeringId/alternatives
// ─────────────────────────────────────────────────────────────────────────────
const getAlternativeCourses = async (req, res, next) => {
  try {
    const semesterId = parseInt(req.params.semesterId) || req.params.semesterId;
    const offeringId = parseInt(req.params.offeringId) || req.params.offeringId;
    const userId = req.user.id;

    const student = (await query('SELECT * FROM students WHERE user_id=$1', [userId])).rows[0];
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const semester = (await query('SELECT * FROM semesters WHERE id=$1', [semesterId])).rows[0];
    const blocked = (await query(
      `SELECT co.*, c.code, c.name_ar, c.credits, c.level AS course_level, c.category
       FROM course_offerings co JOIN courses c ON c.id=co.course_id
       WHERE co.id=$1::int`, [offeringId]
    )).rows[0];
    if (!blocked) return res.status(404).json({ success: false, message: 'Offering not found' });

    // Compute remaining credits
    const maxCredits = await computeMaxCredits(student, semester);
    const regResult = (await query(
      `SELECT COALESCE(SUM(c.credits),0) AS total
       FROM enrollments e JOIN course_offerings co ON co.id=e.offering_id
       JOIN courses c ON c.id=co.course_id
       WHERE e.student_id=$1 AND co.semester_id=$2 AND e.status IN ('registered','completed')`,
      [student.id, semesterId]
    )).rows[0];
    const usedCredits = parseInt(regResult.total) || 0;
    const remaining = maxCredits - usedCredits;

    // Get student's registered schedule slots (for conflict check)
    const mySlots = (await query(
      `SELECT dss.day_of_week, dss.start_time, dss.end_time
       FROM enrollments e JOIN course_offerings co ON co.id=e.offering_id
       JOIN doctor_schedule_slots dss ON dss.offering_id=co.id
       WHERE e.student_id=$1 AND co.semester_id=$2 AND e.status='registered'`,
      [student.id, semesterId]
    )).rows;

    // Get already enrolled offering IDs (current semester)
    const enrolledOfferingIds = (await query(
      `SELECT offering_id FROM enrollments
       WHERE student_id=$1 AND status IN ('registered','completed')`, [student.id]
    )).rows.map(r => r.offering_id);

    // Get course IDs the student has already PASSED (any semester) — exclude from alternatives
    const passedCourseIds = (await query(
      `SELECT DISTINCT co.course_id
       FROM enrollments e
       JOIN course_offerings co ON co.id = e.offering_id
       WHERE e.student_id = $1
         AND e.status = 'completed'
         AND e.letter_grade IS NOT NULL
         AND e.letter_grade NOT IN ('F', 'Abs', 'W', 'I', 'Con')`,
      [student.id]
    )).rows.map(r => r.course_id);

    // [FIX-ALT-YEAR] Find alternatives at the student's CURRENT year only.
    // Bug: old query used `c.level <= $4` which showed year-1 and year-2 courses
    // to a year-3 student. Fixed to `cp.year_of_study = $4` (current year only)
    // and joined curriculum_plans to also enforce specialization correctness.
    const studentLevelId = (require('../services/bylaw.service').creditsToLevel(student.total_credits_passed).id || 4);
    const studentSpecializations = studentLevelId <= 2
      ? ['GENERAL']
      : [student.specialization || 'CS', 'GENERAL'];

    const candidates = (await query(
      `SELECT co.id AS offering_id, c.code, c.name_ar, c.name_en, c.credits,
              c.level AS course_level, c.category, co.capacity, co.enrolled_count,
              u.full_name_ar AS doctor_name_ar,
              (SELECT json_agg(json_build_object('day',dss.day_of_week,'start',dss.start_time::text,'end',dss.end_time::text))
               FROM doctor_schedule_slots dss WHERE dss.offering_id=co.id) AS slots
       FROM course_offerings co
       JOIN courses c ON c.id=co.course_id
       -- Join curriculum_plans to enforce current-year + specialization boundary
       JOIN curriculum_plans cp ON cp.course_id = c.id
       LEFT JOIN doctors d ON d.id=co.doctor_id
       LEFT JOIN users u ON u.id=d.user_id
       WHERE co.semester_id=$1
         AND co.is_active=TRUE
         AND co.id != $2::int
         AND co.enrolled_count < co.capacity
         AND c.credits <= $3
         -- [FIX-ALT-YEAR] Must match the student's current study year — no previous years
         AND cp.year_of_study = $4
         AND cp.specialization = ANY($6::text[])
         AND c.is_active=TRUE
         AND c.id != ANY($7::int[])
       ORDER BY ABS(c.credits - $5), c.code
       LIMIT 20`,
      [semesterId, offeringId, remaining,
        studentLevelId,
        blocked.credits || 3,
        studentSpecializations,
        passedCourseIds.length > 0 ? passedCourseIds : [-1]]
    )).rows;

    // Filter: not already enrolled + no schedule conflicts + prereqs met
    const suggestions = [];
    for (const cand of candidates) {
      if (enrolledOfferingIds.includes(cand.offering_id)) continue;

      // Check prereqs
      const prereqFails = (await query(
        `SELECT COUNT(*) AS cnt FROM course_prerequisites cp
         WHERE cp.course_id=(SELECT course_id FROM course_offerings WHERE id=$1::int)
           AND cp.is_strict=TRUE
           AND NOT EXISTS(
             SELECT 1 FROM enrollments e2
             JOIN course_offerings co2 ON co2.id=e2.offering_id
             WHERE e2.student_id=$2 AND co2.course_id=cp.prereq_course_id
               AND e2.status='completed' AND e2.letter_grade NOT IN ('F','Abs','W'))`,
        [parseInt(cand.offering_id), student.id]
      )).rows[0];
      if (parseInt(prereqFails.cnt) > 0) continue;

      // Check schedule conflicts
      let hasConflict = false;
      if (cand.slots) {
        for (const ns of cand.slots) {
          for (const ms of mySlots) {
            if (ns.day === ms.day_of_week && ns.start < ms.end_time && ns.end > ms.start_time) {
              hasConflict = true; break;
            }
          }
          if (hasConflict) break;
        }
      }
      if (hasConflict) continue;

      suggestions.push({
        ...cand,
        spotsLeft: cand.capacity - cand.enrolled_count,
        creditsFit: cand.credits <= remaining,
        scheduleDisplay: cand.slots
          ? cand.slots.map(s => `${s.day} ${s.start}`).join(' | ')
          : 'جدول غير محدد',
        reason: `بديل عن ${blocked.code}: ${cand.credits} ساعات ، لا تعارض ، متطلبات مستوفاة`,
      });
      if (suggestions.length >= 8) break;
    }

    return res.json({
      success: true,
      data: {
        blocked: { code: blocked.code, nameAr: blocked.name_ar, credits: blocked.credits },
        suggestions,
        remainingCredits: remaining,
        count: suggestions.length,
        message: suggestions.length > 0
          ? `وجدنا ${suggestions.length} مادة بديلة مناسبة لك`
          : 'لا توجد مواد بديلة متاحة في الوقت الحالي',
      }
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// FR-5: Smart registration validation — run before registerCourse
// Returns enriched canRegister status with all checks in one call
// POST /student/semesters/:semesterId/validate-registration
// Body: { offeringId }
// ─────────────────────────────────────────────────────────────────────────────
const validateRegistrationFull = async (req, res, next) => {
  try {
    req.params.semesterId = req.params.semesterId || req.body.semesterId;
    req.params.offeringId = req.body.offeringId;
    return checkCourseEligibility(req, res, next);
  } catch (err) { next(err); }
};

module.exports = {
  getCreditSummary,
  checkCourseEligibility,
  getAlternativeCourses,
  clearBylawCache,
  validateRegistrationFull,
};
