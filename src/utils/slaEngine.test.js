/**
 * Unit Tests for SLA Engine
 * Tests priority-to-time mapping and SLA compliance tracking functionality
 */

import {
    SLAEngine,
    PRIORITY_LEVELS,
    SLA_COMPLIANCE_STATUS,
    DEFAULT_SLA_MAPPINGS,
    getSLARequirements,
    calculateSLADeadlines,
    checkSLACompliance,
    trackSLACompliance,
    getSLAConfiguration
} from './slaEngine.js';

describe('SLAEngine', () => {
    let slaEngine;

    beforeEach(() => {
        slaEngine = new SLAEngine();
    });

    describe('Priority Level Mapping', () => {
        test('should return correct SLA requirements for P1 (Critical)', () => {
            const requirements = slaEngine.getSLARequirements('P1');
            
            expect(requirements.priority).toBe('P1');
            expect(requirements.responseTime).toBe(1);
            expect(requirements.resolutionTime).toBe(4);
            expect(requirements.escalationTime).toBe(2);
            expect(requirements.label).toBe('Critical');
        });

        test('should return correct SLA requirements for P2 (High)', () => {
            const requirements = slaEngine.getSLARequirements('P2');
            
            expect(requirements.priority).toBe('P2');
            expect(requirements.responseTime).toBe(4);
            expect(requirements.resolutionTime).toBe(24);
            expect(requirements.escalationTime).toBe(8);
            expect(requirements.label).toBe('High');
        });

        test('should return correct SLA requirements for P3 (Medium)', () => {
            const requirements = slaEngine.getSLARequirements('P3');
            
            expect(requirements.priority).toBe('P3');
            expect(requirements.responseTime).toBe(8);
            expect(requirements.resolutionTime).toBe(72);
            expect(requirements.escalationTime).toBe(24);
            expect(requirements.label).toBe('Medium');
        });

        test('should return correct SLA requirements for P4 (Low)', () => {
            const requirements = slaEngine.getSLARequirements('P4');
            
            expect(requirements.priority).toBe('P4');
            expect(requirements.responseTime).toBe(24);
            expect(requirements.resolutionTime).toBe(168);
            expect(requirements.escalationTime).toBe(72);
            expect(requirements.label).toBe('Low');
        });

        test('should handle different priority formats', () => {
            expect(slaEngine.getSLARequirements('CRITICAL').priority).toBe('P1');
            expect(slaEngine.getSLARequirements('high').priority).toBe('P2');
            expect(slaEngine.getSLARequirements('1').priority).toBe('P1');
            expect(slaEngine.getSLARequirements('2').priority).toBe('P2');
        });

        test('should default to medium priority for unknown priority', () => {
            const requirements = slaEngine.getSLARequirements('UNKNOWN');
            
            expect(requirements.priority).toBe('UNKNOWN');
            expect(requirements.responseTime).toBe(8); // Medium priority values
            expect(requirements.error).toContain('Unknown priority level');
        });

        test('should default to medium priority for null/undefined priority', () => {
            const requirements = slaEngine.getSLARequirements(null);
            expect(requirements.priority).toBe('P3');
        });
    });

    describe('SLA Deadline Calculation', () => {
        test('should calculate correct deadlines for P1 priority', () => {
            const startTime = new Date('2024-01-01T09:00:00Z');
            const deadlines = slaEngine.calculateSLADeadlines('P1', startTime);
            
            expect(deadlines.priority).toBe('P1');
            expect(deadlines.startTime).toBe(startTime.toISOString());
            
            // Response deadline: 1 hour after start
            const expectedResponse = new Date(startTime);
            expectedResponse.setHours(expectedResponse.getHours() + 1);
            expect(deadlines.responseDeadline).toBe(expectedResponse.toISOString());
            
            // Resolution deadline: 4 hours after start
            const expectedResolution = new Date(startTime);
            expectedResolution.setHours(expectedResolution.getHours() + 4);
            expect(deadlines.resolutionDeadline).toBe(expectedResolution.toISOString());
            
            // Escalation deadline: 2 hours after start
            const expectedEscalation = new Date(startTime);
            expectedEscalation.setHours(expectedEscalation.getHours() + 2);
            expect(deadlines.escalationDeadline).toBe(expectedEscalation.toISOString());
        });

        test('should calculate correct deadlines for P4 priority', () => {
            const startTime = new Date('2024-01-01T09:00:00Z');
            const deadlines = slaEngine.calculateSLADeadlines('P4', startTime);
            
            expect(deadlines.priority).toBe('P4');
            
            // Response deadline: 24 hours after start
            const expectedResponse = new Date(startTime);
            expectedResponse.setHours(expectedResponse.getHours() + 24);
            expect(deadlines.responseDeadline).toBe(expectedResponse.toISOString());
            
            // Resolution deadline: 168 hours (7 days) after start
            const expectedResolution = new Date(startTime);
            expectedResolution.setHours(expectedResolution.getHours() + 168);
            expect(deadlines.resolutionDeadline).toBe(expectedResolution.toISOString());
        });

        test('should handle string start time input', () => {
            const startTimeString = '2024-01-01T09:00:00Z';
            const deadlines = slaEngine.calculateSLADeadlines('P2', startTimeString);
            
            expect(deadlines.startTime).toBe(startTimeString);
            expect(deadlines.priority).toBe('P2');
        });

        test('should handle invalid start time', () => {
            const deadlines = slaEngine.calculateSLADeadlines('P1', 'invalid-date');
            
            expect(deadlines.error).toContain('Invalid start time');
            expect(deadlines.priority).toBe('P1');
        });
    });

    describe('SLA Compliance Checking', () => {
        test('should return Within SLA for new task with time remaining', () => {
            const startTime = new Date('2024-01-01T09:00:00Z');
            const currentTime = new Date('2024-01-01T09:30:00Z'); // 30 minutes later
            
            const task = {
                id: 'task-1',
                priority: 'P1',
                startTime: startTime.toISOString(),
                status: 'in-progress'
            };
            
            const compliance = slaEngine.checkSLACompliance(task, currentTime);
            
            expect(compliance.status).toBe(SLA_COMPLIANCE_STATUS.WITHIN_SLA);
            expect(compliance.priority).toBe('P1');
            expect(compliance.deadlineType).toBe('response');
            expect(compliance.isBreached).toBe(false);
            expect(compliance.isAtRisk).toBe(false);
        });

        test('should return At Risk when approaching deadline', () => {
            const startTime = new Date('2024-01-01T09:00:00Z');
            const currentTime = new Date('2024-01-01T09:50:00Z'); // 50 minutes later (10 min remaining for P1)
            
            const task = {
                id: 'task-1',
                priority: 'P1',
                startTime: startTime.toISOString(),
                status: 'in-progress'
            };
            
            const compliance = slaEngine.checkSLACompliance(task, currentTime);
            
            expect(compliance.status).toBe(SLA_COMPLIANCE_STATUS.AT_RISK);
            expect(compliance.isAtRisk).toBe(true);
            expect(compliance.isBreached).toBe(false);
        });

        test('should return Breached when deadline is exceeded', () => {
            const startTime = new Date('2024-01-01T09:00:00Z');
            const currentTime = new Date('2024-01-01T11:00:00Z'); // 2 hours later (P1 response is 1 hour)
            
            const task = {
                id: 'task-1',
                priority: 'P1',
                startTime: startTime.toISOString(),
                status: 'in-progress'
            };
            
            const compliance = slaEngine.checkSLACompliance(task, currentTime);
            
            expect(compliance.status).toBe(SLA_COMPLIANCE_STATUS.BREACHED);
            expect(compliance.isBreached).toBe(true);
            expect(compliance.isAtRisk).toBe(false);
        });

        test('should check resolution deadline for completed tasks', () => {
            const startTime = new Date('2024-01-01T09:00:00Z');
            const currentTime = new Date('2024-01-01T12:00:00Z'); // 3 hours later
            
            const task = {
                id: 'task-1',
                priority: 'P1',
                startTime: startTime.toISOString(),
                status: 'completed'
            };
            
            const compliance = slaEngine.checkSLACompliance(task, currentTime);
            
            expect(compliance.deadlineType).toBe('resolution');
            expect(compliance.status).toBe(SLA_COMPLIANCE_STATUS.WITHIN_SLA); // P1 resolution is 4 hours
        });

        test('should handle task without start time', () => {
            const task = {
                id: 'task-1',
                priority: 'P1',
                status: 'in-progress'
            };
            
            const compliance = slaEngine.checkSLACompliance(task);
            
            expect(compliance.status).toBe(SLA_COMPLIANCE_STATUS.WITHIN_SLA);
            expect(compliance.error).toContain('No start time available');
        });

        test('should calculate time remaining correctly', () => {
            const startTime = new Date('2024-01-01T09:00:00Z');
            const currentTime = new Date('2024-01-01T09:30:00Z'); // 30 minutes later
            
            const task = {
                id: 'task-1',
                priority: 'P1',
                startTime: startTime.toISOString(),
                status: 'in-progress'
            };
            
            const compliance = slaEngine.checkSLACompliance(task, currentTime);
            
            expect(compliance.timeRemaining.totalMinutes).toBe(30);
            expect(compliance.timeRemaining.humanReadable).toBe('30m');
            expect(compliance.timeRemaining.isOverdue).toBe(false);
        });

        test('should calculate overdue time correctly', () => {
            const startTime = new Date('2024-01-01T09:00:00Z');
            const currentTime = new Date('2024-01-01T11:30:00Z'); // 2.5 hours later (P1 response is 1 hour)
            
            const task = {
                id: 'task-1',
                priority: 'P1',
                startTime: startTime.toISOString(),
                status: 'in-progress'
            };
            
            const compliance = slaEngine.checkSLACompliance(task, currentTime);
            
            expect(compliance.timeRemaining.isOverdue).toBe(true);
            expect(compliance.timeRemaining.overdueHours).toBe(1.5);
            expect(compliance.timeRemaining.humanReadable).toBe('Overdue');
        });
    });

    describe('SLA Compliance Tracking', () => {
        test('should track compliance for multiple tasks', () => {
            const currentTime = new Date('2024-01-01T10:00:00Z');
            
            const tasks = [
                {
                    id: 'task-1',
                    taskName: 'Critical Issue',
                    priority: 'P1',
                    startTime: new Date('2024-01-01T09:30:00Z').toISOString(), // 30 min ago - within SLA
                    status: 'in-progress'
                },
                {
                    id: 'task-2',
                    taskName: 'High Priority Bug',
                    priority: 'P2',
                    startTime: new Date('2024-01-01T08:00:00Z').toISOString(), // 2 hours ago - within SLA
                    status: 'in-progress'
                },
                {
                    id: 'task-3',
                    taskName: 'Overdue Task',
                    priority: 'P1',
                    startTime: new Date('2024-01-01T08:00:00Z').toISOString(), // 2 hours ago - breached
                    status: 'in-progress'
                }
            ];
            
            const tracking = slaEngine.trackSLACompliance(tasks, currentTime);
            
            expect(tracking.summary.totalTasks).toBe(3);
            expect(tracking.summary.breachedTasks).toBe(1);
            expect(tracking.summary.withinSLATasks).toBe(2);
            expect(tracking.summary.complianceRate).toBe(67); // 2/3 * 100 = 66.67 rounded to 67
            
            expect(tracking.byPriority.P1.total).toBe(2);
            expect(tracking.byPriority.P1.breached).toBe(1);
            expect(tracking.byPriority.P2.total).toBe(1);
            expect(tracking.byPriority.P2.breached).toBe(0);
            
            expect(tracking.tasks).toHaveLength(3);
            expect(tracking.tasks[0].taskId).toBe('task-1');
            expect(tracking.tasks[2].isBreached).toBe(true);
        });

        test('should handle empty task list', () => {
            const tracking = slaEngine.trackSLACompliance([]);
            
            expect(tracking.summary.totalTasks).toBe(0);
            expect(tracking.summary.complianceRate).toBe(100);
            expect(tracking.tasks).toHaveLength(0);
        });

        test('should group tasks by priority correctly', () => {
            const tasks = [
                { id: '1', priority: 'P1', startTime: new Date().toISOString() },
                { id: '2', priority: 'P1', startTime: new Date().toISOString() },
                { id: '3', priority: 'P2', startTime: new Date().toISOString() },
                { id: '4', priority: 'P3', startTime: new Date().toISOString() }
            ];
            
            const tracking = slaEngine.trackSLACompliance(tasks);
            
            expect(tracking.byPriority.P1.total).toBe(2);
            expect(tracking.byPriority.P2.total).toBe(1);
            expect(tracking.byPriority.P3.total).toBe(1);
            expect(tracking.byPriority.P4.total).toBe(0);
        });
    });

    describe('SLA Configuration', () => {
        test('should return complete SLA configuration', () => {
            const config = slaEngine.getSLAConfiguration();
            
            expect(config.priorityLevels).toEqual(['P1', 'P2', 'P3', 'P4']);
            expect(config.slaMappings).toEqual(DEFAULT_SLA_MAPPINGS);
            expect(config.businessHoursOnly).toBe(false);
            expect(config.timezone).toBe('Asia/Jakarta');
        });

        test('should allow updating SLA mappings', () => {
            const newMappings = {
                P1: {
                    responseTime: 0.5, // 30 minutes
                    resolutionTime: 2,
                    escalationTime: 1,
                    label: 'Ultra Critical',
                    description: 'Emergency response required'
                }
            };
            
            const updatedConfig = slaEngine.updateSLAMappings(newMappings);
            
            expect(updatedConfig.slaMappings.P1.responseTime).toBe(0.5);
            expect(updatedConfig.slaMappings.P1.label).toBe('Ultra Critical');
            expect(updatedConfig.slaMappings.P2).toEqual(DEFAULT_SLA_MAPPINGS.P2); // Should remain unchanged
        });
    });

    describe('Business Hours Calculation', () => {
        test('should calculate deadlines considering business hours when enabled', () => {
            const businessHoursSLA = new SLAEngine({
                businessHoursOnly: true,
                businessHours: { start: 9, end: 17 },
                workingDays: [1, 2, 3, 4, 5] // Monday to Friday
            });
            
            // Start at 4 PM on Friday (end of business day)
            const startTime = new Date('2024-01-05T16:00:00Z'); // Friday 4 PM
            const deadlines = businessHoursSLA.calculateSLADeadlines('P1', startTime);
            
            // Should extend into next business day (Monday)
            const responseDeadline = new Date(deadlines.responseDeadline);
            expect(responseDeadline.getDay()).toBe(1); // Monday
        });

        test('should calculate simple calendar time when business hours disabled', () => {
            const startTime = new Date('2024-01-05T16:00:00Z'); // Friday 4 PM
            const deadlines = slaEngine.calculateSLADeadlines('P1', startTime);
            
            // Should be exactly 1 hour later (5 PM Friday)
            const expectedDeadline = new Date(startTime);
            expectedDeadline.setHours(expectedDeadline.getHours() + 1);
            expect(deadlines.responseDeadline).toBe(expectedDeadline.toISOString());
        });
    });

    describe('Edge Cases', () => {
        test('should handle tasks with different time field names', () => {
            const task = {
                id: 'task-1',
                priority: 'P1',
                createdAt: new Date('2024-01-01T09:00:00Z').toISOString(),
                status: 'in-progress'
            };
            
            const compliance = slaEngine.checkSLACompliance(task);
            expect(compliance.status).toBeDefined();
            expect(compliance.priority).toBe('P1');
        });

        test('should handle tasks with plan.taskStart time field', () => {
            const task = {
                id: 'task-1',
                priority: 'P2',
                plan: {
                    taskStart: new Date('2024-01-01T09:00:00Z').toISOString()
                },
                status: 'in-progress'
            };
            
            const compliance = slaEngine.checkSLACompliance(task);
            expect(compliance.status).toBeDefined();
            expect(compliance.priority).toBe('P2');
        });

        test('should handle tasks with taskName "Completed"', () => {
            const task = {
                id: 'task-1',
                priority: 'P1',
                taskName: 'Completed',
                startTime: new Date('2024-01-01T09:00:00Z').toISOString()
            };
            
            const compliance = slaEngine.checkSLACompliance(task);
            expect(compliance.deadlineType).toBe('resolution');
        });
    });
});

describe('Convenience Functions', () => {
    test('getSLARequirements should work with default engine', () => {
        const requirements = getSLARequirements('P1');
        expect(requirements.priority).toBe('P1');
        expect(requirements.responseTime).toBe(1);
    });

    test('calculateSLADeadlines should work with default engine', () => {
        const startTime = new Date('2024-01-01T09:00:00Z');
        const deadlines = calculateSLADeadlines('P2', startTime);
        expect(deadlines.priority).toBe('P2');
        expect(deadlines.startTime).toBe(startTime.toISOString());
    });

    test('checkSLACompliance should work with default engine', () => {
        const task = {
            id: 'task-1',
            priority: 'P1',
            startTime: new Date().toISOString()
        };
        const compliance = checkSLACompliance(task);
        expect(compliance.priority).toBe('P1');
    });

    test('trackSLACompliance should work with default engine', () => {
        const tasks = [
            { id: 'task-1', priority: 'P1', startTime: new Date().toISOString() }
        ];
        const tracking = trackSLACompliance(tasks);
        expect(tracking.summary.totalTasks).toBe(1);
    });

    test('getSLAConfiguration should work with default engine', () => {
        const config = getSLAConfiguration();
        expect(config.priorityLevels).toEqual(['P1', 'P2', 'P3', 'P4']);
    });
});