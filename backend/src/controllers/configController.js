import { Phase, TaskTemplate, TaskEstimate } from '../models/index.js';

/**
 * Transform TaskEstimate rows to nested estimates object
 * From: [{ complexityLevel: 'low', days: 2, hours: 4 }, ...]
 * To: { low: { days: 2, hours: 4 }, ... }
 */
const transformEstimates = (estimates) => {
    if (!estimates || !Array.isArray(estimates)) return {};

    return estimates.reduce((acc, est) => {
        acc[est.complexityLevel] = {
            days: parseFloat(est.days) || 0,
            hours: parseFloat(est.hours) || 0
        };
        return acc;
    }, {});
};

/**
 * Transform task to include nested estimates object
 */
const transformTask = (task) => {
    const plainTask = task.toJSON ? task.toJSON() : task;
    return {
        ...plainTask,
        estimates: transformEstimates(plainTask.estimates)
    };
};

export const configController = {
    // Get all phases with their associated tasks
    getPhases: async (req, res) => {
        try {
            const { page = 1, limit = 100 } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows } = await Phase.findAndCountAll({
                include: [{
                    model: TaskTemplate,
                    as: 'tasks',
                    attributes: ['id', 'name', 'category']
                }],
                order: [['sortOrder', 'ASC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                items: rows,
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            console.error('Error fetching phases:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Get all tasks with their associated estimates (transformed)
    getTasks: async (req, res) => {
        try {
            const { page = 1, limit = 100, phaseId } = req.query;
            const offset = (page - 1) * limit;

            const where = {};
            if (phaseId) where.phaseId = phaseId;

            const { count, rows } = await TaskTemplate.findAndCountAll({
                where,
                include: [
                    {
                        model: Phase,
                        as: 'phase',
                        attributes: ['id', 'name', 'category']
                    },
                    {
                        model: TaskEstimate,
                        as: 'estimates'
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            // Transform estimates to nested object format
            const transformedTasks = rows.map(transformTask);

            res.json({
                items: transformedTasks,
                total: count,
                pages: Math.ceil(count / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            console.error('Error fetching tasks:', error);
            res.status(500).json({ message: error.message });
        }
    },

    // Create phase
    createPhase: async (req, res) => {
        try {
            const phase = await Phase.create(req.body);
            res.status(201).json(phase);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Update phase
    updatePhase: async (req, res) => {
        try {
            const phase = await Phase.findByPk(req.params.id);
            if (!phase) return res.status(404).json({ message: 'Phase not found' });

            await phase.update(req.body);
            res.json(phase);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Delete phase
    deletePhase: async (req, res) => {
        try {
            const phase = await Phase.findByPk(req.params.id);
            if (!phase) return res.status(404).json({ message: 'Phase not found' });

            await phase.destroy();
            res.json({ message: 'Phase deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Create task with estimates
    createTask: async (req, res) => {
        try {
            const { estimates, ...taskData } = req.body;

            // Create the task
            const task = await TaskTemplate.create(taskData);

            // Create estimates if provided
            if (estimates && typeof estimates === 'object') {
                const estimatePromises = Object.entries(estimates).map(([level, data]) =>
                    TaskEstimate.create({
                        taskTemplateId: task.id,
                        complexityLevel: level,
                        days: data.days || 0,
                        hours: data.hours || 0
                    })
                );
                await Promise.all(estimatePromises);
            }

            // Fetch task with estimates for response
            const fullTask = await TaskTemplate.findByPk(task.id, {
                include: [
                    { model: Phase, as: 'phase', attributes: ['id', 'name', 'category'] },
                    { model: TaskEstimate, as: 'estimates' }
                ]
            });

            res.status(201).json(transformTask(fullTask));
        } catch (error) {
            console.error('Error creating task:', error);
            res.status(400).json({ message: error.message });
        }
    },

    // Update task with estimates
    updateTask: async (req, res) => {
        try {
            const { estimates, ...taskData } = req.body;

            const task = await TaskTemplate.findByPk(req.params.id);
            if (!task) return res.status(404).json({ message: 'Task not found' });

            // Update task fields
            await task.update(taskData);

            // Update estimates if provided
            if (estimates && typeof estimates === 'object') {
                for (const [level, data] of Object.entries(estimates)) {
                    await TaskEstimate.upsert({
                        taskTemplateId: task.id,
                        complexityLevel: level,
                        days: data.days || 0,
                        hours: data.hours || 0
                    });
                }
            }

            // Fetch updated task with estimates
            const fullTask = await TaskTemplate.findByPk(task.id, {
                include: [
                    { model: Phase, as: 'phase', attributes: ['id', 'name', 'category'] },
                    { model: TaskEstimate, as: 'estimates' }
                ]
            });

            res.json(transformTask(fullTask));
        } catch (error) {
            console.error('Error updating task:', error);
            res.status(400).json({ message: error.message });
        }
    },

    // Delete task (cascades to estimates)
    deleteTask: async (req, res) => {
        try {
            const task = await TaskTemplate.findByPk(req.params.id);
            if (!task) return res.status(404).json({ message: 'Task not found' });

            // Delete associated estimates first
            await TaskEstimate.destroy({ where: { taskTemplateId: task.id } });

            // Delete the task
            await task.destroy();
            res.json({ message: 'Task deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default configController;
