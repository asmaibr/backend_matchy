import pool from '../config/database.js';
import crypto from 'crypto';

class AuthRepository {
  // Hash password using SHA-256 (simple hashing - in production use bcrypt)
  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // Create new user
  async createUser(userData) {
    const { firstName, lastName, email, password, role, status, location, skills, bio } = userData;
    const hashedPassword = this.hashPassword(password);
    
    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role, status, location, skills, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword, role, status || 'ACTIVE', location, skills, bio]
    );
    
    return result.insertId;
  }

  // Find user by email
  async findByEmail(email) {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users[0] || null;
  }

  // Find user by ID
  async findById(id) {
    const [users] = await pool.query(
      'SELECT id, first_name, last_name, email, role, status, location, skills, bio, created_at FROM users WHERE id = ?',
      [id]
    );
    return users[0] || null;
  }

  // Verify password
  verifyPassword(password, hashedPassword) {
    return this.hashPassword(password) === hashedPassword;
  }

  // Update user
  async updateUser(id, updates) {
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'password') {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(id);
    await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return true;
  }

  // Create session token
  async createSession(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await pool.query(
      'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
    
    return token;
  }

  // Verify session token
  async verifySession(token) {
    const [sessions] = await pool.query(
      `SELECT s.*, u.id, u.first_name, u.last_name, u.email, u.role, u.status 
       FROM user_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = ? AND s.expires_at > NOW()`,
      [token]
    );
    
    return sessions[0] || null;
  }

  // Delete session
  async deleteSession(token) {
    await pool.query('DELETE FROM user_sessions WHERE token = ?', [token]);
  }
}

export default new AuthRepository();
