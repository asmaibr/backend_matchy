-- Script SQL pour corriger l'affichage du plan dans les payments
-- Matchy - #1 Tunisian Freelance Platform

-- 1. Vérifier l'état actuel des données
SELECT 
    p.id as payment_id,
    p.amount,
    p.status as payment_status,
    s.id as subscription_id,
    s.status as subscription_status,
    pl.id as plan_id,
    pl.name as plan_name,
    pl.price as plan_price
FROM payment p
LEFT JOIN subscription s ON p.subscription_id = s.id
LEFT JOIN plan pl ON s.plan_id = pl.id
ORDER BY p.id;

-- 2. Identifier les payments sans plan
SELECT 
    p.id as payment_id,
    p.amount,
    'NO SUBSCRIPTION' as issue
FROM payment p
WHERE p.subscription_id IS NULL

UNION

SELECT 
    p.id as payment_id,
    p.amount,
    'NO PLAN IN SUBSCRIPTION' as issue
FROM payment p
INNER JOIN subscription s ON p.subscription_id = s.id
WHERE s.plan_id IS NULL;

-- 3. Créer des plans par défaut si nécessaire
INSERT INTO plan (name, price, currency, billing_cycle, description, duration_in_days, max_projects, max_bids, active)
SELECT 'FREE', 0.0, 'TND', 'monthly', 'Plan gratuit', 30, 3, 10, true
WHERE NOT EXISTS (SELECT 1 FROM plan WHERE name = 'FREE');

INSERT INTO plan (name, price, currency, billing_cycle, description, duration_in_days, max_projects, max_bids, active)
SELECT 'PRO', 29.0, 'TND', 'monthly', 'Plan professionnel', 30, 10, 50, true
WHERE NOT EXISTS (SELECT 1 FROM plan WHERE name = 'PRO');

INSERT INTO plan (name, price, currency, billing_cycle, description, duration_in_days, max_projects, max_bids, active)
SELECT 'PREMIUM', 69.0, 'TND', 'monthly', 'Plan premium', 30, 50, 200, true
WHERE NOT EXISTS (SELECT 1 FROM plan WHERE name = 'PREMIUM');

-- 4. Associer automatiquement les plans aux subscriptions basé sur le prix
-- Pour les subscriptions sans plan, on devine le plan basé sur priceAtPurchase

-- Plan FREE (0 TND)
UPDATE subscription s
SET plan_id = (SELECT id FROM plan WHERE name = 'FREE' LIMIT 1)
WHERE s.plan_id IS NULL 
  AND s.price_at_purchase = 0;

-- Plan PRO (29 TND)
UPDATE subscription s
SET plan_id = (SELECT id FROM plan WHERE name = 'PRO' LIMIT 1)
WHERE s.plan_id IS NULL 
  AND s.price_at_purchase BETWEEN 20 AND 40;

-- Plan PREMIUM (69 TND)
UPDATE subscription s
SET plan_id = (SELECT id FROM plan WHERE name = 'PREMIUM' LIMIT 1)
WHERE s.plan_id IS NULL 
  AND s.price_at_purchase BETWEEN 50 AND 100;

-- Plan par défaut PRO pour les autres cas
UPDATE subscription s
SET plan_id = (SELECT id FROM plan WHERE name = 'PRO' LIMIT 1)
WHERE s.plan_id IS NULL;

-- 5. Créer des subscriptions pour les payments qui n'en ont pas
-- Note: Nécessite de connaître l'user_id et le plan approprié

-- Exemple pour créer une subscription pour un payment orphelin
-- Remplacer {payment_id}, {user_id}, {plan_id} par les vraies valeurs
/*
INSERT INTO subscription (user_id, plan_id, price_at_purchase, start_date, end_date, status)
SELECT 
    p.user_id,
    (SELECT id FROM plan WHERE name = 'PRO' LIMIT 1),
    p.amount,
    CURRENT_TIMESTAMP,
    DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY),
    'PENDING'
FROM payment p
WHERE p.id = {payment_id} AND p.subscription_id IS NULL;

-- Puis lier le payment à la subscription créée
UPDATE payment p
SET subscription_id = LAST_INSERT_ID()
WHERE p.id = {payment_id};
*/

-- 6. Vérifier le résultat final
SELECT 
    p.id as payment_id,
    u.first_name,
    u.last_name,
    pl.name as plan_name,
    p.amount,
    p.currency,
    p.status as payment_status,
    s.status as subscription_status
FROM payment p
LEFT JOIN user u ON p.user_id = u.id
LEFT JOIN subscription s ON p.subscription_id = s.id
LEFT JOIN plan pl ON s.plan_id = pl.id
ORDER BY p.id;

-- 7. Statistiques finales
SELECT 
    'Total Payments' as metric,
    COUNT(*) as count
FROM payment

UNION ALL

SELECT 
    'Payments with Subscription' as metric,
    COUNT(*) as count
FROM payment
WHERE subscription_id IS NOT NULL

UNION ALL

SELECT 
    'Payments with Plan' as metric,
    COUNT(*) as count
FROM payment p
INNER JOIN subscription s ON p.subscription_id = s.id
WHERE s.plan_id IS NOT NULL

UNION ALL

SELECT 
    'Payments WITHOUT Plan' as metric,
    COUNT(*) as count
FROM payment p
LEFT JOIN subscription s ON p.subscription_id = s.id
WHERE p.subscription_id IS NULL OR s.plan_id IS NULL;
