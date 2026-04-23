// =============================================================================
// FCIT SRS - Bylaw Constants
// All numeric thresholds and rules from the 2024 Bylaws document
// =============================================================================

module.exports = {
  // ── Degree Requirements ──────────────────────────────────────────────────
  TOTAL_CREDITS_REQUIRED: 132,
  MIN_CGPA_FOR_GRADUATION: 2.0,
  MAX_REGULAR_SEMESTERS: 8,
  MIN_REGULAR_SEMESTERS: 6,

  // ── Level Thresholds (credits passed) ────────────────────────────────────
  LEVELS: {
    freshman:  { min: 0,   max: 32 },
    sophomore: { min: 33,  max: 65 },
    junior:    { min: 66,  max: 101 },
    senior:    { min: 102, max: Infinity }
  },

  // ── Registration Credit Limits (Art. 11) ─────────────────────────────────
  CREDIT_LIMITS: {
    new_student_first_semester: 20,
    freshman: 27,
    sophomore: 30,
    junior: 22,
    senior: 132,
    summer_min: 2,
    summer_max: 7,
    min_per_semester: 2,
  },

  // ── Credit limits by CGPA ─────────────────────────────────────────────────
  CGPA_CREDIT_LIMITS: [
    { min: 3.0, max: 4.0,  maxCredits: 20 },
    { min: 2.5, max: 2.99, maxCredits: 20 },
    { min: 2.0, max: 2.49, maxCredits: 18 },
    { min: 0.0, max: 1.99, maxCredits: 15 },
  ],

  // ── Registration Deadlines ─────────────────────────────────────────────────
  ADD_DROP_DEADLINE_WEEKS: 2,
  WITHDRAWAL_DEADLINE_WEEKS: 7,
  SUMMER_WITHDRAWAL_DEADLINE_WEEKS: 2,

  // ── Attendance (Art. 14) ──────────────────────────────────────────────────
  MIN_ATTENDANCE_PCT: 42,          // Must have >= 42% to sit exam
  EXCESSIVE_ABSENCE_THRESHOLD: 25, // >25% absence triggers warning

  // ── Grading (Art. 16, 17) ────────────────────────────────────────────────
  MIN_PASSING_TOTAL_PCT: 40,      // Must get >= 40% of total grade
  MIN_PASSING_FINAL_PCT: 30,      // Must get >= 30% of final exam
  GRADE_SCALE: [
    { grade: 'A+', minPct: 96, maxPct: 100, points: 4.0 },
    { grade: 'A',  minPct: 92, maxPct: 95,  points: 3.7 },
    { grade: 'A-', minPct: 88, maxPct: 91,  points: 3.4 },
    { grade: 'B+', minPct: 84, maxPct: 87,  points: 3.2 },
    { grade: 'B',  minPct: 80, maxPct: 83,  points: 3.0 },
    { grade: 'B-', minPct: 76, maxPct: 79,  points: 2.8 },
    { grade: 'C+', minPct: 72, maxPct: 75,  points: 2.6 },
    { grade: 'C',  minPct: 68, maxPct: 71,  points: 2.4 },
    { grade: 'C-', minPct: 64, maxPct: 67,  points: 2.2 },
    { grade: 'D+', minPct: 60, maxPct: 63,  points: 2.0 },
    { grade: 'D',  minPct: 55, maxPct: 59,  points: 1.5 },
    { grade: 'D-', minPct: 50, maxPct: 54,  points: 1.0 },
    { grade: 'F',  minPct: 0,  maxPct: 49,  points: 0.0 },
  ],

  // ── CGPA Classification (Art. 18) ────────────────────────────────────────
  CGPA_CLASSIFICATIONS: [
    { label: 'Excellent',                  min: 3.5, max: 4.0  },
    { label: 'Very Good',                  min: 3.0, max: 3.5  },
    { label: 'Good',                       min: 2.5, max: 3.0  },
    { label: 'Satisfactory',               min: 2.0, max: 2.5  },
    { label: 'Weak',                       min: 1.0, max: 2.0  },
    { label: 'Poor',                       min: 0.0, max: 1.0  },
  ],

  // ── Academic Warning & Dismissal (Art. 25, 26) ───────────────────────────
  WARNING_CGPA_THRESHOLD: 2.0,
  MAX_CONSECUTIVE_WARNINGS: 4,
  MAX_TOTAL_WARNINGS: 6,
  FIRST_SEMESTER_EXEMPT_FROM_WARNING: true,

  // ── Graduation Project (Art. 21) ─────────────────────────────────────────
  PROJECT_MIN_CREDITS_PREREQ: 85,
  PROJECT_MIN_PASSING_PCT: 40,
  PROJECT_MIN_DEFENSE_PCT: 15,
  PROJECT_TOTAL_CREDITS: 6,

  // ── Course Repetition (Art. 22, 23) ──────────────────────────────────────
  MAX_VOLUNTARY_RETAKES: 3,
  MAX_RETAKE_GRADE_POINTS: 3.0,   // Cap at B
  MAX_RETAKE_LETTER: 'B',

  // ── Honors Degree (Art. 27) ───────────────────────────────────────────────
  HONORS_MIN_CGPA: 3.0,
  HONORS_MIN_GRADE: 3.0,           // All grades >= Very Good (B+)
  HONORS_MAX_SEMESTERS: 8,

  // ── Leave of Absence (Art. 15) ────────────────────────────────────────────
  MAX_CONSECUTIVE_LEAVE_SEMESTERS: 4,
  MAX_TOTAL_LEAVE_SEMESTERS: 6,

  // ── Specialization ────────────────────────────────────────────────────────
  SPECIALIZATION_START_CREDITS: 63,

  // ── Training ──────────────────────────────────────────────────────────────
  TRAINING_1_TRIGGER_CREDITS: 66,
  TRAINING_2_TRIGGER_CREDITS: 102,
  TRAINING_DURATION_WEEKS: 6,

  // ── Specializations ──────────────────────────────────────────────────────
  SPECIALIZATIONS: ['CS', 'IS', 'IT', 'SE'],

  // ── Token config ─────────────────────────────────────────────────────────
  JWT_ACCESS_EXPIRY: '15m',
  JWT_REFRESH_EXPIRY: '7d',
  BCRYPT_ROUNDS: 10,
};
