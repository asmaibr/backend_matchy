import express from 'express';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/verify', authController.verifyToken.bind(authController));

// Protected routes
router.get('/profile/:id', authController.getProfile.bind(authController));
router.put('/profile/:id', authController.updateProfile.bind(authController));

export default router;
