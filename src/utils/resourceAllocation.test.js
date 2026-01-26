/**
 * Resource Allocation Engine Tests
 * Unit tests for resource over-allocation detection and utilization tracking
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    ResourceAllocationEngine,
    detectOverAllocation,
    calculateResourceUtilization,
    validateAllocationRequest,
    getResourceAvailability,
    getUtilizationSummary
} from './resourceAllocation.js';

describe('ResourceAllocationEngine', () => {
    let engine;
    let mockTeamMembers;
    let mockAllocations;

    beforeEach(() => {
        engine = new ResourceAllocationEngine();
        
        mockTeamMembers = [
            {
                id: 'MEM-001',
                name: 'Alice Developer',
                type: 'FULLSTACK',
                maxHoursPerWeek: 40,
                maxCapacity: 1.0,
                overAllocationThreshold: 1.2,
                isActive: true
            },
            {
                id: 'MEM-002',
                name: 'Bob Tester',
                type: 'QA',
                maxHoursPerWeek: 40,
                maxCapacity: 1.0,
                overAllocationThreshold: 1.1,
                isActive: true
            },
            {
                id: 'MEM-003',
                name: 'Charlie Support',
                type: 'SUPPORT',
                maxHoursPerWeek: 40,
                maxCapacity: 1.5, // Can handle 150% capacity
                isActive: true
            }
        ];

        mockAllocations = [
            {
                id: 'ALLOC-001',
                resource: 'Alice Developer',
                projectName: 'Project Alpha',
                taskName: 'Development',
                category: 'Project',
                complexity: 'Medium',
                allocationPercentage: 0.8, // 80% allocation
                plan: {
                    taskStart: '2024-01-01',
                    taskEnd: '2024-01-31',
                    costProject: 10000000,
                    costMonthly: 5000000
                }
            },
            {
                id: 'ALLOC-002',
                resource: 'Alice Developer',
                projectName: 'Project Beta',
                taskName: 'Code Review',
                category: 'Project',
                complexity: 'Low',
                allocationPercentage: 0.3, // 30% allocation
                plan: {
                    taskStart: '2024-01-15',
                    taskEnd: '2024-02-15',
                    costProject: 5000000,
                    costMonthly: 2500000
                }
            },
            {
                id: 'ALLOC-003',
                resource: 'Bob Tester',
                projectName: 'Project Alpha',
                taskName: 'Testing',
                category: 'Project',
                complexity: 'Medium',
                allocationPercentage: 0.6, // 60% allocation
                plan: {
                    taskStart: '2024-01-01',
                    taskEnd: '2024-01-31',
                    costProject: 8000000,
                    costMonthly: 4000000
                }
            },
            {
                id: 'ALLOC-004',
                resource: 'Alice Developer',
                projectName: 'Completed Project',
                taskName: 'Completed',
                category: 'Project',
                complexity: 'High',
                allocationPercentage: 1.0, // Should be ignored as completed
                plan: {
                    taskStart: '2023-12-01',
                    taskEnd: '2023-12-31',
                    costProject: 15000000,
                    costMonthly: 7500000
                }
            }
        ];
    });

    describe('detectOverAllocation', () => {
        it('should detect no over-allocation for normal capacity usage', () => {
            const result = engine.detectOverAllocation('Bob Tester', mockAllocations, mockTeamMembers);
            
            expect(result.isOverAllocated).toBe(false);
            expect(result.currentUtilization).toBe(0.6); // 60% allocation
            expect(result.overAllocationThreshold).toBe(1.1); // Bob's custom threshold
            expect(result.overAllocationAmount).toBe(0);
            expect(result.conflictingAllocations).toEqual([]);
        });

        it('should detect over-allocation when threshold is exceeded', () => {
            // Add another allocation to Alice that will push her over threshold
            const allocationsWithOverAllocation = [
                ...mockAllocations,
                {
                    id: 'ALLOC-005',
                    resource: 'Alice Developer',
                    projectName: 'Project Gamma',
                    taskName: 'Emergency Fix',
                    category: 'Support',
                    complexity: 'High',
                    allocationPercentage: 0.5, // This will push Alice to 160% (80% + 30% + 50%)
                    plan: {
                        taskStart: '2024-01-20',
                        taskEnd: '2024-02-10'
                    }
                }
            ];

            const result = engine.detectOverAllocation('Alice Developer', allocationsWithOverAllocation, mockTeamMembers);
            
            expect(result.isOverAllocated).toBe(true);
            expect(result.currentUtilization).toBe(1.6); // 160% total allocation
            expect(result.overAllocationThreshold).toBe(1.2); // Alice's threshold
            expect(result.overAllocationAmount).toBe(0.4); // 40% over threshold
            expect(result.conflictingAllocations).toHaveLength(3); // All active allocations
        });

        it('should handle resource not found gracefully', () => {
            const result = engine.detectOverAllocation('Nonexistent User', mockAllocations, mockTeamMembers);
            
            expect(result.isOverAllocated).toBe(false);
            expect(result.currentUtilization).toBe(0);
            expect(result.error).toContain('Resource not found');
        });

        it('should use default threshold when resource has no custom threshold', () => {
            const result = engine.detectOverAllocation('Charlie Support', mockAllocations, mockTeamMembers);
            
            expect(result.overAllocationThreshold).toBe(1.2); // Default engine threshold
        });

        it('should ignore completed and idle allocations', () => {
            const result = engine.detectOverAllocation('Alice Developer', mockAllocations, mockTeamMembers);
            
            // Should only count ALLOC-001 (80%) and ALLOC-002 (30%), not ALLOC-004 (completed)
            expect(result.currentUtilization).toBe(1.1); // 110% total
            expect(result.utilizationBreakdown).toHaveLength(2);
        });
    });

    describe('calculateUtilization', () => {
        it('should calculate correct utilization for resource with multiple allocations', () => {
            const result = engine.calculateUtilization('Alice Developer', mockAllocations, mockTeamMembers);
            
            expect(result.currentUtilization).toBe(1.1); // 80% + 30%
            expect(result.activeAllocations).toHaveLength(2);
            expect(result.utilizationPercentage).toBe(110); // 110% of max capacity
            expect(result.resourceName).toBe('Alice Developer');
        });

        it('should return empty result for resource with no allocations', () => {
            const result = engine.calculateUtilization('Charlie Support', mockAllocations, mockTeamMembers);
            
            expect(result.currentUtilization).toBe(0);
            expect(result.activeAllocations).toHaveLength(0);
            expect(result.utilizationPercentage).toBe(0);
        });

        it('should handle resource not found', () => {
            const result = engine.calculateUtilization('Unknown User', mockAllocations, mockTeamMembers);
            
            expect(result.currentUtilization).toBe(0);
            expect(result.error).toContain('Resource not found');
        });

        it('should filter allocations by date range when provided', () => {
            const dateRange = {
                startDate: '2024-01-01',
                endDate: '2024-01-15'
            };

            const result = engine.calculateUtilization('Alice Developer', mockAllocations, mockTeamMembers, dateRange);
            
            // Should include both allocations as they overlap with the date range
            expect(result.activeAllocations).toHaveLength(2);
        });

        it('should handle legacy workload field for allocation percentage', () => {
            const allocationsWithWorkload = [
                {
                    id: 'ALLOC-LEGACY',
                    resource: 'Bob Tester',
                    projectName: 'Legacy Project',
                    taskName: 'Legacy Task',
                    workload: 0.7, // Using legacy workload field
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                }
            ];

            const result = engine.calculateUtilization('Bob Tester', allocationsWithWorkload, mockTeamMembers);
            
            expect(result.currentUtilization).toBe(0.7);
        });
    });

    describe('validateAllocation', () => {
        it('should validate allocation that does not cause over-allocation', () => {
            const allocationRequest = {
                resource: 'Charlie Support',
                projectName: 'New Project',
                taskName: 'Development',
                allocationPercentage: 0.8,
                plan: {
                    taskStart: '2024-02-01',
                    taskEnd: '2024-02-28'
                }
            };

            const result = engine.validateAllocation(allocationRequest, mockAllocations, mockTeamMembers);
            
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it('should warn about allocation that exceeds threshold but allow it', () => {
            const allocationRequest = {
                resource: 'Alice Developer',
                projectName: 'New Project',
                taskName: 'Development',
                allocationPercentage: 0.5, // This will push Alice to 160% (110% + 50%)
                plan: {
                    taskStart: '2024-02-01',
                    taskEnd: '2024-02-28'
                }
            };

            const result = engine.validateAllocation(allocationRequest, mockAllocations, mockTeamMembers);
            
            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]).toContain('exceed capacity threshold');
            expect(result.conflicts).toHaveLength(2); // Alice's existing allocations
        });

        it('should reject allocation when strict enforcement is enabled', () => {
            const allocationRequest = {
                resource: 'Alice Developer',
                projectName: 'New Project',
                taskName: 'Development',
                allocationPercentage: 0.5,
                plan: {
                    taskStart: '2024-02-01',
                    taskEnd: '2024-02-28'
                }
            };

            const result = engine.validateAllocation(
                allocationRequest, 
                mockAllocations, 
                mockTeamMembers, 
                { strictEnforcement: true }
            );
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toContain('over-allocation');
        });

        it('should reject allocation with invalid percentage', () => {
            const allocationRequest = {
                resource: 'Bob Tester',
                projectName: 'New Project',
                taskName: 'Development',
                allocationPercentage: 1.5, // Invalid - over 100%
                plan: {
                    taskStart: '2024-02-01',
                    taskEnd: '2024-02-28'
                }
            };

            const result = engine.validateAllocation(allocationRequest, mockAllocations, mockTeamMembers);
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toContain('Invalid allocation percentage');
        });

        it('should reject allocation for non-existent resource', () => {
            const allocationRequest = {
                resource: 'Unknown User',
                projectName: 'New Project',
                taskName: 'Development',
                allocationPercentage: 0.5,
                plan: {
                    taskStart: '2024-02-01',
                    taskEnd: '2024-02-28'
                }
            };

            const result = engine.validateAllocation(allocationRequest, mockAllocations, mockTeamMembers);
            
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toContain('Resource not found');
        });

        it('should provide recommendations for high utilization', () => {
            const allocationRequest = {
                resource: 'Bob Tester',
                projectName: 'New Project',
                taskName: 'Development',
                allocationPercentage: 0.3, // This will bring Bob to 90% utilization
                plan: {
                    taskStart: '2024-02-01',
                    taskEnd: '2024-02-28'
                }
            };

            const result = engine.validateAllocation(allocationRequest, mockAllocations, mockTeamMembers);
            
            expect(result.isValid).toBe(true);
            expect(result.recommendations).toHaveLength(1);
            expect(result.recommendations[0]).toContain('high utilization');
        });
    });

    describe('getResourceAvailability', () => {
        it('should return correct availability information', () => {
            const result = engine.getResourceAvailability('Bob Tester', mockAllocations, mockTeamMembers);
            
            expect(result.available).toBe(true);
            expect(result.currentUtilization).toBe(0.6);
            expect(result.availableCapacity).toBe(0.5); // 110% threshold - 60% current
            expect(result.availablePercentage).toBe(50.0);
            expect(result.status).toBe('moderate-utilization');
        });

        it('should indicate over-capacity status', () => {
            // Add allocation that pushes Alice over capacity
            const allocationsWithOverCapacity = [
                ...mockAllocations,
                {
                    id: 'ALLOC-005',
                    resource: 'Alice Developer',
                    projectName: 'Urgent Project',
                    taskName: 'Emergency',
                    allocationPercentage: 0.5,
                    plan: {
                        taskStart: '2024-01-20',
                        taskEnd: '2024-02-10'
                    }
                }
            ];

            const result = engine.getResourceAvailability('Alice Developer', allocationsWithOverCapacity, mockTeamMembers);
            
            expect(result.available).toBe(false);
            expect(result.status).toBe('over-capacity');
            expect(result.availableCapacity).toBe(0);
        });

        it('should handle resource not found', () => {
            const result = engine.getResourceAvailability('Unknown User', mockAllocations, mockTeamMembers);
            
            expect(result.available).toBe(false);
            expect(result.error).toContain('Resource not found');
        });
    });

    describe('getUtilizationSummary', () => {
        it('should return utilization summary for all active resources', () => {
            const result = engine.getUtilizationSummary(mockAllocations, mockTeamMembers);
            
            expect(result).toHaveLength(3); // All team members are active
            
            // Should be sorted by utilization percentage (highest first)
            expect(result[0].resourceName).toBe('Alice Developer'); // 110%
            expect(result[1].resourceName).toBe('Bob Tester'); // 60%
            expect(result[2].resourceName).toBe('Charlie Support'); // 0%
            
            // Check Alice's data
            expect(result[0].currentUtilization).toBe(1.1);
            expect(result[0].utilizationPercentage).toBe(110);
            expect(result[0].isOverAllocated).toBe(false); // Under her 120% threshold
            expect(result[0].activeAllocationsCount).toBe(2);
        });

        it('should exclude inactive team members', () => {
            const teamMembersWithInactive = [
                ...mockTeamMembers,
                {
                    id: 'MEM-004',
                    name: 'Inactive User',
                    type: 'DEVELOPER',
                    isActive: false
                }
            ];

            const result = engine.getUtilizationSummary(mockAllocations, teamMembersWithInactive);
            
            expect(result).toHaveLength(3); // Should not include inactive user
            expect(result.find(r => r.resourceName === 'Inactive User')).toBeUndefined();
        });
    });

    describe('Convenience Functions', () => {
        it('should work with convenience function detectOverAllocation', () => {
            const result = detectOverAllocation('Alice Developer', mockAllocations, mockTeamMembers);
            
            expect(result.isOverAllocated).toBe(false);
            expect(result.currentUtilization).toBe(1.1);
        });

        it('should work with convenience function calculateResourceUtilization', () => {
            const result = calculateResourceUtilization('Bob Tester', mockAllocations, mockTeamMembers);
            
            expect(result.currentUtilization).toBe(0.6);
            expect(result.activeAllocations).toHaveLength(1);
        });

        it('should work with convenience function validateAllocationRequest', () => {
            const allocationRequest = {
                resource: 'Charlie Support',
                allocationPercentage: 0.5
            };

            const result = validateAllocationRequest(allocationRequest, mockAllocations, mockTeamMembers);
            
            expect(result.isValid).toBe(true);
        });

        it('should work with convenience function getResourceAvailability', () => {
            const result = getResourceAvailability('Bob Tester', mockAllocations, mockTeamMembers);
            
            expect(result.available).toBe(true);
            expect(result.status).toBe('moderate-utilization');
        });

        it('should work with convenience function getUtilizationSummary', () => {
            const result = getUtilizationSummary(mockAllocations, mockTeamMembers);
            
            expect(result).toHaveLength(3);
            expect(result[0].resourceName).toBe('Alice Developer');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty allocations array', () => {
            const result = engine.calculateUtilization('Alice Developer', [], mockTeamMembers);
            
            expect(result.currentUtilization).toBe(0);
            expect(result.activeAllocations).toHaveLength(0);
        });

        it('should handle empty team members array', () => {
            const result = engine.calculateUtilization('Alice Developer', mockAllocations, []);
            
            expect(result.currentUtilization).toBe(0);
            expect(result.error).toContain('Resource not found');
        });

        it('should handle allocation with missing allocation percentage', () => {
            const allocationsWithoutPercentage = [
                {
                    id: 'ALLOC-NO-PERCENT',
                    resource: 'Bob Tester',
                    projectName: 'Test Project',
                    taskName: 'Testing',
                    // No allocationPercentage or workload field
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                }
            ];

            const result = engine.calculateUtilization('Bob Tester', allocationsWithoutPercentage, mockTeamMembers);
            
            expect(result.currentUtilization).toBe(1.0); // Should default to 100%
        });

        it('should handle resource with missing capacity configuration', () => {
            const teamMembersWithoutCapacity = [
                {
                    id: 'MEM-NO-CAPACITY',
                    name: 'No Capacity User',
                    type: 'DEVELOPER',
                    isActive: true
                    // No maxCapacity or overAllocationThreshold
                }
            ];

            const result = engine.detectOverAllocation('No Capacity User', [], teamMembersWithoutCapacity);
            
            expect(result.maxCapacity).toBe(1.0); // Should use default
            expect(result.overAllocationThreshold).toBe(1.2); // Should use engine default
        });

        it('should handle very small allocation percentages', () => {
            const allocationRequest = {
                resource: 'Bob Tester',
                allocationPercentage: 0.05, // 5% - below minimum
                plan: {
                    taskStart: '2024-02-01',
                    taskEnd: '2024-02-28'
                }
            };

            const result = engine.validateAllocation(allocationRequest, mockAllocations, mockTeamMembers);
            
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('Invalid allocation percentage');
        });
    });
});