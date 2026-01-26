/**
 * Task Type Classifier
 * Determines when to apply complexity calculations vs simple time estimates
 * Requirements: User Requirement - Remove Complexity Calculation except for Project Task
 */

/**
 * Task categories that support different calculation methods
 */
export const TASK_CATEGORIES = {
    PROJECT: 'Project',
    SUPPORT: 'Support', 
    MAINTENANCE: 'Maintenance',
    TERMINAL: 'Terminal'
};

/**
 * Determines if a task should use complexity-based calculations
 * @param {string|Object} taskOrCategory - Task object with category field, or category string
 * @returns {boolean} True if task should use complexity calculations
 */
export function shouldUseComplexityCalculation(taskOrCategory) {
    const category = typeof taskOrCategory === 'string' 
        ? taskOrCategory 
        : taskOrCategory?.category;
    
    if (!category) {
        // Default to simple calculation if category is unknown
        return false;
    }
    
    // Only Project tasks use complexity calculations
    return category === TASK_CATEGORIES.PROJECT;
}

/**
 * Determines if a task should use simple time estimates
 * @param {string|Object} taskOrCategory - Task object with category field, or category string
 * @returns {boolean} True if task should use simple time estimates
 */
export function shouldUseSimpleTimeEstimate(taskOrCategory) {
    const category = typeof taskOrCategory === 'string' 
        ? taskOrCategory 
        : taskOrCategory?.category;
    
    if (!category) {
        // Default to simple calculation if category is unknown
        return true;
    }
    
    // Support, Maintenance, and Terminal tasks use simple time estimates
    // Unknown categories also default to simple time estimates
    return category === TASK_CATEGORIES.SUPPORT || 
           category === TASK_CATEGORIES.MAINTENANCE ||
           category === TASK_CATEGORIES.TERMINAL ||
           !Object.values(TASK_CATEGORIES).includes(category);
}

/**
 * Gets the appropriate calculation method for a task
 * @param {string|Object} taskOrCategory - Task object with category field, or category string
 * @returns {string} 'complexity' or 'simple'
 */
export function getCalculationMethod(taskOrCategory) {
    return shouldUseComplexityCalculation(taskOrCategory) ? 'complexity' : 'simple';
}

/**
 * Calculate effort hours based on task category
 * @param {string|Object} taskOrCategory - Task object with category field, or category string
 * @param {string} complexity - Complexity level (low/medium/high/sophisticated)
 * @param {Object} taskTemplate - Task template with estimates
 * @param {Object} complexitySettings - Complexity settings for complex calculations
 * @param {number} tierLevel - Resource tier level (1-5)
 * @param {Object} options - Additional calculation options
 * @returns {Object} Calculation result with effort hours and method used
 */
export function calculateSelectiveEffort(taskOrCategory, complexity, taskTemplate, complexitySettings, tierLevel = 2, options = {}) {
    const category = typeof taskOrCategory === 'string' 
        ? taskOrCategory 
        : taskOrCategory?.category;
    
    const calculationMethod = getCalculationMethod(category);
    
    if (calculationMethod === 'complexity') {
        // Use complexity-based calculation for Project tasks
        return calculateComplexityBasedEffort(complexity, complexitySettings, tierLevel, options);
    } else {
        // Use simple time estimates for Support/Maintenance tasks
        return calculateSimpleTimeEstimate(complexity, taskTemplate, options);
    }
}

/**
 * Calculate effort using complexity-based model (for Project tasks)
 * @param {string} complexity - Complexity level
 * @param {Object} complexitySettings - Complexity settings
 * @param {number} tierLevel - Resource tier level
 * @param {Object} options - Additional options
 * @returns {Object} Complexity-based calculation result
 */
function calculateComplexityBasedEffort(complexity, complexitySettings, tierLevel, options = {}) {
    // Get complexity configuration
    const complexityConfig = complexitySettings[complexity.toLowerCase()];
    if (!complexityConfig) {
        return {
            effortHours: 0,
            baseEffortHours: 0,
            method: 'complexity',
            breakdown: {
                skillMultiplier: 1.0,
                complexityMultiplier: 1.0,
                riskMultiplier: 1.0
            }
        };
    }

    // Use enhanced effort-based calculation if available
    if (complexityConfig.baseEffortHours) {
        const result = calculateTierAdjustedEffortInternal(complexity, tierLevel, complexityConfig);
        return {
            effortHours: result.adjustedEffortHours,
            baseEffortHours: result.baseEffortHours,
            method: 'complexity',
            breakdown: {
                skillMultiplier: result.skillMultiplier,
                complexityMultiplier: result.complexityMultiplier,
                riskMultiplier: result.riskMultiplier
            }
        };
    } else {
        // Legacy calculation for backward compatibility
        const hours = complexityConfig.hours || 0;
        return {
            effortHours: hours,
            baseEffortHours: hours,
            method: 'complexity',
            breakdown: {
                skillMultiplier: 1.0,
                complexityMultiplier: 1.0,
                riskMultiplier: 1.0
            }
        };
    }
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
 * Calculate effort using simple time estimates (for Support/Maintenance tasks)
 * @param {string} complexity - Complexity level
 * @param {Object} taskTemplate - Task template with estimates
 * @param {Object} options - Additional options
 * @returns {Object} Simple time estimate result
 */
function calculateSimpleTimeEstimate(complexity, taskTemplate, options = {}) {
    if (!taskTemplate || !taskTemplate.estimates) {
        return {
            effortHours: 0,
            baseEffortHours: 0,
            method: 'simple',
            breakdown: {
                skillMultiplier: 1.0,
                complexityMultiplier: 1.0,
                riskMultiplier: 1.0
            }
        };
    }
    
    const estimate = taskTemplate.estimates[complexity.toLowerCase()];
    if (!estimate) {
        return {
            effortHours: 0,
            baseEffortHours: 0,
            method: 'simple',
            breakdown: {
                skillMultiplier: 1.0,
                complexityMultiplier: 1.0,
                riskMultiplier: 1.0
            }
        };
    }
    
    // For simple estimates, use the hours directly from the task template
    const effortHours = estimate.hours || 0;
    
    return {
        effortHours: effortHours,
        baseEffortHours: effortHours,
        method: 'simple',
        breakdown: {
            skillMultiplier: 1.0,
            complexityMultiplier: 1.0,
            riskMultiplier: 1.0
        }
    };
}

/**
 * Get task category from various input formats
 * @param {string|Object} input - Task name, task object, or category string
 * @param {Array} taskTemplates - Array of task templates to lookup
 * @returns {string|null} Task category or null if not found
 */
export function getTaskCategory(input, taskTemplates = []) {
    // If input is already a category string
    if (typeof input === 'string' && Object.values(TASK_CATEGORIES).includes(input)) {
        return input;
    }
    
    // If input is a task object with category
    if (typeof input === 'object' && input?.category) {
        return input.category;
    }
    
    // If input is a task name, look it up in templates
    if (typeof input === 'string' && taskTemplates.length > 0) {
        const taskTemplate = taskTemplates.find(t => t.name === input || t.id === input);
        return taskTemplate?.category || null;
    }
    
    return null;
}

/**
 * Validate task category
 * @param {string} category - Category to validate
 * @returns {boolean} True if category is valid
 */
export function isValidTaskCategory(category) {
    return Object.values(TASK_CATEGORIES).includes(category);
}

/**
 * Get all supported task categories
 * @returns {Array<string>} Array of supported categories
 */
export function getSupportedCategories() {
    return Object.values(TASK_CATEGORIES);
}