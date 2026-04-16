import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, email, role, first_name, last_name, status, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query(`
      SELECT id, email, role, first_name, last_name, status, created_at, location, skills, bio
      FROM users 
      WHERE id = ?
    `, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get users by role
router.get('/role/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const [users] = await pool.query(`
      SELECT id, email, role, first_name, last_name, status, created_at 
      FROM users 
      WHERE role = ?
      ORDER BY created_at DESC
    `, [role]);
    res.json(users);
  } catch (error) {
    console.error('Error getting users by role:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', async (req, res) => {
  try {
    // Get total users count
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    
    // Get users by role
    const [freelancers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "FREELANCER"');
    const [clients] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "CLIENT"');
    const [admins] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "ADMIN"');
    
    // Get active users (logged in within last 30 days)
    const [activeUsers] = await pool.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE status = 'ACTIVE' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    // Get new users this month
    const [newUsers] = await pool.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
    `);

    res.json({
      totalUsers: totalUsers[0].count,
      freelancers: freelancers[0].count,
      clients: clients[0].count,
      admins: admins[0].count,
      activeUsers: activeUsers[0].count,
      newUsersThisMonth: newUsers[0].count
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
