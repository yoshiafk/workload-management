import express from 'express';
import { Phase, TaskTemplate } from '../models/index.js';
import { createCRUDController } from '../services/crudFactory.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Phases
const phaseController = createCRUDController(Phase, { include: ['tasks'] });
router.get('/phases', authenticate, phaseController.getAll);
router.post('/phases', authenticate, authorize('admin'), phaseController.create);
router.put('/phases/:id', authenticate, authorize('admin'), phaseController.update);
router.delete('/phases/:id', authenticate, authorize('admin'), phaseController.delete);

// Tasks
const taskController = createCRUDController(TaskTemplate, { include: ['phase'] });
router.get('/tasks', authenticate, taskController.getAll);
router.post('/tasks', authenticate, authorize('admin'), taskController.create);
router.put('/tasks/:id', authenticate, authorize('admin'), taskController.update);
router.delete('/tasks/:id', authenticate, authorize('admin'), taskController.delete);

export default router;
