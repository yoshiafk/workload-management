/**
 * Recalculation Utility
 * Recalculates all allocations when dependencies change
 */

import {
    calculatePlanEndDate,
    calculateProjectCost,
    calculateMonthlyCost,
    calculateWorkloadPercentage,
} from './calculations';

/**
 * Recalculate all allocations based on current settings
 * Call this when costs, complexity, or task templates change
 * 
 * @param {Array} allocations - Current allocation records
 * @param {Object} complexity - Complexity settings
 * @param {Array} costs - Resource cost records
 * @param {Array} tasks - Task template records
 * @param {Array} holidays - Holiday records
 * @param {Array} leaves - Leave records
 * @param {Array} members - Team member records
 * @param {Array} costCenters - Cost center records (optional)
 * @returns {Array} Updated allocations with recalculated values
 */
export function recalculateAllocations(allocations, complexity, costs, tasks, holidays, leaves, members = [], costCenters = []) {
    return allocations.map(allocation => {
        // Skip if missing required fields
        if (!allocation.plan?.taskStart || !allocation.resource || !allocation.complexity) {
            return allocation;
        }

        try {
            // Find the member to get their costTierId and costCenterId
            const member = members.find(m => m.name === allocation.resource);
            const costTierId = member?.costTierId;
            const memberCostCenterId = member?.costCenterId;

            // Find the cost center information
            const costCenter = costCenters.find(cc => cc.id === memberCostCenterId);

            // Recalculate end date
            const taskEnd = calculatePlanEndDate(
                allocation.plan.taskStart,
                allocation.complexity,
                allocation.resource,
                holidays,
                leaves,
                complexity
            );

            // Support tasks have zero cost
            const isProject = allocation.category === 'Project';
            const costProject = isProject ? calculateProjectCost(
                allocation.complexity,
                costTierId || allocation.resource, // Fallback to name if no ID (for legacy/custom)
                complexity,
                costs
            ) : 0;

            // Recalculate monthly cost
            const costMonthly = calculateMonthlyCost(
                costProject,
                allocation.plan.taskStart,
                taskEnd
            );

            // Recalculate workload percentage
            const workload = calculateWorkloadPercentage(
                allocation.taskName,
                allocation.complexity,
                tasks
            );

            // Update cost center information
            const costCenterSnapshot = costCenter ? {
                id: costCenter.id,
                code: costCenter.code,
                name: costCenter.name,
            } : null;

            return {
                ...allocation,
                plan: {
                    ...allocation.plan,
                    taskEnd: taskEnd.toISOString().split('T')[0],
                    costProject,
                    costMonthly,
                },
                workload,
                // Cost center integration
                costCenterId: memberCostCenterId || '',
                costCenterSnapshot,
            };
        } catch (error) {
            console.error(`[Recalculate] Failed for allocation ${allocation.id}:`, error);
            return allocation;
        }
    });
}
