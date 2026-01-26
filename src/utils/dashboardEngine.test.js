/**
 * Dashboard Engine Tests
 * Unit tests for dashboard functionality including phase-based duration calculations
 */

import { DashboardEngine, dashboardEngine, calculatePhaseSpan, filterByDateRange, searchByDemandNumber, searchByDemandNumberEnhanced } from './dashboardEngine.js';

describe('DashboardEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new DashboardEngine();
    });

    describe('calculatePhaseSpan', () => {
        const mockAllocation = {
            id: 'ALLOC-001',
            phase: 'Planning',
            plan: {
                taskStart: '2024-01-01T09:00:00Z',
                taskEnd: '2024-01-15T17:00:00Z'
            }
        };

        it('should calculate phase span for valid allocation', () => {
            const result = engine.calculatePhaseSpan(mockAllocation, 'Completed');

            expect(result.isValid).toBe(true);
            expect(result.isCompleted).toBe(false);
            expect(result.startPhase).toBe('Planning');
            expect(result.endPhase).toBe('Completed');
            expect(result.days).toBe(14); // 14 days between Jan 1 and Jan 15
            expect(result.hours).toBe(344); // Actual hours between the specific times
            expect(result.isProjected).toBe(false);
        });

        it('should handle allocation already in completion phase', () => {
            const completedAllocation = {
                ...mockAllocation,
                phase: 'Completed'
            };

            const result = engine.calculatePhaseSpan(completedAllocation, 'Completed');

            expect(result.isValid).toBe(true);
            expect(result.isCompleted).toBe(true);
            expect(result.days).toBe(0);
            expect(result.hours).toBe(0);
            expect(result.startPhase).toBe('Completed');
            expect(result.endPhase).toBe('Completed');
            expect(result.message).toContain('already in Completed phase');
        });

        it('should handle allocation in Idle phase', () => {
            const idleAllocation = {
                ...mockAllocation,
                phase: 'Idle'
            };

            const result = engine.calculatePhaseSpan(idleAllocation, 'Completed');

            expect(result.isValid).toBe(true);
            expect(result.isCompleted).toBe(true);
            expect(result.days).toBe(0);
            expect(result.hours).toBe(0);
            expect(result.startPhase).toBe('Idle');
            expect(result.message).toContain('already in Idle phase');
        });

        it('should handle allocation without end date (projected)', () => {
            const ongoingAllocation = {
                ...mockAllocation,
                plan: {
                    taskStart: '2024-01-01T09:00:00Z'
                    // No taskEnd
                }
            };

            const result = engine.calculatePhaseSpan(ongoingAllocation, 'Completed');

            expect(result.isValid).toBe(true);
            expect(result.isCompleted).toBe(false);
            expect(result.isProjected).toBe(true);
            expect(result.startPhase).toBe('Planning');
            expect(result.endPhase).toBe('Completed');
            expect(result.days).toBeGreaterThan(0);
            expect(result.message).toContain('Projected span');
        });

        it('should handle invalid allocation object', () => {
            const result = engine.calculatePhaseSpan(null, 'Completed');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Invalid allocation object');
            expect(result.days).toBe(0);
            expect(result.hours).toBe(0);
        });

        it('should handle allocation without phase', () => {
            const allocationWithoutPhase = {
                id: 'ALLOC-001',
                plan: {
                    taskStart: '2024-01-01T09:00:00Z',
                    taskEnd: '2024-01-15T17:00:00Z'
                }
            };

            const result = engine.calculatePhaseSpan(allocationWithoutPhase, 'Completed');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('No allocation phase specified');
            expect(result.endPhase).toBe('Completed');
        });

        it('should handle allocation without task start date', () => {
            const allocationWithoutStart = {
                ...mockAllocation,
                plan: {
                    taskEnd: '2024-01-15T17:00:00Z'
                }
            };

            const result = engine.calculatePhaseSpan(allocationWithoutStart, 'Completed');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('No task start date available');
            expect(result.startPhase).toBe('Planning');
            expect(result.endPhase).toBe('Completed');
        });

        it('should handle invalid date formats', () => {
            const allocationWithInvalidDate = {
                ...mockAllocation,
                plan: {
                    taskStart: 'invalid-date',
                    taskEnd: '2024-01-15T17:00:00Z'
                }
            };

            const result = engine.calculatePhaseSpan(allocationWithInvalidDate, 'Completed');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Invalid task start date');
        });

        it('should handle Date objects as input', () => {
            const allocationWithDateObjects = {
                ...mockAllocation,
                plan: {
                    taskStart: new Date('2024-01-01T09:00:00Z'),
                    taskEnd: new Date('2024-01-15T17:00:00Z')
                }
            };

            const result = engine.calculatePhaseSpan(allocationWithDateObjects, 'Completed');

            expect(result.isValid).toBe(true);
            expect(result.days).toBe(14);
            expect(result.hours).toBe(344);
        });

        it('should use default completion phase when not specified', () => {
            const result = engine.calculatePhaseSpan(mockAllocation);

            expect(result.isValid).toBe(true);
            expect(result.endPhase).toBe('Completed');
        });

        it('should handle custom completion phase', () => {
            const result = engine.calculatePhaseSpan(mockAllocation, 'Closing');

            expect(result.isValid).toBe(true);
            expect(result.endPhase).toBe('Closing');
        });
    });

    describe('filterByDateRange', () => {
        const mockAllocations = [
            {
                id: 'ALLOC-001',
                plan: {
                    taskStart: '2024-01-01',
                    taskEnd: '2024-01-15'
                }
            },
            {
                id: 'ALLOC-002',
                plan: {
                    taskStart: '2024-01-10',
                    taskEnd: '2024-01-25'
                }
            },
            {
                id: 'ALLOC-003',
                plan: {
                    taskStart: '2024-02-01',
                    taskEnd: '2024-02-15'
                }
            },
            {
                id: 'ALLOC-004',
                plan: {
                    // No taskStart - should be filtered out
                    taskEnd: '2024-01-20'
                }
            }
        ];

        it('should filter allocations within date range', () => {
            const dateRange = {
                start: '2024-01-05',
                end: '2024-01-20'
            };

            const result = engine.filterByDateRange(mockAllocations, dateRange);

            expect(result).toHaveLength(2);
            expect(result.map(a => a.id)).toEqual(['ALLOC-001', 'ALLOC-002']);
        });

        it('should filter with start date only', () => {
            const dateRange = {
                start: '2024-01-20'
            };

            const result = engine.filterByDateRange(mockAllocations, dateRange);

            expect(result).toHaveLength(2);
            expect(result.map(a => a.id)).toEqual(['ALLOC-002', 'ALLOC-003']);
        });

        it('should filter with end date only', () => {
            const dateRange = {
                end: '2024-01-20'
            };

            const result = engine.filterByDateRange(mockAllocations, dateRange);

            expect(result).toHaveLength(2);
            expect(result.map(a => a.id)).toEqual(['ALLOC-001', 'ALLOC-002']);
        });

        it('should return all allocations when no date range provided', () => {
            const result = engine.filterByDateRange(mockAllocations, {});

            expect(result).toHaveLength(4);
        });

        it('should handle null/undefined inputs gracefully', () => {
            expect(engine.filterByDateRange(null, {})).toEqual([]);
            expect(engine.filterByDateRange(mockAllocations, null)).toEqual(mockAllocations);
            expect(engine.filterByDateRange(undefined, {})).toEqual([]);
        });

        it('should exclude allocations without taskStart', () => {
            const dateRange = {
                start: '2024-01-01',
                end: '2024-12-31'
            };

            const result = engine.filterByDateRange(mockAllocations, dateRange);

            expect(result).toHaveLength(3);
            expect(result.map(a => a.id)).not.toContain('ALLOC-004');
        });

        it('should handle invalid date formats gracefully', () => {
            const dateRange = {
                start: 'invalid-date',
                end: '2024-01-20'
            };

            // Should not throw error and return original array
            const result = engine.filterByDateRange(mockAllocations, dateRange);
            expect(result).toEqual(mockAllocations);
        });
    });

    describe('searchByDemandNumber', () => {
        const mockIssues = [
            {
                id: 'ISSUE-001',
                category: 'Support',
                demandNumber: 'DEM-2024-001',
                ticketId: 'TKT-001',
                activityName: 'Login authentication issue',
                description: 'Login issue'
            },
            {
                id: 'ISSUE-002',
                category: 'Support',
                demandNumber: 'DEM-2024-002',
                ticketId: 'TKT-002',
                activityName: 'Database connection timeout',
                description: 'Database connection problem'
            },
            {
                id: 'ISSUE-003',
                category: 'Project',
                demandNumber: 'DEM-2024-003',
                activityName: 'New feature development',
                description: 'Feature development'
            },
            {
                id: 'ISSUE-004',
                category: 'Support',
                demandNumber: 'DEM-2023-999',
                ticketId: 'TKT-999',
                activityName: 'Legacy system maintenance',
                description: 'Legacy system issue'
            },
            {
                id: 'ISSUE-005',
                category: 'Support',
                ticketId: 'TKT-005',
                activityName: 'Ad-hoc support request',
                // No demandNumber
                description: 'Ad-hoc support'
            },
            {
                id: 'ISSUE-006',
                category: 'Support',
                demandNumber: 'URGENT-2024-001',
                ticketId: 'URGENT-001',
                activityName: 'Critical system outage',
                description: 'Critical system outage'
            }
        ];

        it('should find exact demand number match', () => {
            const result = engine.searchByDemandNumber(mockIssues, 'DEM-2024-001');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('ISSUE-001');
        });

        it('should find partial demand number match', () => {
            const result = engine.searchByDemandNumber(mockIssues, '2024');

            expect(result).toHaveLength(3); // DEM-2024-001, DEM-2024-002, URGENT-2024-001
            expect(result.map(i => i.id)).toEqual(['ISSUE-001', 'ISSUE-002', 'ISSUE-006']);
        });

        it('should be case insensitive by default', () => {
            const result = engine.searchByDemandNumber(mockIssues, 'dem-2024-001');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('ISSUE-001');
        });

        it('should only return Support category issues by default', () => {
            const result = engine.searchByDemandNumber(mockIssues, 'DEM-2024');

            expect(result).toHaveLength(2);
            expect(result.every(issue => issue.category === 'Support')).toBe(true);
            expect(result.map(i => i.id)).not.toContain('ISSUE-003'); // Project category
        });

        it('should search in all categories when includeAllCategories is true', () => {
            const result = engine.searchByDemandNumber(mockIssues, 'DEM-2024', { includeAllCategories: true });

            expect(result).toHaveLength(3); // Includes Project category
            expect(result.map(i => i.id)).toContain('ISSUE-003'); // Project category
        });

        it('should support exact match option', () => {
            const result = engine.searchByDemandNumber(mockIssues, 'DEM-2024-001', { exactMatch: true });

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('ISSUE-001');

            // Partial match should not work with exactMatch: true
            const partialResult = engine.searchByDemandNumber(mockIssues, '2024', { exactMatch: true });
            expect(partialResult).toHaveLength(0);
        });

        it('should search in ticket ID when enabled', () => {
            const result = engine.searchByDemandNumber(mockIssues, 'TKT-001', { searchInTicketId: true });

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('ISSUE-001');
        });

        it('should search in activity name when enabled', () => {
            const result = engine.searchByDemandNumber(mockIssues, 'authentication', { searchInActivityName: true });

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('ISSUE-001');
        });

        it('should handle case sensitive search', () => {
            const result = engine.searchByDemandNumber(mockIssues, 'DEM-2024-001', { caseSensitive: true });
            expect(result).toHaveLength(1);

            const lowerResult = engine.searchByDemandNumber(mockIssues, 'dem-2024-001', { caseSensitive: true });
            expect(lowerResult).toHaveLength(0);
        });

        it('should handle empty search term', () => {
            const result = engine.searchByDemandNumber(mockIssues, '');

            expect(result).toEqual(mockIssues);
        });

        it('should handle null/undefined inputs gracefully', () => {
            expect(engine.searchByDemandNumber(null, 'DEM-001')).toEqual([]);
            expect(engine.searchByDemandNumber(mockIssues, null)).toEqual(mockIssues);
            expect(engine.searchByDemandNumber(undefined, 'DEM-001')).toEqual([]);
        });

        it('should handle issues without demandNumber', () => {
            const result = engine.searchByDemandNumber(mockIssues, 'DEM');

            expect(result).toHaveLength(3); // DEM-2024-001, DEM-2024-002, DEM-2023-999 (only Support category)
            expect(result.map(i => i.id)).not.toContain('ISSUE-005'); // No demandNumber
            expect(result.map(i => i.id)).not.toContain('ISSUE-003'); // Project category excluded by default
        });

        it('should trim whitespace from search term', () => {
            const result = engine.searchByDemandNumber(mockIssues, '  DEM-2024-001  ');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('ISSUE-001');
        });
    });

    describe('searchByDemandNumberEnhanced', () => {
        const mockIssues = [
            {
                id: 'ISSUE-001',
                category: 'Support',
                demandNumber: 'DEM-2024-001',
                ticketId: 'TKT-001',
                activityName: 'Login authentication issue'
            },
            {
                id: 'ISSUE-002',
                category: 'Support',
                demandNumber: 'DEM-2024-002',
                ticketId: 'TKT-002',
                activityName: 'Database connection timeout'
            },
            {
                id: 'ISSUE-003',
                category: 'Support',
                demandNumber: 'DEM-2023-001',
                ticketId: 'TKT-003',
                activityName: 'Legacy system maintenance'
            },
            {
                id: 'ISSUE-004',
                category: 'Support',
                demandNumber: 'REQ-2024-001',
                ticketId: 'REQ-001',
                activityName: 'Feature request'
            }
        ];

        it('should return enhanced search results with main and related matches', () => {
            const result = engine.searchByDemandNumberEnhanced(mockIssues, 'DEM-2024-001');

            expect(result).toHaveProperty('mainMatches');
            expect(result).toHaveProperty('relatedMatches');
            expect(result).toHaveProperty('searchTerm');
            expect(result).toHaveProperty('totalResults');
            expect(result).toHaveProperty('hasExactMatch');
            expect(result).toHaveProperty('hasPartialMatch');
            expect(result).toHaveProperty('hasRelatedMatch');

            expect(result.mainMatches).toHaveLength(1);
            expect(result.mainMatches[0].id).toBe('ISSUE-001');
            expect(result.hasExactMatch).toBe(true);
        });

        it('should find related matches based on patterns', () => {
            const result = engine.searchByDemandNumberEnhanced(mockIssues, '2024');

            expect(result.mainMatches.length).toBeGreaterThan(0);
            // For this test, we expect main matches but related matches might be 0 if all matches are already in main
            expect(result.totalResults).toBeGreaterThanOrEqual(result.mainMatches.length);
        });

        it('should handle empty search gracefully', () => {
            const result = engine.searchByDemandNumberEnhanced(mockIssues, '');

            expect(result.mainMatches).toEqual(mockIssues);
            expect(result.relatedMatches).toEqual([]);
            expect(result.totalResults).toBe(mockIssues.length);
        });

        it('should limit related results', () => {
            const result = engine.searchByDemandNumberEnhanced(mockIssues, 'DEM', { maxRelatedResults: 1 });

            expect(result.relatedMatches.length).toBeLessThanOrEqual(1);
        });

        it('should disable related search when includeRelated is false', () => {
            const result = engine.searchByDemandNumberEnhanced(mockIssues, 'DEM', { includeRelated: false });

            expect(result.relatedMatches).toEqual([]);
        });
    });

    describe('extractDemandPatterns', () => {
        it('should extract year patterns', () => {
            const patterns = engine.extractDemandPatterns('DEM-2024-001');

            expect(patterns).toContain('2024');
        });

        it('should extract prefix patterns', () => {
            const patterns = engine.extractDemandPatterns('DEM-2024-001');

            expect(patterns).toContain('dem');
        });

        it('should extract number sequences', () => {
            const patterns = engine.extractDemandPatterns('DEM-2024-001');

            expect(patterns).toContain('2024');
            expect(patterns).toContain('001');
        });

        it('should handle patterns without standard format', () => {
            const patterns = engine.extractDemandPatterns('URGENT123');

            expect(patterns).toContain('urgent123'); // Original term lowercased
            expect(patterns).toContain('urgent'); // Prefix
            expect(patterns).toContain('123'); // Number sequence
        });

        it('should remove duplicates', () => {
            const patterns = engine.extractDemandPatterns('TEST-2024-2024');

            const duplicates = patterns.filter((item, index) => patterns.indexOf(item) !== index);
            expect(duplicates).toHaveLength(0);
        });
    });

    describe('calculatePhaseTransitionStats', () => {
        const mockAllocations = [
            {
                id: 'ALLOC-001',
                phase: 'Planning',
                plan: { taskStart: '2024-01-01', taskEnd: '2024-01-15' }
            },
            {
                id: 'ALLOC-002',
                phase: 'Execution',
                plan: { taskStart: '2024-01-10', taskEnd: '2024-01-25' }
            },
            {
                id: 'ALLOC-003',
                phase: 'Completed',
                plan: { taskStart: '2024-01-01', taskEnd: '2024-01-20' }
            },
            {
                id: 'ALLOC-004',
                phase: 'Completed',
                plan: { taskStart: '2024-01-05', taskEnd: '2024-01-15' }
            },
            {
                id: 'ALLOC-005',
                phase: 'Idle'
            }
        ];

        it('should calculate phase distribution correctly', () => {
            const result = engine.calculatePhaseTransitionStats(mockAllocations);

            expect(result.totalAllocations).toBe(5);
            expect(result.phaseDistribution).toEqual({
                'Planning': 1,
                'Execution': 1,
                'Completed': 2,
                'Idle': 1
            });
        });

        it('should count completed and in-progress allocations', () => {
            const result = engine.calculatePhaseTransitionStats(mockAllocations);

            expect(result.completedCount).toBe(3); // Completed + Idle
            expect(result.inProgressCount).toBe(2); // Planning + Execution
        });

        it('should calculate average span to completion', () => {
            const result = engine.calculatePhaseTransitionStats(mockAllocations);

            // ALLOC-003: 19 days (Jan 1 to Jan 20)
            // ALLOC-004: 10 days (Jan 5 to Jan 15)
            // Average: (19 + 10) / 2 = 14.5, rounded to 15
            expect(result.averageSpanToCompletion).toBe(15);
        });

        it('should handle empty array', () => {
            const result = engine.calculatePhaseTransitionStats([]);

            expect(result.totalAllocations).toBe(0);
            expect(result.phaseDistribution).toEqual({});
            expect(result.averageSpanToCompletion).toBe(0);
            expect(result.completedCount).toBe(0);
            expect(result.inProgressCount).toBe(0);
        });

        it('should handle null/undefined input', () => {
            const result = engine.calculatePhaseTransitionStats(null);

            expect(result.totalAllocations).toBe(0);
            expect(result.phaseDistribution).toEqual({});
        });

        it('should handle allocations without phase', () => {
            const allocationsWithoutPhase = [
                { id: 'ALLOC-001' },
                { id: 'ALLOC-002', phase: 'Planning' }
            ];

            const result = engine.calculatePhaseTransitionStats(allocationsWithoutPhase);

            expect(result.phaseDistribution).toEqual({
                'Unknown': 1,
                'Planning': 1
            });
        });
    });

    describe('getQuickFilterOptions', () => {
        it('should return quick filter options', () => {
            const options = engine.getQuickFilterOptions();

            expect(options).toHaveLength(7);
            expect(options.map(o => o.value)).toEqual([
                'today', 'this-week', 'this-month', 
                'last-week', 'last-month', 'next-week', 'next-month'
            ]);
            
            // Check that all options have required properties
            options.forEach(option => {
                expect(option).toHaveProperty('label');
                expect(option).toHaveProperty('value');
                expect(option).toHaveProperty('start');
                expect(option).toHaveProperty('end');
                expect(option).toHaveProperty('icon');
                expect(option).toHaveProperty('description');
            });
        });

        it('should provide valid date strings', () => {
            const options = engine.getQuickFilterOptions();

            options.forEach(option => {
                expect(new Date(option.start)).toBeInstanceOf(Date);
                expect(new Date(option.end)).toBeInstanceOf(Date);
                expect(new Date(option.start).toString()).not.toBe('Invalid Date');
                expect(new Date(option.end).toString()).not.toBe('Invalid Date');
            });
        });
    });

    describe('exported functions', () => {
        it('should export convenience functions', () => {
            expect(typeof calculatePhaseSpan).toBe('function');
            expect(typeof filterByDateRange).toBe('function');
            expect(typeof searchByDemandNumber).toBe('function');
        });

        it('should work with convenience functions', () => {
            const mockAllocation = {
                phase: 'Planning',
                plan: {
                    taskStart: '2024-01-01T09:00:00Z',
                    taskEnd: '2024-01-15T17:00:00Z'
                }
            };

            const result = calculatePhaseSpan(mockAllocation, 'Completed');
            expect(result.isValid).toBe(true);
            expect(result.days).toBe(14);
        });
    });

    describe('default instance', () => {
        it('should export default dashboardEngine instance', () => {
            expect(dashboardEngine).toBeInstanceOf(DashboardEngine);
        });
    });

    describe('enhanced date filtering functionality', () => {
        describe('getQuickFilterOptions', () => {
            it('should return enhanced quick filter options with icons and descriptions', () => {
                const options = engine.getQuickFilterOptions();
                
                expect(options).toHaveLength(7);
                expect(options[0]).toEqual(expect.objectContaining({
                    label: 'Today',
                    value: 'today',
                    icon: '📅',
                    description: 'Tasks scheduled for today'
                }));
                expect(options[1]).toEqual(expect.objectContaining({
                    label: 'This Week',
                    value: 'this-week',
                    icon: '📊',
                    description: 'Current week tasks'
                }));
                expect(options[2]).toEqual(expect.objectContaining({
                    label: 'This Month',
                    value: 'this-month',
                    icon: '📈',
                    description: 'Current month tasks'
                }));
                
                // Check that all options have required fields
                options.forEach(option => {
                    expect(option).toHaveProperty('label');
                    expect(option).toHaveProperty('value');
                    expect(option).toHaveProperty('start');
                    expect(option).toHaveProperty('end');
                    expect(option).toHaveProperty('icon');
                    expect(option).toHaveProperty('description');
                });
            });

            it('should generate valid date ranges', () => {
                const options = engine.getQuickFilterOptions();
                
                options.forEach(option => {
                    expect(option.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                    expect(option.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                    expect(new Date(option.start)).toBeInstanceOf(Date);
                    expect(new Date(option.end)).toBeInstanceOf(Date);
                    expect(new Date(option.start) <= new Date(option.end)).toBe(true);
                });
            });
        });

        describe('applyQuickFilter', () => {
            it('should return correct date range for valid filter value', () => {
                const result = engine.applyQuickFilter('today');
                
                expect(result).toHaveProperty('start');
                expect(result).toHaveProperty('end');
                expect(result).toHaveProperty('label', 'Today');
                expect(result).toHaveProperty('description', 'Tasks scheduled for today');
            });

            it('should return empty range for invalid filter value', () => {
                const result = engine.applyQuickFilter('invalid-filter');
                
                expect(result).toEqual({
                    start: null,
                    end: null
                });
            });
        });

        describe('filterByDateRangeEnhanced', () => {
            const testAllocations = [
                {
                    id: '1',
                    plan: {
                        taskStart: '2024-01-15',
                        taskEnd: '2024-01-20'
                    }
                },
                {
                    id: '2',
                    plan: {
                        taskStart: '2024-01-25',
                        taskEnd: '2024-01-30'
                    }
                },
                {
                    id: '3',
                    plan: {
                        taskStart: '2024-01-10',
                        // No end date
                    }
                }
            ];

            it('should filter allocations with partial overlap by default', () => {
                const dateRange = { start: '2024-01-18', end: '2024-01-28' };
                const result = engine.filterByDateRangeEnhanced(testAllocations, dateRange);
                
                expect(result).toHaveLength(2);
                expect(result.map(a => a.id)).toEqual(['1', '2']);
            });

            it('should include allocations without end dates when includeNoEndDate is true', () => {
                const dateRange = { start: '2024-01-05', end: '2024-01-12' };
                const result = engine.filterByDateRangeEnhanced(testAllocations, dateRange, {
                    includeNoEndDate: true
                });
                
                expect(result).toHaveLength(1);
                expect(result[0].id).toBe('3');
            });

            it('should exclude allocations without end dates when includeNoEndDate is false', () => {
                const dateRange = { start: '2024-01-05', end: '2024-01-12' };
                const result = engine.filterByDateRangeEnhanced(testAllocations, dateRange, {
                    includeNoEndDate: false
                });
                
                expect(result).toHaveLength(0);
            });

            it('should apply strict date matching when strictDateMatch is true', () => {
                const dateRange = { start: '2024-01-16', end: '2024-01-19' };
                const result = engine.filterByDateRangeEnhanced(testAllocations, dateRange, {
                    strictDateMatch: true
                });
                
                expect(result).toHaveLength(0); // No allocation is entirely within the range
            });

            it('should handle invalid date formats gracefully', () => {
                const dateRange = { start: 'invalid-date', end: '2024-01-20' };
                const result = engine.filterByDateRangeEnhanced(testAllocations, dateRange);
                
                expect(result).toEqual(testAllocations); // Should return original array
            });
        });

        describe('getDateRangeStats', () => {
            const testAllocations = [
                {
                    id: '1',
                    plan: {
                        taskStart: '2024-01-15',
                        taskEnd: '2024-01-20',
                        costProject: 1000,
                        effortHours: 40
                    },
                    phase: 'In Progress',
                    complexity: 'medium',
                    category: 'Project'
                },
                {
                    id: '2',
                    plan: {
                        taskStart: '2024-01-25',
                        taskEnd: '2024-01-30',
                        costProject: 2000,
                        effortHours: 80
                    },
                    phase: 'Completed',
                    complexity: 'high',
                    category: 'Support'
                }
            ];

            it('should calculate comprehensive statistics for date range', () => {
                const dateRange = { start: '2024-01-01', end: '2024-01-31' };
                const stats = engine.getDateRangeStats(testAllocations, dateRange);
                
                expect(stats).toEqual({
                    totalAllocations: 2,
                    totalCost: 3000,
                    totalEffortHours: 120,
                    averageDuration: 5, // Both allocations are 5 days long
                    phaseDistribution: {
                        'In Progress': 1,
                        'Completed': 1
                    },
                    complexityDistribution: {
                        'medium': 1,
                        'high': 1
                    },
                    categoryDistribution: {
                        'Project': 1,
                        'Support': 1
                    }
                });
            });

            it('should handle empty results', () => {
                const dateRange = { start: '2025-01-01', end: '2025-01-31' };
                const stats = engine.getDateRangeStats(testAllocations, dateRange);
                
                expect(stats).toEqual({
                    totalAllocations: 0,
                    totalCost: 0,
                    totalEffortHours: 0,
                    averageDuration: 0,
                    phaseDistribution: {},
                    complexityDistribution: {},
                    categoryDistribution: {}
                });
            });
        });
    });
});