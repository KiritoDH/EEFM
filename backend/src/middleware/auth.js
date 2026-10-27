const jwt = require('jsonwebtoken');
const db = require('../config/db');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
    const decoded = jwt.verify(token, secret);

    // Fetch user from DB to verify active account and get latest preferences
    const user = db.get('SELECT id, name, email, currency, currency_symbol, opening_balance, theme FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User account no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid or forged token.'
    });
  }
}

module.exports = authenticateToken;
