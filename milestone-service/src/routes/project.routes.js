import express from 'express';
import projectController from '../controllers/project.controller.js';

const router = express.Router();

router.get('/', projectController.getAllProjects.bind(projectController));
router.get('/:id', projectController.getProjectById.bind(projectController));
router.post('/', projectController.createProject.bind(projectController));
router.put('/:id', projectController.updateProject.bind(projectController));
router.delete('/:id', projectController.deleteProject.bind(projectController));
router.post('/:id/increment-clicks', projectController.incrementClickCount.bind(projectController));

export default router;
