-- Migration: Ajout des champs RIB/IBAN pour les virements bancaires
-- Matchy - #1 Tunisian Freelance Platform
-- Date: 15 Avril 2026

-- 1. Ajouter les colonnes pour les virements bancaires
ALTER TABLE payment 
ADD COLUMN IF NOT EXISTS rib VARCHAR(20) COMMENT 'RIB/IBAN tunisien (20 chiffres max)',
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255) COMMENT 'Nom de la banque',
ADD COLUMN IF NOT EXISTS account_holder VARCHAR(255) COMMENT 'Titulaire du compte';

-- 2. Créer un index sur le RIB pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_payment_rib ON payment(rib);

-- 3. Nettoyer les RIB existants (supprimer les espaces)
UPDATE payment 
SET rib = REPLACE(REPLACE(REPLACE(rib, ' ', ''), '-', ''), '.', '')
WHERE rib IS NOT NULL;

-- 4. Vérifier les données
SELECT 
    'Total payments' as metric,
    COUNT(*) as count
FROM payment

UNION ALL

SELECT 
    'Payments with RIB' as metric,
    COUNT(*) as count
FROM payment 
WHERE rib IS NOT NULL

UNION ALL

SELECT 
    'Bank transfer payments' as metric,
    COUNT(*) as count
FROM payment 
WHERE method = 'BANK_TRANSFER';

-- 5. Identifier les RIB invalides (si existants)
SELECT 
    id,
    rib,
    LENGTH(rib) as rib_length,
    CASE 
        WHEN LENGTH(rib) != 20 THEN 'Invalid length'
        WHEN rib NOT REGEXP '^[0-9]+$' THEN 'Contains non-digits'
        ELSE 'Valid'
    END as validation_status
FROM payment 
WHERE rib IS NOT NULL
  AND (LENGTH(rib) != 20 OR rib NOT REGEXP '^[0-9]+$');

-- 6. Exemples de données de test (optionnel)
-- Décommenter pour insérer des données de test

/*
-- Créer un plan de test
INSERT INTO plan (name, price, currency, billing_cycle, description, duration_in_days, max_projects, max_bids, active)
VALUES ('PRO', 29.0, 'TND', 'monthly', 'Plan professionnel', 30, 10, 50, true)
ON DUPLICATE KEY UPDATE name = name;

-- Créer un utilisateur de test
INSERT INTO user (email, password, first_name, last_name, user)
VALUES ('test.bank@matchy.tn', 'password123', 'Test', 'Bank', 'CLIENT')
ON DUPLICATE KEY UPDATE email = email;

-- Créer une subscription de test
INSERT INTO subscription (user_id, plan_id, price_at_purchase, start_date, end_date, status)
SELECT 
    (SELECT id FROM user WHERE email = 'test.bank@matchy.tn'),
    (SELECT id FROM plan WHERE name = 'PRO' LIMIT 1),
    29.0,
    CURRENT_TIMESTAMP,
    DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY),
    'PENDING'
WHERE NOT EXISTS (
    SELECT 1 FROM subscription 
    WHERE user_id = (SELECT id FROM user WHERE email = 'test.bank@matchy.tn')
);

-- Créer un payment de test avec RIB
INSERT INTO payment (
    user_id, 
    subscription_id, 
    amount, 
    currency, 
    method, 
    status, 
    transaction_date, 
    submitted_at,
    transaction_ref,
    rib,
    bank_name,
    account_holder
)
SELECT 
    (SELECT id FROM user WHERE email = 'test.bank@matchy.tn'),
    (SELECT id FROM subscription WHERE user_id = (SELECT id FROM user WHERE email = 'test.bank@matchy.tn') LIMIT 1),
    29.0,
    'TND',
    'BANK_TRANSFER',
    'PENDING',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CONCAT('TXN-BANK-', YEAR(CURRENT_TIMESTAMP), '-', LPAD(FLOOR(RAND() * 10000), 5, '0')),
    '12345678901234567890',
    'Banque de Tunisie',
    'Test Bank User'
WHERE NOT EXISTS (
    SELECT 1 FROM payment 
    WHERE user_id = (SELECT id FROM user WHERE email = 'test.bank@matchy.tn')
    AND method = 'BANK_TRANSFER'
);
*/

-- 7. Vérification finale
SELECT 
    p.id,
    u.email,
    p.amount,
    p.currency,
    p.method,
    p.status,
    p.rib,
    p.bank_name,
    p.account_holder,
    LENGTH(p.rib) as rib_length
FROM payment p
LEFT JOIN user u ON p.user_id = u.id
WHERE p.method = 'BANK_TRANSFER'
ORDER BY p.id DESC
LIMIT 10;

-- 8. Statistiques par méthode de paiement
SELECT 
    method,
    COUNT(*) as total_payments,
    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
    SUM(amount) as total_amount
FROM payment
GROUP BY method
ORDER BY total_payments DESC;

-- Migration terminée avec succès ✅
