import milestoneService from '../services/milestone.service.js';

class MilestoneController {
  async getAllMilestones(req, res) {
    try {
      const milestones = await milestoneService.getAllMilestones();
      res.json(milestones);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      res.status(500).json({ error: 'Failed to fetch milestones' });
    }
  }

  async getMilestonesByProjectId(req, res) {
    try {
      const milestones = await milestoneService.getMilestonesByProjectId(req.params.projectId);
      res.json(milestones);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      res.status(500).json({ error: 'Failed to fetch milestones' });
    }
  }

  async createMilestone(req, res) {
    try {
      const result = await milestoneService.createMilestone(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error creating milestone:', error);
      res.status(500).json({ error: 'Failed to create milestone' });
    }
  }

  async updateMilestone(req, res) {
    try {
      const result = await milestoneService.updateMilestone(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error updating milestone:', error);
      res.status(500).json({ error: 'Failed to update milestone' });
    }
  }

  async deleteMilestone(req, res) {
    try {
      const result = await milestoneService.deleteMilestone(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting milestone:', error);
      res.status(500).json({ error: 'Failed to delete milestone' });
    }
  }
}

export default new MilestoneController();
