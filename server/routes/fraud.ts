import { Router } from 'express';
import { query } from '../db/pool';
import { getUserByFirebaseUid } from '../db/helpers';
import { calculateFraudScore, explainFraudRisk } from '../services/fraudDetection';

const router = Router();

// POST /api/fraud/check
router.post('/check', async (req: any, res: any, next: any) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { merchant_name, amount, transaction_date, upi_id } = req.body;
    const txDate = transaction_date ? new Date(transaction_date) : new Date();

    // Fetch last 50 transactions for user as history baseline
    const historyRes = await query(
      `SELECT merchant_name, amount, transaction_date
       FROM transactions
       WHERE user_id = $1
       ORDER BY transaction_date DESC
       LIMIT 50`,
      [user.id]
    );

    const userHistory = historyRes.rows.map((r: any) => ({
      amount: parseFloat(r.amount),
      merchant_name: r.merchant_name,
      transaction_date: new Date(r.transaction_date),
    }));

    const { score, flags } = calculateFraudScore(
      { amount: parseFloat(amount), merchant_name, transaction_date: txDate, upi_id },
      userHistory
    );

    const explanation = explainFraudRisk({ merchant_name, amount: parseFloat(amount) }, score, flags);

    const riskLevel = score < 0.3 ? 'LOW' : score <= 0.6 ? 'MEDIUM' : 'HIGH';

    const recommendation =
      riskLevel === 'HIGH'
        ? 'Do NOT complete this transaction. Block your card or contact Paytm support immediately if it was not you.'
        : riskLevel === 'MEDIUM'
        ? 'Proceed with caution. Verify the merchant and amount carefully before approving.'
        : 'This transaction appears normal. You can proceed safely.';

    res.json({
      fraudScore: score,
      riskLevel,
      explanation,
      flags,
      recommendation,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
