-- Schéma V2 — abonnements, paiements, PDF, promos, notifications (PostgreSQL)
-- Adapter les types UUID / gen_random_uuid selon votre moteur SQL.

CREATE TABLE IF NOT EXISTS saved_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id UUID REFERENCES users (id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  label VARCHAR(100),
  is_default BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  price_tnd DECIMAL(10, 2) NOT NULL,
  price_usd DECIMAL(10, 2),
  price_eur DECIMAL(10, 2),
  duration_months INTEGER NOT NULL,
  max_projects INTEGER,
  max_proposals INTEGER,
  features JSONB,
  badge_label VARCHAR(50),
  color VARCHAR(7),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  trial_days INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id UUID REFERENCES users (id),
  plan_id UUID REFERENCES subscription_plans (id),
  status VARCHAR(20) DEFAULT 'pending',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(10) NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  applicable_plans JSONB,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  min_amount DECIMAL(10, 2),
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  subscription_id UUID REFERENCES subscriptions (id),
  user_id UUID REFERENCES users (id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TND',
  amount_tnd DECIMAL(10, 2),
  payment_method VARCHAR(30),
  payment_method_details JSONB,
  transaction_ref VARCHAR(50) UNIQUE,
  promo_code_id UUID REFERENCES promo_codes (id),
  discount_amount DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users (id),
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  receipt_url TEXT,
  invoice_pdf_url TEXT,
  admin_notes TEXT,
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS generated_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id UUID REFERENCES users (id),
  payment_id UUID REFERENCES payments (id),
  subscription_id UUID REFERENCES subscriptions (id),
  type VARCHAR(50),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  generated_at TIMESTAMP DEFAULT NOW(),
  downloaded_at TIMESTAMP,
  download_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id UUID REFERENCES users (id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200),
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  created_by UUID REFERENCES users (id),
  type VARCHAR(50),
  date_from DATE,
  date_to DATE,
  file_url TEXT,
  file_format VARCHAR(10),
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions (end_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read);
