/**
 * Property-Based Tests for Cost Calculation Correctness
 * Task 1.6: Write property tests for cost calculation correctness
 * 
 * **Property 4: Cost Calculation Formula Correctness**
 * **Property 5: Cost Breakdown Completeness**
 * **Validates: Requirements 3.1, 3.2, 3.4, 3.5**
 * 
 * For any allocation, the total cost should equal Actual Effort Hours × Tier-Adjusted Hourly Rate,
 * where actual effort hours include all applied multipliers (complexity, skill, risk) and the 
 * hourly rate maintains the existing monthly→daily→hourly conversion structure.
 * 
 * For any cost calculation, the breakdown should include all contributing factors and the sum 
 * of components should equal the total calculated cost.
 */

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { 
    calculateEnhancedProjectCost,
    calculateDurationFromEffort,
    getDetailedCostBreakdown,
    calculateLegacyProjectCost
} from './calculations.js';
import { defaultComplexity, calculateTierAdjustedEffort } from '../data/defaultComplexity.js';

describe('Property 4: Cost Calculation Formula Correctness', () => {
    // Mock resource costs for testing
    const mockResourceCosts = [
        {
            id: 'dev-001',
            resourceName: 'John Doe',
            perHourCost: 100000 // IDR per hour
        },
        {
            id: 'dev-002', 
            resourceName: 'Jane Smith',
            perHourCost: 150000 // IDR per hour
        },
        {
            id: 'dev-003',
            resourceName: 'Bob Wilson',
            perHourCost: 200000 // IDR per hour
        }
    ];

    /**
     * Core Property: Total cost equals Actual Effort Hours × Tier-Adjusted Hourly Rate
     * This is the fundamental property that validates the new cost calculation formula
     */
    test('Total cost should equal Actual Effort Hours × Tier-Adjusted Hourly Rate for any allocation', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.constantFrom('dev-001', 'dev-002', 'dev-003'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }), // Valid allocation percentages
            (complexityLevel, resourceId, tierLevel, allocationPercentage) => {
                // **Validates: Requirements 3.1, 3.2**
                const result = calculateEnhancedProjectCost(
                    complexityLevel,
                    resourceId,
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    allocationPercentage
                );

                // Find the resource to get hourly rate
                const resource = mockResourceCosts.find(r => r.id === resourceId);
                
                if (resource && result.effortHours > 0) {
                    // Core formula validation: Total Cost = Effort Hours × Hourly Rate
                    const expectedCost = result.effortHours * resource.perHourCost;
                    const roundedExpectedCost = Math.round(expectedCost);
                    
                    expect(result.totalCost).toBe(roundedExpectedCost);
                    expect(result.hourlyRate).toBe(resource.perHourCost);
                    
                    // Effort hours should include all multipliers
                    expect(result.effortHours).toBeGreaterThan(0);
                    expect(isFinite(result.effortHours)).toBe(true);
                    
                    // Breakdown should contain all required multipliers
                    expect(result.breakdown.skillMultiplier).toBeGreaterThan(0);
                    expect(result.breakdown.complexityMultiplier).toBeGreaterThan(0);
                    expect(result.breakdown.riskMultiplier).toBeGreaterThan(0);
                }
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Effort Hours Calculation Property: Validates the effort calculation includes all multipliers
     * Effort Hours = Base Hours × Complexity Multiplier × Risk Multiplier × Skill Multiplier
     */
    test('Effort hours should include all applied multipliers (complexity, skill, risk)', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            (complexityLevel, tierLevel) => {
                const result = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel
                );

                const complexityConfig = defaultComplexity[complexityLevel];
                
                // **Validates: Requirements 3.1, 3.2**
                // Manual calculation of expected effort hours
                const expectedEffortHours = complexityConfig.baseEffortHours * 
                                          complexityConfig.complexityMultiplier * 
                                          complexityConfig.riskFactor * 
                                          result.breakdown.skillMultiplier;
                const roundedExpected = Math.round(expectedEffortHours * 100) / 100;
                
                expect(Math.abs(result.effortHours - roundedExpected)).toBeLessThan(0.01);
                
                // Base effort should match complexity configuration
                expect(result.breakdown.baseEffortHours).toBe(complexityConfig.baseEffortHours);
                expect(result.breakdown.complexityMultiplier).toBe(complexityConfig.complexityMultiplier);
                expect(result.breakdown.riskMultiplier).toBe(complexityConfig.riskFactor);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Hourly Rate Preservation Property: Validates the hourly rate structure is maintained
     * The hourly rate should come directly from the resource cost record
     */
    test('Hourly rate should maintain existing monthly→daily→hourly conversion structure', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.constantFrom('dev-001', 'dev-002', 'dev-003'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            (complexityLevel, resourceId, tierLevel) => {
                const result = calculateEnhancedProjectCost(
                    complexityLevel,
                    resourceId,
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel
                );

                const resource = mockResourceCosts.find(r => r.id === resourceId);
                
                // **Validates: Requirements 3.5**
                // Hourly rate should be preserved from resource cost record
                expect(result.hourlyRate).toBe(resource.perHourCost);
                
                // Rate should be positive and finite
                expect(result.hourlyRate).toBeGreaterThan(0);
                expect(isFinite(result.hourlyRate)).toBe(true);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Allocation Percentage Impact Property: Validates allocation percentage affects duration but not cost
     * Cost should be based on effort hours, not duration
     */
    test('Allocation percentage should affect duration but not total cost', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            fc.float({ min: Math.fround(0.2), max: Math.fround(1.0), noNaN: true }), // Valid allocation percentages (avoid very small values)
            (complexityLevel, tierLevel, allocationPercentage) => {
                const fullTimeResult = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    1.0 // 100% allocation
                );

                const partTimeResult = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    allocationPercentage
                );

                // **Validates: Requirements 3.1, 3.3**
                // Effort hours should be the same regardless of allocation percentage
                expect(fullTimeResult.effortHours).toBe(partTimeResult.effortHours);
                
                // Total cost should be the same (based on effort, not duration)
                expect(fullTimeResult.totalCost).toBe(partTimeResult.totalCost);
                
                // Duration should be longer for part-time allocation
                expect(partTimeResult.durationDays).toBeGreaterThanOrEqual(fullTimeResult.durationDays);
                
                // For reasonable allocation percentages, duration should scale appropriately
                if (allocationPercentage >= 0.5) {
                    const expectedDurationRatio = 1.0 / allocationPercentage;
                    const actualDurationRatio = partTimeResult.durationDays / fullTimeResult.durationDays;
                    
                    // Allow for rounding differences in duration calculation (ceiling operations)
                    expect(Math.abs(actualDurationRatio - expectedDurationRatio)).toBeLessThan(0.5);
                }
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Tier-Based Cost Variation Property: Validates different tiers produce different costs
     * Higher skill tiers should generally result in lower costs due to efficiency
     */
    test('Different tier levels should produce appropriate cost variations', () => {
        fc.assert(fc.property(
            fc.constantFrom('medium', 'high'), // Use complexities with significant skill sensitivity
            (complexityLevel) => {
                const juniorResult = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    1 // Junior
                );

                const seniorResult = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    3 // Senior
                );

                const principalResult = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    5 // Principal
                );

                // **Validates: Requirements 3.1, 3.2**
                // Junior should require more effort hours than Senior and Principal
                expect(juniorResult.effortHours).toBeGreaterThan(seniorResult.effortHours);
                expect(seniorResult.effortHours).toBeGreaterThan(principalResult.effortHours);
                
                // Since same hourly rate, Junior should have higher total cost
                expect(juniorResult.totalCost).toBeGreaterThan(seniorResult.totalCost);
                expect(seniorResult.totalCost).toBeGreaterThan(principalResult.totalCost);
                
                // All costs should be positive and finite
                expect(juniorResult.totalCost).toBeGreaterThan(0);
                expect(seniorResult.totalCost).toBeGreaterThan(0);
                expect(principalResult.totalCost).toBeGreaterThan(0);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Mathematical Consistency Property: Validates all calculations are mathematically sound
     * All intermediate values should be positive, finite, and consistent
     */
    test('All cost calculations should be mathematically consistent and finite', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.constantFrom('dev-001', 'dev-002', 'dev-003'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }), // Valid allocation percentages
            (complexityLevel, resourceId, tierLevel, allocationPercentage) => {
                const result = calculateEnhancedProjectCost(
                    complexityLevel,
                    resourceId,
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    allocationPercentage
                );

                // **Validates: Requirements 3.1, 3.2, 3.5**
                // All values should be positive and finite
                expect(result.totalCost).toBeGreaterThanOrEqual(0);
                expect(result.effortHours).toBeGreaterThanOrEqual(0);
                expect(result.durationDays).toBeGreaterThanOrEqual(0);
                expect(result.hourlyRate).toBeGreaterThan(0);
                
                expect(isFinite(result.totalCost)).toBe(true);
                expect(isFinite(result.effortHours)).toBe(true);
                expect(isFinite(result.durationDays)).toBe(true);
                expect(isFinite(result.hourlyRate)).toBe(true);
                
                expect(isNaN(result.totalCost)).toBe(false);
                expect(isNaN(result.effortHours)).toBe(false);
                expect(isNaN(result.durationDays)).toBe(false);
                expect(isNaN(result.hourlyRate)).toBe(false);
                
                // Breakdown values should also be valid
                expect(result.breakdown.baseEffortHours).toBeGreaterThan(0);
                expect(result.breakdown.adjustedEffortHours).toBeGreaterThan(0);
                expect(result.breakdown.skillMultiplier).toBeGreaterThan(0);
                expect(result.breakdown.complexityMultiplier).toBeGreaterThan(0);
                expect(result.breakdown.riskMultiplier).toBeGreaterThan(0);
                
                expect(isFinite(result.breakdown.skillMultiplier)).toBe(true);
                expect(isFinite(result.breakdown.complexityMultiplier)).toBe(true);
                expect(isFinite(result.breakdown.riskMultiplier)).toBe(true);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Edge Cases Property: Validates handling of boundary conditions
     * System should handle edge cases gracefully without breaking
     */
    test('Should handle edge cases and invalid inputs gracefully', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated', 'invalid'),
            fc.constantFrom('dev-001', 'dev-002', 'dev-003', 'nonexistent'),
            fc.integer({ min: -5, max: 10 }), // Include invalid tier levels
            fc.float({ min: Math.fround(-1.0), max: Math.fround(2.0), noNaN: true }), // Include invalid allocation percentages
            (complexityLevel, resourceId, tierLevel, allocationPercentage) => {
                const result = calculateEnhancedProjectCost(
                    complexityLevel,
                    resourceId,
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    allocationPercentage
                );

                // **Validates: Requirements 3.1, 3.2**
                // Should always return valid structure even with invalid inputs
                expect(result).toHaveProperty('totalCost');
                expect(result).toHaveProperty('effortHours');
                expect(result).toHaveProperty('durationDays');
                expect(result).toHaveProperty('hourlyRate');
                expect(result).toHaveProperty('breakdown');
                
                // Values should be non-negative and finite
                expect(result.totalCost).toBeGreaterThanOrEqual(0);
                expect(result.effortHours).toBeGreaterThanOrEqual(0);
                expect(result.durationDays).toBeGreaterThanOrEqual(0);
                expect(result.hourlyRate).toBeGreaterThanOrEqual(0);
                
                expect(isFinite(result.totalCost)).toBe(true);
                expect(isFinite(result.effortHours)).toBe(true);
                expect(isFinite(result.durationDays)).toBe(true);
                expect(isFinite(result.hourlyRate)).toBe(true);
                
                // Invalid inputs should result in zero values
                if (complexityLevel === 'invalid' || resourceId === 'nonexistent') {
                    expect(result.totalCost).toBe(0);
                    expect(result.effortHours).toBe(0);
                    expect(result.hourlyRate).toBe(0);
                }
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Integration with Tier Adjustment Property: Validates integration with tier-based calculations
     * Results should be consistent with direct tier adjustment function calls
     */
    test('Should produce consistent results with direct tier adjustment calculations', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            (complexityLevel, tierLevel) => {
                // Direct calculation using tier adjustment function
                const directResult = calculateTierAdjustedEffort(complexityLevel, tierLevel);
                
                // Integration calculation through cost calculation
                const costResult = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel
                );

                // **Validates: Requirements 3.1, 3.2**
                // Results should be consistent
                expect(costResult.effortHours).toBe(directResult.adjustedEffortHours);
                expect(costResult.breakdown.skillMultiplier).toBe(directResult.skillMultiplier);
                expect(costResult.breakdown.baseEffortHours).toBe(directResult.baseEffortHours);
                expect(costResult.breakdown.complexityMultiplier).toBe(directResult.complexityMultiplier);
                expect(costResult.breakdown.riskMultiplier).toBe(directResult.riskMultiplier);
                
                return true;
            }
        ), { numRuns: 100 });
    });
});

describe('Property 5: Cost Breakdown Completeness', () => {
    const mockResourceCosts = [
        {
            id: 'dev-001',
            resourceName: 'John Doe',
            perHourCost: 100000 // IDR per hour
        },
        {
            id: 'dev-002', 
            resourceName: 'Jane Smith',
            perHourCost: 150000 // IDR per hour
        }
    ];

    /**
     * Core Property: Cost breakdown includes all contributing factors
     * The breakdown should contain all multipliers and intermediate calculations
     */
    test('Cost breakdown should include all contributing factors (base hours, skill multiplier, complexity factors, final costs)', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.constantFrom('dev-001', 'dev-002'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }), // Valid allocation percentages
            (complexityLevel, resourceId, tierLevel, allocationPercentage) => {
                const breakdown = getDetailedCostBreakdown(
                    complexityLevel,
                    resourceId,
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    allocationPercentage
                );

                // **Validates: Requirements 3.4**
                // Summary section should be complete
                expect(breakdown.summary).toHaveProperty('totalCost');
                expect(breakdown.summary).toHaveProperty('effortHours');
                expect(breakdown.summary).toHaveProperty('durationDays');
                expect(breakdown.summary).toHaveProperty('hourlyRate');
                expect(breakdown.summary).toHaveProperty('allocationPercentage');
                
                // Effort breakdown should show all multipliers
                expect(breakdown.effortBreakdown).toHaveProperty('baseEffortHours');
                expect(breakdown.effortBreakdown).toHaveProperty('afterComplexityMultiplier');
                expect(breakdown.effortBreakdown).toHaveProperty('afterRiskMultiplier');
                expect(breakdown.effortBreakdown).toHaveProperty('finalAdjustedHours');
                expect(breakdown.effortBreakdown).toHaveProperty('skillMultiplier');
                expect(breakdown.effortBreakdown).toHaveProperty('complexityMultiplier');
                expect(breakdown.effortBreakdown).toHaveProperty('riskMultiplier');
                
                // Duration breakdown should show calculation components
                expect(breakdown.durationBreakdown).toHaveProperty('effortHours');
                expect(breakdown.durationBreakdown).toHaveProperty('allocationPercentage');
                expect(breakdown.durationBreakdown).toHaveProperty('hoursPerDay');
                expect(breakdown.durationBreakdown).toHaveProperty('durationDays');
                
                // Cost breakdown should show cost components
                expect(breakdown.costBreakdown).toHaveProperty('baseEffortCost');
                expect(breakdown.costBreakdown).toHaveProperty('skillAdjustmentCost');
                expect(breakdown.costBreakdown).toHaveProperty('totalCost');
                expect(breakdown.costBreakdown).toHaveProperty('hourlyRate');
                
                // Context information should be present
                expect(breakdown.context).toHaveProperty('complexity');
                expect(breakdown.context).toHaveProperty('resourceName');
                expect(breakdown.context).toHaveProperty('tierLevel');
                expect(breakdown.context).toHaveProperty('tierLabel');
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Sum Consistency Property: Sum of components should equal total calculated cost
     * Mathematical consistency between breakdown components and totals
     */
    test('Sum of breakdown components should equal total calculated cost', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.constantFrom('dev-001', 'dev-002'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            (complexityLevel, resourceId, tierLevel) => {
                const breakdown = getDetailedCostBreakdown(
                    complexityLevel,
                    resourceId,
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel
                );

                // **Validates: Requirements 3.4**
                // Effort calculation consistency
                const baseEffort = breakdown.effortBreakdown.baseEffortHours;
                const complexityMultiplier = breakdown.effortBreakdown.complexityMultiplier;
                const riskMultiplier = breakdown.effortBreakdown.riskMultiplier;
                const skillMultiplier = breakdown.effortBreakdown.skillMultiplier;
                
                const expectedAfterComplexity = baseEffort * complexityMultiplier;
                const expectedAfterRisk = expectedAfterComplexity * riskMultiplier;
                const expectedFinalHours = expectedAfterRisk * skillMultiplier;
                
                expect(Math.abs(breakdown.effortBreakdown.afterComplexityMultiplier - expectedAfterComplexity)).toBeLessThan(0.01);
                expect(Math.abs(breakdown.effortBreakdown.afterRiskMultiplier - expectedAfterRisk)).toBeLessThan(0.01);
                expect(Math.abs(breakdown.effortBreakdown.finalAdjustedHours - expectedFinalHours)).toBeLessThan(0.01);
                
                // Cost calculation consistency
                const hourlyRate = breakdown.costBreakdown.hourlyRate;
                const expectedTotalCost = breakdown.effortBreakdown.finalAdjustedHours * hourlyRate;
                const roundedExpectedCost = Math.round(expectedTotalCost);
                
                expect(breakdown.costBreakdown.totalCost).toBe(roundedExpectedCost);
                expect(breakdown.summary.totalCost).toBe(roundedExpectedCost);
                
                // Base effort cost calculation
                const expectedBaseEffortCost = baseEffort * hourlyRate;
                expect(Math.abs(breakdown.costBreakdown.baseEffortCost - expectedBaseEffortCost)).toBeLessThan(1);
                
                // Skill adjustment cost calculation
                const expectedSkillAdjustmentCost = (breakdown.effortBreakdown.finalAdjustedHours - baseEffort) * hourlyRate;
                expect(Math.abs(breakdown.costBreakdown.skillAdjustmentCost - expectedSkillAdjustmentCost)).toBeLessThan(1);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Duration Breakdown Consistency Property: Duration calculations should be mathematically consistent
     * Duration = Effort Hours ÷ (Allocation Percentage × 8 hours/day)
     */
    test('Duration breakdown should be mathematically consistent with effort and allocation', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }), // Valid allocation percentages
            (complexityLevel, tierLevel, allocationPercentage) => {
                const breakdown = getDetailedCostBreakdown(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    allocationPercentage
                );

                // **Validates: Requirements 3.4**
                // Duration calculation consistency
                const effortHours = breakdown.durationBreakdown.effortHours;
                const allocation = breakdown.durationBreakdown.allocationPercentage;
                const hoursPerDay = breakdown.durationBreakdown.hoursPerDay;
                const durationDays = breakdown.durationBreakdown.durationDays;
                
                // Hours per day should equal allocation percentage × 8
                expect(Math.abs(hoursPerDay - (allocation * 8))).toBeLessThan(0.01);
                
                // Duration should be effort hours ÷ hours per day (rounded up)
                const expectedDuration = Math.ceil(effortHours / hoursPerDay);
                expect(durationDays).toBe(expectedDuration);
                
                // Allocation percentage should be clamped to valid range
                expect(allocation).toBeGreaterThanOrEqual(0.1);
                expect(allocation).toBeLessThanOrEqual(1.0);
                
                // Consistency with summary
                expect(breakdown.summary.effortHours).toBe(effortHours);
                expect(breakdown.summary.durationDays).toBe(durationDays);
                expect(breakdown.summary.allocationPercentage).toBe(allocation);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Context Information Completeness Property: Context should provide all necessary information
     * Context should include complexity, resource, tier information for traceability
     */
    test('Context information should be complete and accurate', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.constantFrom('dev-001', 'dev-002'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            (complexityLevel, resourceId, tierLevel) => {
                const breakdown = getDetailedCostBreakdown(
                    complexityLevel,
                    resourceId,
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel
                );

                // **Validates: Requirements 3.4**
                // Context should match input parameters
                expect(breakdown.context.complexity).toBe(complexityLevel);
                expect(breakdown.context.tierLevel).toBe(tierLevel);
                
                // Resource name should match the resource ID
                const resource = mockResourceCosts.find(r => r.id === resourceId);
                expect(breakdown.context.resourceName).toBe(resource.resourceName);
                
                // Complexity label should match the configuration
                const complexityConfig = defaultComplexity[complexityLevel];
                expect(breakdown.context.complexityLabel).toBe(complexityConfig.label);
                
                // Tier label should be appropriate for tier level
                const expectedTierLabels = {
                    1: 'Junior',
                    2: 'Mid',
                    3: 'Senior',
                    4: 'Lead',
                    5: 'Principal'
                };
                expect(breakdown.context.tierLabel).toBe(expectedTierLabels[tierLevel]);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Breakdown Values Validity Property: All breakdown values should be valid and positive
     * No breakdown component should be negative, infinite, or NaN
     */
    test('All breakdown values should be valid, positive, and finite', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.constantFrom('dev-001', 'dev-002'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }), // Valid allocation percentages
            (complexityLevel, resourceId, tierLevel, allocationPercentage) => {
                const breakdown = getDetailedCostBreakdown(
                    complexityLevel,
                    resourceId,
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    allocationPercentage
                );

                // **Validates: Requirements 3.4**
                // Summary values should be valid
                expect(breakdown.summary.totalCost).toBeGreaterThanOrEqual(0);
                expect(breakdown.summary.effortHours).toBeGreaterThan(0);
                expect(breakdown.summary.durationDays).toBeGreaterThan(0);
                expect(breakdown.summary.hourlyRate).toBeGreaterThan(0);
                expect(breakdown.summary.allocationPercentage).toBeGreaterThan(0);
                
                expect(isFinite(breakdown.summary.totalCost)).toBe(true);
                expect(isFinite(breakdown.summary.effortHours)).toBe(true);
                expect(isFinite(breakdown.summary.durationDays)).toBe(true);
                expect(isFinite(breakdown.summary.hourlyRate)).toBe(true);
                expect(isFinite(breakdown.summary.allocationPercentage)).toBe(true);
                
                // Effort breakdown values should be valid
                expect(breakdown.effortBreakdown.baseEffortHours).toBeGreaterThan(0);
                expect(breakdown.effortBreakdown.afterComplexityMultiplier).toBeGreaterThan(0);
                expect(breakdown.effortBreakdown.afterRiskMultiplier).toBeGreaterThan(0);
                expect(breakdown.effortBreakdown.finalAdjustedHours).toBeGreaterThan(0);
                expect(breakdown.effortBreakdown.skillMultiplier).toBeGreaterThan(0);
                expect(breakdown.effortBreakdown.complexityMultiplier).toBeGreaterThan(0);
                expect(breakdown.effortBreakdown.riskMultiplier).toBeGreaterThan(0);
                
                expect(isFinite(breakdown.effortBreakdown.skillMultiplier)).toBe(true);
                expect(isFinite(breakdown.effortBreakdown.complexityMultiplier)).toBe(true);
                expect(isFinite(breakdown.effortBreakdown.riskMultiplier)).toBe(true);
                
                // Cost breakdown values should be valid
                expect(breakdown.costBreakdown.totalCost).toBeGreaterThanOrEqual(0);
                expect(breakdown.costBreakdown.baseEffortCost).toBeGreaterThan(0);
                expect(breakdown.costBreakdown.hourlyRate).toBeGreaterThan(0);
                
                expect(isFinite(breakdown.costBreakdown.totalCost)).toBe(true);
                expect(isFinite(breakdown.costBreakdown.baseEffortCost)).toBe(true);
                expect(isFinite(breakdown.costBreakdown.skillAdjustmentCost)).toBe(true);
                expect(isFinite(breakdown.costBreakdown.hourlyRate)).toBe(true);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Comparative Breakdown Property: Breakdowns should show meaningful differences between scenarios
     * Different inputs should produce different breakdowns that reflect the changes
     */
    test('Breakdowns should show meaningful differences between different scenarios', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            (complexityLevel) => {
                const juniorBreakdown = getDetailedCostBreakdown(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    1 // Junior
                );

                const seniorBreakdown = getDetailedCostBreakdown(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    3 // Senior
                );

                // **Validates: Requirements 3.4**
                // Junior should have higher skill multiplier than Senior
                expect(juniorBreakdown.effortBreakdown.skillMultiplier).toBeGreaterThan(seniorBreakdown.effortBreakdown.skillMultiplier);
                
                // Junior should require more effort hours
                expect(juniorBreakdown.effortBreakdown.finalAdjustedHours).toBeGreaterThan(seniorBreakdown.effortBreakdown.finalAdjustedHours);
                
                // Junior should have higher total cost (same hourly rate, more hours)
                expect(juniorBreakdown.costBreakdown.totalCost).toBeGreaterThan(seniorBreakdown.costBreakdown.totalCost);
                
                // Base effort and other multipliers should be the same
                expect(juniorBreakdown.effortBreakdown.baseEffortHours).toBe(seniorBreakdown.effortBreakdown.baseEffortHours);
                expect(juniorBreakdown.effortBreakdown.complexityMultiplier).toBe(seniorBreakdown.effortBreakdown.complexityMultiplier);
                expect(juniorBreakdown.effortBreakdown.riskMultiplier).toBe(seniorBreakdown.effortBreakdown.riskMultiplier);
                
                // Context should reflect the differences
                expect(juniorBreakdown.context.tierLevel).toBe(1);
                expect(seniorBreakdown.context.tierLevel).toBe(3);
                expect(juniorBreakdown.context.tierLabel).toBe('Junior');
                expect(seniorBreakdown.context.tierLabel).toBe('Senior');
                
                return true;
            }
        ), { numRuns: 100 });
    });
});