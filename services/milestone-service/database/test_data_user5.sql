-- Test data for user ID 5
-- Insert test applications for the logged-in user (ID: 5)

INSERT INTO applications (milestone_id, project_id, freelancer_id, freelancer_name, freelancer_email, cv_url, motivation_letter, years_of_experience, proposed_budget, status, applied_at)
VALUES 
(1, 1, 5, 'Current User', 'user@matchy.tn', 'https://example.com/cv.pdf', 'I am very interested in this project and have the required skills', 3, 1500, 'pending', NOW()),
(2, 1, 5, 'Current User', 'user@matchy.tn', 'https://example.com/cv.pdf', 'I have 3 years of experience with this technology stack', 3, 2000, 'interview_scheduled', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 2, 5, 'Current User', 'user@matchy.tn', 'https://example.com/cv.pdf', 'Looking forward to working on this exciting project', 3, 1800, 'accepted', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 2, 5, 'Current User', 'user@matchy.tn', 'https://example.com/cv.pdf', 'This matches my skills perfectly', 3, 1200, 'rejected', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(5, 3, 5, 'Current User', 'user@matchy.tn', 'https://example.com/cv.pdf', 'I would love to contribute to this milestone', 4, 2500, 'pending', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Insert interview for the interview_scheduled application
-- First, get the ID of the interview_scheduled application we just created
-- You'll need to run this after the above INSERT completes
INSERT INTO interviews (application_id, meet_link, interview_date, interview_time, notes, confirmed_by_freelancer)
SELECT id, 'https://meet.google.com/xyz-abcd-efg', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00', 'Please prepare a portfolio presentation', 0
FROM applications 
WHERE freelancer_id = 5 AND status = 'interview_scheduled' 
LIMIT 1;
