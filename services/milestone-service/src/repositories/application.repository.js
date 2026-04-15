import pool from '../config/database.js';

class ApplicationRepository {
  async findByMilestoneId(milestoneId) {
    const [applications] = await pool.query(`
      SELECT a.*, i.meet_link, i.interview_date, i.interview_time, i.notes, 
             i.confirmed_by_freelancer, i.scheduled_at as interview_scheduled_at
      FROM applications a
      LEFT JOIN interviews i ON a.id = i.application_id
      WHERE a.milestone_id = ?
      ORDER BY a.applied_at DESC
    `, [milestoneId]);
    
    return this._formatApplications(applications);
  }

  async findByProjectId(projectId) {
    const [applications] = await pool.query(`
      SELECT a.*, i.meet_link, i.interview_date, i.interview_time, i.notes, 
             i.confirmed_by_freelancer, i.scheduled_at as interview_scheduled_at
      FROM applications a
      LEFT JOIN interviews i ON a.id = i.application_id
      WHERE a.project_id = ?
      ORDER BY a.applied_at DESC
    `, [projectId]);
    
    return this._formatApplications(applications);
  }

  async findByFreelancerId(freelancerId) {
    const [applications] = await pool.query(`
      SELECT a.*, i.meet_link, i.interview_date, i.interview_time, i.notes, 
             i.confirmed_by_freelancer, i.scheduled_at as interview_scheduled_at
      FROM applications a
      LEFT JOIN interviews i ON a.id = i.application_id
      WHERE a.freelancer_id = ?
      ORDER BY a.applied_at DESC
    `, [freelancerId]);
    
    return this._formatApplications(applications);
  }

  async findById(id) {
    const [applications] = await pool.query(`
      SELECT a.*, m.title as milestone_title, p.project_title 
      FROM applications a
      JOIN milestones m ON a.milestone_id = m.id
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = ?
    `, [id]);
    
    return applications[0] || null;
  }

  async create(applicationData) {
    const { milestone_id, project_id, freelancer_id, freelancer_name, freelancer_email,
            cv_url, motivation_letter, years_of_experience, proposed_budget } = applicationData;
    
    const [result] = await pool.query(
      `INSERT INTO applications (milestone_id, project_id, freelancer_id, freelancer_name, 
       freelancer_email, cv_url, motivation_letter, years_of_experience, proposed_budget, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [milestone_id, project_id, freelancer_id, freelancer_name, freelancer_email,
       cv_url, motivation_letter, years_of_experience, proposed_budget]
    );
    
    return result.insertId;
  }

  async updateStatus(id, status) {
    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
    return true;
  }

  _formatApplications(applications) {
    return applications.map(app => {
      if (app.meet_link) {
        app.interview = {
          meetLink: app.meet_link,
          date: app.interview_date,
          time: app.interview_time,
          notes: app.notes,
          confirmedByFreelancer: app.confirmed_by_freelancer === 1,
          scheduledAt: app.interview_scheduled_at
        };
      }
      delete app.meet_link;
      delete app.interview_date;
      delete app.interview_time;
      delete app.confirmed_by_freelancer;
      delete app.interview_scheduled_at;
      return app;
    });
  }
}

export default new ApplicationRepository();
