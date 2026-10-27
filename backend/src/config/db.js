const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/expense_tracker.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

// Enable foreign key constraints and WAL journal mode for performance
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      currency TEXT DEFAULT 'INR',
      currency_symbol TEXT DEFAULT '₹',
      opening_balance REAL DEFAULT 0.0,
      theme TEXT DEFAULT 'light',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      icon TEXT DEFAULT 'Tag',
      color TEXT DEFAULT '#3B82F6',
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, name, type)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      amount REAL NOT NULL CHECK(amount > 0),
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      date TEXT NOT NULL,
      payment_method TEXT DEFAULT 'UPI',
      description TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      month TEXT NOT NULL,
      amount REAL NOT NULL CHECK(amount >= 0),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      UNIQUE(user_id, category_id, month)
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
    CREATE INDEX IF NOT EXISTS idx_transactions_user_cat ON transactions(user_id, category_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);
    CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id, type);
  `);
}

// Initialize tables on startup
initDatabase();

// Default categories template
const DEFAULT_CATEGORIES = [
  // Expense
  { name: 'Food and Dining', type: 'expense', icon: 'Utensils', color: '#f97316' },
  { name: 'Transportation', type: 'expense', icon: 'Car', color: '#06b6d4' },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
  { name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#8b5cf6' },
  { name: 'Bills and Utilities', type: 'expense', icon: 'Zap', color: '#eab308' },
  { name: 'Healthcare', type: 'expense', icon: 'HeartPulse', color: '#ef4444' },
  { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#3b82f6' },
  { name: 'Housing', type: 'expense', icon: 'Home', color: '#10b981' },
  { name: 'Other', type: 'expense', icon: 'MoreHorizontal', color: '#64748b' },
  // Income
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10b981' },
  { name: 'Freelance', type: 'income', icon: 'Laptop', color: '#3b82f6' },
  { name: 'Business', type: 'income', icon: 'TrendingUp', color: '#8b5cf6' },
  { name: 'Investments', type: 'income', icon: 'DollarSign', color: '#06b6d4' },
  { name: 'Gifts', type: 'income', icon: 'Gift', color: '#f59e0b' },
  { name: 'Other', type: 'income', icon: 'PlusCircle', color: '#64748b' }
];

function seedDefaultCategoriesForUser(userId) {
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO categories (user_id, name, type, icon, color, is_default)
    VALUES (?, ?, ?, ?, ?, 1)
  `);
  for (const cat of DEFAULT_CATEGORIES) {
    insertStmt.run(userId, cat.name, cat.type, cat.icon, cat.color);
  }
}

// Helper wrapper for parameterized queries
const dbHelper = {
  db,
  all(sql, params = []) {
    const p = Array.isArray(params) ? params : [params];
    return db.prepare(sql).all(...p);
  },
  get(sql, params = []) {
    const p = Array.isArray(params) ? params : [params];
    return db.prepare(sql).get(...p);
  },
  run(sql, params = []) {
    const p = Array.isArray(params) ? params : [params];
    return db.prepare(sql).run(...p);
  },
  exec(sql) {
    return db.exec(sql);
  },
  prepare(sql) {
    return db.prepare(sql);
  },
  seedDefaultCategoriesForUser,
  DEFAULT_CATEGORIES
};

module.exports = dbHelper;
