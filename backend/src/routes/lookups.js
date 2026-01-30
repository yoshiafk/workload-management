import express from 'express';
import { Complexity, Status, Tag } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import * as lookupController from '../controllers/lookupController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/lookups/complexity
 */
router.get('/complexity', async (req, res) => {
    try {
        const items = await Complexity.findAll({ order: [['sortOrder', 'ASC']] });
        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * PUT /api/lookups/complexity/:level
 */
router.put('/complexity/:level', authorize('admin'), async (req, res) => {
    try {
        const item = await Complexity.findByPk(req.params.level);
        if (!item) return res.status(404).json({ message: 'Complexity level not found' });

        await item.update(req.body);
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * GET /api/lookups/statuses
 */
router.get('/statuses', async (req, res) => {
    try {
        const items = await Status.findAll({ order: [['sortOrder', 'ASC']] });
        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/lookups/tags
 */
router.get('/tags', async (req, res) => {
    try {
        const items = await Tag.findAll({ order: [['name', 'ASC']] });
        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Holiday Routes
router.get('/holidays', lookupController.getHolidays);
router.post('/holidays/sync', authorize('admin'), lookupController.syncHolidays);
router.post('/holidays', authorize('admin'), lookupController.createHoliday);
router.put('/holidays/:id', authorize('admin'), lookupController.updateHoliday);
router.delete('/holidays/:id', authorize('admin'), lookupController.deleteHoliday);

export default router;
