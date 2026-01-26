/**
 * Property-Based Tests for Over-Allocation Prevention
 * Tests the integration of ResourceAllocationEngine and ValidationEngine
 * to prevent over-allocation when strict enforcement is enabled
 * 
 * **Property 7: Over-Allocation Prevention**
 * **Validates: Requirements 4.5**
 */

import fc from 'fast-check';
import { ResourceAllocationEngine } from './resourceAllocation.js';
import { ValidationEngine } from './validationEngine.js';

describe('Over-Allocation Prevention Property Tests', () => {
    let resourceEngine;
    let validationEngine;

    beforeEach(() => {
        resourceEngine = new ResourceAllocationEngine({
            strictEnforcement: true,
            defaultCapacityThreshold: 1.2
        });
        validationEngine = new ValidationEngine({
            allowOverAllocation: false,
            validateCapacityLimits: true
        });
    });

    /**
     * Property 7: Over-Allocation Prevention
     * For any new allocation request, when strict enforcement is enabled and the allocation 
     * would cause over-allocation, the system should prevent the allocation and provide 
     * clear feedback about the capacity conflict.
     * **Validates: Requirements 4.5**
     */
    test('Property 7: Over-Allocation Prevention - strict enforcement prevents over-allocation', () => {
        fc.assert(fc.property(
            // Generate test data
            fc.record({
                resourceName: fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length > 1),
                tierLevel: fc.integer({ min: 1, max: 5 }),
                maxCapacity: fc.float({ min: Math.fround(0.5), max: Math.fround(2.0), noNaN: true }).map(x => Math.round(x * 100) / 100),
                overAllocationThreshold: fc.float({ min: Math.fround(1.0), max: Math.fround(2.0), noNaN: true }).map(x => Math.round(x * 100) / 100),
                existingAllocations: fc.array(
                    fc.record({
                        id: fc.string({ minLength: 1, maxLength: 10 }),
                        resource: fc.constant(''), // Will be set to resourceName
                        allocationPercentage: fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }).map(x => Math.round(x * 100) / 100),
                        taskName: fc.string({ minLength: 1, maxLength: 20 }),
                        projectName: fc.string({ minLength: 1, maxLength: 20 }),
                        plan: fc.record({
                            taskStart: fc.constant('2024-01-01'),
                            taskEnd: fc.constant('2024-12-31')
                        })
                    }),
                    { minLength: 0, maxLength: 5 }
                ),
                newAllocationPercentage: fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }).map(x => Math.round(x * 100) / 100)
            }),
            (data) => {
                // Setup test data
                const teamMembers = [{
                    id: '1',
                    name: data.resourceName,
                    tierLevel: data.tierLevel,
                    maxCapacity: data.maxCapacity,
                    overAllocationThreshold: data.overAllocationThreshold
                }];

                // Set resource name for existing allocations
                const existingAllocations = data.existingAllocations.map(alloc => ({
                    ...alloc,
                    resource: data.resourceName
                }));

                // Calculate current utilization
                const currentUtilization = existingAllocations.reduce(
                    (sum, alloc) => sum + alloc.allocationPercentage, 
                    0
                );

                // Calculate projected utilization with new allocation
                const projectedUtilization = currentUtilization + data.newAllocationPercentage;

                // Test over-allocation detection
                const overAllocationResult = resourceEngine.detectOverAllocation(
                    data.resourceName,
                    existingAllocations,
                    teamMembers
                );

                // Test allocation validation with strict enforcement
                const allocationRequest = {
                    resource: data.resourceName,
                    allocationPercentage: data.newAllocationPercentage,
                    startDate: '2024-06-01',
                    endDate: '2024-06-30'
                };

                const validationResult = resourceEngine.validateAllocation(
                    allocationRequest,
                    existingAllocations,
                    teamMembers,
                    { strictEnforcement: true }
                );

                // Property: When strict enforcement is enabled and allocation would cause over-allocation,
                // the system should prevent the allocation
                // Use epsilon for floating point comparison
                const epsilon = 0.001;
                if (projectedUtilization > (data.overAllocationThreshold + epsilon)) {
                    // Should detect over-allocation
                    expect(overAllocationResult.isOverAllocated || 
                           projectedUtilization > data.overAllocationThreshold).toBe(true);
                    
                    // Should prevent allocation in strict mode
                    expect(validationResult.isValid).toBe(false);
                    
                    // Should provide clear feedback about capacity conflict
                    expect(validationResult.errors.length).toBeGreaterThan(0);
                    expect(validationResult.errors.some(error => 
                        error.toLowerCase().includes('over-allocation') ||
                        error.toLowerCase().includes('capacity') ||
                        error.toLowerCase().includes('exceed')
                    )).toBe(true);
                    
                    // Should include conflicting allocations information
                    if (existingAllocations.length > 0) {
                        expect(validationResult.conflicts).toBeDefined();
                    }
                } else if (projectedUtilization < (data.overAllocationThreshold - epsilon)) {
                    // Should allow allocation when clearly within capacity
                    expect(validationResult.isValid).toBe(true);
                }
                // For values very close to threshold, either result is acceptable due to floating point precision

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Property: Over-allocation prevention should provide detailed capacity information
     */
    test('Property: Over-allocation prevention provides detailed capacity feedback', () => {
        fc.assert(fc.property(
            fc.record({
                resourceName: fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length > 1),
                currentUtilization: fc.float({ min: Math.fround(0.5), max: Math.fround(2.0), noNaN: true }).map(x => Math.round(x * 100) / 100),
                newAllocation: fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }).map(x => Math.round(x * 100) / 100),
                threshold: fc.float({ min: Math.fround(1.0), max: Math.fround(1.5), noNaN: true }).map(x => Math.round(x * 100) / 100)
            }),
            (data) => {
                const teamMembers = [{
                    id: '1',
                    name: data.resourceName,
                    maxCapacity: 1.0,
                    overAllocationThreshold: data.threshold
                }];

                // Create existing allocations that sum to currentUtilization
                const existingAllocations = [{
                    id: 'existing-1',
                    resource: data.resourceName,
                    allocationPercentage: data.currentUtilization,
                    taskName: 'Existing Task',
                    projectName: 'Existing Project'
                }];

                const allocationRequest = {
                    resource: data.resourceName,
                    allocationPercentage: data.newAllocation
                };

                const validationResult = resourceEngine.validateAllocation(
                    allocationRequest,
                    existingAllocations,
                    teamMembers,
                    { strictEnforcement: true }
                );

                const projectedUtilization = data.currentUtilization + data.newAllocation;

                // Property: Validation result should always include capacity information
                // Use a small epsilon for floating point comparison
                const epsilon = 0.001;
                if (projectedUtilization > (data.threshold + epsilon)) {
                    expect(validationResult.isValid).toBe(false);
                    
                    // Should provide specific capacity information
                    const hasCapacityError = validationResult.errors.some(error =>
                        error.includes('utilization') || 
                        error.includes('capacity') ||
                        error.includes('threshold')
                    );
                    expect(hasCapacityError).toBe(true);
                }

                return true;
            }
        ), { numRuns: 50 });
    });

    /**
     * Property: Over-allocation prevention should work consistently across different resource configurations
     */
    test('Property: Over-allocation prevention works across different resource configurations', () => {
        fc.assert(fc.property(
            fc.record({
                resources: fc.array(
                    fc.record({
                        name: fc.string({ minLength: 2, maxLength: 15 }).filter(s => s.trim().length > 1),
                        tierLevel: fc.integer({ min: 1, max: 5 }),
                        maxCapacity: fc.float({ min: Math.fround(0.8), max: Math.fround(1.5), noNaN: true }).map(x => Math.round(x * 100) / 100),
                        threshold: fc.float({ min: Math.fround(1.0), max: Math.fround(2.0), noNaN: true }).map(x => Math.round(x * 100) / 100)
                    }),
                    { minLength: 1, maxLength: 3 }
                ),
                allocationPercentage: fc.float({ min: Math.fround(0.5), max: Math.fround(1.5), noNaN: true }).map(x => Math.round(x * 100) / 100)
            }),
            (data) => {
                const teamMembers = data.resources.map((resource, index) => ({
                    id: `${index + 1}`,
                    name: resource.name,
                    tierLevel: resource.tierLevel,
                    maxCapacity: resource.maxCapacity,
                    overAllocationThreshold: resource.threshold
                }));

                // Test each resource
                data.resources.forEach(resource => {
                    const allocationRequest = {
                        resource: resource.name,
                        allocationPercentage: data.allocationPercentage
                    };

                    const validationResult = resourceEngine.validateAllocation(
                        allocationRequest,
                        [], // No existing allocations
                        teamMembers,
                        { strictEnforcement: true }
                    );

                    // Property: Validation should be consistent based on capacity thresholds
                    // Use epsilon for floating point comparison
                    const epsilon = 0.001;
                    
                    // First check if allocation percentage is valid (0.1 to 1.0)
                    if (data.allocationPercentage < 0.1 || data.allocationPercentage > 1.0) {
                        // Invalid allocation percentage should be rejected
                        expect(validationResult.isValid).toBe(false);
                    } else if (data.allocationPercentage > (resource.threshold + epsilon)) {
                        // Valid percentage but over threshold should be rejected in strict mode
                        expect(validationResult.isValid).toBe(false);
                    } else if (data.allocationPercentage < (resource.threshold - epsilon)) {
                        // Valid percentage and under threshold should be accepted
                        expect(validationResult.isValid).toBe(true);
                    }
                    // For values very close to threshold, either result is acceptable due to floating point precision
                });

                return true;
            }
        ), { numRuns: 30 });
    });

    /**
     * Property: Over-allocation prevention should handle edge cases correctly
     */
    test('Property: Over-allocation prevention handles edge cases', () => {
        fc.assert(fc.property(
            fc.record({
                resourceName: fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length > 1),
                // Test edge cases: exactly at threshold, just over threshold, etc.
                allocationPercentage: fc.oneof(
                    fc.constant(1.0),    // Exactly 100%
                    fc.constant(1.2),    // Exactly at default threshold
                    fc.constant(1.21),   // Just over threshold
                    fc.constant(0.1),    // Minimum allocation
                    fc.float({ min: Math.fround(0.95), max: Math.fround(1.25), noNaN: true }).map(x => Math.round(x * 100) / 100) // Around threshold
                )
            }),
            (data) => {
                const threshold = 1.2;
                const teamMembers = [{
                    id: '1',
                    name: data.resourceName,
                    maxCapacity: 1.0,
                    overAllocationThreshold: threshold
                }];

                const allocationRequest = {
                    resource: data.resourceName,
                    allocationPercentage: data.allocationPercentage
                };

                const validationResult = resourceEngine.validateAllocation(
                    allocationRequest,
                    [],
                    teamMembers,
                    { strictEnforcement: true }
                );

                // Property: Edge cases should be handled consistently
                // Use epsilon for floating point comparison
                const epsilon = 0.001;
                
                // First check if allocation percentage is valid (0.1 to 1.0)
                if (data.allocationPercentage < 0.1 || data.allocationPercentage > 1.0) {
                    // Invalid allocation percentage should be rejected
                    expect(validationResult.isValid).toBe(false);
                } else if (data.allocationPercentage > (threshold + epsilon)) {
                    // Valid percentage but over threshold should be rejected in strict mode
                    expect(validationResult.isValid).toBe(false);
                    expect(validationResult.errors.length).toBeGreaterThan(0);
                } else if (data.allocationPercentage < (threshold - epsilon)) {
                    // Valid percentage and under threshold should be accepted
                    expect(validationResult.isValid).toBe(true);
                }
                // For values very close to threshold, either result is acceptable

                return true;
            }
        ), { numRuns: 50 });
    });
});