export interface User {
  id: string;
  firebase_uid: string;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  phone: string | null;
  preferred_language: 'en' | 'hi' | 'hinglish';
  plan: 'free' | 'pro';
  queries_today: number;
  queries_reset_at: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  last_seen_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'debit' | 'credit';
  category: 'food' | 'transport' | 'shopping' | 'bills' | 'entertainment' | 'health' | 'investment' | 'other';
  merchant_name: string;
  description: string | null;
  upi_id: string | null;
  transaction_date: string;
  is_flagged: boolean;
  fraud_score: number | null;
  fraud_reason: string | null;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  month_year: string;
  created_at: string;
  updated_at: string;
}

export interface CreditScore {
  id: string;
  user_id: string;
  score: number;
  bureau: 'CIBIL' | 'Experian' | 'CRIF';
  factors: Array<{ factor: string; impact: string; description: string; tip: string }>;
  recorded_at: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  goal_type: 'emergency' | 'vacation' | 'home' | 'investment' | 'wedding' | 'other' | null;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  language: 'en' | 'hi' | 'hinglish';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  alert_type: 'budget_warning' | 'fraud' | 'emi_due' | 'credit_drop' | 'savings_opportunity' | 'unusual_activity';
  title: string;
  message: string;
  is_read: boolean;
  action_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SavingsSuggestion {
  id: string;
  user_id: string;
  suggestion_type: 'sip' | 'fd' | 'rd' | 'ppf' | null;
  amount: number | null;
  expected_return_pct: number | null;
  duration_months: number | null;
  description: string | null;
  is_accepted: boolean | null;
  created_at: string;
}
