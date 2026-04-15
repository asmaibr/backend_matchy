-- Insert sample users for testing
-- Note: In production, passwords should be properly hashed

-- Admin user
INSERT INTO users (first_name, last_name, email, password, role, created_at, updated_at)
VALUES ('Admin', 'User', 'admin@matchy.tn', 'password123', 'ADMIN', NOW(), NOW());

-- Regular users
INSERT INTO users (first_name, last_name, email, password, role, created_at, updated_at)
VALUES 
('John', 'Doe', 'john.doe@example.com', 'password123', 'USER', NOW(), NOW()),
('Jane', 'Smith', 'jane.smith@example.com', 'password123', 'USER', NOW(), NOW()),
('Ahmed', 'Ben Ali', 'ahmed.benali@example.com', 'password123', 'USER', NOW(), NOW()),
('Sarah', 'Johnson', 'sarah.johnson@example.com', 'password123', 'USER', NOW(), NOW()),
('Mohamed', 'Trabelsi', 'mohamed.trabelsi@example.com', 'password123', 'USER', NOW(), NOW());

-- Sample registrations (assuming events with IDs 1-3 exist)
-- These will be created with PENDING status
INSERT INTO registrations (first_name, last_name, email, user_id, evenement_id, status, created_at, updated_at)
VALUES 
('John', 'Doe', 'john.doe@example.com', 2, 1, 'PENDING', NOW(), NOW()),
('Jane', 'Smith', 'jane.smith@example.com', 3, 1, 'APPROVED', NOW(), NOW()),
('Ahmed', 'Ben Ali', 'ahmed.benali@example.com', 4, 2, 'PENDING', NOW(), NOW()),
('Sarah', 'Johnson', 'sarah.johnson@example.com', 5, 2, 'APPROVED', NOW(), NOW()),
('Mohamed', 'Trabelsi', 'mohamed.trabelsi@example.com', 6, 3, 'REJECTED', NOW(), NOW());
