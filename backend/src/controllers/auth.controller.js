const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_EXPIRES_IN = '7d';

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    secret,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

exports.register = (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user already exists
    const existingUser = db.get('SELECT id FROM users WHERE email = ?', [trimmedEmail]);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = db.run(
      'INSERT INTO users (name, email, password_hash, currency, currency_symbol, opening_balance) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), trimmedEmail, passwordHash, 'INR', '₹', 0.0]
    );

    const userId = Number(result.lastInsertRowid);

    // Seed default categories for this user
    db.seedDefaultCategoriesForUser(userId);

    const newUser = db.get(
      'SELECT id, name, email, currency, currency_symbol, opening_balance, theme, created_at FROM users WHERE id = ?',
      [userId]
    );

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: newUser
    });
  } catch (err) {
    next(err);
  }
};

exports.login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = db.get(
      'SELECT id, name, email, password_hash, currency, currency_symbol, opening_balance, theme FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    // Omit password_hash from response
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const userRecord = db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isMatch = bcrypt.compareSync(currentPassword, userRecord.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newHash, req.user.id]);

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
};
