-- Test data for my-applications page
-- Make sure you have a user logged in first

-- Insert test applications (adjust freelancer_id to match your logged-in user)
INSERT INTO applications (milestone_id, project_id, freelancer_id, freelancer_name, freelancer_email, cv_url, motivation_letter, years_of_experience, proposed_budget, status, applied_at)
VALUES 
(1, 1, 1, 'John Freelancer', 'john@example.com', 'https://example.com/cv.pdf', 'I am very interested in this project', 3, 1500, 'pending', NOW()),
(2, 1, 1, 'John Freelancer', 'john@example.com', 'https://example.com/cv.pdf', 'I have experience with this technology', 3, 2000, 'interview_scheduled', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 2, 1, 'John Freelancer', 'john@example.com', 'https://example.com/cv.pdf', 'Looking forward to working on this', 3, 1800, 'accepted', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 2, 1, 'John Freelancer', 'john@example.com', 'https://example.com/cv.pdf', 'This matches my skills perfectly', 3, 1200, 'rejected', DATE_SUB(NOW(), INTERVAL 7 DAY));

-- Insert interview for the interview_scheduled application
INSERT INTO interviews (application_id, meet_link, interview_date, interview_time, notes, confirmed_by_freelancer)
VALUES 
(2, 'https://meet.google.com/abc-defg-hij', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00', 'Please prepare a portfolio presentation', 0);
