/**
 * Unit Tests for ValidationEngine
 * Tests comprehensive resource validation functionality
 */

import { vi } from 'vitest';
import { 
    ValidationEngine, 
    validationEngine,
    validateAllocationCreation,
    validateResourceAvailability,
    validateSkillMatch,
    validateCapacityLimits,
    validateWorkloadConstraints
} from './validationEngine.js';

describe('ValidationEngine', () => {
    // Mock data for testing
    const mockTeamMembers = [
        {
            id: 'MEM-001',
            name: 'Alice Developer',
            tierLevel: 3,
            type: 'FULLSTACK',
            maxCapacity: 1.0,
            overAllocationThreshold: 1.2,
            skillAreas: ['React', 'Node.js', 'JavaScript', 'TypeScript']
        },
        {
            id: 'MEM-002',
            name: 'Bob Senior',
            tierLevel: 4,
            type: 'LEAD',
            maxCapacity: 1.0,
            overAllocationThreshold: 1.3,
            skillAreas: ['Architecture', 'Leadership', 'React', 'AWS', 'System Design']
        },
        {
            id: 'MEM-003',
            name: 'Charlie Junior',
            tierLevel: 1,
            type: 'FULLSTACK',
            maxCapacity: 1.0,
            overAllocationThreshold: 1.1,
            skillAreas: ['HTML', 'CSS', 'JavaScript']
        }
    ];

    const mockExistingAllocations = [
        {
            id: 'ALLOC-001',
            resource: 'Alice Developer',
            projectName: 'Project A',
            taskName: 'Development',
            complexity: 'medium',
            allocationPercentage: 0.6,
            plan: {
                taskStart: '2024-01-15',
                taskEnd: '2024-02-15'
            }
        },
        {
            id: 'ALLOC-002',
            resource: 'Alice Developer',
            projectName: 'Project B',
            taskName: 'Testing',
            complexity: 'low',
            allocationPercentage: 0.3,
            plan: {
                taskStart: '2024-01-20',
                taskEnd: '2024-02-20'
            }
        }
    ];

    const mockLeaveSchedules = [
        {
            id: 'LEAVE-001',
            memberName: 'Alice Developer',
            type: 'vacation',
            startDate: '2024-02-10',
            endDate: '2024-02-15'
        }
    ];

    describe('ValidationEngine Class', () => {
        test('should create instance with default configuration', () => {
            const engine = new ValidationEngine();
            expect(engine.config.strictSkillMatching).toBe(false);
            expect(engine.config.allowOverAllocation).toBe(false);
            expect(engine.config.maxSkillGapTolerance).toBe(2);
        });

        test('should create instance with custom configuration', () => {
            const engine = new ValidationEngine({
                strictSkillMatching: true,
                allowOverAllocation: true,
                maxSkillGapTolerance: 3
            });
            expect(engine.config.strictSkillMatching).toBe(true);
            expect(engine.config.allowOverAllocation).toBe(true);
            expect(engine.config.maxSkillGapTolerance).toBe(3);
        });
    });

    describe('validateAllocationCreation', () => {
        test('should validate successful allocation creation', async () => {
            const allocationData = {
                resource: 'Bob Senior',
                projectName: 'New Project',
                taskName: 'Architecture',
                complexity: 'high',
                allocationPercentage: 0.5,
                startDate: '2024-03-01',
                endDate: '2024-03-31',
                taskRequirements: ['Architecture', 'System Design']
            };

            const results = await validateAllocationCreation(
                allocationData,
                mockExistingAllocations,
                mockTeamMembers,
                mockLeaveSchedules
            );

            expect(results).toHaveLength(5); // 4 validation types + cross-validation
            expect(results.every(r => r.type)).toBe(true);
            
            // Should have availability, skill_match, capacity_limits, workload_constraints, cross_validation
            const types = results.map(r => r.type);
            expect(types).toContain('availability');
            expect(types).toContain('skill_match');
            expect(types).toContain('capacity_limits');
            expect(types).toContain('workload_constraints');
            expect(types).toContain('cross_validation');
        });

        test('should handle resource not found error', async () => {
            const allocationData = {
                resource: 'Unknown Resource',
                projectName: 'New Project',
                taskName: 'Development',
                complexity: 'medium',
                allocationPercentage: 0.5
            };

            const results = await validateAllocationCreation(
                allocationData,
                [],
                mockTeamMembers,
                []
            );

            // All validations should fail due to resource not found
            const errorResults = results.filter(r => r.severity === 'error');
            expect(errorResults.length).toBeGreaterThan(0);
        });

        test('should handle validation system errors gracefully', async () => {
            // Create a mock that throws an error
            const engine = new ValidationEngine();
            const originalMethod = engine.validateResourceAvailability;
            engine.validateResourceAvailability = vi.fn().mockRejectedValue(new Error('Test error'));

            const allocationData = {
                resource: 'Alice Developer',
                projectName: 'Test Project',
                taskName: 'Development'
            };

            const results = await engine.validateAllocationCreation(
                allocationData,
                [],
                mockTeamMembers,
                []
            );

            // Should contain system error result
            const systemError = results.find(r => r.type === 'system_error');
            expect(systemError).toBeDefined();
            expect(systemError.isValid).toBe(false);
            expect(systemError.severity).toBe('error');

            // Restore original method
            engine.validateResourceAvailability = originalMethod;
        });
    });

    describe('validateResourceAvailability', () => {
        test('should validate available resource with no conflicts', async () => {
            const result = await validateResourceAvailability(
                'Bob Senior',
                { startDate: '2024-03-01', endDate: '2024-03-31' },
                mockExistingAllocations,
                mockTeamMembers,
                mockLeaveSchedules
            );

            expect(result.type).toBe('availability');
            expect(result.isValid).toBe(true);
            expect(result.severity).toBe('info');
            expect(result.details.conflicts).toHaveLength(0);
        });

        test('should detect allocation conflicts', async () => {
            const result = await validateResourceAvailability(
                'Alice Developer',
                { startDate: '2024-01-20', endDate: '2024-02-10' },
                mockExistingAllocations,
                mockTeamMembers,
                [] // No leave schedules to avoid leave conflicts
            );

            expect(result.type).toBe('availability');
            expect(result.details.conflicts.length).toBeGreaterThan(0);
            expect(result.severity).toBe('warning');
            
            const allocationConflicts = result.details.conflicts.filter(c => c.type === 'allocation_overlap');
            expect(allocationConflicts.length).toBeGreaterThan(0);
        });

        test('should detect leave conflicts', async () => {
            const result = await validateResourceAvailability(
                'Alice Developer',
                { startDate: '2024-02-12', endDate: '2024-02-18' },
                [],
                mockTeamMembers,
                mockLeaveSchedules
            );

            expect(result.type).toBe('availability');
            expect(result.isValid).toBe(false);
            expect(result.severity).toBe('error');
            
            const leaveConflicts = result.details.conflicts.filter(c => c.type === 'leave_conflict');
            expect(leaveConflicts.length).toBeGreaterThan(0);
        });

        test('should handle missing date range gracefully', async () => {
            const result = await validateResourceAvailability(
                'Alice Developer',
                {},
                mockExistingAllocations,
                mockTeamMembers,
                mockLeaveSchedules
            );

            expect(result.type).toBe('availability');
            expect(result.isValid).toBe(true);
            expect(result.details.conflicts).toHaveLength(0);
        });

        test('should handle resource not found', async () => {
            const result = await validateResourceAvailability(
                'Unknown Resource',
                { startDate: '2024-03-01', endDate: '2024-03-31' },
                [],
                mockTeamMembers,
                []
            );

            expect(result.type).toBe('availability');
            expect(result.isValid).toBe(false);
            expect(result.severity).toBe('error');
            expect(result.message).toContain('Resource not found');
        });
    });

    describe('validateSkillMatch', () => {
        test('should validate perfect skill match', async () => {
            const result = await validateSkillMatch(
                'Alice Developer',
                ['React', 'JavaScript'],
                'medium',
                mockTeamMembers
            );

            expect(result.type).toBe('skill_match');
            expect(result.isValid).toBe(true);
            expect(result.severity).toBe('info');
            expect(result.details.skillMatches.length).toBeGreaterThan(0);
            expect(result.details.skillGaps).toHaveLength(0);
        });

        test('should detect skill gaps', async () => {
            const result = await validateSkillMatch(
                'Charlie Junior',
                ['React', 'Advanced Architecture', 'Machine Learning'],
                'high',
                mockTeamMembers
            );

            expect(result.type).toBe('skill_match');
            expect(result.details.skillGaps.length).toBeGreaterThan(0);
            expect(result.severity).toBe('warning');
        });

        test('should handle no specific requirements', async () => {
            const result = await validateSkillMatch(
                'Alice Developer',
                [],
                'medium',
                mockTeamMembers
            );

            expect(result.type).toBe('skill_match');
            expect(result.isValid).toBe(true);
        });

        test('should assess tier-complexity appropriateness', async () => {
            const result = await validateSkillMatch(
                'Charlie Junior',
                [],
                'sophisticated',
                mockTeamMembers
            );

            expect(result.type).toBe('skill_match');
            expect(result.severity).toBe('warning');
            expect(result.message).toContain('may not be optimal');
        });

        test('should handle strict skill matching mode', async () => {
            const engine = new ValidationEngine({ strictSkillMatching: true });
            
            const result = await engine.validateSkillMatch(
                'Charlie Junior',
                ['Advanced Architecture'],
                'high',
                mockTeamMembers
            );

            expect(result.type).toBe('skill_match');
            // Should be more strict about skill gaps
            if (result.details.skillGaps.some(gap => gap.severity === 'critical')) {
                expect(result.isValid).toBe(false);
            }
        });

        test('should handle resource not found', async () => {
            const result = await validateSkillMatch(
                'Unknown Resource',
                ['React'],
                'medium',
                mockTeamMembers
            );

            expect(result.type).toBe('skill_match');
            expect(result.isValid).toBe(false);
            expect(result.severity).toBe('error');
        });
    });

    describe('validateCapacityLimits', () => {
        test('should validate capacity within limits', async () => {
            const result = await validateCapacityLimits(
                'Bob Senior',
                0.5,
                [],
                mockTeamMembers
            );

            expect(result.type).toBe('capacity_limits');
            expect(result.isValid).toBe(true);
            expect(result.severity).toBe('info');
            expect(result.details.projectedUtilization).toBe(0.5);
        });

        test('should detect over-allocation', async () => {
            const result = await validateCapacityLimits(
                'Alice Developer',
                0.5,
                mockExistingAllocations,
                mockTeamMembers
            );

            expect(result.type).toBe('capacity_limits');
            // Alice already has 0.9 utilization, adding 0.5 would exceed threshold
            expect(result.details.projectedUtilization).toBeGreaterThan(1.0);
            expect(result.severity).toBe('error');
        });

        test('should validate allocation percentage range', async () => {
            const result = await validateCapacityLimits(
                'Alice Developer',
                1.5, // Invalid percentage > 1.0
                [],
                mockTeamMembers
            );

            expect(result.type).toBe('capacity_limits');
            expect(result.isValid).toBe(false);
            expect(result.severity).toBe('error');
            expect(result.message).toContain('Invalid allocation percentage');
        });

        test('should handle minimum allocation percentage', async () => {
            const result = await validateCapacityLimits(
                'Alice Developer',
                0.05, // Below minimum 0.1
                [],
                mockTeamMembers
            );

            expect(result.type).toBe('capacity_limits');
            expect(result.isValid).toBe(false);
            expect(result.severity).toBe('error');
        });

        test('should allow over-allocation when configured', async () => {
            const engine = new ValidationEngine({ allowOverAllocation: true });
            
            const result = await engine.validateCapacityLimits(
                'Alice Developer',
                0.8,
                mockExistingAllocations,
                mockTeamMembers
            );

            expect(result.type).toBe('capacity_limits');
            // Should be warning instead of error when over-allocation is allowed
            if (result.details.projectedUtilization > result.details.overAllocationThreshold) {
                expect(result.severity).toBe('warning');
            }
        });

        test('should provide recommendations for over-allocation', async () => {
            const result = await validateCapacityLimits(
                'Alice Developer',
                0.8,
                mockExistingAllocations,
                mockTeamMembers
            );

            expect(result.type).toBe('capacity_limits');
            if (result.details.projectedUtilization > result.details.overAllocationThreshold) {
                expect(result.details.recommendations.length).toBeGreaterThan(0);
            }
        });
    });

    describe('validateWorkloadConstraints', () => {
        test('should validate sustainable workload', async () => {
            const allocationData = {
                resource: 'Bob Senior',
                projectName: 'New Project',
                taskName: 'Architecture',
                complexity: 'high',
                allocationPercentage: 0.5
            };

            const result = await validateWorkloadConstraints(
                allocationData,
                [],
                mockTeamMembers
            );

            expect(result.type).toBe('workload_constraints');
            expect(result.isValid).toBe(true);
            expect(result.details.sustainabilityScore).toBeGreaterThan(70);
        });

        test('should detect unsustainable workload', async () => {
            const heavyAllocations = [
                ...mockExistingAllocations,
                {
                    id: 'ALLOC-003',
                    resource: 'Alice Developer',
                    projectName: 'Project C',
                    taskName: 'Complex Task',
                    complexity: 'sophisticated',
                    allocationPercentage: 0.4
                },
                {
                    id: 'ALLOC-004',
                    resource: 'Alice Developer',
                    projectName: 'Project D',
                    taskName: 'Another Complex Task',
                    complexity: 'sophisticated',
                    allocationPercentage: 0.3
                }
            ];

            const allocationData = {
                resource: 'Alice Developer',
                projectName: 'Yet Another Project',
                taskName: 'More Work',
                complexity: 'high',
                allocationPercentage: 0.5
            };

            const result = await validateWorkloadConstraints(
                allocationData,
                heavyAllocations,
                mockTeamMembers
            );

            expect(result.type).toBe('workload_constraints');
            expect(result.details.sustainabilityScore).toBeLessThan(70);
            expect(result.severity).toBe('warning');
        });

        test('should check concurrent task limits', async () => {
            const manyAllocations = Array.from({ length: 5 }, (_, i) => ({
                id: `ALLOC-${i + 10}`,
                resource: 'Alice Developer',
                projectName: `Project ${i + 10}`,
                taskName: 'Development',
                complexity: 'medium',
                allocationPercentage: 0.2
            }));

            const allocationData = {
                resource: 'Alice Developer',
                projectName: 'One More Project',
                taskName: 'Development',
                complexity: 'medium',
                allocationPercentage: 0.2
            };

            const result = await validateWorkloadConstraints(
                allocationData,
                manyAllocations,
                mockTeamMembers
            );

            expect(result.type).toBe('workload_constraints');
            expect(result.details.currentTaskCount).toBe(5);
            expect(result.severity).toBe('warning');
            expect(result.message).toContain('maximum concurrent task limit');
        });

        test('should analyze complexity balance', async () => {
            const sophisticatedAllocations = Array.from({ length: 3 }, (_, i) => ({
                id: `ALLOC-${i + 20}`,
                resource: 'Alice Developer',
                projectName: `Complex Project ${i + 1}`,
                taskName: 'Architecture',
                complexity: 'sophisticated',
                allocationPercentage: 0.3
            }));

            const allocationData = {
                resource: 'Alice Developer',
                projectName: 'Another Complex Project',
                taskName: 'System Design',
                complexity: 'sophisticated',
                allocationPercentage: 0.3
            };

            const result = await validateWorkloadConstraints(
                allocationData,
                sophisticatedAllocations,
                mockTeamMembers
            );

            expect(result.type).toBe('workload_constraints');
            expect(result.details.recommendations.some(r => 
                r.includes('sophisticated') || r.includes('complex')
            )).toBe(true);
        });
    });

    describe('Cross-validation', () => {
        test('should perform successful cross-validation', async () => {
            const allocationData = {
                resource: 'Bob Senior',
                projectName: 'Simple Project',
                taskName: 'Development',
                complexity: 'medium',
                allocationPercentage: 0.4,
                startDate: '2024-03-01',
                endDate: '2024-03-31'
            };

            const results = await validateAllocationCreation(
                allocationData,
                [],
                mockTeamMembers,
                []
            );

            const crossValidation = results.find(r => r.type === 'cross_validation');
            expect(crossValidation).toBeDefined();
            expect(crossValidation.details.finalRecommendation).toBe('proceed');
            expect(crossValidation.details.overallRisk).toBe('low');
        });

        test('should detect high-risk scenarios', async () => {
            const allocationData = {
                resource: 'Alice Developer',
                projectName: 'Risky Project',
                taskName: 'Complex Development',
                complexity: 'sophisticated',
                allocationPercentage: 0.8,
                startDate: '2024-01-20', // Conflicts with existing allocations
                endDate: '2024-02-20'
            };

            const results = await validateAllocationCreation(
                allocationData,
                mockExistingAllocations,
                mockTeamMembers,
                mockLeaveSchedules
            );

            const crossValidation = results.find(r => r.type === 'cross_validation');
            expect(crossValidation).toBeDefined();
            expect(crossValidation.details.overallRisk).toBe('high');
            expect(crossValidation.details.finalRecommendation).toBe('reject');
        });

        test('should aggregate recommendations', async () => {
            const allocationData = {
                resource: 'Charlie Junior',
                projectName: 'Challenging Project',
                taskName: 'Advanced Development',
                complexity: 'high',
                allocationPercentage: 0.9,
                taskRequirements: ['Advanced Architecture', 'Machine Learning']
            };

            const results = await validateAllocationCreation(
                allocationData,
                [],
                mockTeamMembers,
                []
            );

            const crossValidation = results.find(r => r.type === 'cross_validation');
            expect(crossValidation).toBeDefined();
            expect(crossValidation.details.aggregatedRecommendations.length).toBeGreaterThan(0);
        });
    });

    describe('Convenience Functions', () => {
        test('should use default engine instance', async () => {
            const result = await validateResourceAvailability(
                'Alice Developer',
                { startDate: '2024-03-01', endDate: '2024-03-31' },
                [],
                mockTeamMembers,
                []
            );

            expect(result.type).toBe('availability');
            expect(result).toHaveProperty('isValid');
            expect(result).toHaveProperty('severity');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('details');
        });

        test('should handle all convenience functions', async () => {
            const allocationData = {
                resource: 'Bob Senior',
                projectName: 'Test Project',
                taskName: 'Development',
                complexity: 'medium',
                allocationPercentage: 0.5
            };

            // Test all convenience functions
            const availabilityResult = await validateResourceAvailability(
                'Bob Senior',
                { startDate: '2024-03-01', endDate: '2024-03-31' },
                [],
                mockTeamMembers,
                []
            );
            expect(availabilityResult.type).toBe('availability');

            const skillResult = await validateSkillMatch(
                'Bob Senior',
                ['React'],
                'medium',
                mockTeamMembers
            );
            expect(skillResult.type).toBe('skill_match');

            const capacityResult = await validateCapacityLimits(
                'Bob Senior',
                0.5,
                [],
                mockTeamMembers
            );
            expect(capacityResult.type).toBe('capacity_limits');

            const workloadResult = await validateWorkloadConstraints(
                allocationData,
                [],
                mockTeamMembers
            );
            expect(workloadResult.type).toBe('workload_constraints');
        });
    });

    describe('Error Handling', () => {
        test('should handle malformed allocation data', async () => {
            const malformedData = {
                // Missing required fields
                projectName: 'Test Project'
            };

            const results = await validateAllocationCreation(
                malformedData,
                [],
                mockTeamMembers,
                []
            );

            // Should handle gracefully and provide error feedback
            expect(results.length).toBeGreaterThan(0);
            const errorResults = results.filter(r => r.severity === 'error');
            expect(errorResults.length).toBeGreaterThan(0);
        });

        test('should handle empty team members array', async () => {
            const allocationData = {
                resource: 'Alice Developer',
                projectName: 'Test Project',
                taskName: 'Development'
            };

            const results = await validateAllocationCreation(
                allocationData,
                [],
                [], // Empty team members
                []
            );

            // Should handle gracefully
            expect(results.length).toBeGreaterThan(0);
            const errorResults = results.filter(r => r.severity === 'error');
            expect(errorResults.length).toBeGreaterThan(0);
        });

        test('should handle invalid date ranges', async () => {
            const result = await validateResourceAvailability(
                'Alice Developer',
                { startDate: 'invalid-date', endDate: '2024-03-31' },
                [],
                mockTeamMembers,
                []
            );

            expect(result.type).toBe('availability');
            // Should handle gracefully without crashing
            expect(result).toHaveProperty('isValid');
        });
    });
});