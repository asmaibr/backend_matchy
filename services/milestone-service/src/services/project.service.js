import projectRepository from '../repositories/project.repository.js';

class ProjectService {
  async getAllProjects() {
    const projects = await projectRepository.findAll();
    
    // Parse JSON fields
    projects.forEach(p => {
      p.skills = p.skills ? JSON.parse(p.skills) : [];
      p.applicationsCount = p.applications_count || 0;
    });
    
    return projects;
  }

  async getProjectById(id) {
    const project = await projectRepository.findById(id);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    project.skills = project.skills ? JSON.parse(project.skills) : [];
    return project;
  }

  async createProject(projectData) {
    const projectId = await projectRepository.create(projectData);
    return { id: projectId, message: 'Project created successfully' };
  }

  async updateProject(id, updates) {
    await projectRepository.update(id, updates);
    return { message: 'Project updated successfully' };
  }

  async deleteProject(id) {
    await projectRepository.delete(id);
    return { message: 'Project deleted successfully' };
  }

  async incrementClickCount(id) {
    await projectRepository.incrementClickCount(id);
    return { message: 'Click count incremented' };
  }
}

export default new ProjectService();
