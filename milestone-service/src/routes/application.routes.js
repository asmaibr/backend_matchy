import express from 'express';
import applicationController from '../controllers/application.controller.js';

const router = express.Router();

router.post('/', applicationController.submitApplication.bind(applicationController));
router.put('/:id/status', applicationController.updateApplicationStatus.bind(applicationController));
router.post('/:id/interview', applicationController.scheduleInterview.bind(applicationController));
router.post('/:id/confirm-interview', applicationController.confirmInterview.bind(applicationController));

export default router;
