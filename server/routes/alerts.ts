import { Router } from 'express';
import { query } from '../db/pool';
import { getUserByFirebaseUid } from '../db/helpers';
import { checkAndGenerateAlerts } from '../services/alertsEngine';

const router = Router();

// GET /api/alerts
router.get('/', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let sql = `SELECT * FROM alerts WHERE user_id = $1`;
    const params: any[] = [user.id];
    let paramIdx = 2;

    if (req.query.unread_only === 'true') {
      sql += ` AND is_read = false`;
    }
    if (req.query.type) {
      sql += ` AND alert_type = $${paramIdx++}`;
      params.push(req.query.type);
    }

    sql += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/alerts/:id/read
router.patch('/:id/read', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    const result = await query(`
      UPDATE alerts SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *
    `, [req.params.id, user.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/alerts/read-all
router.patch('/read-all', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    await query(`UPDATE alerts SET is_read = true WHERE user_id = $1 AND is_read = false`, [user.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    const result = await query(`DELETE FROM alerts WHERE id = $1 AND user_id = $2 RETURNING id`, [req.params.id, user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json({ success: true, deleted_id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// POST /api/alerts/run-check — trigger proactive alert generation
router.post('/run-check', async (req: any, res: any, next: any) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await checkAndGenerateAlerts(req.user.uid, user.id);

    // Return fresh alerts after check
    const result = await query(
      `SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [user.id]
    );
    res.json({ success: true, alerts: result.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
