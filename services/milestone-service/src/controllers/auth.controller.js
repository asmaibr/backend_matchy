import authService from '../services/auth.service.js';

class AuthController {
  async register(req, res) {
    try {
      const { firstName, lastName, email, password, role, location, skills, bio } = req.body;

      // Basic validation
      if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({ 
          error: 'Missing required fields: firstName, lastName, email, password, role' 
        });
      }

      // Validate role
      if (!['CLIENT', 'FREELANCER', 'ADMIN'].includes(role)) {
        return res.status(400).json({ 
          error: 'Invalid role. Must be CLIENT, FREELANCER, or ADMIN' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const user = await authService.register({
        firstName,
        lastName,
        email,
        password,
        role,
        status: 'ACTIVE',
        location: location || null,
        skills: skills || null,
        bio: bio || null
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }

      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(400).json({ error: 'No token provided' });
      }

      await authService.logout(token);

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(400).json({ error: 'No token provided' });
      }

      const user = await authService.verifyToken(token);

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.params.id;
      const user = await authService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.params.id;
      const updates = req.body;

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updates.password;
      delete updates.role;
      delete updates.email;

      await authService.updateUser(userId, updates);

      const updatedUser = await authService.getUserById(userId);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

export default new AuthController();
