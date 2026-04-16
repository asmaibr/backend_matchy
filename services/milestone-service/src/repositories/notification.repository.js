import pool from '../config/database.js';

class NotificationRepository {
  async findAll(limit = 500) {
    const [notifications] = await pool.query(
      `SELECT * FROM notifications 
       ORDER BY created_at DESC
       LIMIT ?`,
      [limit]
    );
    return notifications;
  }

  async create(notificationData) {
    const { user_id, user_type, type, title, message, link, application_id } = notificationData;
    
    const [result] = await pool.query(
      `INSERT INTO notifications (user_id, user_type, type, title, message, link, application_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, user_type, type, title, message, link, application_id || null]
    );
    
    return result.insertId;
  }

  async findByUser(userId, userType, limit = 50) {
    const [notifications] = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? AND user_type = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [userId, userType, limit]
    );
    return notifications;
  }

  async getUnreadCount(userId, userType) {
    const [result] = await pool.query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = ? AND user_type = ? AND is_read = FALSE`,
      [userId, userType]
    );
    return result[0].count;
  }

  async markAsRead(id) {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    return true;
  }

  async markAllAsRead(userId, userType) {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND user_type = ?',
      [userId, userType]
    );
    return true;
  }

  async delete(id) {
    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
    return true;
  }
}

export default new NotificationRepository();
