import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { query } from '../db/pool';
import { getUserByFirebaseUid } from '../db/helpers';

const router = Router();

// POST /api/auth/sync-profile — called on login to upsert user in DB
router.post('/sync-profile', authenticate, async (req: any, res: any) => {
  try {
    const { uid, email, name, picture } = req.user;

    const existing = await query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);

    if (existing.rows.length === 0) {
      const result = await query(
        `INSERT INTO users (firebase_uid, email, display_name, photo_url, plan)
         VALUES ($1, $2, $3, $4, 'free') RETURNING *`,
        [uid, email || null, name || null, picture || null]
      );
      return res.status(200).json({ user: result.rows[0], isNewUser: true });
    } else {
      const result = await query(
        `UPDATE users SET last_seen_at = NOW() WHERE firebase_uid = $1 RETURNING *`,
        [uid]
      );
      return res.status(200).json({ user: result.rows[0], isNewUser: false });
    }
  } catch (error: any) {
    console.error('Profile sync error:', error);
    res.status(500).json({ error: 'Internal server error during profile sync' });
  }
});

// GET /api/auth/profile — get current user profile from DB
router.get('/profile', authenticate, async (req: any, res: any) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/profile — update profile fields
router.patch('/profile', authenticate, async (req: any, res: any) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const allowed = ['display_name', 'phone', 'photo_url', 'preferred_language', 'onboarding_completed'];
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        values.push(req.body[key]);
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    values.push(user.id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/data — clear all user data (keep user row)
router.delete('/data', authenticate, async (req: any, res: any) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await query('DELETE FROM transactions WHERE user_id = $1', [user.id]);
    await query('DELETE FROM budgets WHERE user_id = $1', [user.id]);
    await query('DELETE FROM alerts WHERE user_id = $1', [user.id]);
    await query('DELETE FROM credit_scores WHERE user_id = $1', [user.id]);
    await query('DELETE FROM financial_goals WHERE user_id = $1', [user.id]);
    await query('DELETE FROM chat_sessions WHERE user_id = $1', [user.id]);
    await query('DELETE FROM savings_suggestions WHERE user_id = $1', [user.id]);

    res.json({ success: true, message: 'All user data deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/account — delete everything
router.delete('/account', authenticate, async (req: any, res: any) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await query('DELETE FROM users WHERE id = $1', [user.id]);
    res.json({ success: true, message: 'Account deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
