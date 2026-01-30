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

// Member-specific: Update task status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, progress } = req.body;

        const allocation = await Allocation.findByPk(id);
        if (!allocation) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Validate ownership
        if (allocation.memberId !== req.user.memberId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to update this task' });
        }

        allocation.status = status || allocation.status;
        if (progress !== undefined) {
            allocation.progress = progress;
        }
        allocation.statusUpdatedAt = new Date();

        await allocation.save();

        res.json(allocation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin-specific: Task statistics
router.get('/admin/stats', authorize('admin'), async (req, res) => {
    try {
        const allocations = await Allocation.findAll();
        
        const stats = {
            total: allocations.length,
            byStatus: allocations.reduce((acc, curr) => {
                const status = curr.status || 'open';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {}),
            avgProgress: allocations.length > 0
                ? (allocations.reduce((sum, a) => sum + (a.progress || 0), 0) / allocations.length).toFixed(1)
                : 0
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
