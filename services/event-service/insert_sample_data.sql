-- Insert sample events into matchy_db.evenements table
USE matchy_db;

-- Sample Event 1: Certification Program
INSERT INTO evenements (title, description, date, location, type, max_participants, current_participants, status, created_at, updated_at)
VALUES (
    'Spring Boot Certification Program',
    'Complete certification program covering Spring Boot fundamentals, REST APIs, JPA, and microservices architecture. Perfect for backend developers looking to validate their skills.',
    '2026-04-15 09:00:00',
    'Online - Zoom',
    'CERTIFICATION',
    100,
    45,
    'ACTIVE',
    NOW(),
    NOW()
);

-- Sample Event 2: Freelance Opportunity
INSERT INTO evenements (title, description, date, location, type, max_participants, current_participants, status, created_at, updated_at)
VALUES (
    'E-commerce Platform Development',
    'Looking for experienced full-stack developers to build a modern e-commerce platform. Tech stack: Angular, Spring Boot, MySQL. Duration: 3 months. Competitive rates.',
    '2026-03-20 14:00:00',
    'Remote',
    'FREELANCE_OPPORTUNITY',
    5,
    2,
    'ACTIVE',
    NOW(),
    NOW()
);

-- Sample Event 3: Workshop
INSERT INTO evenements (title, description, date, location, type, max_participants, current_participants, status, created_at, updated_at)
VALUES (
    'Angular Advanced Techniques Workshop',
    'Hands-on workshop covering advanced Angular concepts: RxJS operators, state management with NgRx, performance optimization, and testing strategies.',
    '2026-03-25 10:00:00',
    'Tech Hub Paris - Room 301',
    'WORKSHOP',
    30,
    18,
    'ACTIVE',
    NOW(),
    NOW()
);

-- Sample Event 4: Networking Event
INSERT INTO evenements (title, description, date, location, type, max_participants, current_participants, status, created_at, updated_at)
VALUES (
    'Freelance Developers Meetup',
    'Monthly networking event for freelance developers. Share experiences, find collaborators, and discover new opportunities. Refreshments provided.',
    '2026-03-10 18:00:00',
    'Café des Développeurs, Lyon',
    'NETWORKING',
    50,
    32,
    'ACTIVE',
    NOW(),
    NOW()
);

-- Sample Event 5: Training
INSERT INTO evenements (title, description, date, location, type, max_participants, current_participants, status, created_at, updated_at)
VALUES (
    'Docker & Kubernetes Training',
    'Comprehensive 2-day training on containerization with Docker and orchestration with Kubernetes. Includes practical exercises and real-world scenarios.',
    '2026-04-05 09:00:00',
    'Online - Microsoft Teams',
    'TRAINING',
    40,
    28,
    'ACTIVE',
    NOW(),
    NOW()
);

-- Sample Event 6: Recommendation
INSERT INTO evenements (title, description, date, location, type, max_participants, current_participants, status, created_at, updated_at)
VALUES (
    'Top Freelance Platforms Review 2026',
    'Expert recommendations on the best freelance platforms for developers. Compare rates, project quality, and payment terms across major platforms.',
    '2026-03-18 15:00:00',
    'Online - Webinar',
    'RECOMMENDATION',
    200,
    87,
    'ACTIVE',
    NOW(),
    NOW()
);

-- Sample Event 7: Workshop (Full)
INSERT INTO evenements (title, description, date, location, type, max_participants, current_participants, status, created_at, updated_at)
VALUES (
    'Microservices Architecture Masterclass',
    'Deep dive into microservices design patterns, API gateway, service discovery, and distributed tracing. Limited seats available.',
    '2026-03-28 13:00:00',
    'Tech Campus Marseille',
    'WORKSHOP',
    20,
    20,
    'ACTIVE',
    NOW(),
    NOW()
);

-- Sample Event 8: Freelance Opportunity
INSERT INTO evenements (title, description, date, location, type, max_participants, current_participants, status, created_at, updated_at)
VALUES (
    'Mobile App Development - Healthcare',
    'Seeking React Native developers for healthcare mobile application. Must have experience with HIPAA compliance and secure data handling.',
    '2026-03-22 11:00:00',
    'Hybrid - Paris Office',
    'FREELANCE_OPPORTUNITY',
    3,
    1,
    'ACTIVE',
    NOW(),
    NOW()
);

-- Sample Event 9: Certification
INSERT INTO evenements (title, description, date, location, type, max_participants, current_participants, status, created_at, updated_at)
VALUES (
    'AWS Solutions Architect Certification Prep',
    'Intensive preparation course for AWS Solutions Architect Associate certification. Includes practice exams and hands-on labs.',
    '2026-04-20 08:00:00',
    'Online - AWS Training Portal',
    'CERTIFICATION',
    80,
    52,
    'ACTIVE',
    NOW(),
    NOW()
);

-- Sample Event 10: Training
INSERT INTO evenements (title, description, date, location, type, max_participants, current_participants, status, created_at, updated_at)
VALUES (
    'Agile & Scrum for Freelancers',
    'Learn how to apply Agile methodologies and Scrum framework in freelance projects. Improve project delivery and client satisfaction.',
    '2026-03-30 14:00:00',
    'Online - Google Meet',
    'TRAINING',
    60,
    35,
    'ACTIVE',
    NOW(),
    NOW()
);
