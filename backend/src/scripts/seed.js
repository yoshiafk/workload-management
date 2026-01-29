import {
    sequelize,
    User,
    Member,
    Phase,
    TaskTemplate,
    CostCenter,
    COA
} from '../models/index.js';
import bcrypt from 'bcryptjs';

const seed = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();

        console.log('Synchronizing database schema...');
        await sequelize.sync({ force: true }); // WARNING: This drops tables!

        console.log('Seeding data...');

        // 1. Create Default Phases & Tasks
        const discovery = await Phase.create({ name: 'Discovery', description: 'Project initial exploration' });
        const design = await Phase.create({ name: 'Design', description: 'System design and architecture' });
        const build = await Phase.create({ name: 'Build', description: 'Software development phase' });

        await TaskTemplate.create({ name: 'Requirement Gathering', phaseId: discovery.id });
        await TaskTemplate.create({ name: 'UI/UX Mockups', phaseId: design.id });
        await TaskTemplate.create({ name: 'Backend Implementation', phaseId: build.id });
        await TaskTemplate.create({ name: 'Frontend Implementation', phaseId: build.id });

        // 2. Create Sample Team Members
        const adminMember = await Member.create({
            name: 'System Admin',
            type: 'Manager',
            email: 'admin@example.com',
            isActive: true,
            maxHoursPerWeek: 40
        });

        const devMember = await Member.create({
            name: 'John Doe',
            type: 'Senior Developer',
            email: 'john@example.com',
            isActive: true,
            maxHoursPerWeek: 40
        });

        // 3. Create Users (Auth)
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const devPassword = await bcrypt.hash('user123', salt);

        await User.create({
            email: 'admin@example.com',
            password: adminPassword,
            role: 'admin',
            memberId: adminMember.id
        });

        await User.create({
            email: 'john@example.com',
            password: devPassword,
            role: 'member',
            memberId: devMember.id
        });

        // 4. Create Financial Entities
        await COA.create({ code: '5001', name: 'Software Licenses', category: 'Expense' });
        await COA.create({ code: '5002', name: 'Server Hosting', category: 'Expense' });

        await CostCenter.create({
            code: 'CC001',
            name: 'IT Department',
            managerId: adminMember.id
        });

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seed();
