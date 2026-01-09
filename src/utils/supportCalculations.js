/**
 * Support Calculation Utilities
 * Handles SLA status, MTTR, and compliance rates
 */

import { parseISO, isAfter, isBefore, differenceInHours } from 'date-fns';

/**
 * Calculate SLA Status based on deadline
 * @param {string|Date} deadline - SLA deadline
 * @returns {string} 'Within SLA' | 'Breached' | 'At Risk'
 */
export function calculateSLAStatus(deadline) {
    if (!deadline) return 'Within SLA';

    const now = new Date();
    const target = typeof deadline === 'string' ? parseISO(deadline) : deadline;

    if (isAfter(now, target)) {
        return 'Breached';
    }

    // At Risk if less than 4 hours remaining
    const hoursLeft = differenceInHours(target, now);
    if (hoursLeft >= 0 && hoursLeft < 4) {
        return 'At Risk';
    }

    return 'Within SLA';
}

/**
 * Calculate Mean Time To Resolution (MTTR)
 * @param {Array} allocations - List of completed allocations
 * @returns {number} Average hours to resolve
 */
export function calculateMTTR(allocations) {
    const supportTasks = allocations.filter(a =>
        a.category === 'Support' &&
        a.taskName === 'Completed' &&
        a.plan?.taskStart &&
        a.plan?.taskEnd
    );

    if (supportTasks.length === 0) return 0;

    const totalHours = supportTasks.reduce((sum, a) => {
        const start = parseISO(a.plan.taskStart);
        const end = parseISO(a.plan.taskEnd);
        return sum + Math.max(0, differenceInHours(end, start));
    }, 0);

    return Math.round(totalHours / supportTasks.length);
}

/**
 * Get SLA Compliance Rate
 * @param {Array} allocations - List of allocations
 * @returns {number} Compliance percentage (0-100)
 */
export function getSLAComplianceRate(allocations) {
    const supportTasks = allocations.filter(a => a.category === 'Support');
    if (supportTasks.length === 0) return 100;

    const withinSLA = supportTasks.filter(a => a.slaStatus !== 'Breached').length;
    return Math.round((withinSLA / supportTasks.length) * 100);
}

/**
 * Get Priority Color
 * @param {string} priority - P1 | P2 | P3 | P4
 * @returns {string} HEX color
 */
export function getPriorityColor(priority) {
    switch (priority) {
        case 'P1': return '#ef4444'; // Red
        case 'P2': return '#f59e0b'; // Amber
        case 'P3': return '#3b82f6'; // Blue
        case 'P4': return '#10b981'; // Green
        default: return '#6b7280'; // Gray
    }
}
