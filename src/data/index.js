/**
 * Data Index - Export all default data
 */

export { defaultHolidays, indonesiaHolidays2025, indonesiaHolidays2026 } from './indonesiaHolidays';
export { defaultTeamMembers } from './defaultTeam';
export { defaultPhases } from './defaultPhases';
export { defaultTaskTemplates } from './defaultTasks';
export { defaultResourceCosts } from './defaultCosts';
export { defaultComplexity, complexityLevels } from './defaultComplexity';
export { defaultRoleTiers, getTierByRoleAndLevel, getTierOptionsForRole } from './defaultRoleTiers';

/**
 * Initial application state with all default data
 */
export const getInitialState = () => ({
    members: [],
    phases: [],
    tasks: [],
    complexity: {},
    costs: [],
    holidays: [],
    leaves: [],
    allocations: [],
    settings: {
        currency: 'IDR',
        theme: 'dark',
    },
    version: '1.0.0',
});
