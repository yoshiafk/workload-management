export const createCRUDController = (Model, options = {}) => {
    const { include = [], searchFields = [] } = options;

    return {
        // Create
        create: async (req, res) => {
            try {
                const item = await Model.create(req.body);
                res.status(201).json(item);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        },

        // Get All
        getAll: async (req, res) => {
            try {
                const { page = 1, limit = 10, ...filters } = req.query;
                const offset = (page - 1) * limit;

                // Build where clause from filters
                const where = {};
                Object.keys(filters).forEach(key => {
                    if (filters[key]) where[key] = filters[key];
                });

                const { count, rows } = await Model.findAndCountAll({
                    where,
                    include,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    order: [['createdAt', 'DESC']]
                });

                res.json({
                    items: rows,
                    total: count,
                    pages: Math.ceil(count / limit),
                    currentPage: parseInt(page)
                });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        },

        // Get One
        getOne: async (req, res) => {
            try {
                const item = await Model.findByPk(req.params.id, { include });
                if (!item) return res.status(404).json({ message: 'Not found' });
                res.json(item);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        },

        // Update
        update: async (req, res) => {
            try {
                const item = await Model.findByPk(req.params.id);
                if (!item) return res.status(404).json({ message: 'Not found' });
                await item.update(req.body);
                res.json(item);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        },

        // Delete
        delete: async (req, res) => {
            try {
                const item = await Model.findByPk(req.params.id);
                if (!item) return res.status(404).json({ message: 'Not found' });
                await item.destroy();
                res.json({ message: 'Deleted successfully' });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }
    };
};
