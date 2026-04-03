import { GoogleGenerativeAI } from '@google/generative-ai';
import { retrieveRelevantContext } from './ragService';
import { classifyIntent } from './intentClassifier';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface Action {
  type: string;
  category?: string;
  amount?: number;
  [key: string]: any;
}

export interface FinancialContext {
  currentMonth: string;
  recentTransactions: Array<{
    merchant: string;
    amount: number;
    category: string;
    date: string;
    is_flagged: boolean;
  }>;
  monthlySpend: Record<string, number>;
  budgets: Array<{ category: string; limit: number; spent: number; pct: number }>;
  latestCreditScore: number | null;
  creditFactors: Array<{ factor: string; impact: string; description: string }>;
  unreadAlerts: Array<{ type: string; message: string }>;
  savingsBalance: number;
  pendingEMIs: Array<{ name: string; amount: number; due_date: string }>;
  totalSpentThisMonth: number;
  vsLastMonthPct: number;
}

function buildIntentGuidance(intent: ReturnType<typeof classifyIntent>): string {
  switch (intent) {
    case 'spend_query':
      return 'INTENT=spend_query: Lead with specific ₹ amounts prominently. Use a short table or bullet breakdown.';
    case 'savings_advice':
      return 'INTENT=savings_advice: Provide numbered, actionable steps. Include specific products (Nifty 50 index, HDFC FD, etc.).';
    case 'fraud_check':
      return 'INTENT=fraud_check: Start your response with RISK LEVEL: [LOW/MEDIUM/HIGH]. Then explain clearly why.';
    case 'budget_check':
      return 'INTENT=budget_check: Show how much is remaining per category. Flag any over/near-limit categories with ⚠️.';
    case 'credit_question':
      return 'INTENT=credit_question: Reference the user\'s actual score and factors. Give 2-3 actionable improvement tips.';
    case 'emi_planning':
      return 'INTENT=emi_planning: Apply the 40% EMI rule. Show the math clearly.';
    case 'comparison':
      return 'INTENT=comparison: Use a concise pros/cons format or table. End with a clear recommendation.';
    default:
      return '';
  }
}

export async function generateFinancialResponse(params: {
  userMessage: string;
  userId: string;
  language: 'en' | 'hi' | 'hinglish';
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  financialContext: FinancialContext;
  retrievedKnowledge?: string;
}): Promise<{ response: string; suggestedActions: Action[]; tokensUsed: number }> {

  const context = params.financialContext;

  // Classify intent and retrieve RAG context in parallel
  const intent = classifyIntent(params.userMessage);
  const ragContext = params.retrievedKnowledge ??
    await retrieveRelevantContext(params.userMessage);

  const intentGuidance = buildIntentGuidance(intent);

  const systemPrompt = `You are PaySense AI, a warm and knowledgeable conversational financial copilot for Indian Paytm users. You help people understand their money better.

PERSONALITY:
- Warm, friendly, like a knowledgeable friend who happens to be a finance expert
- Never judgmental about spending habits
- Proactive — if you notice something important in the data, mention it
- Use relatable Indian references (chai vs coffee, metro vs Uber, etc.)
- End answers with a helpful follow-up question or tip

LANGUAGE RULES (CRITICAL):
- language=hi: Respond entirely in Hindi using Devanagari script. Use ₹ symbol, not "rupaye" in numbers.
- language=hinglish: Mix Hindi and English naturally like educated urban Indians speak. E.g., "Aapka food budget thoda tight lag raha hai this month"
- language=en: Clear, simple English. Avoid jargon.
- ALWAYS use Indian number system: ₹1,500 not $1,500. Say "1.5 lakh" not "150,000". Say "3 crore" not "30,000,000".
CURRENT LANGUAGE REQUESTED: ${params.language}

${intentGuidance ? `INTENT GUIDANCE:\n${intentGuidance}\n` : ''}
CURRENT USER FINANCIAL DATA:
Month: ${context.currentMonth}
Total spent: ₹${context.totalSpentThisMonth} (${context.vsLastMonthPct > 0 ? '+' : ''}${context.vsLastMonthPct.toFixed(1)}% vs last month)
Category spend: ${JSON.stringify(context.monthlySpend)}
Budget status: ${JSON.stringify(context.budgets)}
Credit score: ${context.latestCreditScore || 'Not available'}
Active alerts: ${context.unreadAlerts.length}
Savings balance: ₹${context.savingsBalance}
Recent transactions (last 10): ${JSON.stringify(context.recentTransactions.slice(0, 10))}

${ragContext ? `RELEVANT FINANCIAL KNOWLEDGE BASE:\n${ragContext}\n` : ''}
RESPONSE RULES:
- For spend queries: give specific numbers from the data above, don't make up amounts
- For advice: be specific, not generic. "Invest in mutual funds" is bad. "Your ₹6,200 idle balance could go into a Nifty 50 index SIP at ₹3,000/month" is good.
- Keep responses concise: 3-5 lines for simple questions. Longer only for multi-step advice.
- For suspicious transactions: explain clearly why it looks suspicious
- If asked about something not in your data: say so honestly, don't invent numbers
- NEVER present yourself as a SEBI-registered financial advisor. For major decisions, recommend consulting one.

RESPONSE FORMAT GUIDE:
- Spending summaries: use structured breakdown with numbers
- Advice/recommendations: numbered steps
- Warnings: start with an emoji alert (⚠️ or 🚨)
- Good news: start with ✅ or 🎉`;

  const formattedHistory = params.conversationHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : msg.role,
    parts: [{ text: msg.content }]
  }));

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt
    });

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(params.userMessage);
    const aiText = result.response.text();

    // Parse suggested actions with regex/heuristics
    const suggestedActions: Action[] = [];
    const lowerText = aiText.toLowerCase();

    const budgetMatch = lowerText.match(/set budget to ₹?([0-9,]+) for ([a-z]+)/);
    if (budgetMatch) {
      suggestedActions.push({
        type: 'SET_BUDGET',
        amount: parseInt(budgetMatch[1].replace(/,/g, '')),
        category: budgetMatch[2]
      });
    }

    const sipMatch = lowerText.match(/consider sip of ₹?([0-9,]+)/);
    if (sipMatch) {
      suggestedActions.push({
        type: 'SAVINGS_SUGGESTION',
        amount: parseInt(sipMatch[1].replace(/,/g, '')),
        suggestionType: 'sip'
      });
    }

    return {
      response: aiText,
      suggestedActions,
      tokensUsed: result.response.usageMetadata?.totalTokenCount || 0
    };

  } catch (error) {
    console.error('AI Service Error:', error);
    return {
      response: "I'm having trouble connecting to my Gemini AI core right now. Please try again in a moment!",
      suggestedActions: [],
      tokensUsed: 0
    };
  }
}
