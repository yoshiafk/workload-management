import express from 'express';
import { RoleType, RoleTier } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/roles
 * Get all role types with their tiers
 */
router.get('/', async (req, res) => {
    try {
        const roles = await RoleType.findAll({
            include: [{ model: RoleTier, as: 'tiers', order: [['level', 'ASC']] }],
            order: [['name', 'ASC']]
        });
        res.json({ items: roles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/roles/:code
 * Get a specific role type with tiers
 */
router.get('/:code', async (req, res) => {
    try {
        const role = await RoleType.findByPk(req.params.code, {
            include: [{ model: RoleTier, as: 'tiers', order: [['level', 'ASC']] }]
        });
        if (!role) return res.status(404).json({ message: 'Role type not found' });
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
