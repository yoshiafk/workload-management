/**
 * Default Cost Centers
 */
export const defaultCostCenters = [
    {
        id: 'CC-001',
        code: 'ENG',
        name: 'Engineering',
        description: 'Software development and infrastructure',
        manager: 'Alex Engineering',
        status: 'Active',
        isActive: true,
        parentCostCenterId: null,
        // Budget and actual cost tracking (in IDR)
        monthlyBudget: 150000000, // 150 million IDR monthly budget
        actualMonthlyCost: 0, // Will be calculated from team member assignments
        yearlyBudget: 1800000000, // 1.8 billion IDR yearly budget
        actualYearlyCost: 0, // Will be calculated from allocations
        budgetPeriod: '2024', // Budget year
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'CC-002',
        code: 'PROD',
        name: 'Product Management',
        description: 'Product strategy and design',
        manager: 'Sarah Product',
        status: 'Active',
        isActive: true,
        parentCostCenterId: null,
        // Budget and actual cost tracking (in IDR)
        monthlyBudget: 100000000, // 100 million IDR monthly budget
        actualMonthlyCost: 0,
        yearlyBudget: 1200000000, // 1.2 billion IDR yearly budget
        actualYearlyCost: 0,
        budgetPeriod: '2024',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'CC-003',
        code: 'QA',
        name: 'Quality Assurance',
        description: 'Testing and quality control',
        manager: 'John Quality',
        status: 'Active',
        isActive: true,
        parentCostCenterId: 'CC-001', // Child of Engineering
        // Budget and actual cost tracking (in IDR)
        monthlyBudget: 75000000, // 75 million IDR monthly budget
        actualMonthlyCost: 0,
        yearlyBudget: 900000000, // 900 million IDR yearly budget
        actualYearlyCost: 0,
        budgetPeriod: '2024',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'CC-004',
        code: 'OPS',
        name: 'Operations',
        description: 'IT Operations and Support',
        manager: 'Mike Ops',
        status: 'Active',
        isActive: true,
        parentCostCenterId: null,
        // Budget and actual cost tracking (in IDR)
        monthlyBudget: 80000000, // 80 million IDR monthly budget
        actualMonthlyCost: 0,
        yearlyBudget: 960000000, // 960 million IDR yearly budget
        actualYearlyCost: 0,
        budgetPeriod: '2024',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    }
];
