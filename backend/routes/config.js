const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

// Phases
router.get('/phases', protect, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM phases ORDER BY "order" ASC');
        res.json({ items: result.rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/phases', protect, adminOnly, async (req, res) => {
    const { name, color, order } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO phases (name, color, "order") VALUES ($1, $2, $3) RETURNING *',
            [name, color, order]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/phases/:id', protect, adminOnly, async (req, res) => {
    const { name, color, order } = req.body;
    try {
        const result = await pool.query(
            'UPDATE phases SET name = $1, color = $2, "order" = $3, "updated_at" = NOW() WHERE id = $4 RETURNING *',
            [name, color, order, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/phases/:id', protect, adminOnly, async (req, res) => {
    try {
        await pool.query('DELETE FROM phases WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Tasks
router.get('/tasks', protect, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY phase_id, name');
        res.json({ items: result.rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/tasks', protect, adminOnly, async (req, res) => {
    const { phaseId, name, complexity_impact, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (phase_id, name, complexity_impact, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [phaseId, name, complexity_impact, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
