import express from 'express';
import { Cost } from '../models/index.js';
import { createCRUDController } from '../services/crudFactory.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const costController = createCRUDController(Cost, {
    include: ['account'],
    searchFields: ['resourceName', 'roleType']
});

// Routes
router.get('/', authenticate, costController.getAll);
router.get('/:id', authenticate, costController.getOne);
router.post('/', authenticate, authorize('admin'), costController.create);
router.put('/:id', authenticate, authorize('admin'), costController.update);
router.delete('/:id', authenticate, authorize('admin'), costController.delete);

export default router;
