/**
 * Complexity Settings
 * Pre-loaded from Excel prototype (Library sheet)
 */

export const defaultComplexity = {
    low: {
        level: 'low',
        label: 'Low',
        days: 27,
        hours: 14.5,
        workload: 1.8125, // hours / 8 = 14.5 / 8
        color: '#10b981', // Green
    },
    medium: {
        level: 'medium',
        label: 'Medium',
        days: 72,
        hours: 19,
        workload: 2.375, // hours / 8 = 19 / 8
        color: '#3b82f6', // Blue
    },
    high: {
        level: 'high',
        label: 'High',
        days: 102,
        hours: 30,
        workload: 3.75, // hours / 8 = 30 / 8
        color: '#f59e0b', // Orange/Amber
    },
    sophisticated: {
        level: 'sophisticated',
        label: 'Sophisticated',
        days: 150,
        hours: 48,
        workload: 6, // hours / 8 = 48 / 8
        color: '#ef4444', // Red
    },
};

export const complexityLevels = ['Low', 'Medium', 'High', 'Sophisticated'];

