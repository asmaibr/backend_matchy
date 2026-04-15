import express from 'express';
import milestoneController from '../controllers/milestone.controller.js';

const router = express.Router();

router.get('/', milestoneController.getAllMilestones.bind(milestoneController));
router.post('/', milestoneController.createMilestone.bind(milestoneController));
router.put('/:id', milestoneController.updateMilestone.bind(milestoneController));
router.delete('/:id', milestoneController.deleteMilestone.bind(milestoneController));

export default router;
