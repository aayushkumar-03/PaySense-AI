import { Router } from 'express';
import { query } from '../db/pool';
import { getUserByFirebaseUid } from '../db/helpers';
import { generateFinancialResponse, FinancialContext } from '../services/aiService';

const router = Router();

// GET /api/chat/sessions
router.get('/sessions', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const result = await query(`
      SELECT * FROM chat_sessions 
      WHERE user_id = $1 
      ORDER BY updated_at DESC LIMIT 20
    `, [user.id]);
    
    res.json(result.rows);
  } catch(err) {
    next(err);
  }
});

// GET /api/chat/sessions/:sessionId/messages
router.get('/sessions/:sessionId/messages', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    const result = await query(`
      SELECT m.* FROM chat_messages m
      JOIN chat_sessions s ON m.session_id = s.id
      WHERE s.id = $1 AND s.user_id = $2
      ORDER BY m.created_at ASC
    `, [req.params.sessionId, user.id]);
    
    res.json(result.rows);
  } catch(err) {
    next(err);
  }
});

// DELETE /api/chat/sessions/:sessionId
router.delete('/sessions/:sessionId', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    // CASCADE will delete messages
    await query(`DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2`, [req.params.sessionId, user.id]);
    res.json({ success: true });
  } catch(err) {
    next(err);
  }
});

// PATCH /api/chat/sessions/:sessionId
router.patch('/sessions/:sessionId', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    const result = await query(`
      UPDATE chat_sessions SET title = $1 
      WHERE id = $2 AND user_id = $3 RETURNING *
    `, [req.body.title, req.params.sessionId, user.id]);
    res.json(result.rows[0]);
  } catch(err) {
    next(err);
  }
});

// POST /api/chat/message
router.post('/message', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { userMessage, sessionId, language = 'en' } = req.body;

    // 1. Check query limit
    const nowLocal = new Date();
    const todayStr = nowLocal.toISOString().split('T')[0];
    
    let dbResetDate = user.queries_reset_at ? new Date(user.queries_reset_at).toISOString().split('T')[0] : null;

    if (dbResetDate !== todayStr) {
      // Reset counters for new day
      await query(`UPDATE users SET queries_today = 0, queries_reset_at = NOW() WHERE id = $1`, [user.id]);
      user.queries_today = 0;
    }

    if (user.plan === 'free' && user.queries_today >= 5) {
      return res.status(429).json({ 
        error: 'QUERY_LIMIT_REACHED', 
        plan: 'free', 
        upgradeUrl: '/settings' 
      });
    }

    // 2. Get or create chat session
    let currentSessionId = sessionId;
    let sessionTitle = 'New Chat';
    
    if (!currentSessionId) {
      const sessResult = await query(`
        INSERT INTO chat_sessions (user_id, language) 
        VALUES ($1, $2) RETURNING *
      `, [user.id, language]);
      currentSessionId = sessResult.rows[0].id;
    } else {
      const sessResult = await query(`SELECT title FROM chat_sessions WHERE id = $1 AND user_id = $2`, [currentSessionId, user.id]);
      if (sessResult.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
      sessionTitle = sessResult.rows[0].title;
    }

    // 3. Fetch financial context
    const monthStr = new Date().toISOString().slice(0, 7);
    const [
      txRes, spendRes, budgetsRes, alertsRes, creditRes
    ] = await Promise.all([
      query(`SELECT merchant_name as merchant, amount, category, transaction_date as date, is_flagged FROM transactions WHERE user_id = $1 ORDER BY transaction_date DESC LIMIT 15`, [user.id]),
      query(`SELECT category, SUM(amount) as cost FROM transactions WHERE user_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2 AND type='debit' GROUP BY category`, [user.id, monthStr]),
      query(`SELECT b.category, b.monthly_limit as limit, COALESCE(SUM(t.amount), 0) as spent FROM budgets b LEFT JOIN transactions t ON b.user_id = t.user_id AND b.category = t.category AND to_char(t.transaction_date, 'YYYY-MM') = b.month_year AND t.type='debit' WHERE b.user_id = $1 AND b.month_year = $2 GROUP BY b.category, b.monthly_limit`, [user.id, monthStr]),
      query(`SELECT alert_type as type, message FROM alerts WHERE user_id = $1 AND is_read = false`, [user.id]),
      query(`SELECT score, factors FROM credit_scores WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 1`, [user.id])
    ]);

    const totalSpentThisMonth = spendRes.rows.reduce((acc: number, r: any) => acc + parseFloat(r.cost), 0);
    const monthlySpend = spendRes.rows.reduce((acc: any, r: any) => { acc[r.category] = parseFloat(r.cost); return acc; }, {});
    const budgets = budgetsRes.rows.map((r: any) => ({ category: r.category, limit: parseFloat(r.limit), spent: parseFloat(r.spent), pct: (parseFloat(r.spent) / parseFloat(r.limit))*100 }));
    
    // Last month baseline
    const prevSpendRes = await query(`SELECT SUM(amount) as total FROM transactions WHERE user_id = $1 AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) AND type='debit'`, [user.id]);
    const lastMonthSpend = parseFloat(prevSpendRes.rows[0]?.total || '0');
    const vsLastMonthPct = lastMonthSpend > 0 ? ((totalSpentThisMonth - lastMonthSpend) / lastMonthSpend) * 100 : 0;

    const financialContext: FinancialContext = {
      currentMonth: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      recentTransactions: txRes.rows,
      monthlySpend,
      budgets,
      latestCreditScore: creditRes.rows[0]?.score || null,
      creditFactors: creditRes.rows[0]?.factors || [],
      unreadAlerts: alertsRes.rows,
      savingsBalance: 12500, // mock payload for savings balance or derive from credit/db
      pendingEMIs: [],
      totalSpentThisMonth,
      vsLastMonthPct
    };

    // 4. Get conversation history
    const historyRes = await query(`
      SELECT role, content FROM chat_messages 
      WHERE session_id = $1 ORDER BY created_at ASC LIMIT 10
    `, [currentSessionId]);

    // 5. Save user message
    await query(`
      INSERT INTO chat_messages (session_id, user_id, role, content) 
      VALUES ($1, $2, 'user', $3)
    `, [currentSessionId, user.id, userMessage]);

    // 6. Call AI Engine
    const aiResult = await generateFinancialResponse({
      userMessage,
      userId: user.id,
      language,
      conversationHistory: historyRes.rows,
      financialContext
    });

    // 7. Save AI message
    const savedAiMsg = await query(`
      INSERT INTO chat_messages (session_id, user_id, role, content, metadata) 
      VALUES ($1, $2, 'assistant', $3, $4) RETURNING id
    `, [currentSessionId, user.id, aiResult.response, { actions: aiResult.suggestedActions }]);

    // 8. Increment queries
    await query(`UPDATE users SET queries_today = queries_today + 1 WHERE id = $1`, [user.id]);

    // 9. Auto-generate title optionally
    if (sessionTitle === 'New Chat' && historyRes.rows.length === 0) {
      const autoTitle = userMessage.slice(0, 40) + '...';
      await query(`UPDATE chat_sessions SET title = $1 WHERE id = $2`, [autoTitle, currentSessionId]);
    }

    res.json({
      response: aiResult.response,
      sessionId: currentSessionId,
      suggestedActions: aiResult.suggestedActions,
      queriesRemaining: user.plan === 'pro' ? 'unlimited' : Math.max(0, 4 - user.queries_today),
      messageId: savedAiMsg.rows[0].id
    });

  } catch(err) {
    console.error("Chat route error:", err);
    next(err);
  }
});

export default router;
