/**
 * Default Resource Costs
 * Pre-loaded from Excel prototype (Library sheet)
 * All costs in Indonesian Rupiah (IDR)
 * 
 * Now includes role type and tier level for structured cost management
 */

// Working days per month and hours per day constants
const WORKING_DAYS_PER_MONTH = 20;
const WORKING_HOURS_PER_DAY = 8;

/**
 * Calculate per-day and per-hour costs from monthly cost
 * @param {number} monthlyCost - Monthly cost in IDR
 * @returns {object} Object with perDayCost and perHourCost
 */
function calculateRates(monthlyCost) {
    const perDayCost = Math.round(monthlyCost / WORKING_DAYS_PER_MONTH);
    const perHourCost = Math.round(perDayCost / WORKING_HOURS_PER_DAY);
    return { perDayCost, perHourCost };
}

export const defaultResourceCosts = [
    {
        id: 'junior_ba_1',
        resourceName: 'Junior BA',
        roleType: 'BA',
        tierLevel: 1,
        minMonthlyCost: 8000000,
        maxMonthlyCost: 12000000,
        monthlyCost: 10000000,
        ...calculateRates(10000000),
        currency: 'IDR',
    },
    {
        id: 'ba_1',
        resourceName: 'BA',
        roleType: 'BA',
        tierLevel: 2,
        minMonthlyCost: 12000000,
        maxMonthlyCost: 16000000,
        monthlyCost: 14000000,
        ...calculateRates(14000000),
        currency: 'IDR',
    },
    {
        id: 'senior_ba_1',
        resourceName: 'Senior BA',
        roleType: 'BA',
        tierLevel: 3,
        minMonthlyCost: 16000000,
        maxMonthlyCost: 20000000,
        monthlyCost: 18000000,
        ...calculateRates(18000000),
        currency: 'IDR',
    },
    {
        id: 'lead_ba_1',
        resourceName: 'Lead BA',
        roleType: 'BA',
        tierLevel: 4,
        minMonthlyCost: 20000000,
        maxMonthlyCost: 24000000,
        monthlyCost: 22000000,
        ...calculateRates(22000000),
        currency: 'IDR',
    },
    {
        id: 'principal_ba_1',
        resourceName: 'Principal BA',
        roleType: 'BA',
        tierLevel: 5,
        minMonthlyCost: 24000000,
        maxMonthlyCost: 28000000,
        monthlyCost: 26000000,
        ...calculateRates(26000000),
        currency: 'IDR',
    },
    {
        id: 'junior_pm_1',
        resourceName: 'Junior PM',
        roleType: 'PM',
        tierLevel: 1,
        minMonthlyCost: 10000000,
        maxMonthlyCost: 14000000,
        monthlyCost: 12000000,
        ...calculateRates(12000000),
        currency: 'IDR',
    },
    {
        id: 'pm_1',
        resourceName: 'PM',
        roleType: 'PM',
        tierLevel: 2,
        minMonthlyCost: 14000000,
        maxMonthlyCost: 18000000,
        monthlyCost: 16000000,
        ...calculateRates(16000000),
        currency: 'IDR',
    },
    {
        id: 'senior_pm_1',
        resourceName: 'Senior PM',
        roleType: 'PM',
        tierLevel: 3,
        minMonthlyCost: 18000000,
        maxMonthlyCost: 22000000,
        monthlyCost: 20000000,
        ...calculateRates(20000000),
        currency: 'IDR',
    },
    {
        id: 'lead_pm_1',
        resourceName: 'Lead PM',
        roleType: 'PM',
        tierLevel: 4,
        minMonthlyCost: 22000000,
        maxMonthlyCost: 26000000,
        monthlyCost: 24000000,
        ...calculateRates(24000000),
        currency: 'IDR',
    },
    {
        id: 'principal_pm_1',
        resourceName: 'Principal PM',
        roleType: 'PM',
        tierLevel: 5,
        minMonthlyCost: 26000000,
        maxMonthlyCost: 30000000,
        monthlyCost: 28000000,
        ...calculateRates(28000000),
        currency: 'IDR',
    },
];
