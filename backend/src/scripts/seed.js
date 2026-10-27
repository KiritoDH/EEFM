const bcrypt = require('bcryptjs');
const db = require('../config/db');

function seedDemoData() {
  console.log('🌱 Starting Demo Data Seeding...');

  const demoEmail = 'demo@expensetracker.com';
  const demoPassword = 'Demo@123';
  const demoName = 'Rahul Sharma (Demo User)';

  // Remove existing demo user if present to ensure a clean, idempotent reset
  const existing = db.get('SELECT id FROM users WHERE email = ?', [demoEmail]);
  if (existing) {
    console.log(`🧹 Removing existing demo user (ID: ${existing.id}) and all associated records...`);
    db.run('DELETE FROM users WHERE id = ?', [existing.id]);
  }

  // Create demo user
  const passwordHash = bcrypt.hashSync(demoPassword, 10);
  const userResult = db.run(`
    INSERT INTO users (name, email, password_hash, currency, currency_symbol, opening_balance, theme)
    VALUES (?, ?, ?, 'INR', '₹', 25000.00, 'light')
  `, [demoName, demoEmail, passwordHash]);

  const userId = Number(userResult.lastInsertRowid);
  console.log(`✅ Demo user created with ID: ${userId}`);

  // Seed default categories
  db.seedDefaultCategoriesForUser(userId);

  // Fetch categories by name
  const catRows = db.all('SELECT id, name, type FROM categories WHERE user_id = ?', [userId]);
  const categories = {};
  for (const c of catRows) {
    categories[`${c.type}:${c.name}`] = c.id;
  }

  // Helper to get category ID safely
  const getCat = (type, name) => categories[`${type}:${name}`] || null;

  // Insert Monthly Budgets for October 2026 (current month)
  const currentMonth = '2026-10';
  const budgets = [
    { cat: 'Food and Dining', amount: 12000 },
    { cat: 'Shopping', amount: 10000 },        // will be exceeded (>100%)
    { cat: 'Bills and Utilities', amount: 6000 }, // safe (<80%)
    { cat: 'Transportation', amount: 5000 },   // safe (<80%)
    { cat: 'Entertainment', amount: 4000 }     // safe (<80%)
  ];

  for (const b of budgets) {
    const catId = getCat('expense', b.cat);
    if (catId) {
      db.run(`
        INSERT INTO budgets (user_id, category_id, month, amount)
        VALUES (?, ?, ?, ?)
      `, [userId, catId, currentMonth, b.amount]);
    }
  }
  console.log(`✅ Set up 5 category budgets for ${currentMonth}`);

  // Multi-month transactions
  const transactions = [
    // ==========================================
    // AUGUST 2026: Month with High Savings
    // ==========================================
    { type: 'income', cat: 'Salary', amount: 75000, date: '2026-08-01', method: 'Net Banking', desc: 'August Monthly Salary (Infosys Technologies)' },
    { type: 'income', cat: 'Freelance', amount: 15000, date: '2026-08-15', method: 'UPI', desc: 'React Native App UI Freelance Milestone' },

    { type: 'expense', cat: 'Housing', amount: 18000, date: '2026-08-02', method: 'Net Banking', desc: 'Apartment Monthly Rent' },
    { type: 'expense', cat: 'Bills and Utilities', amount: 2400, date: '2026-08-05', method: 'UPI', desc: 'Electricity Bill (BESCOM)' },
    { type: 'expense', cat: 'Bills and Utilities', amount: 999, date: '2026-08-07', method: 'UPI', desc: 'Airtel Fiber Broadband' },
    { type: 'expense', cat: 'Food and Dining', amount: 3500, date: '2026-08-08', method: 'Credit Card', desc: 'Monthly Grocery Shopping at Nature Basket' },
    { type: 'expense', cat: 'Food and Dining', amount: 2100, date: '2026-08-14', method: 'UPI', desc: 'Weekend Dinner with Team' },
    { type: 'expense', cat: 'Food and Dining', amount: 1450, date: '2026-08-22', method: 'UPI', desc: 'Swiggy & Zomato food delivery' },
    { type: 'expense', cat: 'Transportation', amount: 2200, date: '2026-08-10', method: 'UPI', desc: 'Fuel Petrol refill' },
    { type: 'expense', cat: 'Transportation', amount: 1800, date: '2026-08-20', method: 'Debit Card', desc: 'Metro Smart Card Recharge' },
    { type: 'expense', cat: 'Entertainment', amount: 1200, date: '2026-08-12', method: 'Credit Card', desc: 'PVR IMAX Movie Tickets' },
    { type: 'expense', cat: 'Entertainment', amount: 999, date: '2026-08-25', method: 'UPI', desc: 'Netflix & Spotify Annual Subscriptions' },
    { type: 'expense', cat: 'Shopping', amount: 2150, date: '2026-08-18', method: 'Credit Card', desc: 'Formal Shirts from Raymond' },

    // ==========================================
    // SEPTEMBER 2026: Month with Overspending (Festival & Tech)
    // ==========================================
    { type: 'income', cat: 'Salary', amount: 75000, date: '2026-09-01', method: 'Net Banking', desc: 'September Monthly Salary' },

    { type: 'expense', cat: 'Housing', amount: 18000, date: '2026-09-02', method: 'Net Banking', desc: 'Apartment Monthly Rent' },
    { type: 'expense', cat: 'Shopping', amount: 48500, date: '2026-09-10', method: 'Credit Card', desc: 'New Dell Monitor & Tech Accessories for Home Office' },
    { type: 'expense', cat: 'Healthcare', amount: 12500, date: '2026-09-14', method: 'Debit Card', desc: 'Annual Full Body Health Checkup & Dental root canal' },
    { type: 'expense', cat: 'Food and Dining', amount: 5600, date: '2026-09-08', method: 'Credit Card', desc: 'Celebration Family Dinner' },
    { type: 'expense', cat: 'Food and Dining', amount: 4200, date: '2026-09-22', method: 'UPI', desc: 'Weekly groceries & dining' },
    { type: 'expense', cat: 'Bills and Utilities', amount: 3500, date: '2026-09-06', method: 'UPI', desc: 'Electricity & Water bill' },
    { type: 'expense', cat: 'Bills and Utilities', amount: 1299, date: '2026-09-18', method: 'UPI', desc: 'Mobile post-paid & Cloud backup' },
    { type: 'expense', cat: 'Transportation', amount: 3200, date: '2026-09-15', method: 'Cash', desc: 'Cab rides for airport travel' },

    // ==========================================
    // OCTOBER 2026: Current Month with Budget Alerts
    // ==========================================
    { type: 'income', cat: 'Salary', amount: 80000, date: '2026-10-01', method: 'Net Banking', desc: 'October Monthly Salary (with Annual Increment)' },
    { type: 'income', cat: 'Freelance', amount: 20000, date: '2026-10-12', method: 'UPI', desc: 'Fintech Website Frontend Development Project' },
    { type: 'income', cat: 'Investments', amount: 4250, date: '2026-10-18', method: 'Net Banking', desc: 'Mutual Fund Dividend & Stock Payout' },

    { type: 'expense', cat: 'Housing', amount: 18000, date: '2026-10-02', method: 'Net Banking', desc: 'October Apartment Rent' },

    // Food and Dining: Budget ₹12,000, Spent ₹10,800 -> 90% utilization (WARNING state)
    { type: 'expense', cat: 'Food and Dining', amount: 4800, date: '2026-10-04', method: 'Credit Card', desc: 'Supermarket Monthly Groceries (Blinkit & Zepto)' },
    { type: 'expense', cat: 'Food and Dining', amount: 3200, date: '2026-10-11', method: 'UPI', desc: 'Casual weekend dinner with friends' },
    { type: 'expense', cat: 'Food and Dining', amount: 2800, date: '2026-10-23', method: 'UPI', desc: 'Office lunches and coffee runs' },

    // Shopping: Budget ₹10,000, Spent ₹14,200 -> 142% utilization (EXCEEDED state)
    { type: 'expense', cat: 'Shopping', amount: 8500, date: '2026-10-08', method: 'Credit Card', desc: 'Diwali Festive Clothing & Home Decor' },
    { type: 'expense', cat: 'Shopping', amount: 5700, date: '2026-10-20', method: 'Credit Card', desc: 'Noise-canceling Bluetooth Headphones' },

    // Bills and Utilities: Budget ₹6,000, Spent ₹4,300 -> 71.6% (GOOD state)
    { type: 'expense', cat: 'Bills and Utilities', amount: 2800, date: '2026-10-05', method: 'UPI', desc: 'Electricity & Gas bill' },
    { type: 'expense', cat: 'Bills and Utilities', amount: 1500, date: '2026-10-15', method: 'UPI', desc: 'Fiber Internet & OTT subscriptions' },

    // Transportation: Budget ₹5,000, Spent ₹3,100 -> 62% (GOOD state)
    { type: 'expense', cat: 'Transportation', amount: 2100, date: '2026-10-07', method: 'UPI', desc: 'Vehicle Fuel Fill-up' },
    { type: 'expense', cat: 'Transportation', amount: 1000, date: '2026-10-22', method: 'Cash', desc: 'Uber auto and metro rides' },

    // Entertainment: Budget ₹4,000, Spent ₹1,800 -> 45% (GOOD state)
    { type: 'expense', cat: 'Entertainment', amount: 1800, date: '2026-10-16', method: 'Credit Card', desc: 'Concert & standup comedy show ticket' },

    // Education
    { type: 'expense', cat: 'Education', amount: 3500, date: '2026-10-10', method: 'UPI', desc: 'Full Stack Cloud Certification Exam Voucher' }
  ];

  const insertTx = db.prepare(`
    INSERT INTO transactions (user_id, category_id, amount, type, date, payment_method, description, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const tx of transactions) {
    const catId = getCat(tx.type, tx.cat);
    insertTx.run(userId, catId, tx.amount, tx.type, tx.date, tx.method, tx.desc, `Seeded sample record for ${tx.cat}`);
  }

  console.log(`✅ Seeded ${transactions.length} realistic multi-month transactions`);

  // Print Summary
  const count = db.get('SELECT COUNT(*) AS total FROM transactions WHERE user_id = ?', [userId]);
  const incomeSum = db.get("SELECT SUM(amount) AS sum FROM transactions WHERE user_id = ? AND type = 'income'", [userId]);
  const expenseSum = db.get("SELECT SUM(amount) AS sum FROM transactions WHERE user_id = ? AND type = 'expense'", [userId]);

  console.log('----------------------------------------------------');
  console.log(`🎉 Demo Data Seeding Complete!`);
  console.log(`👤 Demo Account: ${demoEmail}`);
  console.log(`🔑 Demo Password: ${demoPassword}`);
  console.log(`📊 Total Transactions: ${count.total}`);
  console.log(`💰 Lifetime Income: ₹${incomeSum.sum.toLocaleString('en-IN')}`);
  console.log(`💸 Lifetime Expenses: ₹${expenseSum.sum.toLocaleString('en-IN')}`);
  console.log(`🏦 Opening Balance: ₹25,000`);
  console.log(`💵 Current Balance: ₹${(25000 + incomeSum.sum - expenseSum.sum).toLocaleString('en-IN')}`);
  console.log('----------------------------------------------------');
}

seedDemoData();
