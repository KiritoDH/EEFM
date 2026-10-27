const db = require('../config/db');

exports.getBudgets = (req, res, next) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. '2026-10'
    const month = req.query.month || currentMonth;

    // Get all budgets for the specified month for this user, with category info and actual spending
    const sql = `
      SELECT 
        b.id,
        b.user_id,
        b.category_id,
        b.month,
        b.amount AS budget_amount,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        COALESCE(spent_sub.total_spent, 0) AS amount_spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN (
        SELECT 
          category_id, 
          COALESCE(SUM(amount), 0) AS total_spent 
        FROM transactions 
        WHERE user_id = ? AND type = 'expense' AND date LIKE ?
        GROUP BY category_id
      ) spent_sub ON spent_sub.category_id = b.category_id
      WHERE b.user_id = ? AND b.month = ?
      ORDER BY b.amount DESC
    `;

    const budgets = db.all(sql, [req.user.id, `${month}%`, req.user.id, month]);

    // Enhance with calculations
    let totalBudget = 0;
    let totalSpent = 0;

    const processedBudgets = budgets.map(b => {
      const budgetAmount = Number(b.budget_amount);
      const spent = Number(b.amount_spent);
      const remaining = budgetAmount - spent;
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      let status = 'good'; // under 80%
      if (spent >= budgetAmount) {
        status = 'exceeded'; // >= 100%
      } else if (percentage >= 80) {
        status = 'warning'; // 80% - 99.9%
      }

      totalBudget += budgetAmount;
      totalSpent += spent;

      return {
        ...b,
        budget_amount: budgetAmount,
        amount_spent: spent,
        remaining,
        percentage: Number(percentage.toFixed(1)),
        status
      };
    });

    const totalRemaining = totalBudget - totalSpent;
    const overallPercentage = totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      month,
      budgets: processedBudgets,
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining,
        overallPercentage
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.upsertBudget = (req, res, next) => {
  try {
    const { category_id, month, amount } = req.body;

    if (!category_id || !month || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Category, month (YYYY-MM), and budget amount are required.'
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a non-negative number.'
      });
    }

    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Month must be in YYYY-MM format (e.g. 2026-10).'
      });
    }

    // Verify category belongs to user and is expense
    const cat = db.get('SELECT id, type, name FROM categories WHERE id = ? AND user_id = ?', [category_id, req.user.id]);
    if (!cat) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or unauthorized.'
      });
    }

    if (cat.type !== 'expense') {
      return res.status(400).json({
        success: false,
        message: 'Budgets can only be set for expense categories.'
      });
    }

    // Upsert budget
    db.run(`
      INSERT INTO budgets (user_id, category_id, month, amount)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, category_id, month) DO UPDATE SET
        amount = excluded.amount,
        updated_at = CURRENT_TIMESTAMP
    `, [req.user.id, category_id, month, numAmount]);

    const budgetRecord = db.get(`
      SELECT b.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ? AND b.category_id = ? AND b.month = ?
    `, [req.user.id, category_id, month]);

    res.json({
      success: true,
      message: 'Budget saved successfully.',
      budget: budgetRecord
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteBudget = (req, res, next) => {
  try {
    const { id } = req.params;

    const budget = db.get('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget record not found.'
      });
    }

    db.run('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, req.user.id]);

    res.json({
      success: true,
      message: 'Budget deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};
