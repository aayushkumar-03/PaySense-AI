const KNOWN_UPI_DOMAINS = [
  'okaxis', 'okhdfcbank', 'okicici', 'oksbi', 'ybl', 'ibl', 'axl',
  'paytm', 'upi', 'apl', 'sbi', 'rbl', 'cnrb', 'kotak', 'icici',
  'hdfc', 'axis', 'federal', 'airtel', 'jio', 'googlepay', 'phonepe'
];

const SUSPICIOUS_KEYWORDS = ['lottery', 'prize', 'lucky', 'gift', 'loan', 'reward', 'winner', 'refund', 'cashback'];

const ROUND_AMOUNTS = new Set([500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]);

function isRoundAmount(amount: number): boolean {
  return ROUND_AMOUNTS.has(amount) || (amount % 1000 === 0 && amount >= 1000);
}

function getHour(date: Date): number {
  return date.getHours();
}

function hasSuspiciousUpiDomain(upiId: string): boolean {
  const domain = upiId.split('@')[1]?.toLowerCase() || '';
  return !KNOWN_UPI_DOMAINS.some(d => domain.includes(d));
}

export interface FraudCheckResult {
  score: number;
  flags: string[];
}

export function calculateFraudScore(
  transaction: {
    amount: number;
    merchant_name: string;
    transaction_date: Date;
    upi_id?: string;
  },
  userHistory: Array<{
    amount: number;
    merchant_name: string;
    transaction_date: Date;
  }>
): FraudCheckResult {
  let score = 0;
  const flags: string[] = [];

  // 1. Amount > 3x user average (last 30 transactions)
  if (userHistory.length > 0) {
    const avgAmount = userHistory.reduce((sum, t) => sum + t.amount, 0) / userHistory.length;
    if (transaction.amount > avgAmount * 3) {
      score += 0.30;
      flags.push('AMOUNT_ANOMALY');
    }
  }

  // 2. New merchant + amount > ₹5,000
  const knownMerchants = new Set(userHistory.map(t => t.merchant_name.toLowerCase()));
  if (!knownMerchants.has(transaction.merchant_name.toLowerCase()) && transaction.amount > 5000) {
    score += 0.20;
    flags.push('NEW_MERCHANT_HIGH_VALUE');
  }

  // 3. Unusual hour (01:00–05:00)
  const hour = getHour(transaction.transaction_date);
  if (hour >= 1 && hour <= 5) {
    score += 0.15;
    flags.push('UNUSUAL_HOUR');
  }

  // 4. Rapid repeat — same merchant 3+ times within 60 min
  const txTime = transaction.transaction_date.getTime();
  const recentSameMerchant = userHistory.filter(t => {
    const diff = Math.abs(txTime - t.transaction_date.getTime());
    return (
      t.merchant_name.toLowerCase() === transaction.merchant_name.toLowerCase() &&
      diff <= 60 * 60 * 1000 // 60 minutes
    );
  });
  if (recentSameMerchant.length >= 3) {
    score += 0.25;
    flags.push('RAPID_REPEAT');
  }

  // 5. Round amount
  if (isRoundAmount(transaction.amount)) {
    score += 0.10;
    flags.push('ROUND_AMOUNT');
  }

  // 6. Suspicious merchant name
  const nameL = transaction.merchant_name.toLowerCase();
  if (SUSPICIOUS_KEYWORDS.some(kw => nameL.includes(kw))) {
    score += 0.30;
    flags.push('SUSPICIOUS_MERCHANT');
  }

  // 7. Transaction within 30 seconds of last transaction
  if (userHistory.length > 0) {
    const lastTx = userHistory.sort(
      (a, b) => b.transaction_date.getTime() - a.transaction_date.getTime()
    )[0];
    const timeDiff = Math.abs(txTime - lastTx.transaction_date.getTime());
    if (timeDiff <= 30 * 1000) {
      score += 0.20;
      flags.push('VELOCITY_FLAG');
    }
  }

  // 8. Suspicious UPI domain
  if (transaction.upi_id && hasSuspiciousUpiDomain(transaction.upi_id)) {
    score += 0.15;
    flags.push('SUSPICIOUS_UPI');
  }

  // Cap at 1.0
  return { score: Math.min(1.0, parseFloat(score.toFixed(3))), flags };
}

const FLAG_EXPLANATIONS: Record<string, string> = {
  AMOUNT_ANOMALY:          'the amount is much higher than your usual transactions',
  NEW_MERCHANT_HIGH_VALUE: 'this is a new merchant you have never paid before, with a large amount',
  UNUSUAL_HOUR:            'it happened at an unusual hour (between 1–5 AM)',
  RAPID_REPEAT:            'you made multiple payments to the same merchant very quickly',
  ROUND_AMOUNT:            'the amount is a suspiciously round number often used in scams',
  SUSPICIOUS_MERCHANT:     'the merchant name contains words commonly used in scams (lottery, prize, etc.)',
  VELOCITY_FLAG:           'this transaction was made within 30 seconds of your previous one',
  SUSPICIOUS_UPI:          'the UPI ID does not belong to a recognised bank or payment app',
};

export function explainFraudRisk(
  transaction: { merchant_name: string; amount: number },
  score: number,
  flags: string[]
): string {
  const riskLevel = score < 0.3 ? 'LOW' : score <= 0.6 ? 'MEDIUM' : 'HIGH';
  const explanations = flags.map(f => FLAG_EXPLANATIONS[f] || f).join('; ');

  if (flags.length === 0) {
    return `This ₹${transaction.amount.toLocaleString('en-IN')} payment to '${transaction.merchant_name}' looks LOW risk with no suspicious signals detected.`;
  }

  return `This ₹${transaction.amount.toLocaleString('en-IN')} payment to '${transaction.merchant_name}' looks ${riskLevel} risk because: ${explanations}.`;
}
