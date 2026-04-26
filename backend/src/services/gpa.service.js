// =============================================================================
// GPA Service - All grade calculation logic per FCIT Bylaws 2024
// =============================================================================
const { GRADE_SCALE, CGPA_CLASSIFICATIONS, MIN_PASSING_TOTAL_PCT, MIN_PASSING_FINAL_PCT } = require('../config/constants');

/**
 * Convert a percentage score to grade points (Art. 17)
 */
function percentageToPoints(pct) {
  if (pct === null || pct === undefined) return 0;
  for (const g of GRADE_SCALE) {
    if (pct >= g.minPct) return g.points;
  }
  return 0;
}

/**
 * Convert a percentage score to letter grade (Art. 17)
 */
function percentageToLetter(pct) {
  if (pct === null || pct === undefined) return 'F';
  for (const g of GRADE_SCALE) {
    if (pct >= g.minPct) return g.grade;
  }
  return 'F';
}

/**
 * Convert letter grade to grade points
 */
function letterToPoints(letter) {
  const map = {
    'A+': 4.0, 'A': 3.7, 'A-': 3.4,
    'B+': 3.2, 'B': 3.0, 'B-': 2.8,
    'C+': 2.6, 'C': 2.4, 'C-': 2.2,
    'D+': 2.0, 'D': 1.5, 'D-': 1.0,
    'F': 0.0, 'Abs': 0.0, 'W': null, 'I': null, 'Con': null, 'P': null,
  };
  return map[letter] ?? null;
}

/**
 * Calculate total course grade from components
 * Grade breakdown: midterm(20%) + coursework(10%) + practical(10%) + final(60%)
 * Special rules: if final_exam < 30% -> automatic fail
 */
function calculateTotalGrade({ midterm = 0, coursework = 0, practical = 0, final_exam = 0 }) {
  const total = (midterm * 0.20) + (coursework * 0.10) + (practical * 0.10) + (final_exam * 0.60);
  return Math.round(total * 100) / 100;
}

/**
 * Determine if a student passed a course (Art. 16)
 * Requirements:
 *  - Total grade >= 50 (D- threshold)
 *  - Final exam >= 30% of final exam marks
 *  - Minimum total >= 40% NOT 50% (the 40% is total, 50% is D-)
 */
function isCoursePassed(totalPct, finalExamPct) {
  if (finalExamPct < MIN_PASSING_FINAL_PCT) return false;
  if (totalPct < 50) return false;  // Below D- = fail (50% minimum for D-)
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
  return Math.round((totalQualityPoints / totalCredits) * 1000) / 1000;
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
  if (midterm < 0 || midterm > 100) errors.push('Midterm must be 0-100');
  if (coursework < 0 || coursework > 100) errors.push('Coursework must be 0-100');
  if (practical < 0 || practical > 100) errors.push('Practical must be 0-100');
  if (final_exam < 0 || final_exam > 100) errors.push('Final exam must be 0-100');
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
