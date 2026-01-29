import express from 'express';
import { Allocation } from '../models/index.js';
import { createCRUDController } from '../services/crudFactory.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const controller = createCRUDController(Allocation, {
    include: ['member', 'phase', 'task']
});

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);

// Admins can manage all allocations
// Members could potentially manage their own, but for now we follow the admin-driven model
router.post('/', authorize('admin'), controller.create);
router.put('/:id', authorize('admin'), controller.update);
router.delete('/:id', authorize('admin'), controller.delete);

// Member-specific: Get my own allocations
router.get('/my/tasks', async (req, res) => {
    try {
        if (!req.user.memberId) {
            return res.json({ items: [], total: 0 });
        }
        const allocations = await Allocation.findAll({
            where: { memberId: req.user.memberId },
            include: ['phase', 'task']
        });
        res.json({ items: allocations, total: allocations.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
