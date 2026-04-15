import pool from '../config/database.js';

class WorkspaceRepository {
  // Team Members
  async getTeamMembers(milestoneId) {
    const [team] = await pool.query(
      `SELECT a.freelancer_id, a.freelancer_name, a.freelancer_email, a.applied_at
       FROM applications a
       WHERE a.milestone_id = ? AND a.status = 'accepted'
       ORDER BY a.applied_at ASC`,
      [milestoneId]
    );
    return team;
  }

  // Chat Messages
  async getChatMessages(milestoneId) {
    const [messages] = await pool.query(
      `SELECT * FROM milestone_chat
       WHERE milestone_id = ?
       ORDER BY created_at ASC`,
      [milestoneId]
    );
    return messages;
  }

  async createChatMessage(milestoneId, messageData) {
    const { user_id, user_name, user_type, message } = messageData;
    
    const [result] = await pool.query(
      `INSERT INTO milestone_chat (milestone_id, user_id, user_name, user_type, message)
       VALUES (?, ?, ?, ?, ?)`,
      [milestoneId, user_id, user_name, user_type, message]
    );
    
    return result.insertId;
  }

  // Work Submissions
  async getSubmissionsByMilestone(milestoneId) {
    const [submissions] = await pool.query(
      `SELECT s.*, a.freelancer_name
       FROM work_submissions s
       JOIN applications a ON s.application_id = a.id
       WHERE s.milestone_id = ?
       ORDER BY s.submitted_at DESC`,
      [milestoneId]
    );
    return submissions;
  }

  async getSubmissionsByFreelancer(freelancerId) {
    const [submissions] = await pool.query(
      `SELECT s.*, m.title as milestone_title, p.project_title
       FROM work_submissions s
       JOIN milestones m ON s.milestone_id = m.id
       JOIN projects p ON m.project_id = p.id
       WHERE s.freelancer_id = ?
       ORDER BY s.submitted_at DESC`,
      [freelancerId]
    );
    return submissions;
  }

  async createSubmission(submissionData) {
    const { application_id, milestone_id, freelancer_id, title, description, file_url, file_name, file_type } = submissionData;
    
    const [result] = await pool.query(
      `INSERT INTO work_submissions (application_id, milestone_id, freelancer_id, title, description, file_url, file_name, file_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [application_id, milestone_id, freelancer_id, title, description, file_url, file_name, file_type]
    );
    
    return result.insertId;
  }

  async updateSubmissionStatus(id, statusData) {
    const { status, feedback, rating } = statusData;
    
    // Ensure rating column exists
    try {
      await pool.query(`
        ALTER TABLE work_submissions 
        ADD COLUMN IF NOT EXISTS rating INT DEFAULT NULL
      `);
    } catch (error) {
      // Column might already exist
    }
    
    await pool.query(
      `UPDATE work_submissions 
       SET status = ?, feedback = ?, rating = ?, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, feedback, rating || null, id]
    );
    
    return true;
  }
}

export default new WorkspaceRepository();
