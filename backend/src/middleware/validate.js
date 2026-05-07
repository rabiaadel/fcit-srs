// =============================================================================
// Input Validation Middleware
// [B3-FIX] express-validator was in package.json but never used
// Uses manual validation instead of express-validator to avoid package dep issues
// All validators return consistent {success: false, message, errors} shape
// =============================================================================

/**
 * Validate login request body
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('Email must be a valid email address');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 1) {
    errors.push('Password cannot be empty');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }
  next();
};

/**
 * Validate grade entry body
 * midterm (0-20), coursework (0-10), practical (0-10), final_exam (0-60)
 */
const validateGradeEntry = (req, res, next) => {
  const { midterm_grade, coursework_grade, practical_grade, final_exam_grade } = req.body;
  const errors = [];

  const validateComponent = (name, value, max) => {
    if (value === undefined || value === null || value === '') return; // Allow empty (partial grade)
    const n = parseFloat(value);
    if (isNaN(n)) errors.push(`${name} must be a number`);
    else if (n < 0)   errors.push(`${name} cannot be negative`);
    else if (n > max) errors.push(`${name} cannot exceed ${max}`);
  };

  validateComponent('Midterm grade',    midterm_grade,     20);
  validateComponent('Coursework grade', coursework_grade,  10);
  validateComponent('Practical grade',  practical_grade,   10);
  validateComponent('Final exam grade', final_exam_grade,  60);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }
  next();
};

/**
 * Validate course registration — offeringId must be present and integer
 */
const validateRegistration = (req, res, next) => {
  const { offeringId } = req.body;
  if (!offeringId) {
    return res.status(400).json({ success: false, message: 'offeringId is required' });
  }
  const n = parseInt(offeringId, 10);
  if (isNaN(n) || n <= 0) {
    return res.status(400).json({ success: false, message: 'offeringId must be a positive integer' });
  }
  req.body.offeringId = n; // normalize
  next();
};

/**
 * Validate user creation body (admin endpoint)
 */
const validateCreateUser = (req, res, next) => {
  const { email, password, role, fullNameAr, fullNameEn } = req.body;
  const errors = [];
  const validRoles = ['admin', 'doctor', 'student'];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push('Valid email is required');
  if (!password || password.length < 8)
    errors.push('Password must be at least 8 characters');
  if (!role || !validRoles.includes(role))
    errors.push(`Role must be one of: ${validRoles.join(', ')}`);
  if (!fullNameAr || fullNameAr.trim().length < 2)
    errors.push('Arabic full name is required (min 2 characters)');
  if (!fullNameEn || fullNameEn.trim().length < 2)
    errors.push('English full name is required (min 2 characters)');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }
  next();
};

/**
 * Validate semester status update
 */
const validateSemesterStatus = (req, res, next) => {
  const { status } = req.body;
  const valid = ['upcoming', 'registration', 'active', 'grading', 'closed'];
  if (!status || !valid.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${valid.join(', ')}`
    });
  }
  next();
};

module.exports = {
  validateLogin,
  validateGradeEntry,
  validateRegistration,
  validateCreateUser,
  validateSemesterStatus,
};
