import { Router } from 'express';
import { query } from '../db/pool';
import { getUserByFirebaseUid } from '../db/helpers';

const router = Router();

// GET /api/budgets?month=YYYY-MM
router.get('/', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);

    const budgetsRes = await query(`
      SELECT b.*, COALESCE(SUM(t.amount), 0) as spent
      FROM budgets b
      LEFT JOIN transactions t ON b.user_id = t.user_id AND b.category = t.category AND to_char(t.transaction_date, 'YYYY-MM') = b.month_year AND t.type='debit'
      WHERE b.user_id = $1 AND b.month_year = $2
      GROUP BY b.id
    `, [user.id, month]);

    res.json(budgetsRes.rows.map(r => ({
      ...r,
      monthly_limit: parseFloat(r.monthly_limit),
      spent: parseFloat(r.spent)
    })));

  } catch (err) {
    next(err);
  }
});

// POST /api/budgets
router.post('/', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    const { category, monthly_limit, month_year } = req.body;

    const result = await query(`
      INSERT INTO budgets (user_id, category, monthly_limit, month_year)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, category, month_year) 
      DO UPDATE SET monthly_limit = EXCLUDED.monthly_limit
      RETURNING *
    `, [user.id, category, monthly_limit, month_year]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/budgets/:id
router.put('/:id', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    const { monthly_limit } = req.body;

    const result = await query(`
      UPDATE budgets SET monthly_limit = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [monthly_limit, req.params.id, user.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Budget not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);

    const result = await query(`DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id`, [req.params.id, user.id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Budget not found' });
    res.json({ success: true, deleted_id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
