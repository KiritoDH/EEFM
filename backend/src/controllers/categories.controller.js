const db = require('../config/db');

exports.getCategories = (req, res, next) => {
  try {
    const { type } = req.query;
    let sql = `
      SELECT c.*, 
             COUNT(t.id) AS transaction_count,
             COALESCE(SUM(t.amount), 0) AS total_spent
      FROM categories c
      LEFT JOIN transactions t ON t.category_id = c.id
      WHERE c.user_id = ?
    `;
    const params = [req.user.id];

    if (type && ['income', 'expense'].includes(type)) {
      sql += ' AND c.type = ?';
      params.push(type);
    }

    sql += ' GROUP BY c.id ORDER BY c.type DESC, c.name ASC';

    const categories = db.all(sql, params);
    res.json({
      success: true,
      categories
    });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = (req, res, next) => {
  try {
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Category name and type (income/expense) are required.'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Category type must be either "income" or "expense".'
      });
    }

    const trimmedName = name.trim();

    // Check duplicate
    const existing = db.get(
      'SELECT id FROM categories WHERE user_id = ? AND LOWER(name) = LOWER(?) AND type = ?',
      [req.user.id, trimmedName, type]
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A ${type} category named "${trimmedName}" already exists.`
      });
    }

    const result = db.run(
      'INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES (?, ?, ?, ?, ?, 0)',
      [req.user.id, trimmedName, type, icon || 'Tag', color || '#3B82F6']
    );

    const newCategory = db.get('SELECT * FROM categories WHERE id = ?', [Number(result.lastInsertRowid)]);

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: newCategory
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const category = db.get('SELECT * FROM categories WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or access denied.'
      });
    }

    const trimmedName = name ? name.trim() : category.name;
    const newIcon = icon || category.icon;
    const newColor = color || category.color;

    // Check duplicate name if changed
    if (trimmedName.toLowerCase() !== category.name.toLowerCase()) {
      const duplicate = db.get(
        'SELECT id FROM categories WHERE user_id = ? AND LOWER(name) = LOWER(?) AND type = ? AND id != ?',
        [req.user.id, trimmedName, category.type, id]
      );
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Another ${category.type} category named "${trimmedName}" already exists.`
        });
      }
    }

    db.run(
      'UPDATE categories SET name = ?, icon = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [trimmedName, newIcon, newColor, id]
    );

    const updated = db.get('SELECT * FROM categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Category updated successfully.',
      category: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = (req, res, next) => {
  try {
    const { id } = req.params;
    const { reassignToId } = req.body;

    const category = db.get('SELECT * FROM categories WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or access denied.'
      });
    }

    // Check associated transactions
    const countRow = db.get('SELECT COUNT(*) AS count FROM transactions WHERE category_id = ? AND user_id = ?', [id, req.user.id]);
    const txCount = countRow ? countRow.count : 0;

    let targetCatId = null;

    if (txCount > 0) {
      if (reassignToId) {
        const target = db.get('SELECT id FROM categories WHERE id = ? AND user_id = ?', [reassignToId, req.user.id]);
        if (target) targetCatId = target.id;
      }

      // If no valid target specified, fall back to "Other" category of the same type
      if (!targetCatId) {
        const otherCat = db.get(
          'SELECT id FROM categories WHERE user_id = ? AND type = ? AND LOWER(name) = "other"',
          [req.user.id, category.type]
        );
        targetCatId = otherCat ? otherCat.id : null;
      }

      // Reassign transactions
      db.run(
        'UPDATE transactions SET category_id = ? WHERE category_id = ? AND user_id = ?',
        [targetCatId, id, req.user.id]
      );
    }

    // Delete associated budgets for this category
    db.run('DELETE FROM budgets WHERE category_id = ? AND user_id = ?', [id, req.user.id]);

    // Delete category
    db.run('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, req.user.id]);

    res.json({
      success: true,
      message: `Category "${category.name}" deleted successfully. ${txCount > 0 ? `${txCount} transactions reassigned.` : ''}`
    });
  } catch (err) {
    next(err);
  }
};

exports.resetDefaults = (req, res, next) => {
  try {
    db.seedDefaultCategoriesForUser(req.user.id);
    const categories = db.all('SELECT * FROM categories WHERE user_id = ? ORDER BY type DESC, name ASC', [req.user.id]);
    res.json({
      success: true,
      message: 'Default categories ensured.',
      categories
    });
  } catch (err) {
    next(err);
  }
};
