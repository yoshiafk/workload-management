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
 * @returns {Array} Updated allocations with recalculated values
 */
export function recalculateAllocations(allocations, complexity, costs, tasks, holidays, leaves) {
    return allocations.map(allocation => {
        // Skip if missing required fields
        if (!allocation.plan?.taskStart || !allocation.resource || !allocation.category) {
            return allocation;
        }

        try {
            // Recalculate end date
            const taskEnd = calculatePlanEndDate(
                allocation.plan.taskStart,
                allocation.category,
                allocation.resource,
                holidays,
                leaves,
                complexity
            );

            // Recalculate project cost
            const costProject = calculateProjectCost(
                allocation.category,
                allocation.resource,
                complexity,
                costs
            );

            // Recalculate monthly cost
            const costMonthly = calculateMonthlyCost(
                costProject,
                allocation.plan.taskStart,
                taskEnd
            );

            // Recalculate workload percentage
            const workload = calculateWorkloadPercentage(
                allocation.taskName,
                allocation.category,
                tasks
            );

            return {
                ...allocation,
                plan: {
                    ...allocation.plan,
                    taskEnd: taskEnd.toISOString().split('T')[0],
                    costProject,
                    costMonthly,
                },
                workload,
            };
        } catch (error) {
            console.error(`[Recalculate] Failed for allocation ${allocation.id}:`, error);
            return allocation;
        }
    });
}
