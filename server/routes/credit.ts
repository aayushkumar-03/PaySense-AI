import { Router } from 'express';
import { query } from '../db/pool';
import { getUserByFirebaseUid } from '../db/helpers';

const router = Router();

// GET /api/credit
router.get('/', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const result = await query(`SELECT * FROM credit_scores WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 1`, [user.id]);
    
    if (result.rows.length === 0) {
      return res.json({ score: null, factors: [] });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/credit/history
router.get('/history', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    const result = await query(`
      SELECT score, recorded_at 
      FROM credit_scores 
      WHERE user_id = $1 
      ORDER BY recorded_at DESC 
      LIMIT 12
    `, [user.id]);
    
    // Reverse to get chronological order for charts
    res.json(result.rows.reverse());
  } catch (err) {
    next(err);
  }
});

// POST /api/credit/simulate
router.post('/simulate', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    const { action } = req.body;
    
    const latestScoreRes = await query(`SELECT score FROM credit_scores WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 1`, [user.id]);
    const currentScore = latestScoreRes.rows.length > 0 ? latestScoreRes.rows[0].score : 700;

    let impact = 0;
    let description = '';

    switch (action) {
      case 'pay_bill':
        impact = 12;
        description = 'Paying your upcoming bill in full will positively boost your score by demonstrating reliable repayment history.';
        break;
      case 'reduce_utilization':
        impact = 25;
        description = 'Reducing your utilization below 30% significantly improves your credit profile.';
        break;
      case 'new_card':
        impact = -15;
        description = 'Applying for a new card causes a hard inquiry, slightly dipping your score temporarily.';
        break;
      default:
        impact = 0;
        description = 'Unknown action impact.';
    }

    res.json({
      currentScore,
      projectedScore: Math.min(900, Math.max(300, currentScore + impact)),
      impact,
      description
    });
  } catch (err) {
    next(err);
  }
});

export default router;
