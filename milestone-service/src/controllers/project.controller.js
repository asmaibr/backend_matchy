import projectService from '../services/project.service.js';

class ProjectController {
  async getAllProjects(req, res) {
    try {
      const projects = await projectService.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  async getProjectById(req, res) {
    try {
      const project = await projectService.getProjectById(req.params.id);
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      if (error.message === 'Project not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch project' });
      }
    }
  }

  async createProject(req, res) {
    try {
      const result = await projectService.createProject(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }

  async updateProject(req, res) {
    try {
      const result = await projectService.updateProject(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  }

  async deleteProject(req, res) {
    try {
      const result = await projectService.deleteProject(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  }

  async incrementClickCount(req, res) {
    try {
      const result = await projectService.incrementClickCount(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Error incrementing clicks:', error);
      res.status(500).json({ error: 'Failed to increment clicks' });
    }
  }
}

export default new ProjectController();
