import express from 'express';
import { User } from '../models/index.js';

const router = express.Router();

router.post('/seed-admin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // This is a temporary route to seed the first admin
        // In production, this should be disabled or protected
        const existingAdmin = await User.findOne({ where: { role: 'admin' } });
        if (existingAdmin && process.env.NODE_ENV !== 'development') {
            return res.status(403).json({ message: 'Admin already exists' });
        }

        const user = await User.create({
            email,
            password,
            role: 'admin'
        });

        res.status(201).json({
            message: 'Admin user created successfully',
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
