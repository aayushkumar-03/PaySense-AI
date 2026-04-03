import { Router } from 'express';
import { query } from '../db/pool';
import { getUserByFirebaseUid } from '../db/helpers';

const router = Router();

// GET /api/transactions
router.get('/', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7); // YYYY-MM
    let sql = `
      SELECT * FROM transactions 
      WHERE user_id = $1 
      AND to_char(transaction_date, 'YYYY-MM') = $2
    `;
    const params: any[] = [user.id, month];
    let paramIndex = 3;

    if (req.query.category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(req.query.category);
    }
    if (req.query.flagged_only === 'true') {
      sql += ` AND is_flagged = true`;
    }

    // Count before applying limit
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as exact_count');
    const countRes = await query(countSql, params);
    const totalCount = parseInt(countRes.rows[0].exact_count, 10);

    // Totals by category (ignoring pagination)
    const catSql = `
      SELECT category, SUM(amount) as total 
      FROM transactions 
      WHERE user_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2
      GROUP BY category
    `;
    const categoryTotalsRes = await query(catSql, [user.id, month]);

    // Apply sorting and pagination
    sql += ` ORDER BY transaction_date DESC`;
    
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const transactions = await query(sql, params);

    res.json({
      transactions: transactions.rows,
      totalCount,
      categoryTotals: categoryTotalsRes.rows,
      pagination: { limit, offset }
    });

  } catch (err) {
    next(err);
  }
});

// GET /api/transactions/summary
router.get('/summary', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    
    // Total spent & Total Income
    const spendRes = await query(`
      SELECT 
        SUM(CASE WHEN type='debit' THEN amount ELSE 0 END) as total_spent,
        SUM(CASE WHEN type='credit' THEN amount ELSE 0 END) as total_income
      FROM transactions 
      WHERE user_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2
    `, [user.id, month]);

    const totalSpent = parseFloat(spendRes.rows[0].total_spent || '0');
    const totalIncome = parseFloat(spendRes.rows[0].total_income || '0');
    const netSavings = totalIncome - totalSpent;

    // Last Month Total for comparison
    const [y, m] = month.split('-');
    const prevMonthDate = new Date(parseInt(y), parseInt(m) - 2);
    const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    
    const prevSpendRes = await query(`
      SELECT SUM(amount) as last_month_total 
      FROM transactions 
      WHERE user_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2 AND type='debit'
    `, [user.id, prevMonth]);

    const lastMonthTotal = parseFloat(prevSpendRes.rows[0].last_month_total || '0');
    const pctChange = lastMonthTotal > 0 ? ((totalSpent - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Categories
    const catBreakdown = await query(`
      SELECT t.category, SUM(t.amount) as amount, b.monthly_limit as budget
      FROM transactions t
      LEFT JOIN budgets b ON t.user_id = b.user_id AND t.category = b.category AND b.month_year = $2
      WHERE t.user_id = $1 AND to_char(t.transaction_date, 'YYYY-MM') = $2 AND t.type='debit'
      GROUP BY t.category, b.monthly_limit
    `, [user.id, month]);

    const categoryBreakdown = catBreakdown.rows.map(row => ({
      category: row.category,
      amount: parseFloat(row.amount),
      budget: row.budget ? parseFloat(row.budget) : null,
      percentage: row.budget ? (parseFloat(row.amount) / parseFloat(row.budget)) * 100 : 0
    }));

    // Top Merchants
    const topMerchants = await query(`
      SELECT merchant_name name, COUNT(*) count, SUM(amount) total
      FROM transactions
      WHERE user_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2 AND type='debit'
      GROUP BY merchant_name
      ORDER BY total DESC
      LIMIT 5
    `, [user.id, month]);

    // Daily totals
    const dailyTotals = await query(`
      SELECT DATE(transaction_date) as date, SUM(amount) as amount
      FROM transactions
      WHERE user_id = $1 AND to_char(transaction_date, 'YYYY-MM') = $2 AND type='debit'
      GROUP BY DATE(transaction_date)
      ORDER BY date ASC
    `, [user.id, month]);

    res.json({
      totalSpent,
      totalIncome,
      netSavings,
      categoryBreakdown,
      topMerchants: topMerchants.rows.map(r => ({ ...r, count: parseInt(r.count), total: parseFloat(r.total) })),
      dailyTotals: dailyTotals.rows.map(r => ({ ...r, amount: parseFloat(r.amount) })),
      vsLastMonth: { pctChange, lastMonthTotal }
    });

  } catch (err) {
    next(err);
  }
});

// POST /api/transactions
router.post('/', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    const { amount, type, category, merchant_name, description, transaction_date } = req.body;
    
    // very rudimentary mock fraud detection for custom transactions
    const is_flagged = amount > 10000;
    const fraud_score = is_flagged ? 0.8 : 0.1;

    const result = await query(`
      INSERT INTO transactions (user_id, amount, type, category, merchant_name, description, transaction_date, is_flagged, fraud_score)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [user.id, amount, type, category, merchant_name, description, transaction_date || new Date().toISOString(), is_flagged, fraud_score]);

    res.status(201).json(result.rows[0]);
  } catch(err) {
    next(err);
  }
});

export default router;
