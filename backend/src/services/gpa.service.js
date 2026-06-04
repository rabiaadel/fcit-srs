// =============================================================================
// GPA Service - All grade calculation logic per FCIT Bylaws 2024
// =============================================================================
const { MIN_PASSING_TOTAL_PCT, MIN_PASSING_FINAL_PCT } = require('../config/constants');
const fs = require('fs');
const path = require('path');

// NOTE: Do NOT top-level require bylaw.service here.
// bylaw.service.js also requires gpa.service.js, creating a circular dependency.
// Node.js resolves circular deps by returning a partially-evaluated module, so
// { getBylaw } would be undefined at the time gpa.service.js first loads.
// Fix: use a lazy require() inside each function that needs getBylaw().
// Node caches modules after first load so there is no performance penalty.

/**
 * Convert a percentage score to grade points (Art. 17)
 */
function percentageToPoints(pct) {
  if (pct === null || pct === undefined) return 0;
  // Lazy require breaks the circular dependency with bylaw.service
  const { getBylaw } = require('./bylaw.service');
  const scale = getBylaw().grading_system;
  for (const g of scale) {
    if (pct >= g.min_percent) return g.points;
  }
  return 0;
}

/**
 * Convert a percentage score to letter grade (Art. 17)
 */
function percentageToLetter(pct) {
  if (pct === null || pct === undefined) return 'F';
  // Lazy require breaks the circular dependency with bylaw.service
  const { getBylaw } = require('./bylaw.service');
  const scale = getBylaw().grading_system;
  for (const g of scale) {
    if (pct >= g.min_percent) return g.grade;
  }
  return 'F';
}

/**
 * Convert letter grade to grade points.
 * [AUDIT-I-20 FIX] Reads from bylaw JSON grading_system instead of a hardcoded
 * map, so any admin-configured grade scale changes are honoured automatically.
 * Special grades (W, I, Con, P) that have no point value return null
 * (excluded from GPA computation by calculateCGPA / calculateSemesterGPA).
 */
function letterToPoints(letter) {
  // Special non-numeric grades — always null regardless of bylaw
  if (['W', 'I', 'Con', 'P', null, undefined].includes(letter)) return null;

  // Lazy require to avoid circular dependency (bylaw.service ↔ gpa.service)
  try {
    const { getBylaw } = require('./bylaw.service');
    const scale = getBylaw().grading_system;
    if (Array.isArray(scale) && scale.length > 0) {
      const entry = scale.find(g => g.grade === letter);
      if (entry !== undefined) return entry.points ?? 0;
    }
  } catch (_) {
    // bylaw not yet loaded or circular dep — fall through to static fallback
  }

  // Static fallback — matches academic-regulations.json values exactly.
  // Only reached if getBylaw() fails (e.g., during unit tests without filesystem).
  const fallback = {
    'A+': 4.0, 'A': 3.7, 'A-': 3.4,
    'B+': 3.2, 'B': 3.0, 'B-': 2.8,
    'C+': 2.6, 'C': 2.4, 'C-': 2.2,
    'D+': 2.0, 'D': 1.5, 'D-': 1.0,
    'F':  0.0, 'Abs': 0.0,
  };
  return fallback[letter] ?? null;
}

/**
 * Calculate total course grade from components.
 * Grades are raw marks: midterm(0-20) + coursework(0-10) + practical(0-10) + final(0-60) = 0-100
 * Special rules: if final_exam < 30 -> automatic fail
 */
function calculateTotalGrade({ midterm = null, coursework = null, practical = null, final_exam = null }) {
  // [FIX-GRADE-NULL] When the doctor has not entered ANY component, return null
  // so we never store a spurious total_grade=0 / letter_grade='F' for students
  // who simply haven't been graded yet. (JS defaults only fire on `undefined`,
  // not `null`, so we must guard explicitly here.)
  if (midterm === null && coursework === null && practical === null && final_exam === null) {
    return null;
  }
  const total =
    parseFloat(midterm    ?? 0) +
    parseFloat(coursework ?? 0) +
    parseFloat(practical  ?? 0) +
    parseFloat(final_exam ?? 0);
  return Math.round(total * 100) / 100;
}

/**
 * Determine if a student passed a course (Art. 16)
 * Requirements:
 *  - Total grade >= MIN_PASSING_TOTAL_PCT (40% per Art. 16)
 *  - Final exam >= MIN_PASSING_FINAL_PCT (30% of final component)
 *  - Grade below 40% = F; 40-49% = D- (0.7 pts); 50%+ = normal scale
 */
function isCoursePassed(totalPct, finalExamPct) {
  if (finalExamPct < MIN_PASSING_FINAL_PCT) return false;
  // Art. 16: minimum total grade is 50% (D- grade starts at 50%).
  // MIN_PASSING_TOTAL_PCT = 50 is correct — below 50% is an F.
  if (totalPct < MIN_PASSING_TOTAL_PCT) return false;
  return true;
}

/**
 * Calculate semester GPA from a list of enrollments
 * @param {Array} enrollments - [{credits, grade_points, is_counted_in_gpa, is_credit_bearing}]
 */
function calculateSemesterGPA(enrollments) {
  let totalQualityPoints = 0;
  let totalCredits = 0;

  for (const e of enrollments) {
    if (!e.is_counted_in_gpa || !e.is_credit_bearing) continue;
    if (e.grade_points === null || e.grade_points === undefined) continue;
    totalQualityPoints += e.credits * e.grade_points;
    totalCredits += e.credits;
  }

  if (totalCredits === 0) return 0;
  // Art. 18: semester GPA rounds to 2 decimal places
  return Math.round((totalQualityPoints / totalCredits) * 100) / 100;
}

/**
 * Compute CGPA from all completed credit-bearing enrollments
 * Only the "counted" (highest) attempt counts per course
 */
function calculateCGPA(allEnrollments) {
  let totalQualityPoints = 0;
  let totalCredits = 0;

  for (const e of allEnrollments) {
    if (!e.is_counted_in_gpa) continue;
    if (!e.is_credit_bearing) continue;
    if (e.status !== 'completed') continue;
    if (e.grade_points === null || e.grade_points === undefined) continue;
    totalQualityPoints += e.credits * e.grade_points;
    totalCredits += e.credits;
  }

  if (totalCredits === 0) return 0;
  return Math.round((totalQualityPoints / totalCredits) * 1000) / 1000;
}

/**
 * Get CGPA classification (Art. 18, 20)
 */
function getCGPAClassification(cgpa) {
  if (cgpa >= 3.5) return 'Excellent';
  if (cgpa >= 3.0) return 'Very Good';
  if (cgpa >= 2.5) return 'Good';
  if (cgpa >= 2.0) return 'Satisfactory';
  if (cgpa >= 1.0) return 'Weak';
  return 'Poor';
}

/**
 * Check if grade is a passing grade
 */
function isPassingGrade(letterGrade) {
  return !['F', 'Abs', null, undefined].includes(letterGrade) &&
    !['W', 'I', 'Con'].includes(letterGrade);
}

/**
 * Validate grade entry: check all component minimums
 */
function validateGradeEntry({ midterm, coursework, practical, final_exam }) {
  const errors = [];
  const check = (name, val, max) => {
    if (val === undefined || val === null || val === '') return;
    const n = parseFloat(val);
    if (isNaN(n))   errors.push(`${name} must be a number`);
    else if (n < 0) errors.push(`${name} cannot be negative`);
    else if (n > max) errors.push(`${name} cannot exceed ${max}`);
  };
  check('Midterm grade',    midterm,    20);
  check('Coursework grade', coursework, 10);
  check('Practical grade',  practical,  10);
  check('Final exam grade', final_exam, 60);
  return errors;
}

/**
 * Apply improvement retake cap: grade_points capped at 3.0 (B)
 * per Art. 22, 23
 */
function applyRetakeCap(gradePoints) {
  return Math.min(gradePoints, 3.0);
}

module.exports = {
  percentageToPoints,
  percentageToLetter,
  letterToPoints,
  calculateTotalGrade,
  isCoursePassed,
  calculateSemesterGPA,
  calculateCGPA,
  getCGPAClassification,
  isPassingGrade,
  validateGradeEntry,
  applyRetakeCap,
};
