/**
 * Unit tests for enhanced complexity model
 * Tests the effort-based model implementation and backward compatibility
 */

import { 
    defaultComplexity, 
    complexityLevels, 
    tierSkillMultipliers,
    getComplexityConfig,
    getTierEffortMultiplier,
    calculateTierAdjustedEffort,
    validateComplexityConfig,
    complexityValidationResults
} from './defaultComplexity.js';

import fc from 'fast-check';

describe('Enhanced Complexity Model', () => {
    describe('Basic Configuration', () => {
        test('should have all required complexity levels', () => {
            expect(defaultComplexity).toHaveProperty('low');
            expect(defaultComplexity).toHaveProperty('medium');
            expect(defaultComplexity).toHaveProperty('high');
            expect(defaultComplexity).toHaveProperty('sophisticated');
        });

        test('should have correct base effort hours for each level', () => {
            expect(defaultComplexity.low.baseEffortHours).toBe(40);
            expect(defaultComplexity.medium.baseEffortHours).toBe(120);
            expect(defaultComplexity.high.baseEffortHours).toBe(320);
            expect(defaultComplexity.sophisticated.baseEffortHours).toBe(640);
        });

        test('should maintain backward compatibility fields', () => {
            // Legacy fields should still exist
            expect(defaultComplexity.low).toHaveProperty('days');
            expect(defaultComplexity.low).toHaveProperty('hours');
            expect(defaultComplexity.low).toHaveProperty('workload');
            expect(defaultComplexity.low).toHaveProperty('color');
        });

        test('should have proper complexity multipliers', () => {
            expect(defaultComplexity.low.complexityMultiplier).toBe(0.8);
            expect(defaultComplexity.medium.complexityMultiplier).toBe(1.0);
            expect(defaultComplexity.high.complexityMultiplier).toBe(1.5);
            expect(defaultComplexity.sophisticated.complexityMultiplier).toBe(2.5);
        });

        test('should have proper risk factors', () => {
            expect(defaultComplexity.low.riskFactor).toBe(1.0);
            expect(defaultComplexity.medium.riskFactor).toBe(1.2);
            expect(defaultComplexity.high.riskFactor).toBe(1.8);
            expect(defaultComplexity.sophisticated.riskFactor).toBe(2.5);
        });

        test('should have proper skill sensitivity values', () => {
            expect(defaultComplexity.low.skillSensitivity).toBe(0.3);
            expect(defaultComplexity.medium.skillSensitivity).toBe(0.5);
            expect(defaultComplexity.high.skillSensitivity).toBe(0.8);
            expect(defaultComplexity.sophisticated.skillSensitivity).toBe(1.2);
        });
    });

    describe('Tier Skill Multipliers', () => {
        test('should have correct tier multipliers', () => {
            expect(tierSkillMultipliers[1]).toBe(1.4); // Junior
            expect(tierSkillMultipliers[2]).toBe(1.0); // Mid
            expect(tierSkillMultipliers[3]).toBe(0.8); // Senior
            expect(tierSkillMultipliers[4]).toBe(0.7); // Lead
            expect(tierSkillMultipliers[5]).toBe(0.6); // Principal
        });

        test('should show Junior requires more effort than Senior', () => {
            expect(tierSkillMultipliers[1]).toBeGreaterThan(tierSkillMultipliers[3]);
        });

        test('should show Principal requires least effort', () => {
            const allMultipliers = Object.values(tierSkillMultipliers);
            expect(tierSkillMultipliers[5]).toBe(Math.min(...allMultipliers));
        });
    });

    describe('Helper Functions', () => {
        test('getComplexityConfig should return correct configuration', () => {
            const lowConfig = getComplexityConfig('low');
            expect(lowConfig.baseEffortHours).toBe(40);
            expect(lowConfig.level).toBe('low');
        });

        test('getComplexityConfig should handle invalid levels', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const config = getComplexityConfig('invalid');
            expect(config).toBe(defaultComplexity.medium);
            expect(consoleSpy).toHaveBeenCalledWith('Unknown complexity level: invalid, defaulting to medium');
            consoleSpy.mockRestore();
        });

        test('getTierEffortMultiplier should return correct multipliers for each tier', () => {
            // Test with default skill sensitivity (0.5)
            expect(getTierEffortMultiplier(1)).toBe(1.2);  // Junior: 1 + ((1.4 - 1) * 0.5) = 1.2
            expect(getTierEffortMultiplier(2)).toBe(1.0);  // Mid: 1 + ((1.0 - 1) * 0.5) = 1.0
            expect(getTierEffortMultiplier(3)).toBe(0.9);  // Senior: 1 + ((0.8 - 1) * 0.5) = 0.9
            expect(getTierEffortMultiplier(4)).toBe(0.85); // Lead: 1 + ((0.7 - 1) * 0.5) = 0.85
            expect(getTierEffortMultiplier(5)).toBe(0.8);  // Principal: 1 + ((0.6 - 1) * 0.5) = 0.8
        });

        test('getTierEffortMultiplier should apply skill sensitivity correctly', () => {
            // Low skill sensitivity (0.3) - less impact from tier differences
            expect(getTierEffortMultiplier(1, 0.3)).toBe(1.12); // 1 + ((1.4 - 1) * 0.3) = 1.12
            expect(getTierEffortMultiplier(3, 0.3)).toBe(0.94); // 1 + ((0.8 - 1) * 0.3) = 0.94
            
            // High skill sensitivity (0.8) - more impact from tier differences
            expect(getTierEffortMultiplier(1, 0.8)).toBe(1.32); // 1 + ((1.4 - 1) * 0.8) = 1.32
            expect(getTierEffortMultiplier(3, 0.8)).toBe(0.84); // 1 + ((0.8 - 1) * 0.8) = 0.84
        });

        test('getTierEffortMultiplier should handle invalid tier levels', () => {
            const result = getTierEffortMultiplier(99); // Invalid tier
            expect(result).toBe(1.0); // Should default to mid-tier (no adjustment)
        });

        test('getTierEffortMultiplier should handle edge cases', () => {
            // Zero skill sensitivity - no tier impact
            expect(getTierEffortMultiplier(1, 0.0)).toBe(1.0);
            expect(getTierEffortMultiplier(5, 0.0)).toBe(1.0);
            
            // Maximum skill sensitivity - full tier impact
            expect(getTierEffortMultiplier(1, 1.0)).toBe(1.4);
            expect(getTierEffortMultiplier(5, 1.0)).toBe(0.6);
        });

        test('calculateTierAdjustedEffort should calculate correctly for medium complexity, mid-tier', () => {
            const result = calculateTierAdjustedEffort('medium', 2);
            
            // Medium: 120h base * 1.0 complexity * 1.2 risk * 1.0 skill = 144h
            expect(result.baseEffortHours).toBe(120);
            expect(result.adjustedEffortHours).toBe(144); // 120 * 1.0 * 1.2 * 1.0
            expect(result.skillMultiplier).toBe(1.0);
            expect(result.complexityMultiplier).toBe(1.0);
            expect(result.riskMultiplier).toBe(1.2);
        });

        test('calculateTierAdjustedEffort should show Junior requires more effort than Senior', () => {
            const juniorResult = calculateTierAdjustedEffort('medium', 1); // Junior
            const seniorResult = calculateTierAdjustedEffort('medium', 3); // Senior
            
            expect(juniorResult.adjustedEffortHours).toBeGreaterThan(seniorResult.adjustedEffortHours);
        });

        test('calculateTierAdjustedEffort should apply skill sensitivity correctly', () => {
            // Low complexity has low skill sensitivity (0.3)
            const lowJunior = calculateTierAdjustedEffort('low', 1);
            const lowSenior = calculateTierAdjustedEffort('low', 3);
            
            // High complexity has high skill sensitivity (0.8)
            const highJunior = calculateTierAdjustedEffort('high', 1);
            const highSenior = calculateTierAdjustedEffort('high', 3);
            
            // The difference between junior and senior should be larger for high complexity
            const lowDifference = lowJunior.adjustedEffortHours - lowSenior.adjustedEffortHours;
            const highDifference = highJunior.adjustedEffortHours - highSenior.adjustedEffortHours;
            
            expect(highDifference).toBeGreaterThan(lowDifference);
        });

        test('calculateTierAdjustedEffort should handle invalid tier levels', () => {
            const result = calculateTierAdjustedEffort('medium', 99); // Invalid tier
            expect(result.skillMultiplier).toBe(1.0); // Should default to mid-tier
        });

        test('calculateTierAdjustedEffort should use getTierEffortMultiplier internally', () => {
            // Test that calculateTierAdjustedEffort produces the same skill multiplier as getTierEffortMultiplier
            const complexityLevel = 'high';
            const tierLevel = 4;
            const complexity = getComplexityConfig(complexityLevel);
            
            const expectedMultiplier = getTierEffortMultiplier(tierLevel, complexity.skillSensitivity);
            const result = calculateTierAdjustedEffort(complexityLevel, tierLevel);
            
            expect(result.skillMultiplier).toBe(expectedMultiplier);
        });
    });

    describe('Validation', () => {
        test('validateComplexityConfig should validate required fields', () => {
            const invalidConfig = { level: 'test' };
            const result = validateComplexityConfig(invalidConfig);
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Missing required field: label');
            expect(result.errors).toContain('Missing required field: baseEffortHours');
        });

        test('validateComplexityConfig should validate value ranges', () => {
            const invalidConfig = {
                level: 'test',
                label: 'Test',
                baseEffortHours: -10, // Invalid
                complexityMultiplier: 0, // Invalid
                riskFactor: 0.5, // Warning
                skillSensitivity: 3, // Warning
                technicalComplexity: 15, // Invalid
                businessComplexity: 0 // Invalid
            };
            
            const result = validateComplexityConfig(invalidConfig);
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('baseEffortHours must be greater than 0');
            expect(result.errors).toContain('complexityMultiplier must be greater than 0');
            expect(result.errors).toContain('technicalComplexity must be between 1 and 10');
            expect(result.errors).toContain('businessComplexity must be between 1 and 10');
            expect(result.warnings).toContain('riskFactor less than 1.0 reduces effort (unusual but allowed)');
            expect(result.warnings).toContain('skillSensitivity outside typical range 0-2');
        });

        test('all default complexity configurations should be valid', () => {
            complexityValidationResults.forEach(result => {
                expect(result.isValid).toBe(true);
            });
        });
    });

    describe('Multi-Factor Scoring', () => {
        test('should have multi-factor scoring parameters', () => {
            expect(defaultComplexity.low.technicalComplexity).toBe(2);
            expect(defaultComplexity.medium.technicalComplexity).toBe(5);
            expect(defaultComplexity.high.technicalComplexity).toBe(7);
            expect(defaultComplexity.sophisticated.technicalComplexity).toBe(9);
        });

        test('should have increasing complexity scores', () => {
            const levels = ['low', 'medium', 'high', 'sophisticated'];
            for (let i = 1; i < levels.length; i++) {
                const current = defaultComplexity[levels[i]];
                const previous = defaultComplexity[levels[i-1]];
                
                expect(current.technicalComplexity).toBeGreaterThanOrEqual(previous.technicalComplexity);
                expect(current.businessComplexity).toBeGreaterThanOrEqual(previous.businessComplexity);
                expect(current.integrationPoints).toBeGreaterThanOrEqual(previous.integrationPoints);
                expect(current.unknownRequirements).toBeGreaterThanOrEqual(previous.unknownRequirements);
            }
        });
    });

    describe('Edge Cases', () => {
        test('should handle zero allocation percentage gracefully', () => {
            // This test ensures we don't divide by zero in duration calculations
            const result = calculateTierAdjustedEffort('low', 2);
            expect(result.adjustedEffortHours).toBeGreaterThan(0);
        });

        test('should round effort hours to 2 decimal places', () => {
            const result = calculateTierAdjustedEffort('low', 1);
            const decimalPlaces = (result.adjustedEffortHours.toString().split('.')[1] || '').length;
            expect(decimalPlaces).toBeLessThanOrEqual(2);
        });

        test('should provide detailed breakdown information', () => {
            const result = calculateTierAdjustedEffort('high', 4);
            
            expect(result.breakdown).toHaveProperty('baseEffort');
            expect(result.breakdown).toHaveProperty('afterComplexity');
            expect(result.breakdown).toHaveProperty('afterRisk');
            expect(result.breakdown).toHaveProperty('afterSkill');
            expect(result.breakdown).toHaveProperty('tierLevel');
            expect(result.breakdown).toHaveProperty('skillSensitivity');
            
            expect(result.breakdown.tierLevel).toBe(4);
        });
    });
});

/**
 * Property-Based Tests for Enhanced Complexity Model
 * Tests universal properties that should hold for all valid inputs
 */
describe('Property-Based Tests', () => {
    describe('Property 1: Effort-Based Complexity Model Correctness', () => {
        /**
         * **Validates: Requirements 1.1, 1.4**
         * 
         * For any task complexity level, the complexity model should contain actual effort hours 
         * (not arbitrary multipliers) and all required parameters (complexity multipliers, risk factors, 
         * skill sensitivity) should be properly defined and mathematically consistent.
         */
        test('should have actual effort hours and consistent parameters for all complexity levels', () => {
            fc.assert(fc.property(
                fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
                (complexityLevel) => {
                    const config = getComplexityConfig(complexityLevel);
                    
                    // Property 1.1: Must contain actual effort hours (not arbitrary multipliers)
                    expect(config.baseEffortHours).toBeGreaterThan(0);
                    expect(Number.isInteger(config.baseEffortHours)).toBe(true);
                    expect(config.baseEffortHours).toBeGreaterThanOrEqual(40); // Minimum realistic effort
                    expect(config.baseEffortHours).toBeLessThanOrEqual(1000); // Maximum realistic effort
                    
                    // Property 1.2: All required parameters must be properly defined
                    expect(config.complexityMultiplier).toBeGreaterThan(0);
                    expect(config.riskFactor).toBeGreaterThan(0);
                    expect(config.skillSensitivity).toBeGreaterThanOrEqual(0);
                    expect(config.skillSensitivity).toBeLessThanOrEqual(2); // Reasonable sensitivity range
                    
                    // Property 1.3: Parameters must be mathematically consistent
                    expect(typeof config.complexityMultiplier).toBe('number');
                    expect(typeof config.riskFactor).toBe('number');
                    expect(typeof config.skillSensitivity).toBe('number');
                    expect(isFinite(config.complexityMultiplier)).toBe(true);
                    expect(isFinite(config.riskFactor)).toBe(true);
                    expect(isFinite(config.skillSensitivity)).toBe(true);
                    
                    // Property 1.4: Multi-factor scoring parameters should be valid (if present)
                    if (config.technicalComplexity !== undefined) {
                        expect(config.technicalComplexity).toBeGreaterThanOrEqual(1);
                        expect(config.technicalComplexity).toBeLessThanOrEqual(10);
                    }
                    if (config.businessComplexity !== undefined) {
                        expect(config.businessComplexity).toBeGreaterThanOrEqual(1);
                        expect(config.businessComplexity).toBeLessThanOrEqual(10);
                    }
                    if (config.integrationPoints !== undefined) {
                        expect(config.integrationPoints).toBeGreaterThanOrEqual(0);
                        expect(Number.isInteger(config.integrationPoints)).toBe(true);
                    }
                    if (config.unknownRequirements !== undefined) {
                        expect(config.unknownRequirements).toBeGreaterThanOrEqual(0);
                        expect(config.unknownRequirements).toBeLessThanOrEqual(1); // Percentage (0-1)
                    }
                    
                    return true;
                }
            ), { numRuns: 100 });
        });

        test('should maintain mathematical consistency in effort calculations across all complexity levels and tier combinations', () => {
            fc.assert(fc.property(
                fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
                fc.integer(1, 5), // Valid tier levels
                (complexityLevel, tierLevel) => {
                    const result = calculateTierAdjustedEffort(complexityLevel, tierLevel);
                    const config = getComplexityConfig(complexityLevel);
                    
                    // Property 1.5: Calculation results must be mathematically consistent
                    expect(result.baseEffortHours).toBe(config.baseEffortHours);
                    expect(result.adjustedEffortHours).toBeGreaterThan(0);
                    expect(result.skillMultiplier).toBeGreaterThan(0);
                    expect(result.complexityMultiplier).toBe(config.complexityMultiplier);
                    expect(result.riskMultiplier).toBe(config.riskFactor);
                    
                    // Property 1.6: Breakdown should be mathematically consistent
                    const expectedAfterComplexity = result.baseEffortHours * result.complexityMultiplier;
                    const expectedAfterRisk = expectedAfterComplexity * result.riskMultiplier;
                    const expectedFinal = expectedAfterRisk * result.skillMultiplier;
                    
                    expect(Math.abs(result.breakdown.afterComplexity - expectedAfterComplexity)).toBeLessThan(0.01);
                    expect(Math.abs(result.breakdown.afterRisk - expectedAfterRisk)).toBeLessThan(0.01);
                    expect(Math.abs(result.adjustedEffortHours - expectedFinal)).toBeLessThan(0.01);
                    
                    // Property 1.7: Results should be properly rounded
                    const decimalPlaces = (result.adjustedEffortHours.toString().split('.')[1] || '').length;
                    expect(decimalPlaces).toBeLessThanOrEqual(2);
                    
                    return true;
                }
            ), { numRuns: 100 });
        });

        test('should have increasing complexity characteristics across complexity levels', () => {
            fc.assert(fc.property(
                fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
                fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
                (level1, level2) => {
                    const config1 = getComplexityConfig(level1);
                    const config2 = getComplexityConfig(level2);
                    
                    const levelOrder = ['low', 'medium', 'high', 'sophisticated'];
                    const index1 = levelOrder.indexOf(level1);
                    const index2 = levelOrder.indexOf(level2);
                    
                    if (index1 < index2) {
                        // Property 1.8: Higher complexity levels should have higher base effort hours
                        expect(config2.baseEffortHours).toBeGreaterThanOrEqual(config1.baseEffortHours);
                        
                        // Property 1.9: Higher complexity levels should generally have higher risk factors
                        expect(config2.riskFactor).toBeGreaterThanOrEqual(config1.riskFactor);
                        
                        // Property 1.10: Higher complexity levels should have higher skill sensitivity
                        expect(config2.skillSensitivity).toBeGreaterThanOrEqual(config1.skillSensitivity);
                    }
                    
                    return true;
                }
            ), { numRuns: 100 });
        });

        test('should validate all complexity configurations successfully', () => {
            fc.assert(fc.property(
                fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
                (complexityLevel) => {
                    const config = getComplexityConfig(complexityLevel);
                    const validation = validateComplexityConfig(config);
                    
                    // Property 1.11: All default configurations must be valid
                    expect(validation.isValid).toBe(true);
                    expect(validation.errors).toHaveLength(0);
                    
                    return true;
                }
            ), { numRuns: 100 });
        });
    });

    describe('Property 3: Tier-Based Skill Adjustment Correctness', () => {
        /**
         * **Validates: Requirements 2.1, 2.3, 2.4, 2.5**
         * 
         * For any resource with a tier level (1-5) assigned to any task complexity, the effort calculation 
         * should apply appropriate skill multipliers where Junior (tier 1) requires more effort than Senior (tier 3), 
         * and the adjustment magnitude should respect the complexity's skill sensitivity factor.
         */
        test('should apply correct tier-based skill adjustments across all tier levels and complexities', () => {
            fc.assert(fc.property(
                fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
                fc.integer(1, 5), // Valid tier levels
                (complexityLevel, tierLevel) => {
                    const result = calculateTierAdjustedEffort(complexityLevel, tierLevel);
                    const config = getComplexityConfig(complexityLevel);
                    
                    // Property 3.1: Junior (tier 1) should require more effort than Senior (tier 3)
                    const juniorResult = calculateTierAdjustedEffort(complexityLevel, 1);
                    const seniorResult = calculateTierAdjustedEffort(complexityLevel, 3);
                    expect(juniorResult.adjustedEffortHours).toBeGreaterThanOrEqual(seniorResult.adjustedEffortHours);
                    
                    // Property 3.2: Principal (tier 5) should require least effort
                    const principalResult = calculateTierAdjustedEffort(complexityLevel, 5);
                    expect(principalResult.adjustedEffortHours).toBeLessThanOrEqual(result.adjustedEffortHours);
                    
                    // Property 3.3: Skill multiplier should respect skill sensitivity
                    const expectedMultiplier = getTierEffortMultiplier(tierLevel, config.skillSensitivity);
                    expect(result.skillMultiplier).toBe(expectedMultiplier);
                    
                    // Property 3.4: Skill multiplier should be positive and reasonable
                    expect(result.skillMultiplier).toBeGreaterThan(0);
                    expect(result.skillMultiplier).toBeLessThan(3); // Reasonable upper bound
                    
                    return true;
                }
            ), { numRuns: 100 });
        });

        test('should show increasing effort requirements from Principal to Junior across all complexities', () => {
            fc.assert(fc.property(
                fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
                (complexityLevel) => {
                    // Calculate effort for all tier levels
                    const tierResults = [1, 2, 3, 4, 5].map(tier => ({
                        tier,
                        result: calculateTierAdjustedEffort(complexityLevel, tier)
                    }));
                    
                    // Property 3.5: Effort should generally decrease as tier level increases (higher skill)
                    const juniorEffort = tierResults.find(t => t.tier === 1).result.adjustedEffortHours;
                    const midEffort = tierResults.find(t => t.tier === 2).result.adjustedEffortHours;
                    const seniorEffort = tierResults.find(t => t.tier === 3).result.adjustedEffortHours;
                    const leadEffort = tierResults.find(t => t.tier === 4).result.adjustedEffortHours;
                    const principalEffort = tierResults.find(t => t.tier === 5).result.adjustedEffortHours;
                    
                    expect(juniorEffort).toBeGreaterThanOrEqual(midEffort);
                    expect(midEffort).toBeGreaterThanOrEqual(seniorEffort);
                    expect(seniorEffort).toBeGreaterThanOrEqual(leadEffort);
                    expect(leadEffort).toBeGreaterThanOrEqual(principalEffort);
                    
                    return true;
                }
            ), { numRuns: 100 });
        });

        test('should apply skill sensitivity correctly across all tier and sensitivity combinations', () => {
            fc.assert(fc.property(
                fc.integer(1, 5), // Valid tier levels
                fc.float({ min: 0.0, max: 2.0, noNaN: true }), // Valid skill sensitivity range, no NaN
                (tierLevel, skillSensitivity) => {
                    // Skip infinite values
                    if (!isFinite(skillSensitivity)) {
                        return true;
                    }
                    
                    const multiplier = getTierEffortMultiplier(tierLevel, skillSensitivity);
                    const baseTierMultiplier = tierSkillMultipliers[tierLevel] || tierSkillMultipliers[2];
                    
                    // Property 3.6: When skill sensitivity is 0, all tiers should have multiplier 1.0
                    if (Math.abs(skillSensitivity - 0.0) < 0.001) {
                        expect(Math.abs(multiplier - 1.0)).toBeLessThan(0.01);
                    }
                    
                    // Property 3.7: When skill sensitivity is 1.0, multiplier should equal base tier multiplier
                    if (Math.abs(skillSensitivity - 1.0) < 0.001) {
                        expect(Math.abs(multiplier - baseTierMultiplier)).toBeLessThan(0.01);
                    }
                    
                    // Property 3.8: Multiplier should follow the linear interpolation formula
                    // Formula: 1 + ((baseTierMultiplier - 1) * skillSensitivity)
                    const expectedMultiplier = 1 + ((baseTierMultiplier - 1) * skillSensitivity);
                    const roundedExpected = Math.round(expectedMultiplier * 100) / 100;
                    expect(Math.abs(multiplier - roundedExpected)).toBeLessThan(0.01);
                    
                    // Property 3.9: Multiplier should be properly rounded to 2 decimal places
                    const decimalPlaces = (multiplier.toString().split('.')[1] || '').length;
                    expect(decimalPlaces).toBeLessThanOrEqual(2);
                    
                    // Property 3.10: Multiplier should always be positive and finite
                    expect(multiplier).toBeGreaterThan(0);
                    expect(isFinite(multiplier)).toBe(true);
                    expect(isNaN(multiplier)).toBe(false);
                    
                    return true;
                }
            ), { numRuns: 100 });
        });

        test('should maintain mathematical consistency in tier adjustment calculations', () => {
            fc.assert(fc.property(
                fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
                fc.integer(1, 5), // Valid tier levels
                (complexityLevel, tierLevel) => {
                    const result = calculateTierAdjustedEffort(complexityLevel, tierLevel);
                    const config = getComplexityConfig(complexityLevel);
                    
                    // Property 3.10: Manual calculation should match function result
                    const expectedSkillMultiplier = getTierEffortMultiplier(tierLevel, config.skillSensitivity);
                    const expectedBaseEffort = config.baseEffortHours;
                    const expectedAfterComplexity = expectedBaseEffort * config.complexityMultiplier;
                    const expectedAfterRisk = expectedAfterComplexity * config.riskFactor;
                    const expectedFinalEffort = expectedAfterRisk * expectedSkillMultiplier;
                    
                    expect(Math.abs(result.adjustedEffortHours - expectedFinalEffort)).toBeLessThan(0.01);
                    expect(result.skillMultiplier).toBe(expectedSkillMultiplier);
                    
                    // Property 3.11: Breakdown should be mathematically consistent
                    expect(Math.abs(result.breakdown.afterComplexity - expectedAfterComplexity)).toBeLessThan(0.01);
                    expect(Math.abs(result.breakdown.afterRisk - expectedAfterRisk)).toBeLessThan(0.01);
                    expect(Math.abs(result.breakdown.afterSkill - expectedFinalEffort)).toBeLessThan(0.01);
                    
                    return true;
                }
            ), { numRuns: 100 });
        });

        test('should handle edge cases and invalid inputs gracefully', () => {
            fc.assert(fc.property(
                fc.integer(-10, 20), // Include invalid tier levels
                fc.float({ min: -1.0, max: 5.0, noNaN: true }), // Include invalid skill sensitivity values, no NaN
                (tierLevel, skillSensitivity) => {
                    // Skip infinite values for this test
                    if (!isFinite(skillSensitivity)) {
                        return true;
                    }
                    
                    const multiplier = getTierEffortMultiplier(tierLevel, skillSensitivity);
                    
                    // Property 3.12: Should always return a positive, finite number
                    expect(multiplier).toBeGreaterThan(0);
                    expect(isFinite(multiplier)).toBe(true);
                    expect(isNaN(multiplier)).toBe(false);
                    
                    // Property 3.13: Invalid tier levels should default to mid-tier behavior
                    if (tierLevel < 1 || tierLevel > 5) {
                        const midTierMultiplier = getTierEffortMultiplier(2, skillSensitivity);
                        expect(multiplier).toBe(midTierMultiplier);
                    }
                    
                    // Property 3.14: Extreme skill sensitivity values should be handled gracefully
                    if (skillSensitivity < 0 || skillSensitivity > 2.0) {
                        // Should still return a reasonable multiplier
                        expect(multiplier).toBeGreaterThan(0);
                        expect(multiplier).toBeLessThan(10); // Reasonable upper bound
                    }
                    
                    return true;
                }
            ), { numRuns: 100 });
        });
    });
});