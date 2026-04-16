import applicationRepository from '../repositories/application.repository.js';
import interviewRepository from '../repositories/interview.repository.js';
import notificationService from './notification.service.js';
import milestoneRepository from '../repositories/milestone.repository.js';
import projectRepository from '../repositories/project.repository.js';

class ApplicationService {
  async getApplicationsByMilestone(milestoneId) {
    return await applicationRepository.findByMilestoneId(milestoneId);
  }

  async getApplicationsByProject(projectId) {
    return await applicationRepository.findByProjectId(projectId);
  }

  async getApplicationsByFreelancer(freelancerId) {
    return await applicationRepository.findByFreelancerId(freelancerId);
  }

  async submitApplication(applicationData) {
    console.log('🔍 Backend received application data:', applicationData);
    console.log('🔍 freelancer_id from request:', applicationData.freelancer_id);
    const applicationId = await applicationRepository.create(applicationData);
    console.log('✅ Application created with ID:', applicationId, 'for freelancer:', applicationData.freelancer_id);
    
    // Get milestone and project info for notification
    const milestone = await milestoneRepository.findById(applicationData.milestone_id);
    const project = await projectRepository.findById(applicationData.project_id);
    
    if (milestone && project) {
      // Create notification for the project owner (company/client)
      // Get the user_id from the project's created_by field or company_id
      const companyUserId = project.created_by || project.user_id || 1;
      
      await notificationService.createNotification({
        user_id: companyUserId,
        user_type: 'company',
        type: 'application_received',
        title: 'New Application Received',
        message: `${applicationData.freelancer_name} applied to "${milestone.title}" in project "${project.project_title}"`,
        link: `/backoffice/company-projects/${applicationData.project_id}/review`,
        application_id: applicationId
      });
    }
    
    return { id: applicationId, message: 'Application submitted successfully' };
  }

  async updateApplicationStatus(id, status) {
    const application = await applicationRepository.findById(id);
    
    if (!application) {
      throw new Error('Application not found');
    }
    
    await applicationRepository.updateStatus(id, status);
    
    // Create notification for freelancer if accepted or rejected
    if (status === 'accepted' || status === 'rejected') {
      const title = status === 'accepted' ? '🎉 Application Accepted!' : 'Application Update';
      const message = status === 'accepted' 
        ? `Your application for "${application.milestone_title}" has been accepted!`
        : `Your application for "${application.milestone_title}" was not selected this time.`;
      
      await notificationService.createNotification({
        user_id: application.freelancer_id,
        user_type: 'freelancer',
        type: `application_${status}`,
        title,
        message,
        link: '/my-applications',
        application_id: id
      });
    }
    
    return { message: 'Application status updated successfully' };
  }

  async scheduleInterview(applicationId, interviewData) {
    const application = await applicationRepository.findById(applicationId);
    
    if (!application) {
      throw new Error('Application not found');
    }
    
    // Check if interview already exists
    const existingInterview = await interviewRepository.findByApplicationId(applicationId);
    
    if (existingInterview) {
      await interviewRepository.update(applicationId, interviewData);
    } else {
      await interviewRepository.create(applicationId, interviewData);
    }
    
    // Update application status
    await applicationRepository.updateStatus(applicationId, 'interview_scheduled');
    
    // Create notification for freelancer
    await notificationService.createNotification({
      user_id: application.freelancer_id,
      user_type: 'freelancer',
      type: 'interview_scheduled',
      title: '📅 Interview Scheduled',
      message: `Interview scheduled for "${application.milestone_title}" on ${interviewData.interview_date} at ${interviewData.interview_time}`,
      link: '/my-applications',
      application_id: applicationId
    });
    
    return { message: 'Interview scheduled successfully' };
  }

  async confirmInterview(applicationId) {
    await interviewRepository.confirmByFreelancer(applicationId);
    await applicationRepository.updateStatus(applicationId, 'interview_confirmed');
    return { message: 'Interview confirmed successfully' };
  }
}

export default new ApplicationService();
