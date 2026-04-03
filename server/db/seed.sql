-- Create a test user (password is handled by firebase, this is just DB representation)
-- Assuming Firebase UID is 'test-uid-123'
INSERT INTO users (id, firebase_uid, email, display_name, phone, preferred_language, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'test-uid-123', 'test@paysense.ai', 'Rahul Kumar', '+919876543210', 'en', 'pro')
ON CONFLICT (firebase_uid) DO NOTHING;

-- Insert 30 mock transactions for this user over the last 30 days
INSERT INTO transactions (id, user_id, amount, type, category, merchant_name, description, transaction_date)
VALUES
-- Food
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 250.00, 'debit', 'food', 'Zomato', 'Dinner order', NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 120.00, 'debit', 'food', 'Swiggy', 'Lunch', NOW() - INTERVAL '2 days'),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 450.00, 'debit', 'food', 'McDonalds', 'Dinner', NOW() - INTERVAL '5 days'),
('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 890.00, 'debit', 'food', 'Dominos', 'Pizza night', NOW() - INTERVAL '7 days'),
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 1500.00, 'debit', 'food', 'Barbeque Nation', 'Buffet', NOW() - INTERVAL '15 days'),

-- Transport
('00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0000-000000000001', 350.00, 'debit', 'transport', 'Uber', 'Office commute', NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0000-000000000001', 400.00, 'debit', 'transport', 'Ola Cabs', 'Travel', NOW() - INTERVAL '3 days'),
('00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0000-000000000001', 150.00, 'debit', 'transport', 'Delhi Metro', 'Recharge', NOW() - INTERVAL '6 days'),
('00000000-0000-0000-0001-000000000013', '00000000-0000-0000-0000-000000000001', 2000.00, 'debit', 'transport', 'Indian Oil', 'Petrol', NOW() - INTERVAL '10 days'),
('00000000-0000-0000-0001-000000000014', '00000000-0000-0000-0000-000000000001', 250.00, 'debit', 'transport', 'Uber', 'Meeting', NOW() - INTERVAL '12 days'),

-- Shopping
('00000000-0000-0000-0001-000000000020', '00000000-0000-0000-0000-000000000001', 2499.00, 'debit', 'shopping', 'Amazon', 'Headphones', NOW() - INTERVAL '2 days'),
('00000000-0000-0000-0001-000000000021', '00000000-0000-0000-0000-000000000001', 1299.00, 'debit', 'shopping', 'Flipkart', 'Shoes', NOW() - INTERVAL '8 days'),
('00000000-0000-0000-0001-000000000022', '00000000-0000-0000-0000-000000000001', 850.00, 'debit', 'shopping', 'Myntra', 'T-shirt', NOW() - INTERVAL '14 days'),
('00000000-0000-0000-0001-000000000023', '00000000-0000-0000-0000-000000000001', 4500.00, 'debit', 'shopping', 'H&M', 'Winter clothes', NOW() - INTERVAL '20 days'),
('00000000-0000-0000-0001-000000000024', '00000000-0000-0000-0000-000000000001', 320.00, 'debit', 'shopping', 'Blinkit', 'Groceries', NOW() - INTERVAL '1 day'),

-- Bills
('00000000-0000-0000-0001-000000000030', '00000000-0000-0000-0000-000000000001', 1200.00, 'debit', 'bills', 'BSES Rajdhani', 'Electricity Bill', NOW() - INTERVAL '5 days'),
('00000000-0000-0000-0001-000000000031', '00000000-0000-0000-0000-000000000001', 899.00, 'debit', 'bills', 'Airtel Broadband', 'WiFi Bill', NOW() - INTERVAL '10 days'),
('00000000-0000-0000-0001-000000000032', '00000000-0000-0000-0000-000000000001', 299.00, 'debit', 'bills', 'Jio', 'Mobile Recharge', NOW() - INTERVAL '15 days'),
('00000000-0000-0000-0001-000000000033', '00000000-0000-0000-0000-000000000001', 199.00, 'debit', 'bills', 'Netflix', 'Subscription', NOW() - INTERVAL '20 days'),
('00000000-0000-0000-0001-000000000034', '00000000-0000-0000-0000-000000000001', 99.00, 'debit', 'bills', 'Spotify', 'Music Premium', NOW() - INTERVAL '25 days'),

-- Entertainment
('00000000-0000-0000-0001-000000000040', '00000000-0000-0000-0000-000000000001', 800.00, 'debit', 'entertainment', 'BookMyShow', 'Movie Tickets', NOW() - INTERVAL '4 days'),
('00000000-0000-0000-0001-000000000041', '00000000-0000-0000-0000-000000000001', 1500.00, 'debit', 'entertainment', 'SMAAASH', 'Gaming', NOW() - INTERVAL '11 days'),
('00000000-0000-0000-0001-000000000042', '00000000-0000-0000-0000-000000000001', 2500.00, 'debit', 'entertainment', 'PVR Cinemas', 'Gold Class Tickets', NOW() - INTERVAL '18 days'),

-- Health
('00000000-0000-0000-0001-000000000050', '00000000-0000-0000-0000-000000000001', 550.00, 'debit', 'health', 'Apollo Pharmacy', 'Medicines', NOW() - INTERVAL '6 days'),
('00000000-0000-0000-0001-000000000051', '00000000-0000-0000-0000-000000000001', 1200.00, 'debit', 'health', 'Dr Lal PathLabs', 'Blood Test', NOW() - INTERVAL '22 days'),

-- Investment
('00000000-0000-0000-0001-000000000060', '00000000-0000-0000-0000-000000000001', 5000.00, 'debit', 'investment', 'Zerodha', 'Nifty50 SIP', NOW() - INTERVAL '10 days'),
('00000000-0000-0000-0001-000000000061', '00000000-0000-0000-0000-000000000001', 2000.00, 'debit', 'investment', 'Groww', 'Mutual Funds', NOW() - INTERVAL '15 days'),

-- Income (Credits)
('00000000-0000-0000-0001-000000000070', '00000000-0000-0000-0000-000000000001', 65000.00, 'credit', 'other', 'Tech Corp India', 'Salary March', NOW() - INTERVAL '5 days'),
('00000000-0000-0000-0001-000000000071', '00000000-0000-0000-0000-000000000001', 5000.00, 'credit', 'other', 'Amit Kumar', 'Splitwise settlement', NOW() - INTERVAL '2 days'),
('00000000-0000-0000-0001-000000000072', '00000000-0000-0000-0000-000000000001', 250.00, 'credit', 'other', 'Paytm Cashback', 'Cashback', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Seed Budgets
INSERT INTO budgets (id, user_id, category, monthly_limit, month_year)
VALUES 
('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'food', 5000.00, to_char(NOW(), 'YYYY-MM')),
('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'shopping', 10000.00, to_char(NOW(), 'YYYY-MM')),
('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 'transport', 3000.00, to_char(NOW(), 'YYYY-MM'))
ON CONFLICT DO NOTHING;

-- Seed Credit Score
INSERT INTO credit_scores (id, user_id, score, bureau, factors)
VALUES 
('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', 742, 'CIBIL', 
  '[
    {"factor": "Payment History", "impact": "High", "description": "100% on-time payments", "tip": "Great job! Keeping this at 100% is the most crucial factor."},
    {"factor": "Credit Utilization", "impact": "High", "description": "45% utilization", "tip": "Your utilization is a bit high. Try to keep it below 30% to improve score."},
    {"factor": "Credit Age", "impact": "Medium", "description": "3.5 years average age", "tip": "Don''t close your oldest cards."}
  ]'::jsonb)
ON CONFLICT DO NOTHING;
