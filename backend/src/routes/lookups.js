import express from 'express';
import { Complexity, Status, Tag, Holiday } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/lookups/complexity
 * Get all complexity levels
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
 * GET /api/lookups/statuses
 * Get all task statuses
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
 * Get all tags
 */
router.get('/tags', async (req, res) => {
    try {
        const items = await Tag.findAll({ order: [['name', 'ASC']] });
        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/lookups/holidays
 * Get holidays, optionally filtered by year
 */
router.get('/holidays', async (req, res) => {
    try {
        const { year, type } = req.query;
        const where = {};

        if (year) where.year = parseInt(year);
        if (type) where.type = type;

        const items = await Holiday.findAll({
            where,
            order: [['date', 'ASC']]
        });
        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
