import { query } from '../db/pool';

export async function seedDemoData(userId: string) {
  // Guard: check if user already has transactions
  const txCheckRes = await query(`SELECT COUNT(*) as count FROM transactions WHERE user_id = $1`, [userId]);
  if (parseInt(txCheckRes.rows[0].count) >= 5) {
    return { seeded: false, message: 'User already has active transaction data. Skipping seed.' };
  }

  // Clear existing possible partial data
  await query(`DELETE FROM transactions WHERE user_id = $1`, [userId]);
  await query(`DELETE FROM budgets WHERE user_id = $1`, [userId]);
  await query(`DELETE FROM credit_scores WHERE user_id = $1`, [userId]);
  await query(`DELETE FROM alerts WHERE user_id = $1`, [userId]);
  await query(`DELETE FROM savings_suggestions WHERE user_id = $1`, [userId]);

  const now = new Date();
  
  // 1. Transactions (approx 90 over 3 months)
  const merchants = {
    food: [
      { name: 'Zomato', min: 150, max: 800 },
      { name: 'Swiggy', min: 120, max: 600 },
      { name: 'Dominos', min: 400, max: 1200 },
      { name: 'Haldirams', min: 200, max: 500 },
      { name: 'Local Restaurant', min: 80, max: 250 }
    ],
    transport: [
      { name: 'Uber', min: 150, max: 500 },
      { name: 'Ola', min: 120, max: 400 },
      { name: 'Delhi Metro', min: 30, max: 150 },
      { name: 'Rapido', min: 40, max: 120 }
    ],
    shopping: [
      { name: 'Amazon', min: 300, max: 5000 },
      { name: 'Flipkart', min: 400, max: 4500 },
      { name: 'Myntra', min: 800, max: 3000 },
      { name: 'D-Mart', min: 1000, max: 4000 }
    ],
    bills: [
      { name: 'Jio', min: 199, max: 699 },
      { name: 'Airtel Broadband', min: 899, max: 1299 },
      { name: 'BESCOM', min: 800, max: 1500 },
      { name: 'Netflix', min: 199, max: 649 }
    ],
    entertainment: [
      { name: 'BookMyShow', min: 300, max: 800 },
      { name: 'PVR', min: 500, max: 1200 },
      { name: 'Spotify', min: 119, max: 119 }
    ],
    health: [
      { name: 'Apollo Pharmacy', min: 150, max: 800 },
      { name: '1mg', min: 200, max: 1500 }
    ]
  };

  const transactions = [];
  
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomDate = (daysAgoMin: number, daysAgoMax: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - randomInt(daysAgoMin, daysAgoMax));
    d.setHours(randomInt(8, 22), randomInt(0, 59));
    return d.toISOString();
  };

  for (const [category, merchantList] of Object.entries(merchants)) {
    // Gen 10-15 tx per category
    const count = randomInt(10, 15);
    for (let i=0; i<count; i++) {
       const m = merchantList[Math.floor(Math.random() * merchantList.length)];
       transactions.push({
         user_id: userId,
         amount: randomInt(m.min, m.max),
         type: 'debit',
         category,
         merchant_name: m.name,
         description: `${category} spend`,
         transaction_date: randomDate(1, 90),
         is_flagged: false,
         fraud_score: 0.05
       });
    }
  }

  // Salary Income
  for (let m = 0; m < 3; m++) {
    transactions.push({
      user_id: userId,
      amount: 75000,
      type: 'credit',
      category: 'other',
      merchant_name: 'Tech Corp India',
      description: `Salary`,
      transaction_date: randomDate(m*30 + 1, m*30 + 5),
      is_flagged: false,
      fraud_score: 0.01
    });
  }

  // Add 3 fraud transactions
  transactions.push({
    user_id: userId, amount: 24500, type: 'debit', category: 'other', merchant_name: 'Unknown Int Txn',
    description: 'International card sweep', transaction_date: randomDate(1, 10), is_flagged: true, fraud_score: 0.95
  });
  transactions.push({
    user_id: userId, amount: 8900, type: 'debit', category: 'shopping', merchant_name: 'SketchyStore.com',
    description: 'Online purchase', transaction_date: randomDate(11, 20), is_flagged: true, fraud_score: 0.82
  });
  transactions.push({
    user_id: userId, amount: 15000, type: 'debit', category: 'other', merchant_name: 'ATM WDL DUBAI',
    description: 'ATM Withdrawal', transaction_date: randomDate(21, 30), is_flagged: true, fraud_score: 0.88
  });

  // Batch insert transactions
  for (const t of transactions) {
     await query(`
       INSERT INTO transactions (user_id, amount, type, category, merchant_name, description, transaction_date, is_flagged, fraud_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     `, [userId, t.amount, t.type, t.category, t.merchant_name, t.description, t.transaction_date, t.is_flagged, t.fraud_score]);
  }

  // 2. Budgets
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const budgets = [
    { cat: 'food', limit: 8000 },
    { cat: 'transport', limit: 4000 },
    { cat: 'shopping', limit: 10000 },
    { cat: 'bills', limit: 5000 },
    { cat: 'entertainment', limit: 3000 },
    { cat: 'health', limit: 2000 }
  ];
  for (const b of budgets) {
    await query(`INSERT INTO budgets (user_id, category, monthly_limit, month_year) VALUES ($1, $2, $3, $4)`, [userId, b.cat, b.limit, currentMonthStr]);
  }

  // 3. Credit Scores (last 6 months, 680 -> 720)
  let baseScore = 680;
  const factors = JSON.stringify([
    { factor: "Payment History", impact: "High", description: "100% on time", tip: "Keep it up" }
  ]);
  for (let m = 5; m >= 0; m--) {
     const d = new Date(now);
     d.setMonth(d.getMonth() - m);
     await query(`
       INSERT INTO credit_scores (user_id, score, bureau, recorded_at, factors)
       VALUES ($1, $2, 'CIBIL', $3, $4)
     `, [userId, baseScore, d.toISOString(), factors]);
     baseScore += randomInt(5, 12); // mostly trending up
  }

  // 4. Alerts
  await query(`INSERT INTO alerts (user_id, alert_type, title, message) VALUES ($1, 'fraud', 'Suspicious Transaction Blocked', 'We blocked a ₹24,500 transaction at Unknown Int Txn.')`, [userId]);
  await query(`INSERT INTO alerts (user_id, alert_type, title, message) VALUES ($1, 'budget_warning', 'Food Budget Alert', 'You have used 85% of your food budget this month.')`, [userId]);
  await query(`INSERT INTO alerts (user_id, alert_type, title, message) VALUES ($1, 'savings_opportunity', 'Save ₹5000', 'You have idle cash. Consider a short term FD.')`, [userId]);

  // 5. Savings Suggestions
  await query(`INSERT INTO savings_suggestions (user_id, suggestion_type, amount, expected_return_pct, duration_months, description) VALUES ($1, 'fd', 50000, 7.1, 12, 'High yield fixed deposit with HDFC')`, [userId]);
  await query(`INSERT INTO savings_suggestions (user_id, suggestion_type, amount, expected_return_pct, duration_months, description) VALUES ($1, 'sip', 5000, 12.0, 60, 'Index fund SIP for long term growth')`, [userId]);

  return { seeded: true, transactionCount: transactions.length, message: 'Successfully seeded entire demo environment.' };
}
