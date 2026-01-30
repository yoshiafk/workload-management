import { sequelize } from '../models/index.js';
import { seedDatabase } from '../utils/seeder.js';

const seed = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();

        console.log('Synchronizing database schema (FORCE: TRUE)...');
        await sequelize.sync({ force: true });

        console.log('Running comprehensive seeder...');
        await seedDatabase();

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seed();

