const db = require('../config/db');

exports.getDashboardOverview = (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // 1. Lifetime totals for Available Balance calculation
    const lifetimeSql = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS lifetime_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS lifetime_expense
      FROM transactions
      WHERE user_id = ?
    `;
    const lifetime = db.get(lifetimeSql, [req.user.id]);
    const openingBalance = Number(req.user.opening_balance || 0);
    const availableBalance = openingBalance + Number(lifetime.lifetime_income) - Number(lifetime.lifetime_expense);

    // 2. Filtered Period totals
    let periodWhere = 'WHERE user_id = ?';
    const periodParams = [req.user.id];

    if (startDate) {
      periodWhere += ' AND date >= ?';
      periodParams.push(startDate);
    }
    if (endDate) {
      periodWhere += ' AND date <= ?';
      periodParams.push(endDate);
    }

    const periodSql = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
        COUNT(*) AS transaction_count
      FROM transactions
      ${periodWhere}
    `;
    const periodData = db.get(periodSql, periodParams);
    const totalIncome = Number(periodData.total_income);
    const totalExpense = Number(periodData.total_expense);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Number(((netSavings / totalIncome) * 100).toFixed(1)) : 0;

    // 3. Category-wise expense breakdown for selected period
    const catExpenseSql = `
      SELECT 
        c.id,
        c.name,
        c.color,
        c.icon,
        COALESCE(SUM(t.amount), 0) AS amount,
        COUNT(t.id) as count
      FROM categories c
      JOIN transactions t ON t.category_id = c.id
      ${periodWhere.replace('WHERE user_id = ?', 'WHERE t.user_id = ?')} AND t.type = 'expense'
      GROUP BY c.id
      ORDER BY amount DESC
    `;
    const categoryExpenses = db.all(catExpenseSql, periodParams);

    // Add percentage to each category
    const categoryBreakdown = categoryExpenses.map(cat => ({
      ...cat,
      amount: Number(cat.amount),
      percentage: totalExpense > 0 ? Number(((cat.amount / totalExpense) * 100).toFixed(1)) : 0
    }));

    // 4. Monthly Spending & Income Trend (Last 6 or 12 months)
    const monthlyTrendSql = `
      SELECT 
        SUBSTR(date, 1, 7) AS month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
      FROM transactions
      WHERE user_id = ?
      GROUP BY SUBSTR(date, 1, 7)
      ORDER BY month DESC
      LIMIT 12
    `;
    const monthlyTrendRaw = db.all(monthlyTrendSql, [req.user.id]);
    // Reverse to chronological order
    const monthlyTrend = monthlyTrendRaw.reverse().map(m => ({
      month: m.month,
      income: Number(m.income),
      expense: Number(m.expense),
      savings: Number(m.income) - Number(m.expense)
    }));

    // 5. Recent Transactions (last 6)
    const recentTxSql = `
      SELECT 
        t.id, t.amount, t.type, t.date, t.payment_method, t.description, t.notes,
        c.name AS category_name, c.icon AS category_icon, c.color AS category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.date DESC, t.id DESC
      LIMIT 6
    `;
    const recentTransactions = db.all(recentTxSql, [req.user.id]);

    // 6. Current Month Budgets summary
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budgetSql = `
      SELECT 
        b.id, b.month, b.amount AS budget_amount,
        c.name AS category_name, c.color AS category_color, c.icon AS category_icon,
        COALESCE(spent_sub.total_spent, 0) AS amount_spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN (
        SELECT category_id, COALESCE(SUM(amount), 0) AS total_spent 
        FROM transactions 
        WHERE user_id = ? AND type = 'expense' AND date LIKE ?
        GROUP BY category_id
      ) spent_sub ON spent_sub.category_id = b.category_id
      WHERE b.user_id = ? AND b.month = ?
      ORDER BY (spent_sub.total_spent / b.amount) DESC
      LIMIT 4
    `;
    const activeBudgets = db.all(budgetSql, [req.user.id, `${currentMonth}%`, req.user.id, currentMonth]).map(b => {
      const budgetAmount = Number(b.budget_amount);
      const spent = Number(b.amount_spent);
      const percentage = budgetAmount > 0 ? Number(((spent / budgetAmount) * 100).toFixed(1)) : 0;
      let status = 'good';
      if (spent >= budgetAmount) status = 'exceeded';
      else if (percentage >= 80) status = 'warning';

      return {
        ...b,
        budget_amount: budgetAmount,
        amount_spent: spent,
        remaining: budgetAmount - spent,
        percentage,
        status
      };
    });

    res.json({
      success: true,
      summary: {
        availableBalance,
        openingBalance,
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate,
        transactionCount: periodData.transaction_count
      },
      categoryBreakdown,
      monthlyTrend,
      recentTransactions,
      activeBudgets
    });
  } catch (err) {
    next(err);
  }
};

exports.getAnalyticsReport = (req, res, next) => {
  try {
    const { timeFrame = 'monthly', year = new Date().getFullYear(), month } = req.query;

    let periodWhere = 'WHERE user_id = ?';
    const params = [req.user.id];

    if (timeFrame === 'yearly') {
      periodWhere += ' AND date LIKE ?';
      params.push(`${year}%`);
    } else if (timeFrame === 'monthly') {
      const targetMonth = month || `${year}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      periodWhere += ' AND date LIKE ?';
      params.push(`${targetMonth}%`);
    }

    // 1. Overall stats for this timeframe
    const statsSql = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
        COUNT(*) AS transaction_count,
        AVG(CASE WHEN type = 'expense' THEN amount ELSE NULL END) AS avg_expense,
        MAX(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS max_expense
      FROM transactions
      ${periodWhere}
    `;
    const stats = db.get(statsSql, params);

    // 2. Spending by category with count and percentage
    const categorySql = `
      SELECT 
        c.id, c.name, c.color, c.icon,
        COALESCE(SUM(t.amount), 0) AS total_amount,
        COUNT(t.id) as transaction_count
      FROM categories c
      JOIN transactions t ON t.category_id = c.id
      ${periodWhere.replace('WHERE user_id = ?', 'WHERE t.user_id = ?')} AND t.type = 'expense'
      GROUP BY c.id
      ORDER BY total_amount DESC
    `;
    const catRows = db.all(categorySql, params);
    const totalExp = Number(stats.total_expense);
    const categorySpending = catRows.map(c => ({
      ...c,
      total_amount: Number(c.total_amount),
      percentage: totalExp > 0 ? Number(((c.total_amount / totalExp) * 100).toFixed(1)) : 0
    }));

    // 3. Payment Method breakdown
    const paymentSql = `
      SELECT 
        payment_method,
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(*) as count
      FROM transactions
      ${periodWhere} AND type = 'expense'
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `;
    const paymentMethods = db.all(paymentSql, params);

    // 4. Daily or Monthly time-series data
    let timeSeriesSql = '';
    if (timeFrame === 'yearly') {
      timeSeriesSql = `
        SELECT 
          SUBSTR(date, 1, 7) AS time_label,
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
        FROM transactions
        ${periodWhere}
        GROUP BY SUBSTR(date, 1, 7)
        ORDER BY time_label ASC
      `;
    } else {
      timeSeriesSql = `
        SELECT 
          date AS time_label,
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
        FROM transactions
        ${periodWhere}
        GROUP BY date
        ORDER BY date ASC
      `;
    }
    const timeSeries = db.all(timeSeriesSql, params).map(row => ({
      ...row,
      income: Number(row.income),
      expense: Number(row.expense),
      savings: Number(row.income) - Number(row.expense)
    }));

    res.json({
      success: true,
      timeFrame,
      summary: {
        totalIncome: Number(stats.total_income),
        totalExpense: Number(stats.total_expense),
        netSavings: Number(stats.total_income) - Number(stats.total_expense),
        savingsRate: stats.total_income > 0 ? Number((((stats.total_income - stats.total_expense) / stats.total_income) * 100).toFixed(1)) : 0,
        transactionCount: stats.transaction_count,
        avgExpense: Number((stats.avg_expense || 0).toFixed(2)),
        maxExpense: Number(stats.max_expense || 0)
      },
      categorySpending,
      paymentMethods,
      timeSeries
    });
  } catch (err) {
    next(err);
  }
};

exports.exportTransactionsCSV = (req, res, next) => {
  try {
    const { startDate, endDate, type, category_id } = req.query;

    let whereClause = 'WHERE t.user_id = ?';
    const params = [req.user.id];

    if (startDate) {
      whereClause += ' AND t.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND t.date <= ?';
      params.push(endDate);
    }
    if (type && ['income', 'expense'].includes(type)) {
      whereClause += ' AND t.type = ?';
      params.push(type);
    }
    if (category_id) {
      whereClause += ' AND t.category_id = ?';
      params.push(category_id);
    }

    const sql = `
      SELECT 
        t.id,
        t.date,
        t.type,
        c.name AS category,
        t.amount,
        t.payment_method,
        t.description,
        t.notes
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ${whereClause}
      ORDER BY t.date DESC, t.id DESC
    `;

    const rows = db.all(sql, params);

    // Build CSV
    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount (INR)', 'Payment Method', 'Description', 'Notes'];
    const csvLines = [headers.join(',')];

    for (const row of rows) {
      const escape = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      csvLines.push([
        row.id,
        escape(row.date),
        escape(row.type),
        escape(row.category || 'Uncategorized'),
        row.amount.toFixed(2),
        escape(row.payment_method),
        escape(row.description),
        escape(row.notes || '')
      ].join(','));
    }

    const csvContent = csvLines.join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csvContent);
  } catch (err) {
    next(err);
  }
};
