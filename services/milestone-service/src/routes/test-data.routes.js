import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// DEVELOPMENT ONLY - Insert test data for current user
router.post('/insert-test-data/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Insert test applications
    const applications = [
      [1, 1, userId, 'Test User', 'test@matchy.tn', 'https://example.com/cv.pdf', 'I am very interested in this project', 3, 1500, 'pending'],
      [2, 1, userId, 'Test User', 'test@matchy.tn', 'https://example.com/cv.pdf', 'I have experience with this technology', 3, 2000, 'interview_scheduled'],
      [3, 2, userId, 'Test User', 'test@matchy.tn', 'https://example.com/cv.pdf', 'Looking forward to working on this', 3, 1800, 'accepted'],
      [4, 2, userId, 'Test User', 'test@matchy.tn', 'https://example.com/cv.pdf', 'This matches my skills perfectly', 3, 1200, 'rejected'],
      [5, 3, userId, 'Test User', 'test@matchy.tn', 'https://example.com/cv.pdf', 'I would love to contribute', 4, 2500, 'pending']
    ];

    for (const app of applications) {
      await pool.query(
        `INSERT INTO applications (milestone_id, project_id, freelancer_id, freelancer_name, 
         freelancer_email, cv_url, motivation_letter, years_of_experience, proposed_budget, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        app
      );
    }

    // Get the interview_scheduled application ID
    const [interviewApp] = await pool.query(
      'SELECT id FROM applications WHERE freelancer_id = ? AND status = ? ORDER BY id DESC LIMIT 1',
      [userId, 'interview_scheduled']
    );

    if (interviewApp.length > 0) {
      // Insert interview
      await pool.query(
        `INSERT INTO interviews (application_id, meet_link, interview_date, interview_time, notes, confirmed_by_freelancer)
         VALUES (?, ?, DATE_ADD(CURDATE(), INTERVAL 3 DAY), ?, ?, ?)`,
        [interviewApp[0].id, 'https://meet.google.com/xyz-abcd-efg', '14:00', 'Please prepare a portfolio presentation', 0]
      );
    }

    res.json({ success: true, message: `Test data inserted for user ${userId}` });
  } catch (error) {
    console.error('Error inserting test data:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
