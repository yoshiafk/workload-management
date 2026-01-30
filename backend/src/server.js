import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { sequelize } from './models/index.js';
import authRoutes from './routes/auth.js';
import seedRoutes from './routes/seed.js';
import memberRoutes from './routes/members.js';
import allocationRoutes from './routes/allocations.js';
import configRoutes from './routes/config.js';
import financeRoutes from './routes/finance.js';
import roleRoutes from './routes/roles.js';
import lookupRoutes from './routes/lookups.js';
import leaveRoutes from './routes/leaves.js';
import adminLeaveRoutes from './routes/adminLeaves.js';
import timesheetRoutes from './routes/timesheetRoutes.js';
import costsRoutes from './routes/costs.js';
import settingsRoutes from './routes/settings.js';

import { seedDatabase } from './utils/seeder.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api', configRoutes); // phases and tasks
app.use('/api/finance', financeRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/lookups', lookupRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/admin/leaves', adminLeaveRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/costs', costsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        // Sync models (in dev, use alter:true to update schema without dropping)
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        console.log('Database synchronized');

        // Automatic Seeding
        await seedDatabase();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

startServer();

export default app;
