-- Test notifications for user 8 (company)
USE matchy_db;

-- Insert test notifications (without application_id to avoid FK constraint violations)
INSERT INTO notifications (user_id, user_type, type, title, message, link, application_id, is_read, created_at)
VALUES 
(8, 'company', 'application_received', 'New Application Received', 'John Freelancer applied to "Backend Development" in project "E-commerce Platform Development"', '/backoffice/company-projects/1/review', NULL, 0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(8, 'company', 'application_received', 'New Application Received', 'Jane Developer applied to "Frontend Development" in project "E-commerce Platform Development"', '/backoffice/company-projects/1/review', NULL, 0, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(8, 'company', 'application_received', 'New Application Received', 'Mike Designer applied to "UI/UX Design" in project "Mobile App UI/UX Design"', '/backoffice/company-projects/2/review', NULL, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 'company', 'application_accepted', 'Application Accepted', 'Freelancer successfully accepted and started work on "Backend Development"', '/backoffice/projects/1', NULL, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(8, 'company', 'interview_scheduled', 'Interview Scheduled', 'Interview scheduled for "Frontend Development" position on 2025-04-20 at 14:00', '/backoffice/interviews', NULL, 1, DATE_SUB(NOW(), INTERVAL 3 DAY));
