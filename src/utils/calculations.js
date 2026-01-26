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
 * Calculate Project Cost - Main Entry Point
 * Uses the enhanced tier-aware cost calculation by default
 * Implements the new cost formula: Actual Effort Hours × Tier-Adjusted Hourly Rate
 * Supports selective complexity calculation based on task category
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, User Requirement - Remove Complexity Calculation except for Project Task
 * 
 * @param {string} complexity - Complexity level (low/medium/high/sophisticated)
 * @param {string} resourceReference - Team member name or cost tier ID
 * @param {Object} complexitySettings - Enhanced complexity settings with effort-based model
 * @param {Array} resourceCosts - Resource cost records
 * @param {number} tierLevel - Resource tier level (1=Junior, 2=Mid, 3=Senior, 4=Lead, 5=Principal)
 * @param {number} allocationPercentage - Allocation percentage (0.1 to 1.0, default 1.0)
 * @param {boolean} useLegacy - Whether to use legacy calculation (default false)
 * @param {string|Object} taskOrCategory - Task category or task object (optional, defaults to 'Project')
 * @param {Object} taskTemplate - Task template for simple time estimates (optional)
 * @returns {number|Object} Project cost (number for legacy, object for enhanced)
 */
export function calculateProjectCost(complexity, resourceReference, complexitySettings, resourceCosts, tierLevel = 2, allocationPercentage = 1.0, useLegacy = false, taskOrCategory = 'Project', taskTemplate = null) {
    if (useLegacy) {
        return calculateLegacyProjectCost(complexity, resourceReference, complexitySettings, resourceCosts);
    }
    
    const result = calculateEnhancedProjectCost(complexity, resourceReference, complexitySettings, resourceCosts, tierLevel, allocationPercentage, taskOrCategory, taskTemplate);
    return result.totalCost;
}

/**
 * Calculate Project Cost (Legacy Version - Deprecated)
 * Excel formula: =XLOOKUP(Category, ComplexityLevel, Hours) × XLOOKUP(Resource, ResourceName, PerHourCost)
 * 
 * @deprecated Use calculateEnhancedProjectCost for new implementations
 * @param {string} complexity - Complexity level (low/medium/high)
 * @param {string} resourceReference - Team member name or cost tier ID
 * @param {Object} complexitySettings - Complexity settings
 * @param {Array} resourceCosts - Resource cost records
 * @returns {number} Project cost in IDR
 */
export function calculateLegacyProjectCost(complexity, resourceReference, complexitySettings, resourceCosts) {
    if (!complexity || !resourceReference) return 0;

    // Get hours (BA rate) from complexity settings - this is the multiplier
    const hours = complexitySettings[complexity.toLowerCase()]?.hours || 0;

    // Try to find by ID first (preferred), then by name (legacy/fallback)
    const resource = resourceCosts.find(r =>
        r.id === resourceReference ||
        (r.resourceName && resourceReference && r.resourceName.toLowerCase() === resourceReference.toLowerCase())
    );

    if (!resource) return 0;

    // Cost = Hours × Per Hour Cost
    return hours * resource.perHourCost;
}

/**
 * Calculate Enhanced Project Cost with Tier-Based Skill Adjustments and Selective Complexity
 * Implements the new cost formula: Actual Effort Hours × Tier-Adjusted Hourly Rate
 * Uses selective complexity calculation based on task category
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, User Requirement - Remove Complexity Calculation except for Project Task
 * 
 * @param {string} complexity - Complexity level (low/medium/high/sophisticated)
 * @param {string} resourceReference - Team member name or cost tier ID
 * @param {Object} complexitySettings - Enhanced complexity settings with effort-based model
 * @param {Array} resourceCosts - Resource cost records
 * @param {number} tierLevel - Resource tier level (1=Junior, 2=Mid, 3=Senior, 4=Lead, 5=Principal)
 * @param {number} allocationPercentage - Allocation percentage (0.1 to 1.0, default 1.0)
 * @param {string|Object} taskOrCategory - Task category or task object (optional, defaults to 'Project')
 * @param {Object} taskTemplate - Task template for simple time estimates (optional)
 * @returns {Object} Enhanced cost calculation result with breakdown
 */
export function calculateEnhancedProjectCost(complexity, resourceReference, complexitySettings, resourceCosts, tierLevel = 2, allocationPercentage = 1.0, taskOrCategory = 'Project', taskTemplate = null) {
    if (!complexity || !resourceReference) {
        return {
            totalCost: 0,
            effortHours: 0,
            durationDays: 0,
            hourlyRate: 0,
            breakdown: {
                baseEffortHours: 0,
                adjustedEffortHours: 0,
                skillMultiplier: 1.0,
                complexityMultiplier: 1.0,
                riskMultiplier: 1.0
            }
        };
    }

    // Validate allocation percentage
    const validAllocationPercentage = Math.max(0.1, Math.min(1.0, allocationPercentage));

    // Try to find resource by ID first (preferred), then by name (legacy/fallback)
    const resource = resourceCosts.find(r =>
        r.id === resourceReference ||
        (r.resourceName && resourceReference && r.resourceName.toLowerCase() === resourceReference.toLowerCase())
    );

    if (!resource) {
        return {
            totalCost: 0,
            effortHours: 0,
            durationDays: 0,
            hourlyRate: 0,
            breakdown: {
                baseEffortHours: 0,
                adjustedEffortHours: 0,
                skillMultiplier: 1.0,
                complexityMultiplier: 1.0,
                riskMultiplier: 1.0
            }
        };
    }

    // Get complexity configuration
    const complexityConfig = complexitySettings[complexity.toLowerCase()];
    if (!complexityConfig) {
        return {
            totalCost: 0,
            effortHours: 0,
            durationDays: 0,
            hourlyRate: 0,
            breakdown: {
                baseEffortHours: 0,
                adjustedEffortHours: 0,
                skillMultiplier: 1.0,
                complexityMultiplier: 1.0,
                riskMultiplier: 1.0
            }
        };
    }

    let effortResult;
    
    // Determine calculation method based on task category
    const category = typeof taskOrCategory === 'string' 
        ? taskOrCategory 
        : taskOrCategory?.category || 'Project';
    
    const shouldUseComplexity = category === 'Project';
    
    if (shouldUseComplexity) {
        // Use enhanced effort-based calculation for Project tasks
        if (complexityConfig.baseEffortHours) {
            // Enhanced effort-based model using tier-adjusted calculations
            effortResult = calculateTierAdjustedEffortInternal(complexity, tierLevel, complexityConfig);
        } else {
            // Legacy calculation for backward compatibility
            const hours = complexityConfig.hours || 0;
            effortResult = {
                baseEffortHours: hours,
                adjustedEffortHours: hours,
                skillMultiplier: 1.0,
                complexityMultiplier: 1.0,
                riskMultiplier: 1.0
            };
        }
    } else {
        // Use simple time estimates for Support/Maintenance tasks
        if (taskTemplate && taskTemplate.estimates) {
            const estimate = taskTemplate.estimates[complexity.toLowerCase()];
            const effortHours = estimate?.hours || 0;
            
            effortResult = {
                baseEffortHours: effortHours,
                adjustedEffortHours: effortHours,
                skillMultiplier: 1.0,
                complexityMultiplier: 1.0,
                riskMultiplier: 1.0
            };
        } else {
            // Fallback to complexity calculation if no task template provided
            if (complexityConfig.baseEffortHours) {
                effortResult = calculateTierAdjustedEffortInternal(complexity, tierLevel, complexityConfig);
            } else {
                const hours = complexityConfig.hours || 0;
                effortResult = {
                    baseEffortHours: hours,
                    adjustedEffortHours: hours,
                    skillMultiplier: 1.0,
                    complexityMultiplier: 1.0,
                    riskMultiplier: 1.0
                };
            }
        }
    }

    // Calculate duration separately from effort (Requirements 1.2, 3.3)
    // Duration = Effort Hours ÷ (Allocation Percentage × 8 hours/day)
    const durationDays = Math.ceil(effortResult.adjustedEffortHours / (validAllocationPercentage * 8));

    // Calculate total cost using the new formula: Actual Effort Hours × Tier-Adjusted Hourly Rate
    const totalCost = effortResult.adjustedEffortHours * resource.perHourCost;

    return {
        totalCost: Math.round(totalCost),
        effortHours: effortResult.adjustedEffortHours,
        durationDays: durationDays,
        hourlyRate: resource.perHourCost,
        allocationPercentage: validAllocationPercentage,
        breakdown: {
            baseEffortHours: effortResult.baseEffortHours,
            adjustedEffortHours: effortResult.adjustedEffortHours,
            skillMultiplier: effortResult.skillMultiplier,
            complexityMultiplier: effortResult.complexityMultiplier,
            riskMultiplier: effortResult.riskMultiplier
        }
    };
}

/**
 * Internal helper function to calculate tier-adjusted effort
 * This replicates the logic from defaultComplexity.js to avoid circular imports
 * 
 * @param {string} complexityLevel - The complexity level
 * @param {number} tierLevel - Resource tier level (1-5)
 * @param {Object} complexityConfig - Complexity configuration object
 * @returns {Object} Effort calculation result
 */
function calculateTierAdjustedEffortInternal(complexityLevel, tierLevel, complexityConfig) {
    // Tier-based skill multipliers (Junior: 1.4x, Mid: 1.0x, Senior: 0.8x, Lead: 0.7x, Principal: 0.6x)
    const tierSkillMultipliers = {
        1: 1.4,  // Junior - requires 40% more effort
        2: 1.0,  // Mid - baseline effort (no adjustment)
        3: 0.8,  // Senior - requires 20% less effort
        4: 0.7,  // Lead - requires 30% less effort
        5: 0.6,  // Principal - requires 40% less effort
    };
    
    // Get skill sensitivity from complexity config
    const skillSensitivity = complexityConfig.skillSensitivity || 0.5;
    
    // Get base tier multiplier
    const baseTierMultiplier = tierSkillMultipliers[tierLevel] || tierSkillMultipliers[2]; // Default to mid-tier
    
    // Apply skill sensitivity - higher sensitivity means tier level has more impact
    const adjustedTierMultiplier = 1 + ((baseTierMultiplier - 1) * skillSensitivity);
    
    // Calculate base effort with complexity and risk factors
    const baseEffort = complexityConfig.baseEffortHours;
    const complexityMultiplier = complexityConfig.complexityMultiplier || 1.0;
    const riskMultiplier = complexityConfig.riskFactor || 1.0;
    
    const complexityAdjustedEffort = baseEffort * complexityMultiplier;
    const riskAdjustedEffort = complexityAdjustedEffort * riskMultiplier;
    
    // Apply tier-based skill adjustment
    const finalEffortHours = riskAdjustedEffort * adjustedTierMultiplier;
    
    return {
        baseEffortHours: baseEffort,
        adjustedEffortHours: Math.round(finalEffortHours * 100) / 100, // Round to 2 decimal places
        skillMultiplier: Math.round(adjustedTierMultiplier * 100) / 100,
        complexityMultiplier: complexityMultiplier,
        riskMultiplier: riskMultiplier
    };
}

/**
 * Calculate Duration Days from Effort Hours and Allocation Percentage
 * Implements proper separation of effort from duration (Requirements 1.2, 3.3, 6.2, 6.3)
 * Formula: Duration Days = Effort Hours ÷ (Allocation Percentage × 8 hours/day)
 * 
 * @param {number} effortHours - Actual work effort hours required
 * @param {number} allocationPercentage - Allocation percentage (0.1 to 1.0)
 * @returns {Object} Duration calculation result
 */
export function calculateDurationFromEffort(effortHours, allocationPercentage = 1.0) {
    if (!effortHours || effortHours <= 0) {
        return {
            durationDays: 0,
            effortHours: 0,
            allocationPercentage: allocationPercentage,
            hoursPerDay: 0
        };
    }

    // Validate allocation percentage (0.1 to 1.0)
    const validAllocationPercentage = Math.max(0.1, Math.min(1.0, allocationPercentage));
    
    // Calculate hours per day based on allocation percentage
    const hoursPerDay = validAllocationPercentage * 8; // 8 hours = full working day
    
    // Calculate duration in days (rounded up to whole days)
    const durationDays = Math.ceil(effortHours / hoursPerDay);
    
    return {
        durationDays: durationDays,
        effortHours: effortHours,
        allocationPercentage: validAllocationPercentage,
        hoursPerDay: hoursPerDay
    };
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
 * Get Detailed Cost Breakdown for Enhanced Project Cost Calculation
 * Provides comprehensive cost analysis with all contributing factors (Requirements 3.4)
 * Supports selective complexity calculation based on task category
 * 
 * @param {string} complexity - Complexity level
 * @param {string} resourceReference - Resource reference
 * @param {Object} complexitySettings - Complexity settings
 * @param {Array} resourceCosts - Resource cost records
 * @param {number} tierLevel - Resource tier level
 * @param {number} allocationPercentage - Allocation percentage
 * @param {string|Object} taskOrCategory - Task category or task object (optional, defaults to 'Project')
 * @param {Object} taskTemplate - Task template for simple time estimates (optional)
 * @returns {Object} Detailed cost breakdown
 */
export function getDetailedCostBreakdown(complexity, resourceReference, complexitySettings, resourceCosts, tierLevel = 2, allocationPercentage = 1.0, taskOrCategory = 'Project', taskTemplate = null) {
    // Get the enhanced cost calculation
    const costResult = calculateEnhancedProjectCost(complexity, resourceReference, complexitySettings, resourceCosts, tierLevel, allocationPercentage, taskOrCategory, taskTemplate);
    
    // Get the resource information
    const resource = resourceCosts.find(r =>
        r.id === resourceReference ||
        (r.resourceName && resourceReference && r.resourceName.toLowerCase() === resourceReference.toLowerCase())
    );
    
    // Get complexity configuration
    const complexityConfig = complexitySettings[complexity.toLowerCase()];
    
    // Calculate duration breakdown
    const durationResult = calculateDurationFromEffort(costResult.effortHours, allocationPercentage);
    
    return {
        // Summary
        summary: {
            totalCost: costResult.totalCost,
            effortHours: costResult.effortHours,
            durationDays: costResult.durationDays,
            hourlyRate: costResult.hourlyRate,
            allocationPercentage: costResult.allocationPercentage
        },
        
        // Effort breakdown
        effortBreakdown: {
            baseEffortHours: costResult.breakdown.baseEffortHours,
            afterComplexityMultiplier: costResult.breakdown.baseEffortHours * costResult.breakdown.complexityMultiplier,
            afterRiskMultiplier: costResult.breakdown.baseEffortHours * costResult.breakdown.complexityMultiplier * costResult.breakdown.riskMultiplier,
            finalAdjustedHours: costResult.breakdown.adjustedEffortHours,
            
            // Multipliers applied
            skillMultiplier: costResult.breakdown.skillMultiplier,
            complexityMultiplier: costResult.breakdown.complexityMultiplier,
            riskMultiplier: costResult.breakdown.riskMultiplier
        },
        
        // Duration breakdown
        durationBreakdown: {
            effortHours: durationResult.effortHours,
            allocationPercentage: durationResult.allocationPercentage,
            hoursPerDay: durationResult.hoursPerDay,
            durationDays: durationResult.durationDays
        },
        
        // Cost breakdown
        costBreakdown: {
            baseEffortCost: costResult.breakdown.baseEffortHours * costResult.hourlyRate,
            skillAdjustmentCost: (costResult.breakdown.adjustedEffortHours - costResult.breakdown.baseEffortHours) * costResult.hourlyRate,
            totalCost: costResult.totalCost,
            hourlyRate: costResult.hourlyRate
        },
        
        // Context information
        context: {
            complexity: complexity,
            complexityLabel: complexityConfig?.label || complexity,
            resourceName: resource?.resourceName || resourceReference,
            tierLevel: tierLevel,
            tierLabel: getTierLabel(tierLevel)
        }
    };
}

/**
 * Helper function to get tier label from tier level
 * @param {number} tierLevel - Tier level (1-5)
 * @returns {string} Tier label
 */
function getTierLabel(tierLevel) {
    const tierLabels = {
        1: 'Junior',
        2: 'Mid',
        3: 'Senior',
        4: 'Lead',
        5: 'Principal'
    };
    return tierLabels[tierLevel] || 'Unknown';
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
