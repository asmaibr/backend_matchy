import express from 'express';
import projectRoutes from './project.routes.js';
import milestoneRoutes from './milestone.routes.js';
import applicationRoutes from './application.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import milestoneController from '../controllers/milestone.controller.js';
import applicationController from '../controllers/application.controller.js';
import notificationController from '../controllers/notification.controller.js';
import workspaceController from '../controllers/workspace.controller.js';
import aiMatchingService from '../../ai-matching.service.js';
import paymentService from '../../payment.service.js';
import advancedSearchService from '../../advanced-search.service.js';
import pool from '../config/database.js';

const router = express.Router();

// ============================================
// MAIN ROUTES
// ============================================

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/applications', applicationRoutes);

// ============================================
// NESTED ROUTES
// ============================================

// Project-specific routes
router.get('/projects/:projectId/milestones', milestoneController.getMilestonesByProjectId.bind(milestoneController));
router.get('/projects/:projectId/applications', applicationController.getApplicationsByProject.bind(applicationController));

// Milestone-specific routes
router.get('/milestones/:milestoneId/applications', applicationController.getApplicationsByMilestone.bind(applicationController));
router.get('/milestones/:milestoneId/team', workspaceController.getTeamMembers.bind(workspaceController));
router.get('/milestones/:milestoneId/chat', workspaceController.getChatMessages.bind(workspaceController));
router.post('/milestones/:milestoneId/chat', workspaceController.sendChatMessage.bind(workspaceController));
router.get('/milestones/:milestoneId/submissions', workspaceController.getSubmissionsByMilestone.bind(workspaceController));

// Freelancer-specific routes
router.get('/freelancers/:freelancerId/applications', applicationController.getApplicationsByFreelancer.bind(applicationController));
router.get('/freelancers/:freelancerId/submissions', workspaceController.getSubmissionsByFreelancer.bind(workspaceController));

// Notification routes
router.get('/notifications', notificationController.getAllNotifications.bind(notificationController));
router.get('/notifications/:userType/:userId', notificationController.getNotifications.bind(notificationController));
router.get('/notifications/:userType/:userId/unread-count', notificationController.getUnreadCount.bind(notificationController));
router.put('/notifications/:id/read', notificationController.markAsRead.bind(notificationController));
router.put('/notifications/:userType/:userId/read-all', notificationController.markAllAsRead.bind(notificationController));
router.delete('/notifications/:id', notificationController.deleteNotification.bind(notificationController));

// Work submission routes
router.post('/submissions', workspaceController.submitWork.bind(workspaceController));
router.put('/submissions/:id/status', workspaceController.updateSubmissionStatus.bind(workspaceController));

// ============================================
// ADVANCED FEATURES - AI MATCHING & PAYMENTS
// ============================================

// AI-Powered Freelancer Recommendations for Project
router.get('/projects/:projectId/recommended-freelancers', async (req, res) => {
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
router.get('/freelancers/:freelancerId/recommended-projects', async (req, res) => {
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

// Payment routes
router.post('/payments', async (req, res) => {
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

router.post('/payments/:paymentId/process', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = await paymentService.processPayment(paymentId);
    res.json(result);
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/freelancers/:freelancerId/payments', async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const payments = await paymentService.getFreelancerPayments(freelancerId);
    res.json(payments);
  } catch (error) {
    console.error('Error getting freelancer payments:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/companies/:companyId/payments', async (req, res) => {
  try {
    const { companyId } = req.params;
    const payments = await paymentService.getCompanyPayments(companyId);
    res.json(payments);
  } catch (error) {
    console.error('Error getting company payments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Advanced Search routes
router.post('/search/projects', async (req, res) => {
  try {
    const filters = req.body;
    const results = await advancedSearchService.searchProjects(filters);
    res.json(results);
  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/search/freelancers', async (req, res) => {
  try {
    const filters = req.body;
    const results = await advancedSearchService.searchFreelancers(filters);
    res.json(results);
  } catch (error) {
    console.error('Error searching freelancers:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/saved-searches', async (req, res) => {
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

router.get('/saved-searches/:userType/:userId', async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const searches = await advancedSearchService.getSavedSearches(userId, userType);
    res.json(searches);
  } catch (error) {
    console.error('Error getting saved searches:', error);
    res.status(500).json({ error: error.message });
  }
});

// Freelancer Profile routes
router.get('/freelancer-profiles/:freelancerId', async (req, res) => {
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

router.post('/freelancer-profiles', async (req, res) => {
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

// ============================================
// HEALTH CHECK
// ============================================

router.get('/health', (_req, res) => {
  res.json({ ok: true, database: 'connected' });
});

export default router;
