import express from 'express';
import { configController } from '../controllers/configController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Phases
router.get('/phases', authenticate, configController.getPhases);
router.post('/phases', authenticate, authorize('admin'), configController.createPhase);
router.put('/phases/:id', authenticate, authorize('admin'), configController.updatePhase);
router.delete('/phases/:id', authenticate, authorize('admin'), configController.deletePhase);

// Tasks
router.get('/tasks', authenticate, configController.getTasks);
router.post('/tasks', authenticate, authorize('admin'), configController.createTask);
router.put('/tasks/:id', authenticate, authorize('admin'), configController.updateTask);
router.delete('/tasks/:id', authenticate, authorize('admin'), configController.deleteTask);

export default router;

