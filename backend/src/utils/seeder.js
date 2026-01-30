import {
    User,
    Member,
    Phase,
    TaskTemplate,
    TaskEstimate,
    CostCenter,
    COA,
    RoleType,
    RoleTier,
    Complexity,
    Status,
    Tag,
    Holiday,
    LeaveType,
    LeaveBalance,
    TimeEntry,
    TimesheetPeriod
} from '../models/index.js';
import { startOfWeek, endOfWeek, format } from 'date-fns';

/**
 * Comprehensive database seeder
 * Idempotently seeds all lookup data and sample records
 */
export const seedDatabase = async () => {
    try {
        console.log('[Seeder] Starting database seed...');

        // ========================================
        // 1. ROLE TYPES & TIERS
        // ========================================
        console.log('[Seeder] Seeding RoleTypes and RoleTiers...');

        const roleTypesData = [
            { code: 'FULLSTACK', name: 'Fullstack Engineer', description: 'Full-stack web and application development', hasCostTracking: true },
            { code: 'DEVOPS', name: 'DevOps Engineer', description: 'CI/CD, infrastructure automation, and deployment', hasCostTracking: true },
            { code: 'FINOPS', name: 'FinOps Engineer', description: 'Cloud cost management and optimization', hasCostTracking: true },
            { code: 'ARCHITECT', name: 'Solution Architect', description: 'System design and technical architecture', hasCostTracking: true },
            { code: 'CLOUD', name: 'Cloud Engineer', description: 'Cloud infrastructure and services management', hasCostTracking: true },
            { code: 'DBA', name: 'Database Administrator', description: 'Database management, optimization, and maintenance', hasCostTracking: true },
            { code: 'APPSUPPORT', name: 'Application Support', description: 'Application monitoring, troubleshooting, and user support', hasCostTracking: false },
            { code: 'HELPDESK', name: 'Helpdesk Management', description: 'IT helpdesk and end-user support coordination', hasCostTracking: false }
        ];

        for (const rt of roleTypesData) {
            await RoleType.findOrCreate({ where: { code: rt.code }, defaults: rt });
        }

        const roleTiersData = [
            // Fullstack
            { roleTypeCode: 'FULLSTACK', level: 1, name: 'Junior Fullstack', minCost: 8000000, midCost: 10000000, maxCost: 12000000 },
            { roleTypeCode: 'FULLSTACK', level: 2, name: 'Fullstack Engineer', minCost: 12000000, midCost: 14000000, maxCost: 16000000 },
            { roleTypeCode: 'FULLSTACK', level: 3, name: 'Senior Fullstack', minCost: 16000000, midCost: 18000000, maxCost: 20000000 },
            { roleTypeCode: 'FULLSTACK', level: 4, name: 'Lead Fullstack', minCost: 18000000, midCost: 20000000, maxCost: 22000000 },
            { roleTypeCode: 'FULLSTACK', level: 5, name: 'Principal Fullstack', minCost: 20000000, midCost: 22000000, maxCost: 25000000 },
            // DevOps
            { roleTypeCode: 'DEVOPS', level: 1, name: 'Junior DevOps', minCost: 10000000, midCost: 12000000, maxCost: 14000000 },
            { roleTypeCode: 'DEVOPS', level: 2, name: 'DevOps Engineer', minCost: 14000000, midCost: 16000000, maxCost: 18000000 },
            { roleTypeCode: 'DEVOPS', level: 3, name: 'Senior DevOps', minCost: 18000000, midCost: 20000000, maxCost: 22000000 },
            { roleTypeCode: 'DEVOPS', level: 4, name: 'Lead DevOps', minCost: 20000000, midCost: 23000000, maxCost: 25000000 },
            { roleTypeCode: 'DEVOPS', level: 5, name: 'Principal DevOps', minCost: 22000000, midCost: 25000000, maxCost: 28000000 },
            // FinOps
            { roleTypeCode: 'FINOPS', level: 1, name: 'Junior FinOps', minCost: 12000000, midCost: 14000000, maxCost: 16000000 },
            { roleTypeCode: 'FINOPS', level: 2, name: 'FinOps Engineer', minCost: 16000000, midCost: 18000000, maxCost: 20000000 },
            { roleTypeCode: 'FINOPS', level: 3, name: 'Senior FinOps', minCost: 18000000, midCost: 20000000, maxCost: 22000000 },
            { roleTypeCode: 'FINOPS', level: 4, name: 'Lead FinOps', minCost: 20000000, midCost: 22000000, maxCost: 24000000 },
            { roleTypeCode: 'FINOPS', level: 5, name: 'Principal FinOps', minCost: 22000000, midCost: 24000000, maxCost: 26000000 },
            // Architect
            { roleTypeCode: 'ARCHITECT', level: 1, name: 'Junior Architect', minCost: 25000000, midCost: 28000000, maxCost: 30000000 },
            { roleTypeCode: 'ARCHITECT', level: 2, name: 'Solution Architect', minCost: 30000000, midCost: 33000000, maxCost: 35000000 },
            { roleTypeCode: 'ARCHITECT', level: 3, name: 'Senior Architect', minCost: 35000000, midCost: 38000000, maxCost: 40000000 },
            { roleTypeCode: 'ARCHITECT', level: 4, name: 'Lead Architect', minCost: 38000000, midCost: 42000000, maxCost: 45000000 },
            { roleTypeCode: 'ARCHITECT', level: 5, name: 'Principal Architect', minCost: 42000000, midCost: 47000000, maxCost: 50000000 },
            // Cloud
            { roleTypeCode: 'CLOUD', level: 1, name: 'Junior Cloud Engineer', minCost: 15000000, midCost: 17000000, maxCost: 20000000 },
            { roleTypeCode: 'CLOUD', level: 2, name: 'Cloud Engineer', minCost: 20000000, midCost: 23000000, maxCost: 25000000 },
            { roleTypeCode: 'CLOUD', level: 3, name: 'Senior Cloud Engineer', minCost: 25000000, midCost: 28000000, maxCost: 30000000 },
            { roleTypeCode: 'CLOUD', level: 4, name: 'Lead Cloud Engineer', minCost: 28000000, midCost: 32000000, maxCost: 35000000 },
            { roleTypeCode: 'CLOUD', level: 5, name: 'Principal Cloud Engineer', minCost: 32000000, midCost: 37000000, maxCost: 40000000 },
            // DBA
            { roleTypeCode: 'DBA', level: 1, name: 'Junior DBA', minCost: 12000000, midCost: 14000000, maxCost: 16000000 },
            { roleTypeCode: 'DBA', level: 2, name: 'DBA', minCost: 16000000, midCost: 18000000, maxCost: 20000000 },
            { roleTypeCode: 'DBA', level: 3, name: 'Senior DBA', minCost: 20000000, midCost: 23000000, maxCost: 25000000 },
            { roleTypeCode: 'DBA', level: 4, name: 'Lead DBA', minCost: 24000000, midCost: 27000000, maxCost: 30000000 },
            { roleTypeCode: 'DBA', level: 5, name: 'Principal DBA', minCost: 28000000, midCost: 32000000, maxCost: 35000000 },
            // App Support
            { roleTypeCode: 'APPSUPPORT', level: 1, name: 'Junior App Support', minCost: 6000000, midCost: 7000000, maxCost: 8000000 },
            { roleTypeCode: 'APPSUPPORT', level: 2, name: 'App Support', minCost: 8000000, midCost: 9000000, maxCost: 10000000 },
            { roleTypeCode: 'APPSUPPORT', level: 3, name: 'Senior App Support', minCost: 10000000, midCost: 12000000, maxCost: 13000000 },
            { roleTypeCode: 'APPSUPPORT', level: 4, name: 'Lead App Support', minCost: 12000000, midCost: 14000000, maxCost: 15000000 },
            { roleTypeCode: 'APPSUPPORT', level: 5, name: 'Principal App Support', minCost: 14000000, midCost: 16000000, maxCost: 18000000 },
            // Helpdesk
            { roleTypeCode: 'HELPDESK', level: 1, name: 'Helpdesk Agent', minCost: 5000000, midCost: 6000000, maxCost: 7000000 },
            { roleTypeCode: 'HELPDESK', level: 2, name: 'Helpdesk Specialist', minCost: 7000000, midCost: 8000000, maxCost: 9000000 },
            { roleTypeCode: 'HELPDESK', level: 3, name: 'Senior Helpdesk', minCost: 9000000, midCost: 10000000, maxCost: 11000000 },
            { roleTypeCode: 'HELPDESK', level: 4, name: 'Helpdesk Supervisor', minCost: 10000000, midCost: 11000000, maxCost: 12000000 },
            { roleTypeCode: 'HELPDESK', level: 5, name: 'Helpdesk Manager', minCost: 11000000, midCost: 13000000, maxCost: 15000000 }
        ];

        for (const tier of roleTiersData) {
            await RoleTier.findOrCreate({
                where: { roleTypeCode: tier.roleTypeCode, level: tier.level },
                defaults: tier
            });
        }

        // ========================================
        // 2. COMPLEXITY LEVELS
        // ========================================
        console.log('[Seeder] Seeding Complexity levels...');

        const complexityData = [
            { level: 'trivial', label: 'Trivial', days: 1, hours: 4, workload: 0.5, color: '#d1d5db', description: 'Quick fixes, config changes, simple updates', sortOrder: 1 },
            { level: 'small', label: 'Small', days: 3, hours: 12, workload: 1.5, color: '#86efac', description: 'Minor features, straightforward changes', sortOrder: 2 },
            { level: 'low', label: 'Low', days: 8, hours: 32, workload: 4.0, color: '#10b981', description: 'Standard features with clear requirements', sortOrder: 3 },
            { level: 'medium', label: 'Medium', days: 20, hours: 80, workload: 10.0, color: '#3b82f6', description: 'Moderate complexity, some integration work', sortOrder: 4 },
            { level: 'high', label: 'High', days: 60, hours: 240, workload: 30.0, color: '#f59e0b', description: 'Complex features with significant integration', sortOrder: 5 },
            { level: 'sophisticated', label: 'Sophisticated', days: 180, hours: 720, workload: 90.0, color: '#ef4444', description: 'Highly complex, cross-cutting initiatives', sortOrder: 6 }
        ];

        for (const c of complexityData) {
            await Complexity.findOrCreate({ where: { level: c.level }, defaults: c });
        }

        // ========================================
        // 3. STATUSES
        // ========================================
        console.log('[Seeder] Seeding Statuses...');

        const statusData = [
            { id: 'open', name: 'Open', description: 'Task created but not started', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)', sortOrder: 1, isDefault: true },
            { id: 'in-progress', name: 'In Progress', description: 'Task is actively being worked on', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)', sortOrder: 2, isDefault: false },
            { id: 'under-review', name: 'Under Review', description: 'Task awaiting approval or testing', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', sortOrder: 3, isDefault: false },
            { id: 'completed', name: 'Completed', description: 'Task finished successfully', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)', sortOrder: 4, isDefault: false },
            { id: 'on-hold', name: 'On Hold', description: 'Task paused pending resolution', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', sortOrder: 5, isDefault: false }
        ];

        for (const s of statusData) {
            await Status.findOrCreate({ where: { id: s.id }, defaults: s });
        }

        // ========================================
        // 4. TAGS
        // ========================================
        console.log('[Seeder] Seeding Tags...');

        const tagData = [
            { id: 'ui-ux', name: 'UI/UX', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)' },
            { id: 'backend', name: 'Backend', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
            { id: 'database', name: 'Database', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
            { id: 'api', name: 'API', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
            { id: 'testing', name: 'Testing', color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.1)' },
            { id: 'documentation', name: 'Documentation', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
            { id: 'infrastructure', name: 'Infrastructure', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
            { id: 'security', name: 'Security', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.1)' }
        ];

        for (const t of tagData) {
            await Tag.findOrCreate({ where: { id: t.id }, defaults: t });
        }

        // ========================================
        // 5. PHASES
        // ========================================
        console.log('[Seeder] Seeding Phases...');

        const phaseData = [
            { name: 'Initiation', description: 'Project kickoff, charter, and stakeholder identification', category: 'Project', sortOrder: 1, isTerminal: false },
            { name: 'Planning', description: 'Requirements, design, and estimation', category: 'Project', sortOrder: 2, isTerminal: false },
            { name: 'Execution', description: 'Development, coding, and implementation', category: 'Project', sortOrder: 3, isTerminal: false },
            { name: 'Monitoring & Controlling', description: 'Testing, QA, and code review', category: 'Project', sortOrder: 4, isTerminal: false },
            { name: 'Closing', description: 'Deployment, handover, and documentation', category: 'Project', sortOrder: 5, isTerminal: false },
            { name: 'IT Operations & Support', description: 'Incident resolution, service requests, and monitoring', category: 'Support', sortOrder: 6, isTerminal: false },
            { name: 'Idle', description: 'No active work assigned', category: 'Terminal', sortOrder: 7, isTerminal: true },
            { name: 'Completed', description: 'Task finished and closed', category: 'Terminal', sortOrder: 8, isTerminal: true }
        ];

        const phaseMap = {};
        for (const p of phaseData) {
            const [phase] = await Phase.findOrCreate({ where: { name: p.name }, defaults: p });
            phaseMap[p.name] = phase.id;
        }

        // ========================================
        // 6. TASK TEMPLATES & ESTIMATES
        // ========================================
        console.log('[Seeder] Seeding TaskTemplates and TaskEstimates...');

        const taskTemplatesWithEstimates = [
            // Initiation Phase
            { name: 'Project Charter', phaseName: 'Initiation', category: 'Project', estimates: { trivial: { days: 1, hours: 0.1 }, small: { days: 1, hours: 0.3 }, low: { days: 1, hours: 0.8 }, medium: { days: 1, hours: 2 }, high: { days: 2, hours: 6 }, sophisticated: { days: 3, hours: 18 } } },
            { name: 'Stakeholder Analysis', phaseName: 'Initiation', category: 'Project', estimates: { trivial: { days: 1, hours: 0.1 }, small: { days: 1, hours: 0.3 }, low: { days: 1, hours: 0.8 }, medium: { days: 1, hours: 2 }, high: { days: 2, hours: 6 }, sophisticated: { days: 3, hours: 18 } } },
            // Planning Phase
            { name: 'Requirements Gathering', phaseName: 'Planning', category: 'Project', estimates: { trivial: { days: 1, hours: 0.2 }, small: { days: 1, hours: 0.6 }, low: { days: 2, hours: 1.6 }, medium: { days: 2, hours: 4 }, high: { days: 5, hours: 12 }, sophisticated: { days: 10, hours: 36 } } },
            { name: 'Technical Design', phaseName: 'Planning', category: 'Project', estimates: { trivial: { days: 1, hours: 0.3 }, small: { days: 1, hours: 0.9 }, low: { days: 2, hours: 2.4 }, medium: { days: 3, hours: 6 }, high: { days: 8, hours: 18 }, sophisticated: { days: 15, hours: 54 } } },
            { name: 'Sprint Planning', phaseName: 'Planning', category: 'Project', estimates: { trivial: { days: 1, hours: 0.1 }, small: { days: 1, hours: 0.3 }, low: { days: 1, hours: 0.8 }, medium: { days: 1, hours: 2 }, high: { days: 2, hours: 6 }, sophisticated: { days: 5, hours: 18 } } },
            // Execution Phase
            { name: 'Bug Fix', phaseName: 'Execution', category: 'Project', estimates: { trivial: { days: 1, hours: 0.2 }, small: { days: 1, hours: 0.6 }, low: { days: 1, hours: 1.6 }, medium: { days: 2, hours: 4 }, high: { days: 5, hours: 12 }, sophisticated: { days: 10, hours: 36 } } },
            { name: 'Feature Development', phaseName: 'Execution', category: 'Project', estimates: { trivial: { days: 2, hours: 1 }, small: { days: 4, hours: 3 }, low: { days: 8, hours: 8 }, medium: { days: 15, hours: 20 }, high: { days: 45, hours: 60 }, sophisticated: { days: 120, hours: 180 } } },
            { name: 'Infrastructure Setup', phaseName: 'Execution', category: 'Project', estimates: { trivial: { days: 1, hours: 0.6 }, small: { days: 1, hours: 1.8 }, low: { days: 2, hours: 4.8 }, medium: { days: 5, hours: 12 }, high: { days: 12, hours: 36 }, sophisticated: { days: 30, hours: 108 } } },
            { name: 'Security Audit', phaseName: 'Execution', category: 'Project', estimates: { trivial: { days: 1, hours: 0.2 }, small: { days: 1, hours: 0.6 }, low: { days: 1, hours: 1.6 }, medium: { days: 2, hours: 4 }, high: { days: 5, hours: 12 }, sophisticated: { days: 15, hours: 36 } } },
            // Monitoring & Controlling Phase
            { name: 'Code Review', phaseName: 'Monitoring & Controlling', category: 'Project', estimates: { trivial: { days: 1, hours: 0.2 }, small: { days: 1, hours: 0.6 }, low: { days: 1, hours: 1.6 }, medium: { days: 2, hours: 4 }, high: { days: 5, hours: 12 }, sophisticated: { days: 10, hours: 36 } } },
            { name: 'Integration Testing', phaseName: 'Monitoring & Controlling', category: 'Project', estimates: { trivial: { days: 1, hours: 0.3 }, small: { days: 1, hours: 0.9 }, low: { days: 2, hours: 2.4 }, medium: { days: 3, hours: 6 }, high: { days: 8, hours: 18 }, sophisticated: { days: 15, hours: 54 } } },
            { name: 'User Acceptance Testing', phaseName: 'Monitoring & Controlling', category: 'Project', estimates: { trivial: { days: 1, hours: 0.3 }, small: { days: 1, hours: 0.9 }, low: { days: 2, hours: 2.4 }, medium: { days: 3, hours: 6 }, high: { days: 10, hours: 18 }, sophisticated: { days: 20, hours: 54 } } },
            // Closing Phase
            { name: 'Deployment', phaseName: 'Closing', category: 'Project', estimates: { trivial: { days: 1, hours: 0.15 }, small: { days: 1, hours: 0.45 }, low: { days: 1, hours: 1.2 }, medium: { days: 1, hours: 3 }, high: { days: 3, hours: 9 }, sophisticated: { days: 5, hours: 27 } } },
            { name: 'Documentation', phaseName: 'Closing', category: 'Project', estimates: { trivial: { days: 1, hours: 0.15 }, small: { days: 1, hours: 0.45 }, low: { days: 1, hours: 1.2 }, medium: { days: 2, hours: 3 }, high: { days: 5, hours: 9 }, sophisticated: { days: 10, hours: 27 } } },
            { name: 'Knowledge Transfer', phaseName: 'Closing', category: 'Project', estimates: { trivial: { days: 1, hours: 0.1 }, small: { days: 1, hours: 0.3 }, low: { days: 1, hours: 0.8 }, medium: { days: 1, hours: 2 }, high: { days: 3, hours: 6 }, sophisticated: { days: 5, hours: 18 } } },
            // Support Phase
            { name: 'Incident Resolution', phaseName: 'IT Operations & Support', category: 'Support', estimates: { trivial: { days: 1, hours: 1 }, small: { days: 1, hours: 2 }, low: { days: 1, hours: 2 }, medium: { days: 2, hours: 4 }, high: { days: 3, hours: 6 }, sophisticated: { days: 5, hours: 8 } } },
            { name: 'Service Request', phaseName: 'IT Operations & Support', category: 'Support', estimates: { trivial: { days: 0, hours: 1 }, small: { days: 1, hours: 1 }, low: { days: 1, hours: 1 }, medium: { days: 2, hours: 2 }, high: { days: 4, hours: 3 }, sophisticated: { days: 6, hours: 4 } } },
            { name: 'System Monitoring', phaseName: 'IT Operations & Support', category: 'Support', estimates: { trivial: { days: 0, hours: 1 }, small: { days: 1, hours: 1 }, low: { days: 1, hours: 1 }, medium: { days: 1, hours: 2 }, high: { days: 2, hours: 3 }, sophisticated: { days: 3, hours: 4 } } },
            // Terminal Phases
            { name: 'Idle', phaseName: 'Idle', category: 'Terminal', estimates: { trivial: { days: 0, hours: 0 }, small: { days: 0, hours: 0 }, low: { days: 0, hours: 0 }, medium: { days: 0, hours: 0 }, high: { days: 0, hours: 0 }, sophisticated: { days: 0, hours: 0 } } },
            { name: 'Completed', phaseName: 'Completed', category: 'Terminal', estimates: { trivial: { days: 0, hours: 0 }, small: { days: 0, hours: 0 }, low: { days: 0, hours: 0 }, medium: { days: 0, hours: 0 }, high: { days: 0, hours: 0 }, sophisticated: { days: 0, hours: 0 } } }
        ];

        for (const task of taskTemplatesWithEstimates) {
            const { estimates, phaseName, ...taskData } = task;
            const phaseId = phaseMap[phaseName];
            const [taskTemplate] = await TaskTemplate.findOrCreate({
                where: { name: taskData.name, phaseId },
                defaults: { ...taskData, phaseId }
            });

            // Create estimates for each complexity level
            for (const [level, estimate] of Object.entries(estimates)) {
                await TaskEstimate.findOrCreate({
                    where: { taskTemplateId: taskTemplate.id, complexityLevel: level },
                    defaults: { taskTemplateId: taskTemplate.id, complexityLevel: level, days: estimate.days, hours: estimate.hours }
                });
            }
        }

        // ========================================
        // 7. COA (Chart of Accounts)
        // ========================================
        console.log('[Seeder] Seeding COA...');

        const coaData = [
            // Personnel Expenses (5000 series)
            { code: '5001', name: 'Basic Salary', category: 'Expense', subcategory: 'Personnel', description: 'Base monthly salary for permanent employees', isActive: true },
            { code: '5002', name: 'Employee Benefits', category: 'Expense', subcategory: 'Personnel', description: 'Health insurance, pension, and other benefits', isActive: true },
            { code: '5003', name: 'Overtime Pay', category: 'Expense', subcategory: 'Personnel', description: 'Payments for additional working hours', isActive: true },
            { code: '5004', name: 'Contractor Fees', category: 'Expense', subcategory: 'Personnel', description: 'Payments for freelancers and external contractors', isActive: true },
            { code: '5005', name: 'Recruitment', category: 'Expense', subcategory: 'Personnel', description: 'Hiring costs, job postings, recruitment agency fees', isActive: true },
            { code: '5006', name: 'Training & Development', category: 'Expense', subcategory: 'Personnel', description: 'Courses, certifications, and skill development programs', isActive: true },
            { code: '5007', name: 'Employee Bonuses', category: 'Expense', subcategory: 'Personnel', description: 'Performance bonuses and incentives', isActive: true },
            // Operational Expenses (6000 series)
            { code: '6001', name: 'Software Licenses', category: 'Expense', subcategory: 'Operational', description: 'Subscriptions for development tools and SaaS', isActive: true },
            { code: '6002', name: 'Hardware & Equipment', category: 'Expense', subcategory: 'Operational', description: 'Laptops, servers, and other hardware', isActive: true },
            { code: '6003', name: 'Cloud Infrastructure', category: 'Expense', subcategory: 'Operational', description: 'AWS, GCP, Azure cloud services and hosting', isActive: true },
            { code: '6004', name: 'Development Tools', category: 'Expense', subcategory: 'Operational', description: 'IDEs, CI/CD platforms, version control', isActive: true },
            { code: '6005', name: 'Testing Services', category: 'Expense', subcategory: 'Operational', description: 'QA tools, load testing, security scanning', isActive: true },
            { code: '6006', name: 'Maintenance & Support', category: 'Expense', subcategory: 'Operational', description: 'System maintenance and support contracts', isActive: true },
            // Administrative Expenses (7000 series)
            { code: '7001', name: 'Office & Utilities', category: 'Expense', subcategory: 'Administrative', description: 'Rent, electricity, internet, office supplies', isActive: true },
            { code: '7002', name: 'Professional Services', category: 'Expense', subcategory: 'Administrative', description: 'Legal, accounting, and consulting services', isActive: true },
            { code: '7003', name: 'Insurance', category: 'Expense', subcategory: 'Administrative', description: 'Business and liability insurance premiums', isActive: true },
            { code: '7004', name: 'Miscellaneous', category: 'Expense', subcategory: 'Administrative', description: 'Other administrative expenses not categorized elsewhere', isActive: true }
        ];

        for (const coa of coaData) {
            await COA.findOrCreate({ where: { code: coa.code }, defaults: coa });
        }

        // ========================================
        // 8. COST CENTERS
        // ========================================
        console.log('[Seeder] Seeding CostCenters...');

        const costCenterData = [
            { code: 'ENG', name: 'Engineering', description: 'Software development and infrastructure', status: 'Active', monthlyBudget: 150000000, yearlyBudget: 1800000000, budgetPeriod: '2025', parentId: null },
            { code: 'PROD', name: 'Product Management', description: 'Product strategy and design', status: 'Active', monthlyBudget: 100000000, yearlyBudget: 1200000000, budgetPeriod: '2025', parentId: null },
            { code: 'OPS', name: 'Operations', description: 'IT Operations and Support', status: 'Active', monthlyBudget: 80000000, yearlyBudget: 960000000, budgetPeriod: '2025', parentId: null }
        ];

        const ccMap = {};
        for (const cc of costCenterData) {
            const [costCenter] = await CostCenter.findOrCreate({ where: { code: cc.code }, defaults: cc });
            ccMap[cc.code] = costCenter.id;
        }

        // Add QA as child of Engineering
        await CostCenter.findOrCreate({
            where: { code: 'QA' },
            defaults: { code: 'QA', name: 'Quality Assurance', description: 'Testing and quality control', status: 'Active', monthlyBudget: 75000000, yearlyBudget: 900000000, budgetPeriod: '2025', parentId: ccMap['ENG'] }
        });

        // ========================================
        // 9. TEAM MEMBERS
        // ========================================
        console.log('[Seeder] Seeding Members...');

        const memberData = [
            { name: 'Abdurrahman Hakim', email: 'abdurrahman@company.com', roleType: 'FULLSTACK', maxHoursPerWeek: 40, isActive: true },
            { name: 'Daeng Ahmad', email: 'daeng@company.com', roleType: 'FULLSTACK', maxHoursPerWeek: 40, isActive: true },
            { name: 'Rafii Muhammad', email: 'rafii@company.com', roleType: 'DEVOPS', maxHoursPerWeek: 40, isActive: true },
            { name: 'Amelia Hadi', email: 'amelia@company.com', roleType: 'FINOPS', maxHoursPerWeek: 40, isActive: true },
            { name: 'Nopal Sidauruk', email: 'nopal@company.com', roleType: 'ARCHITECT', maxHoursPerWeek: 40, isActive: true },
            { name: 'Candra Kurniawan', email: 'candra@company.com', roleType: 'DBA', maxHoursPerWeek: 40, isActive: true },
            { name: 'Ijal Hauzan', email: 'ijal@company.com', roleType: 'APPSUPPORT', maxHoursPerWeek: 40, isActive: true },
            { name: 'Deni Ramdan', email: 'deni@company.com', roleType: 'APPSUPPORT', maxHoursPerWeek: 40, isActive: true },
            { name: 'Robby Setiawan', email: 'robby@company.com', roleType: 'APPSUPPORT', maxHoursPerWeek: 40, isActive: true },
            { name: 'Dimas Anugrah', email: 'dimas@company.com', roleType: 'HELPDESK', maxHoursPerWeek: 40, isActive: true }
        ];

        const memberMap = {};
        for (const m of memberData) {
            const [member] = await Member.findOrCreate({ where: { email: m.email }, defaults: m });
            memberMap[m.name] = member.id;
        }

        const [adminMember] = await Member.findOrCreate({
            where: { email: 'admin@example.com' },
            defaults: { name: 'System Admin', email: 'admin@example.com', roleType: 'ARCHITECT', isActive: true, maxHoursPerWeek: 40 }
        });

        const [testMemberRecord] = await Member.findOrCreate({
            where: { email: 'member@example.com' },
            defaults: { name: 'Test Member', email: 'member@example.com', roleType: 'FULLSTACK', isActive: true, maxHoursPerWeek: 40 }
        });

        // ========================================
        // 10. USERS (Auth)
        // ========================================
        const [adminUser, createdAdmin] = await User.findOrCreate({
            where: { email: 'admin@example.com' },
            defaults: { password: 'admin123', role: 'admin', memberId: adminMember.id }
        });

        if (!createdAdmin) {
            adminUser.password = 'admin123';
            await adminUser.save();
        }

        const [memberUser, createdMember] = await User.findOrCreate({
            where: { email: 'member@example.com' },
            defaults: { password: 'member123', role: 'member', memberId: testMemberRecord.id }
        });

        if (!createdMember) {
            memberUser.password = 'member123';
            await memberUser.save();
        }

        // Create a regular user linked to first member (legacy seeder support)
        await User.findOrCreate({
            where: { email: 'abdurrahman@company.com' },
            defaults: { password: 'user123', role: 'member', memberId: memberMap['Abdurrahman Hakim'] }
        });

        // ========================================
        // 11. HOLIDAYS (2025-2026)
        // ========================================
        console.log('[Seeder] Seeding Holidays...');

        const holidayData = [
            // 2025 National Holidays
            { id: 'hd_2025_001', date: '2025-01-01', name: 'Tahun Baru 2025 Masehi', type: 'national', year: 2025 },
            { id: 'hd_2025_002', date: '2025-01-27', name: 'Isra Mikraj Nabi Muhammad SAW', type: 'national', year: 2025 },
            { id: 'hd_2025_003', date: '2025-01-29', name: 'Tahun Baru Imlek 2576 Kongzili', type: 'national', year: 2025 },
            { id: 'hd_2025_004', date: '2025-03-29', name: 'Hari Suci Nyepi (Tahun Baru Saka 1947)', type: 'national', year: 2025 },
            { id: 'hd_2025_005', date: '2025-03-31', name: 'Hari Raya Idul Fitri 1446 Hijriah', type: 'national', year: 2025 },
            { id: 'hd_2025_006', date: '2025-04-01', name: 'Hari Raya Idul Fitri 1446 Hijriah', type: 'national', year: 2025 },
            { id: 'hd_2025_007', date: '2025-04-18', name: 'Wafat Yesus Kristus', type: 'national', year: 2025 },
            { id: 'hd_2025_008', date: '2025-04-20', name: 'Kebangkitan Yesus Kristus (Paskah)', type: 'national', year: 2025 },
            { id: 'hd_2025_009', date: '2025-05-01', name: 'Hari Buruh Internasional', type: 'national', year: 2025 },
            { id: 'hd_2025_010', date: '2025-05-12', name: 'Hari Raya Waisak 2569 BE', type: 'national', year: 2025 },
            { id: 'hd_2025_011', date: '2025-05-29', name: 'Kenaikan Yesus Kristus', type: 'national', year: 2025 },
            { id: 'hd_2025_012', date: '2025-06-01', name: 'Hari Lahir Pancasila', type: 'national', year: 2025 },
            { id: 'hd_2025_013', date: '2025-06-06', name: 'Hari Raya Idul Adha 1446 Hijriah', type: 'national', year: 2025 },
            { id: 'hd_2025_014', date: '2025-06-27', name: '1 Muharam Tahun Baru Islam 1447 Hijriah', type: 'national', year: 2025 },
            { id: 'hd_2025_015', date: '2025-08-17', name: 'Hari Kemerdekaan RI', type: 'national', year: 2025 },
            { id: 'hd_2025_016', date: '2025-09-05', name: 'Maulid Nabi Muhammad SAW', type: 'national', year: 2025 },
            { id: 'hd_2025_017', date: '2025-12-25', name: 'Hari Raya Natal', type: 'national', year: 2025 },
            // 2025 Cuti Bersama
            { id: 'cb_2025_001', date: '2025-01-28', name: 'Cuti Bersama Tahun Baru Imlek', type: 'collective', year: 2025 },
            { id: 'cb_2025_002', date: '2025-03-28', name: 'Cuti Bersama Hari Suci Nyepi', type: 'collective', year: 2025 },
            { id: 'cb_2025_003', date: '2025-04-02', name: 'Cuti Bersama Idul Fitri', type: 'collective', year: 2025 },
            { id: 'cb_2025_004', date: '2025-04-03', name: 'Cuti Bersama Idul Fitri', type: 'collective', year: 2025 },
            { id: 'cb_2025_005', date: '2025-04-04', name: 'Cuti Bersama Idul Fitri', type: 'collective', year: 2025 },
            { id: 'cb_2025_006', date: '2025-04-07', name: 'Cuti Bersama Idul Fitri', type: 'collective', year: 2025 },
            { id: 'cb_2025_007', date: '2025-05-13', name: 'Cuti Bersama Hari Raya Waisak', type: 'collective', year: 2025 },
            { id: 'cb_2025_008', date: '2025-06-02', name: 'Cuti Bersama Hari Lahir Pancasila', type: 'collective', year: 2025 },
            { id: 'cb_2025_009', date: '2025-06-16', name: 'Cuti Bersama Idul Adha', type: 'collective', year: 2025 },
            { id: 'cb_2025_010', date: '2025-12-26', name: 'Cuti Bersama Hari Raya Natal', type: 'collective', year: 2025 },
            // 2026 National Holidays
            { id: 'hd_2026_001', date: '2026-01-01', name: 'Tahun Baru 2026 Masehi', type: 'national', year: 2026 },
            { id: 'hd_2026_002', date: '2026-01-16', name: 'Isra Mikraj Nabi Muhammad SAW', type: 'national', year: 2026 },
            { id: 'hd_2026_003', date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili', type: 'national', year: 2026 },
            { id: 'hd_2026_004', date: '2026-03-19', name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)', type: 'national', year: 2026 },
            { id: 'hd_2026_005', date: '2026-03-21', name: 'Hari Raya Idul Fitri 1447 Hijriah', type: 'national', year: 2026 },
            { id: 'hd_2026_006', date: '2026-03-22', name: 'Hari Raya Idul Fitri 1447 Hijriah', type: 'national', year: 2026 },
            { id: 'hd_2026_007', date: '2026-04-03', name: 'Wafat Yesus Kristus', type: 'national', year: 2026 },
            { id: 'hd_2026_008', date: '2026-04-05', name: 'Kebangkitan Yesus Kristus (Paskah)', type: 'national', year: 2026 },
            { id: 'hd_2026_009', date: '2026-05-01', name: 'Hari Buruh Internasional', type: 'national', year: 2026 },
            { id: 'hd_2026_010', date: '2026-05-14', name: 'Kenaikan Yesus Kristus', type: 'national', year: 2026 },
            { id: 'hd_2026_011', date: '2026-05-27', name: 'Hari Raya Idul Adha 1447 Hijriah', type: 'national', year: 2026 },
            { id: 'hd_2026_012', date: '2026-05-31', name: 'Hari Raya Waisak 2570 BE', type: 'national', year: 2026 },
            { id: 'hd_2026_013', date: '2026-06-01', name: 'Hari Lahir Pancasila', type: 'national', year: 2026 },
            { id: 'hd_2026_014', date: '2026-06-17', name: 'Tahun Baru Islam 1448 Hijriah', type: 'national', year: 2026 },
            { id: 'hd_2026_015', date: '2026-08-17', name: 'Hari Kemerdekaan RI', type: 'national', year: 2026 },
            { id: 'hd_2026_016', date: '2026-08-26', name: 'Maulid Nabi Muhammad SAW', type: 'national', year: 2026 },
            { id: 'hd_2026_017', date: '2026-12-25', name: 'Hari Raya Natal', type: 'national', year: 2026 },
            // 2026 Cuti Bersama
            { id: 'cb_2026_001', date: '2026-02-16', name: 'Cuti Bersama Tahun Baru Imlek', type: 'collective', year: 2026 },
            { id: 'cb_2026_002', date: '2026-03-18', name: 'Cuti Bersama Hari Suci Nyepi', type: 'collective', year: 2026 },
            { id: 'cb_2026_003', date: '2026-03-20', name: 'Cuti Bersama Idul Fitri', type: 'collective', year: 2026 },
            { id: 'cb_2026_004', date: '2026-03-23', name: 'Cuti Bersama Idul Fitri', type: 'collective', year: 2026 },
            { id: 'cb_2026_005', date: '2026-03-24', name: 'Cuti Bersama Idul Fitri', type: 'collective', year: 2026 },
            { id: 'cb_2026_006', date: '2026-05-15', name: 'Cuti Bersama Kenaikan Yesus Kristus', type: 'collective', year: 2026 },
            { id: 'cb_2026_007', date: '2026-05-28', name: 'Cuti Bersama Idul Adha', type: 'collective', year: 2026 },
            { id: 'cb_2026_008', date: '2026-12-24', name: 'Cuti Bersama Hari Raya Natal', type: 'collective', year: 2026 }
        ];

        for (const h of holidayData) {
            await Holiday.findOrCreate({ where: { id: h.id }, defaults: h });
        }

        // ========================================
        // 12. LEAVE TYPES
        // ========================================
        console.log('[Seeder] Seeding LeaveTypes...');

        const leaveTypeData = [
            { name: 'Annual Leave', defaultDays: 20, carryOverMax: 5, color: '#22C55E', requiresApproval: true },
            { name: 'Sick Leave', defaultDays: 10, carryOverMax: 0, color: '#EF4444', requiresApproval: true },
            { name: 'Personal Leave', defaultDays: 3, carryOverMax: 0, color: '#8B5CF6', requiresApproval: true },
            { name: 'Unpaid Leave', defaultDays: 0, carryOverMax: 0, color: '#6B7280', requiresApproval: true }
        ];

        const leaveTypesMap = {};
        for (const lt of leaveTypeData) {
            const [leaveType] = await LeaveType.findOrCreate({ where: { name: lt.name }, defaults: lt });
            leaveTypesMap[lt.name] = leaveType;
        }

        // ========================================
        // 13. LEAVE BALANCES (for all members)
        // ========================================
        console.log('[Seeder] Seeding LeaveBalances for members...');

        const currentYear = new Date().getFullYear();
        const allMembers = await Member.findAll();
        const allLeaveTypes = await LeaveType.findAll({ where: { isActive: true } });

        for (const member of allMembers) {
            for (const type of allLeaveTypes) {
                await LeaveBalance.findOrCreate({
                    where: { memberId: member.id, leaveTypeId: type.id, year: currentYear },
                    defaults: {
                        memberId: member.id,
                        leaveTypeId: type.id,
                        year: currentYear,
                        totalDays: type.defaultDays,
                        usedDays: 0
                    }
                });
            }
        }

        // ========================================
        // 14. SAMPLE TIMESHEETS
        // ========================================
        console.log('[Seeder] Seeding Sample Timesheets...');

        const lastMonday = startOfWeek(new Date(), { weekStartsOn: 1 });
        const lastSunday = endOfWeek(new Date(), { weekStartsOn: 1 });

        const memberUserRecord = await User.findOne({ where: { email: 'member@example.com' } });
        if (memberUserRecord && memberUserRecord.memberId) {
            const [period] = await TimesheetPeriod.findOrCreate({
                where: { memberId: memberUserRecord.memberId, startDate: format(lastMonday, 'yyyy-MM-dd') },
                defaults: {
                    memberId: memberUserRecord.memberId,
                    startDate: format(lastMonday, 'yyyy-MM-dd'),
                    endDate: format(lastSunday, 'yyyy-MM-dd'),
                    status: 'DRAFT',
                    totalHours: 16
                }
            });

            await TimeEntry.findOrCreate({
                where: { memberId: memberUserRecord.memberId, date: format(lastMonday, 'yyyy-MM-dd') },
                defaults: {
                    memberId: memberUserRecord.memberId,
                    date: format(lastMonday, 'yyyy-MM-dd'),
                    hours: 8,
                    description: 'Development work on Leave System',
                    category: 'PROJECT',
                    timesheetPeriodId: period.id
                }
            });

            const tuesday = new Date(lastMonday);
            tuesday.setDate(tuesday.getDate() + 1);

            await TimeEntry.findOrCreate({
                where: { memberId: memberUserRecord.memberId, date: format(tuesday, 'yyyy-MM-dd') },
                defaults: {
                    memberId: memberUserRecord.memberId,
                    date: format(tuesday, 'yyyy-MM-dd'),
                    hours: 8,
                    description: 'Bug fixing and UI polish',
                    category: 'PROJECT',
                    timesheetPeriodId: period.id
                }
            });
        }

        console.log('[Seeder] ✅ Database seeding completed successfully!');
        console.log('[Seeder] Summary:');
        console.log('  - 8 Role Types with 40 Role Tiers');
        console.log('  - 6 Complexity Levels');
        console.log('  - 5 Task Statuses');
        console.log('  - 8 Tags');
        console.log('  - 8 Project Phases');
        console.log('  - 20 Task Templates with 120 Estimates');
        console.log('  - 17 COA Accounts');
        console.log('  - 4 Cost Centers');
        console.log('  - 11 Team Members');
        console.log('  - 2 Users (admin + member)');
        console.log('  - 52 Holidays (2025-2026)');
        console.log(`  - ${leaveTypeData.length} Leave Types`);
        console.log(`  - ${allMembers.length * allLeaveTypes.length} Leave Balance records`);
        console.log('  - Sample Timesheet data (member@example.com)');


    } catch (error) {
        console.error('[Seeder] ❌ Error seeding database:', error);
        throw error;
    }
};
