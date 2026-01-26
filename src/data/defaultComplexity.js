/**
 * Complexity Settings
 * Enhanced with additional levels for better granularity
 * Pre-loaded from Excel prototype (Library sheet)
 */

export const defaultComplexity = {
    trivial: {
        level: 'trivial',
        label: 'Trivial',
        days: 1,
        hours: 4,
        workload: 0.5, // 4 / 8
        color: '#d1d5db', // Gray
        description: 'Quick fixes, config changes, simple updates',
        examples: ['Config change', 'Text update', 'Simple bug fix']
    },
    small: {
        level: 'small',
        label: 'Small',
        days: 3,
        hours: 12,
        workload: 1.5, // 12 / 8
        color: '#86efac', // Light Green
        description: 'Minor features, straightforward changes',
        examples: ['New field', 'Minor feature', 'UI adjustment']
    },
    low: {
        level: 'low',
        label: 'Low',
        days: 8,
        hours: 32,
        workload: 4.0, // 32 / 8
        color: '#10b981', // Green
        description: 'Standard features with clear requirements',
        examples: ['New form', 'API endpoint', 'Report page']
    },
    medium: {
        level: 'medium',
        label: 'Medium',
        days: 20,
        hours: 80,
        workload: 10.0, // 80 / 8
        color: '#3b82f6', // Blue
        description: 'Moderate complexity, some integration work',
        examples: ['New module', 'Integration', 'Complex feature']
    },
    high: {
        level: 'high',
        label: 'High',
        days: 60,
        hours: 240,
        workload: 30.0, // 240 / 8
        color: '#f59e0b', // Orange/Amber
        description: 'Complex features with significant integration',
        examples: ['Major feature', 'System redesign', 'Multi-team work']
    },
    sophisticated: {
        level: 'sophisticated',
        label: 'Sophisticated',
        days: 180,
        hours: 720,
        workload: 90.0, // 720 / 8
        color: '#ef4444', // Red
        description: 'Highly complex, cross-cutting initiatives',
        examples: ['Platform migration', 'Major refactor', 'New product']
    },
};

export const complexityLevels = ['Trivial', 'Small', 'Low', 'Medium', 'High', 'Sophisticated'];

/**
 * Get complexity configuration by level name
 * @param {string} level - Complexity level name (case-insensitive)
 * @returns {Object|null} Complexity configuration or null if not found
 */
export function getComplexityByLevel(level) {
    if (!level) return null;
    return defaultComplexity[level.toLowerCase()] || null;
}

/**
 * Get all complexity levels as an array for dropdowns
 * @returns {Array} Array of complexity objects
 */
export function getComplexityOptions() {
    return Object.values(defaultComplexity).map(c => ({
        value: c.level,
        label: c.label,
        days: c.days,
        hours: c.hours,
        color: c.color,
        description: c.description
    }));
}
