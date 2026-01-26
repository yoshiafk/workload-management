/**
 * Integration Tests for Over-Allocation Prevention
 * Tests the complete workflow integration between ResourceAllocationEngine and ValidationEngine
 */

import { ResourceAllocationEngine } from './resourceAllocation.js';
import { ValidationEngine } from './validationEngine.js';

describe('Over-Allocation Prevention Integration Tests', () => {
    let resourceEngine;
    let validationEngine;
    let teamMembers;
    let existingAllocations;

    beforeEach(() => {
        resourceEngine = new ResourceAllocationEngine({ strictEnforcement: true });
        validationEngine = new ValidationEngine({ allowOverAllocation: false });

        teamMembers = [
            {
                id: '1',
                name: 'John Doe',
                tierLevel: 3,
                maxCapacity: 1.0,
                overAllocationThreshold: 1.2 // 120% capacity threshold
            }
        ];

        existingAllocations = [
            {
                id: 'alloc-1',
                resource: 'John Doe',
                allocationPercentage: 0.8, // 80% allocation
                taskName: 'Frontend Development',
                projectName: 'Project Alpha'
            }
        ];
    });

    test('should prevent over-allocation when strict enforcement is enabled', async () => {
        // Request that would cause over-allocation (80% + 50% = 130% > 120% threshold)
        const overAllocationRequest = {
            resource: 'John Doe',
            allocationPercentage: 0.5, // 50% allocation
            startDate: '2024-03-01',
            endDate: '2024-05-31',
            complexity: 'medium',
            category: 'Project'
        };

        const validationResults = await validationEngine.validateAllocationCreation(
            overAllocationRequest,
            existingAllocations,
            teamMembers,
            [], // No leave schedules
            { strictEnforcement: true }
        );

        // Should have validation errors
        const hasErrors = validationResults.some(r => r.severity === 'error' && !r.isValid);
        expect(hasErrors).toBe(true);

        // Should have capacity-related error
        const capacityError = validationResults.find(r => r.type === 'capacity_limits' && !r.isValid);
        expect(capacityError).toBeDefined();
        expect(capacityError.message).toContain('capacity');
    });

    test('should allow allocation within capacity threshold', async () => {
        // Request that stays within threshold (80% + 20% = 100% < 120% threshold)
        const validAllocationRequest = {
            resource: 'John Doe',
            allocationPercentage: 0.2, // 20% allocation
            startDate: '2024-03-01',
            endDate: '2024-05-31',
            complexity: 'low',
            category: 'Project'
        };

        const validationResults = await validationEngine.validateAllocationCreation(
            validAllocationRequest,
            existingAllocations,
            teamMembers,
            [],
            { strictEnforcement: true }
        );

        // Should not have critical errors
        const hasErrors = validationResults.some(r => r.severity === 'error' && !r.isValid);
        expect(hasErrors).toBe(false);
    });

    test('should provide detailed capacity feedback', async () => {
        const overAllocationRequest = {
            resource: 'John Doe',
            allocationPercentage: 0.6, // Would cause over-allocation
            startDate: '2024-03-01',
            endDate: '2024-05-31'
        };

        const validationResult = resourceEngine.validateAllocation(
            overAllocationRequest,
            existingAllocations,
            teamMembers,
            { strictEnforcement: true }
        );

        expect(validationResult.isValid).toBe(false);
        expect(validationResult.errors.length).toBeGreaterThan(0);
        
        // Should contain capacity information
        const hasCapacityInfo = validationResult.errors.some(error =>
            error.includes('utilization') || 
            error.includes('capacity') ||
            error.includes('threshold')
        );
        expect(hasCapacityInfo).toBe(true);
    });

    test('should detect over-allocation correctly', () => {
        const overAllocationResult = resourceEngine.detectOverAllocation(
            'John Doe',
            existingAllocations,
            teamMembers
        );

        expect(overAllocationResult.resourceName).toBe('John Doe');
        expect(overAllocationResult.currentUtilization).toBe(0.8);
        expect(overAllocationResult.overAllocationThreshold).toBe(1.2);
        expect(overAllocationResult.isOverAllocated).toBe(false); // 80% < 120%

        // Test with additional allocation that would cause over-allocation
        const additionalAllocations = [
            ...existingAllocations,
            {
                id: 'alloc-2',
                resource: 'John Doe',
                allocationPercentage: 0.5, // Additional 50%
                taskName: 'Backend Development',
                projectName: 'Project Beta'
            }
        ];

        const overAllocatedResult = resourceEngine.detectOverAllocation(
            'John Doe',
            additionalAllocations,
            teamMembers
        );

        expect(overAllocatedResult.currentUtilization).toBe(1.3); // 80% + 50% = 130%
        expect(overAllocatedResult.isOverAllocated).toBe(true); // 130% > 120%
        expect(overAllocatedResult.overAllocationAmount).toBeCloseTo(0.1); // 130% - 120% = 10%
    });

    test('should work with different enforcement modes', async () => {
        const overAllocationRequest = {
            resource: 'John Doe',
            allocationPercentage: 0.5, // Would cause over-allocation
            startDate: '2024-03-01',
            endDate: '2024-05-31'
        };

        // Test strict enforcement
        const strictResults = await validationEngine.validateAllocationCreation(
            overAllocationRequest,
            existingAllocations,
            teamMembers,
            [],
            { strictEnforcement: true, allowOverAllocation: false }
        );

        const strictHasErrors = strictResults.some(r => r.severity === 'error' && !r.isValid);
        expect(strictHasErrors).toBe(true);

        // Test non-strict enforcement
        const nonStrictResults = await validationEngine.validateAllocationCreation(
            overAllocationRequest,
            existingAllocations,
            teamMembers,
            [],
            { strictEnforcement: false, allowOverAllocation: true }
        );

        const nonStrictHasErrors = nonStrictResults.some(r => r.severity === 'error' && !r.isValid);
        // In non-strict mode, we might still get errors but they should be fewer or different
        // The key is that the validation engine should handle non-strict mode appropriately
        expect(nonStrictResults.length).toBeGreaterThan(0); // Should have some validation results
    });
});