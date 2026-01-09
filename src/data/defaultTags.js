/**
 * Default Task Tags
 * Labels for categorizing and filtering tasks
 */

export const defaultTags = [
    {
        id: 'ui-ux',
        name: 'UI/UX',
        color: '#8B5CF6', // Purple
        bgColor: 'rgba(139, 92, 246, 0.1)',
    },
    {
        id: 'backend',
        name: 'Backend',
        color: '#3B82F6', // Blue
        bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
        id: 'database',
        name: 'Database',
        color: '#10B981', // Green
        bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
        id: 'api',
        name: 'API',
        color: '#F59E0B', // Orange
        bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
        id: 'testing',
        name: 'Testing',
        color: '#EC4899', // Pink
        bgColor: 'rgba(236, 72, 153, 0.1)',
    },
    {
        id: 'documentation',
        name: 'Documentation',
        color: '#6B7280', // Gray
        bgColor: 'rgba(107, 114, 128, 0.1)',
    },
    {
        id: 'infrastructure',
        name: 'Infrastructure',
        color: '#EF4444', // Red
        bgColor: 'rgba(239, 68, 68, 0.1)',
    },
    {
        id: 'security',
        name: 'Security',
        color: '#F97316', // Orange-Red
        bgColor: 'rgba(249, 115, 22, 0.1)',
    },
];

/**
 * Get tag by ID
 * @param {string} tagId - Tag identifier
 * @returns {object|null} Tag object or null
 */
export function getTagById(tagId) {
    return defaultTags.find(t => t.id === tagId) || null;
}

/**
 * Get tag options for dropdown/multiselect
 * @returns {array} Array of { value, label } objects
 */
export function getTagOptions() {
    return defaultTags.map(t => ({
        value: t.id,
        label: t.name,
    }));
}
