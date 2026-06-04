// =============================================================================
// FCIT SRS - Bylaw Constants
// All numeric thresholds and rules from the 2024 Bylaws document
// =============================================================================

module.exports = {
  // ── Degree Requirements ──────────────────────────────────────────────────
  TOTAL_CREDITS_REQUIRED: 138,
  MIN_CGPA_FOR_GRADUATION: 2.0,
  MAX_REGULAR_SEMESTERS: 8,
  MIN_REGULAR_SEMESTERS: 6,

  // ── Level Thresholds (credits passed) — must match academic-regulations.json levels ──
  LEVELS: {
    'الفرقة الأولى':  { min: 0,   max: 27 },
    'الفرقة الثانية': { min: 28,  max: 62 },
    'الفرقة الثالثة':    { min: 63,  max: 97 },
    'الفرقة الرابعة':    { min: 98,  max: Infinity }
  },

  // ── Registration Credit Limits (Art. 11) ─────────────────────────────────
  CREDIT_LIMITS: {
    new_student_first_semester: 18,
    summer_min: 2,
    summer_max: 9,
    min_per_semester: 9,
  },

  // ── Credit limits by CGPA (Art. 11) ────────────────────────────────────────
  // Source of truth: academic-regulations.json registration_rules.regular_semester.max_hours_by_gpa
  // CGPA >= 3.0 → max 21  |  >= 2.0 < 3.0 → max 18  |  >= 1.0 < 2.0 → max 15  |  < 1.0 → max 12
  CGPA_CREDIT_LIMITS: [
    { minCgpa: 3.0, maxCredits: 21 },
    { minCgpa: 2.0, maxCredits: 18 },
    { minCgpa: 1.0, maxCredits: 15 },
    { minCgpa: 0.0, maxCredits: 12 },
  ],

  // ── Registration Deadlines ─────────────────────────────────────────────────
  ADD_DROP_DEADLINE_WEEKS: 2,
  WITHDRAWAL_DEADLINE_WEEKS: 7,
  SUMMER_WITHDRAWAL_DEADLINE_WEEKS: 2,

  // ── Attendance (Art. 14) ──────────────────────────────────────────────────
  MIN_ATTENDANCE_PCT: 75,          // Must have >= 75% attendance to sit exam (Art. 14)
  EXCESSIVE_ABSENCE_THRESHOLD: 25, // >25% absence = barred from final exam

  // ── Grading (Art. 16, 17) ────────────────────────────────────────────────
  MIN_PASSING_TOTAL_PCT: 50,      // Must get >= 50% of total grade (Art. 16: minimum D-)
  MIN_PASSING_FINAL_PCT: 30,      // Must get >= 30% of final exam component
  // [AUDIT FIX] GRADE_SCALE boundaries now match academic-regulations.json exactly.
  // GPA computation reads from the JSON via bylaw service; this table is used
  // for frontend display only. Max-boundary uses .99 suffix (95.99 not 95)
  // so there's no gap between consecutive grade bands.
  GRADE_SCALE: [
    { grade: 'A+', minPct: 96,    maxPct: 100,   points: 4.0 },
    { grade: 'A',  minPct: 92,    maxPct: 95.99, points: 3.7 },
    { grade: 'A-', minPct: 88,    maxPct: 91.99, points: 3.4 },
    { grade: 'B+', minPct: 84,    maxPct: 87.99, points: 3.2 },
    { grade: 'B',  minPct: 80,    maxPct: 83.99, points: 3.0 },
    { grade: 'B-', minPct: 76,    maxPct: 79.99, points: 2.8 },
    { grade: 'C+', minPct: 72,    maxPct: 75.99, points: 2.6 },
    { grade: 'C',  minPct: 68,    maxPct: 71.99, points: 2.4 },
    { grade: 'C-', minPct: 64,    maxPct: 67.99, points: 2.2 },
    { grade: 'D+', minPct: 60,    maxPct: 63.99, points: 2.0 },
    { grade: 'D',  minPct: 55,    maxPct: 59.99, points: 1.5 },
    { grade: 'D-', minPct: 50,    maxPct: 54.99, points: 1.0 },
    // Art. 16: below 50% = F
    { grade: 'F',  minPct: 0,     maxPct: 49.99, points: 0.0 },
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
  MAX_CONSECUTIVE_WARNINGS: 4,    // Art. 26: dismiss after 4 consecutive warnings
  MAX_TOTAL_WARNINGS: 6,          // Art. 26: dismiss after 6 non-consecutive warnings
  FIRST_SEMESTER_EXEMPT_FROM_WARNING: true,

  // ── Graduation Project (Art. 21) ─────────────────────────────────────────
  // Official bylaw pages 26/30/34: prerequisite = 85 credit hours (not 97).
  // Previous value of 97 was derived from Art. 21 (70% of 138 cr) which does NOT
  // apply to Graduation Project I registration — the bylaw explicitly states 85 cr.
  PROJECT_MIN_CREDITS_PREREQ: 85,

  // ── Spec-specific graduation project codes (bylaw pages 26, 30, 34) ──────
  // Each specialization uses its own PR4x1/PR4x2 course codes.
  PROJECT_CODES_BY_SPEC: {
    CS:      { part1: 'PR411', part2: 'PR412' },
    IS:      { part1: 'PR421', part2: 'PR422' },
    IT:      { part1: 'PR431', part2: 'PR432' },
    GENERAL: { part1: 'PR411', part2: 'PR412' }, // fallback
  },
  PROJECT_MIN_PASSING_PCT: 50,
  PROJECT_MIN_DEFENSE_PCT: 40,   // Art. 21: oral defense = 40% of project grade
  PROJECT_TOTAL_CREDITS: 6,

  // ── Course Repetition (Art. 22, 23, 24) ──────────────────────────────────
  MAX_VOLUNTARY_RETAKES: 3,       // Art. 24: max 3 voluntary improvement retakes
  MAX_RETAKE_GRADE_POINTS: 3.0,   // Cap at B (Art. 22/23)
  MAX_RETAKE_LETTER: 'B',

  // ── Honors Degree (Art. 27) ───────────────────────────────────────────────
  HONORS_MIN_CGPA: 3.0,
  // Art. 27: no failed or barred courses + CGPA >= 3.0 overall
  HONORS_MIN_GRADE: 3.0,
  HONORS_MAX_SEMESTERS: 8,

  // ── Leave of Absence (Art. 15) ────────────────────────────────────────────
  MAX_CONSECUTIVE_LEAVE_SEMESTERS: 2,   // Art. 15: max 2 consecutive leave semesters
  MAX_TOTAL_LEAVE_SEMESTERS: 4,         // Art. 15: max 4 non-consecutive leave semesters

  // ── Specialization ────────────────────────────────────────────────────────
  // Art. 4z: after completing 63 credit hours (second semester of Level 2)
  SPECIALIZATION_START_CREDITS: 63,

  // ── Training ──────────────────────────────────────────────────────────────
  TRAINING_1_TRIGGER_CREDITS: 66,
  TRAINING_2_TRIGGER_CREDITS: 102,
  TRAINING_DURATION_WEEKS: 6,

  // ── Specializations ──────────────────────────────────────────────────────
  // [AUDIT-I-22 FIX] Only CS, IS, IT are active FCIT specializations.
  // SE was removed from the approved curriculum; no students or curriculum plans use it.
  SPECIALIZATIONS: ['CS', 'IS', 'IT'],

  // ── Token config ─────────────────────────────────────────────────────────
  JWT_ACCESS_EXPIRY: '15m',
  JWT_REFRESH_EXPIRY: '7d',
  BCRYPT_ROUNDS: 10,
};
