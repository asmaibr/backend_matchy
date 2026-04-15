import pool from '../config/database.js';

class InterviewRepository {
  async findByApplicationId(applicationId) {
    const [interviews] = await pool.query(
      'SELECT * FROM interviews WHERE application_id = ?',
      [applicationId]
    );
    return interviews[0] || null;
  }

  async create(applicationId, interviewData) {
    const { meet_link, interview_date, interview_time, notes } = interviewData;
    
    const [result] = await pool.query(
      `INSERT INTO interviews (application_id, meet_link, interview_date, interview_time, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [applicationId, meet_link, interview_date, interview_time, notes]
    );
    
    return result.insertId;
  }

  async update(applicationId, interviewData) {
    const { meet_link, interview_date, interview_time, notes } = interviewData;
    
    await pool.query(
      `UPDATE interviews SET meet_link = ?, interview_date = ?, interview_time = ?, notes = ? 
       WHERE application_id = ?`,
      [meet_link, interview_date, interview_time, notes, applicationId]
    );
    
    return true;
  }

  async confirmByFreelancer(applicationId) {
    await pool.query(
      'UPDATE interviews SET confirmed_by_freelancer = TRUE WHERE application_id = ?',
      [applicationId]
    );
    return true;
  }
}

export default new InterviewRepository();
