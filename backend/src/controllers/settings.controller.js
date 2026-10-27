const db = require('../config/db');

exports.getSettings = (req, res, next) => {
  try {
    const user = db.get(`
      SELECT id, name, email, currency, currency_symbol, opening_balance, theme, created_at, updated_at
      FROM users
      WHERE id = ?
    `, [req.user.id]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      settings: user
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = (req, res, next) => {
  try {
    const { name, currency, currency_symbol, opening_balance, theme } = req.body;

    const currentUser = db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const newName = name ? name.trim() : currentUser.name;
    const newCurrency = currency ? currency.trim().toUpperCase() : currentUser.currency;
    const newSymbol = currency_symbol ? currency_symbol.trim() : currentUser.currency_symbol;
    const newTheme = theme && ['light', 'dark'].includes(theme) ? theme : currentUser.theme;
    
    let newOpening = currentUser.opening_balance;
    if (opening_balance !== undefined) {
      const parsed = parseFloat(opening_balance);
      if (!isNaN(parsed) && parsed >= 0) {
        newOpening = parsed;
      }
    }

    db.run(`
      UPDATE users 
      SET name = ?, currency = ?, currency_symbol = ?, opening_balance = ?, theme = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [newName, newCurrency, newSymbol, newOpening, newTheme, req.user.id]);

    const updatedUser = db.get(`
      SELECT id, name, email, currency, currency_symbol, opening_balance, theme, created_at, updated_at
      FROM users
      WHERE id = ?
    `, [req.user.id]);

    res.json({
      success: true,
      message: 'Preferences updated successfully.',
      settings: updatedUser
    });
  } catch (err) {
    next(err);
  }
};
