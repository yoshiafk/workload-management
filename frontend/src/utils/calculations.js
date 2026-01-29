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
 * @param {string} category - Work category (Project, Support, Maintenance)
 * @returns {Date} Calculated end date
 */
/**
 * Calculate Plan End Date
 * Excel formula: =WORKDAY(StartDate, Days, ExcludedDates)
 * Refined with Capacity Factor and Half-Day Leave support (Recommendation 1.3, 3.2, 3.3)
 * 
 * @param {string|Date} startDate - Plan start date
 * @param {string} complexity - Complexity level
 * @param {string} resourceName - Resource name (to find member-specific leaves)
 * @param {Array} holidays - Holiday records 
 * @param {Array} leaves - Leave records
 * @param {Object} complexitySettings - Complexity settings
 * @param {string} category - Project or Support
 * @param {number} capacityFactor - Capacity factor (default 0.85)
 * @param {boolean} includeCutiBersama - Whether to include cuti bersama (default true)
 * @returns {Date} Calculated end date
 */
export function calculatePlanEndDate(startDate, complexity, resourceName, holidays, leaves, complexitySettings, category = 'Project', capacityFactor = 0.85, includeCutiBersama = true) {
    const isProject = category === 'Project';
    const complexityLevel = complexitySettings[complexity.toLowerCase()];

    // 1. Get base effort days
    let effortDays = isProject ? (complexityLevel?.days || 0) : 1;

    // 2. Adjust for Capacity Factor (Recommendation 1.3)
    const realisticDays = calculateRealisticDuration(effortDays, capacityFactor);

    // 3. Get member-specific leaves and expand ranges to individual dates
    const memberLeaves = [];
    leaves
        .filter(l => l.memberName === resourceName)
        .forEach(l => {
            const start = parseISO(l.startDate);
            const end = parseISO(l.endDate);
            let current = new Date(start);
            while (current <= end) {
                memberLeaves.push({
                    date: current.toISOString().split('T')[0],
                    type: l.category === 'half-day' ? 'Half' : 'Full',
                    leaveType: l.type // e.g. 'annual', 'sick', 'unpaid'
                });
                current.setDate(current.getDate() + 1);
            }
        });

    // 4. Extract full leaves and half-day leaves (Recommendation 3.2)
    const fullLeaves = memberLeaves.filter(l => l.type !== 'Half').map(l => l.date);
    const halfLeaves = memberLeaves.filter(l => l.type === 'Half').map(l => ({ date: l.date, period: 'AM' }));

    // 5. Get Indonesian holidays (including Cuti Bersama if enabled) (Recommendation 3.3)
    const nationalHolidays = holidays.filter(h => h.type === 'national' || !h.type).map(h => h.date);
    const cutiBersama = includeCutiBersama ? holidays.filter(h => h.type === 'collective').map(h => h.date) : [];

    // 6. Combine all excluded dates
    const excludedDates = [
        ...nationalHolidays,
        ...cutiBersama,
        ...fullLeaves,
    ];

    // 7. Calculate end date using workdays
    let endDate = addWorkdays(startDate, realisticDays, excludedDates);

    // 8. Adjust for half-day leaves (extra padding if leave occurs during project)
    const projectHalfDays = halfLeaves.filter(hl => {
        const d = parseISO(hl.date);
        const s = typeof startDate === 'string' ? parseISO(startDate) : startDate;
        return d >= s && d <= endDate;
    }).length;

    if (projectHalfDays > 0) {
        const extraDays = Math.ceil(projectHalfDays * 0.5);
        endDate = addWorkdays(endDate, extraDays, excludedDates);
    }

    return endDate;
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
export function calculateProjectCost(complexity, resourceReference, complexitySettings, resourceCosts, category = 'Project') {
    if (!complexity || !resourceReference) return 0;

    const isProject = category === 'Project';
    if (!isProject) return 0;

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
export function calculateWorkloadPercentage(taskName, complexity, taskTemplates, category = 'Project') {
    const task = taskTemplates.find(t => t.name === taskName);

    if (!task) return 0;

    const isProject = category === 'Project';
    const level = complexity.toLowerCase();

    // If not project, use a flat 10% workload or similar if not specified in task template
    // Actually, checking if task template has specific mapping
    const estimate = task.estimates[level];

    if (!estimate) return 0;

    // Formula: Estimated Hours / (Duration Days * 8 hours)
    // For non-projects, we might want to use a different base if durationDays is forced to 1
    const durationDays = isProject ? (estimate.days || 1) : 1;
    const durationHours = durationDays * 8;

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

        // Determine status: green (<60%), blue (60-80%), amber (80-100%), red (>100%)
        let status = 'available';
        if (currentTaskCount >= maxConcurrentTasks) {
            status = 'over-capacity';
        } else if (currentTaskCount >= 4) {
            status = 'heavy';
        } else if (currentTaskCount >= 3) {
            status = 'moderate';
        } else if (currentTaskCount >= 1) {
            status = 'light';
        }

        return {
            memberId: member.id,
            memberName: member.name,
            memberType: member.type,
            activeTasks: activeTasks.slice(0, maxConcurrentTasks),
            currentTaskCount,
            maxConcurrentTasks,
            hasCapacity: currentTaskCount < maxConcurrentTasks,
            availableFrom,
            status,
        };
    });
}

/**
 * Aggregate costs by cost center
 * 
 * @param {Array} allocations - Allocation records
 * @param {Array} costCenters - Cost center records
 * @returns {Array} Array of cost center aggregation objects
 */
export function aggregateCostsByCostCenter(allocations, costCenters) {
    const costCenterMap = new Map();

    // Initialize cost centers
    costCenters.forEach(cc => {
        costCenterMap.set(cc.id, {
            costCenter: cc,
            totalProjectCost: 0,
            totalMonthlyCost: 0,
            allocationCount: 0,
            activeAllocationCount: 0,
            allocations: []
        });
    });

    // Add unassigned category
    costCenterMap.set('unassigned', {
        costCenter: { id: 'unassigned', code: 'UNASSIGNED', name: 'Unassigned', isActive: true },
        totalProjectCost: 0,
        totalMonthlyCost: 0,
        allocationCount: 0,
        activeAllocationCount: 0,
        allocations: []
    });

    // Aggregate allocations by cost center
    allocations.forEach(allocation => {
        const costCenterId = allocation.costCenterId || 'unassigned';
        const aggregation = costCenterMap.get(costCenterId);

        if (aggregation) {
            aggregation.totalProjectCost += allocation.plan?.costProject || 0;
            aggregation.totalMonthlyCost += allocation.plan?.costMonthly || 0;
            aggregation.allocationCount += 1;

            if (allocation.status !== 'completed' && allocation.status !== 'cancelled') {
                aggregation.activeAllocationCount += 1;
            }

            aggregation.allocations.push(allocation);
        }
    });

    return Array.from(costCenterMap.values()).filter(agg => agg.allocationCount > 0);
}

/**
 * Get project-level cost center breakdown
 * 
 * @param {Array} allocations - Allocation records
 * @param {string} projectIdentifier - Project identifier (demandNumber or activityName)
 * @param {Array} costCenters - Cost center records
 * @returns {Object} Project cost center breakdown
 */
export function getProjectCostCenterBreakdown(allocations, projectIdentifier, costCenters) {
    // Filter allocations for this project
    const projectAllocations = allocations.filter(a =>
        a.demandNumber === projectIdentifier ||
        a.activityName === projectIdentifier
    );

    if (projectAllocations.length === 0) {
        return {
            projectIdentifier,
            totalCost: 0,
            totalMonthlyCost: 0,
            costCenterBreakdown: []
        };
    }

    // Aggregate by cost center
    const breakdown = aggregateCostsByCostCenter(projectAllocations, costCenters);

    const totalCost = breakdown.reduce((sum, item) => sum + item.totalProjectCost, 0);
    const totalMonthlyCost = breakdown.reduce((sum, item) => sum + item.totalMonthlyCost, 0);

    // Add percentage calculations
    const costCenterBreakdown = breakdown.map(item => ({
        ...item,
        costPercentage: totalCost > 0 ? (item.totalProjectCost / totalCost) * 100 : 0,
        monthlyPercentage: totalMonthlyCost > 0 ? (item.totalMonthlyCost / totalMonthlyCost) * 100 : 0
    }));

    return {
        projectIdentifier,
        totalCost,
        totalMonthlyCost,
        costCenterBreakdown
    };
}

/**
 * Get cost center utilization metrics
 * 
 * @param {Array} allocations - Allocation records
 * @param {Array} teamMembers - Team member records
 * @param {Array} costCenters - Cost center records
 * @returns {Array} Array of cost center utilization objects
 */
export function getCostCenterUtilization(allocations, teamMembers, costCenters) {
    return costCenters.map(costCenter => {
        // Get members assigned to this cost center
        const assignedMembers = teamMembers.filter(m => m.costCenterId === costCenter.id);

        // Get allocations for members in this cost center
        const costCenterAllocations = allocations.filter(a =>
            assignedMembers.some(m => m.name === a.resource)
        );

        // Calculate metrics
        const totalMembers = assignedMembers.length;
        const activeMembers = assignedMembers.filter(m => m.isActive).length;
        const totalAllocations = costCenterAllocations.length;
        const activeAllocations = costCenterAllocations.filter(a =>
            a.status !== 'completed' && a.status !== 'cancelled'
        ).length;

        // Calculate total workload
        const totalWorkload = costCenterAllocations.reduce((sum, a) => sum + (a.workload || 0), 0);
        const maxCapacity = assignedMembers.reduce((sum, m) => sum + (m.maxHoursPerWeek || 40), 0) / 40; // Convert to workload units

        const utilizationRate = maxCapacity > 0 ? (totalWorkload / maxCapacity) * 100 : 0;

        // Calculate costs
        const totalProjectCost = costCenterAllocations.reduce((sum, a) => sum + (a.plan?.costProject || 0), 0);
        const totalMonthlyCost = costCenterAllocations.reduce((sum, a) => sum + (a.plan?.costMonthly || 0), 0);

        return {
            costCenter,
            totalMembers,
            activeMembers,
            totalAllocations,
            activeAllocations,
            totalWorkload,
            maxCapacity,
            utilizationRate: Math.min(utilizationRate, 100), // Cap at 100%
            totalProjectCost,
            totalMonthlyCost,
            allocations: costCenterAllocations
        };
    });
}

/**
 * Aggregate costs by Chart of Accounts (COA)
 * 
 * @param {Array} allocations - Allocation records
 * @param {Array} coa - Chart of accounts records
 * @returns {Array} Array of COA aggregation objects
 */
export function aggregateCostsByCOA(allocations, coa) {
    const coaMap = new Map();

    // Initialize COA accounts
    coa.forEach(account => {
        coaMap.set(account.id, {
            account,
            totalProjectCost: 0,
            totalMonthlyCost: 0,
            allocationCount: 0,
            allocations: []
        });
    });

    // Add unmapped category
    coaMap.set('unmapped', {
        account: { id: 'unmapped', code: 'UNMAPPED', name: 'Unmapped Account', isActive: true },
        totalProjectCost: 0,
        totalMonthlyCost: 0,
        allocationCount: 0,
        allocations: []
    });

    // Aggregate allocations by COA
    allocations.forEach(allocation => {
        const coaId = allocation.coaId || 'unmapped';
        const aggregation = coaMap.get(coaId);

        if (aggregation) {
            aggregation.totalProjectCost += allocation.plan?.costProject || 0;
            aggregation.totalMonthlyCost += allocation.plan?.costMonthly || 0;
            aggregation.allocationCount += 1;
            aggregation.allocations.push(allocation);
        }
    });

    return Array.from(coaMap.values())
        .filter(agg => agg.allocationCount > 0)
        .sort((a, b) => b.totalProjectCost - a.totalProjectCost);
}

// ============================================================================
// BUDGET VARIANCE TRACKING
// ============================================================================

/**
 * Calculate actual cost for a cost center from allocations
 * 
 * @param {string} costCenterId - Cost center ID
 * @param {Array} allocations - All allocations
 * @param {string} period - 'monthly' or 'yearly'
 * @returns {Object} Cost breakdown with actual cost and allocation details
 */
export function calculateActualCostCenterCost(costCenterId, allocations, period = 'monthly') {
    const costCenterAllocations = allocations.filter(a =>
        a.costCenterId === costCenterId &&
        a.status !== 'cancelled'
    );

    const actualCost = costCenterAllocations.reduce((sum, a) => {
        return sum + (period === 'monthly' ? (a.plan?.costMonthly || 0) : (a.plan?.costProject || 0));
    }, 0);

    return {
        costCenterId,
        period,
        actualCost,
        allocationCount: costCenterAllocations.length,
        activeAllocationCount: costCenterAllocations.filter(a =>
            a.status !== 'completed' && a.status !== 'cancelled'
        ).length,
        calculatedAt: new Date().toISOString()
    };
}

/**
 * Calculate budget variance for a cost center
 * 
 * @param {Object} costCenter - Cost center object with monthlyBudget
 * @param {number} actualCost - Actual cost from allocations
 * @returns {Object} Variance analysis with status and severity
 */
export function calculateBudgetVariance(costCenter, actualCost) {
    const budget = costCenter.monthlyBudget || 0;

    if (budget === 0) {
        return {
            costCenterId: costCenter.id,
            costCenterName: costCenter.name,
            budget: 0,
            actualCost,
            variance: null,
            variancePercent: null,
            status: 'no-budget',
            severity: 'info'
        };
    }

    const variance = budget - actualCost;
    const variancePercent = (variance / budget) * 100;

    let status, severity;
    if (variance >= 0) {
        status = 'under-budget';
        severity = variancePercent >= 20 ? 'low' : 'medium';
    } else {
        status = 'over-budget';
        severity = Math.abs(variancePercent) <= 10 ? 'medium' :
            Math.abs(variancePercent) <= 25 ? 'high' : 'critical';
    }

    return {
        costCenterId: costCenter.id,
        costCenterName: costCenter.name,
        budget,
        actualCost,
        variance,
        variancePercent: parseFloat(variancePercent.toFixed(2)),
        status,
        severity,
        utilizationPercent: parseFloat(((actualCost / budget) * 100).toFixed(2))
    };
}

// ============================================================================
// CAPACITY-ADJUSTED MANDAYS CALCULATION
// ============================================================================

const DEFAULT_CAPACITY_FACTOR = 0.85; // 85% effective working time

/**
 * Get effective working days with capacity factor
 * Accounts for meetings, admin work, context switching, breaks
 * 
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {Array} holidays - Holiday dates to exclude
 * @param {number} capacityFactor - Capacity factor (default 0.85 = 85%)
 * @returns {number} Effective working days
 */
export function getEffectiveWorkdays(startDate, endDate, holidays, capacityFactor = DEFAULT_CAPACITY_FACTOR) {
    const rawWorkdays = countWorkdays(startDate, endDate, holidays);
    return Math.floor(rawWorkdays * capacityFactor);
}

/**
 * Calculate realistic calendar duration from effort days
 * Converts effort-based estimate to calendar days considering capacity
 * 
 * @param {number} effortDays - Number of effort days required
 * @param {number} capacityFactor - Capacity factor (default 0.85)
 * @returns {number} Realistic calendar working days needed
 */
export function calculateRealisticDuration(effortDays, capacityFactor = DEFAULT_CAPACITY_FACTOR) {
    if (capacityFactor <= 0) return effortDays;
    return Math.ceil(effortDays / capacityFactor);
}

/**
 * Count workdays with half-day leave support
 * 
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date  
 * @param {Array} holidays - Holiday dates to exclude
 * @param {Array} halfDayLeaves - Array of {date, period: 'AM'|'PM'} objects
 * @returns {number} Working days with half-day adjustments
 */
export function countWorkdaysWithHalfDays(startDate, endDate, holidays, halfDayLeaves = []) {
    const start = typeof startDate === 'string' ? parseISO(startDate) : new Date(startDate);
    const end = typeof endDate === 'string' ? parseISO(endDate) : new Date(endDate);

    const fullDays = countWorkdays(startDate, endDate, holidays);

    const halfDayCount = halfDayLeaves.filter(leave => {
        const leaveDate = typeof leave.date === 'string' ? parseISO(leave.date) : new Date(leave.date);
        return leaveDate >= start && leaveDate <= end;
    }).length;

    return fullDays - (halfDayCount * 0.5);
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate resource cost center assignment
 * Ensures team members are assigned to valid, active cost centers
 * 
 * @param {Object} teamMember - Team member object
 * @param {Array} costCenters - Available cost centers
 * @returns {Object} Validation result with isValid and errors array
 */
export function validateResourceCostCenterAssignment(teamMember, costCenters) {
    const errors = [];
    const warnings = [];

    if (!teamMember.costCenterId) {
        warnings.push({
            field: 'costCenterId',
            message: 'Team member is not assigned to a cost center',
            severity: 'warning'
        });
    } else {
        const costCenter = costCenters.find(cc => cc.id === teamMember.costCenterId);

        if (!costCenter) {
            errors.push({
                field: 'costCenterId',
                message: 'Assigned cost center does not exist',
                severity: 'error'
            });
        } else if (!costCenter.isActive && costCenter.status !== 'Active') {
            errors.push({
                field: 'costCenterId',
                message: `Assigned cost center "${costCenter.name}" is inactive`,
                severity: 'error'
            });
        }
    }

    return {
        isValid: errors.length === 0,
        hasWarnings: warnings.length > 0,
        errors,
        warnings
    };
}

/**
 * Split allocation cost across multiple cost centers
 * Supports proportional cost distribution for shared resources
 * 
 * @param {Object} allocation - Allocation record
 * @param {Array} costCenterSplits - Array of {costCenterId, percentage} objects
 * @returns {Array} Array of split cost records
 * @throws {Error} If percentages don't total 100%
 */
export function splitAllocationCost(allocation, costCenterSplits) {
    if (!costCenterSplits || costCenterSplits.length === 0) {
        return [{
            allocationId: allocation.id,
            costCenterId: allocation.costCenterId || 'unassigned',
            percentage: 100,
            projectCost: allocation.plan?.costProject || 0,
            monthlyCost: allocation.plan?.costMonthly || 0
        }];
    }

    const totalPercentage = costCenterSplits.reduce((sum, s) => sum + s.percentage, 0);

    if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error(`Cost center splits must total 100% (got ${totalPercentage}%)`);
    }

    return costCenterSplits.map(split => ({
        allocationId: allocation.id,
        costCenterId: split.costCenterId,
        percentage: split.percentage,
        projectCost: (allocation.plan?.costProject || 0) * (split.percentage / 100),
        monthlyCost: (allocation.plan?.costMonthly || 0) * (split.percentage / 100)
    }));
}

// ============================================================================
// THREE-POINT ESTIMATION (PERT)
// ============================================================================

/**
 * Calculate three-point estimate using PERT formula
 * PERT = (Optimistic + 4×Realistic + Pessimistic) / 6
 * 
 * @param {string} complexity - Complexity level (low/medium/high/sophisticated)
 * @param {Object} complexitySettings - Complexity settings object
 * @returns {Object} Three-point estimate with optimistic, realistic, pessimistic, and expected values
 */
export function threePointEstimate(complexity, complexitySettings) {
    const level = complexity.toLowerCase();
    const base = complexitySettings[level];

    if (!base || !base.days) {
        return {
            complexity: level,
            optimistic: 0,
            realistic: 0,
            pessimistic: 0,
            expected: 0,
            standardDeviation: 0,
            range: { min: 0, max: 0 }
        };
    }

    const optimistic = Math.floor(base.days * 0.7);    // Best case (-30%)
    const realistic = base.days;                        // Most likely
    const pessimistic = Math.ceil(base.days * 1.5);    // Worst case (+50%)

    // PERT weighted average
    const expected = Math.round((optimistic + 4 * realistic + pessimistic) / 6);

    // Standard deviation for confidence intervals
    const standardDeviation = Math.round((pessimistic - optimistic) / 6);

    return {
        complexity: level,
        optimistic,
        realistic,
        pessimistic,
        expected,
        standardDeviation,
        range: {
            min: Math.max(1, expected - standardDeviation),
            max: expected + standardDeviation
        },
        // Confidence intervals
        confidence68: { min: expected - standardDeviation, max: expected + standardDeviation },
        confidence95: { min: expected - 2 * standardDeviation, max: expected + 2 * standardDeviation }
    };
}

/**
 * Calculate project duration with contingency buffer
 * Adds buffer percentage to base estimate for risk management
 * 
 * @param {string} complexity - Complexity level
 * @param {Object} complexitySettings - Complexity settings
 * @param {number} bufferPercent - Buffer percentage (default 0.15 = 15%)
 * @returns {Object} Duration with buffer details
 */
export function calculateWithBuffer(complexity, complexitySettings, bufferPercent = 0.15) {
    const level = complexity.toLowerCase();
    const base = complexitySettings[level];

    if (!base || !base.days) {
        return {
            baseDays: 0,
            buffer: 0,
            totalDays: 0,
            bufferPercent: `+${(bufferPercent * 100).toFixed(0)}%`
        };
    }

    const baseDays = base.days;
    const buffer = Math.ceil(baseDays * bufferPercent);

    return {
        baseDays,
        buffer,
        totalDays: baseDays + buffer,
        bufferPercent: `+${(bufferPercent * 100).toFixed(0)}%`,
        bufferDays: buffer
    };
}

// ============================================================================
// AUDIT TRAIL
// ============================================================================

/**
 * Log cost-related changes for audit trail
 * Creates structured audit log entry for tracking changes
 * 
 * @param {Object} entity - Entity being changed {type, id, name}
 * @param {string} field - Field being changed
 * @param {*} oldValue - Previous value
 * @param {*} newValue - New value
 * @param {string} userId - User making the change
 * @returns {Object} Audit log entry
 */
export function logCostChange(entity, field, oldValue, newValue, userId = 'system') {
    const changeType = oldValue === null || oldValue === undefined ? 'create' :
        newValue === null || newValue === undefined ? 'delete' : 'update';

    return {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        entity: {
            type: entity.type,
            id: entity.id,
            name: entity.name || entity.id
        },
        field,
        oldValue,
        newValue,
        changedBy: userId,
        changeType
    };
}
