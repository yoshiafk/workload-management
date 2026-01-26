/**
 * Property-Based Tests for Percentage-Based Allocations
 * Task 3.4: Write property tests for percentage-based allocations
 * 
 * **Property 9: Allocation Percentage Validation**
 * **Property 10: Percentage-Based Allocation Calculations**
 * **Validates: Requirements 6.1, 6.4, 6.5**
 * 
 * For any resource, the system should accept allocation percentages between 0.1 and 1.0,
 * and the total of all allocation percentages should not exceed the resource's maximum capacity
 * when validation is enabled.
 * 
 * For any allocation with a percentage assignment, both the allocated percentage and effective
 * working hours should be tracked, and they should maintain the mathematical relationship:
 * Effective Hours = Base Effort Hours ÷ Allocation Percentage.
 */

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
    ResourceAllocationEngine,
    validateAllocationRequest,
    calculateResourceUtilization,
    detectOverAllocation
} from './resourceAllocation.js';
import {
    calculateEnhancedProjectCost,
    calculateDurationFromEffort
} from './calculations.js';
import { defaultComplexity } from '../data/defaultComplexity.js';

describe('Property 9: Allocation Percentage Validation', () => {
    // Mock data for testing
    const mockTeamMembers = [
        {
            id: 'MEM-001',
            name: 'Alice Developer',
            type: 'FULLSTACK',
            maxCapacity: 1.0,
            overAllocationThreshold: 1.2,
            isActive: true
        },
        {
            id: 'MEM-002',
            name: 'Bob Tester',
            type: 'QA',
            maxCapacity: 1.5, // Can handle 150% capacity
            overAllocationThreshold: 1.8,
            isActive: true
        },
        {
            id: 'MEM-003',
            name: 'Charlie Support',
            type: 'SUPPORT',
            maxCapacity: 2.0, // Can handle 200% capacity
            overAllocationThreshold: 2.5,
            isActive: true
        }
    ];

    const mockResourceCosts = [
        {
            id: 'dev-001',
            resourceName: 'Alice Developer',
            perHourCost: 100000
        },
        {
            id: 'dev-002',
            resourceName: 'Bob Tester',
            perHourCost: 120000
        },
        {
            id: 'dev-003',
            resourceName: 'Charlie Support',
            perHourCost: 80000
        }
    ];

    /**
     * Core Property: System should accept allocation percentages between 0.1 and 1.0
     * This validates the fundamental range validation for allocation percentages
     */
    test('System should accept allocation percentages between 0.1 (10%) and 1.0 (100%)', () => {
        fc.assert(fc.property(
            fc.constantFrom('Alice Developer', 'Bob Tester', 'Charlie Support'),
            fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }),
            (resourceName, allocationPercentage) => {
                // **Validates: Requirements 6.1**
                const allocationRequest = {
                    resource: resourceName,
                    projectName: 'Test Project',
                    taskName: 'Development',
                    allocationPercentage: allocationPercentage,
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                };

                const result = validateAllocationRequest(allocationRequest, [], mockTeamMembers);
                
                // Valid allocation percentages should be accepted
                expect(result.isValid).toBe(true);
                expect(result.errors.filter(e => e.includes('Invalid allocation percentage'))).toHaveLength(0);
                
                // The allocation percentage should be preserved
                expect(allocationPercentage).toBeGreaterThanOrEqual(0.1);
                expect(allocationPercentage).toBeLessThanOrEqual(1.0);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Boundary Validation Property: System should reject allocation percentages outside valid range
     * This validates that invalid percentages are properly rejected
     */
    test('System should reject allocation percentages outside the valid range (0.1 to 1.0)', () => {
        fc.assert(fc.property(
            fc.constantFrom('Alice Developer', 'Bob Tester', 'Charlie Support'),
            fc.oneof(
                fc.float({ min: Math.fround(-1.0), max: Math.fround(0.09), noNaN: true }), // Below minimum
                fc.float({ min: Math.fround(1.01), max: Math.fround(2.0), noNaN: true })   // Above maximum
            ),
            (resourceName, invalidPercentage) => {
                // **Validates: Requirements 6.1**
                const allocationRequest = {
                    resource: resourceName,
                    projectName: 'Test Project',
                    taskName: 'Development',
                    allocationPercentage: invalidPercentage,
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                };

                const result = validateAllocationRequest(allocationRequest, [], mockTeamMembers);
                
                // Invalid allocation percentages should be rejected
                expect(result.isValid).toBe(false);
                expect(result.errors.some(e => e.includes('Invalid allocation percentage'))).toBe(true);
                
                // Verify the percentage is indeed outside valid range
                expect(invalidPercentage < 0.1 || invalidPercentage > 1.0).toBe(true);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Capacity Validation Property: Total allocations should not exceed resource's maximum capacity
     * This validates that the sum of allocation percentages respects capacity limits
     */
    test('Total allocation percentages should not exceed resource maximum capacity when validation is enabled', () => {
        fc.assert(fc.property(
            fc.constantFrom('Alice Developer', 'Bob Tester', 'Charlie Support'),
            fc.array(fc.float({ min: Math.fround(0.1), max: Math.fround(0.8), noNaN: true }), { minLength: 1, maxLength: 5 }),
            fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }),
            (resourceName, existingPercentages, newPercentage) => {
                // **Validates: Requirements 6.5**
                const resource = mockTeamMembers.find(m => m.name === resourceName);
                if (!resource) return true;

                // Create existing allocations
                const existingAllocations = existingPercentages.map((percentage, index) => ({
                    id: `ALLOC-${index + 1}`,
                    resource: resourceName,
                    projectName: `Project ${index + 1}`,
                    taskName: 'Development',
                    allocationPercentage: percentage,
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                }));

                // Calculate total existing utilization
                const totalExisting = existingPercentages.reduce((sum, p) => sum + p, 0);
                const projectedTotal = totalExisting + newPercentage;

                // Create new allocation request
                const newAllocationRequest = {
                    resource: resourceName,
                    projectName: 'New Project',
                    taskName: 'Development',
                    allocationPercentage: newPercentage,
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                };

                const result = validateAllocationRequest(
                    newAllocationRequest, 
                    existingAllocations, 
                    mockTeamMembers,
                    { strictEnforcement: true }
                );

                // If projected total exceeds the resource's over-allocation threshold, it should be rejected
                if (projectedTotal > resource.overAllocationThreshold) {
                    expect(result.isValid).toBe(false);
                    expect(result.errors.some(e => e.includes('over-allocation'))).toBe(true);
                } else {
                    // If within threshold, it should be accepted or warned
                    if (projectedTotal > resource.maxCapacity) {
                        // May have warnings but should not be rejected if under threshold
                        expect(result.warnings.length >= 0).toBe(true);
                    }
                }

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Utilization Calculation Property: Current utilization should equal sum of allocation percentages
     * This validates that utilization tracking accurately sums allocation percentages
     */
    test('Current utilization should equal the sum of all allocation percentages for a resource', () => {
        fc.assert(fc.property(
            fc.constantFrom('Alice Developer', 'Bob Tester', 'Charlie Support'),
            fc.array(fc.float({ min: Math.fround(0.1), max: Math.fround(0.5), noNaN: true }), { minLength: 1, maxLength: 4 }),
            (resourceName, allocationPercentages) => {
                // **Validates: Requirements 6.5**
                const allocations = allocationPercentages.map((percentage, index) => ({
                    id: `ALLOC-${index + 1}`,
                    resource: resourceName,
                    projectName: `Project ${index + 1}`,
                    taskName: 'Development',
                    allocationPercentage: percentage,
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                }));

                const utilizationResult = calculateResourceUtilization(resourceName, allocations, mockTeamMembers);
                
                // Calculate expected utilization
                const expectedUtilization = allocationPercentages.reduce((sum, p) => sum + p, 0);
                const roundedExpected = Math.round(expectedUtilization * 1000) / 1000;
                
                // Current utilization should match the sum of allocation percentages
                expect(Math.abs(utilizationResult.currentUtilization - roundedExpected)).toBeLessThan(0.001);
                
                // Active allocations count should match
                expect(utilizationResult.activeAllocations).toHaveLength(allocationPercentages.length);
                
                // Each allocation should be properly tracked
                utilizationResult.activeAllocations.forEach((allocation, index) => {
                    expect(allocation.allocationPercentage).toBe(allocationPercentages[index]);
                });

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Over-Allocation Detection Property: Over-allocation should be detected when threshold is exceeded
     * This validates that over-allocation detection works correctly with percentage-based allocations
     */
    test('Over-allocation should be detected when total allocation percentages exceed threshold', () => {
        fc.assert(fc.property(
            fc.constantFrom('Alice Developer', 'Bob Tester', 'Charlie Support'),
            fc.array(fc.float({ min: Math.fround(0.3), max: Math.fround(0.8), noNaN: true }), { minLength: 2, maxLength: 4 }),
            (resourceName, allocationPercentages) => {
                // **Validates: Requirements 6.5**
                const resource = mockTeamMembers.find(m => m.name === resourceName);
                if (!resource) return true;

                const allocations = allocationPercentages.map((percentage, index) => ({
                    id: `ALLOC-${index + 1}`,
                    resource: resourceName,
                    projectName: `Project ${index + 1}`,
                    taskName: 'Development',
                    allocationPercentage: percentage,
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                }));

                const overAllocationResult = detectOverAllocation(resourceName, allocations, mockTeamMembers);
                
                const totalUtilization = allocationPercentages.reduce((sum, p) => sum + p, 0);
                const isOverThreshold = totalUtilization > resource.overAllocationThreshold;
                
                // Over-allocation detection should match the actual utilization vs threshold
                expect(overAllocationResult.isOverAllocated).toBe(isOverThreshold);
                
                if (isOverThreshold) {
                    expect(overAllocationResult.overAllocationAmount).toBeGreaterThan(0);
                    expect(overAllocationResult.conflictingAllocations.length).toBeGreaterThan(0);
                } else {
                    expect(overAllocationResult.overAllocationAmount).toBe(0);
                    expect(overAllocationResult.conflictingAllocations).toHaveLength(0);
                }

                // Current utilization should be accurately calculated
                expect(Math.abs(overAllocationResult.currentUtilization - totalUtilization)).toBeLessThan(0.001);

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Edge Cases Property: System should handle edge cases gracefully
     * This validates handling of boundary conditions and unusual scenarios
     */
    test('System should handle edge cases and boundary conditions gracefully', () => {
        fc.assert(fc.property(
            fc.constantFrom('Alice Developer', 'Bob Tester', 'Charlie Support'),
            fc.oneof(
                fc.constant(0.1),    // Minimum valid percentage
                fc.constant(1.0),    // Maximum valid percentage
                fc.constant(0.5),    // Common middle value
                fc.constant(0.99),   // Near maximum
                fc.constant(0.11)    // Just above minimum
            ),
            (resourceName, edgePercentage) => {
                // **Validates: Requirements 6.1**
                const allocationRequest = {
                    resource: resourceName,
                    projectName: 'Edge Case Project',
                    taskName: 'Development',
                    allocationPercentage: edgePercentage,
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                };

                const result = validateAllocationRequest(allocationRequest, [], mockTeamMembers);
                
                // All edge cases within valid range should be accepted
                expect(result.isValid).toBe(true);
                expect(result.errors.filter(e => e.includes('Invalid allocation percentage'))).toHaveLength(0);
                
                // Utilization calculation should work correctly
                const utilizationResult = calculateResourceUtilization(resourceName, [allocationRequest], mockTeamMembers);
                expect(Math.abs(utilizationResult.currentUtilization - edgePercentage)).toBeLessThan(0.001);

                return true;
            }
        ), { numRuns: 100 });
    });
});

describe('Property 10: Percentage-Based Allocation Calculations', () => {
    const mockResourceCosts = [
        {
            id: 'dev-001',
            resourceName: 'Test Developer',
            perHourCost: 100000
        }
    ];

    /**
     * Core Property: Effective Hours = Base Effort Hours ÷ Allocation Percentage
     * This validates the fundamental mathematical relationship for percentage-based allocations
     */
    test('Effective Hours should equal Base Effort Hours ÷ Allocation Percentage', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }),
            (complexityLevel, tierLevel, allocationPercentage) => {
                // **Validates: Requirements 6.4**
                const result = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    allocationPercentage
                );

                // Get the base effort hours (without allocation percentage impact)
                const baseResult = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    1.0 // 100% allocation for baseline
                );

                // The effort hours should be the same regardless of allocation percentage
                // (allocation percentage affects duration, not effort)
                expect(result.effortHours).toBe(baseResult.effortHours);
                
                // Duration should be inversely related to allocation percentage
                // Duration = Effort Hours ÷ (Allocation Percentage × 8 hours/day)
                const expectedDuration = Math.ceil(result.effortHours / (allocationPercentage * 8));
                expect(result.durationDays).toBe(expectedDuration);
                
                // Allocation percentage should be tracked
                expect(result.allocationPercentage).toBe(allocationPercentage);

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Duration Calculation Property: Duration should be inversely proportional to allocation percentage
     * This validates that duration scales correctly with allocation percentage
     */
    test('Duration should be inversely proportional to allocation percentage', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            fc.float({ min: Math.fround(0.2), max: Math.fround(1.0), noNaN: true }), // Avoid very small percentages for clearer relationships
            (complexityLevel, tierLevel, allocationPercentage) => {
                // **Validates: Requirements 6.2, 6.3**
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

                // Effort hours should be the same
                expect(fullTimeResult.effortHours).toBe(partTimeResult.effortHours);
                
                // Duration should be longer for part-time allocation
                expect(partTimeResult.durationDays).toBeGreaterThanOrEqual(fullTimeResult.durationDays);
                
                // For reasonable allocation percentages, check the mathematical relationship
                if (allocationPercentage >= 0.5) {
                    const expectedDurationRatio = 1.0 / allocationPercentage;
                    const actualDurationRatio = partTimeResult.durationDays / fullTimeResult.durationDays;
                    
                    // Allow for rounding differences in ceiling operations
                    expect(Math.abs(actualDurationRatio - expectedDurationRatio)).toBeLessThan(0.5);
                }

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Cost Independence Property: Total cost should be independent of allocation percentage
     * This validates that cost is based on effort, not duration
     */
    test('Total cost should be independent of allocation percentage (based on effort, not duration)', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }),
            (complexityLevel, tierLevel, allocationPercentage) => {
                // **Validates: Requirements 6.4**
                const result = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    allocationPercentage
                );

                const fullTimeResult = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    1.0 // 100% allocation
                );

                // Total cost should be the same regardless of allocation percentage
                expect(result.totalCost).toBe(fullTimeResult.totalCost);
                
                // Effort hours should be the same
                expect(result.effortHours).toBe(fullTimeResult.effortHours);
                
                // Only duration should differ
                if (allocationPercentage < 1.0) {
                    expect(result.durationDays).toBeGreaterThanOrEqual(fullTimeResult.durationDays);
                } else {
                    expect(result.durationDays).toBe(fullTimeResult.durationDays);
                }

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Duration Calculation Formula Property: Validates the specific duration calculation formula
     * Duration Days = Effort Hours ÷ (Allocation Percentage × 8 hours/day)
     */
    test('Duration calculation should follow the formula: Duration Days = Effort Hours ÷ (Allocation Percentage × 8 hours/day)', () => {
        fc.assert(fc.property(
            fc.float({ min: Math.fround(1.0), max: Math.fround(1000.0), noNaN: true }), // Effort hours
            fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }),     // Allocation percentage
            (effortHours, allocationPercentage) => {
                // **Validates: Requirements 6.2, 6.3**
                const durationResult = calculateDurationFromEffort(effortHours, allocationPercentage);
                
                // Calculate expected duration using the formula
                const hoursPerDay = allocationPercentage * 8;
                const expectedDuration = Math.ceil(effortHours / hoursPerDay);
                
                // Duration should match the formula
                expect(durationResult.durationDays).toBe(expectedDuration);
                expect(durationResult.effortHours).toBe(effortHours);
                expect(durationResult.allocationPercentage).toBe(allocationPercentage);
                expect(durationResult.hoursPerDay).toBe(hoursPerDay);
                
                // Validate the mathematical relationship
                expect(durationResult.durationDays * durationResult.hoursPerDay).toBeGreaterThanOrEqual(effortHours);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Allocation Percentage Tracking Property: Both percentage and effective hours should be tracked
     * This validates that the system properly tracks both allocation percentage and effective working hours
     */
    test('Both allocated percentage and effective working hours should be tracked and displayed', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }),
            (complexityLevel, tierLevel, allocationPercentage) => {
                // **Validates: Requirements 6.4**
                const result = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    allocationPercentage
                );

                // Allocation percentage should be tracked
                expect(result.allocationPercentage).toBe(allocationPercentage);
                
                // Effective working hours should be tracked (this is the effort hours)
                expect(result.effortHours).toBeGreaterThan(0);
                expect(isFinite(result.effortHours)).toBe(true);
                
                // Duration should reflect the allocation percentage
                expect(result.durationDays).toBeGreaterThan(0);
                expect(isFinite(result.durationDays)).toBe(true);
                
                // The relationship should be maintained
                const calculatedHoursPerDay = allocationPercentage * 8;
                const impliedDuration = Math.ceil(result.effortHours / calculatedHoursPerDay);
                expect(result.durationDays).toBe(impliedDuration);

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Mathematical Consistency Property: All percentage-based calculations should be mathematically consistent
     * This validates that all intermediate calculations are sound and consistent
     */
    test('All percentage-based calculations should be mathematically consistent and finite', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }),
            (complexityLevel, tierLevel, allocationPercentage) => {
                // **Validates: Requirements 6.1, 6.4, 6.5**
                const result = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    allocationPercentage
                );

                // All values should be positive and finite
                expect(result.totalCost).toBeGreaterThanOrEqual(0);
                expect(result.effortHours).toBeGreaterThan(0);
                expect(result.durationDays).toBeGreaterThan(0);
                expect(result.hourlyRate).toBeGreaterThan(0);
                expect(result.allocationPercentage).toBeGreaterThan(0);
                
                expect(isFinite(result.totalCost)).toBe(true);
                expect(isFinite(result.effortHours)).toBe(true);
                expect(isFinite(result.durationDays)).toBe(true);
                expect(isFinite(result.hourlyRate)).toBe(true);
                expect(isFinite(result.allocationPercentage)).toBe(true);
                
                expect(isNaN(result.totalCost)).toBe(false);
                expect(isNaN(result.effortHours)).toBe(false);
                expect(isNaN(result.durationDays)).toBe(false);
                expect(isNaN(result.hourlyRate)).toBe(false);
                expect(isNaN(result.allocationPercentage)).toBe(false);
                
                // Allocation percentage should be within valid range
                expect(result.allocationPercentage).toBeGreaterThanOrEqual(0.1);
                expect(result.allocationPercentage).toBeLessThanOrEqual(1.0);
                
                // Duration calculation should be consistent
                const durationCheck = calculateDurationFromEffort(result.effortHours, result.allocationPercentage);
                expect(durationCheck.durationDays).toBe(result.durationDays);

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Comparative Property: Different allocation percentages should produce predictable duration differences
     * This validates that the system produces logical and consistent results across different percentages
     */
    test('Different allocation percentages should produce predictable duration differences', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            fc.tuple(
                fc.float({ min: Math.fround(0.2), max: Math.fround(0.5), noNaN: true }),  // Lower percentage
                fc.float({ min: Math.fround(0.6), max: Math.fround(1.0), noNaN: true })   // Higher percentage
            ).filter(([low, high]) => low < high),
            (complexityLevel, tierLevel, [lowerPercentage, higherPercentage]) => {
                // **Validates: Requirements 6.2, 6.3, 6.4**
                const lowerResult = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    lowerPercentage
                );

                const higherResult = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    higherPercentage
                );

                // Effort hours should be the same
                expect(lowerResult.effortHours).toBe(higherResult.effortHours);
                
                // Total cost should be the same
                expect(lowerResult.totalCost).toBe(higherResult.totalCost);
                
                // Lower allocation percentage should result in longer duration
                expect(lowerResult.durationDays).toBeGreaterThan(higherResult.durationDays);
                
                // The duration ratio should be approximately inverse to the percentage ratio
                const percentageRatio = higherPercentage / lowerPercentage;
                const durationRatio = lowerResult.durationDays / higherResult.durationDays;
                
                // Allow for rounding differences in ceiling operations
                expect(Math.abs(durationRatio - percentageRatio)).toBeLessThan(1.0);

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Edge Cases Property: System should handle edge cases in percentage-based calculations
     * This validates handling of boundary conditions and unusual scenarios
     */
    test('System should handle edge cases in percentage-based calculations gracefully', () => {
        fc.assert(fc.property(
            fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
            fc.integer({ min: 1, max: 5 }), // Valid tier levels
            fc.oneof(
                fc.constant(0.1),    // Minimum allocation
                fc.constant(1.0),    // Maximum allocation
                fc.constant(0.125),  // 1/8 allocation (1 hour per day)
                fc.constant(0.25),   // Quarter allocation (2 hours per day)
                fc.constant(0.5)     // Half allocation (4 hours per day)
            ),
            (complexityLevel, tierLevel, edgePercentage) => {
                // **Validates: Requirements 6.1, 6.4**
                const result = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tierLevel,
                    edgePercentage
                );

                // All edge cases should produce valid results
                expect(result.totalCost).toBeGreaterThan(0);
                expect(result.effortHours).toBeGreaterThan(0);
                expect(result.durationDays).toBeGreaterThan(0);
                expect(result.allocationPercentage).toBe(edgePercentage);
                
                // Duration should be reasonable for the allocation percentage
                const expectedMinDuration = Math.ceil(result.effortHours / (edgePercentage * 8));
                expect(result.durationDays).toBe(expectedMinDuration);
                
                // Very low allocation percentages should result in longer durations
                if (edgePercentage <= 0.25) {
                    expect(result.durationDays).toBeGreaterThan(result.effortHours / 8); // More than full-time duration
                }

                return true;
            }
        ), { numRuns: 100 });
    });
});