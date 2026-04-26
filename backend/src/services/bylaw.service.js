// =============================================================================
// Bylaw Service - Enforces ALL academic bylaws per FCIT 2024 regulations
// This service is called before any registration/grade action
// =============================================================================
const { query } = require('../config/database');
const C = require('../config/constants');
const gpaService = require('./gpa.service');

// ──────────────────────────────────────────────────────────────────────────────
// REGISTRATION VALIDATION
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Get maximum credit hours a student can register for in a semester
 * Implements Art. 11 rules
 */
async function getMaxCreditsForSemester(studentId, semesterId) {
  const studentRes = await query(
    'SELECT * FROM students WHERE id = $1',
    [studentId]
  );
  if (!studentRes.rows[0]) throw new Error('Student not found');
  const student = studentRes.rows[0];

  const semRes = await query('SELECT * FROM semesters WHERE id = $1', [semesterId]);
  const semester = semRes.rows[0];

  // Summer semester: max 7 credits (Art. 11)
  if (semester.semester_type === 'summer') return C.CREDIT_LIMITS.summer_max;

  // New student first semester: max 20 (Art. 11)
  if (student.semesters_enrolled === 0) return C.CREDIT_LIMITS.new_student_first_semester;

  // Level-based maximum
  const levelMax = C.CREDIT_LIMITS[student.current_level];

  // CGPA-based limit — iterate descending (first match wins)
  let cgpaMax = 40; // default for safety
  for (const rule of C.CGPA_CREDIT_LIMITS) {
    if (student.cgpa >= rule.minCgpa) {
      cgpaMax = rule.maxCredits;
      break;
    }
  }

  return Math.min(levelMax || 20, cgpaMax);
}

/**
 * Check if a student can register for a course
 * Returns { allowed: boolean, reason: string }
 */
async function canStudentRegisterCourse(studentId, courseId, semesterId) {
  const student = (await query('SELECT * FROM students WHERE id = $1', [studentId])).rows[0];
  if (!student) return { allowed: false, reason: 'Student not found' };

  if (['dismissed', 'withdrawn'].includes(student.academic_status)) {
    return { allowed: false, reason: `Student is ${student.academic_status} and cannot register` };
  }

  const semester = (await query('SELECT * FROM semesters WHERE id = $1', [semesterId])).rows[0];
  if (!semester) return { allowed: false, reason: 'Semester not found' };

  // Check semester is open for registration
  if (!['registration', 'active'].includes(semester.status)) {
    return { allowed: false, reason: 'Registration is not open for this semester' };
  }

  // Check add/drop deadline
  const now = new Date();
  const addDropDeadline = new Date(semester.add_drop_deadline);
  if (now > addDropDeadline) {
    return { allowed: false, reason: `Add/drop deadline has passed (${semester.add_drop_deadline})` };
  }

  const course = (await query('SELECT * FROM courses WHERE id = $1', [courseId])).rows[0];
  if (!course) return { allowed: false, reason: 'Course not found' };
  if (!course.is_active) return { allowed: false, reason: 'Course is not active' };

  // Check offering exists
  const offering = (await query(
    'SELECT * FROM course_offerings WHERE semester_id = $1 AND course_id = $2 AND is_active = TRUE',
    [semesterId, courseId]
  )).rows[0];
  if (!offering) return { allowed: false, reason: 'Course is not offered this semester' };

  // Check capacity
  if (offering.enrolled_count >= offering.capacity) {
    return { allowed: false, reason: 'Course section is full' };
  }

  // Check not already registered
  const existing = (await query(
    `SELECT e.* FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id
     WHERE e.student_id = $1 AND e.semester_id = $2 AND co.course_id = $3
     AND e.status IN ('registered', 'completed')`,
    [studentId, semesterId, courseId]
  )).rows[0];
  if (existing) return { allowed: false, reason: 'Already registered for this course' };

  // Check prerequisites (Art. 10)
  const prereqs = await query(
    'SELECT cp.prereq_course_id, c.code, c.name_en FROM course_prerequisites cp JOIN courses c ON c.id = cp.prereq_course_id WHERE cp.course_id = $1 AND cp.is_strict = TRUE',
    [courseId]
  );

  for (const prereq of prereqs.rows) {
    const passed = (await query(
      `SELECT 1 FROM enrollments e
       JOIN course_offerings co ON co.id = e.offering_id
       WHERE e.student_id = $1 AND co.course_id = $2
       AND e.status = 'completed' AND e.letter_grade NOT IN ('F','Abs','W','I')`,
      [studentId, prereq.prereq_course_id]
    )).rows[0];
    if (!passed) {
      return { allowed: false, reason: `Must pass ${prereq.code} (${prereq.name_en}) first` };
    }
  }

  // Special: graduation project requires 85+ credits
  if (course.category === 'project' && course.code === 'PR411') {
    if (student.total_credits_passed < C.PROJECT_MIN_CREDITS_PREREQ) {
      return {
        allowed: false,
        reason: `Must pass at least ${C.PROJECT_MIN_CREDITS_PREREQ} credit hours before registering for Graduation Project (1). Current: ${student.total_credits_passed}`
      };
    }
  }

  // Check credit hour limit for semester
  const currentCredits = (await query(
    `SELECT COALESCE(SUM(c.credits), 0) as total
     FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id JOIN courses c ON c.id = co.course_id
     WHERE e.student_id = $1 AND e.semester_id = $2 AND e.status IN ('registered')`,
    [studentId, semesterId]
  )).rows[0].total;

  const maxCredits = await getMaxCreditsForSemester(studentId, semesterId);

  if (parseInt(currentCredits) + course.credits > maxCredits) {
    return {
      allowed: false,
      reason: `Adding ${course.credits} credits would exceed your semester limit of ${maxCredits} (currently at ${currentCredits})`
    };
  }

  // Minimum check: summer semester
  if (semester.semester_type === 'summer') {
    // Allowed, just tracking
  }

  // Check improvement retake limits (Art. 23: max 3 voluntary retakes)
  const isRetake = (await query(
    `SELECT e.* FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id
     WHERE e.student_id = $1 AND co.course_id = $2 AND e.status = 'completed'`,
    [studentId, courseId]
  )).rows;

  if (isRetake.length > 0) {
    const hasPassed = isRetake.some(e => !['F', 'Abs'].includes(e.letter_grade));
    if (hasPassed) {
      // Voluntary improvement retake
      const voluntaryRetakeCount = (await query(
        `SELECT COUNT(*) FROM course_retake_log WHERE student_id = $1 AND retake_type = 'improvement'`,
        [studentId]
      )).rows[0].count;

      if (parseInt(voluntaryRetakeCount) >= C.MAX_VOLUNTARY_RETAKES) {
        return { allowed: false, reason: `Maximum ${C.MAX_VOLUNTARY_RETAKES} voluntary improvement retakes allowed` };
      }

      // Art. 23: only allowed if CGPA < 2.0 OR seeking improvement
      // The bylaw says CGPA threshold check for improvement, but also just allows retaking
      // We allow it if student wants to but cap grade at B
    }
  }

  return { allowed: true, reason: null };
}

/**
 * Validate withdrawal: check it's within deadline and above minimum credits
 */
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
    ? new Date(enrollment.add_drop_deadline)  // summer uses 2-week deadline
    : new Date(enrollment.withdrawal_deadline);

  if (now > deadline) {
    return { allowed: false, reason: `Withdrawal deadline has passed (${deadline.toISOString().split('T')[0]})` };
  }

  // Check minimum credits won't drop below 2 (Art. 13)
  const currentCredits = (await query(
    `SELECT COALESCE(SUM(c2.credits), 0) as total
     FROM enrollments e2 JOIN course_offerings co2 ON co2.id = e2.offering_id JOIN courses c2 ON c2.id = co2.course_id
     WHERE e2.student_id = $1 AND e2.semester_id = $2 AND e2.status = 'registered' AND e2.id != $3`,
    [studentId, enrollment.semester_id, enrollmentId]
  )).rows[0].total;

  const remaining = parseInt(currentCredits);
  if (remaining < C.CREDIT_LIMITS.min_per_semester && remaining > 0) {
    return { allowed: false, reason: `Cannot withdraw: would fall below minimum ${C.CREDIT_LIMITS.min_per_semester} credit hours` };
  }

  return { allowed: true };
}

// ──────────────────────────────────────────────────────────────────────────────
// ACADEMIC STANDING
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Check if student should receive academic warning (Art. 25)
 * First semester is exempt
 */
function shouldReceiveWarning(student) {
  if (student.semesters_enrolled <= 1) return false; // First semester exempt
  return student.cgpa < C.WARNING_CGPA_THRESHOLD;
}

/**
 * Check dismissal conditions (Art. 26)
 */
function checkDismissalConditions(student) {
  const reasons = [];

  if (student.consecutive_warnings >= C.MAX_CONSECUTIVE_WARNINGS) {
    reasons.push(`${C.MAX_CONSECUTIVE_WARNINGS} consecutive academic warnings`);
  }
  if (student.total_warnings >= C.MAX_TOTAL_WARNINGS) {
    reasons.push(`${C.MAX_TOTAL_WARNINGS} total academic warnings`);
  }
  if (student.semesters_enrolled > C.MAX_REGULAR_SEMESTERS) {
    reasons.push(`Exceeded maximum study duration (${C.MAX_REGULAR_SEMESTERS} regular semesters)`);
  }

  return {
    shouldDismiss: reasons.length > 0,
    reasons
  };
}

/**
 * Check honors degree eligibility (Art. 27)
 */
async function checkHonorsEligibility(studentId) {
  const student = (await query('SELECT * FROM students WHERE id = $1', [studentId])).rows[0];
  if (!student) return { eligible: false, reasons: ['Student not found'] };

  const reasons = [];

  if (student.cgpa < C.HONORS_MIN_CGPA)
    reasons.push(`CGPA ${student.cgpa} is below ${C.HONORS_MIN_CGPA} required for honors`);

  if (student.semesters_enrolled > C.HONORS_MAX_SEMESTERS)
    reasons.push(`Completed in ${student.semesters_enrolled} semesters (max ${C.HONORS_MAX_SEMESTERS})`);

  if (student.total_warnings > 0)
    reasons.push('Has academic warnings on record');

  // Check for any F grades
  const fGrades = (await query(
    `SELECT COUNT(*) FROM enrollments e
     JOIN course_offerings co ON co.id = e.offering_id
     JOIN courses c ON c.id = co.course_id
     WHERE e.student_id = $1 AND e.letter_grade = 'F' AND e.is_counted_in_gpa = TRUE AND c.is_credit_bearing = TRUE`,
    [studentId]
  )).rows[0].count;

  if (parseInt(fGrades) > 0)
    reasons.push('Has failed courses on record');

  // Check all grades >= B+ (3.2) for Very Good minimum
  const lowGrades = (await query(
    `SELECT COUNT(*) FROM enrollments e
     JOIN course_offerings co ON co.id = e.offering_id
     JOIN courses c ON c.id = co.course_id
     WHERE e.student_id = $1 AND e.is_counted_in_gpa = TRUE AND c.is_credit_bearing = TRUE
     AND e.status = 'completed' AND e.grade_points < 3.2`,
    [studentId]
  )).rows[0].count;

  if (parseInt(lowGrades) > 0)
    reasons.push('Not all grades are Very Good or higher');

  return { eligible: reasons.length === 0, reasons };
}

/**
 * Check leave of absence limits (Art. 15)
 */
function checkLeaveEligibility(student) {
  const issues = [];

  if (student.consecutive_leaves >= C.MAX_CONSECUTIVE_LEAVE_SEMESTERS) {
    issues.push(`Maximum ${C.MAX_CONSECUTIVE_LEAVE_SEMESTERS} consecutive leave semesters reached`);
  }
  if (student.total_leaves >= C.MAX_TOTAL_LEAVE_SEMESTERS) {
    issues.push(`Maximum ${C.MAX_TOTAL_LEAVE_SEMESTERS} total leave semesters reached`);
  }

  return { allowed: issues.length === 0, issues };
}

/**
 * Determine student level from credits passed
 */
function creditsToLevel(credits) {
  if (credits >= C.LEVELS.senior.min) return 'senior';
  if (credits >= C.LEVELS.junior.min) return 'junior';
  if (credits >= C.LEVELS.sophomore.min) return 'sophomore';
  return 'freshman';
}

/**
 * Check graduation eligibility
 */
async function checkGraduationEligibility(studentId) {
  const result = await query(
    'SELECT check_graduation_eligibility($1) as eligibility',
    [studentId]
  );
  const eligibility = result.rows[0]?.eligibility || {};

  // Add status_ok — true when academic standing is not dismissed/withdrawn
  // (the DB function bakes this into is_eligible but doesn't expose it separately)
  const student = (await query(
    'SELECT academic_status FROM students WHERE id = $1',
    [studentId]
  )).rows[0];
  eligibility.status_ok = student
    ? !['dismissed', 'withdrawn'].includes(student.academic_status)
    : false;

  return eligibility;
}

module.exports = {
  getMaxCreditsForSemester,
  canStudentRegisterCourse,
  canWithdrawCourse,
  shouldReceiveWarning,
  checkDismissalConditions,
  checkHonorsEligibility,
  checkLeaveEligibility,
  creditsToLevel,
  checkGraduationEligibility,
};
