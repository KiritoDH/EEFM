const db = require('../config/db');

exports.getTransactions = (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category_id,
      startDate,
      endDate,
      search,
      sortBy = 'date',
      sortOrder = 'DESC'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const allowedSortFields = {
      date: 't.date',
      amount: 't.amount',
      description: 't.description',
      type: 't.type'
    };
    const sortField = allowedSortFields[sortBy] || 't.date';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let whereClause = 'WHERE t.user_id = ?';
    const params = [req.user.id];

    if (type && ['income', 'expense'].includes(type)) {
      whereClause += ' AND t.type = ?';
      params.push(type);
    }

    if (category_id) {
      whereClause += ' AND t.category_id = ?';
      params.push(category_id);
    }

    if (startDate) {
      whereClause += ' AND t.date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND t.date <= ?';
      params.push(endDate);
    }

    if (search && search.trim() !== '') {
      whereClause += ' AND (t.description LIKE ? OR t.notes LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) AS total FROM transactions t ${whereClause}`;
    const totalRow = db.get(countSql, params);
    const total = totalRow ? totalRow.total : 0;

    // Get filtered summary stats (total income, total expense, net savings in this filter)
    const statsSql = `
      SELECT 
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS filtered_income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS filtered_expense
      FROM transactions t
      ${whereClause}
    `;
    const statsRow = db.get(statsSql, params);
    const filteredIncome = statsRow ? statsRow.filtered_income : 0;
    const filteredExpense = statsRow ? statsRow.filtered_expense : 0;
    const filteredSavings = filteredIncome - filteredExpense;

    // Fetch transactions with joined category details
    const dataSql = `
      SELECT 
        t.id,
        t.user_id,
        t.category_id,
        t.amount,
        t.type,
        t.date,
        t.payment_method,
        t.description,
        t.notes,
        t.created_at,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}, t.id DESC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, limitNum, offset];
    const transactions = db.all(dataSql, queryParams);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      summary: {
        filteredIncome,
        filteredExpense,
        filteredSavings
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getTransactionById = (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = db.get(`
      SELECT 
        t.*,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ? AND t.user_id = ?
    `, [id, req.user.id]);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized.'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (err) {
    next(err);
  }
};

exports.createTransaction = (req, res, next) => {
  try {
    const { amount, type, category_id, date, payment_method, description, notes } = req.body;

    if (!amount || !type || !date || !description) {
      return res.status(400).json({
        success: false,
        message: 'Amount, type, date, and description are required.'
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number.'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must be "income" or "expense".'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Date must be formatted as YYYY-MM-DD.'
      });
    }

    let finalCategoryId = category_id ? parseInt(category_id, 10) : null;
    if (finalCategoryId) {
      const cat = db.get('SELECT id, type FROM categories WHERE id = ? AND user_id = ?', [finalCategoryId, req.user.id]);
      if (!cat) {
        return res.status(400).json({
          success: false,
          message: 'Selected category does not exist or does not belong to you.'
        });
      }
      if (cat.type !== type) {
        return res.status(400).json({
          success: false,
          message: `Category type "${cat.type}" must match transaction type "${type}".`
        });
      }
    } else {
      // Find default "Other" category for this type
      const defaultCat = db.get('SELECT id FROM categories WHERE user_id = ? AND type = ? AND LOWER(name) = "other"', [req.user.id, type]);
      if (defaultCat) {
        finalCategoryId = defaultCat.id;
      }
    }

    const result = db.run(`
      INSERT INTO transactions (user_id, category_id, amount, type, date, payment_method, description, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      finalCategoryId,
      numAmount,
      type,
      date,
      payment_method || 'UPI',
      description.trim(),
      notes ? notes.trim() : null
    ]);

    const newId = Number(result.lastInsertRowid);
    const created = db.get(`
      SELECT 
        t.*,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [newId]);

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully.',
      transaction: created
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTransaction = (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, type, category_id, date, payment_method, description, notes } = req.body;

    const existing = db.get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized.'
      });
    }

    const newAmount = amount !== undefined ? parseFloat(amount) : existing.amount;
    if (isNaN(newAmount) || newAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number.'
      });
    }

    const newType = type || existing.type;
    if (!['income', 'expense'].includes(newType)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must be "income" or "expense".'
      });
    }

    const newDate = date || existing.date;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newDate)) {
      return res.status(400).json({
        success: false,
        message: 'Date must be formatted as YYYY-MM-DD.'
      });
    }

    let newCategoryId = category_id !== undefined ? category_id : existing.category_id;
    if (newCategoryId) {
      const cat = db.get('SELECT id, type FROM categories WHERE id = ? AND user_id = ?', [newCategoryId, req.user.id]);
      if (!cat) {
        return res.status(400).json({
          success: false,
          message: 'Selected category does not exist.'
        });
      }
      if (cat.type !== newType) {
        return res.status(400).json({
          success: false,
          message: `Category type "${cat.type}" must match transaction type "${newType}".`
        });
      }
    }

    const newDesc = description !== undefined ? description.trim() : existing.description;
    const newNotes = notes !== undefined ? (notes ? notes.trim() : null) : existing.notes;
    const newPayment = payment_method || existing.payment_method;

    db.run(`
      UPDATE transactions 
      SET amount = ?, type = ?, category_id = ?, date = ?, payment_method = ?, description = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [newAmount, newType, newCategoryId, newDate, newPayment, newDesc, newNotes, id, req.user.id]);

    const updated = db.get(`
      SELECT 
        t.*,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Transaction updated successfully.',
      transaction: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTransaction = (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = db.get('SELECT id, description, amount FROM transactions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized.'
      });
    }

    db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, req.user.id]);

    res.json({
      success: true,
      message: 'Transaction deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};
