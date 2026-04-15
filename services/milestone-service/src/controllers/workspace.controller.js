import workspaceService from '../services/workspace.service.js';

class WorkspaceController {
  async getTeamMembers(req, res) {
    try {
      const team = await workspaceService.getTeamMembers(req.params.milestoneId);
      res.json(team);
    } catch (error) {
      console.error('Error fetching team:', error);
      res.status(500).json({ error: 'Failed to fetch team' });
    }
  }

  async getChatMessages(req, res) {
    try {
      const messages = await workspaceService.getChatMessages(req.params.milestoneId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat:', error);
      res.status(500).json({ error: 'Failed to fetch chat' });
    }
  }

  async sendChatMessage(req, res) {
    try {
      const result = await workspaceService.sendChatMessage(req.params.milestoneId, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  async getSubmissionsByMilestone(req, res) {
    try {
      const submissions = await workspaceService.getSubmissionsByMilestone(req.params.milestoneId);
      res.json(submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ error: 'Failed to fetch submissions' });
    }
  }

  async getSubmissionsByFreelancer(req, res) {
    try {
      const submissions = await workspaceService.getSubmissionsByFreelancer(req.params.freelancerId);
      res.json(submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ error: 'Failed to fetch submissions' });
    }
  }

  async submitWork(req, res) {
    try {
      const result = await workspaceService.submitWork(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error submitting work:', error);
      res.status(500).json({ error: 'Failed to submit work' });
    }
  }

  async updateSubmissionStatus(req, res) {
    try {
      const result = await workspaceService.updateSubmissionStatus(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error updating submission:', error);
      res.status(500).json({ error: 'Failed to update submission' });
    }
  }
}

export default new WorkspaceController();
