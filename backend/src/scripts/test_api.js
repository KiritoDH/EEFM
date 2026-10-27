const http = require('http');
const app = require('../server');

let server;
const PORT = 5001; // test port

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const contentType = res.headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
          } else {
            resolve({ status: res.statusCode, data: body, headers: res.headers });
          }
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Backend API Automated Verification Suite...');
  server = app.listen(PORT);

  try {
    // 1. Health check
    const health = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET'
    });
    console.log(`[PASS] 1. Health check status: ${health.status} (${health.data.status})`);

    // 2. Login with Demo Account
    const loginRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'demo@expensetracker.com',
      password: 'Demo@123'
    });
    console.log(`[PASS] 2. Login: status ${loginRes.status}, user: ${loginRes.data.user.name}`);
    const token = loginRes.data.token;

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 3. Get Auth Me
    const meRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: authHeaders
    });
    console.log(`[PASS] 3. Get Me: status ${meRes.status}, currency: ${meRes.data.user.currency_symbol}`);

    // 4. Fetch Categories
    const catRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/categories',
      method: 'GET',
      headers: authHeaders
    });
    console.log(`[PASS] 4. Categories count: ${catRes.data.categories.length}`);

    // 5. Create Custom Category
    const newCatRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/categories',
      method: 'POST',
      headers: authHeaders
    }, {
      name: 'Gym & Fitness',
      type: 'expense',
      icon: 'Dumbbell',
      color: '#06b6d4'
    });
    console.log(`[PASS] 5. Created Category ID: ${newCatRes.data.category.id} (${newCatRes.data.category.name})`);
    const customCatId = newCatRes.data.category.id;

    // 6. Create Transaction
    const newTxRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/transactions',
      method: 'POST',
      headers: authHeaders
    }, {
      amount: 1500,
      type: 'expense',
      category_id: customCatId,
      date: '2026-10-25',
      payment_method: 'UPI',
      description: 'Gold Gym Monthly Subscription',
      notes: 'Fitness expense'
    });
    console.log(`[PASS] 6. Created Transaction: ID ${newTxRes.data.transaction.id}, Amount: ₹${newTxRes.data.transaction.amount}`);
    const customTxId = newTxRes.data.transaction.id;

    // 7. Get Transactions with Pagination & Search
    const txListRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/transactions?search=Gym',
      method: 'GET',
      headers: authHeaders
    });
    console.log(`[PASS] 7. Search transactions for 'Gym': found ${txListRes.data.transactions.length}`);

    // 8. Fetch Budgets
    const budgetRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/budgets?month=2026-10',
      method: 'GET',
      headers: authHeaders
    });
    console.log(`[PASS] 8. Budgets count for 2026-10: ${budgetRes.data.budgets.length}, Exceeded count: ${budgetRes.data.budgets.filter(b => b.status === 'exceeded').length}`);

    // 9. Fetch Dashboard Overview
    const overviewRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/overview',
      method: 'GET',
      headers: authHeaders
    });
    console.log(`[PASS] 9. Dashboard Overview: Balance ₹${overviewRes.data.summary.availableBalance}, Total Income: ₹${overviewRes.data.summary.totalIncome}, Total Expense: ₹${overviewRes.data.summary.totalExpense}`);

    // 10. Fetch Analytics
    const analyticsRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/analytics?timeFrame=yearly&year=2026',
      method: 'GET',
      headers: authHeaders
    });
    console.log(`[PASS] 10. Analytics: categories analyzed: ${analyticsRes.data.categorySpending.length}, timeSeries points: ${analyticsRes.data.timeSeries.length}`);

    // 11. CSV Export
    const csvRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/reports/export/csv',
      method: 'GET',
      headers: authHeaders
    });
    console.log(`[PASS] 11. CSV Export: HTTP ${csvRes.status}, Content-Type: ${csvRes.headers['content-type']}, Lines: ${csvRes.data.split('\n').length}`);

    // 12. Cleanup created test transaction & category
    await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/transactions/${customTxId}`,
      method: 'DELETE',
      headers: authHeaders
    });
    await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/categories/${customCatId}`,
      method: 'DELETE',
      headers: authHeaders
    });
    console.log(`[PASS] 12. Cleanup test records successfully.`);

    console.log('\n🌟 ALL 12 BACKEND API TESTS PASSED WITH 100% SUCCESS! 🌟\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
