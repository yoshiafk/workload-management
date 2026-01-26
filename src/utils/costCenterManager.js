/**
 * Cost Center Manager
 * Handles budget capacity validation and enforcement
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

/**
 * Budget enforcement modes
 */
export const BUDGET_ENFORCEMENT_MODES = {
    STRICT: 'strict',     // Prevent allocations that exceed budget
    WARNING: 'warning',   // Allow but warn about budget overruns
    NONE: 'none'         // No budget enforcement
};

/**
 * Budget validation result types
 */
export const BUDGET_VALIDATION_RESULT = {
    APPROVED: 'approved',
    WARNING: 'warning',
    REJECTED: 'rejected'
};

/**
 * CostCenterManager class for budget capacity validation and enforcement
 */
export class CostCenterManager {
    constructor(costCenters = [], allocations = []) {
        this.costCenters = costCenters;
        this.allocations = allocations;
    }

    /**
     * Update cost centers data
     * @param {Array} costCenters - Array of cost center objects
     */
    updateCostCenters(costCenters) {
        this.costCenters = costCenters;
    }

    /**
     * Update allocations data
     * @param {Array} allocations - Array of allocation objects
     */
    updateAllocations(allocations) {
        this.allocations = allocations;
    }

    /**
     * Get cost center by ID
     * @param {string} costCenterId - Cost center ID
     * @returns {Object|null} Cost center object or null if not found
     */
    getCostCenter(costCenterId) {
        return this.costCenters.find(cc => cc.id === costCenterId) || null;
    }

    /**
     * Calculate current spend for a cost center
     * @param {string} costCenterId - Cost center ID
     * @param {string} period - 'monthly' or 'yearly'
     * @returns {number} Current spend amount
     */
    calculateCurrentSpend(costCenterId, period = 'monthly') {
        const costCenter = this.getCostCenter(costCenterId);
        if (!costCenter) return 0;

        // Return actual spend from cost center data
        return period === 'monthly' ? costCenter.actualMonthlyCost : costCenter.actualYearlyCost;
    }

    /**
     * Calculate projected spend including pending allocations
     * @param {string} costCenterId - Cost center ID
     * @param {number} additionalCost - Additional cost to include in projection
     * @param {string} period - 'monthly' or 'yearly'
     * @returns {number} Projected spend amount
     */
    calculateProjectedSpend(costCenterId, additionalCost = 0, period = 'monthly') {
        const currentSpend = this.calculateCurrentSpend(costCenterId, period);
        
        // Calculate pending allocations cost for this cost center
        const pendingCost = this.calculatePendingAllocationsCost(costCenterId, period);
        
        return currentSpend + pendingCost + additionalCost;
    }

    /**
     * Calculate cost from pending allocations for a cost center
     * @param {string} costCenterId - Cost center ID
     * @param {string} period - 'monthly' or 'yearly'
     * @returns {number} Pending allocations cost
     */
    calculatePendingAllocationsCost(costCenterId, period = 'monthly') {
        // Filter allocations for this cost center
        const costCenterAllocations = this.allocations.filter(allocation => {
            // Check if allocation belongs to this cost center
            return allocation.costCenterId === costCenterId || 
                   allocation.costCenterSnapshot?.id === costCenterId;
        });

        // Sum up the costs based on period
        return costCenterAllocations.reduce((total, allocation) => {
            const cost = period === 'monthly' ? 
                (allocation.plan?.costMonthly || 0) : 
                (allocation.plan?.costProject || 0);
            return total + cost;
        }, 0);
    }

    /**
     * Get available budget for a cost center
     * @param {string} costCenterId - Cost center ID
     * @param {string} period - 'monthly' or 'yearly'
     * @returns {number} Available budget amount
     */
    getAvailableBudget(costCenterId, period = 'monthly') {
        const costCenter = this.getCostCenter(costCenterId);
        if (!costCenter) return 0;

        const totalBudget = period === 'monthly' ? costCenter.monthlyBudget : costCenter.yearlyBudget;
        const projectedSpend = this.calculateProjectedSpend(costCenterId, 0, period);
        
        return Math.max(0, totalBudget - projectedSpend);
    }

    /**
     * Get budget utilization percentage
     * @param {string} costCenterId - Cost center ID
     * @param {string} period - 'monthly' or 'yearly'
     * @returns {number} Utilization percentage (0-100+)
     */
    getBudgetUtilization(costCenterId, period = 'monthly') {
        const costCenter = this.getCostCenter(costCenterId);
        if (!costCenter) return 0;

        const totalBudget = period === 'monthly' ? costCenter.monthlyBudget : costCenter.yearlyBudget;
        if (totalBudget === 0) return 0;

        const projectedSpend = this.calculateProjectedSpend(costCenterId, 0, period);
        return (projectedSpend / totalBudget) * 100;
    }

    /**
     * Get budget enforcement mode for a cost center
     * @param {string} costCenterId - Cost center ID
     * @returns {string} Enforcement mode (strict/warning/none)
     */
    getBudgetEnforcementMode(costCenterId) {
        const costCenter = this.getCostCenter(costCenterId);
        if (!costCenter) return BUDGET_ENFORCEMENT_MODES.NONE;

        return costCenter.budgetEnforcement || BUDGET_ENFORCEMENT_MODES.WARNING;
    }

    /**
     * Validate budget capacity for a new allocation
     * @param {string} costCenterId - Cost center ID
     * @param {number} allocationCost - Cost of the new allocation
     * @param {string} period - 'monthly' or 'yearly'
     * @returns {Object} Validation result
     */
    validateBudgetCapacity(costCenterId, allocationCost, period = 'monthly') {
        const costCenter = this.getCostCenter(costCenterId);
        
        if (!costCenter) {
            return {
                result: BUDGET_VALIDATION_RESULT.REJECTED,
                message: 'Cost center not found',
                details: {
                    costCenterId,
                    allocationCost,
                    period
                }
            };
        }

        const enforcementMode = this.getBudgetEnforcementMode(costCenterId);
        const totalBudget = period === 'monthly' ? costCenter.monthlyBudget : costCenter.yearlyBudget;
        const currentProjectedSpend = this.calculateProjectedSpend(costCenterId, 0, period);
        const newProjectedSpend = currentProjectedSpend + allocationCost;
        const availableBudget = totalBudget - currentProjectedSpend;
        const utilizationAfterAllocation = totalBudget > 0 ? (newProjectedSpend / totalBudget) * 100 : 0;

        // Get over-budget threshold (default to 0% if not specified)
        const overBudgetThreshold = costCenter.overBudgetThreshold || 0;
        const maxAllowedSpend = totalBudget * (1 + overBudgetThreshold / 100);

        const details = {
            costCenterId,
            costCenterName: costCenter.name,
            allocationCost,
            period,
            totalBudget,
            currentProjectedSpend,
            newProjectedSpend,
            availableBudget,
            utilizationAfterAllocation: Math.round(utilizationAfterAllocation * 100) / 100,
            enforcementMode,
            overBudgetThreshold,
            maxAllowedSpend
        };

        // Check if allocation would exceed budget
        const exceedsBudget = newProjectedSpend > totalBudget;
        const exceedsThreshold = newProjectedSpend > maxAllowedSpend;

        // Apply enforcement logic based on mode
        switch (enforcementMode) {
            case BUDGET_ENFORCEMENT_MODES.STRICT:
                if (exceedsBudget) {
                    return {
                        result: BUDGET_VALIDATION_RESULT.REJECTED,
                        message: `Allocation rejected: Would exceed ${period} budget by ${this.formatCurrency(newProjectedSpend - totalBudget)}`,
                        details
                    };
                }
                break;

            case BUDGET_ENFORCEMENT_MODES.WARNING:
                if (exceedsThreshold) {
                    return {
                        result: BUDGET_VALIDATION_RESULT.WARNING,
                        message: `Budget warning: Allocation would exceed ${period} budget threshold (${utilizationAfterAllocation.toFixed(1)}% utilization)`,
                        details
                    };
                } else if (exceedsBudget) {
                    return {
                        result: BUDGET_VALIDATION_RESULT.WARNING,
                        message: `Budget warning: Allocation would exceed ${period} budget by ${this.formatCurrency(newProjectedSpend - totalBudget)}`,
                        details
                    };
                }
                break;

            case BUDGET_ENFORCEMENT_MODES.NONE:
                // No enforcement - always approve
                break;

            default:
                // Default to warning mode
                if (exceedsBudget) {
                    return {
                        result: BUDGET_VALIDATION_RESULT.WARNING,
                        message: `Budget warning: Allocation would exceed ${period} budget by ${this.formatCurrency(newProjectedSpend - totalBudget)}`,
                        details
                    };
                }
                break;
        }

        // Allocation approved
        return {
            result: BUDGET_VALIDATION_RESULT.APPROVED,
            message: `Budget validation passed: ${this.formatCurrency(availableBudget)} remaining in ${period} budget`,
            details
        };
    }

    /**
     * Get comprehensive budget status for a cost center
     * @param {string} costCenterId - Cost center ID
     * @returns {Object} Budget status information
     */
    getBudgetStatus(costCenterId) {
        const costCenter = this.getCostCenter(costCenterId);
        
        if (!costCenter) {
            return {
                found: false,
                costCenterId,
                message: 'Cost center not found'
            };
        }

        const monthlyStatus = this.getBudgetStatusForPeriod(costCenterId, 'monthly');
        const yearlyStatus = this.getBudgetStatusForPeriod(costCenterId, 'yearly');

        return {
            found: true,
            costCenterId,
            costCenterName: costCenter.name,
            costCenterCode: costCenter.code,
            enforcementMode: this.getBudgetEnforcementMode(costCenterId),
            overBudgetThreshold: costCenter.overBudgetThreshold || 0,
            monthly: monthlyStatus,
            yearly: yearlyStatus,
            lastUpdated: costCenter.updatedAt || new Date().toISOString()
        };
    }

    /**
     * Get budget status for a specific period
     * @param {string} costCenterId - Cost center ID
     * @param {string} period - 'monthly' or 'yearly'
     * @returns {Object} Period-specific budget status
     */
    getBudgetStatusForPeriod(costCenterId, period) {
        const costCenter = this.getCostCenter(costCenterId);
        if (!costCenter) return null;

        const totalBudget = period === 'monthly' ? costCenter.monthlyBudget : costCenter.yearlyBudget;
        const currentSpend = this.calculateCurrentSpend(costCenterId, period);
        const projectedSpend = this.calculateProjectedSpend(costCenterId, 0, period);
        const availableBudget = Math.max(0, totalBudget - projectedSpend);
        const utilization = totalBudget > 0 ? (projectedSpend / totalBudget) * 100 : 0;

        return {
            period,
            totalBudget,
            currentSpend,
            projectedSpend,
            availableBudget,
            utilization: Math.round(utilization * 100) / 100,
            status: this.getBudgetStatusText(utilization),
            isOverBudget: projectedSpend > totalBudget
        };
    }

    /**
     * Get budget status text based on utilization
     * @param {number} utilization - Budget utilization percentage
     * @returns {string} Status text
     */
    getBudgetStatusText(utilization) {
        if (utilization >= 100) return 'Over Budget';
        if (utilization >= 90) return 'Critical';
        if (utilization >= 75) return 'High';
        if (utilization >= 40) return 'Moderate';
        return 'Low';
    }

    /**
     * Format currency amount for display
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Validate multiple allocations against budget capacity
     * @param {Array} allocationRequests - Array of allocation request objects
     * @returns {Array} Array of validation results
     */
    validateMultipleAllocations(allocationRequests) {
        return allocationRequests.map(request => {
            const { costCenterId, allocationCost, period = 'monthly' } = request;
            return {
                ...request,
                validation: this.validateBudgetCapacity(costCenterId, allocationCost, period)
            };
        });
    }

    /**
     * Get budget summary for all cost centers
     * @returns {Array} Array of budget summaries
     */
    getAllBudgetSummaries() {
        return this.costCenters.map(costCenter => {
            return this.getBudgetStatus(costCenter.id);
        });
    }

    /**
     * Check if cost center has sufficient budget for allocation
     * @param {string} costCenterId - Cost center ID
     * @param {number} allocationCost - Cost of the allocation
     * @param {string} period - 'monthly' or 'yearly'
     * @returns {boolean} True if sufficient budget available
     */
    hasSufficientBudget(costCenterId, allocationCost, period = 'monthly') {
        const validation = this.validateBudgetCapacity(costCenterId, allocationCost, period);
        return validation.result === BUDGET_VALIDATION_RESULT.APPROVED;
    }

    /**
     * Get cost centers that are over budget
     * @param {string} period - 'monthly' or 'yearly'
     * @returns {Array} Array of over-budget cost centers
     */
    getOverBudgetCostCenters(period = 'monthly') {
        return this.costCenters.filter(costCenter => {
            const utilization = this.getBudgetUtilization(costCenter.id, period);
            return utilization > 100;
        }).map(costCenter => ({
            ...costCenter,
            utilization: this.getBudgetUtilization(costCenter.id, period),
            overageAmount: this.calculateProjectedSpend(costCenter.id, 0, period) - 
                          (period === 'monthly' ? costCenter.monthlyBudget : costCenter.yearlyBudget)
        }));
    }
}

/**
 * Create a new CostCenterManager instance
 * @param {Array} costCenters - Array of cost center objects
 * @param {Array} allocations - Array of allocation objects
 * @returns {CostCenterManager} New CostCenterManager instance
 */
export function createCostCenterManager(costCenters = [], allocations = []) {
    return new CostCenterManager(costCenters, allocations);
}

/**
 * Validate budget capacity for a single allocation (convenience function)
 * @param {string} costCenterId - Cost center ID
 * @param {number} allocationCost - Cost of the allocation
 * @param {Array} costCenters - Array of cost center objects
 * @param {Array} allocations - Array of allocation objects
 * @param {string} period - 'monthly' or 'yearly'
 * @returns {Object} Validation result
 */
export function validateAllocationBudget(costCenterId, allocationCost, costCenters, allocations, period = 'monthly') {
    const manager = new CostCenterManager(costCenters, allocations);
    return manager.validateBudgetCapacity(costCenterId, allocationCost, period);
}

export default CostCenterManager;