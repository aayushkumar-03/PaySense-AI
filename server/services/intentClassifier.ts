export type IntentType =
  | 'spend_query'
  | 'budget_check'
  | 'credit_question'
  | 'savings_advice'
  | 'fraud_check'
  | 'emi_planning'
  | 'comparison'
  | 'general_chat';

const intentKeywords: Record<IntentType, string[]> = {
  spend_query:      ['kitna', 'kharch', 'spent', 'spend', 'transactions', 'kharcha', 'paisa', 'how much', 'total', 'expenses'],
  budget_check:     ['budget', 'limit', 'remaining', 'bacha', 'left', 'quota', 'over budget', 'allowance'],
  credit_question:  ['credit', 'cibil', 'score', 'loan', 'credit card', 'credit limit', 'enquiry'],
  savings_advice:   ['save', 'invest', 'sip', 'fd', 'idle', 'bacha ke', 'investment', 'returns', 'mutual fund', 'ppf', 'rd'],
  fraud_check:      ['suspicious', 'fraud', 'scam', 'unknown', 'cheat', 'dhoka', 'fake', 'phishing', 'unusual', 'flagged'],
  emi_planning:     ['emi', 'loan', 'afford', 'installment', 'borrow', 'home loan', 'car loan', 'personal loan'],
  comparison:       ['vs', 'versus', 'compare', 'better', 'difference', 'which is', 'should i', 'or'],
  general_chat:     [],
};

export function classifyIntent(message: string): IntentType {
  const lower = message.toLowerCase();

  for (const [intent, keywords] of Object.entries(intentKeywords) as [IntentType, string[]][]) {
    if (intent === 'general_chat') continue;
    if (keywords.some(kw => lower.includes(kw))) {
      return intent;
    }
  }

  return 'general_chat';
}
