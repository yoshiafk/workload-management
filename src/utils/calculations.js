/**
 * Calculation Utilities
 * All formulas from Excel prototype translated to JavaScript
 */

import { addDays, differenceInMonths, isWeekend, isSameDay, parseISO } from 'date-fns';

/**
 * Add working days to a date (WORKDAY equivalent)
 * Skips weekends and excluded dates (holidays + leaves)
 * 
 * @param {Date|string} startDate - Start date
 * @param {number} numDays - Number of working days to add
 * @param {Array<string|Date>} excludedDates - Dates to skip (holidays, leaves)
 * @returns {Date} The resulting date
 */
export function addWorkdays(startDate, numDays, excludedDates = []) {
    const start = typeof startDate === 'string' ? parseISO(startDate) : new Date(startDate);
    const excluded = excludedDates.map(d => typeof d === 'string' ? parseISO(d) : new Date(d));

    let current = new Date(start);
    let daysAdded = 0;

    while (daysAdded < numDays) {
        current = addDays(current, 1);

        if (!isWeekend(current) && !isExcludedDate(current, excluded)) {
            daysAdded++;
        }
    }

    return current;
}

/**
 * Check if a date is in the excluded list
 */
function isExcludedDate(date, excludedDates) {
    return excludedDates.some(excluded => isSameDay(date, excluded));
}

/**
 * Count working days between two dates (NETWORKDAYS equivalent)
 * 
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {Array<string|Date>} holidays - Holiday dates to exclude
 * @returns {number} Number of working days
 */
export function countWorkdays(startDate, endDate, holidays = []) {
    const start = typeof startDate === 'string' ? parseISO(startDate) : new Date(startDate);
    const end = typeof endDate === 'string' ? parseISO(endDate) : new Date(endDate);
    const excluded = holidays.map(d => typeof d === 'string' ? parseISO(d) : new Date(d));

    let count = 0;
    let current = new Date(start);

    while (current <= end) {
        if (!isWeekend(current) && !isExcludedDate(current, excluded)) {
            count++;
        }
        current = addDays(current, 1);
    }

    return count;
}

/**
 * Calculate Plan End Date
 * =WORKDAY(TaskStart, ComplexityDays, Holidays+Leaves)
 * 
 * @param {string} startDate - Plan TaskStart date
 * @param {string} complexity - Complexity level (low/medium/high)
 * @param {string} resourceName - Team member name
 * @param {Array} holidays - Holiday records
 * @param {Array} leaves - Leave records
 * @param {Object} complexitySettings - Complexity settings object
 * @returns {Date} Calculated end date
 */
export function calculatePlanEndDate(startDate, complexity, resourceName, holidays, leaves, complexitySettings) {
    const durationDays = complexitySettings[complexity.toLowerCase()]?.days || 0;

    // Get member-specific leaves
    const memberLeaves = leaves
        .filter(l => l.memberName === resourceName)
        .map(l => l.date);

    // Combine holidays and leaves
    const excludedDates = [
        ...holidays.map(h => h.date),
        ...memberLeaves,
    ];

    return addWorkdays(startDate, durationDays, excludedDates);
}

/**
 * Calculate Project Cost
 * Excel formula: =XLOOKUP(Category, ComplexityLevel, Hours) × XLOOKUP(Resource, ResourceName, PerHourCost)
 * 
 * @param {string} complexity - Complexity level (low/medium/high)
 * @param {string} resourceReference - Team member name or cost tier ID
 * @param {Object} complexitySettings - Complexity settings
 * @param {Array} resourceCosts - Resource cost records
 * @returns {number} Project cost in IDR
 */
export function calculateProjectCost(complexity, resourceReference, complexitySettings, resourceCosts) {
    if (!complexity || !resourceReference) return 0;

    // Get hours (BA rate) from complexity settings - this is the multiplier
    const hours = complexitySettings[complexity.toLowerCase()]?.hours || 0;

    // Try to find by ID first (preferred), then by name (legacy/fallback)
    const resource = resourceCosts.find(r =>
        r.id === resourceReference ||
        r.resourceName.toLowerCase() === resourceReference.toLowerCase()
    );

    if (!resource) return 0;

    // Cost = Hours × Per Hour Cost
    return hours * resource.perHourCost;
}


/**
 * Calculate Monthly Cost
 * =CostProject / DATEDIF(StartDate, EndDate, "m")
 * 
 * @param {number} projectCost - Total project cost
 * @param {string|Date} startDate - Plan start date
 * @param {string|Date} endDate - Plan end date
 * @returns {number} Monthly cost
 */
export function calculateMonthlyCost(projectCost, startDate, endDate) {
    const start = typeof startDate === 'string' ? parseISO(startDate) : new Date(startDate);
    const end = typeof endDate === 'string' ? parseISO(endDate) : new Date(endDate);

    const months = differenceInMonths(end, start) || 1; // Minimum 1 month

    return projectCost / months;
}

/**
 * Calculate Workload Percentage
 * =XLOOKUP(TaskName → ComplexityPercentage)
 * 
 * @param {string} taskName - Task name
 * @param {string} complexity - Complexity level
 * @param {Array} taskTemplates - Task template records
 * @returns {number} Workload percentage (0-1)
 */
export function calculateWorkloadPercentage(taskName, complexity, taskTemplates) {
    const task = taskTemplates.find(t => t.name === taskName);

    if (!task) return 0;

    const level = complexity.toLowerCase();
    const estimate = task.estimates[level];

    if (!estimate) return 0;

    // Formula: Estimated Hours / (Duration Days * 8 hours)
    const durationHours = (estimate.days || 0) * 8;

    if (durationHours === 0) return 0;

    return (estimate.hours || 0) / durationHours;
}

/**
 * Count tasks by member (COUNTIFS equivalent)
 * 
 * @param {string} taskName - Task name to count
 * @param {string} memberName - Member name to filter
 * @param {Array} allocations - Allocation records
 * @returns {number} Count of matching allocations
 */
export function countTasksByMember(taskName, memberName, allocations) {
    return allocations.filter(a =>
        a.taskName === taskName && a.resource === memberName
    ).length;
}

/**
 * Get total workload per member (SUMIFS equivalent)
 * 
 * @param {string} memberName - Member name
 * @param {Array} allocations - Allocation records
 * @returns {number} Total workload percentage
 */
export function getTotalWorkload(memberName, allocations) {
    return allocations
        .filter(a =>
            a.resource === memberName &&
            a.taskName !== 'Completed' &&
            a.taskName !== 'Idle'
        )
        .reduce((sum, a) => sum + (a.workload || 0), 0);
}

/**
 * Get active workload ratio
 * Sum of monthly costs for non-completed tasks / Member monthly cost
 * 
 * @param {string} memberName - Member name
 * @param {Array} allocations - Allocation records
 * @param {Array} resourceCosts - Resource cost records
 * @returns {number} Workload ratio
 */
export function getActiveWorkloadRatio(memberName, allocations, resourceCosts) {
    const activeMonthlyCost = allocations
        .filter(a => a.resource === memberName && a.taskName !== 'Completed')
        .reduce((sum, a) => sum + (a.plan?.costMonthly || 0), 0);

    const resource = resourceCosts.find(r =>
        r.resourceName.toLowerCase() === memberName.toLowerCase()
    );

    if (!resource || resource.monthlyCost === 0) return 0;

    return activeMonthlyCost / resource.monthlyCost;
}

/**
 * Get task allocation matrix
 * 
 * @param {Array} allocations - Allocation records
 * @param {Array} teamMembers - Team member records
 * @param {Array} taskTemplates - Task template records
 * @returns {Object} Matrix object { taskName: { memberName: count } }
 */
export function getTaskMatrix(allocations, teamMembers, taskTemplates) {
    const matrix = {};

    taskTemplates.forEach(task => {
        matrix[task.name] = {};
        teamMembers.forEach(member => {
            matrix[task.name][member.name] = countTasksByMember(task.name, member.name, allocations);
        });
    });

    return matrix;
}

/**
 * Get member workload summaries
 * 
 * @param {Array} allocations - Allocation records
 * @param {Array} teamMembers - Team member records
 * @returns {Array} Array of member workload objects
 */
export function getMemberWorkloads(allocations, teamMembers) {
    return teamMembers.map(member => {
        const totalWorkload = getTotalWorkload(member.name, allocations);
        const maxCapacity = member.maxCapacity || 1.0;
        const baseHours = member.maxHoursPerWeek || 40;

        const currentHours = totalWorkload * baseHours;
        const maxHours = maxCapacity * baseHours;

        return {
            name: member.name,
            totalWorkload,
            maxCapacity,
            currentHours,
            maxHours,
            percentage: maxCapacity > 0 ? (totalWorkload / maxCapacity) * 100 : 0,
            activeCount: allocations
                .filter(a => a.resource === member.name && a.taskName !== 'Completed' && a.taskName !== 'Idle')
                .length,
            completedCount: allocations
                .filter(a => a.resource === member.name && a.taskName === 'Completed')
                .length,
        };
    });
}

/**
 * Format currency as Indonesian Rupiah
 * 
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format percentage
 * 
 * @param {number} value - Value between 0-1 or 0-100
 * @param {boolean} isDecimal - If true, value is 0-1; if false, value is 0-100
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, isDecimal = true) {
    const percentage = isDecimal ? value * 100 : value;
    return `${percentage.toFixed(1)}%`;
}

/**
 * Calculate Monthly Cost Trend
 * Aggregates monthly costs across all allocations over time
 * 
 * @param {Array} allocations - Allocation records
 * @returns {Array} Array of { month, cost } objects
 */
export function calculateMonthlyTrend(allocations) {
    if (!allocations.length) return [];

    // Find min start and max end dates
    const dates = allocations.flatMap(a => {
        const d = [];
        if (a.plan?.taskStart) d.push(new Date(a.plan.taskStart));
        if (a.plan?.taskEnd) d.push(new Date(a.plan.taskEnd));
        return d;
    });

    if (!dates.length) return [];

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // Generate array of all months in range
    const months = [];
    let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    while (current <= end) {
        months.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
    }

    // Calculate cost for each month
    return months.map(monthDate => {
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        const monthlyTotal = allocations.reduce((sum, a) => {
            if (!a.plan?.taskStart || !a.plan?.taskEnd || !a.plan?.costMonthly) return sum;

            const taskStart = new Date(a.plan.taskStart);
            const taskEnd = new Date(a.plan.taskEnd);

            // Check if task is active in this month (overlaps)
            if (taskStart <= monthEnd && taskEnd >= monthStart) {
                return sum + a.plan.costMonthly;
            }
            return sum;
        }, 0);

        return {
            month: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            cost: monthlyTotal
        };
    });
}

/**
 * Get member task availability information
 * Each member can work on up to maxConcurrentTasks (default 5) concurrent tasks
 * 
 * @param {Array} allocations - Allocation records
 * @param {Array} teamMembers - Team member records
 * @param {number} maxConcurrentTasks - Maximum concurrent tasks per member (default 5)
 * @returns {Array} Array of member availability objects
 */
export function getMemberTaskAvailability(allocations, teamMembers, maxConcurrentTasks = 5) {
    return teamMembers.map(member => {
        // Get active tasks (not Completed or Idle), sorted by end date
        const activeTasks = allocations
            .filter(a =>
                a.resource === member.name &&
                a.taskName !== 'Completed' &&
                a.taskName !== 'Idle'
            )
            .sort((a, b) => new Date(a.plan?.taskEnd) - new Date(b.plan?.taskEnd));

        const currentTaskCount = activeTasks.length;
        const hasCapacity = currentTaskCount < maxConcurrentTasks;

        // The "Available From" date is the end date of the (maxConcurrentTasks)th task
        // If under capacity, available now (null)
        const fifthTask = activeTasks[maxConcurrentTasks - 1];
        const availableFrom = hasCapacity ? null : fifthTask?.plan?.taskEnd;

        // Determine status: green (0-2), amber (3-4), red (5+)
        let status = 'available'; // green
        if (currentTaskCount >= maxConcurrentTasks) {
            status = 'at-capacity'; // red
        } else if (currentTaskCount >= 3) {
            status = 'limited'; // amber
        }

        return {
            memberId: member.id,
            memberName: member.name,
            memberType: member.type,
            activeTasks: activeTasks.slice(0, maxConcurrentTasks),
            currentTaskCount,
            maxConcurrentTasks,
            hasCapacity,
            availableFrom,
            status,
        };
    });
}
