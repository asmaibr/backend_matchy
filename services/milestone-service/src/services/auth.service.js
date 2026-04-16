import authRepository from '../repositories/auth.repository.js';

class AuthService {
  async register(userData) {
    // Check if user already exists
    const existingUser = await authRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create user
    const userId = await authRepository.createUser(userData);
    
    // Get created user (without password)
    const user = await authRepository.findById(userId);
    
    return user;
  }

  async login(email, password) {
    // Find user
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = authRepository.verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new Error('Account is not active');
    }

    // Create session token
    const token = await authRepository.createSession(user.id);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token
    };
  }

  async logout(token) {
    await authRepository.deleteSession(token);
  }

  async verifyToken(token) {
    const session = await authRepository.verifySession(token);
    if (!session) {
      throw new Error('Invalid or expired token');
    }

    return {
      id: session.id,
      first_name: session.first_name,
      last_name: session.last_name,
      email: session.email,
      role: session.role,
      status: session.status
    };
  }

  async getUserById(id) {
    return await authRepository.findById(id);
  }

  async updateUser(id, updates) {
    return await authRepository.updateUser(id, updates);
  }
}

export default new AuthService();
