/**
 * Property-Based Tests for SLA Engine
 * Tests SLA priority mapping correctness across all possible inputs
 * **Property 17: SLA Priority Mapping Correctness**
 * **Validates: User Requirement - SLA Time Mapping to Priority**
 */

import fc from 'fast-check';
import {
    SLAEngine,
    PRIORITY_LEVELS,
    SLA_COMPLIANCE_STATUS,
    DEFAULT_SLA_MAPPINGS,
    getSLARequirements,
    calculateSLADeadlines,
    checkSLACompliance,
    trackSLACompliance
} from './slaEngine.js';

describe('Property 17: SLA Priority Mapping Correctness', () => {
    /**
     * Property: For any task with a defined priority level, the system should map appropriate 
     * SLA time requirements (response, resolution, escalation times) and track compliance 
     * against these service level agreements.
     */
    test('should map appropriate SLA time requirements for any defined priority level', () => {
        fc.assert(fc.property(
            fc.constantFrom('P1', 'P2', 'P3', 'P4', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', '1', '2', '3', '4'),
            (priority) => {
                const requirements = getSLARequirements(priority);
                
                // All valid priorities should have proper SLA mappings
                expect(requirements).toBeDefined();
                expect(requirements.responseTime).toBeGreaterThan(0);
                expect(requirements.resolutionTime).toBeGreaterThan(0);
                expect(requirements.escalationTime).toBeGreaterThan(0);
                expect(requirements.label).toBeDefined();
                expect(requirements.description).toBeDefined();
                
                // Response time should be less than or equal to resolution time
                expect(requirements.responseTime).toBeLessThanOrEqual(requirements.resolutionTime);
                
                // Escalation time should be between response and resolution time
                expect(requirements.escalationTime).toBeGreaterThanOrEqual(requirements.responseTime);
                expect(requirements.escalationTime).toBeLessThanOrEqual(requirements.resolutionTime);
                
                // Priority should be normalized to standard format
                expect(['P1', 'P2', 'P3', 'P4']).toContain(requirements.priority);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    test('should calculate correct SLA deadlines for any priority and start time', () => {
        fc.assert(fc.property(
            fc.constantFrom('P1', 'P2', 'P3', 'P4'),
            fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(date => !isNaN(date.getTime())),
            (priority, startTime) => {
                const deadlines = calculateSLADeadlines(priority, startTime);
                
                // Should have all required deadline fields
                expect(deadlines.priority).toBe(priority);
                expect(deadlines.startTime).toBeDefined();
                expect(deadlines.responseDeadline).toBeDefined();
                expect(deadlines.resolutionDeadline).toBeDefined();
                expect(deadlines.escalationDeadline).toBeDefined();
                expect(deadlines.slaRequirements).toBeDefined();
                
                // All deadlines should be after start time
                const start = new Date(deadlines.startTime);
                const response = new Date(deadlines.responseDeadline);
                const resolution = new Date(deadlines.resolutionDeadline);
                const escalation = new Date(deadlines.escalationDeadline);
                
                expect(response.getTime()).toBeGreaterThan(start.getTime());
                expect(resolution.getTime()).toBeGreaterThan(start.getTime());
                expect(escalation.getTime()).toBeGreaterThan(start.getTime());
                
                // Resolution deadline should be after response deadline
                expect(resolution.getTime()).toBeGreaterThanOrEqual(response.getTime());
                
                // Escalation deadline should be between response and resolution
                expect(escalation.getTime()).toBeGreaterThanOrEqual(response.getTime());
                expect(escalation.getTime()).toBeLessThanOrEqual(resolution.getTime());
                
                return true;
            }
        ), { numRuns: 100 });
    });

    test('should track SLA compliance correctly for any task configuration', () => {
        fc.assert(fc.property(
            fc.record({
                priority: fc.constantFrom('P1', 'P2', 'P3', 'P4'),
                startTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-01-31') }).filter(date => !isNaN(date.getTime())),
                currentTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-02-28') }).filter(date => !isNaN(date.getTime())),
                status: fc.constantFrom('in-progress', 'completed', 'pending', 'cancelled')
            }),
            (taskData) => {
                const task = {
                    id: 'test-task',
                    priority: taskData.priority,
                    startTime: taskData.startTime.toISOString(),
                    status: taskData.status
                };
                
                const compliance = checkSLACompliance(task, taskData.currentTime);
                
                // Should have all required compliance fields
                expect(compliance.status).toBeDefined();
                expect(['Within SLA', 'At Risk', 'Breached']).toContain(compliance.status);
                expect(compliance.priority).toBe(taskData.priority);
                expect(compliance.deadlineType).toBeDefined();
                expect(['response', 'resolution']).toContain(compliance.deadlineType);
                expect(compliance.relevantDeadline).toBeDefined();
                expect(compliance.timeRemaining).toBeDefined();
                expect(compliance.deadlines).toBeDefined();
                expect(typeof compliance.isBreached).toBe('boolean');
                expect(typeof compliance.isAtRisk).toBe('boolean');
                expect(typeof compliance.compliancePercentage).toBe('number');
                
                // Compliance percentage should be between 0 and 100
                expect(compliance.compliancePercentage).toBeGreaterThanOrEqual(0);
                expect(compliance.compliancePercentage).toBeLessThanOrEqual(100);
                
                // Status consistency checks
                if (compliance.status === 'Breached') {
                    expect(compliance.isBreached).toBe(true);
                    expect(compliance.isAtRisk).toBe(false);
                    expect(compliance.timeRemaining.isOverdue).toBe(true);
                } else if (compliance.status === 'At Risk') {
                    expect(compliance.isBreached).toBe(false);
                    expect(compliance.isAtRisk).toBe(true);
                    expect(compliance.timeRemaining.isOverdue).toBe(false);
                } else { // Within SLA
                    expect(compliance.isBreached).toBe(false);
                    expect(compliance.isAtRisk).toBe(false);
                    expect(compliance.timeRemaining.isOverdue).toBe(false);
                }
                
                return true;
            }
        ), { numRuns: 100 });
    });

    test('should handle priority hierarchy correctly (Critical > High > Medium > Low)', () => {
        fc.assert(fc.property(
            fc.constant(null), // No random input needed for this test
            () => {
                const p1Requirements = getSLARequirements('P1');
                const p2Requirements = getSLARequirements('P2');
                const p3Requirements = getSLARequirements('P3');
                const p4Requirements = getSLARequirements('P4');
                
                // Critical (P1) should have the fastest response times
                expect(p1Requirements.responseTime).toBeLessThan(p2Requirements.responseTime);
                expect(p1Requirements.responseTime).toBeLessThan(p3Requirements.responseTime);
                expect(p1Requirements.responseTime).toBeLessThan(p4Requirements.responseTime);
                
                // Resolution times should follow priority order
                expect(p1Requirements.resolutionTime).toBeLessThan(p2Requirements.resolutionTime);
                expect(p2Requirements.resolutionTime).toBeLessThan(p3Requirements.resolutionTime);
                expect(p3Requirements.resolutionTime).toBeLessThan(p4Requirements.resolutionTime);
                
                // Escalation times should follow priority order
                expect(p1Requirements.escalationTime).toBeLessThan(p2Requirements.escalationTime);
                expect(p2Requirements.escalationTime).toBeLessThan(p3Requirements.escalationTime);
                expect(p3Requirements.escalationTime).toBeLessThan(p4Requirements.escalationTime);
                
                return true;
            }
        ), { numRuns: 10 });
    });

    test('should provide consistent SLA tracking across multiple tasks', () => {
        fc.assert(fc.property(
            fc.array(
                fc.record({
                    id: fc.string({ minLength: 1, maxLength: 20 }),
                    priority: fc.constantFrom('P1', 'P2', 'P3', 'P4'),
                    startTime: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-01-31') }).filter(date => !isNaN(date.getTime())),
                    status: fc.constantFrom('in-progress', 'completed', 'pending')
                }),
                { minLength: 1, maxLength: 20 }
            ),
            fc.date({ min: new Date('2024-01-01'), max: new Date('2024-02-28') }).filter(date => !isNaN(date.getTime())),
            (taskDataArray, currentTime) => {
                const tasks = taskDataArray.map(data => ({
                    id: data.id,
                    taskName: `Task ${data.id}`,
                    priority: data.priority,
                    startTime: data.startTime.toISOString(),
                    status: data.status
                }));
                
                const tracking = trackSLACompliance(tasks, currentTime);
                
                // Should have proper summary structure
                expect(tracking.summary).toBeDefined();
                expect(tracking.summary.totalTasks).toBe(tasks.length);
                expect(tracking.summary.breachedTasks).toBeGreaterThanOrEqual(0);
                expect(tracking.summary.atRiskTasks).toBeGreaterThanOrEqual(0);
                expect(tracking.summary.withinSLATasks).toBeGreaterThanOrEqual(0);
                expect(tracking.summary.complianceRate).toBeGreaterThanOrEqual(0);
                expect(tracking.summary.complianceRate).toBeLessThanOrEqual(100);
                
                // Total should equal sum of all status categories
                const totalCalculated = tracking.summary.breachedTasks + 
                                      tracking.summary.atRiskTasks + 
                                      tracking.summary.withinSLATasks;
                expect(totalCalculated).toBe(tracking.summary.totalTasks);
                
                // Should have priority breakdown
                expect(tracking.byPriority).toBeDefined();
                expect(tracking.byPriority.P1).toBeDefined();
                expect(tracking.byPriority.P2).toBeDefined();
                expect(tracking.byPriority.P3).toBeDefined();
                expect(tracking.byPriority.P4).toBeDefined();
                
                // Priority totals should sum to overall total
                const priorityTotal = tracking.byPriority.P1.total + 
                                    tracking.byPriority.P2.total + 
                                    tracking.byPriority.P3.total + 
                                    tracking.byPriority.P4.total;
                expect(priorityTotal).toBe(tracking.summary.totalTasks);
                
                // Should have individual task results
                expect(tracking.tasks).toBeDefined();
                expect(tracking.tasks).toHaveLength(tasks.length);
                
                // Each task should have proper compliance data
                tracking.tasks.forEach(taskResult => {
                    expect(taskResult.taskId).toBeDefined();
                    expect(taskResult.priority).toBeDefined();
                    expect(taskResult.status).toBeDefined();
                    expect(typeof taskResult.isBreached).toBe('boolean');
                    expect(typeof taskResult.isAtRisk).toBe('boolean');
                });
                
                return true;
            }
        ), { numRuns: 50 });
    });

    test('should handle unknown priorities gracefully with fallback behavior', () => {
        fc.assert(fc.property(
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => 
                !['P1', 'P2', 'P3', 'P4', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', '1', '2', '3', '4'].includes(s.toUpperCase())
            ),
            (unknownPriority) => {
                const requirements = getSLARequirements(unknownPriority);
                
                // Should fallback to medium priority behavior
                expect(requirements).toBeDefined();
                expect(requirements.priority).toBe(unknownPriority); // Should preserve original priority
                expect(requirements.error).toContain('Unknown priority level');
                
                // Should use medium priority SLA times
                const mediumRequirements = getSLARequirements('P3');
                expect(requirements.responseTime).toBe(mediumRequirements.responseTime);
                expect(requirements.resolutionTime).toBe(mediumRequirements.resolutionTime);
                expect(requirements.escalationTime).toBe(mediumRequirements.escalationTime);
                
                return true;
            }
        ), { numRuns: 50 });
    });

    test('should maintain mathematical consistency in time calculations', () => {
        fc.assert(fc.property(
            fc.constantFrom('P1', 'P2', 'P3', 'P4'),
            fc.date({ min: new Date('2024-01-01'), max: new Date('2024-01-31') }).filter(date => !isNaN(date.getTime())),
            fc.integer({ min: 0, max: 168 }), // Hours offset for current time
            (priority, startTime, hoursOffset) => {
                const currentTime = new Date(startTime.getTime() + hoursOffset * 60 * 60 * 1000);
                
                const task = {
                    id: 'test-task',
                    priority,
                    startTime: startTime.toISOString(),
                    status: 'in-progress'
                };
                
                const compliance = checkSLACompliance(task, currentTime);
                const deadlines = calculateSLADeadlines(priority, startTime);
                
                // Time remaining calculations should be mathematically consistent
                const relevantDeadline = new Date(compliance.relevantDeadline);
                const timeDiffMs = relevantDeadline.getTime() - currentTime.getTime();
                const expectedHours = timeDiffMs / (1000 * 60 * 60);
                
                if (timeDiffMs > 0) {
                    // Should not be overdue
                    expect(compliance.timeRemaining.isOverdue).toBe(false);
                    expect(Math.abs(compliance.timeRemaining.totalHours - expectedHours)).toBeLessThan(0.01);
                    
                    // If overdue is false, status should not be breached
                    expect(compliance.status).not.toBe('Breached');
                } else {
                    // Should be overdue and breached
                    expect(compliance.timeRemaining.isOverdue).toBe(true);
                    expect(compliance.status).toBe('Breached');
                }
                
                // Deadline calculations should be consistent
                const requirements = getSLARequirements(priority);
                const expectedResponseDeadline = new Date(startTime.getTime() + requirements.responseTime * 60 * 60 * 1000);
                const actualResponseDeadline = new Date(deadlines.responseDeadline);
                
                // Allow small differences due to business hours calculation
                const timeDifference = Math.abs(expectedResponseDeadline.getTime() - actualResponseDeadline.getTime());
                expect(timeDifference).toBeLessThan(1000); // Less than 1 second difference
                
                return true;
            }
        ), { numRuns: 100 });
    });

    test('should handle edge cases and invalid inputs gracefully', () => {
        fc.assert(fc.property(
            fc.record({
                priority: fc.oneof(
                    fc.constantFrom('P1', 'P2', 'P3', 'P4'),
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.constant(''),
                    fc.string({ minLength: 1, maxLength: 10 })
                ),
                startTime: fc.oneof(
                    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(date => !isNaN(date.getTime())),
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.constant('')
                ),
                status: fc.oneof(
                    fc.constantFrom('in-progress', 'completed', 'pending'),
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.string({ minLength: 1, maxLength: 20 })
                )
            }),
            (taskData) => {
                // Should not throw errors for any input combination
                expect(() => {
                    const requirements = getSLARequirements(taskData.priority);
                    expect(requirements).toBeDefined();
                }).not.toThrow();
                
                expect(() => {
                    const deadlines = calculateSLADeadlines(taskData.priority, taskData.startTime);
                    expect(deadlines).toBeDefined();
                }).not.toThrow();
                
                expect(() => {
                    const task = {
                        id: 'test-task',
                        priority: taskData.priority,
                        startTime: taskData.startTime,
                        status: taskData.status
                    };
                    const compliance = checkSLACompliance(task);
                    expect(compliance).toBeDefined();
                }).not.toThrow();
                
                return true;
            }
        ), { numRuns: 100 });
    });

    test('should support custom SLA configuration updates', () => {
        fc.assert(fc.property(
            fc.record({
                responseTime: fc.integer({ min: 1, max: 24 }),
                resolutionTime: fc.integer({ min: 2, max: 168 }),
                escalationTime: fc.integer({ min: 1, max: 48 })
            }).filter(config => 
                config.responseTime <= config.resolutionTime && 
                config.escalationTime >= config.responseTime && 
                config.escalationTime <= config.resolutionTime
            ),
            (customConfig) => {
                const slaEngine = new SLAEngine();
                
                // Update P1 configuration
                const updatedConfig = slaEngine.updateSLAMappings({
                    P1: {
                        ...customConfig,
                        label: 'Custom Critical',
                        description: 'Custom critical priority'
                    }
                });
                
                // Should reflect the updated configuration
                expect(updatedConfig.slaMappings.P1.responseTime).toBe(customConfig.responseTime);
                expect(updatedConfig.slaMappings.P1.resolutionTime).toBe(customConfig.resolutionTime);
                expect(updatedConfig.slaMappings.P1.escalationTime).toBe(customConfig.escalationTime);
                
                // Should still work with SLA calculations
                const requirements = slaEngine.getSLARequirements('P1');
                expect(requirements.responseTime).toBe(customConfig.responseTime);
                expect(requirements.resolutionTime).toBe(customConfig.resolutionTime);
                expect(requirements.escalationTime).toBe(customConfig.escalationTime);
                
                // Other priorities should remain unchanged
                const p2Requirements = slaEngine.getSLARequirements('P2');
                expect(p2Requirements.responseTime).toBe(DEFAULT_SLA_MAPPINGS.P2.responseTime);
                
                return true;
            }
        ), { numRuns: 50 });
    });
});