import { Router } from 'express';
import { query } from '../db/pool';
import { getUserByFirebaseUid } from '../db/helpers';

const router = Router();

router.get('/', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const month = new Date().toISOString().slice(0, 7);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Execute multiple analytical queries in parallel
    const [
      spendRes,
      prevSpendRes,
      budgetsRes,
      creditRes,
      alertsRes,
      flaggedTxRes,
      dailySpendRes,
      savingsRes
    ] = await Promise.all([
      // Current month spend
      query(`SELECT SUM(amount) as total FROM transactions WHERE user_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2 AND type='debit'`, [user.id, month]),
      // Prev month spend
      query(`SELECT SUM(amount) as total FROM transactions WHERE user_id = $1 AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) AND type='debit'`, [user.id]),
      // Category Budgets
      query(`
        SELECT b.category, b.monthly_limit as limit, COALESCE(SUM(t.amount), 0) as spent
        FROM budgets b
        LEFT JOIN transactions t ON b.user_id = t.user_id AND b.category = t.category AND to_char(t.transaction_date, 'YYYY-MM') = b.month_year AND t.type='debit'
        WHERE b.user_id = $1 AND b.month_year = $2
        GROUP BY b.category, b.monthly_limit
      `, [user.id, month]),
      // Credit score
      query(`SELECT score, factors, recorded_at FROM credit_scores WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 2`, [user.id]),
      // Unread alerts
      query(`SELECT COUNT(*) as count FROM alerts WHERE user_id = $1 AND is_read = false`, [user.id]),
      // Recent flagged transactions
      query(`SELECT * FROM transactions WHERE user_id = $1 AND is_flagged = true ORDER BY transaction_date DESC LIMIT 5`, [user.id]),
      // Daily spend trend 30 days
      query(`
        SELECT DATE(transaction_date) as date, SUM(amount) as amount 
        FROM transactions 
        WHERE user_id = $1 AND transaction_date >= $2 AND type='debit' 
        GROUP BY DATE(transaction_date) ORDER BY date ASC
      `, [user.id, last30Days]),
      // Savings suggestions
      query(`SELECT COUNT(*) as count FROM savings_suggestions WHERE user_id = $1 AND is_accepted IS NULL`, [user.id])
    ]);

    const totalSpend = parseFloat(spendRes.rows[0]?.total || '0');
    const lastMonthSpend = parseFloat(prevSpendRes.rows[0]?.total || '0');
    const vsLastMonth_pct = lastMonthSpend > 0 ? ((totalSpend - lastMonthSpend) / lastMonthSpend) * 100 : 0;

    const categoryBudgetStatus = budgetsRes.rows.map(r => ({
      category: r.category,
      limit: parseFloat(r.limit),
      spent: parseFloat(r.spent),
      pct: (parseFloat(r.spent) / parseFloat(r.limit)) * 100
    }));

    const totalBudget = categoryBudgetStatus.reduce((acc, c) => acc + c.limit, 0);
    const amount = totalBudget - totalSpend;
    const usedPct = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

    const currentScore = creditRes.rows[0]?.score || null;
    const prevScore = creditRes.rows[1]?.score || currentScore;
    const scoreChange = currentScore && prevScore ? currentScore - prevScore : 0;

    res.json({
      monthlySpend: { total: totalSpend, vsLastMonth_pct },
      budgetRemaining: { amount, usedPct },
      latestCreditScore: { score: currentScore, change: scoreChange },
      unreadAlertsCount: parseInt(alertsRes.rows[0]?.count || '0'),
      recentTransactions: flaggedTxRes.rows,
      categoryBudgetStatus,
      aiInsights: [
        "Your food spending is 20% higher than last month. Consider reducing weekend orders.",
        "You have untouched savings potential of ₹5000 this month.",
        "Outstanding job keeping credit utilization below 30%!"
      ],
      dailySpendTrend: dailySpendRes.rows.map(r => ({ date: r.date, amount: parseFloat(r.amount) })),
      savingsSuggestionsCount: parseInt(savingsRes.rows[0]?.count || '0')
    });

  } catch (err) {
    next(err);
  }
});

export default router;
