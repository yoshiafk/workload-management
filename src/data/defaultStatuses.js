/**
 * Default Task Statuses
 * Workflow states for task lifecycle management
 */

export const defaultStatuses = [
    {
        id: 'open',
        name: 'Open',
        description: 'Task created but not started',
        color: '#6B7280', // Gray
        bgColor: 'rgba(107, 114, 128, 0.1)',
        sortOrder: 1,
        isDefault: true,
    },
    {
        id: 'in-progress',
        name: 'In Progress',
        description: 'Task is actively being worked on',
        color: '#3B82F6', // Blue
        bgColor: 'rgba(59, 130, 246, 0.1)',
        sortOrder: 2,
        isDefault: false,
    },
    {
        id: 'under-review',
        name: 'Under Review',
        description: 'Task awaiting approval or testing',
        color: '#F59E0B', // Orange
        bgColor: 'rgba(245, 158, 11, 0.1)',
        sortOrder: 3,
        isDefault: false,
    },
    {
        id: 'completed',
        name: 'Completed',
        description: 'Task finished successfully',
        color: '#10B981', // Green
        bgColor: 'rgba(16, 185, 129, 0.1)',
        sortOrder: 4,
        isDefault: false,
    },
    {
        id: 'on-hold',
        name: 'On Hold',
        description: 'Task paused pending resolution',
        color: '#EF4444', // Red
        bgColor: 'rgba(239, 68, 68, 0.1)',
        sortOrder: 5,
        isDefault: false,
    },
];

/**
 * Get status by ID
 * @param {string} statusId - Status identifier
 * @returns {object|null} Status object or null
 */
export function getStatusById(statusId) {
    return defaultStatuses.find(s => s.id === statusId) || null;
}

/**
 * Get default status for new tasks
 * @returns {object} Default status object
 */
export function getDefaultStatus() {
    return defaultStatuses.find(s => s.isDefault) || defaultStatuses[0];
}

/**
 * Get status options for dropdown
 * @returns {array} Array of { value, label } objects
 */
export function getStatusOptions() {
    return defaultStatuses.map(s => ({
        value: s.id,
        label: s.name,
    }));
}
