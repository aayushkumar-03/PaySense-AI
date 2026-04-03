import { Router } from 'express';
import { seedDemoData } from '../services/seedData';
import { getUserByFirebaseUid } from '../db/helpers';

const router = Router();

// POST /api/seed-demo
router.post('/seed-demo', async (req: any, res: any, next) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const result = await seedDemoData(user.id);
    
    if (!result.seeded) {
      return res.json({ seeded: false, message: result.message });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
