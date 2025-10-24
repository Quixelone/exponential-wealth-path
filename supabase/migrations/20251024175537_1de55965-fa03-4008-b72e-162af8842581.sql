-- Add is_insured column to investment_configs
ALTER TABLE investment_configs 
ADD COLUMN is_insured boolean DEFAULT false;

-- Only one strategy can be insured per user
CREATE UNIQUE INDEX unique_insured_strategy_per_user 
ON investment_configs(user_id) 
WHERE is_insured = true;

-- Add Stripe fields to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN stripe_customer_id text,
ADD COLUMN stripe_subscription_id text;

-- Add payment provider to insurance_payments
ALTER TABLE insurance_payments 
ADD COLUMN payment_provider text CHECK (payment_provider IN ('stripe', 'paypal', 'manual'));