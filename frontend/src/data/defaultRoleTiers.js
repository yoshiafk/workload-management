/**
 * Default Role Tiers
 * Role-based tiered cost structure for IT roles
 * Based on Indonesian IT market salary data (2025)
 * 
 * Each role has:
 * - 5 tiers (Junior → Mid → Senior → Lead → Principal)
 * - hasCostTracking flag to enable/disable cost calculations
 * - min/mid/max monthly costs in IDR
 */

export const defaultRoleTiers = {
    FULLSTACK: {
        name: 'Fullstack Engineer',
        description: 'Full-stack web and application development',
        hasCostTracking: true,
        tiers: [
            { level: 1, name: 'Junior Fullstack', minCost: 8000000, midCost: 10000000, maxCost: 12000000 },
            { level: 2, name: 'Fullstack Engineer', minCost: 12000000, midCost: 14000000, maxCost: 16000000 },
            { level: 3, name: 'Senior Fullstack', minCost: 16000000, midCost: 18000000, maxCost: 20000000 },
            { level: 4, name: 'Lead Fullstack', minCost: 18000000, midCost: 20000000, maxCost: 22000000 },
            { level: 5, name: 'Principal Fullstack', minCost: 20000000, midCost: 22000000, maxCost: 25000000 },
        ]
    },
    DEVOPS: {
        name: 'DevOps Engineer',
        description: 'CI/CD, infrastructure automation, and deployment',
        hasCostTracking: true,
        tiers: [
            { level: 1, name: 'Junior DevOps', minCost: 10000000, midCost: 12000000, maxCost: 14000000 },
            { level: 2, name: 'DevOps Engineer', minCost: 14000000, midCost: 16000000, maxCost: 18000000 },
            { level: 3, name: 'Senior DevOps', minCost: 18000000, midCost: 20000000, maxCost: 22000000 },
            { level: 4, name: 'Lead DevOps', minCost: 20000000, midCost: 23000000, maxCost: 25000000 },
            { level: 5, name: 'Principal DevOps', minCost: 22000000, midCost: 25000000, maxCost: 28000000 },
        ]
    },
    FINOPS: {
        name: 'FinOps Engineer',
        description: 'Cloud cost management and optimization',
        hasCostTracking: true,
        tiers: [
            { level: 1, name: 'Junior FinOps', minCost: 12000000, midCost: 14000000, maxCost: 16000000 },
            { level: 2, name: 'FinOps Engineer', minCost: 16000000, midCost: 18000000, maxCost: 20000000 },
            { level: 3, name: 'Senior FinOps', minCost: 18000000, midCost: 20000000, maxCost: 22000000 },
            { level: 4, name: 'Lead FinOps', minCost: 20000000, midCost: 22000000, maxCost: 24000000 },
            { level: 5, name: 'Principal FinOps', minCost: 22000000, midCost: 24000000, maxCost: 26000000 },
        ]
    },
    ARCHITECT: {
        name: 'Solution Architect',
        description: 'System design and technical architecture',
        hasCostTracking: true,
        tiers: [
            { level: 1, name: 'Junior Architect', minCost: 25000000, midCost: 28000000, maxCost: 30000000 },
            { level: 2, name: 'Solution Architect', minCost: 30000000, midCost: 33000000, maxCost: 35000000 },
            { level: 3, name: 'Senior Architect', minCost: 35000000, midCost: 38000000, maxCost: 40000000 },
            { level: 4, name: 'Lead Architect', minCost: 38000000, midCost: 42000000, maxCost: 45000000 },
            { level: 5, name: 'Principal Architect', minCost: 42000000, midCost: 47000000, maxCost: 50000000 },
        ]
    },
    CLOUD: {
        name: 'Cloud Engineer',
        description: 'Cloud infrastructure and services management',
        hasCostTracking: true,
        tiers: [
            { level: 1, name: 'Junior Cloud Engineer', minCost: 15000000, midCost: 17000000, maxCost: 20000000 },
            { level: 2, name: 'Cloud Engineer', minCost: 20000000, midCost: 23000000, maxCost: 25000000 },
            { level: 3, name: 'Senior Cloud Engineer', minCost: 25000000, midCost: 28000000, maxCost: 30000000 },
            { level: 4, name: 'Lead Cloud Engineer', minCost: 28000000, midCost: 32000000, maxCost: 35000000 },
            { level: 5, name: 'Principal Cloud Engineer', minCost: 32000000, midCost: 37000000, maxCost: 40000000 },
        ]
    },
    DBA: {
        name: 'Database Administrator',
        description: 'Database management, optimization, and maintenance',
        hasCostTracking: true,
        tiers: [
            { level: 1, name: 'Junior DBA', minCost: 12000000, midCost: 14000000, maxCost: 16000000 },
            { level: 2, name: 'DBA', minCost: 16000000, midCost: 18000000, maxCost: 20000000 },
            { level: 3, name: 'Senior DBA', minCost: 20000000, midCost: 23000000, maxCost: 25000000 },
            { level: 4, name: 'Lead DBA', minCost: 24000000, midCost: 27000000, maxCost: 30000000 },
            { level: 5, name: 'Principal DBA', minCost: 28000000, midCost: 32000000, maxCost: 35000000 },
        ]
    },
    APPSUPPORT: {
        name: 'Application Support',
        description: 'Application monitoring, troubleshooting, and user support',
        hasCostTracking: false,
        tiers: [
            { level: 1, name: 'Junior App Support', minCost: 6000000, midCost: 7000000, maxCost: 8000000 },
            { level: 2, name: 'App Support', minCost: 8000000, midCost: 9000000, maxCost: 10000000 },
            { level: 3, name: 'Senior App Support', minCost: 10000000, midCost: 12000000, maxCost: 13000000 },
            { level: 4, name: 'Lead App Support', minCost: 12000000, midCost: 14000000, maxCost: 15000000 },
            { level: 5, name: 'Principal App Support', minCost: 14000000, midCost: 16000000, maxCost: 18000000 },
        ]
    },
    HELPDESK: {
        name: 'Helpdesk Management',
        description: 'IT helpdesk and end-user support coordination',
        hasCostTracking: false,
        tiers: [
            { level: 1, name: 'Helpdesk Agent', minCost: 5000000, midCost: 6000000, maxCost: 7000000 },
            { level: 2, name: 'Helpdesk Specialist', minCost: 7000000, midCost: 8000000, maxCost: 9000000 },
            { level: 3, name: 'Senior Helpdesk', minCost: 9000000, midCost: 10000000, maxCost: 11000000 },
            { level: 4, name: 'Helpdesk Supervisor', minCost: 10000000, midCost: 11000000, maxCost: 12000000 },
            { level: 5, name: 'Helpdesk Manager', minCost: 11000000, midCost: 13000000, maxCost: 15000000 },
        ]
    }
};

/**
 * Get all role types as options for dropdowns
 * @returns {array} Array of { value, label } objects
 */
export function getRoleOptions() {
    return Object.entries(defaultRoleTiers).map(([code, role]) => ({
        value: code,
        label: role.name
    }));
}

/**
 * Helper function to get tier by role and level
 * @param {string} roleType - Role code (e.g., 'FULLSTACK')
 * @param {number} level - 1 to 5
 * @returns {object|null} Tier object or null if not found
 */
export function getTierByRoleAndLevel(roleType, level) {
    const role = defaultRoleTiers[roleType];
    if (!role) return null;
    return role.tiers.find(t => t.level == level) || null;
}

/**
 * Get all tier options for a specific role type
 * @param {string} roleType - Role code (e.g., 'FULLSTACK')
 * @returns {array} Array of tier options for dropdowns
 */
export function getTierOptionsForRole(roleType) {
    const role = defaultRoleTiers[roleType];
    if (!role) return [];
    return role.tiers.map(tier => ({
        value: tier.level,
        label: `${tier.name} (${formatRupiah(tier.minCost)} - ${formatRupiah(tier.maxCost)})`
    }));
}

/**
 * Check if a role has cost tracking enabled
 * @param {string} roleType - Role code
 * @returns {boolean} True if cost tracking is enabled
 */
export function roleHasCostTracking(roleType) {
    const role = defaultRoleTiers[roleType];
    return role?.hasCostTracking ?? false;
}

/**
 * Format number as Indonesian Rupiah (shortened)
 * @param {number} amount - Amount in IDR
 * @returns {string} Formatted string (e.g., "10 Jt")
 */
function formatRupiah(amount) {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(0)} Jt`;
    }
    return new Intl.NumberFormat('id-ID').format(amount);
}
