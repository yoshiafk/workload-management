/**
 * Default Resource Costs
 * Adjusted to match the 10M spread / 2M per tier schema
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
    // BA Tiers (10M - 20M range)
    {
        id: 'junior_ba_1',
        resourceName: 'Junior BA',
        roleType: 'BA',
        tierLevel: 1,
        minMonthlyCost: 10000000,
        maxMonthlyCost: 12000000,
        monthlyCost: 11000000,
        ...calculateRates(11000000),
        currency: 'IDR',
    },
    {
        id: 'ba_1',
        resourceName: 'BA',
        roleType: 'BA',
        tierLevel: 2,
        minMonthlyCost: 12000000,
        maxMonthlyCost: 14000000,
        monthlyCost: 13000000,
        ...calculateRates(13000000),
        currency: 'IDR',
    },
    {
        id: 'senior_ba_1',
        resourceName: 'Senior BA',
        roleType: 'BA',
        tierLevel: 3,
        minMonthlyCost: 14000000,
        maxMonthlyCost: 16000000,
        monthlyCost: 15000000,
        ...calculateRates(15000000),
        currency: 'IDR',
    },
    {
        id: 'lead_ba_1',
        resourceName: 'Lead BA',
        roleType: 'BA',
        tierLevel: 4,
        minMonthlyCost: 16000000,
        maxMonthlyCost: 18000000,
        monthlyCost: 17000000,
        ...calculateRates(17000000),
        currency: 'IDR',
    },
    {
        id: 'principal_ba_1',
        resourceName: 'Principal BA',
        roleType: 'BA',
        tierLevel: 5,
        minMonthlyCost: 18000000,
        maxMonthlyCost: 20000000,
        monthlyCost: 19000000,
        ...calculateRates(19000000),
        currency: 'IDR',
    },
    // PM Tiers (15M - 25M range)
    {
        id: 'junior_pm_1',
        resourceName: 'Junior PM',
        roleType: 'PM',
        tierLevel: 1,
        minMonthlyCost: 15000000,
        maxMonthlyCost: 17000000,
        monthlyCost: 16000000,
        ...calculateRates(16000000),
        currency: 'IDR',
    },
    {
        id: 'pm_1',
        resourceName: 'PM',
        roleType: 'PM',
        tierLevel: 2,
        minMonthlyCost: 17000000,
        maxMonthlyCost: 19000000,
        monthlyCost: 18000000,
        ...calculateRates(18000000),
        currency: 'IDR',
    },
    {
        id: 'senior_pm_1',
        resourceName: 'Senior PM',
        roleType: 'PM',
        tierLevel: 3,
        minMonthlyCost: 19000000,
        maxMonthlyCost: 21000000,
        monthlyCost: 20000000,
        ...calculateRates(20000000),
        currency: 'IDR',
    },
    {
        id: 'lead_pm_1',
        resourceName: 'Lead PM',
        roleType: 'PM',
        tierLevel: 4,
        minMonthlyCost: 21000000,
        maxMonthlyCost: 23000000,
        monthlyCost: 22000000,
        ...calculateRates(22000000),
        currency: 'IDR',
    },
    {
        id: 'principal_pm_1',
        resourceName: 'Principal PM',
        roleType: 'PM',
        tierLevel: 5,
        minMonthlyCost: 23000000,
        maxMonthlyCost: 25000000,
        monthlyCost: 24000000,
        ...calculateRates(24000000),
        currency: 'IDR',
    },
];
