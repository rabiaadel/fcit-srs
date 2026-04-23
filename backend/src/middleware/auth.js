const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change-me-refresh-in-production';

/**
 * Verify JWT access token and attach user to req
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Verify user still exists and is active
    const userRes = await query(
      'SELECT id, email, role, full_name_en, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );
    const user = userRes.rows[0];

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (!user.is_active) return res.status(401).json({ success: false, message: 'Account is deactivated' });

    req.user = { ...user, userId: user.id };
    next();
  } catch (err) {
    logger.error('Auth middleware error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

/**
 * Role-based access control
 * Usage: requireRole('admin') or requireRole(['admin', 'doctor'])
 */
const requireRole = (...roles) => {
  const allowedRoles = roles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }
    next();
  };
};

/**
 * Student can only access their own data (unless admin/doctor)
 */
const requireSelfOrStaff = async (req, res, next) => {
  if (['admin', 'doctor'].includes(req.user.role)) return next();

  // For students, verify the studentId in params matches their own
  const { studentId } = req.params;
  if (studentId) {
    const student = await query(
      'SELECT id FROM students WHERE id = $1 AND user_id = $2',
      [studentId, req.user.id]
    );
    if (!student.rows[0]) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
  }
  next();
};

/**
 * Generate access + refresh tokens
 */
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
  return { accessToken, refreshToken };
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
};

module.exports = { authenticate, requireRole, requireSelfOrStaff, generateTokens, verifyRefreshToken };
