import express from 'express';
import { Member } from '../models/index.js';
import { createCRUDController } from '../services/crudFactory.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const controller = createCRUDController(Member);

// All routes require authentication
router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);

// Only admins can modify members
router.post('/', authorize('admin'), controller.create);
router.put('/:id', authorize('admin'), controller.update);
router.delete('/:id', authorize('admin'), controller.delete);

export default router;
