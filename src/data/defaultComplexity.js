/**
 * Enhanced Complexity Settings - Effort-Based Model
 * Replaces arbitrary multipliers with actual effort hours and comprehensive parameters
 * Maintains backward compatibility with existing allocations
 */

export const defaultComplexity = {
    low: {
        level: 'low',
        label: 'Low',
        
        // Effort-based parameters (Requirements 1.1, 1.4)
        baseEffortHours: 40,           // Actual work effort required
        baselineDays: 5,               // Duration at 100% allocation for mid-tier (40h ÷ 8h/day)
        complexityMultiplier: 0.8,     // Effort adjustment factor for low complexity
        riskFactor: 1.0,               // Risk multiplier (minimal risk)
        skillSensitivity: 0.3,         // How much tier level affects this complexity
        
        // Backward compatibility fields (Requirements 1.5)
        days: 27,                      // Legacy field - preserved for transition
        hours: 14.5,                   // Legacy field - preserved for transition
        workload: 1.8125,              // Legacy field - preserved for transition
        
        // UI properties
        color: '#10b981',              // Green
        
        // Multi-factor scoring support (Requirements 8.1, 8.2)
        technicalComplexity: 2,        // 1-10 scale, low technical complexity
        businessComplexity: 3,         // 1-10 scale, moderate business complexity
        integrationPoints: 1,          // Count of external dependencies
        unknownRequirements: 0.1,      // 10% unclear requirements
    },
    medium: {
        level: 'medium',
        label: 'Medium',
        
        // Effort-based parameters (Requirements 1.1, 1.4)
        baseEffortHours: 120,          // Actual work effort required
        baselineDays: 15,              // Duration at 100% allocation for mid-tier (120h ÷ 8h/day)
        complexityMultiplier: 1.0,     // Effort adjustment factor (baseline)
        riskFactor: 1.2,               // Risk multiplier (moderate risk)
        skillSensitivity: 0.5,         // How much tier level affects this complexity
        
        // Backward compatibility fields (Requirements 1.5)
        days: 72,                      // Legacy field - preserved for transition
        hours: 19,                     // Legacy field - preserved for transition
        workload: 2.375,               // Legacy field - preserved for transition
        
        // UI properties
        color: '#3b82f6',              // Blue
        
        // Multi-factor scoring support (Requirements 8.1, 8.2)
        technicalComplexity: 5,        // 1-10 scale, moderate technical complexity
        businessComplexity: 5,         // 1-10 scale, moderate business complexity
        integrationPoints: 2,          // Count of external dependencies
        unknownRequirements: 0.2,      // 20% unclear requirements
    },
    high: {
        level: 'high',
        label: 'High',
        
        // Effort-based parameters (Requirements 1.1, 1.4)
        baseEffortHours: 320,          // Actual work effort required
        baselineDays: 40,              // Duration at 100% allocation for mid-tier (320h ÷ 8h/day)
        complexityMultiplier: 1.5,     // Effort adjustment factor for high complexity
        riskFactor: 1.8,               // Risk multiplier (high risk)
        skillSensitivity: 0.8,         // How much tier level affects this complexity
        
        // Backward compatibility fields (Requirements 1.5)
        days: 102,                     // Legacy field - preserved for transition
        hours: 30,                     // Legacy field - preserved for transition
        workload: 3.75,                // Legacy field - preserved for transition
        
        // UI properties
        color: '#f59e0b',              // Orange/Amber
        
        // Multi-factor scoring support (Requirements 8.1, 8.2)
        technicalComplexity: 7,        // 1-10 scale, high technical complexity
        businessComplexity: 6,         // 1-10 scale, high business complexity
        integrationPoints: 4,          // Count of external dependencies
        unknownRequirements: 0.3,      // 30% unclear requirements
    },
    sophisticated: {
        level: 'sophisticated',
        label: 'Sophisticated',
        
        // Effort-based parameters (Requirements 1.1, 1.4)
        baseEffortHours: 640,          // Actual work effort required
        baselineDays: 80,              // Duration at 100% allocation for mid-tier (640h ÷ 8h/day)
        complexityMultiplier: 2.5,     // Effort adjustment factor for sophisticated complexity
        riskFactor: 2.5,               // Risk multiplier (very high risk)
        skillSensitivity: 1.2,         // How much tier level affects this complexity
        
        // Backward compatibility fields (Requirements 1.5)
        days: 150,                     // Legacy field - preserved for transition
        hours: 48,                     // Legacy field - preserved for transition
        workload: 6.0,                 // Legacy field - preserved for transition
        
        // UI properties
        color: '#ef4444',              // Red
        
        // Multi-factor scoring support (Requirements 8.1, 8.2)
        technicalComplexity: 9,        // 1-10 scale, very high technical complexity
        businessComplexity: 8,         // 1-10 scale, very high business complexity
        integrationPoints: 6,          // Count of external dependencies
        unknownRequirements: 0.4,      // 40% unclear requirements
    },
};

export const complexityLevels = ['Low', 'Medium', 'High', 'Sophisticated'];

/**
 * Tier-based skill multipliers for effort calculation (Requirements 2.1, 2.2, 2.3)
 * Applied based on resource tierLevel (1=Junior to 5=Principal)
 */
export const tierSkillMultipliers = {
    1: 1.4,  // Junior - requires 40% more effort
    2: 1.0,  // Mid - baseline effort (no adjustment)
    3: 0.8,  // Senior - requires 20% less effort
    4: 0.7,  // Lead - requires 30% less effort
    5: 0.6,  // Principal - requires 40% less effort
};

/**
 * Helper function to get complexity configuration by level
 * @param {string} complexityLevel - The complexity level ('low', 'medium', 'high', 'sophisticated')
 * @returns {Object} Complexity configuration object
 */
export function getComplexityConfig(complexityLevel) {
    const config = defaultComplexity[complexityLevel];
    if (!config) {
        console.warn(`Unknown complexity level: ${complexityLevel}, defaulting to medium`);
        return defaultComplexity.medium;
    }
    return config;
}

/**
 * Get tier-based effort multiplier for a given tier level and skill sensitivity (Requirements 2.1, 2.2, 2.3)
 * This is the core function requested in task 1.3 for tier-based skill adjustment calculations
 * @param {number} tierLevel - Resource tier level (1=Junior, 2=Mid, 3=Senior, 4=Lead, 5=Principal)
 * @param {number} skillSensitivity - How much the tier level affects effort (0.0 to 2.0, default 0.5)
 * @returns {number} Skill multiplier to apply to effort calculations
 */
export function getTierEffortMultiplier(tierLevel, skillSensitivity = 0.5) {
    // Handle edge cases for skill sensitivity
    if (!isFinite(skillSensitivity) || isNaN(skillSensitivity)) {
        skillSensitivity = 0.5; // Default to moderate sensitivity
    }
    
    // Clamp skill sensitivity to reasonable range
    skillSensitivity = Math.max(0, Math.min(skillSensitivity, 2.0));
    
    // Get base tier multiplier (Junior: 1.4x, Mid: 1.0x, Senior: 0.8x, Lead: 0.7x, Principal: 0.6x)
    const baseTierMultiplier = tierSkillMultipliers[tierLevel] || tierSkillMultipliers[2]; // Default to mid-tier
    
    // Apply skill sensitivity - higher sensitivity means tier level has more impact
    // Formula: 1 + ((baseTierMultiplier - 1) * skillSensitivity)
    // This allows skill sensitivity to modulate the impact of tier differences
    const adjustedMultiplier = 1 + ((baseTierMultiplier - 1) * skillSensitivity);
    
    // Ensure result is finite and positive
    if (!isFinite(adjustedMultiplier) || isNaN(adjustedMultiplier) || adjustedMultiplier <= 0) {
        return 1.0; // Fallback to no adjustment
    }
    
    // Round to 2 decimal places for consistency
    return Math.round(adjustedMultiplier * 100) / 100;
}

/**
 * Helper function to calculate tier-adjusted effort hours (Requirements 2.1, 2.3, 2.4, 2.5)
 * @param {string} complexityLevel - The complexity level
 * @param {number} tierLevel - Resource tier level (1-5)
 * @param {Object} options - Additional calculation options
 * @returns {Object} Effort calculation result
 */
export function calculateTierAdjustedEffort(complexityLevel, tierLevel, options = {}) {
    const complexity = getComplexityConfig(complexityLevel);
    
    // Use the new getTierEffortMultiplier function for consistency
    const skillSensitivityFactor = complexity.skillSensitivity || 0.5;
    const adjustedTierMultiplier = getTierEffortMultiplier(tierLevel, skillSensitivityFactor);
    
    // Calculate base effort with complexity and risk factors
    const baseEffort = complexity.baseEffortHours;
    const complexityAdjustedEffort = baseEffort * complexity.complexityMultiplier;
    const riskAdjustedEffort = complexityAdjustedEffort * complexity.riskFactor;
    
    // Apply tier-based skill adjustment
    const finalEffortHours = riskAdjustedEffort * adjustedTierMultiplier;
    
    return {
        baseEffortHours: baseEffort,
        adjustedEffortHours: Math.round(finalEffortHours * 100) / 100, // Round to 2 decimal places
        skillMultiplier: adjustedTierMultiplier,
        complexityMultiplier: complexity.complexityMultiplier,
        riskMultiplier: complexity.riskFactor,
        breakdown: {
            baseEffort,
            afterComplexity: complexityAdjustedEffort,
            afterRisk: riskAdjustedEffort,
            afterSkill: finalEffortHours,
            tierLevel,
            skillSensitivity: skillSensitivityFactor
        }
    };
}

/**
 * Helper function to validate complexity configuration
 * @param {Object} complexityData - Complexity configuration to validate
 * @returns {Object} Validation result
 */
export function validateComplexityConfig(complexityData) {
    const errors = [];
    const warnings = [];
    
    // Required fields validation
    const requiredFields = ['level', 'label', 'baseEffortHours', 'complexityMultiplier', 'riskFactor', 'skillSensitivity'];
    requiredFields.forEach(field => {
        if (complexityData[field] === undefined || complexityData[field] === null) {
            errors.push(`Missing required field: ${field}`);
        }
    });
    
    // Value range validation
    if (complexityData.baseEffortHours !== undefined && complexityData.baseEffortHours !== null && complexityData.baseEffortHours <= 0) {
        errors.push('baseEffortHours must be greater than 0');
    }
    
    if (complexityData.complexityMultiplier !== undefined && complexityData.complexityMultiplier !== null && complexityData.complexityMultiplier <= 0) {
        errors.push('complexityMultiplier must be greater than 0');
    }
    
    if (complexityData.riskFactor !== undefined && complexityData.riskFactor !== null && complexityData.riskFactor < 1.0) {
        warnings.push('riskFactor less than 1.0 reduces effort (unusual but allowed)');
    }
    
    if (complexityData.skillSensitivity !== undefined && complexityData.skillSensitivity !== null && (complexityData.skillSensitivity < 0 || complexityData.skillSensitivity > 2)) {
        warnings.push('skillSensitivity outside typical range 0-2');
    }
    
    // Multi-factor scoring validation (if present)
    if (complexityData.technicalComplexity !== undefined && complexityData.technicalComplexity !== null && (complexityData.technicalComplexity < 1 || complexityData.technicalComplexity > 10)) {
        errors.push('technicalComplexity must be between 1 and 10');
    }
    
    if (complexityData.businessComplexity !== undefined && complexityData.businessComplexity !== null && (complexityData.businessComplexity < 1 || complexityData.businessComplexity > 10)) {
        errors.push('businessComplexity must be between 1 and 10');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate all default complexity configurations on module load
 */
const validationResults = Object.keys(defaultComplexity).map(level => {
    const result = validateComplexityConfig(defaultComplexity[level]);
    if (!result.isValid) {
        console.error(`Invalid complexity configuration for ${level}:`, result.errors);
    }
    if (result.warnings.length > 0) {
        console.warn(`Complexity configuration warnings for ${level}:`, result.warnings);
    }
    return { level, ...result };
});

// Export validation results for testing
export const complexityValidationResults = validationResults;

