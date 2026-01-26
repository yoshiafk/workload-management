/**
 * Dashboard Engine Property-Based Tests
 * Property tests for phase-based duration calculations and dashboard functionality
 */

import fc from 'fast-check';
import { DashboardEngine } from './dashboardEngine.js';

describe('DashboardEngine Property Tests', () => {
    let engine;

    beforeEach(() => {
        engine = new DashboardEngine();
    });

    /**
     * Property 21: Dashboard Date Filter Functionality
     * For any date range selection on the dashboard, the filtering should accurately 
     * display allocations within the specified period and provide intuitive date picker modal functionality.
     * Validates: User Requirement - Update Date Filter Function on Dashboard View
     */
    describe('Property 21: Dashboard Date Filter Functionality', () => {
        it('should accurately filter allocations within any valid date range', () => {
            fc.assert(fc.property(
                // Generate test allocations with safe date strings
                fc.array(fc.record({
                    id: fc.string({ minLength: 1, maxLength: 10 }),
                    plan: fc.record({
                        taskStart: fc.constantFrom('2020-01-01', '2021-06-15', '2022-03-10', '2023-09-20', '2024-01-01', '2024-06-15', '2024-12-31'),
                        taskEnd: fc.option(fc.constantFrom('2020-12-31', '2021-12-31', '2022-12-31', '2023-12-31', '2024-12-31', '2025-12-31'))
                    })
                }), { minLength: 0, maxLength: 20 }),
                // Generate filter date range with safe dates
                fc.record({
                    start: fc.option(fc.constantFrom('2020-01-01', '2021-01-01', '2022-01-01', '2023-01-01', '2024-01-01')),
                    end: fc.option(fc.constantFrom('2024-12-31', '2025-12-31', '2026-12-31', '2027-12-31', '2030-12-31'))
                })
                .filter(range => {
                    // Ensure start <= end when both are present
                    if (range.start && range.end) {
                        return new Date(range.start) <= new Date(range.end);
                    }
                    return true;
                }),
                (allocations, dateRange) => {
                    const filtered = engine.filterByDateRangeEnhanced(allocations, dateRange);
                    
                    // Property 1: Filtered result should be a subset of original allocations
                    expect(filtered.length).toBeLessThanOrEqual(allocations.length);
                    
                    // Property 2: All filtered allocations should be from the original set
                    filtered.forEach(allocation => {
                        expect(allocations).toContainEqual(allocation);
                    });
                    
                    // Property 3: If no date range is specified, should return all allocations
                    if (!dateRange.start && !dateRange.end) {
                        expect(filtered).toEqual(allocations);
                    }
                    
                    // Property 4: Filtered allocations should overlap with the date range
                    if (dateRange.start || dateRange.end) {
                        filtered.forEach(allocation => {
                            const taskStart = allocation.plan?.taskStart;
                            const taskEnd = allocation.plan?.taskEnd;
                            
                            if (taskStart) {
                                const allocationStart = new Date(taskStart);
                                const allocationEnd = taskEnd ? new Date(taskEnd) : allocationStart;
                                
                                if (dateRange.start && dateRange.end) {
                                    const filterStart = new Date(dateRange.start);
                                    const filterEnd = new Date(dateRange.end);
                                    
                                    // Should have some overlap
                                    const hasOverlap = allocationStart <= filterEnd && allocationEnd >= filterStart;
                                    expect(hasOverlap).toBe(true);
                                }
                            }
                        });
                    }
                    
                    return true;
                }
            ), { numRuns: 30 });
        });

        it('should provide consistent quick filter options', () => {
            fc.assert(fc.property(
                fc.constant(null), // No input needed for this test
                () => {
                    const options = engine.getQuickFilterOptions();
                    
                    // Property 1: Should always return the same number of options
                    expect(options).toHaveLength(7);
                    
                    // Property 2: All options should have required fields
                    options.forEach(option => {
                        expect(option).toHaveProperty('label');
                        expect(option).toHaveProperty('value');
                        expect(option).toHaveProperty('start');
                        expect(option).toHaveProperty('end');
                        expect(option).toHaveProperty('icon');
                        expect(option).toHaveProperty('description');
                        
                        // Property 3: Date strings should be valid
                        expect(option.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                        expect(option.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                        
                        // Property 4: Start date should be <= end date
                        expect(new Date(option.start) <= new Date(option.end)).toBe(true);
                    });
                    
                    // Property 5: Values should be unique
                    const values = options.map(o => o.value);
                    expect(new Set(values).size).toBe(values.length);
                    
                    return true;
                }
            ), { numRuns: 50 });
        });

        it('should apply quick filters correctly', () => {
            fc.assert(fc.property(
                fc.constantFrom('today', 'this-week', 'this-month', 'last-week', 'last-month', 'next-week', 'next-month'),
                (filterValue) => {
                    const result = engine.applyQuickFilter(filterValue);
                    
                    // Property 1: Should return valid date range for valid filter values
                    expect(result).toHaveProperty('start');
                    expect(result).toHaveProperty('end');
                    expect(result).toHaveProperty('label');
                    expect(result).toHaveProperty('description');
                    
                    // Property 2: Date strings should be valid
                    expect(result.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                    expect(result.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                    
                    // Property 3: Start date should be <= end date
                    expect(new Date(result.start) <= new Date(result.end)).toBe(true);
                    
                    return true;
                }
            ), { numRuns: 50 });
        });

        it('should calculate accurate date range statistics', () => {
            fc.assert(fc.property(
                // Generate test allocations with costs and effort using safe dates
                fc.array(fc.record({
                    id: fc.string({ minLength: 1, maxLength: 10 }),
                    plan: fc.record({
                        taskStart: fc.constantFrom('2024-01-01', '2024-02-15', '2024-03-10', '2024-06-15', '2024-09-20', '2024-12-31'),
                        taskEnd: fc.constantFrom('2024-01-31', '2024-03-15', '2024-04-10', '2024-07-15', '2024-10-20', '2024-12-31'),
                        costProject: fc.integer({ min: 0, max: 10000 }),
                        effortHours: fc.integer({ min: 1, max: 200 })
                    }),
                    phase: fc.constantFrom('Planning', 'In Progress', 'Completed', 'On Hold'),
                    complexity: fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
                    category: fc.constantFrom('Project', 'Support', 'Maintenance')
                }), { minLength: 0, maxLength: 10 })
                .map(allocations => allocations.filter(a => new Date(a.plan.taskStart) <= new Date(a.plan.taskEnd))),
                fc.record({
                    start: fc.constantFrom('2024-01-01', '2024-03-01', '2024-06-01', '2024-09-01'),
                    end: fc.constantFrom('2024-03-31', '2024-06-30', '2024-09-30', '2024-12-31')
                })
                .filter(range => new Date(range.start) <= new Date(range.end)),
                (allocations, dateRange) => {
                    const stats = engine.getDateRangeStats(allocations, dateRange);
                    
                    // Property 1: Stats should have all required fields
                    expect(stats).toHaveProperty('totalAllocations');
                    expect(stats).toHaveProperty('totalCost');
                    expect(stats).toHaveProperty('totalEffortHours');
                    expect(stats).toHaveProperty('averageDuration');
                    expect(stats).toHaveProperty('phaseDistribution');
                    expect(stats).toHaveProperty('complexityDistribution');
                    expect(stats).toHaveProperty('categoryDistribution');
                    
                    // Property 2: Numeric values should be non-negative
                    expect(stats.totalAllocations).toBeGreaterThanOrEqual(0);
                    expect(stats.totalCost).toBeGreaterThanOrEqual(0);
                    expect(stats.totalEffortHours).toBeGreaterThanOrEqual(0);
                    expect(stats.averageDuration).toBeGreaterThanOrEqual(0);
                    
                    // Property 3: Total allocations should match filtered count
                    const filtered = engine.filterByDateRangeEnhanced(allocations, dateRange);
                    expect(stats.totalAllocations).toBe(filtered.length);
                    
                    // Property 4: Distribution counts should sum to total allocations
                    const phaseSum = Object.values(stats.phaseDistribution).reduce((sum, count) => sum + count, 0);
                    const complexitySum = Object.values(stats.complexityDistribution).reduce((sum, count) => sum + count, 0);
                    const categorySum = Object.values(stats.categoryDistribution).reduce((sum, count) => sum + count, 0);
                    
                    expect(phaseSum).toBe(stats.totalAllocations);
                    expect(complexitySum).toBe(stats.totalAllocations);
                    expect(categorySum).toBe(stats.totalAllocations);
                    
                    return true;
                }
            ), { numRuns: 30 });
        });
    });

    describe('Property 19: Phase-Based Duration Calculation', () => {
        /**
         * **Property 19: Phase-Based Duration Calculation**
         * *For any* allocation with a task allocation phase selected, the system should calculate 
         * the time span from the allocation phase until the completion phase, providing accurate 
         * phase-based timeline estimates.
         * **Validates: User Requirement - Calculate span until phase Completed**
         */
        
        const phaseGen = fc.constantFrom(
            'Initiation', 'Planning', 'Execution', 'Monitoring & Controlling', 
            'Closing', 'IT Operations & Support', 'Completed', 'Idle'
        );

        const dateGen = fc.date({ 
            min: new Date('2024-01-01'), 
            max: new Date('2024-12-31') 
        }).filter(date => !isNaN(date.getTime()));

        const allocationGen = fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            phase: phaseGen,
            plan: fc.record({
                taskStart: dateGen.map(d => d.toISOString()),
                taskEnd: fc.option(dateGen.map(d => d.toISOString()))
            })
        });

        it('should always return a valid result structure for any allocation', () => {
            fc.assert(fc.property(
                allocationGen,
                fc.constantFrom('Completed', 'Idle', 'Closing'),
                (allocation, completionPhase) => {
                    // **Validates: User Requirement - Calculate span until phase Completed**
                    
                    const result = engine.calculatePhaseSpan(allocation, completionPhase);
                    
                    // Result should always have required properties
                    expect(result).toHaveProperty('isValid');
                    expect(result).toHaveProperty('days');
                    expect(result).toHaveProperty('hours');
                    expect(result).toHaveProperty('startPhase');
                    expect(result).toHaveProperty('endPhase');
                    
                    // Days and hours should be non-negative numbers
                    expect(typeof result.days).toBe('number');
                    expect(typeof result.hours).toBe('number');
                    expect(result.days).toBeGreaterThanOrEqual(0);
                    expect(result.hours).toBeGreaterThanOrEqual(0);
                    
                    // Phase information should be preserved
                    expect(result.startPhase).toBe(allocation.phase);
                    expect(result.endPhase).toBe(completionPhase);
                    
                    return true;
                }
            ), { numRuns: 100 });
        });

        it('should calculate zero span for allocations already in completion phase', () => {
            fc.assert(fc.property(
                fc.constantFrom('Completed', 'Idle'),
                dateGen,
                fc.option(dateGen),
                (completionPhase, startDate, endDate) => {
                    // **Validates: User Requirement - Calculate span until phase Completed**
                    
                    const allocation = {
                        id: 'TEST-ALLOC',
                        phase: completionPhase,
                        plan: {
                            taskStart: startDate.toISOString(),
                            taskEnd: endDate?.toISOString()
                        }
                    };
                    
                    const result = engine.calculatePhaseSpan(allocation, 'Completed');
                    
                    // Should be valid and completed
                    expect(result.isValid).toBe(true);
                    expect(result.isCompleted).toBe(true);
                    
                    // Span should be zero for completed tasks
                    expect(result.days).toBe(0);
                    expect(result.hours).toBe(0);
                    
                    return true;
                }
            ), { numRuns: 50 });
        });

        it('should maintain mathematical relationship between days and hours', () => {
            fc.assert(fc.property(
                allocationGen.filter(a => !['Completed', 'Idle'].includes(a.phase)),
                (allocation) => {
                    // **Validates: User Requirement - Calculate span until phase Completed**
                    
                    const result = engine.calculatePhaseSpan(allocation, 'Completed');
                    
                    if (result.isValid && !result.isCompleted) {
                        // Hours should be approximately days * 24 (allowing for some rounding)
                        const expectedHours = result.days * 24;
                        const hoursDifference = Math.abs(result.hours - expectedHours);
                        
                        // Allow for up to 24 hours difference due to time-of-day calculations
                        expect(hoursDifference).toBeLessThanOrEqual(24);
                    }
                    
                    return true;
                }
            ), { numRuns: 100 });
        });

        it('should handle date ordering correctly', () => {
            fc.assert(fc.property(
                phaseGen.filter(p => !['Completed', 'Idle'].includes(p)),
                dateGen,
                dateGen,
                (phase, date1, date2) => {
                    // **Validates: User Requirement - Calculate span until phase Completed**
                    
                    // Ensure proper date ordering
                    const [startDate, endDate] = date1 <= date2 ? [date1, date2] : [date2, date1];
                    
                    const allocation = {
                        id: 'TEST-ALLOC',
                        phase: phase,
                        plan: {
                            taskStart: startDate.toISOString(),
                            taskEnd: endDate.toISOString()
                        }
                    };
                    
                    const result = engine.calculatePhaseSpan(allocation, 'Completed');
                    
                    if (result.isValid) {
                        // Should not be projected when end date is provided
                        expect(result.isProjected).toBe(false);
                        
                        // Days should be non-negative
                        expect(result.days).toBeGreaterThanOrEqual(0);
                    }
                    
                    return true;
                }
            ), { numRuns: 100 });
        });

        it('should mark calculations as projected when no end date provided', () => {
            fc.assert(fc.property(
                phaseGen.filter(p => !['Completed', 'Idle'].includes(p)),
                dateGen,
                (phase, startDate) => {
                    // **Validates: User Requirement - Calculate span until phase Completed**
                    
                    const allocation = {
                        id: 'TEST-ALLOC',
                        phase: phase,
                        plan: {
                            taskStart: startDate.toISOString()
                            // No taskEnd
                        }
                    };
                    
                    const result = engine.calculatePhaseSpan(allocation, 'Completed');
                    
                    if (result.isValid) {
                        // Should be marked as projected
                        expect(result.isProjected).toBe(true);
                        expect(result.message).toContain('Projected span');
                    }
                    
                    return true;
                }
            ), { numRuns: 50 });
        });
    });

    describe('Date Range Filtering Properties', () => {
        const dateGen = fc.date({ 
            min: new Date('2024-01-01'), 
            max: new Date('2024-12-31') 
        }).filter(date => !isNaN(date.getTime()));

        const allocationGen = fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            plan: fc.record({
                taskStart: dateGen.map(d => d.toISOString().split('T')[0]),
                taskEnd: fc.option(dateGen.map(d => d.toISOString().split('T')[0]))
            })
        });

        it('should preserve allocation count when no date range provided', () => {
            fc.assert(fc.property(
                fc.array(allocationGen, { minLength: 0, maxLength: 20 }),
                (allocations) => {
                    const result = engine.filterByDateRange(allocations, {});
                    expect(result.length).toBe(allocations.length);
                    return true;
                }
            ), { numRuns: 50 });
        });

        it('should only return allocations with valid task start dates', () => {
            fc.assert(fc.property(
                fc.array(allocationGen, { minLength: 1, maxLength: 20 }),
                fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
                fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
                (allocations, date1, date2) => {
                    // Ensure both dates are valid
                    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
                        return true; // Skip invalid dates
                    }
                    
                    const [startDate, endDate] = date1 <= date2 ? [date1, date2] : [date2, date1];
                    
                    const dateRange = {
                        start: startDate.toISOString().split('T')[0],
                        end: endDate.toISOString().split('T')[0]
                    };
                    
                    const result = engine.filterByDateRange(allocations, dateRange);
                    
                    // All returned allocations should have valid taskStart dates
                    result.forEach(allocation => {
                        expect(allocation.plan?.taskStart).toBeDefined();
                        expect(allocation.plan.taskStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                    });
                    
                    return true;
                }
            ), { numRuns: 50 });
        });
    });

    describe('Demand Number Search Properties', () => {
        const issueGen = fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            category: fc.constantFrom('Support', 'Project', 'Maintenance'),
            demandNumber: fc.option(fc.string({ minLength: 5, maxLength: 20 })),
            ticketId: fc.option(fc.string({ minLength: 3, maxLength: 15 })),
            activityName: fc.option(fc.string({ minLength: 10, maxLength: 50 })),
            description: fc.string({ minLength: 10, maxLength: 100 })
        });

        it('should only return Support category issues by default', () => {
            fc.assert(fc.property(
                fc.array(issueGen, { minLength: 1, maxLength: 20 }),
                fc.string({ minLength: 1, maxLength: 10 }),
                (issues, searchTerm) => {
                    const result = engine.searchByDemandNumber(issues, searchTerm);
                    
                    // All returned issues should be Support category by default
                    result.forEach(issue => {
                        expect(issue.category).toBe('Support');
                    });
                    
                    return true;
                }
            ), { numRuns: 50 });
        });

        it('should include all categories when includeAllCategories is true', () => {
            fc.assert(fc.property(
                fc.array(issueGen, { minLength: 1, maxLength: 20 }),
                fc.string({ minLength: 1, maxLength: 10 }),
                (issues, searchTerm) => {
                    const result = engine.searchByDemandNumber(issues, searchTerm, { includeAllCategories: true });
                    
                    // Should be able to return issues from any category
                    const categories = [...new Set(result.map(issue => issue.category))];
                    const allCategories = [...new Set(issues.map(issue => issue.category))];
                    
                    // If there are matches, categories in result should be subset of all categories
                    if (result.length > 0) {
                        categories.forEach(cat => {
                            expect(allCategories).toContain(cat);
                        });
                    }
                    
                    return true;
                }
            ), { numRuns: 50 });
        });

        it('should be case insensitive by default', () => {
            fc.assert(fc.property(
                fc.array(issueGen.filter(i => i.category === 'Support'), { minLength: 1, maxLength: 10 }),
                fc.string({ minLength: 2, maxLength: 5 }),
                (issues, searchTerm) => {
                    const lowerResult = engine.searchByDemandNumber(issues, searchTerm.toLowerCase());
                    const upperResult = engine.searchByDemandNumber(issues, searchTerm.toUpperCase());
                    
                    // Results should be the same regardless of case
                    expect(lowerResult.length).toBe(upperResult.length);
                    expect(lowerResult.map(i => i.id).sort()).toEqual(upperResult.map(i => i.id).sort());
                    
                    return true;
                }
            ), { numRuns: 30 });
        });

        it('should respect case sensitivity when caseSensitive option is true', () => {
            fc.assert(fc.property(
                fc.array(issueGen, { minLength: 1, maxLength: 10 }),
                fc.string({ minLength: 2, maxLength: 5 }),
                (issues, searchTerm) => {
                    const caseSensitiveResult = engine.searchByDemandNumber(issues, searchTerm, { caseSensitive: true });
                    const caseInsensitiveResult = engine.searchByDemandNumber(issues, searchTerm, { caseSensitive: false });
                    
                    // Case sensitive result should be subset of case insensitive result
                    expect(caseSensitiveResult.length).toBeLessThanOrEqual(caseInsensitiveResult.length);
                    
                    return true;
                }
            ), { numRuns: 30 });
        });

        it('should return enhanced search results with proper structure', () => {
            fc.assert(fc.property(
                fc.array(issueGen, { minLength: 1, maxLength: 20 }),
                fc.string({ minLength: 1, maxLength: 10 }),
                (issues, searchTerm) => {
                    const result = engine.searchByDemandNumberEnhanced(issues, searchTerm);
                    
                    // Check result structure
                    expect(result).toHaveProperty('mainMatches');
                    expect(result).toHaveProperty('relatedMatches');
                    expect(result).toHaveProperty('searchTerm');
                    expect(result).toHaveProperty('totalResults');
                    expect(result).toHaveProperty('hasExactMatch');
                    expect(result).toHaveProperty('hasPartialMatch');
                    expect(result).toHaveProperty('hasRelatedMatch');
                    
                    // Verify arrays
                    expect(Array.isArray(result.mainMatches)).toBe(true);
                    expect(Array.isArray(result.relatedMatches)).toBe(true);
                    
                    // Verify total results calculation
                    expect(result.totalResults).toBe(result.mainMatches.length + result.relatedMatches.length);
                    
                    // Verify search term
                    expect(result.searchTerm).toBe(searchTerm);
                    
                    return true;
                }
            ), { numRuns: 50 });
        });

        it('should not have overlapping results between main and related matches', () => {
            fc.assert(fc.property(
                fc.array(issueGen, { minLength: 1, maxLength: 20 }),
                fc.string({ minLength: 3, maxLength: 10 }),
                (issues, searchTerm) => {
                    const result = engine.searchByDemandNumberEnhanced(issues, searchTerm);
                    
                    // No issue should appear in both main and related matches
                    const mainIds = result.mainMatches.map(issue => issue.id);
                    const relatedIds = result.relatedMatches.map(issue => issue.id);
                    
                    const overlap = mainIds.filter(id => relatedIds.includes(id));
                    expect(overlap).toHaveLength(0);
                    
                    return true;
                }
            ), { numRuns: 50 });
        });

        it('should extract meaningful patterns from demand numbers', () => {
            fc.assert(fc.property(
                fc.string({ minLength: 5, maxLength: 20 }),
                (searchTerm) => {
                    const patterns = engine.extractDemandPatterns(searchTerm);
                    
                    // Should always include the original term
                    expect(patterns).toContain(searchTerm.toLowerCase());
                    
                    // Should be an array
                    expect(Array.isArray(patterns)).toBe(true);
                    
                    // Should not have duplicates
                    const uniquePatterns = [...new Set(patterns)];
                    expect(patterns.length).toBe(uniquePatterns.length);
                    
                    return true;
                }
            ), { numRuns: 50 });
        });
    });

    describe('Phase Transition Statistics Properties', () => {
        const allocationWithPhaseGen = fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            phase: fc.constantFrom(
                'Planning', 'Execution', 'Completed', 'Idle', 'Closing'
            ),
            plan: fc.option(fc.record({
                taskStart: fc.date({ 
                    min: new Date('2024-01-01'), 
                    max: new Date('2024-12-31') 
                }).filter(date => !isNaN(date.getTime())).map(d => d.toISOString()),
                taskEnd: fc.date({ 
                    min: new Date('2024-01-01'), 
                    max: new Date('2024-12-31') 
                }).filter(date => !isNaN(date.getTime())).map(d => d.toISOString())
            }))
        });

        it('should maintain allocation count consistency', () => {
            fc.assert(fc.property(
                fc.array(allocationWithPhaseGen, { minLength: 0, maxLength: 20 }),
                (allocations) => {
                    const stats = engine.calculatePhaseTransitionStats(allocations);
                    
                    // Total should match input length
                    expect(stats.totalAllocations).toBe(allocations.length);
                    
                    // Phase distribution should sum to total
                    const distributionSum = Object.values(stats.phaseDistribution)
                        .reduce((sum, count) => sum + count, 0);
                    expect(distributionSum).toBe(allocations.length);
                    
                    // Completed + in-progress should equal total
                    expect(stats.completedCount + stats.inProgressCount).toBe(allocations.length);
                    
                    return true;
                }
            ), { numRuns: 50 });
        });

        it('should correctly categorize completion phases', () => {
            fc.assert(fc.property(
                fc.array(allocationWithPhaseGen, { minLength: 1, maxLength: 20 }),
                (allocations) => {
                    const stats = engine.calculatePhaseTransitionStats(allocations);
                    
                    // Count expected completed allocations
                    const expectedCompleted = allocations.filter(a => 
                        engine.completionPhases.includes(a.phase)
                    ).length;
                    
                    expect(stats.completedCount).toBe(expectedCompleted);
                    expect(stats.inProgressCount).toBe(allocations.length - expectedCompleted);
                    
                    return true;
                }
            ), { numRuns: 50 });
        });
    });
});