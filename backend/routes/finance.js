const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect, adminOnly } = require('../middleware/auth');

// Cost Centers
router.get('/cost-centers', protect, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cost_centers ORDER BY code');
        res.json({ items: result.rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/cost-centers', protect, adminOnly, async (req, res) => {
    const { code, name, description, manager, monthly_budget, yearly_budget } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO cost_centers (code, name, description, manager, monthly_budget, yearly_budget) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [code, name, description, manager, monthly_budget, yearly_budget]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// COA
router.get('/coa', protect, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM coa ORDER BY code');
        res.json({ items: result.rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/coa', protect, adminOnly, async (req, res) => {
    const { code, name, description, category } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO coa (code, name, description, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [code, name, description, category]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
