import milestoneRepository from '../repositories/milestone.repository.js';

class MilestoneService {
  async getAllMilestones() {
    const milestones = await milestoneRepository.findAll();
    return this._formatMilestones(milestones);
  }

  async getMilestonesByProjectId(projectId) {
    const milestones = await milestoneRepository.findByProjectId(projectId);
    return this._formatMilestones(milestones);
  }

  async getMilestoneById(id) {
    const milestone = await milestoneRepository.findById(id);
    
    if (!milestone) {
      throw new Error('Milestone not found');
    }
    
    milestone.skills = milestone.skills ? JSON.parse(milestone.skills) : [];
    return milestone;
  }

  async createMilestone(milestoneData) {
    const milestoneId = await milestoneRepository.create(milestoneData);
    return { id: milestoneId, message: 'Milestone created successfully' };
  }

  async updateMilestone(id, updates) {
    await milestoneRepository.update(id, updates);
    return { message: 'Milestone updated successfully' };
  }

  async deleteMilestone(id) {
    await milestoneRepository.delete(id);
    return { message: 'Milestone deleted successfully' };
  }

  _formatMilestones(milestones) {
    milestones.forEach(m => {
      m.skills = m.skills ? JSON.parse(m.skills) : [];
      m.applicationsCount = m.applications_count || 0;
    });
    return milestones;
  }
}

export default new MilestoneService();
