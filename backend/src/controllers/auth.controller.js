const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { query, withTransaction } = require('../config/database');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const userRes = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
      [email.toLowerCase().trim()]
    );
    const user = userRes.rows[0];

    if (!user) {
      await bcrypt.compare(password, '$2b$10$W2hZVsJqkGqLAHlzdb.sa.Ar7CqOq.wIBCTKPjZfg2mnRdI.8vD26');
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Store refresh token hash
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]
    );

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Get role-specific profile
    let profile = null;
    if (user.role === 'student') {
      const s = await query('SELECT * FROM students WHERE user_id = $1', [user.id]);
      profile = s.rows[0];
    } else if (user.role === 'doctor') {
      const d = await query(
        `SELECT d.*, dep.name_en as department_name FROM doctors d
         LEFT JOIN departments dep ON dep.id = d.department_id WHERE d.user_id = $1`,
        [user.id]
      );
      profile = d.rows[0];
    }

    logger.info('User logged in', { userId: user.id, role: user.role });

    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullNameAr: user.full_name_ar,
          fullNameEn: user.full_name_en,
          mustChangePw: user.must_change_pw,
        },
        profile,
      }
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Refresh token required' });

    const decoded = verifyRefreshToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });

    // Verify token exists in DB and is not revoked
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const stored = (await query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW()',
      [tokenHash]
    )).rows[0];

    if (!stored) return res.status(401).json({ success: false, message: 'Token revoked or expired' });

    const user = (await query('SELECT id, role, is_active FROM users WHERE id = $1', [decoded.userId])).rows[0];
    if (!user || !user.is_active) return res.status(401).json({ success: false, message: 'User not found' });

    // Revoke old token (rotation)
    await query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1', [stored.id]);

    const tokens = generateTokens(user.id, user.role);
    const newHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
    await query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, newHash, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    return res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1', [tokenHash]);
    }
    // Revoke all tokens for extra security (optional)
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    // Require strong password
    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (!strongPw.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'Password must include uppercase, lowercase, number, and special character' });
    }

    const user = (await query('SELECT * FROM users WHERE id = $1', [req.user.id])).rows[0];
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password incorrect' });

    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1, must_change_pw = FALSE WHERE id = $2', [hash, req.user.id]);

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = (await query(
      'SELECT id, email, role, full_name_ar, full_name_en, phone, last_login, must_change_pw FROM users WHERE id = $1',
      [req.user.id]
    )).rows[0];

    let profile = null;
    if (user.role === 'student') {
      profile = (await query('SELECT * FROM students WHERE user_id = $1', [user.id])).rows[0];
    } else if (user.role === 'doctor') {
      profile = (await query(
        `SELECT d.*, dep.name_en as department_name, dep.code as department_code
         FROM doctors d LEFT JOIN departments dep ON dep.id = d.department_id WHERE d.user_id = $1`,
        [user.id]
      )).rows[0];
    }

    return res.json({ success: true, data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullNameAr: user.full_name_ar,
        fullNameEn: user.full_name_en,
        phone: user.phone,
        lastLogin: user.last_login,
        mustChangePw: user.must_change_pw,
      },
      profile,
    } });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, refreshToken, logout, changePassword, getMe };
