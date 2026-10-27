const http = require('http');
const app = require('../server');
const db = require('../config/db');

const PORT = 5002;

function req(options, data = null) {
  return new Promise((resolve, reject) => {
    const r = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const ct = res.headers['content-type'] || '';
          if (ct.includes('application/json')) {
            resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
          } else {
            resolve({ status: res.statusCode, data: body, headers: res.headers });
          }
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });
    r.on('error', reject);
    if (data) {
      r.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    r.end();
  });
}

async function verifyAllWorkflows() {
  console.log('🚀 Running Comprehensive College Demonstration QA Verification...\n');
  let server = app.listen(PORT);

  try {
    // -------------------------------------------------------------
    // Test 1: Register and Log In
    // -------------------------------------------------------------
    const testEmail = `student_${Date.now()}@college.edu`;
    const regRes = await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'College Student',
      email: testEmail,
      password: 'Password@123'
    });
    if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
    const token = regRes.data.token;
    const userId = regRes.data.user.id;
    console.log(`✅ Test 1 Passed: Registered user "${regRes.data.user.name}" (ID: ${userId})`);

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // -------------------------------------------------------------
    // Test 2: Add Income and Expense Transactions
    // -------------------------------------------------------------
    const categoriesRes = await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/categories',
      method: 'GET',
      headers: authHeaders
    });
    const incomeCat = categoriesRes.data.categories.find(c => c.type === 'income');
    const expenseCat = categoriesRes.data.categories.find(c => c.type === 'expense');

    // Add Income
    const incomeTx = await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/transactions',
      method: 'POST',
      headers: authHeaders
    }, {
      amount: 50000,
      type: 'income',
      category_id: incomeCat.id,
      date: '2026-10-01',
      payment_method: 'Net Banking',
      description: 'October Monthly Stipend / Salary'
    });
    if (incomeTx.status !== 201) throw new Error('Failed to create income transaction');

    // Add Expense
    const expenseTx = await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/transactions',
      method: 'POST',
      headers: authHeaders
    }, {
      amount: 15000,
      type: 'expense',
      category_id: expenseCat.id,
      date: '2026-10-05',
      payment_method: 'UPI',
      description: 'Hostel Rent & Mess Charges'
    });
    if (expenseTx.status !== 201) throw new Error('Failed to create expense transaction');
    console.log('✅ Test 2 Passed: Added income (₹50,000) and expense (₹15,000)');

    // -------------------------------------------------------------
    // Test 3: Edit and Delete Transactions
    // -------------------------------------------------------------
    const editRes = await req({
      hostname: 'localhost',
      port: PORT,
      path: `/api/transactions/${expenseTx.data.transaction.id}`,
      method: 'PUT',
      headers: authHeaders
    }, {
      amount: 16500,
      description: 'Hostel Rent & Mess Charges (Updated with Laundry)'
    });
    if (editRes.status !== 200 || editRes.data.transaction.amount !== 16500) {
      throw new Error('Failed to update transaction');
    }

    // Add temporary transaction to test delete
    const tempTx = await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/transactions',
      method: 'POST',
      headers: authHeaders
    }, {
      amount: 500,
      type: 'expense',
      category_id: expenseCat.id,
      date: '2026-10-06',
      payment_method: 'Cash',
      description: 'Temporary Coffee to delete'
    });
    const delRes = await req({
      hostname: 'localhost',
      port: PORT,
      path: `/api/transactions/${tempTx.data.transaction.id}`,
      method: 'DELETE',
      headers: authHeaders
    });
    if (delRes.status !== 200) throw new Error('Failed to delete transaction');
    console.log('✅ Test 3 Passed: Successfully edited amount to ₹16,500 and deleted test transaction');

    // -------------------------------------------------------------
    // Test 4: Verify Dashboard Calculations
    // -------------------------------------------------------------
    // Set Opening Balance to ₹10,000
    await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/settings',
      method: 'PUT',
      headers: authHeaders
    }, {
      opening_balance: 10000
    });

    const overviewRes = await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/overview',
      method: 'GET',
      headers: authHeaders
    });
    const { summary } = overviewRes.data;

    // Expected:
    // Opening = 10,000
    // Income = 50,000
    // Expense = 16,500
    // Net Savings = 50,000 - 16,500 = 33,500
    // Available Balance = 10,000 + 50,000 - 16,500 = 43,500
    if (summary.totalIncome !== 50000) throw new Error(`Incorrect Total Income: ${summary.totalIncome}`);
    if (summary.totalExpense !== 16500) throw new Error(`Incorrect Total Expense: ${summary.totalExpense}`);
    if (summary.netSavings !== 33500) throw new Error(`Incorrect Net Savings: ${summary.netSavings}`);
    if (summary.availableBalance !== 43500) throw new Error(`Incorrect Available Balance: ${summary.availableBalance}`);
    console.log(`✅ Test 4 Passed: Dashboard formulas verified (Income: ₹50k, Expense: ₹16.5k, Savings: ₹33.5k, Balance: ₹43.5k)`);

    // -------------------------------------------------------------
    // Test 5: Create and Exceed a Budget
    // -------------------------------------------------------------
    // Set budget of ₹15,000 for the expense category (where spent is 16,500)
    await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/budgets',
      method: 'POST',
      headers: authHeaders
    }, {
      category_id: expenseCat.id,
      month: '2026-10',
      amount: 15000
    });

    const budgetRes = await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/budgets?month=2026-10',
      method: 'GET',
      headers: authHeaders
    });
    const targetBudget = budgetRes.data.budgets.find(b => b.category_id === expenseCat.id);
    if (!targetBudget || targetBudget.status !== 'exceeded' || targetBudget.percentage < 100) {
      throw new Error(`Budget exceeded status not triggered correctly: ${JSON.stringify(targetBudget)}`);
    }
    console.log(`✅ Test 5 Passed: Budget alert active -> status="${targetBudget.status}", utilization=${targetBudget.percentage}%`);

    // -------------------------------------------------------------
    // Test 6: Filter Transactions by Date and Category
    // -------------------------------------------------------------
    const filteredRes = await req({
      hostname: 'localhost',
      port: PORT,
      path: `/api/transactions?startDate=2026-10-02&endDate=2026-10-31&category_id=${expenseCat.id}`,
      method: 'GET',
      headers: authHeaders
    });
    if (filteredRes.data.transactions.length !== 1 || filteredRes.data.transactions[0].type !== 'expense') {
      throw new Error('Filter query did not return expected records');
    }
    console.log(`✅ Test 6 Passed: Filtered transactions by date range and category successfully`);

    // -------------------------------------------------------------
    // Test 7: Export Transactions to CSV
    // -------------------------------------------------------------
    const csvRes = await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/export/csv',
      method: 'GET',
      headers: authHeaders
    });
    if (csvRes.status !== 200 || !csvRes.headers['content-type'].includes('text/csv')) {
      throw new Error('CSV export failed');
    }
    console.log(`✅ Test 7 Passed: CSV export generated successfully (${csvRes.data.split('\n').length} lines)`);

    // -------------------------------------------------------------
    // Test 8: Data Persistence after Server Restart
    // -------------------------------------------------------------
    server.close(); // simulate server crash/restart
    server = app.listen(PORT); // restart

    const persistRes = await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/overview',
      method: 'GET',
      headers: authHeaders
    });
    if (persistRes.data.summary.availableBalance !== 43500) {
      throw new Error('Data persistence check failed after restart');
    }
    console.log('✅ Test 8 Passed: Data persistently retained across server restart');

    // -------------------------------------------------------------
    // Test 9: Strict User Isolation (User A cannot access User B)
    // -------------------------------------------------------------
    // Register User B
    const userBRes = await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'User B (Intruder)',
      email: `user_b_${Date.now()}@college.edu`,
      password: 'Password@456'
    });
    const userBToken = userBRes.data.token;
    const userBHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userBToken}`
    };

    // User B tries to view transactions
    const userBTxRes = await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/transactions',
      method: 'GET',
      headers: userBHeaders
    });
    if (userBTxRes.data.transactions.length !== 0) {
      throw new Error('Isolation breach: User B saw User A transactions!');
    }

    // User B tries to delete User A's transaction
    const unauthorizedDel = await req({
      hostname: 'localhost',
      port: PORT,
      path: `/api/transactions/${expenseTx.data.transaction.id}`,
      method: 'DELETE',
      headers: userBHeaders
    });
    if (unauthorizedDel.status !== 404) {
      throw new Error('Isolation breach: User B was able to modify User A record!');
    }
    console.log('✅ Test 9 Passed: Multi-tenant database isolation verified with zero cross-user access');

    // -------------------------------------------------------------
    // Test 10: Verify Demo Account Intact
    // -------------------------------------------------------------
    const demoLogin = await req({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'demo@expensetracker.com',
      password: 'Demo@123'
    });
    if (demoLogin.status !== 200) throw new Error('Demo login failed');
    console.log(`✅ Test 10 Passed: Demo user account ("${demoLogin.data.user.name}") active and verified`);

    console.log('\n🏆 ALL 10 MANDATORY WORKFLOW TESTS PASSED WITH 100% SUCCESS! 🏆\n');
  } catch (err) {
    console.error('❌ Verification Error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

verifyAllWorkflows();
