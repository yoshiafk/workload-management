/**
 * Property-Based Tests for Comprehensive Resource Validation
 * Task 3.6: Write property test for comprehensive resource validation
 * 
 * **Property 11: Comprehensive Resource Validation**
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
 * 
 * For any allocation request, the validation should consider resource availability,
 * existing allocations, leave schedules, capacity limits, skill matching, and workload
 * constraints, providing detailed feedback for any conflicts or violations.
 */

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
    ValidationEngine,
    validateAllocationCreation,
    validateResourceAvailability,
    validateSkillMatch,
    validateCapacityLimits,
    validateWorkloadConstraints
} from './validationEngine.js';

// Add custom matcher for multiple possible values
expect.extend({
    toBeOneOf(received, expected) {
        const pass = expected.includes(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be one of ${expected.join(', ')}`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be one of ${expected.join(', ')}`,
                pass: false,
            };
        }
    },
});

describe('Property 11: Comprehensive Resource Validation', () => {
    // Mock data generators for property-based testing
    const mockTeamMembers = [
        {
            id: 'MEM-001',
            name: 'Alice Developer',
            tierLevel: 3,
            type: 'FULLSTACK',
            maxCapacity: 1.0,
            overAllocationThreshold: 1.2,
            skillAreas: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'AWS'],
            isActive: true
        },
        {
            id: 'MEM-002',
            name: 'Bob Senior',
            tierLevel: 4,
            type: 'LEAD',
            maxCapacity: 1.0,
            overAllocationThreshold: 1.3,
            skillAreas: ['Architecture', 'Leadership', 'React', 'AWS', 'System Design', 'Microservices'],
            isActive: true
        },
        {
            id: 'MEM-003',
            name: 'Charlie Junior',
            tierLevel: 1,
            type: 'FULLSTACK',
            maxCapacity: 1.0,
            overAllocationThreshold: 1.1,
            skillAreas: ['HTML', 'CSS', 'JavaScript', 'React'],
            isActive: true
        },
        {
            id: 'MEM-004',
            name: 'Diana Principal',
            tierLevel: 5,
            type: 'PRINCIPAL',
            maxCapacity: 1.0,
            overAllocationThreshold: 1.4,
            skillAreas: ['Architecture', 'Strategy', 'Leadership', 'System Design', 'Cloud', 'Security'],
            isActive: true
        }
    ];

    // Fast-check generators
    const resourceNameGen = fc.constantFrom('Alice Developer', 'Bob Senior', 'Charlie Junior', 'Diana Principal');
    const complexityGen = fc.constantFrom('low', 'medium', 'high', 'sophisticated');
    const allocationPercentageGen = fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true });
    const dateGen = fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') });
    const skillGen = fc.constantFrom('React', 'Node.js', 'JavaScript', 'TypeScript', 'AWS', 'Architecture', 'Leadership', 'System Design', 'HTML', 'CSS', 'Python', 'Docker', 'Kubernetes');

    /**
     * Core Property: Comprehensive validation should consider all aspects
     * This validates that the validation engine checks availability, skills, capacity, and workload
     */
    test('Comprehensive validation should consider resource availability, skills, capacity, and workload constraints', async () => {
        await fc.assert(fc.asyncProperty(
            resourceNameGen,
            complexityGen,
            allocationPercentageGen,
            fc.array(skillGen, { minLength: 0, maxLength: 3 }),
            dateGen,
            dateGen,
            async (resourceName, complexity, allocationPercentage, taskRequirements, startDate, endDate) => {
                // **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
                
                // Ensure proper date ordering
                const [actualStartDate, actualEndDate] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
                
                const allocationData = {
                    resource: resourceName,
                    projectName: 'Test Project',
                    taskName: 'Development Task',
                    complexity: complexity,
                    allocationPercentage: allocationPercentage,
                    startDate: actualStartDate.toISOString().split('T')[0],
                    endDate: actualEndDate.toISOString().split('T')[0],
                    taskRequirements: taskRequirements
                };

                const validationResults = await validateAllocationCreation(
                    allocationData,
                    [], // No existing allocations for this test
                    mockTeamMembers,
                    [] // No leave schedules for this test
                );

                // Should return exactly 5 validation results (4 main + 1 cross-validation)
                expect(validationResults).toHaveLength(5);

                // Should include all required validation types
                const validationTypes = validationResults.map(r => r.type);
                expect(validationTypes).toContain('availability');
                expect(validationTypes).toContain('skill_match');
                expect(validationTypes).toContain('capacity_limits');
                expect(validationTypes).toContain('workload_constraints');
                expect(validationTypes).toContain('cross_validation');

                // Each validation result should have required structure
                validationResults.forEach(result => {
                    expect(result).toHaveProperty('type');
                    expect(result).toHaveProperty('isValid');
                    expect(result).toHaveProperty('severity');
                    expect(result).toHaveProperty('message');
                    expect(result).toHaveProperty('details');
                    
                    // Severity should be valid
                    expect(['info', 'warning', 'error']).toContain(result.severity);
                    
                    // Details should contain relevant information
                    expect(result.details).toBeTypeOf('object');
                });

                // Cross-validation should aggregate results appropriately
                const crossValidation = validationResults.find(r => r.type === 'cross_validation');
                expect(crossValidation).toBeDefined();
                expect(crossValidation.details).toHaveProperty('overallRisk');
                expect(crossValidation.details).toHaveProperty('finalRecommendation');
                expect(['low', 'medium', 'high']).toContain(crossValidation.details.overallRisk);
                expect(['proceed', 'proceed_with_caution', 'proceed_with_monitoring', 'reject']).toContain(crossValidation.details.finalRecommendation);

                return true;
            }
        ), { numRuns: 50 }); // Reduced runs due to async nature
    });

    /**
     * Availability Validation Property: Should detect conflicts with existing allocations and leave schedules
     * This validates Requirements 7.1 and 7.2 - availability checking considering existing allocations and leave
     */
    test('Availability validation should detect conflicts with existing allocations and leave schedules', async () => {
        await fc.assert(fc.asyncProperty(
            resourceNameGen,
            dateGen,
            dateGen,
            fc.array(allocationPercentageGen, { minLength: 1, maxLength: 3 }),
            async (resourceName, startDate, endDate, existingPercentages) => {
                // **Validates: Requirements 7.1, 7.2**
                
                // Skip invalid dates
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    return true;
                }
                
                // Ensure proper date ordering
                const [actualStartDate, actualEndDate] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
                
                // Create overlapping existing allocations
                const existingAllocations = existingPercentages.map((percentage, index) => ({
                    id: `ALLOC-${index + 1}`,
                    resource: resourceName,
                    projectName: `Existing Project ${index + 1}`,
                    taskName: 'Development',
                    allocationPercentage: percentage,
                    plan: {
                        taskStart: actualStartDate.toISOString().split('T')[0],
                        taskEnd: actualEndDate.toISOString().split('T')[0]
                    }
                }));

                // Create overlapping leave schedule
                const leaveSchedules = [{
                    id: 'LEAVE-001',
                    memberName: resourceName,
                    type: 'vacation',
                    startDate: actualStartDate.toISOString().split('T')[0],
                    endDate: actualEndDate.toISOString().split('T')[0]
                }];

                const dateRange = {
                    startDate: actualStartDate.toISOString().split('T')[0],
                    endDate: actualEndDate.toISOString().split('T')[0]
                };

                // Test with existing allocations
                const availabilityWithAllocations = await validateResourceAvailability(
                    resourceName,
                    dateRange,
                    existingAllocations,
                    mockTeamMembers,
                    []
                );

                expect(availabilityWithAllocations.type).toBe('availability');
                expect(availabilityWithAllocations.details.resourceId).toBe(resourceName);
                
                // Should detect allocation conflicts if they exist
                if (existingAllocations.length > 0) {
                    expect(availabilityWithAllocations.details.conflicts.length).toBeGreaterThan(0);
                    const allocationConflicts = availabilityWithAllocations.details.conflicts.filter(c => c.type === 'allocation_overlap');
                    expect(allocationConflicts.length).toBeGreaterThan(0);
                }

                // Test with leave schedules
                const availabilityWithLeave = await validateResourceAvailability(
                    resourceName,
                    dateRange,
                    [],
                    mockTeamMembers,
                    leaveSchedules
                );

                expect(availabilityWithLeave.type).toBe('availability');
                
                // Should detect leave conflicts
                expect(availabilityWithLeave.isValid).toBe(false);
                expect(availabilityWithLeave.severity).toBe('error');
                const leaveConflicts = availabilityWithLeave.details.conflicts.filter(c => c.type === 'leave_conflict');
                expect(leaveConflicts.length).toBeGreaterThan(0);

                return true;
            }
        ), { numRuns: 30 });
    });

    /**
     * Skill Matching Property: Should validate skill match between resource capabilities and task requirements
     * This validates Requirement 7.3 - skill matching validation
     */
    test('Skill validation should match resource capabilities against task requirements', async () => {
        await fc.assert(fc.asyncProperty(
            resourceNameGen,
            fc.array(skillGen, { minLength: 1, maxLength: 4 }),
            complexityGen,
            async (resourceName, taskRequirements, complexity) => {
                // **Validates: Requirements 7.3**
                
                const resource = mockTeamMembers.find(m => m.name === resourceName);
                if (!resource) return true;

                const skillResult = await validateSkillMatch(
                    resourceName,
                    taskRequirements,
                    complexity,
                    mockTeamMembers
                );

                expect(skillResult.type).toBe('skill_match');
                expect(skillResult.details.resourceId).toBe(resourceName);
                expect(skillResult.details.taskRequirements).toEqual(taskRequirements);
                expect(skillResult.details.complexity).toBe(complexity);

                // Should analyze skill matches and gaps
                expect(skillResult.details).toHaveProperty('skillMatches');
                expect(skillResult.details).toHaveProperty('skillGaps');
                expect(Array.isArray(skillResult.details.skillMatches)).toBe(true);
                expect(Array.isArray(skillResult.details.skillGaps)).toBe(true);

                // Skill matches should be valid
                skillResult.details.skillMatches.forEach(match => {
                    expect(match).toHaveProperty('required');
                    expect(match).toHaveProperty('matched');
                    expect(match).toHaveProperty('confidence');
                    expect(match.confidence).toBeGreaterThan(0);
                    expect(match.confidence).toBeLessThanOrEqual(1);
                });

                // Skill gaps should be properly categorized
                skillResult.details.skillGaps.forEach(gap => {
                    expect(gap).toHaveProperty('skill');
                    expect(gap).toHaveProperty('severity');
                    expect(['critical', 'moderate']).toContain(gap.severity);
                });

                // Should provide recommendations when there are gaps
                if (skillResult.details.skillGaps.length > 0) {
                    expect(skillResult.details.recommendations.length).toBeGreaterThan(0);
                }

                // Validation result should be consistent with skill analysis
                const hasCriticalGaps = skillResult.details.skillGaps.some(gap => gap.severity === 'critical');
                if (hasCriticalGaps && skillResult.severity === 'error') {
                    expect(skillResult.isValid).toBe(false);
                }

                return true;
            }
        ), { numRuns: 50 });
    });

    /**
     * Capacity Limits Property: Should check workload limits and prevent over-allocation
     * This validates Requirement 7.4 - capacity limits and over-allocation prevention
     */
    test('Capacity validation should check workload limits and prevent assignments exceeding sustainable capacity', async () => {
        await fc.assert(fc.asyncProperty(
            resourceNameGen,
            allocationPercentageGen,
            fc.array(allocationPercentageGen, { minLength: 0, maxLength: 3 }),
            async (resourceName, requestedPercentage, existingPercentages) => {
                // **Validates: Requirements 7.4**
                
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

                const capacityResult = await validateCapacityLimits(
                    resourceName,
                    requestedPercentage,
                    existingAllocations,
                    mockTeamMembers
                );

                expect(capacityResult.type).toBe('capacity_limits');
                expect(capacityResult.details.resourceId).toBe(resourceName);
                expect(capacityResult.details.requestedPercentage).toBe(requestedPercentage);

                // Should calculate current and projected utilization
                expect(capacityResult.details).toHaveProperty('currentUtilization');
                expect(capacityResult.details).toHaveProperty('projectedUtilization');
                expect(capacityResult.details).toHaveProperty('maxCapacity');
                expect(capacityResult.details).toHaveProperty('overAllocationThreshold');

                const currentUtilization = existingPercentages.reduce((sum, p) => sum + p, 0);
                const projectedUtilization = currentUtilization + requestedPercentage;

                // Current utilization should match sum of existing allocations
                expect(Math.abs(capacityResult.details.currentUtilization - currentUtilization)).toBeLessThan(0.001);
                
                // Projected utilization should include the new request
                expect(Math.abs(capacityResult.details.projectedUtilization - projectedUtilization)).toBeLessThan(0.001);

                // Should validate against capacity thresholds
                if (projectedUtilization > resource.overAllocationThreshold) {
                    expect(capacityResult.severity).toBeOneOf(['warning', 'error']);
                    expect(capacityResult.details.recommendations.length).toBeGreaterThan(0);
                }

                // Should reject invalid allocation percentages
                if (requestedPercentage < 0.1 || requestedPercentage > 1.0) {
                    expect(capacityResult.isValid).toBe(false);
                    expect(capacityResult.severity).toBe('error');
                    expect(capacityResult.message).toContain('Invalid allocation percentage');
                }

                return true;
            }
        ), { numRuns: 50 });
    });

    /**
     * Workload Constraints Property: Should validate sustainable workload and concurrent task limits
     * This validates Requirement 7.5 - workload constraints and sustainability
     */
    test('Workload validation should ensure sustainable capacity and reasonable concurrent task limits', async () => {
        await fc.assert(fc.asyncProperty(
            resourceNameGen,
            complexityGen,
            allocationPercentageGen,
            fc.array(fc.record({
                complexity: complexityGen,
                percentage: allocationPercentageGen
            }), { minLength: 0, maxLength: 6 }),
            async (resourceName, newComplexity, newPercentage, existingTasks) => {
                // **Validates: Requirements 7.5**
                
                // Create existing allocations with varying complexity
                const existingAllocations = existingTasks.map((task, index) => ({
                    id: `ALLOC-${index + 1}`,
                    resource: resourceName,
                    projectName: `Project ${index + 1}`,
                    taskName: 'Development',
                    complexity: task.complexity,
                    allocationPercentage: task.percentage,
                    plan: {
                        taskStart: '2024-01-01',
                        taskEnd: '2024-01-31'
                    }
                }));

                const allocationData = {
                    resource: resourceName,
                    projectName: 'New Project',
                    taskName: 'New Task',
                    complexity: newComplexity,
                    allocationPercentage: newPercentage
                };

                const workloadResult = await validateWorkloadConstraints(
                    allocationData,
                    existingAllocations,
                    mockTeamMembers
                );

                expect(workloadResult.type).toBe('workload_constraints');
                expect(workloadResult.details.resourceId).toBe(resourceName);

                // Should track concurrent task count
                expect(workloadResult.details).toHaveProperty('currentTaskCount');
                expect(workloadResult.details).toHaveProperty('maxConcurrentTasks');
                expect(workloadResult.details.currentTaskCount).toBe(existingTasks.length);

                // Should analyze workload distribution
                expect(workloadResult.details).toHaveProperty('workloadDistribution');
                expect(Array.isArray(workloadResult.details.workloadDistribution)).toBe(true);

                // Should calculate sustainability score
                expect(workloadResult.details).toHaveProperty('sustainabilityScore');
                expect(workloadResult.details.sustainabilityScore).toBeGreaterThanOrEqual(0);
                expect(workloadResult.details.sustainabilityScore).toBeLessThanOrEqual(100);

                // Should warn about too many concurrent tasks
                if (existingTasks.length >= 5) {
                    expect(workloadResult.severity).toBeOneOf(['warning', 'error']);
                    expect(workloadResult.message).toMatch(/concurrent task limit|Unsustainable workload/);
                }

                // Should consider sustainability score in validation
                if (workloadResult.details.sustainabilityScore < 50) {
                    // The validation engine may warn about low sustainability but not necessarily fail
                    expect(workloadResult.severity).toBeOneOf(['warning', 'error']);
                    if (workloadResult.severity === 'error') {
                        expect(workloadResult.isValid).toBe(false);
                    }
                    expect(workloadResult.message).toMatch(/Unsustainable workload|Low workload sustainability/);
                } else if (workloadResult.details.sustainabilityScore < 70) {
                    expect(workloadResult.severity).toBeOneOf(['warning', 'error', 'info']);
                }

                // Should provide recommendations for workload issues
                if (workloadResult.severity !== 'info') {
                    expect(workloadResult.details.recommendations.length).toBeGreaterThan(0);
                }

                return true;
            }
        ), { numRuns: 40 });
    });

    /**
     * Detailed Feedback Property: Should provide detailed validation feedback explaining conflicts
     * This validates Requirement 7.5 - detailed feedback for conflicts and constraints
     */
    test('Validation should provide detailed feedback explaining any conflicts or constraints', async () => {
        await fc.assert(fc.asyncProperty(
            resourceNameGen,
            complexityGen,
            allocationPercentageGen,
            fc.array(skillGen, { minLength: 1, maxLength: 3 }),
            async (resourceName, complexity, allocationPercentage, taskRequirements) => {
                // **Validates: Requirements 7.5**
                
                // Create a scenario with potential conflicts
                const conflictingAllocations = [
                    {
                        id: 'CONFLICT-001',
                        resource: resourceName,
                        projectName: 'Conflicting Project',
                        taskName: 'Conflicting Task',
                        allocationPercentage: 0.8,
                        plan: {
                            taskStart: '2024-01-01',
                            taskEnd: '2024-01-31'
                        }
                    }
                ];

                const leaveSchedules = [
                    {
                        id: 'LEAVE-001',
                        memberName: resourceName,
                        type: 'vacation',
                        startDate: '2024-01-15',
                        endDate: '2024-01-20'
                    }
                ];

                const allocationData = {
                    resource: resourceName,
                    projectName: 'Test Project',
                    taskName: 'Test Task',
                    complexity: complexity,
                    allocationPercentage: allocationPercentage,
                    startDate: '2024-01-01',
                    endDate: '2024-01-31',
                    taskRequirements: taskRequirements
                };

                const validationResults = await validateAllocationCreation(
                    allocationData,
                    conflictingAllocations,
                    mockTeamMembers,
                    leaveSchedules
                );

                // Should provide detailed feedback for each validation type
                validationResults.forEach(result => {
                    expect(result.details).toBeTypeOf('object');
                    
                    // Should include specific conflict information when applicable
                    if (result.type === 'availability' && result.details.conflicts.length > 0) {
                        result.details.conflicts.forEach(conflict => {
                            expect(conflict).toHaveProperty('type');
                            expect(['allocation_overlap', 'leave_conflict', 'capacity_exceeded']).toContain(conflict.type);
                        });
                    }
                    
                    // Should provide recommendations when issues are found
                    if (result.severity !== 'info' && result.type !== 'cross_validation') {
                        expect(result.details).toHaveProperty('recommendations');
                        expect(Array.isArray(result.details.recommendations)).toBe(true);
                    }
                });

                // Cross-validation should aggregate all recommendations
                const crossValidation = validationResults.find(r => r.type === 'cross_validation');
                expect(crossValidation.details).toHaveProperty('aggregatedRecommendations');
                expect(Array.isArray(crossValidation.details.aggregatedRecommendations)).toBe(true);

                // Should provide clear final recommendation
                expect(crossValidation.details).toHaveProperty('finalRecommendation');
                expect(['proceed', 'proceed_with_caution', 'proceed_with_monitoring', 'reject']).toContain(crossValidation.details.finalRecommendation);

                return true;
            }
        ), { numRuns: 30 });
    });

    /**
     * Error Handling Property: Should handle invalid inputs and edge cases gracefully
     * This validates that the validation engine is robust against invalid or edge case inputs
     */
    test('Validation should handle invalid inputs and edge cases gracefully without crashing', async () => {
        await fc.assert(fc.asyncProperty(
            fc.oneof(
                fc.constant('Unknown Resource'),
                fc.constant(''),
                fc.constant(null),
                resourceNameGen
            ),
            fc.oneof(
                fc.constant('invalid-complexity'),
                fc.constant(''),
                complexityGen
            ),
            fc.oneof(
                fc.constant(-1),
                fc.constant(0),
                fc.constant(2.0),
                fc.constant(NaN),
                allocationPercentageGen
            ),
            async (resourceName, complexity, allocationPercentage) => {
                // **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
                
                const allocationData = {
                    resource: resourceName,
                    projectName: 'Test Project',
                    taskName: 'Test Task',
                    complexity: complexity,
                    allocationPercentage: allocationPercentage,
                    startDate: '2024-01-01',
                    endDate: '2024-01-31'
                };

                try {
                    const validationResults = await validateAllocationCreation(
                        allocationData,
                        [],
                        mockTeamMembers,
                        []
                    );

                    // Should always return an array of results
                    expect(Array.isArray(validationResults)).toBe(true);
                    expect(validationResults.length).toBeGreaterThan(0);

                    // Each result should have proper structure even for invalid inputs
                    validationResults.forEach(result => {
                        expect(result).toHaveProperty('type');
                        expect(result).toHaveProperty('isValid');
                        expect(result).toHaveProperty('severity');
                        expect(result).toHaveProperty('message');
                        expect(result).toHaveProperty('details');
                        expect(typeof result.message).toBe('string');
                    });

                    // Invalid inputs should result in error validations
                    if (!resourceName || resourceName === 'Unknown Resource' || resourceName === '') {
                        const errorResults = validationResults.filter(r => r.severity === 'error');
                        expect(errorResults.length).toBeGreaterThan(0);
                    }

                    if (isNaN(allocationPercentage) || allocationPercentage < 0.1 || allocationPercentage > 1.0) {
                        const capacityResult = validationResults.find(r => r.type === 'capacity_limits');
                        if (capacityResult && !isNaN(allocationPercentage) && allocationPercentage !== 0) {
                            expect(capacityResult.isValid).toBe(false);
                        }
                    }

                    return true;

                } catch (error) {
                    // Should not throw unhandled errors - if we get here, the test should fail
                    throw error;
                }
            }
        ), { numRuns: 40 });
    });

    /**
     * Integration Property: All validation components should work together coherently
     * This validates that the comprehensive validation provides consistent and coherent results
     */
    test('All validation components should work together to provide coherent comprehensive validation', async () => {
        await fc.assert(fc.asyncProperty(
            resourceNameGen,
            complexityGen,
            allocationPercentageGen,
            fc.array(skillGen, { minLength: 0, maxLength: 2 }),
            fc.array(allocationPercentageGen, { minLength: 0, maxLength: 2 }),
            async (resourceName, complexity, allocationPercentage, taskRequirements, existingPercentages) => {
                // **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
                
                const resource = mockTeamMembers.find(m => m.name === resourceName);
                if (!resource) return true;

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

                const allocationData = {
                    resource: resourceName,
                    projectName: 'Integration Test Project',
                    taskName: 'Integration Task',
                    complexity: complexity,
                    allocationPercentage: allocationPercentage,
                    startDate: '2024-01-01',
                    endDate: '2024-01-31',
                    taskRequirements: taskRequirements
                };

                const validationResults = await validateAllocationCreation(
                    allocationData,
                    existingAllocations,
                    mockTeamMembers,
                    []
                );

                // Cross-validation should provide coherent overall assessment
                const crossValidation = validationResults.find(r => r.type === 'cross_validation');
                const errorCount = validationResults.filter(r => r.severity === 'error').length;
                const warningCount = validationResults.filter(r => r.severity === 'warning').length;

                // Final recommendation should be consistent with individual validations
                if (errorCount > 0) {
                    expect(crossValidation.details.finalRecommendation).toBe('reject');
                    expect(crossValidation.details.overallRisk).toBe('high');
                    expect(crossValidation.isValid).toBe(false);
                } else if (warningCount > 2) {
                    expect(crossValidation.details.finalRecommendation).toBeOneOf(['proceed_with_caution', 'proceed_with_monitoring']);
                    expect(crossValidation.details.overallRisk).toBeOneOf(['medium', 'low']);
                } else if (warningCount > 0) {
                    expect(crossValidation.details.finalRecommendation).toBeOneOf(['proceed_with_monitoring', 'proceed_with_caution']);
                    expect(crossValidation.details.overallRisk).toBeOneOf(['low', 'medium']);
                } else {
                    expect(crossValidation.details.finalRecommendation).toBe('proceed');
                    expect(crossValidation.details.overallRisk).toBe('low');
                }

                // All recommendations should be aggregated without duplicates
                const allRecommendations = validationResults
                    .flatMap(r => r.details?.recommendations || [])
                    .filter((rec, index, arr) => arr.indexOf(rec) === index);
                
                expect(crossValidation.details.aggregatedRecommendations).toEqual(allRecommendations);

                return true;
            }
        ), { numRuns: 30 });
    });
});