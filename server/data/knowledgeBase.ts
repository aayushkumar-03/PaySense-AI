export interface KnowledgeDocument {
  id: string;
  title: string;
  text: string;
  tags: string[];
}

export const knowledgeBase: KnowledgeDocument[] = [
  {
    id: 'kb-001',
    title: 'CIBIL Score Calculation',
    tags: ['credit', 'cibil', 'score'],
    text: `CIBIL Score (300-900) is calculated using 5 key factors:
1. Payment History (35%): On-time repayment of all loans, credit cards, EMIs. Even a single missed payment can drop your score by 50-100 points.
2. Credit Utilization (30%): How much of your credit limit you use. Ideal is below 30%. Using 45%+ signals financial stress to lenders.
3. Length of Credit History (15%): Older accounts improve your score. Never close your oldest credit card.
4. Credit Mix (10%): Having a mix of secured (home, auto loan) and unsecured (credit card, personal loan) credit is beneficial.
5. New Credit (10%): Every hard inquiry (new loan/card application) slightly reduces your score for 6-12 months.
A score above 750 qualifies for the best loan rates. 700-750 is good. Below 650 makes loan approval difficult.`
  },
  {
    id: 'kb-002',
    title: 'SIP vs FD vs RD Comparison for Indian Investors',
    tags: ['investment', 'sip', 'fd', 'rd', 'savings'],
    text: `SIP (Systematic Investment Plan): Monthly investment into mutual funds.
- Expected returns: 10-14% p.a. (market-linked, not guaranteed)
- Best for: Long term (5+ years), wealth building, tax saving via ELSS
- Tax: LTCG tax 10% on gains above ₹1 lakh/year
- Risk: Medium-High (market risk)

FD (Fixed Deposit): Lump sum locked for fixed tenure.
- Expected returns: 6.5-7.5% p.a. (bank-dependent)
- Best for: Short-medium term (1-5 years), capital protection, guaranteed returns
- Tax: Interest added to income and taxed as per slab. TDS deducted if interest > ₹40,000/year.
- Risk: Negligible (DICGC insured up to ₹5 lakh)

RD (Recurring Deposit): Monthly contribution like SIP but into bank at fixed rate.
- Expected returns: 6-7% p.a.
- Best for: Disciplined saving, parking regular income safely
- Tax: Same as FD

Rule of thumb: Emergency fund → FD/Savings. Short goal (1-3yr) → RD. Long term wealth → SIP.`
  },
  {
    id: 'kb-003',
    title: 'Common UPI Fraud in India 2024',
    tags: ['fraud', 'scam', 'upi', 'security'],
    text: `India's most common UPI frauds:
1. Collect Request Fraud: Scammer sends a collect/payment request disguised as "receiving money". NEVER enter your UPI PIN to receive money — PIN is only for sending.
2. Screen Share Scams: Fake customer care asks you to install AnyDesk/TeamViewer to "resolve" an issue and steals your OTP.
3. KYC Update Frauds: SMS/calls claiming "complete KYC in 24 hours or account will be blocked". Real banks never ask for OTP over phone.
4. QR Code Scams: Fraudsters send QR codes claiming you'll receive money. Scanning = you paying them.
5. Fake Payment Screenshots: Sellers on OLX/Facebook receive a fake payment screenshot. Always check your bank account, never trust screenshots.
6. SIM Swap: Criminal ports your number to a new SIM to intercept OTPs.
Red flags: Urgency, requests for OTP/PIN, unsolicited calls from "bank", promises of cashback.`
  },
  {
    id: 'kb-004',
    title: 'Section 80C Tax Saving Instruments',
    tags: ['tax', '80c', 'savings', 'investment'],
    text: `Section 80C allows deduction up to ₹1.5 lakh/year from taxable income under the old tax regime.
Qualifying instruments:
- ELSS Mutual Funds: 3-year lock-in, market-linked returns (~12%), best 80C option for wealth creation
- PPF (Public Provident Fund): Government-backed, 7.1% tax-free interest, 15-year lock-in, EEE status
- NSC (National Savings Certificate): 5-year lock-in, 7.7% interest, taxable but qualifies for 80C
- Life Insurance Premium: Term/ULIP premiums qualify
- 5-Year Bank FD: Tax-saving FD (6.5-7.5%), interest taxable
- Home Loan Principal: Annual principal repayment qualifies
Note: New tax regime (post-FY24) does NOT allow 80C deductions but has lower slab rates. Choose based on your income and deductions.`
  },
  {
    id: 'kb-005',
    title: 'Emergency Fund — Building & Parking',
    tags: ['emergency', 'savings', 'liquid fund'],
    text: `An emergency fund is 3-6 months of essential monthly expenses (rent + food + EMIs + utilities).
Example: If monthly essentials = ₹35,000, emergency fund target = ₹1.05-2.1 lakh.
Where to park it:
1. High-interest Savings Account (HDFC Savings Max, Kotak 811): 3-4% interest, fully liquid
2. Liquid Mutual Funds: 4-6% returns, redemption in 24 hours (not instant), no exit load after 7 days
3. Sweep-in FD: Bank auto-creates FD when balance exceeds threshold, earns FD rates, available on request
Avoid: Equity/mutual funds (market risk), stocks (volatility), illiquid assets.
Build it before investing — even a ₹5,000 medical emergency shouldn't disturb your SIPs.`
  },
  {
    id: 'kb-006',
    title: 'Credit Utilization Ratio — CIBIL Impact',
    tags: ['credit', 'utilization', 'cibil', 'credit card'],
    text: `Credit Utilization = (Total Outstanding Balance / Total Credit Limit) × 100
Example: You have 2 cards with limits ₹1L and ₹50K = ₹1.5L total limit. Outstanding ₹60K = 40% utilization.
Ideal range: Below 30%. Best for CIBIL: Below 10%.
Impact:
- <10% utilization: Excellent credit signal, +CIBIL impact
- 10-30%: Good
- 30-50%: Moderate concern, scores may dip
- >50%: Significant CIBIL damage, lenders see you as credit-hungry

Tips:
1. Request a credit limit increase without raising spending
2. Pay dues twice a month instead of once (lowers average utilization period)
3. Don't close old credit cards (reduces total available credit, raises utilization ratio)
4. Use debit for large purchases to keep card utilization low`
  },
  {
    id: 'kb-007',
    title: 'Paytm Wallet vs Bank Account — How It Works',
    tags: ['paytm', 'wallet', 'upi', 'bank'],
    text: `Paytm Wallet vs Paytm Bank Account:
Wallet:
- Max balance: ₹20,000 (min KYC), ₹2 lakh (full KYC)
- Cannot receive direct bank transfers or salary
- Can pay for merchants, Paytm QR codes
- Cannot send to other bank accounts without KYC upgrade
- No interest earned

Paytm Payments Bank Account:
- Max balance: ₹2 lakh
- Has account number + IFSC, can receive salary/NEFT/IMPS
- Earns 2.5-4% interest
- Linked to UPI, can pay anyone

Key difference: Wallet is a closed loop pre-paid instrument. Bank account is an RBI-regulated payments bank — safer but with ₹2L cap.
For large transactions, salary credit, transfers to other banks — always use the bank account.`
  },
  {
    id: 'kb-008',
    title: 'EMI Affordability Rule — How Much Can You Borrow?',
    tags: ['emi', 'loan', 'affordability', 'debt'],
    text: `The 50% EMI Rule: Total monthly EMIs (home loan + car + personal + credit card minimum payments) should not exceed 40-50% of your net take-home salary.
Formula: Max safe EMI = Net monthly income × 0.40

Example: Net salary ₹80,000/month → Max EMI outgo = ₹32,000
If already paying ₹15,000 home loan EMI → you can safely add ₹17,000 more in EMIs.

Additional checks before borrowing:
1. Emergency fund in place? If not, don't take non-essential loans.
2. Is the loan for appreciating or depreciating asset? Home loan = generally okay. Personal loan for vacation = avoid.
3. Total interest paid: A ₹5L personal loan at 18% for 3 years costs ₹1.5L in interest alone.
Use loan calculators to check total cost, not just EMI amount.`
  },
  {
    id: 'kb-009',
    title: 'Food Delivery (Zomato/Swiggy) Spending Trap',
    tags: ['food', 'spending', 'zomato', 'swiggy', 'budget'],
    text: `Research shows urban Indians spend 25-35% of their food budget on Zomato/Swiggy delivery alone.
Average order: ₹250-400 per meal with platform fees + surge pricing.
Hidden costs: Delivery charges (₹30-60), service fees (₹15-25), surge pricing (2x on weekends), platform fee increases.
Monthly mapping: 10 Zomato orders × ₹350 average = ₹3,500/month = ₹42,000/year.
vs cooking: Same meals cooked at home = ₹800-1,200/month for groceries.
Smart strategy:
1. Set a ₹1,500-2,000 monthly Zomato/Swiggy budget and track it
2. Batch-cook on weekends for weekday lunches
3. Use Zomato Pro/Swiggy One during heavy ordering months to save on delivery fees
4. Check "no delivery fee" restaurant filters first
The goal isn't to stop ordering — it's to make it a planned spend, not a habit-driven leak.`
  },
  {
    id: 'kb-010',
    title: 'How SIP Works — Rupee Cost Averaging & Compounding',
    tags: ['sip', 'mutual fund', 'investment', 'compounding'],
    text: `SIP (Systematic Investment Plan) invests a fixed amount monthly into a mutual fund.
NAV (Net Asset Value): Price of one unit of the fund.

Rupee Cost Averaging: When NAV is low, you buy more units. When high, fewer units. Over time, average cost per unit is lower than if you invested a lump sum at a peak.

Example: ₹5,000/month SIP for 10 years at 12% average return:
Total invested: ₹6,00,000
Final corpus: ~₹11.6 lakhs
Gain: ~₹5.6 lakhs (93% return on investment)

Compounding: Your returns also earn returns. Earlier you start, more powerful the effect.
₹5,000/month from age 25 vs age 35 (same 12%) → age 25 gets 3x the final corpus at 60.

Tax: For equity funds, gains up to ₹1 lakh/year are tax-free (LTCG after 1 year). For ELSS SIPs, additional tax deduction u/s 80C.`
  },
  {
    id: 'kb-011',
    title: 'Credit Card & BNPL Minimum Payment Trap',
    tags: ['credit card', 'bnpl', 'debt', 'interest'],
    text: `Minimum payment trap: Paying only the minimum due (usually 5% of outstanding) keeps your account active but interest charges are brutal.
Credit card interest: 2-4% per month = 24-48% per annum.
Example: ₹50,000 credit card outstanding at 3% monthly interest:
- Pay minimum (₹2,500) each month → takes 2+ years, you pay ₹35,000+ in interest.
- Pay full outstanding → ₹0 interest.

BNPL (Buy Now Pay Later — LazyPay, ZestMoney, Simpl, Paytm Later):
- Appears interest-free but late fees can be ₹200-500/incident
- Multiple BNPL accounts increase credit utilization
- BNPL defaults now reported to credit bureaus. One missed payment = CIBIL damage.

Rule: Never spend on credit card what you cannot repay in full at month end. Use credit card as a convenience tool, not a loan.`
  },
  {
    id: 'kb-012',
    title: 'How to Read a CIBIL Report',
    tags: ['cibil', 'credit report', 'score'],
    text: `A CIBIL report has these key sections:
1. Personal Information: Name, DOB, PAN, addresses. Check for errors — wrong info causes loan rejections.
2. Account Summary: Total accounts, active/closed, total balance, overdue amount.
3. Credit Accounts: Each loan/card with lender name, account type, limit, outstanding, ownership (individual/joint), date opened.
4. DPD (Days Past Due): Number of days payment was late. Any DPD other than 000 is a red flag.
   - 000: Paid on time
   - 030: 30 days late
   - SUB/DBT/LSS: Substandard/Doubtful/Loss (severe)
5. Enquiries: All loan/card applications. Too many enquiries in short period signals financial distress.
6. Suit Filed: Legal action by lender. Very damaging — stays 7 years even after settlement.

Free CIBIL check: Once/year free on CIBIL.com. Dispute errors at CreditBureauDisputes@transunion.com.`
  }
];
