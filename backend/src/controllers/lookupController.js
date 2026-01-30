import { Complexity, Status, Tag, Holiday } from '../models/index.js';

/**
 * Sync holidays from external API to database
 */
export const syncHolidays = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();
        console.log(`[LookupController] Syncing holidays for ${year}...`);

        const response = await fetch(`https://api-harilibur.vercel.app/api?year=${year}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch from external API: ${response.status}`);
        }

        const data = await response.json();

        const count = { national: 0, skipped: 0 };

        for (const item of data) {
            if (item.is_national_holiday) {
                const date = new Date(item.holiday_date).toISOString().split('T')[0];
                const id = `hd_${year}_${date.replace(/-/g, '')}`;

                const [holiday, created] = await Holiday.findOrCreate({
                    where: { id },
                    defaults: {
                        id,
                        date,
                        name: item.holiday_name,
                        type: 'national',
                        year: parseInt(year)
                    }
                });

                if (created) count.national++;
                else count.skipped++;
            }
        }

        res.json({
            message: `Holidays synced for ${year}`,
            added: count.national,
            skipped: count.skipped
        });
    } catch (error) {
        console.error('[LookupController] Sync error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/lookups/holidays
 */
export const getHolidays = async (req, res) => {
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
};

/**
 * POST /api/lookups/holidays
 */
export const createHoliday = async (req, res) => {
    try {
        const item = await Holiday.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * PUT /api/lookups/holidays/:id
 */
export const updateHoliday = async (req, res) => {
    try {
        const item = await Holiday.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Holiday not found' });

        await item.update(req.body);
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * DELETE /api/lookups/holidays/:id
 */
export const deleteHoliday = async (req, res) => {
    try {
        const item = await Holiday.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: 'Holiday not found' });

        await item.destroy();
        res.json({ message: 'Holiday deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
