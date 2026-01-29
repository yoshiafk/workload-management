/**
 * Default Resource Costs
 * Pre-configured cost tiers for each role with hasCostTracking enabled
 * Only roles with hasCostTracking: true are included
 */

// Working days per month and hours per day constants
const WORKING_DAYS_PER_MONTH = 20;
const WORKING_HOURS_PER_DAY = 8;

/**
 * Calculate per-day and per-hour costs from monthly cost
 */
function calculateRates(monthlyCost) {
    const perDayCost = Math.round(monthlyCost / WORKING_DAYS_PER_MONTH);
    const perHourCost = Math.round(perDayCost / WORKING_HOURS_PER_DAY);
    return { perDayCost, perHourCost };
}

/**
 * Default cost configurations for roles with cost tracking enabled
 */
export const defaultResourceCosts = [
    // Fullstack Engineer Tiers
    {
        id: 'COST-FULL-1',
        resourceName: 'Junior Fullstack',
        roleType: 'FULLSTACK',
        tierLevel: 1,
        minMonthlyCost: 8000000,
        maxMonthlyCost: 12000000,
        monthlyCost: 10000000,
        ...calculateRates(10000000),
    },
    {
        id: 'COST-FULL-2',
        resourceName: 'Fullstack Engineer',
        roleType: 'FULLSTACK',
        tierLevel: 2,
        minMonthlyCost: 12000000,
        maxMonthlyCost: 16000000,
        monthlyCost: 14000000,
        ...calculateRates(14000000),
    },
    {
        id: 'COST-FULL-3',
        resourceName: 'Senior Fullstack',
        roleType: 'FULLSTACK',
        tierLevel: 3,
        minMonthlyCost: 16000000,
        maxMonthlyCost: 20000000,
        monthlyCost: 18000000,
        ...calculateRates(18000000),
    },
    // DevOps Engineer Tiers
    {
        id: 'COST-DEVOPS-1',
        resourceName: 'Junior DevOps',
        roleType: 'DEVOPS',
        tierLevel: 1,
        minMonthlyCost: 10000000,
        maxMonthlyCost: 14000000,
        monthlyCost: 12000000,
        ...calculateRates(12000000),
    },
    {
        id: 'COST-DEVOPS-2',
        resourceName: 'DevOps Engineer',
        roleType: 'DEVOPS',
        tierLevel: 2,
        minMonthlyCost: 14000000,
        maxMonthlyCost: 18000000,
        monthlyCost: 16000000,
        ...calculateRates(16000000),
    },
    {
        id: 'COST-DEVOPS-3',
        resourceName: 'Senior DevOps',
        roleType: 'DEVOPS',
        tierLevel: 3,
        minMonthlyCost: 18000000,
        maxMonthlyCost: 22000000,
        monthlyCost: 20000000,
        ...calculateRates(20000000),
    },
    // FinOps Engineer Tiers
    {
        id: 'COST-FINOPS-1',
        resourceName: 'Junior FinOps',
        roleType: 'FINOPS',
        tierLevel: 1,
        minMonthlyCost: 12000000,
        maxMonthlyCost: 16000000,
        monthlyCost: 14000000,
        ...calculateRates(14000000),
    },
    {
        id: 'COST-FINOPS-2',
        resourceName: 'FinOps Engineer',
        roleType: 'FINOPS',
        tierLevel: 2,
        minMonthlyCost: 16000000,
        maxMonthlyCost: 20000000,
        monthlyCost: 18000000,
        ...calculateRates(18000000),
    },
    // Solution Architect Tiers
    {
        id: 'COST-ARCH-1',
        resourceName: 'Junior Architect',
        roleType: 'ARCHITECT',
        tierLevel: 1,
        minMonthlyCost: 25000000,
        maxMonthlyCost: 30000000,
        monthlyCost: 28000000,
        ...calculateRates(28000000),
    },
    {
        id: 'COST-ARCH-2',
        resourceName: 'Solution Architect',
        roleType: 'ARCHITECT',
        tierLevel: 2,
        minMonthlyCost: 30000000,
        maxMonthlyCost: 35000000,
        monthlyCost: 33000000,
        ...calculateRates(33000000),
    },
    {
        id: 'COST-ARCH-3',
        resourceName: 'Senior Architect',
        roleType: 'ARCHITECT',
        tierLevel: 3,
        minMonthlyCost: 35000000,
        maxMonthlyCost: 40000000,
        monthlyCost: 38000000,
        ...calculateRates(38000000),
    },
    // Cloud Engineer Tiers
    {
        id: 'COST-CLOUD-1',
        resourceName: 'Junior Cloud Engineer',
        roleType: 'CLOUD',
        tierLevel: 1,
        minMonthlyCost: 15000000,
        maxMonthlyCost: 20000000,
        monthlyCost: 17000000,
        ...calculateRates(17000000),
    },
    {
        id: 'COST-CLOUD-2',
        resourceName: 'Cloud Engineer',
        roleType: 'CLOUD',
        tierLevel: 2,
        minMonthlyCost: 20000000,
        maxMonthlyCost: 25000000,
        monthlyCost: 23000000,
        ...calculateRates(23000000),
    },
    {
        id: 'COST-CLOUD-3',
        resourceName: 'Senior Cloud Engineer',
        roleType: 'CLOUD',
        tierLevel: 3,
        minMonthlyCost: 25000000,
        maxMonthlyCost: 30000000,
        monthlyCost: 28000000,
        ...calculateRates(28000000),
    },
    // Database Administrator Tiers
    {
        id: 'COST-DBA-1',
        resourceName: 'Junior DBA',
        roleType: 'DBA',
        tierLevel: 1,
        minMonthlyCost: 12000000,
        maxMonthlyCost: 16000000,
        monthlyCost: 14000000,
        ...calculateRates(14000000),
    },
    {
        id: 'COST-DBA-2',
        resourceName: 'DBA',
        roleType: 'DBA',
        tierLevel: 2,
        minMonthlyCost: 16000000,
        maxMonthlyCost: 20000000,
        monthlyCost: 18000000,
        ...calculateRates(18000000),
    },
    {
        id: 'COST-DBA-3',
        resourceName: 'Senior DBA',
        roleType: 'DBA',
        tierLevel: 3,
        minMonthlyCost: 20000000,
        maxMonthlyCost: 25000000,
        monthlyCost: 23000000,
        ...calculateRates(23000000),
    },
];
