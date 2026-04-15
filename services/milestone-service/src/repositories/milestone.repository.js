import pool from '../config/database.js';

class MilestoneRepository {
  async findAll() {
    const [milestones] = await pool.query(`
      SELECT m.*,
        (SELECT COUNT(*) FROM applications WHERE milestone_id = m.id) as applications_count
      FROM milestones m
      ORDER BY m.created_at DESC
    `);
    return milestones;
  }

  async findByProjectId(projectId) {
    const [milestones] = await pool.query(`
      SELECT m.*,
        (SELECT COUNT(*) FROM applications WHERE milestone_id = m.id) as applications_count
      FROM milestones m
      WHERE m.project_id = ?
      ORDER BY m.created_at DESC
    `, [projectId]);
    return milestones;
  }

  async findById(id) {
    const [milestones] = await pool.query('SELECT * FROM milestones WHERE id = ?', [id]);
    return milestones[0] || null;
  }

  async create(milestoneData) {
    const { project_id, title, description, skills, budget, currency, duration, status } = milestoneData;
    
    const [result] = await pool.query(
      `INSERT INTO milestones (project_id, title, description, skills, budget, currency, duration, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [project_id, title, description, JSON.stringify(skills || []), budget, currency, duration, status || 'open']
    );
    
    return result.insertId;
  }

  async update(id, updates) {
    const updateFields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key === 'skills') {
        updateFields.push(`${key} = ?`);
        values.push(JSON.stringify(updates[key]));
      } else {
        updateFields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    values.push(id);
    
    await pool.query(
      `UPDATE milestones SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    
    return true;
  }

  async delete(id) {
    await pool.query('DELETE FROM milestones WHERE id = ?', [id]);
    return true;
  }
}

export default new MilestoneRepository();
