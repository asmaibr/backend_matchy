import express from 'express';
import projectController from '../controllers/project.controller.js';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', projectController.getAllProjects.bind(projectController));
router.get('/:id', projectController.getProjectById.bind(projectController));
router.post('/', projectController.createProject.bind(projectController));
router.put('/:id', projectController.updateProject.bind(projectController));
router.delete('/:id', projectController.deleteProject.bind(projectController));
router.post('/:id/increment-clicks', projectController.incrementClickCount.bind(projectController));

// Project stats endpoints
router.get('/stats', async (req, res) => {
  try {
    // Get total projects
    const [totalProjects] = await pool.query('SELECT COUNT(*) as count FROM projects');
    
    // Get projects by status
    const [openProjects] = await pool.query('SELECT COUNT(*) as count FROM projects WHERE status = "open"');
    const [inProgressProjects] = await pool.query('SELECT COUNT(*) as count FROM projects WHERE status = "in_progress"');
    const [completedProjects] = await pool.query('SELECT COUNT(*) as count FROM projects WHERE status = "completed"');
    
    // Get total milestones
    const [totalMilestones] = await pool.query('SELECT COUNT(*) as count FROM milestones');
    
    // Get total applications
    const [totalApplications] = await pool.query('SELECT COUNT(*) as count FROM applications');
    
    // Get pending applications
    const [pendingApplications] = await pool.query('SELECT COUNT(*) as count FROM applications WHERE status = "pending"');

    res.json({
      totalProjects: totalProjects[0].count,
      openProjects: openProjects[0].count,
      inProgressProjects: inProgressProjects[0].count,
      completedProjects: completedProjects[0].count,
      totalMilestones: totalMilestones[0].count,
      totalApplications: totalApplications[0].count,
      pendingApplications: pendingApplications[0].count
    });
  } catch (error) {
    console.error('Error getting project stats:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats/overview', async (req, res) => {
  try {
    // Get total projects
    const [totalProjects] = await pool.query('SELECT COUNT(*) as count FROM projects');
    
    // Get projects by status
    const [openProjects] = await pool.query('SELECT COUNT(*) as count FROM projects WHERE status = "open"');
    const [inProgressProjects] = await pool.query('SELECT COUNT(*) as count FROM projects WHERE status = "in_progress"');
    const [completedProjects] = await pool.query('SELECT COUNT(*) as count FROM projects WHERE status = "completed"');
    
    // Get total milestones
    const [totalMilestones] = await pool.query('SELECT COUNT(*) as count FROM milestones');
    
    // Get total applications
    const [totalApplications] = await pool.query('SELECT COUNT(*) as count FROM applications');
    
    // Get pending applications
    const [pendingApplications] = await pool.query('SELECT COUNT(*) as count FROM applications WHERE status = "pending"');

    res.json({
      totalProjects: totalProjects[0].count,
      openProjects: openProjects[0].count,
      inProgressProjects: inProgressProjects[0].count,
      completedProjects: completedProjects[0].count,
      totalMilestones: totalMilestones[0].count,
      totalApplications: totalApplications[0].count,
      pendingApplications: pendingApplications[0].count
    });
  } catch (error) {
    console.error('Error getting project stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

