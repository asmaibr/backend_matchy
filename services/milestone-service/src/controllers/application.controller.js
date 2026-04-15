import applicationService from '../services/application.service.js';

class ApplicationController {
  async getApplicationsByMilestone(req, res) {
    try {
      const applications = await applicationService.getApplicationsByMilestone(req.params.milestoneId);
      res.json(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  }

  async getApplicationsByProject(req, res) {
    try {
      const applications = await applicationService.getApplicationsByProject(req.params.projectId);
      res.json(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  }

  async getApplicationsByFreelancer(req, res) {
    try {
      const applications = await applicationService.getApplicationsByFreelancer(req.params.freelancerId);
      res.json(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  }

  async submitApplication(req, res) {
    try {
      const result = await applicationService.submitApplication(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  }

  async updateApplicationStatus(req, res) {
    try {
      const result = await applicationService.updateApplicationStatus(req.params.id, req.body.status);
      res.json(result);
    } catch (error) {
      console.error('Error updating application status:', error);
      if (error.message === 'Application not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update application status' });
      }
    }
  }

  async scheduleInterview(req, res) {
    try {
      const result = await applicationService.scheduleInterview(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      if (error.message === 'Application not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to schedule interview' });
      }
    }
  }

  async confirmInterview(req, res) {
    try {
      const result = await applicationService.confirmInterview(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error confirming interview:', error);
      res.status(500).json({ error: 'Failed to confirm interview' });
    }
  }
}

export default new ApplicationController();
