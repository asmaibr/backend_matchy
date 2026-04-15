import workspaceRepository from '../repositories/workspace.repository.js';

class WorkspaceService {
  async getTeamMembers(milestoneId) {
    return await workspaceRepository.getTeamMembers(milestoneId);
  }

  async getChatMessages(milestoneId) {
    return await workspaceRepository.getChatMessages(milestoneId);
  }

  async sendChatMessage(milestoneId, messageData) {
    const messageId = await workspaceRepository.createChatMessage(milestoneId, messageData);
    return { id: messageId, message: 'Message sent successfully' };
  }

  async getSubmissionsByMilestone(milestoneId) {
    return await workspaceRepository.getSubmissionsByMilestone(milestoneId);
  }

  async getSubmissionsByFreelancer(freelancerId) {
    return await workspaceRepository.getSubmissionsByFreelancer(freelancerId);
  }

  async submitWork(submissionData) {
    const submissionId = await workspaceRepository.createSubmission(submissionData);
    return { id: submissionId, message: 'Work submitted successfully' };
  }

  async updateSubmissionStatus(id, statusData) {
    await workspaceRepository.updateSubmissionStatus(id, statusData);
    return { message: 'Submission status updated successfully' };
  }
}

export default new WorkspaceService();
