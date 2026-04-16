import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { sendPaymentApprovalEmail, sendPaymentRejectedEmail } from './email.service.js';
import eurekaClient from './eureka-client.js';
import routes from './src/routes/index.js';

const app = express();
const PORT = process.env.PORT || 9090;

// Enable CORS for frontend
app.use(cors({ 
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase body size limit for file uploads (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Use API routes from src/routes
app.use('/api', routes);

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'matchy_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Connected Successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
    console.log('⚠️  Please make sure MySQL is running and database "matchy_db" exists');
    console.log('   Run: mysql -u root -p < database/matchy_schema.sql');
  });

// ============================================
// AUTHENTICATION API
// ============================================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, location, skills, bio } = req.body;
    
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Insert new user (password should be hashed in production)
    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role, location, skills, bio, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW())`,
      [firstName, lastName, email, password, role || 'FREELANCER', location || '', skills || '', bio || '']
    );

    // Generate a simple token (in production, use JWT)
    const token = Buffer.from(`${result.insertId}:${email}:${Date.now()}`).toString('base64');
    
    // Get the created user
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = users[0];

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        location: user.location,
        skills: user.skills,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    
    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${email}:${Date.now()}`).toString('base64');

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        location: user.location,
        skills: user.skills,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // In production, send email with reset token
    // For now, just return success
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // In production, verify token and update password
    // For now, just return success
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ============================================
// PROJECTS API
// ============================================

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const [projects] = await pool.query(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM applications WHERE project_id = p.id) as applications_count
      FROM projects p
      ORDER BY p.created_at DESC
    `);
    
    // Parse JSON fields
    projects.forEach(p => {
      p.skills = p.skills ? JSON.parse(p.skills) : [];
      p.applicationsCount = p.applications_count || 0;
    });
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projects[0];
    project.skills = project.skills ? JSON.parse(project.skills) : [];
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create project
app.post('/api/projects', async (req, res) => {
  try {
    const { company_name, project_title, description, details_of_work, number_of_people_demanded, 
            budget, currency, category, status, skills, location, deadline } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO projects (company_name, project_title, description, details_of_work, 
       number_of_people_demanded, budget, currency, category, status, skills, location, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, project_title, description, details_of_work, number_of_people_demanded,
       budget, currency, category, status || 'open', JSON.stringify(skills || []), location, deadline]
    );
    
    res.json({ id: result.insertId, message: 'Project created successfully' });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const updates = [];
    const values = [];
    
    Object.keys(req.body).forEach(key => {
      if (key === 'skills') {
        updates.push(`${key} = ?`);
        values.push(JSON.stringify(req.body[key]));
      } else {
        updates.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    });
    
    values.push(req.params.id);
    
    await pool.query(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Increment project click count
app.post('/api/projects/:id/increment-clicks', async (req, res) => {
  try {
    await pool.query('UPDATE projects SET click_count = click_count + 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Click count incremented' });
  } catch (error) {
    console.error('Error incrementing clicks:', error);
    res.status(500).json({ error: 'Failed to increment clicks' });
  }
});

// ============================================
// MILESTONES API
// ============================================

// Get milestones by project ID
app.get('/api/projects/:projectId/milestones', async (req, res) => {
  try {
    const [milestones] = await pool.query(`
      SELECT m.*,
        (SELECT COUNT(*) FROM applications WHERE milestone_id = m.id) as applications_count
      FROM milestones m
      WHERE m.project_id = ?
      ORDER BY m.created_at DESC
    `, [req.params.projectId]);
    
    milestones.forEach(m => {
      m.skills = m.skills ? JSON.parse(m.skills) : [];
      m.applicationsCount = m.applications_count || 0;
    });
    
    res.json(milestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

// Get all milestones
app.get('/api/milestones', async (req, res) => {
  try {
    const [milestones] = await pool.query(`
      SELECT m.*,
        (SELECT COUNT(*) FROM applications WHERE milestone_id = m.id) as applications_count
      FROM milestones m
      ORDER BY m.created_at DESC
    `);
    
    milestones.forEach(m => {
      m.skills = m.skills ? JSON.parse(m.skills) : [];
      m.applicationsCount = m.applications_count || 0;
    });
    
    res.json(milestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

// Create milestone
app.post('/api/milestones', async (req, res) => {
  try {
    const { project_id, title, description, skills, budget, currency, duration, status } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO milestones (project_id, title, description, skills, budget, currency, duration, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [project_id, title, description, JSON.stringify(skills || []), budget, currency, duration, status || 'open']
    );
    
    res.json({ id: result.insertId, message: 'Milestone created successfully' });
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
});

// Update milestone
app.put('/api/milestones/:id', async (req, res) => {
  try {
    const updates = [];
    const values = [];
    
    Object.keys(req.body).forEach(key => {
      if (key === 'skills') {
        updates.push(`${key} = ?`);
        values.push(JSON.stringify(req.body[key]));
      } else {
        updates.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    });
    
    values.push(req.params.id);
    
    await pool.query(
      `UPDATE milestones SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: 'Milestone updated successfully' });
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// Delete milestone
app.delete('/api/milestones/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM milestones WHERE id = ?', [req.params.id]);
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
});

// ============================================
// APPLICATIONS API
// ============================================

// Get applications by milestone ID
app.get('/api/milestones/:milestoneId/applications', async (req, res) => {
  try {
    const [applications] = await pool.query(`
      SELECT a.*, i.meet_link, i.interview_date, i.interview_time, i.notes, 
             i.confirmed_by_freelancer, i.scheduled_at as interview_scheduled_at
      FROM applications a
      LEFT JOIN interviews i ON a.id = i.application_id
      WHERE a.milestone_id = ?
      ORDER BY a.applied_at DESC
    `, [req.params.milestoneId]);
    
    // Format interview data
    applications.forEach(app => {
      if (app.meet_link) {
        app.interview = {
          meetLink: app.meet_link,
          date: app.interview_date,
          time: app.interview_time,
          notes: app.notes,
          confirmedByFreelancer: app.confirmed_by_freelancer === 1,
          scheduledAt: app.interview_scheduled_at
        };
      }
      // Remove interview fields from root
      delete app.meet_link;
      delete app.interview_date;
      delete app.interview_time;
      delete app.confirmed_by_freelancer;
      delete app.interview_scheduled_at;
    });
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get applications by project ID
app.get('/api/projects/:projectId/applications', async (req, res) => {
  try {
    const [applications] = await pool.query(`
      SELECT a.*, i.meet_link, i.interview_date, i.interview_time, i.notes, 
             i.confirmed_by_freelancer, i.scheduled_at as interview_scheduled_at
      FROM applications a
      LEFT JOIN interviews i ON a.id = i.application_id
      WHERE a.project_id = ?
      ORDER BY a.applied_at DESC
    `, [req.params.projectId]);
    
    applications.forEach(app => {
      if (app.meet_link) {
        app.interview = {
          meetLink: app.meet_link,
          date: app.interview_date,
          time: app.interview_time,
          notes: app.notes,
          confirmedByFreelancer: app.confirmed_by_freelancer === 1,
          scheduledAt: app.interview_scheduled_at
        };
      }
      delete app.meet_link;
      delete app.interview_date;
      delete app.interview_time;
      delete app.confirmed_by_freelancer;
      delete app.interview_scheduled_at;
    });
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get applications by freelancer ID
app.get('/api/freelancers/:freelancerId/applications', async (req, res) => {
  try {
    const [applications] = await pool.query(`
      SELECT a.*, i.meet_link, i.interview_date, i.interview_time, i.notes, 
             i.confirmed_by_freelancer, i.scheduled_at as interview_scheduled_at
      FROM applications a
      LEFT JOIN interviews i ON a.id = i.application_id
      WHERE a.freelancer_id = ?
      ORDER BY a.applied_at DESC
    `, [req.params.freelancerId]);
    
    applications.forEach(app => {
      if (app.meet_link) {
        app.interview = {
          meetLink: app.meet_link,
          date: app.interview_date,
          time: app.interview_time,
          notes: app.notes,
          confirmedByFreelancer: app.confirmed_by_freelancer === 1,
          scheduledAt: app.interview_scheduled_at
        };
      }
      delete app.meet_link;
      delete app.interview_date;
      delete app.interview_time;
      delete app.confirmed_by_freelancer;
      delete app.interview_scheduled_at;
    });
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Submit application
app.post('/api/applications', async (req, res) => {
  try {
    const { milestone_id, project_id, freelancer_id, freelancer_name, freelancer_email,
            cv_url, motivation_letter, years_of_experience, proposed_budget } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO applications (milestone_id, project_id, freelancer_id, freelancer_name, 
       freelancer_email, cv_url, motivation_letter, years_of_experience, proposed_budget, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [milestone_id, project_id, freelancer_id, freelancer_name, freelancer_email,
       cv_url, motivation_letter, years_of_experience, proposed_budget]
    );
    
    res.json({ id: result.insertId, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Update application status
app.put('/api/applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Schedule interview
app.post('/api/applications/:id/interview', async (req, res) => {
  try {
    const { meet_link, interview_date, interview_time, notes } = req.body;
    
    // Check if interview already exists
    const [existing] = await pool.query('SELECT id FROM interviews WHERE application_id = ?', [req.params.id]);
    
    if (existing.length > 0) {
      // Update existing interview
      await pool.query(
        `UPDATE interviews SET meet_link = ?, interview_date = ?, interview_time = ?, notes = ? 
         WHERE application_id = ?`,
        [meet_link, interview_date, interview_time, notes, req.params.id]
      );
    } else {
      // Create new interview
      await pool.query(
        `INSERT INTO interviews (application_id, meet_link, interview_date, interview_time, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [req.params.id, meet_link, interview_date, interview_time, notes]
      );
    }
    
    // Update application status
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', ['interview_scheduled', req.params.id]);
    
    res.json({ message: 'Interview scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ error: 'Failed to schedule interview' });
  }
});

// Confirm interview
app.post('/api/applications/:id/confirm-interview', async (req, res) => {
  try {
    await pool.query(
      'UPDATE interviews SET confirmed_by_freelancer = TRUE WHERE application_id = ?',
      [req.params.id]
    );
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', ['interview_confirmed', req.params.id]);
    res.json({ message: 'Interview confirmed successfully' });
  } catch (error) {
    console.error('Error confirming interview:', error);
    res.status(500).json({ error: 'Failed to confirm interview' });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: 'connected' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Matchy Backend Service running on http://localhost:${PORT}`);
  console.log(`📊 Database: matchy_db`);
  console.log(`✅ Ready to accept requests`);
  console.log(`🔗 Registering with Eureka at http://localhost:8761`);
});

// ============================================
// NOTIFICATIONS API
// ============================================

// Helper function to create notification
async function createNotification(userId, userType, type, title, message, link, applicationId = null) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, user_type, type, title, message, link, application_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, userType, type, title, message, link, applicationId]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Get notifications for user
app.get('/api/notifications/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const [notifications] = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? AND user_type = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId, userType]
    );
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count
app.get('/api/notifications/:userType/:userId/unread-count', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const [result] = await pool.query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = ? AND user_type = ? AND is_read = FALSE`,
      [userId, userType]
    );
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
app.put('/api/notifications/:userType/:userId/read-all', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND user_type = ?',
      [userId, userType]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// ============================================
// MODIFIED APPLICATION ENDPOINTS WITH NOTIFICATIONS
// ============================================

// Override the submit application endpoint to create notification
const originalApplicationPost = app._router.stack.find(
  r => r.route && r.route.path === '/api/applications' && r.route.methods.post
);

// Remove old route and add new one with notification
app._router.stack = app._router.stack.filter(
  r => !(r.route && r.route.path === '/api/applications' && r.route.methods.post)
);

app.post('/api/applications', async (req, res) => {
  try {
    const { milestone_id, project_id, freelancer_id, freelancer_name, freelancer_email,
            cv_url, motivation_letter, years_of_experience, proposed_budget } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO applications (milestone_id, project_id, freelancer_id, freelancer_name, 
       freelancer_email, cv_url, motivation_letter, years_of_experience, proposed_budget, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [milestone_id, project_id, freelancer_id, freelancer_name, freelancer_email,
       cv_url, motivation_letter, years_of_experience, proposed_budget]
    );
    
    const applicationId = result.insertId;
    
    // Get milestone and project info
    const [milestones] = await pool.query('SELECT title, project_id FROM milestones WHERE id = ?', [milestone_id]);
    const [projects] = await pool.query('SELECT company_name FROM projects WHERE id = ?', [project_id]);
    
    if (milestones.length > 0 && projects.length > 0) {
      const milestone = milestones[0];
      const project = projects[0];
      
      // Create notification for company (assuming company user_id = 1 for now)
      // In production, you'd get the actual company user_id from the project
      await createNotification(
        1, // company user id
        'company',
        'application_received',
        'New Application Received',
        `${freelancer_name} applied to "${milestone.title}"`,
        `/backoffice/company-projects/${project_id}/review`,
        applicationId
      );
    }
    
    res.json({ id: applicationId, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Override update application status to create notification
app._router.stack = app._router.stack.filter(
  r => !(r.route && r.route.path === '/api/applications/:id/status' && r.route.methods.put)
);

app.put('/api/applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    
    // Get application details
    const [applications] = await pool.query(
      `SELECT a.*, m.title as milestone_title, p.project_title 
       FROM applications a
       JOIN milestones m ON a.milestone_id = m.id
       JOIN projects p ON a.project_id = p.id
       WHERE a.id = ?`,
      [applicationId]
    );
    
    if (applications.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const application = applications[0];
    
    // Update status
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, applicationId]);
    
    // Create notification for freelancer if accepted or rejected
    if (status === 'accepted' || status === 'rejected') {
      const title = status === 'accepted' ? '🎉 Application Accepted!' : 'Application Update';
      const message = status === 'accepted' 
        ? `Your application for "${application.milestone_title}" has been accepted!`
        : `Your application for "${application.milestone_title}" was not selected this time.`;
      
      await createNotification(
        application.freelancer_id,
        'freelancer',
        `application_${status}`,
        title,
        message,
        '/my-applications',
        applicationId
      );
    }
    
    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Override schedule interview to create notification
app._router.stack = app._router.stack.filter(
  r => !(r.route && r.route.path === '/api/applications/:id/interview' && r.route.methods.post)
);

app.post('/api/applications/:id/interview', async (req, res) => {
  try {
    const { meet_link, interview_date, interview_time, notes } = req.body;
    const applicationId = req.params.id;
    
    // Get application details
    const [applications] = await pool.query(
      `SELECT a.*, m.title as milestone_title 
       FROM applications a
       JOIN milestones m ON a.milestone_id = m.id
       WHERE a.id = ?`,
      [applicationId]
    );
    
    if (applications.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const application = applications[0];
    
    // Check if interview already exists
    const [existing] = await pool.query('SELECT id FROM interviews WHERE application_id = ?', [applicationId]);
    
    if (existing.length > 0) {
      await pool.query(
        `UPDATE interviews SET meet_link = ?, interview_date = ?, interview_time = ?, notes = ? 
         WHERE application_id = ?`,
        [meet_link, interview_date, interview_time, notes, applicationId]
      );
    } else {
      await pool.query(
        `INSERT INTO interviews (application_id, meet_link, interview_date, interview_time, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [applicationId, meet_link, interview_date, interview_time, notes]
      );
    }
    
    // Update application status
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', ['interview_scheduled', applicationId]);
    
    // Create notification for freelancer
    await createNotification(
      application.freelancer_id,
      'freelancer',
      'interview_scheduled',
      '📅 Interview Scheduled',
      `Interview scheduled for "${application.milestone_title}" on ${interview_date} at ${interview_time}`,
      '/my-applications',
      applicationId
    );
    
    res.json({ message: 'Interview scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ error: 'Failed to schedule interview' });
  }
});


// ============================================
// MILESTONE WORKSPACE API
// ============================================

// Get team members for a milestone (accepted freelancers)
app.get('/api/milestones/:milestoneId/team', async (req, res) => {
  try {
    const [team] = await pool.query(
      `SELECT a.freelancer_id, a.freelancer_name, a.freelancer_email, a.applied_at
       FROM applications a
       WHERE a.milestone_id = ? AND a.status = 'accepted'
       ORDER BY a.applied_at ASC`,
      [req.params.milestoneId]
    );
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Get chat messages for a milestone
app.get('/api/milestones/:milestoneId/chat', async (req, res) => {
  try {
    const [messages] = await pool.query(
      `SELECT * FROM milestone_chat
       WHERE milestone_id = ?
       ORDER BY created_at ASC`,
      [req.params.milestoneId]
    );
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Send chat message
app.post('/api/milestones/:milestoneId/chat', async (req, res) => {
  try {
    const { user_id, user_name, user_type, message } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO milestone_chat (milestone_id, user_id, user_name, user_type, message)
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.milestoneId, user_id, user_name, user_type, message]
    );
    
    res.json({ id: result.insertId, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get work submissions for a milestone
app.get('/api/milestones/:milestoneId/submissions', async (req, res) => {
  try {
    const [submissions] = await pool.query(
      `SELECT s.*, a.freelancer_name
       FROM work_submissions s
       JOIN applications a ON s.application_id = a.id
       WHERE s.milestone_id = ?
       ORDER BY s.submitted_at DESC`,
      [req.params.milestoneId]
    );
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Get work submissions by freelancer
app.get('/api/freelancers/:freelancerId/submissions', async (req, res) => {
  try {
    const [submissions] = await pool.query(
      `SELECT s.*, m.title as milestone_title, p.project_title
       FROM work_submissions s
       JOIN milestones m ON s.milestone_id = m.id
       JOIN projects p ON m.project_id = p.id
       WHERE s.freelancer_id = ?
       ORDER BY s.submitted_at DESC`,
      [req.params.freelancerId]
    );
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Submit work
app.post('/api/submissions', async (req, res) => {
  try {
    const { application_id, milestone_id, freelancer_id, title, description, file_url, file_name, file_type } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO work_submissions (application_id, milestone_id, freelancer_id, title, description, file_url, file_name, file_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [application_id, milestone_id, freelancer_id, title, description, file_url, file_name, file_type]
    );
    
    res.json({ id: result.insertId, message: 'Work submitted successfully' });
  } catch (error) {
    console.error('Error submitting work:', error);
    res.status(500).json({ error: 'Failed to submit work' });
  }
});

// Update submission status (for company review)
app.put('/api/submissions/:id/status', async (req, res) => {
  try {
    const { status, feedback, rating } = req.body;
    
    // First, check if rating column exists, if not add it
    try {
      await pool.query(`
        ALTER TABLE work_submissions 
        ADD COLUMN IF NOT EXISTS rating INT DEFAULT NULL
      `);
    } catch (alterError) {
      // Column might already exist, continue
      console.log('Rating column check:', alterError.message);
    }
    
    // Update submission with rating
    await pool.query(
      `UPDATE work_submissions 
       SET status = ?, feedback = ?, rating = ?, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, feedback, rating || null, req.params.id]
    );
    
    res.json({ message: 'Submission status updated successfully' });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Failed to update submission' });
  }
});


// ============================================
// ADVANCED FEATURES - AI MATCHING & PAYMENTS
// ============================================

import aiMatchingService from './ai-matching.service.js';
import paymentService from './payment.service.js';
import advancedSearchService from './advanced-search.service.js';

// AI-Powered Freelancer Recommendations for Project
app.get('/api/projects/:projectId/recommended-freelancers', async (req, res) => {
  try {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const recommendations = await aiMatchingService.getRecommendedFreelancers(projectId, limit);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommended freelancers:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI-Powered Project Recommendations for Freelancer
app.get('/api/freelancers/:freelancerId/recommended-projects', async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const recommendations = await aiMatchingService.getRecommendedProjects(freelancerId, limit);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommended projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create Payment (when work is approved)
app.post('/api/payments', async (req, res) => {
  try {
    const { submission_id, company_id, amount, currency, payment_method, transaction_id } = req.body;
    
    const paymentId = await paymentService.createPayment(submission_id, {
      company_id,
      amount,
      currency,
      payment_method,
      transaction_id
    });
    
    res.json({ 
      success: true, 
      payment_id: paymentId,
      message: 'Payment created successfully' 
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process Payment
app.post('/api/payments/:paymentId/process', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await paymentService.processPayment(paymentId);
    res.json(result);
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Freelancer Payment History
app.get('/api/freelancers/:freelancerId/payments', async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const payments = await paymentService.getFreelancerPayments(freelancerId);
    res.json(payments);
  } catch (error) {
    console.error('Error getting freelancer payments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Company Payment History
app.get('/api/companies/:companyId/payments', async (req, res) => {
  try {
    const { companyId } = req.params;
    const payments = await paymentService.getCompanyPayments(companyId);
    res.json(payments);
  } catch (error) {
    console.error('Error getting company payments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Advanced Project Search
app.post('/api/search/projects', async (req, res) => {
  try {
    const filters = req.body;
    const results = await advancedSearchService.searchProjects(filters);
    res.json(results);
  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Advanced Freelancer Search
app.post('/api/search/freelancers', async (req, res) => {
  try {
    const filters = req.body;
    const results = await advancedSearchService.searchFreelancers(filters);
    res.json(results);
  } catch (error) {
    console.error('Error searching freelancers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save Search
app.post('/api/saved-searches', async (req, res) => {
  try {
    const { user_id, user_type, name, query, filters, notify_on_match } = req.body;
    
    const searchId = await advancedSearchService.saveSearch(user_id, user_type, {
      name,
      query,
      filters,
      notifyOnMatch: notify_on_match
    });
    
    res.json({ 
      success: true, 
      search_id: searchId,
      message: 'Search saved successfully' 
    });
  } catch (error) {
    console.error('Error saving search:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Saved Searches
app.get('/api/saved-searches/:userType/:userId', async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const searches = await advancedSearchService.getSavedSearches(userId, userType);
    res.json(searches);
  } catch (error) {
    console.error('Error getting saved searches:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Freelancer Profile
app.get('/api/freelancer-profiles/:freelancerId', async (req, res) => {
  try {
    const [profiles] = await pool.query(
      'SELECT * FROM freelancer_profiles WHERE freelancer_id = ?',
      [req.params.freelancerId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Freelancer profile not found' });
    }
    
    res.json(profiles[0]);
  } catch (error) {
    console.error('Error getting freelancer profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create/Update Freelancer Profile
app.post('/api/freelancer-profiles', async (req, res) => {
  try {
    const {
      freelancer_id, freelancer_name, freelancer_email, skills,
      experience_years, hourly_rate, availability, location, bio, portfolio_url
    } = req.body;
    
    const [result] = await pool.query(`
      INSERT INTO freelancer_profiles 
      (freelancer_id, freelancer_name, freelancer_email, skills, experience_years, 
       hourly_rate, availability, location, bio, portfolio_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        freelancer_name = VALUES(freelancer_name),
        freelancer_email = VALUES(freelancer_email),
        skills = VALUES(skills),
        experience_years = VALUES(experience_years),
        hourly_rate = VALUES(hourly_rate),
        availability = VALUES(availability),
        location = VALUES(location),
        bio = VALUES(bio),
        portfolio_url = VALUES(portfolio_url),
        updated_at = NOW()
    `, [
      freelancer_id, freelancer_name, freelancer_email, JSON.stringify(skills),
      experience_years, hourly_rate, availability, location, bio, portfolio_url
    ]);
    
    res.json({ 
      success: true, 
      message: 'Freelancer profile saved successfully' 
    });
  } catch (error) {
    console.error('Error saving freelancer profile:', error);
    res.status(500).json({ error: error.message });
  }
});

console.log('✅ Advanced features loaded: AI Matching, Payments, Advanced Search');
