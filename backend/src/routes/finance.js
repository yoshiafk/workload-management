import express from 'express';
import { CostCenter, COA } from '../models/index.js';
import { createCRUDController } from '../services/crudFactory.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Cost Centers
const ccController = createCRUDController(CostCenter, { include: ['managerRef', 'parent', 'children'] });
router.get('/cost-centers', authenticate, ccController.getAll);
router.post('/cost-centers', authenticate, authorize('admin'), ccController.create);
router.put('/cost-centers/:id', authenticate, authorize('admin'), ccController.update);
router.delete('/cost-centers/:id', authenticate, authorize('admin'), ccController.delete);

// COA
const coaController = createCRUDController(COA);
router.get('/coa', authenticate, coaController.getAll);
router.post('/coa', authenticate, authorize('admin'), coaController.create);
router.put('/coa/:id', authenticate, authorize('admin'), coaController.update);
router.delete('/coa/:id', authenticate, authorize('admin'), coaController.delete);

export default router;
