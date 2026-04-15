-- Extensions / dialecte : adapter si PostgreSQL vs MySQL
-- Table payments (colonnes supplémentaires)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'TND',
  ADD COLUMN IF NOT EXISTS amount_original DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users (id),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id UUID REFERENCES users (id),
  email_type VARCHAR(50),
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20),
  error_message TEXT
);
