/**
 * Property-Based Tests for Capacity Status Terminology
 * Feature: business-logic-optimization, Property 20: Capacity Status Terminology Accuracy
 * 
 * **Validates: User Requirement - Update At Capacity word into Over Capacity**
 * 
 * Tests that resources with utilization greater than 100% display "Over Capacity" status
 * instead of "At Capacity", providing clear indication of over-allocation situations.
 */

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { resourceAllocationEngine } from './resourceAllocation.js';

describe('Property 20: Capacity Status Terminology Accuracy', () => {
    /**
     * Property: Resources with >100% utilization should show "over-capacity" status
     * **Validates: User Requirement - Update At Capacity word into Over Capacity**
     */
    test('Property: Resources with >100% utilization show "over-capacity" status', () => {
        fc.assert(fc.property(
            fc.record({
                resourceName: fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length > 0),
                utilizationPercentage: fc.integer({ min: 101, max: 300 }), // >100% utilization as integer
                maxCapacity: fc.constantFrom(1.0), // Standard capacity
                tierLevel: fc.integer({ min: 1, max: 5 })
            }),
            (data) => {
                // Create mock team member
                const teamMembers = [{
                    id: 'test-resource',
                    name: data.resourceName,
                    tierLevel: data.tierLevel,
                    maxCapacity: data.maxCapacity
                }];

                // Create allocations that result in >100% utilization
                const targetUtilization = data.utilizationPercentage / 100;
                const allocations = [{
                    id: 'test-allocation',
                    resource: data.resourceName,
                    allocationPercentage: targetUtilization,
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                }];

                // Get resource availability status
                const availability = resourceAllocationEngine.getResourceAvailability(
                    data.resourceName,
                    allocations,
                    teamMembers
                );

                // For >100% utilization, status should be 'over-capacity'
                expect(availability.status).toBe('over-capacity');
                
                // Verify utilization is indeed >100%
                const utilizationResult = resourceAllocationEngine.calculateUtilization(
                    data.resourceName,
                    allocations,
                    teamMembers
                );
                expect(utilizationResult.utilizationPercentage).toBeGreaterThan(100);

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Property: Resources at exactly 100% utilization should show "at-capacity" status
     * **Validates: User Requirement - Distinguish between At Capacity (100%) and Over Capacity (>100%)**
     */
    test('Property: Resources at exactly 100% utilization show "at-capacity" status', () => {
        fc.assert(fc.property(
            fc.record({
                resourceName: fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length > 0),
                maxCapacity: fc.constantFrom(1.0), // Standard capacity
                tierLevel: fc.integer({ min: 1, max: 5 })
            }),
            (data) => {
                // Create mock team member
                const teamMembers = [{
                    id: 'test-resource',
                    name: data.resourceName,
                    tierLevel: data.tierLevel,
                    maxCapacity: data.maxCapacity
                }];

                // Create allocations that result in exactly 100% utilization
                const allocations = [{
                    id: 'test-allocation',
                    resource: data.resourceName,
                    allocationPercentage: 1.0, // Exactly 100%
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                }];

                // Get resource availability status
                const availability = resourceAllocationEngine.getResourceAvailability(
                    data.resourceName,
                    allocations,
                    teamMembers
                );

                // For exactly 100% utilization, status should be 'at-capacity'
                expect(availability.status).toBe('at-capacity');
                
                // Verify utilization is exactly 100%
                const utilizationResult = resourceAllocationEngine.calculateUtilization(
                    data.resourceName,
                    allocations,
                    teamMembers
                );
                expect(utilizationResult.utilizationPercentage).toBe(100);

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Property: Resources with <100% utilization should not show capacity-related status
     * **Validates: User Requirement - Clear distinction for under-capacity resources**
     */
    test('Property: Resources with <100% utilization show appropriate non-capacity status', () => {
        fc.assert(fc.property(
            fc.record({
                resourceName: fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length > 0),
                utilizationPercentage: fc.integer({ min: 0, max: 99 }), // <100% utilization as integer
                maxCapacity: fc.constantFrom(1.0), // Standard capacity
                tierLevel: fc.integer({ min: 1, max: 5 })
            }),
            (data) => {
                // Create mock team member
                const teamMembers = [{
                    id: 'test-resource',
                    name: data.resourceName,
                    tierLevel: data.tierLevel,
                    maxCapacity: data.maxCapacity
                }];

                // Create allocations that result in <100% utilization
                const targetUtilization = data.utilizationPercentage / 100;
                const allocations = targetUtilization > 0 ? [{
                    id: 'test-allocation',
                    resource: data.resourceName,
                    allocationPercentage: targetUtilization,
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                }] : [];

                // Get resource availability status
                const availability = resourceAllocationEngine.getResourceAvailability(
                    data.resourceName,
                    allocations,
                    teamMembers
                );

                // For <100% utilization, status should NOT be 'at-capacity' or 'over-capacity'
                expect(availability.status).not.toBe('at-capacity');
                expect(availability.status).not.toBe('over-capacity');
                
                // Should be one of the under-capacity statuses
                const validUnderCapacityStatuses = ['available', 'moderate-utilization', 'high-utilization'];
                expect(validUnderCapacityStatuses).toContain(availability.status);
                
                // Verify utilization is indeed <100%
                const utilizationResult = resourceAllocationEngine.calculateUtilization(
                    data.resourceName,
                    allocations,
                    teamMembers
                );
                expect(utilizationResult.utilizationPercentage).toBeLessThan(100);

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Property: Status terminology should be consistent across different calculation methods
     * **Validates: User Requirement - Consistent terminology across all UI components**
     */
    test('Property: Status terminology is consistent across utilization and availability methods', () => {
        fc.assert(fc.property(
            fc.record({
                resourceName: fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length > 0),
                utilizationPercentage: fc.integer({ min: 50, max: 200 }),
                maxCapacity: fc.constantFrom(1.0),
                tierLevel: fc.integer({ min: 1, max: 5 })
            }),
            (data) => {
                // Create mock team member
                const teamMembers = [{
                    id: 'test-resource',
                    name: data.resourceName,
                    tierLevel: data.tierLevel,
                    maxCapacity: data.maxCapacity
                }];

                // Create allocations
                const targetUtilization = data.utilizationPercentage / 100;
                const allocations = [{
                    id: 'test-allocation',
                    resource: data.resourceName,
                    allocationPercentage: targetUtilization,
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                }];

                // Get status from availability method
                const availability = resourceAllocationEngine.getResourceAvailability(
                    data.resourceName,
                    allocations,
                    teamMembers
                );

                // Get status from utilization summary method
                const summary = resourceAllocationEngine.getUtilizationSummary(
                    allocations,
                    teamMembers
                );
                const resourceSummary = summary.find(s => s.resourceName === data.resourceName);

                // Both methods should return the same status
                expect(availability.status).toBe(resourceSummary.status);

                // Verify status follows the correct terminology rules
                if (data.utilizationPercentage > 100) {
                    expect(availability.status).toBe('over-capacity');
                } else if (data.utilizationPercentage >= 100) {
                    expect(availability.status).toBe('at-capacity');
                } else {
                    expect(['available', 'moderate-utilization', 'high-utilization']).toContain(availability.status);
                }

                return true;
            }
        ), { numRuns: 100 });
    });
});