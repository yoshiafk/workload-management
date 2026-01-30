import express from 'express';
import { Setting } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/settings
 * Get all settings
 */
router.get('/', async (req, res) => {
    try {
        const settings = await Setting.findAll();
        // Transform to key-value object for frontend convenience
        const settingsMap = settings.reduce((acc, output) => {
            acc[output.key] = output.value;
            return acc;
        }, {});
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/settings/:key
 * Get specific setting
 */
router.get('/:key', async (req, res) => {
    try {
        const setting = await Setting.findByPk(req.params.key);
        if (!setting) return res.status(404).json({ message: 'Setting not found' });
        res.json(setting.value);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * PUT /api/settings/:key
 * Update or create specific setting
 */
router.put('/:key', authorize('admin'), async (req, res) => {
    try {
        const { key } = req.params;
        const value = req.body;

        const [setting, created] = await Setting.findOrCreate({
            where: { key },
            defaults: {
                value,
                updatedBy: req.user?.email || req.user?.username || 'system'
            }
        });

        if (!created) {
            await setting.update({
                value,
                updatedBy: req.user?.email || req.user?.username || 'system'
            });
        }

        res.json(setting.value);
    } catch (error) {
        console.error(`[Settings] Error updating ${req.params.key}:`, error);
        res.status(500).json({
            message: 'Failed to update setting',
            error: error.message
        });
    }
});

export default router;
