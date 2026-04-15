import pool from '../config/database.js';

class ProjectRepository {
  async findAll() {
    const [projects] = await pool.query(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM applications WHERE project_id = p.id) as applications_count
      FROM projects p
      ORDER BY p.created_at DESC
    `);
    return projects;
  }

  async findById(id) {
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    return projects[0] || null;
  }

  async create(projectData) {
    const { company_name, project_title, description, details_of_work, number_of_people_demanded, 
            budget, currency, category, status, skills, location, deadline } = projectData;
    
    const [result] = await pool.query(
      `INSERT INTO projects (company_name, project_title, description, details_of_work, 
       number_of_people_demanded, budget, currency, category, status, skills, location, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, project_title, description, details_of_work, number_of_people_demanded,
       budget, currency, category, status || 'open', JSON.stringify(skills || []), location, deadline]
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
      `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );
    
    return true;
  }

  async delete(id) {
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    return true;
  }

  async incrementClickCount(id) {
    await pool.query('UPDATE projects SET click_count = click_count + 1 WHERE id = ?', [id]);
    return true;
  }
}

export default new ProjectRepository();
