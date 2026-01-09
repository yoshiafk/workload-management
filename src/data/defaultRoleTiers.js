/**
 * Default Role Tiers
 * Role-based tiered cost structure with min/mid/max ranges
 * 
 * Based on User requirement:
 * - 10M total difference between Min and Max for each role
 * - 5 tiers per role
 * - 2M difference between each tier
 */

export const defaultRoleTiers = {
    BA: {
        name: 'Business Analyst',
        description: 'Business Analysis and Requirements roles',
        tiers: [
            {
                level: 1,
                name: 'Junior BA',
                minCost: 10000000,   // 10M
                midCost: 11000000,   // 11M
                maxCost: 12000000    // 12M
            },
            {
                level: 2,
                name: 'BA',
                minCost: 12000000,   // 12M
                midCost: 13000000,   // 13M
                maxCost: 14000000    // 14M
            },
            {
                level: 3,
                name: 'Senior BA',
                minCost: 14000000,   // 14M
                midCost: 15000000,   // 15M
                maxCost: 16000000    // 16M
            },
            {
                level: 4,
                name: 'Lead BA',
                minCost: 16000000,   // 16M
                midCost: 17000000,   // 17M
                maxCost: 18000000    // 18M
            },
            {
                level: 5,
                name: 'Principal BA',
                minCost: 18000000,   // 18M
                midCost: 19000000,   // 19M
                maxCost: 20000000    // 20M
            },
        ]
    },
    PM: {
        name: 'Project Manager',
        description: 'Project Management and Coordination roles',
        tiers: [
            {
                level: 1,
                name: 'Junior PM',
                minCost: 15000000,   // 15M
                midCost: 16000000,   // 16M
                maxCost: 17000000    // 17M
            },
            {
                level: 2,
                name: 'PM',
                minCost: 17000000,   // 17M
                midCost: 18000000,   // 18M
                maxCost: 19000000    // 19M
            },
            {
                level: 3,
                name: 'Senior PM',
                minCost: 19000000,   // 19M
                midCost: 20000000,   // 20M
                maxCost: 21000000    // 21M
            },
            {
                level: 4,
                name: 'Lead PM',
                minCost: 21000000,   // 21M
                midCost: 22000000,   // 22M
                maxCost: 23000000    // 23M
            },
            {
                level: 5,
                name: 'Principal PM',
                minCost: 23000000,   // 23M
                midCost: 24000000,   // 24M
                maxCost: 25000000    // 25M
            },
        ]
    }
};

/**
 * Helper function to get tier by role and level
 * @param {string} roleType - 'BA' or 'PM'
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
 * @param {string} roleType - 'BA' or 'PM'
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
