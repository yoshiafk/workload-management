/**
 * Default Role Tiers
 * Role-based tiered cost structure with min/mid/max ranges
 * Based on Indonesian salary market data (2025)
 * 
 * Structure follows industry best practices:
 * - 5 tiers per role (Junior → Principal)
 * - 2M IDR increments between tier midpoints  
 * - Min/Mid/Max structure for salary bands
 * - ~10% spread within each tier
 */

export const defaultRoleTiers = {
    BA: {
        name: 'Business Analyst',
        description: 'Business Analysis and Requirements roles',
        tiers: [
            {
                level: 1,
                name: 'Junior BA',
                minCost: 8000000,   // 8M
                midCost: 10000000,  // 10M
                maxCost: 12000000   // 12M
            },
            {
                level: 2,
                name: 'BA',
                minCost: 12000000,  // 12M
                midCost: 14000000,  // 14M
                maxCost: 16000000   // 16M
            },
            {
                level: 3,
                name: 'Senior BA',
                minCost: 16000000,  // 16M
                midCost: 18000000,  // 18M
                maxCost: 20000000   // 20M
            },
            {
                level: 4,
                name: 'Lead BA',
                minCost: 20000000,  // 20M
                midCost: 22000000,  // 22M
                maxCost: 24000000   // 24M
            },
            {
                level: 5,
                name: 'Principal BA',
                minCost: 24000000,  // 24M
                midCost: 26000000,  // 26M
                maxCost: 28000000   // 28M
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
                minCost: 10000000,  // 10M
                midCost: 12000000,  // 12M
                maxCost: 14000000   // 14M
            },
            {
                level: 2,
                name: 'PM',
                minCost: 14000000,  // 14M
                midCost: 16000000,  // 16M
                maxCost: 18000000   // 18M
            },
            {
                level: 3,
                name: 'Senior PM',
                minCost: 18000000,  // 18M
                midCost: 20000000,  // 20M
                maxCost: 22000000   // 22M
            },
            {
                level: 4,
                name: 'Lead PM',
                minCost: 22000000,  // 22M
                midCost: 24000000,  // 24M
                maxCost: 26000000   // 26M
            },
            {
                level: 5,
                name: 'Principal PM',
                minCost: 26000000,  // 26M
                midCost: 28000000,  // 28M
                maxCost: 30000000   // 30M
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
    // Use == for comparison to handle string values from dropdowns
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
