// =============================================================================
// Bylaw Service — Academic bylaw enforcement
// [B3-FIX] checkGraduationEligibility: correct JSON key extraction from DB function
// =============================================================================
const { query } = require('../config/database');
const C = require('../config/constants');
const gpaService = require('./gpa.service');

async function getMaxCreditsForSemester(studentId, semesterId) {
  const student = (await query('SELECT * FROM students WHERE id = $1', [studentId])).rows[0];
  if (!student) throw new Error('Student not found');
  const semester = (await query('SELECT * FROM semesters WHERE id = $1', [semesterId])).rows[0];
  if (!semester) throw new Error('Semester not found');

  if (semester.semester_type === 'summer') return C.CREDIT_LIMITS.summer_max;
  if (student.semesters_enrolled === 0) return C.CREDIT_LIMITS.new_student_first_semester;

  const levelMax = C.CREDIT_LIMITS[student.current_level] || 20;
  let cgpaMax = 40;
  for (const rule of C.CGPA_CREDIT_LIMITS) {
    if (student.cgpa >= rule.minCgpa) { cgpaMax = rule.maxCredits; break; }
  }
  return Math.min(levelMax, cgpaMax);
}

async function canStudentRegisterCourse(studentId, courseId, semesterId) {
  const student = (await query('SELECT * FROM students WHERE id = $1', [studentId])).rows[0];
  if (!student) return { allowed: false, reason: 'Student not found' };
  if (['dismissed', 'withdrawn'].includes(student.academic_status)) {
    return { allowed: false, reason: `Student is ${student.academic_status} and cannot register` };
  }

  const semester = (await query('SELECT * FROM semesters WHERE id = $1', [semesterId])).rows[0];
  if (!semester) return { allowed: false, reason: 'Semester not found' };
  if (!['registration', 'active'].includes(semester.status)) {
    return { allowed: false, reason: 'Registration is not open for this semester' };
  }

  const now = new Date();
  if (now > new Date(semester.add_drop_deadline)) {
    return { allowed: false, reason: `Add/drop deadline has passed (${semester.add_drop_deadline})` };
  }

  const course = (await query('SELECT * FROM courses WHERE id = $1', [courseId])).rows[0];
  if (!course || !course.is_active) return { allowed: false, reason: 'Course not found or inactive' };

  const offering = (await query(
    'SELECT * FROM course_offerings WHERE semester_id = $1 AND course_id = $2 AND is_active = TRUE LIMIT 1',
    [semesterId, courseId]
  )).rows[0];
  if (!offering) return { allowed: false, reason: 'Course is not offered this semester' };
  if (offering.enrolled_count >= offering.capacity) return { allowed: false, reason: 'Course section is full' };

  const existing = (await query(
    `SELECT e.* FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id
     WHERE e.student_id = $1 AND e.semester_id = $2 AND co.course_id = $3
       AND e.status IN ('registered','completed')`,
    [studentId, semesterId, courseId]
  )).rows[0];
  if (existing) return { allowed: false, reason: 'Already registered for this course' };

  // Prerequisites
  const prereqs = (await query(
    `SELECT cp.prereq_course_id, c.code, c.name_en
     FROM course_prerequisites cp JOIN courses c ON c.id = cp.prereq_course_id
     WHERE cp.course_id = $1 AND cp.is_strict = TRUE`,
    [courseId]
  )).rows;

  for (const prereq of prereqs) {
    const passed = (await query(
      `SELECT 1 FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id
       WHERE e.student_id = $1 AND co.course_id = $2
         AND e.status = 'completed' AND e.letter_grade NOT IN ('F','Abs','W','I')`,
      [studentId, prereq.prereq_course_id]
    )).rows[0];
    if (!passed) {
      return { allowed: false, reason: `Must pass ${prereq.code} (${prereq.name_en}) first` };
    }
  }

  if (course.category === 'project' && course.code === 'PR411') {
    if (student.total_credits_passed < C.PROJECT_MIN_CREDITS_PREREQ) {
      return {
        allowed: false,
        reason: `Must pass at least ${C.PROJECT_MIN_CREDITS_PREREQ} credits before Graduation Project (1). Current: ${student.total_credits_passed}`
      };
    }
  }

  const currentCredits = (await query(
    `SELECT COALESCE(SUM(c.credits), 0) as total
     FROM enrollments e JOIN course_offerings co ON co.id = e.offering_id JOIN courses c ON c.id = co.course_id
     WHERE e.student_id = $1 AND e.semester_id = $2 AND e.status = 'registered'`,
    [studentId, semesterId]
  )).rows[0].total;

  const maxCredits = await getMaxCreditsForSemester(studentId, semesterId);
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

  if (parseInt(currentCredits) < C.CREDIT_LIMITS.min_per_semester && parseInt(currentCredits) > 0) {
    return { allowed: false, reason: `Cannot withdraw: would fall below minimum ${C.CREDIT_LIMITS.min_per_semester} credit hours` };
  }

  return { allowed: true };
}

function shouldReceiveWarning(student) {
  if (student.semesters_enrolled <= 1) return false;
  return student.cgpa < C.WARNING_CGPA_THRESHOLD;
}

function checkDismissalConditions(student) {
  const reasons = [];
  if (student.consecutive_warnings >= C.MAX_CONSECUTIVE_WARNINGS)
    reasons.push(`${C.MAX_CONSECUTIVE_WARNINGS} consecutive academic warnings`);
  if (student.total_warnings >= C.MAX_TOTAL_WARNINGS)
    reasons.push(`${C.MAX_TOTAL_WARNINGS} total academic warnings`);
  if (student.semesters_enrolled > C.MAX_REGULAR_SEMESTERS)
    reasons.push(`Exceeded maximum study duration (${C.MAX_REGULAR_SEMESTERS} regular semesters)`);
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
  if (student.total_warnings > 0)
    reasons.push('Has academic warnings on record');

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
       AND e.grade_points < 3.2`,
    [studentId]
  )).rows[0].count;
  if (parseInt(lowGrades) > 0) reasons.push('Not all grades are Very Good (B+) or higher');

  return { eligible: reasons.length === 0, reasons };
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
  if (credits >= C.LEVELS.senior.min)    return 'senior';
  if (credits >= C.LEVELS.junior.min)    return 'junior';
  if (credits >= C.LEVELS.sophomore.min) return 'sophomore';
  return 'freshman';
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

    const training1 = (await query(
      'SELECT 1 FROM training_records WHERE student_id=$1 AND training_number=1 AND status=$2', [studentId, 'completed']
    )).rows[0];
    const training2 = (await query(
      'SELECT 1 FROM training_records WHERE student_id=$1 AND training_number=2 AND status=$2', [studentId, 'completed']
    )).rows[0];
    const project1 = (await query(
      'SELECT 1 FROM graduation_projects WHERE student_id=$1 AND part=1 AND is_passed=TRUE', [studentId]
    )).rows[0];
    const project2 = (await query(
      'SELECT 1 FROM graduation_projects WHERE student_id=$1 AND part=2 AND is_passed=TRUE', [studentId]
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
      credits_required: 132,
      credits_met: student.total_credits_passed >= 132,
      cgpa: student.cgpa,
      cgpa_met: student.cgpa >= 2.0,
      training1_done: !!training1,
      training2_done: !!training2,
      project1_done: !!project1,
      project2_done: !!project2,
      no_pending_f_grades: !fGrades,
      remedial_math_ok: !student.remedial_math_required || student.remedial_math_passed,
      status_ok: !['dismissed', 'withdrawn'].includes(student.academic_status),
      is_eligible: student.total_credits_passed >= 132 && student.cgpa >= 2.0 &&
        !!training1 && !!training2 && !!project1 && !!project2 && !fGrades &&
        !['dismissed', 'withdrawn'].includes(student.academic_status),
    };
  }
}

module.exports = {
  getMaxCreditsForSemester, canStudentRegisterCourse, canWithdrawCourse,
  shouldReceiveWarning, checkDismissalConditions, checkHonorsEligibility,
  checkLeaveEligibility, creditsToLevel, checkGraduationEligibility,
};
