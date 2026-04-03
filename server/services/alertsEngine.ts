import { query } from '../db/pool';
import { explainFraudRisk } from './fraudDetection';

/**
 * Dedup check: has a similar alert (same type + optional tag in message) been created in last 7 days?
 */
async function alertExists(userId: string, alertType: string, keyPhrase?: string): Promise<boolean> {
  const result = await query(
    `SELECT id FROM alerts
     WHERE user_id = $1
       AND alert_type = $2
       AND created_at > NOW() - INTERVAL '7 days'
       ${keyPhrase ? `AND message ILIKE $3` : ''}
     LIMIT 1`,
    keyPhrase ? [userId, alertType, `%${keyPhrase}%`] : [userId, alertType]
  );
  return result.rows.length > 0;
}

async function insertAlert(
  userId: string,
  alertType: string,
  title: string,
  message: string,
  metadata: object = {}
) {
  await query(
    `INSERT INTO alerts (user_id, alert_type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, alertType, title, message, JSON.stringify(metadata)]
  );
}

export async function checkAndGenerateAlerts(userId: string, userDbId: string): Promise<void> {
  const month = new Date().toISOString().slice(0, 7);
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysRemaining = daysInMonth - dayOfMonth;

  // --- Run independent checks in parallel ---
  const [
    budgetsRes,
    fraudTxRes,
    creditRes,
    netFlowRes,
    recentTxRes,
  ] = await Promise.all([

    // 1. Budget status for warning check
    query(
      `SELECT b.category, b.monthly_limit as lim, COALESCE(SUM(t.amount), 0) as spent
       FROM budgets b
       LEFT JOIN transactions t
         ON b.user_id = t.user_id
         AND b.category = t.category
         AND to_char(t.transaction_date, 'YYYY-MM') = b.month_year
         AND t.type = 'debit'
       WHERE b.user_id = $1 AND b.month_year = $2
       GROUP BY b.category, b.monthly_limit`,
      [userDbId, month]
    ),

    // 2. Flagged transactions in last 7 days
    query(
      `SELECT merchant_name, amount, fraud_score, fraud_reason
       FROM transactions
       WHERE user_id = $1
         AND is_flagged = true
         AND transaction_date > NOW() - INTERVAL '7 days'
         AND fraud_score > 0.6
       ORDER BY fraud_score DESC
       LIMIT 5`,
      [userDbId]
    ),

    // 3. Last 2 credit score entries
    query(
      `SELECT score FROM credit_scores
       WHERE user_id = $1
       ORDER BY recorded_at DESC
       LIMIT 2`,
      [userDbId]
    ),

    // 4. Net flow in last 30 days
    query(
      `SELECT
         SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as income,
         SUM(CASE WHEN type = 'debit'  THEN amount ELSE 0 END) as expenses
       FROM transactions
       WHERE user_id = $1
         AND transaction_date > NOW() - INTERVAL '30 days'`,
      [userDbId]
    ),

    // 5. Most recent transaction date for inactivity check
    query(
      `SELECT transaction_date FROM transactions
       WHERE user_id = $1
       ORDER BY transaction_date DESC
       LIMIT 1`,
      [userDbId]
    ),
  ]);

  // ── 1. BUDGET WARNINGS ──────────────────────────────────────────────────────
  for (const row of budgetsRes.rows) {
    const spent = parseFloat(row.spent);
    const lim = parseFloat(row.lim);
    const pct = (spent / lim) * 100;
    if (pct >= 80) {
      const remaining = (lim - spent).toFixed(0);
      const already = await alertExists(userDbId, 'budget_warning', row.category);
      if (!already) {
        await insertAlert(
          userDbId,
          'budget_warning',
          `Budget Alert: ${row.category.charAt(0).toUpperCase() + row.category.slice(1)}`,
          `You have used ${pct.toFixed(0)}% of your ${row.category} budget. Only ₹${remaining} left for ${daysRemaining} more days.`,
          { category: row.category, pct, remaining }
        );
      }
    }
  }

  // ── 2. FRAUD ALERTS ─────────────────────────────────────────────────────────
  for (const tx of fraudTxRes.rows) {
    const explanation = tx.fraud_reason ||
      explainFraudRisk(
        { merchant_name: tx.merchant_name, amount: parseFloat(tx.amount) },
        parseFloat(tx.fraud_score),
        []
      );
    const already = await alertExists(userDbId, 'fraud', tx.merchant_name);
    if (!already) {
      await insertAlert(
        userDbId,
        'fraud',
        '⚠️ Suspicious Transaction Detected',
        `A ₹${parseFloat(tx.amount).toLocaleString('en-IN')} payment to '${tx.merchant_name}' has been flagged. ${explanation}`,
        { merchant: tx.merchant_name, amount: tx.amount, fraudScore: tx.fraud_score }
      );
    }
  }

  // ── 3. CREDIT SCORE DROP ────────────────────────────────────────────────────
  if (creditRes.rows.length >= 2) {
    const newScore = creditRes.rows[0].score;
    const oldScore = creditRes.rows[1].score;
    const drop = oldScore - newScore;
    if (drop > 15) {
      const already = await alertExists(userDbId, 'credit_drop');
      if (!already) {
        await insertAlert(
          userDbId,
          'credit_drop',
          'Credit Score Dropped',
          `Your CIBIL score dropped ${drop} points to ${newScore}. Tap to see what affected it.`,
          { oldScore, newScore, drop }
        );
      }
    }
  }

  // ── 4. SAVINGS OPPORTUNITY ──────────────────────────────────────────────────
  if (netFlowRes.rows.length > 0) {
    const income = parseFloat(netFlowRes.rows[0].income || '0');
    const expenses = parseFloat(netFlowRes.rows[0].expenses || '0');
    const idle = income - expenses;
    if (idle > 5000) {
      const interest = Math.round(idle * 0.071 * (3 / 12)); // 3-month FD at ~7.1%
      const already = await alertExists(userDbId, 'savings_opportunity');
      if (!already) {
        await insertAlert(
          userDbId,
          'savings_opportunity',
          `₹${idle.toLocaleString('en-IN')} Idle — Put It to Work!`,
          `You have ₹${idle.toLocaleString('en-IN')} available this month. A 3-month FD could earn approximately ₹${interest.toLocaleString('en-IN')} in returns.`,
          { idleAmount: idle, estimatedInterest: interest }
        );
      }
    }
  }

  // ── 5. INACTIVITY ALERT ─────────────────────────────────────────────────────
  if (recentTxRes.rows.length > 0) {
    const lastTx = new Date(recentTxRes.rows[0].transaction_date);
    const daysSinceLast = (Date.now() - lastTx.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLast >= 8) {
      const already = await alertExists(userDbId, 'unusual_activity');
      if (!already) {
        await insertAlert(
          userDbId,
          'unusual_activity',
          'All quiet this week',
          `No transactions detected in 8 days. Is everything okay with your Paytm account?`,
          { daysSinceLast: Math.floor(daysSinceLast) }
        );
      }
    }
  }
}
