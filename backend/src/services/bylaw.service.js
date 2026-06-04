// =============================================================================
// Bylaw Service — Academic bylaw enforcement
// [B3-FIX] checkGraduationEligibility: correct JSON key extraction from DB function
// =============================================================================
const { query } = require('../config/database');
const C = require('../config/constants');
const gpaService = require('./gpa.service');
const fs = require('fs');
const path = require('path');

const DEFAULT_BYLAW = {
  metadata: {
    version: "2024-7-73",
    total_credit_hours: 138,
    passing_cgpa: 2.0,
    degree: "Bachelor of Computers and Information"
  },
  departments: [],
  levels: [],
  semesters: {
    // Keys match academic-regulations.json exactly: fall/spring in regular, summer in summer
    regular: { types: { fall: 'الترم الأول', spring: 'الترم الثاني' }, weeks: 15 },
    summer: { types: { summer: 'الترم الصيفي' }, weeks: 8 }
  },
  grading_system: [],
  academic_status: {
    warning_threshold: 2.0,
    // Art. 26: dismiss after 4 consecutive or 6 non-consecutive warnings
    dismissal: { consecutive_warnings: 4, non_consecutive_warnings: 6 }
  },
  registration_rules: {
    // Art. 11: minimum 9 credit hours per regular semester
    regular_semester: { min_hours: 9, max_hours_new_students: 18, max_hours_by_gpa: [] },
    summer_semester: { max_hours: 9, max_hours_graduating: 12 }
  },
  curriculum: {
    university_requirements: { mandatory: [], elective: [] },
    faculty_requirements: { basic_sciences: [], basic_computing: [] },
    specialization_requirements: {
      CS: { mandatory: [], elective: [] },
      IS: { mandatory: [], elective: [] },
      IT: { mandatory: [], elective: [] }
    }
  }
};

/**
 * In-memory cache for the bylaw JSON.
 * TTL: indefinite until process restart or clearBylawCache() is called explicitly.
 * Always call clearBylawCache() after any bylaw_config DB update.
 */
let bylawCache = null;
function getBylaw() {
  if (!bylawCache) {
    try {
      // Try local dev path first
      let p = path.join(__dirname, '../../../database/academic-regulations.json');
      if (!fs.existsSync(p)) {
        // Fallback for Docker where backend is mounted at /app and database at /app/database
        p = path.join(process.cwd(), 'database/academic-regulations.json');
      }
      bylawCache = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (err) {
      require('./../utils/logger').error('Failed to read bylaw JSON, using safe default', err);
      bylawCache = JSON.parse(JSON.stringify(DEFAULT_BYLAW));
    }
  }
  return bylawCache;
}

function clearBylawCache() {
  bylawCache = null;
}

async function getMaxCreditsForSemester(studentId, semesterId, { student, semester } = {}) {
  const s = student ?? (await query('SELECT * FROM students WHERE id = $1', [studentId])).rows[0];
  if (!s) throw new Error('Student not found');
  const sem = semester ?? (await query('SELECT * FROM semesters WHERE id = $1', [semesterId])).rows[0];
  if (!sem) throw new Error('Semester not found');

  const bylaw = getBylaw();
  if (sem.semester_type === 'summer') {
    const rules = bylaw.registration_rules || {};
    const sr = rules.summer_semester || {};
    return sr.max_hours || sr.summer_max_credits || sr.max_credits_summer || rules.summer_max_credits || rules.max_credits_summer || 9;
  }
  if (s.semesters_enrolled === 0) return bylaw.registration_rules.regular_semester.max_hours_new_students;

  const cgpa = parseFloat(s.cgpa || 0);
  const rules = bylaw.registration_rules.regular_semester.max_hours_by_gpa;
  let maxCredits = 18; // Fallback default
  for (const rule of rules) {
    if (cgpa >= rule.min_cgpa) {
      maxCredits = rule.max_hours;
      break;
    }
  }

  // Art. 11 Graduating student exception: if remaining credits ≤ 21, always allow up to 21h
  // regardless of CGPA bracket, so the student can finish in one semester.
  const totalRequired = bylaw.metadata.total_credit_hours;
  const passed = s.total_credits_passed || 0;
  const remaining = totalRequired - passed;
  if (remaining <= 21) {
    maxCredits = Math.max(maxCredits, 21);
  }

  return maxCredits;
}

async function canStudentRegisterCourse(studentId, courseId, semesterId, offeringId = null) {
  const student = (await query('SELECT * FROM students WHERE id = $1', [studentId])).rows[0];
  if (!student) return { allowed: false, reason: 'Student not found' };
  if (student.academic_status !== 'active') {
    return { allowed: false, reason: `Student is ${student.academic_status} and cannot register` };
  }

  const semester = (await query('SELECT * FROM semesters WHERE id = $1', [semesterId])).rows[0];
  if (!semester) return { allowed: false, reason: 'Semester not found' };
  if (!['registration', 'active'].includes(semester.status)) {
    return { allowed: false, reason: 'Registration is not open for this semester' };
  }

  const now = new Date();
  // Add/drop deadline only applies when semester is ACTIVE (post-registration)
  // During 'registration' status there is no add/drop deadline yet — full registration is open
  if (semester.status === 'active' && now > new Date(semester.add_drop_deadline)) {
    return { allowed: false, reason: `Add/drop deadline has passed (${semester.add_drop_deadline})` };
  }

  const course = (await query('SELECT * FROM courses WHERE id = $1', [courseId])).rows[0];
  if (!course || !course.is_active) return { allowed: false, reason: 'Course not found or inactive' };

  let offering;
  if (offeringId) {
    offering = (await query(
      'SELECT * FROM course_offerings WHERE id = $1 AND is_active = TRUE',
      [offeringId]
    )).rows[0];
  } else {
    offering = (await query(
      'SELECT * FROM course_offerings WHERE semester_id = $1 AND course_id = $2 AND is_active = TRUE LIMIT 1',
      [semesterId, courseId]
    )).rows[0];
  }

  if (!offering) return { allowed: false, reason: 'Course is not offered this semester' };
  if (offering.enrolled_count >= offering.capacity) return { allowed: false, reason: 'Course is full' };

  // [AUDIT-RC-006 FIX] Restore specialization-based curriculum plan restriction.
  // A student may only register courses that appear in their specialization's
  // curriculum plan OR in the GENERAL (Level 1-2 shared) plan.
  // Exceptions: project courses (PR411/PR412) handled separately, training via
  // training_records only, existing enrollments always visible for status tracking.
  // Note: courses shared across specializations (e.g. CS313 in IT plan, IT311 in CS plan)
  // are correctly covered because they ARE in the student's specialization's curriculum_plans.
  if (course.category !== 'project' && course.category !== 'training') {
    const studentSpec = student.specialization || 'GENERAL';
    const inPlan = (await query(
      `SELECT 1 FROM curriculum_plans cp
       WHERE cp.course_id = $1
         AND cp.specialization = ANY($2::text[])
       LIMIT 1`,
      [courseId, [studentSpec, 'GENERAL']]
    )).rows[0];

    if (!inPlan) {
      return {
        allowed: false,
        reason: `هذا المقرر غير مدرج في خطتك الدراسية (${studentSpec}). يُرجى التواصل مع المرشد الأكاديمي.`
      };
    }
  }

  const existing = (await query(
    `SELECT e.* FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id
     WHERE e.student_id = $1 AND e.semester_id = $2 AND co.course_id = $3
       AND e.status IN ('registered','completed')`,
    [studentId, semesterId, courseId]
  )).rows[0];
  if (existing) return { allowed: false, reason: 'Already registered for this course' };

  // Check prerequisites from the database
  const prereqs = (await query(
    `SELECT c2.code, c2.name_ar, cp.is_strict,
            EXISTS(
              SELECT 1 FROM enrollments e2
              JOIN course_offerings co2 ON co2.id = e2.offering_id
              WHERE e2.student_id = $1 AND co2.course_id = cp.prereq_course_id
                AND e2.status = 'completed' AND e2.letter_grade NOT IN ('F','Abs','W','I')
            ) AS is_passed
     FROM course_prerequisites cp
     JOIN courses c2 ON c2.id = cp.prereq_course_id
     WHERE cp.course_id = $2`,
    [studentId, courseId]
  )).rows;

  const failed = prereqs.filter(p => !p.is_passed);
  if (failed.length > 0) {
    return {
      allowed: false,
      reason: `يجب اجتياز المتطلب السابق أولاً: ${failed.map(p => `${p.code} (${p.name_ar})`).join('، ')}`
    };
  }

  if (course.category === 'project') {
    // Official bylaw pages 26/30/34: Graduation Project I requires 85 passed credits.
    // Each specialization has its own project codes (PR411/412 CS, PR421/422 IS, PR431/432 IT).
    const specCodes = C.PROJECT_CODES_BY_SPEC[student.specialization || 'CS'] || C.PROJECT_CODES_BY_SPEC.CS;
    if (course.code === specCodes.part1) {
      if (student.total_credits_passed < C.PROJECT_MIN_CREDITS_PREREQ) {
        return {
          allowed: false,
          reason: `يجب اجتياز ${C.PROJECT_MIN_CREDITS_PREREQ} ساعة معتمدة على الأقل قبل تسجيل مشروع التخرج (1). رصيدك الحالي: ${student.total_credits_passed} ساعة.`
        };
      }
    }
    if (course.code === specCodes.part2) {
      // Graduation Project II requires completion of Graduation Project I
      const part1Done = (await query(
        `SELECT 1 FROM enrollments e
         JOIN course_offerings co ON co.id = e.offering_id
         JOIN courses c ON c.id = co.course_id
         WHERE e.student_id = $1 AND c.code = $2
           AND e.status = 'completed'
           AND e.letter_grade NOT IN ('F','Abs','W','I','Con')
         LIMIT 1`,
        [studentId, specCodes.part1]
      )).rows[0];
      if (!part1Done) {
        return {
          allowed: false,
          reason: `يجب اجتياز مشروع التخرج (1) قبل التسجيل في مشروع التخرج (2).`
        };
      }
    }
  }

  const currentCredits = (await query(
    `SELECT COALESCE(SUM(c.credits), 0) as total
     FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id JOIN courses c ON c.id = co.course_id
     WHERE e.student_id = $1 AND e.semester_id = $2 AND e.status = 'registered'`,
    [studentId, semesterId]
  )).rows[0].total;

  const maxCredits = await getMaxCreditsForSemester(studentId, semesterId, { student, semester });
  if (parseInt(currentCredits) + course.credits > maxCredits) {
    return {
      allowed: false,
      reason: `Adding ${course.credits} cr would exceed your ${maxCredits}-credit limit (currently at ${currentCredits})`
    };
  }

  // Improvement retake cap
  const isRetake = (await query(
    `SELECT e.* FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id
     WHERE e.student_id = $1 AND co.course_id = $2 AND e.status = 'completed'`,
    [studentId, courseId]
  )).rows;

  if (isRetake.length > 0) {
    const hasPassed = isRetake.some(e => !['F', 'Abs'].includes(e.letter_grade));
    if (hasPassed) {
      const voluntaryCount = (await query(
        `SELECT COUNT(*) FROM course_retake_log WHERE student_id = $1 AND retake_type = 'improvement'`,
        [studentId]
      )).rows[0].count;
      if (parseInt(voluntaryCount) >= C.MAX_VOLUNTARY_RETAKES) {
        return { allowed: false, reason: `Maximum ${C.MAX_VOLUNTARY_RETAKES} voluntary improvement retakes allowed` };
      }
    }
  }

  return { allowed: true, reason: null };
}

async function canWithdrawCourse(enrollmentId, studentId) {
  const enrollment = (await query(
    `SELECT e.*, c.credits, c.name_en, c.code,
            sem.withdrawal_deadline, sem.add_drop_deadline, sem.semester_type
     FROM enrollments e
     JOIN course_offerings co ON co.id = e.offering_id
     JOIN courses c ON c.id = co.course_id
     JOIN semesters sem ON sem.id = e.semester_id
     WHERE e.id = $1 AND e.student_id = $2`,
    [enrollmentId, studentId]
  )).rows[0];

  if (!enrollment) return { allowed: false, reason: 'Enrollment not found' };
  if (enrollment.status !== 'registered') return { allowed: false, reason: 'Course is not in registered status' };

  const now = new Date();
  const deadline = enrollment.semester_type === 'summer'
    ? new Date(enrollment.add_drop_deadline)
    : new Date(enrollment.withdrawal_deadline);

  if (now > deadline) {
    return { allowed: false, reason: `Withdrawal deadline has passed (${deadline.toISOString().split('T')[0]})` };
  }

  const currentCredits = (await query(
    `SELECT COALESCE(SUM(c2.credits), 0) as total
     FROM enrollments e2 JOIN course_offerings co2 ON co2.id = e2.offering_id JOIN courses c2 ON c2.id = co2.course_id
     WHERE e2.student_id = $1 AND e2.semester_id = $2 AND e2.status = 'registered' AND e2.id != $3`,
    [studentId, enrollment.semester_id, enrollmentId]
  )).rows[0].total;

  // Art. 11/13a: block withdrawal if remaining credits would fall below min_hours (9h floor)
  const minHours = getBylaw().registration_rules.regular_semester.min_hours;
  if (parseInt(currentCredits) < minHours) {
    return { allowed: false, reason: `Cannot withdraw: would fall below minimum ${minHours} credit hours` };
  }

  return { allowed: true };
}

function shouldReceiveWarning(student) {
  // Art. 25: first semester exempt. semesters_enrolled here is AFTER the increment
  // performed in finalizeSemester, so a student in their first semester will have
  // semesters_enrolled === 1 at this point — exempt correctly when <= 1.
  if (student.semesters_enrolled <= 1) return false;
  return student.cgpa < getBylaw().academic_status.warning_threshold;
}

function checkDismissalConditions(student) {
  const bylaw = getBylaw();
  const dis = bylaw.academic_status.dismissal;
  const reasons = [];
  if (student.consecutive_warnings >= dis.consecutive_warnings)
    reasons.push(`${dis.consecutive_warnings} consecutive academic warnings`);
  if (student.total_warnings >= dis.non_consecutive_warnings)
    reasons.push(`${dis.non_consecutive_warnings} total academic warnings`);
  // Optional max years calculation (3 regular years = 6 semesters above normal)
  return { shouldDismiss: reasons.length > 0, reasons };
}

async function checkHonorsEligibility(studentId) {
  const student = (await query('SELECT * FROM students WHERE id = $1', [studentId])).rows[0];
  if (!student) return { eligible: false, reasons: ['Student not found'] };

  const reasons = [];
  if (student.cgpa < C.HONORS_MIN_CGPA)
    reasons.push(`CGPA ${student.cgpa} is below ${C.HONORS_MIN_CGPA} required for honors`);
  if (student.semesters_enrolled > C.HONORS_MAX_SEMESTERS)
    reasons.push(`Completed in ${student.semesters_enrolled} semesters (max ${C.HONORS_MAX_SEMESTERS})`);
  // Art. 27: disqualifiers are failed or barred courses — academic warnings alone are NOT a disqualifier

  const fGrades = (await query(
    `SELECT COUNT(*) FROM enrollments e
     JOIN course_offerings co ON co.id = e.offering_id
     JOIN courses c ON c.id = co.course_id
     WHERE e.student_id = $1 AND e.letter_grade = 'F'
       AND e.is_counted_in_gpa = TRUE AND c.is_credit_bearing = TRUE`,
    [studentId]
  )).rows[0].count;
  if (parseInt(fGrades) > 0) reasons.push('Has failed courses on record');

  const lowGrades = (await query(
    `SELECT COUNT(*) FROM enrollments e
     JOIN course_offerings co ON co.id = e.offering_id
     JOIN courses c ON c.id = co.course_id
     WHERE e.student_id = $1 AND e.is_counted_in_gpa = TRUE
       AND c.is_credit_bearing = TRUE AND e.status = 'completed'
       AND e.grade_points < $2`,
    [studentId, C.HONORS_MIN_GRADE]
  )).rows[0].count;
  if (parseInt(lowGrades) > 0) reasons.push(`Not all grades are ${C.HONORS_MIN_GRADE} or higher`);

  return { eligible: reasons.length === 0, is_honors_eligible: reasons.length === 0, reasons };
}

function checkLeaveEligibility(student) {
  const issues = [];
  if (student.consecutive_leaves >= C.MAX_CONSECUTIVE_LEAVE_SEMESTERS)
    issues.push(`Maximum ${C.MAX_CONSECUTIVE_LEAVE_SEMESTERS} consecutive leave semesters reached`);
  if (student.total_leaves >= C.MAX_TOTAL_LEAVE_SEMESTERS)
    issues.push(`Maximum ${C.MAX_TOTAL_LEAVE_SEMESTERS} total leave semesters reached`);
  return { allowed: issues.length === 0, issues };
}

function creditsToLevel(credits) {
  const safeCredits = parseInt(credits) || 0;
  const levels = getBylaw()?.levels;
  if (!Array.isArray(levels) || levels.length === 0) {
    return { id: 1, name_ar: 'الفرقة الأولى', name_en: 'First Year', min_credits: 0, max_credits: 27 };
  }
  // sort highest min_credits to lowest
  const sorted = [...levels].sort((a, b) => (b.min_credits || 0) - (a.min_credits || 0));
  for (const l of sorted) {
    if (safeCredits >= (l.min_credits || 0)) return l;
  }
  return sorted[sorted.length - 1] || { id: 1, name_ar: 'الفرقة الأولى', name_en: 'First Year', min_credits: 0, max_credits: 27 };
}

function getSemesterLabel(type, yearLabel) {
  try {
    const bylaw = getBylaw();
    let typeAr = type || '';
    if (type === 'first') typeAr = bylaw?.semesters?.regular?.types?.fall || 'الترم الأول';
    else if (type === 'second') typeAr = bylaw?.semesters?.regular?.types?.spring || 'الترم الثاني';
    else if (type === 'summer') typeAr = bylaw?.semesters?.summer?.types?.summer || 'الترم الصيفي';
    return yearLabel ? `${typeAr} ${yearLabel}` : typeAr;
  } catch {
    // Ultimate fallback — never crash
    const fallback = { first: 'الترم الأول', second: 'الترم الثاني', summer: 'الترم الصيفي' };
    const label = fallback[type] || type || '';
    return yearLabel ? `${label} ${yearLabel}` : label;
  }
}

/**
 * Computes the dynamic status of a semester based on current date, 
 * but respects manual early advancement from the database.
 */
function computeSemesterStatus(sem) {
  if (!sem) return 'upcoming';
  if (sem.status === 'closed') return 'closed';

  const statusScores = { 'upcoming': 0, 'registration': 1, 'active': 2, 'grading': 3, 'closed': 4 };

  const now = new Date();
  const regStart = new Date(sem.registration_start || sem.startDate);
  const regEnd = new Date(sem.registration_end || sem.endDate);
  const start = new Date(sem.start_date || sem.startDate);
  const end = new Date(sem.end_date || sem.endDate);

  regEnd.setHours(23, 59, 59, 999);
  end.setHours(23, 59, 59, 999);

  let dateStatus = 'upcoming';
  if (now >= regStart && now <= regEnd) dateStatus = 'registration';
  else if (now > regEnd && now <= end) dateStatus = 'active';
  else if (now > end) dateStatus = 'grading';

  const dbStatusScore = statusScores[sem.status] || 0;
  const dateStatusScore = statusScores[dateStatus] || 0;

  // Return whichever status is further along the timeline
  return dbStatusScore > dateStatusScore ? sem.status : dateStatus;
}

// [B3-FIX] Correct extraction of JSONB result from check_graduation_eligibility()
async function checkGraduationEligibility(studentId) {
  try {
    const result = await query(
      'SELECT check_graduation_eligibility($1::uuid) as data',
      [studentId]
    );

    // DB function returns JSONB — driver returns as JS object already
    const eligibility = result.rows[0]?.data || {};

    // Add status_ok (not included in DB fn result)
    const student = (await query(
      'SELECT academic_status FROM students WHERE id = $1', [studentId]
    )).rows[0];

    eligibility.status_ok = student
      ? !['dismissed', 'withdrawn'].includes(student.academic_status)
      : false;

    return eligibility;
  } catch (err) {
    // [B3-FIX] Fallback: if DB function missing (enhancements.sql not run), compute inline
    const student = (await query('SELECT * FROM students WHERE id = $1', [studentId])).rows[0];
    if (!student) return { is_eligible: false, credits_met: false, cgpa_met: false };

    // [AUDIT-I-26 FIX] Read passing CGPA from bylaw JSON, not hardcoded 2.0
    const passingCgpa = getBylaw().metadata?.passing_cgpa ?? 2.0;
    const creditsRequired = getBylaw().metadata?.total_credit_hours ?? 138;

    const training1 = (await query(
      'SELECT 1 FROM training_records WHERE student_id=$1 AND training_number=1 AND status=$2', [studentId, 'completed']
    )).rows[0];
    const training2 = (await query(
      'SELECT 1 FROM training_records WHERE student_id=$1 AND training_number=2 AND status=$2', [studentId, 'completed']
    )).rows[0];

    // [AUDIT-RC-005 / BYLAW-027 FIX] Check BOTH graduation_projects table AND enrollment completions
    // Use spec-specific project codes from official bylaw (PR411/412=CS, PR421/422=IS, PR431/432=IT)
    const specCodes = getBylaw()?.project_codes_by_spec?.[student.specialization]
      || C.PROJECT_CODES_BY_SPEC?.[student.specialization]
      || { part1: 'PR411', part2: 'PR412' };

    const project1 = (await query(
      `SELECT 1 FROM graduation_projects
       WHERE student_id=$1 AND part=1 AND is_passed=TRUE
       UNION ALL
       SELECT 1 FROM enrollments e
       JOIN course_offerings co ON co.id=e.offering_id
       JOIN courses c ON c.id=co.course_id
       WHERE e.student_id=$1 AND c.code=$2
         AND e.status='completed' AND e.letter_grade NOT IN ('F','Abs','W','I','Con')
       LIMIT 1`,
      [studentId, specCodes.part1]
    )).rows[0];
    const project2 = (await query(
      `SELECT 1 FROM graduation_projects
       WHERE student_id=$1 AND part=2 AND is_passed=TRUE
       UNION ALL
       SELECT 1 FROM enrollments e
       JOIN course_offerings co ON co.id=e.offering_id
       JOIN courses c ON c.id=co.course_id
       WHERE e.student_id=$1 AND c.code=$2
         AND e.status='completed' AND e.letter_grade NOT IN ('F','Abs','W','I','Con')
       LIMIT 1`,
      [studentId, specCodes.part2]
    )).rows[0];

    const fGrades = (await query(
      `SELECT 1 FROM enrollments e JOIN course_offerings co ON co.id=e.offering_id
       JOIN courses c ON c.id=co.course_id
       WHERE e.student_id=$1 AND e.letter_grade='F' AND e.is_counted_in_gpa=TRUE AND c.is_credit_bearing=TRUE LIMIT 1`,
      [studentId]
    )).rows[0];

    return {
      student_id: studentId,
      credits_passed: student.total_credits_passed,
      credits_required: creditsRequired,
      credits_met: student.total_credits_passed >= creditsRequired,
      cgpa: student.cgpa,
      cgpa_met: student.cgpa >= passingCgpa,
      training1_done: !!training1,
      training2_done: !!training2,
      project1_done: !!project1,
      project2_done: !!project2,
      no_pending_f_grades: !fGrades,
      remedial_math_ok: !student.remedial_math_required || student.remedial_math_passed,
      status_ok: !['dismissed', 'withdrawn'].includes(student.academic_status),
      is_eligible: student.total_credits_passed >= creditsRequired && student.cgpa >= passingCgpa &&
        !!training1 && !!training2 && !!project1 && !!project2 && !fGrades &&
        !['dismissed', 'withdrawn'].includes(student.academic_status),
    };
  }
}

module.exports = {
  getMaxCreditsForSemester, canStudentRegisterCourse, canWithdrawCourse,
  shouldReceiveWarning, checkDismissalConditions, checkHonorsEligibility,
  checkLeaveEligibility, creditsToLevel, checkGraduationEligibility, clearBylawCache, getBylaw,
  getSemesterLabel,
  computeSemesterStatus,
};
