/**
 * Default Chart of Accounts (COA)
 * Expanded to cover Personnel, Operational, and Administrative expenses
 */
export const defaultCOA = [
    // ========================================
    // PERSONNEL EXPENSES (5000 series)
    // ========================================
    {
        id: 'COA-5001',
        code: '5001',
        name: 'Basic Salary',
        category: 'Expense',
        subcategory: 'Personnel',
        description: 'Base monthly salary for permanent employees',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-5002',
        code: '5002',
        name: 'Employee Benefits',
        category: 'Expense',
        subcategory: 'Personnel',
        description: 'Health insurance, pension, and other benefits',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-5003',
        code: '5003',
        name: 'Overtime Pay',
        category: 'Expense',
        subcategory: 'Personnel',
        description: 'Payments for additional working hours',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-5004',
        code: '5004',
        name: 'Contractor Fees',
        category: 'Expense',
        subcategory: 'Personnel',
        description: 'Payments for freelancers and external contractors',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-5005',
        code: '5005',
        name: 'Recruitment',
        category: 'Expense',
        subcategory: 'Personnel',
        description: 'Hiring costs, job postings, recruitment agency fees',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-5006',
        code: '5006',
        name: 'Training & Development',
        category: 'Expense',
        subcategory: 'Personnel',
        description: 'Courses, certifications, and skill development programs',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-5007',
        code: '5007',
        name: 'Employee Bonuses',
        category: 'Expense',
        subcategory: 'Personnel',
        description: 'Performance bonuses and incentives',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },

    // ========================================
    // OPERATIONAL EXPENSES (6000 series)
    // ========================================
    {
        id: 'COA-6001',
        code: '6001',
        name: 'Software Licenses',
        category: 'Expense',
        subcategory: 'Operational',
        description: 'Subscriptions for development tools and SaaS',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-6002',
        code: '6002',
        name: 'Hardware & Equipment',
        category: 'Expense',
        subcategory: 'Operational',
        description: 'Laptops, servers, and other hardware',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-6003',
        code: '6003',
        name: 'Cloud Infrastructure',
        category: 'Expense',
        subcategory: 'Operational',
        description: 'AWS, GCP, Azure cloud services and hosting',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-6004',
        code: '6004',
        name: 'Development Tools',
        category: 'Expense',
        subcategory: 'Operational',
        description: 'IDEs, CI/CD platforms, version control',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-6005',
        code: '6005',
        name: 'Testing Services',
        category: 'Expense',
        subcategory: 'Operational',
        description: 'QA tools, load testing, security scanning',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-6006',
        code: '6006',
        name: 'Maintenance & Support',
        category: 'Expense',
        subcategory: 'Operational',
        description: 'System maintenance and support contracts',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },

    // ========================================
    // ADMINISTRATIVE EXPENSES (7000 series)
    // ========================================
    {
        id: 'COA-7001',
        code: '7001',
        name: 'Office & Utilities',
        category: 'Expense',
        subcategory: 'Administrative',
        description: 'Rent, electricity, internet, office supplies',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-7002',
        code: '7002',
        name: 'Professional Services',
        category: 'Expense',
        subcategory: 'Administrative',
        description: 'Legal, accounting, and consulting services',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-7003',
        code: '7003',
        name: 'Insurance',
        category: 'Expense',
        subcategory: 'Administrative',
        description: 'Business and liability insurance premiums',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'COA-7004',
        code: '7004',
        name: 'Miscellaneous',
        category: 'Expense',
        subcategory: 'Administrative',
        description: 'Other administrative expenses not categorized elsewhere',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    }
];

/**
 * Get COA accounts grouped by subcategory
 */
export function getCOABySubcategory(coaList = defaultCOA) {
    return {
        Personnel: coaList.filter(a => a.subcategory === 'Personnel'),
        Operational: coaList.filter(a => a.subcategory === 'Operational'),
        Administrative: coaList.filter(a => a.subcategory === 'Administrative')
    };
}
