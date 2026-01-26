/**
 * Property-Based Tests for Tier-Based Skill Adjustment Correctness
 * Task 1.4: Write property test for tier-based skill adjustments
 * 
 * **Property 3: Tier-Based Skill Adjustment Correctness**
 * **Validates: Requirements 2.1, 2.3, 2.4, 2.5**
 * 
 * For any resource with a tier level (1-5) assigned to any task complexity, 
 * the effort calculation should apply appropriate skill multipliers where 
 * Junior (tier 1) requires more effort than Senior (tier 3), and the 
 * adjustment magnitude should respect the complexity's skill sensitivity factor.
 */

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { 
    calculateTierAdjustedEffort,
    getTierEffortMultiplier,
    getComplexityConfig,
    tierSkillMultipliers
} from './defaultComplexity.js';

describe('Property 3: Tier-Based Skill Adjustment Correctness', () => {
    /**
     * Core Property: Junior developers require more effort than Senior developers
     * This is the fundamental property that validates the tier-based skill system
     */
    test('Junior (tier 1) should always require more effort than Senior (tier 3) for any complexity', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            (complexityLevel) => {
                const juniorResult = calculateTierAdjustedEffort(complexityLevel, 1); // Junior
                const seniorResult = calculateTierAdjustedEffort(complexityLevel, 3); // Senior
                
                // **Validates: Requirements 2.4, 2.5**
                // Junior should require more effort than Senior
                expect(juniorResult.adjustedEffortHours).toBeGreaterThan(seniorResult.adjustedEffortHours);
                
                // Skill multipliers should reflect this relationship
                expect(juniorResult.skillMultiplier).toBeGreaterThan(seniorResult.skillMultiplier);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Tier Progression Property: Effort should decrease as tier level increases
     * Higher tier levels represent higher skill, which should result in less effort required
     */
    test('Effort should decrease as tier level increases (higher skill = less effort)', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            (complexityLevel) => {
                // Calculate effort for all tier levels
                const tierResults = [1, 2, 3, 4, 5].map(tier => ({
                    tier,
                    effort: calculateTierAdjustedEffort(complexityLevel, tier).adjustedEffortHours,
                    multiplier: calculateTierAdjustedEffort(complexityLevel, tier).skillMultiplier
                }));
                
                // **Validates: Requirements 2.1, 2.3**
                // Effort should generally decrease as tier increases
                for (let i = 1; i < tierResults.length; i++) {
                    expect(tierResults[i].effort).toBeLessThanOrEqual(tierResults[i-1].effort);
                    expect(tierResults[i].multiplier).toBeLessThanOrEqual(tierResults[i-1].multiplier);
                }
                
                // Specific tier multiplier validation
                const juniorEffort = tierResults[0].effort;    // Tier 1
                const midEffort = tierResults[1].effort;       // Tier 2
                const seniorEffort = tierResults[2].effort;    // Tier 3
                const leadEffort = tierResults[3].effort;      // Tier 4
                const principalEffort = tierResults[4].effort; // Tier 5
                
                expect(juniorEffort).toBeGreaterThanOrEqual(midEffort);
                expect(midEffort).toBeGreaterThanOrEqual(seniorEffort);
                expect(seniorEffort).toBeGreaterThanOrEqual(leadEffort);
                expect(leadEffort).toBeGreaterThanOrEqual(principalEffort);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Skill Sensitivity Property: Adjustment magnitude should respect complexity's skill sensitivity
     * Different complexity levels should have different sensitivity to skill level differences
     */
    test('Skill adjustment magnitude should respect complexity skill sensitivity factor', () => {
        fc.assert(fc.property(
            fc.integer({ min: 1, max: 5 }), // Valid tier levels only
            (tierLevel) => {
                // Compare low complexity (low skill sensitivity) vs high complexity (high skill sensitivity)
                const lowComplexityResult = calculateTierAdjustedEffort('low', tierLevel);
                const highComplexityResult = calculateTierAdjustedEffort('high', tierLevel);
                
                const lowConfig = getComplexityConfig('low');
                const highConfig = getComplexityConfig('high');
                
                // **Validates: Requirements 2.3**
                // High complexity should have higher skill sensitivity than low complexity
                expect(highConfig.skillSensitivity).toBeGreaterThan(lowConfig.skillSensitivity);
                
                // For non-mid-tier resources, the skill multiplier difference should be more pronounced
                // in high complexity tasks due to higher skill sensitivity
                if (tierLevel !== 2) { // Skip mid-tier (baseline)
                    const baseTierMultiplier = tierSkillMultipliers[tierLevel];
                    const midTierMultiplier = tierSkillMultipliers[2]; // 1.0
                    
                    // Ensure we have valid multipliers
                    if (baseTierMultiplier && isFinite(baseTierMultiplier) && isFinite(midTierMultiplier)) {
                        // Calculate expected multipliers based on skill sensitivity
                        const lowExpectedMultiplier = 1 + ((baseTierMultiplier - 1) * lowConfig.skillSensitivity);
                        const highExpectedMultiplier = 1 + ((baseTierMultiplier - 1) * highConfig.skillSensitivity);
                        
                        // Ensure calculated multipliers are valid
                        if (isFinite(lowExpectedMultiplier) && isFinite(highExpectedMultiplier)) {
                            // The difference from baseline should be larger for high complexity
                            const lowDifferenceFromBaseline = Math.abs(lowExpectedMultiplier - midTierMultiplier);
                            const highDifferenceFromBaseline = Math.abs(highExpectedMultiplier - midTierMultiplier);
                            
                            expect(highDifferenceFromBaseline).toBeGreaterThanOrEqual(lowDifferenceFromBaseline);
                        }
                    }
                }
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Skill Multiplier Formula Property: Validates the mathematical formula for skill multipliers
     * Formula: 1 + ((baseTierMultiplier - 1) * skillSensitivity)
     */
    test('Skill multipliers should follow the correct mathematical formula', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels only
            (complexityLevel, tierLevel) => {
                const result = calculateTierAdjustedEffort(complexityLevel, tierLevel);
                const config = getComplexityConfig(complexityLevel);
                const baseTierMultiplier = tierSkillMultipliers[tierLevel];
                
                // **Validates: Requirements 2.1, 2.2**
                // Calculate expected multiplier using the formula
                const expectedMultiplier = 1 + ((baseTierMultiplier - 1) * config.skillSensitivity);
                const roundedExpected = Math.round(expectedMultiplier * 100) / 100;
                
                // Ensure we have valid values before comparison
                if (isFinite(result.skillMultiplier) && isFinite(roundedExpected)) {
                    expect(Math.abs(result.skillMultiplier - roundedExpected)).toBeLessThan(0.01);
                    
                    // Verify the multiplier is applied correctly in the calculation
                    const expectedEffort = config.baseEffortHours * 
                                         config.complexityMultiplier * 
                                         config.riskFactor * 
                                         result.skillMultiplier;
                    const roundedExpectedEffort = Math.round(expectedEffort * 100) / 100;
                    
                    if (isFinite(expectedEffort) && isFinite(result.adjustedEffortHours)) {
                        expect(Math.abs(result.adjustedEffortHours - roundedExpectedEffort)).toBeLessThan(0.01);
                    }
                }
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Boundary Values Property: Tests specific tier multiplier values
     * Validates the exact multiplier values defined in the requirements
     */
    test('Should apply correct tier multiplier values as specified in requirements', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            (complexityLevel) => {
                const config = getComplexityConfig(complexityLevel);
                
                // **Validates: Requirements 2.2**
                // Test each tier level with expected base multipliers
                const expectedTierMultipliers = {
                    1: 1.4, // Junior: 40% more effort
                    2: 1.0, // Mid: baseline effort
                    3: 0.8, // Senior: 20% less effort  
                    4: 0.7, // Lead: 30% less effort
                    5: 0.6  // Principal: 40% less effort
                };
                
                Object.entries(expectedTierMultipliers).forEach(([tier, expectedBase]) => {
                    const tierNum = parseInt(tier);
                    const result = calculateTierAdjustedEffort(complexityLevel, tierNum);
                    
                    // Calculate what the skill multiplier should be based on skill sensitivity
                    const expectedSkillMultiplier = 1 + ((expectedBase - 1) * config.skillSensitivity);
                    const roundedExpected = Math.round(expectedSkillMultiplier * 100) / 100;
                    
                    expect(Math.abs(result.skillMultiplier - roundedExpected)).toBeLessThan(0.01);
                });
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Skill Sensitivity Range Property: Tests different skill sensitivity values
     * Validates that skill sensitivity modulates the impact of tier differences
     */
    test('Skill sensitivity should modulate the impact of tier differences correctly', () => {
        fc.assert(fc.property(
            fc.integer({ min: 1, max: 5 }), // Valid tier levels only
            fc.float({ min: 0.0, max: 2.0, noNaN: true }), // Valid skill sensitivity range
            (tierLevel, skillSensitivity) => {
                // Skip infinite values
                if (!isFinite(skillSensitivity)) {
                    return true;
                }
                
                const multiplier = getTierEffortMultiplier(tierLevel, skillSensitivity);
                const baseTierMultiplier = tierSkillMultipliers[tierLevel];
                
                // **Validates: Requirements 2.3**
                // When skill sensitivity is 0, all tiers should have multiplier 1.0 (no skill impact)
                if (Math.abs(skillSensitivity - 0.0) < 0.001) {
                    expect(Math.abs(multiplier - 1.0)).toBeLessThan(0.01);
                }
                
                // When skill sensitivity is 1.0, multiplier should equal base tier multiplier
                if (Math.abs(skillSensitivity - 1.0) < 0.001) {
                    expect(Math.abs(multiplier - baseTierMultiplier)).toBeLessThan(0.01);
                }
                
                // Multiplier should be between 1.0 and base tier multiplier (interpolated)
                if (baseTierMultiplier && isFinite(baseTierMultiplier)) {
                    const minMultiplier = Math.min(1.0, baseTierMultiplier);
                    const maxMultiplier = Math.max(1.0, baseTierMultiplier);
                    
                    if (skillSensitivity >= 0 && skillSensitivity <= 1.0) {
                        expect(multiplier).toBeGreaterThanOrEqual(minMultiplier - 0.01);
                        expect(multiplier).toBeLessThanOrEqual(maxMultiplier + 0.01);
                    }
                }
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Mathematical Consistency Property: Validates internal calculation consistency
     * Ensures all intermediate calculations are mathematically sound
     */
    test('All tier-based calculations should be mathematically consistent', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            (complexityLevel, tierLevel) => {
                const result = calculateTierAdjustedEffort(complexityLevel, tierLevel);
                const config = getComplexityConfig(complexityLevel);
                
                // **Validates: Requirements 2.1, 2.4, 2.5**
                // All values should be positive and finite
                expect(result.baseEffortHours).toBeGreaterThan(0);
                expect(result.adjustedEffortHours).toBeGreaterThan(0);
                expect(result.skillMultiplier).toBeGreaterThan(0);
                expect(result.complexityMultiplier).toBeGreaterThan(0);
                expect(result.riskMultiplier).toBeGreaterThan(0);
                
                expect(isFinite(result.baseEffortHours)).toBe(true);
                expect(isFinite(result.adjustedEffortHours)).toBe(true);
                expect(isFinite(result.skillMultiplier)).toBe(true);
                expect(isFinite(result.complexityMultiplier)).toBe(true);
                expect(isFinite(result.riskMultiplier)).toBe(true);
                
                // Breakdown should be mathematically consistent
                const expectedAfterComplexity = result.baseEffortHours * result.complexityMultiplier;
                const expectedAfterRisk = expectedAfterComplexity * result.riskMultiplier;
                const expectedFinal = expectedAfterRisk * result.skillMultiplier;
                
                expect(Math.abs(result.breakdown.afterComplexity - expectedAfterComplexity)).toBeLessThan(0.01);
                expect(Math.abs(result.breakdown.afterRisk - expectedAfterRisk)).toBeLessThan(0.01);
                expect(Math.abs(result.adjustedEffortHours - expectedFinal)).toBeLessThan(0.01);
                
                // Results should be properly rounded to 2 decimal places
                const decimalPlaces = (result.adjustedEffortHours.toString().split('.')[1] || '').length;
                expect(decimalPlaces).toBeLessThanOrEqual(2);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Edge Cases Property: Tests handling of invalid inputs and edge cases
     * Ensures the system gracefully handles boundary conditions
     */
    test('Should handle edge cases and invalid inputs gracefully', () => {
        fc.assert(fc.property(
            fc.integer(-10, 20), // Include invalid tier levels
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            (tierLevel, complexityLevel) => {
                const result = calculateTierAdjustedEffort(complexityLevel, tierLevel);
                
                // **Validates: Requirements 2.1**
                // Should always return valid results even with invalid inputs
                expect(result.adjustedEffortHours).toBeGreaterThan(0);
                expect(result.skillMultiplier).toBeGreaterThan(0);
                expect(isFinite(result.adjustedEffortHours)).toBe(true);
                expect(isFinite(result.skillMultiplier)).toBe(true);
                expect(isNaN(result.adjustedEffortHours)).toBe(false);
                expect(isNaN(result.skillMultiplier)).toBe(false);
                
                // Invalid tier levels should default to mid-tier behavior
                if (tierLevel < 1 || tierLevel > 5) {
                    const midTierResult = calculateTierAdjustedEffort(complexityLevel, 2);
                    expect(result.skillMultiplier).toBe(midTierResult.skillMultiplier);
                }
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Comparative Property: Tests relative effort differences between tiers
     * Validates that the effort differences make business sense
     */
    test('Effort differences between tiers should be proportional and reasonable', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            (complexityLevel) => {
                const juniorResult = calculateTierAdjustedEffort(complexityLevel, 1);
                const midResult = calculateTierAdjustedEffort(complexityLevel, 2);
                const seniorResult = calculateTierAdjustedEffort(complexityLevel, 3);
                const principalResult = calculateTierAdjustedEffort(complexityLevel, 5);
                
                // **Validates: Requirements 2.4, 2.5**
                // Junior should require up to 40% more effort than Mid-level baseline
                const juniorIncrease = (juniorResult.adjustedEffortHours - midResult.adjustedEffortHours) / midResult.adjustedEffortHours;
                expect(juniorIncrease).toBeGreaterThanOrEqual(0);
                expect(juniorIncrease).toBeLessThanOrEqual(0.5); // Reasonable upper bound
                
                // Principal should require up to 40% less effort than Mid-level baseline
                const principalDecrease = (midResult.adjustedEffortHours - principalResult.adjustedEffortHours) / midResult.adjustedEffortHours;
                expect(principalDecrease).toBeGreaterThanOrEqual(0);
                expect(principalDecrease).toBeLessThanOrEqual(0.5); // Reasonable upper bound
                
                // Senior should be between Mid and Principal
                expect(seniorResult.adjustedEffortHours).toBeLessThanOrEqual(midResult.adjustedEffortHours);
                expect(seniorResult.adjustedEffortHours).toBeGreaterThanOrEqual(principalResult.adjustedEffortHours);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Integration Property: Tests integration with the overall calculation system
     * Validates that tier adjustments work correctly within the broader context
     */
    test('Tier adjustments should integrate correctly with complexity and risk factors', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            (complexityLevel, tierLevel) => {
                const result = calculateTierAdjustedEffort(complexityLevel, tierLevel);
                const config = getComplexityConfig(complexityLevel);
                
                // **Validates: Requirements 2.1, 2.3**
                // Base effort should match complexity configuration
                expect(result.baseEffortHours).toBe(config.baseEffortHours);
                
                // Complexity and risk multipliers should be preserved
                expect(result.complexityMultiplier).toBe(config.complexityMultiplier);
                expect(result.riskMultiplier).toBe(config.riskFactor);
                
                // Final effort should be the product of all factors
                const manualCalculation = config.baseEffortHours * 
                                        config.complexityMultiplier * 
                                        config.riskFactor * 
                                        result.skillMultiplier;
                const roundedManual = Math.round(manualCalculation * 100) / 100;
                
                expect(Math.abs(result.adjustedEffortHours - roundedManual)).toBeLessThan(0.01);
                
                // Skill multiplier should be calculated using the correct skill sensitivity
                const expectedSkillMultiplier = getTierEffortMultiplier(tierLevel, config.skillSensitivity);
                expect(result.skillMultiplier).toBe(expectedSkillMultiplier);
                
                return true;
            }
        ), { numRuns: 100 });
    });
});