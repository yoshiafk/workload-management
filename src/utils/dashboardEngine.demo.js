/**
 * Dashboard Engine Demo
 * Demonstrates phase-based duration calculation and dashboard functionality
 */

import { DashboardEngine } from './dashboardEngine.js';

/**
 * Demo: Phase-Based Duration Calculation
 */
function demoPhaseBasedDurationCalculation() {
    console.log('\n=== Phase-Based Duration Calculation Demo ===');
    
    const engine = new DashboardEngine();
    
    // Sample allocations in different phases
    const sampleAllocations = [
        {
            id: 'ALLOC-001',
            resource: 'Alice Developer',
            projectName: 'E-commerce Platform',
            phase: 'Planning',
            plan: {
                taskStart: '2024-01-01T09:00:00Z',
                taskEnd: '2024-01-15T17:00:00Z'
            }
        },
        {
            id: 'ALLOC-002',
            resource: 'Bob Senior',
            projectName: 'Mobile App',
            phase: 'Execution',
            plan: {
                taskStart: '2024-01-10T09:00:00Z',
                taskEnd: '2024-02-10T17:00:00Z'
            }
        },
        {
            id: 'ALLOC-003',
            resource: 'Carol Lead',
            projectName: 'API Integration',
            phase: 'Monitoring & Controlling',
            plan: {
                taskStart: '2024-01-05T09:00:00Z'
                // No end date - ongoing project
            }
        },
        {
            id: 'ALLOC-004',
            resource: 'David Principal',
            projectName: 'Legacy Migration',
            phase: 'Completed',
            plan: {
                taskStart: '2023-12-01T09:00:00Z',
                taskEnd: '2024-01-20T17:00:00Z'
            }
        },
        {
            id: 'ALLOC-005',
            resource: 'Eve Developer',
            projectName: 'Support Tasks',
            phase: 'Idle',
            plan: {
                taskStart: '2024-01-01T09:00:00Z'
            }
        }
    ];
    
    console.log('Sample Allocations:');
    sampleAllocations.forEach(allocation => {
        console.log(`  ${allocation.id}: ${allocation.projectName} (${allocation.phase})`);
    });
    
    console.log('\nPhase Span Calculations to Completion:');
    console.log('─'.repeat(80));
    
    sampleAllocations.forEach(allocation => {
        const span = engine.calculatePhaseSpan(allocation, 'Completed');
        
        console.log(`\n${allocation.id} - ${allocation.projectName}`);
        console.log(`  Current Phase: ${span.startPhase}`);
        console.log(`  Target Phase: ${span.endPhase}`);
        console.log(`  Valid: ${span.isValid}`);
        
        if (span.isValid) {
            if (span.isCompleted) {
                console.log(`  Status: ✅ ${span.message}`);
            } else {
                console.log(`  Duration: ${span.days} days (${span.hours} hours)`);
                console.log(`  Type: ${span.isProjected ? '📊 Projected' : '📅 Actual'}`);
                console.log(`  Message: ${span.message}`);
            }
        } else {
            console.log(`  Error: ❌ ${span.error}`);
        }
    });
    
    return sampleAllocations;
}

/**
 * Demo: Phase Transition Statistics
 */
function demoPhaseTransitionStats() {
    console.log('\n\n=== Phase Transition Statistics Demo ===');
    
    const engine = new DashboardEngine();
    
    // Extended sample data for statistics
    const allocations = [
        { id: 'A001', phase: 'Planning', plan: { taskStart: '2024-01-01', taskEnd: '2024-01-10' } },
        { id: 'A002', phase: 'Planning', plan: { taskStart: '2024-01-05', taskEnd: '2024-01-15' } },
        { id: 'A003', phase: 'Execution', plan: { taskStart: '2024-01-10', taskEnd: '2024-01-25' } },
        { id: 'A004', phase: 'Execution', plan: { taskStart: '2024-01-15', taskEnd: '2024-02-01' } },
        { id: 'A005', phase: 'Execution', plan: { taskStart: '2024-01-20', taskEnd: '2024-02-05' } },
        { id: 'A006', phase: 'Monitoring & Controlling', plan: { taskStart: '2024-01-25', taskEnd: '2024-02-10' } },
        { id: 'A007', phase: 'Completed', plan: { taskStart: '2024-01-01', taskEnd: '2024-01-20' } },
        { id: 'A008', phase: 'Completed', plan: { taskStart: '2024-01-05', taskEnd: '2024-01-15' } },
        { id: 'A009', phase: 'Completed', plan: { taskStart: '2024-01-10', taskEnd: '2024-01-30' } },
        { id: 'A010', phase: 'Idle' }
    ];
    
    const stats = engine.calculatePhaseTransitionStats(allocations);
    
    console.log('Phase Distribution:');
    Object.entries(stats.phaseDistribution).forEach(([phase, count]) => {
        const percentage = ((count / stats.totalAllocations) * 100).toFixed(1);
        const bar = '█'.repeat(Math.round(count / 2));
        console.log(`  ${phase.padEnd(25)} ${count.toString().padStart(2)} (${percentage}%) ${bar}`);
    });
    
    console.log(`\nSummary Statistics:`);
    console.log(`  Total Allocations: ${stats.totalAllocations}`);
    console.log(`  Completed: ${stats.completedCount} (${((stats.completedCount / stats.totalAllocations) * 100).toFixed(1)}%)`);
    console.log(`  In Progress: ${stats.inProgressCount} (${((stats.inProgressCount / stats.totalAllocations) * 100).toFixed(1)}%)`);
    console.log(`  Average Span to Completion: ${stats.averageSpanToCompletion} days`);
    
    return stats;
}

/**
 * Demo: Date Range Filtering
 */
function demoDateRangeFiltering() {
    console.log('\n\n=== Date Range Filtering Demo ===');
    
    const engine = new DashboardEngine();
    
    const allocations = [
        { id: 'ALLOC-001', projectName: 'Project Alpha', plan: { taskStart: '2024-01-01', taskEnd: '2024-01-15' } },
        { id: 'ALLOC-002', projectName: 'Project Beta', plan: { taskStart: '2024-01-10', taskEnd: '2024-01-25' } },
        { id: 'ALLOC-003', projectName: 'Project Gamma', plan: { taskStart: '2024-01-20', taskEnd: '2024-02-05' } },
        { id: 'ALLOC-004', projectName: 'Project Delta', plan: { taskStart: '2024-02-01', taskEnd: '2024-02-15' } },
        { id: 'ALLOC-005', projectName: 'Project Epsilon', plan: { taskStart: '2024-02-10', taskEnd: '2024-02-25' } }
    ];
    
    console.log('All Allocations:');
    allocations.forEach(a => {
        console.log(`  ${a.id}: ${a.projectName} (${a.plan.taskStart} to ${a.plan.taskEnd})`);
    });
    
    // Test different date ranges
    const dateRanges = [
        { name: 'January 2024', start: '2024-01-01', end: '2024-01-31' },
        { name: 'Mid January', start: '2024-01-15', end: '2024-01-25' },
        { name: 'February 2024', start: '2024-02-01', end: '2024-02-28' },
        { name: 'From Jan 20', start: '2024-01-20' },
        { name: 'Until Jan 20', end: '2024-01-20' }
    ];
    
    dateRanges.forEach(range => {
        console.log(`\nFiltering by ${range.name}:`);
        const filtered = engine.filterByDateRange(allocations, range);
        
        if (filtered.length === 0) {
            console.log('  No allocations found in this range');
        } else {
            filtered.forEach(a => {
                console.log(`  ✓ ${a.id}: ${a.projectName}`);
            });
        }
        console.log(`  Total: ${filtered.length} allocations`);
    });
    
    // Demo quick filter options
    console.log('\nQuick Filter Options:');
    const quickFilters = engine.getQuickFilterOptions();
    quickFilters.forEach(filter => {
        console.log(`  ${filter.label}: ${filter.start} to ${filter.end}`);
    });
    
    return { allocations, quickFilters };
}

/**
 * Demo: Support Issue Demand Number Search
 */
function demoDemandNumberSearch() {
    console.log('\n\n=== Enhanced Demand Number Search Demo ===');
    
    const engine = new DashboardEngine();
    
    const issues = [
        { id: 'ISS-001', category: 'Support', demandNumber: 'DEM-2024-001', ticketId: 'TKT-001', activityName: 'Login authentication issue', description: 'Login authentication issue' },
        { id: 'ISS-002', category: 'Support', demandNumber: 'DEM-2024-002', ticketId: 'TKT-002', activityName: 'Database connection timeout', description: 'Database connection timeout' },
        { id: 'ISS-003', category: 'Support', demandNumber: 'DEM-2024-003', ticketId: 'TKT-003', activityName: 'Email notification failure', description: 'Email notification failure' },
        { id: 'ISS-004', category: 'Project', demandNumber: 'DEM-2024-004', activityName: 'New feature development', description: 'New feature development' },
        { id: 'ISS-005', category: 'Support', demandNumber: 'DEM-2023-999', ticketId: 'TKT-999', activityName: 'Legacy system maintenance', description: 'Legacy system maintenance' },
        { id: 'ISS-006', category: 'Support', demandNumber: 'URGENT-2024-001', ticketId: 'URGENT-001', activityName: 'Critical system outage', description: 'Critical system outage' },
        { id: 'ISS-007', category: 'Support', ticketId: 'TKT-007', activityName: 'Ad-hoc support request', description: 'Ad-hoc support request' }, // No demand number
        { id: 'ISS-008', category: 'Support', demandNumber: 'REQ-2024-001', ticketId: 'REQ-001', activityName: 'Feature request analysis', description: 'Feature request analysis' }
    ];
    
    console.log('All Issues:');
    issues.forEach(issue => {
        const demandNum = issue.demandNumber || 'N/A';
        const ticketId = issue.ticketId || 'N/A';
        console.log(`  ${issue.id} (${issue.category}): ${demandNum} | ${ticketId} - ${issue.activityName}`);
    });
    
    console.log('\n--- Basic Search Tests ---');
    const basicSearchTerms = ['DEM-2024-001', '2024', 'URGENT', 'authentication'];
    
    basicSearchTerms.forEach(term => {
        console.log(`\nSearching for "${term}" (Support only):`);
        const results = engine.searchByDemandNumber(issues, term);
        
        if (results.length === 0) {
            console.log('  No matches found');
        } else {
            results.forEach(issue => {
                console.log(`  ✓ ${issue.id}: ${issue.demandNumber || 'N/A'} - ${issue.activityName}`);
            });
        }
        console.log(`  Total: ${results.length} Support issues found`);
    });

    console.log('\n--- Enhanced Search Tests ---');
    const enhancedSearchTerms = ['DEM-2024', '2024', 'TKT-001', 'authentication'];
    
    enhancedSearchTerms.forEach(term => {
        console.log(`\nEnhanced search for "${term}":`);
        const results = engine.searchByDemandNumberEnhanced(issues, term, {
            includeAllCategories: true,
            searchInTicketId: true,
            searchInActivityName: true,
            includeRelated: true
        });
        
        console.log(`  Total Results: ${results.totalResults}`);
        console.log(`  Exact Match: ${results.hasExactMatch}, Partial Match: ${results.hasPartialMatch}, Related Match: ${results.hasRelatedMatch}`);
        
        if (results.mainMatches.length > 0) {
            console.log('  Main Matches:');
            results.mainMatches.forEach(issue => {
                console.log(`    ✓ ${issue.id}: ${issue.demandNumber || 'N/A'} - ${issue.activityName}`);
            });
        }
        
        if (results.relatedMatches.length > 0) {
            console.log('  Related Matches:');
            results.relatedMatches.forEach(issue => {
                console.log(`    ~ ${issue.id}: ${issue.demandNumber || 'N/A'} - ${issue.activityName}`);
            });
        }
        
        if (results.totalResults === 0) {
            console.log('  No matches found');
        }
    });

    console.log('\n--- Search Options Demo ---');
    
    // Exact match demo
    console.log('\nExact match for "DEM-2024-001":');
    const exactResults = engine.searchByDemandNumber(issues, 'DEM-2024-001', { exactMatch: true });
    exactResults.forEach(issue => {
        console.log(`  ✓ ${issue.id}: ${issue.demandNumber} - ${issue.activityName}`);
    });
    
    // Case sensitive demo
    console.log('\nCase sensitive search for "dem-2024-001":');
    const caseResults = engine.searchByDemandNumber(issues, 'dem-2024-001', { caseSensitive: true });
    if (caseResults.length === 0) {
        console.log('  No matches (case sensitive)');
    } else {
        caseResults.forEach(issue => {
            console.log(`  ✓ ${issue.id}: ${issue.demandNumber} - ${issue.activityName}`);
        });
    }
    
    // All categories demo
    console.log('\nSearch "DEM-2024" in all categories:');
    const allCatResults = engine.searchByDemandNumber(issues, 'DEM-2024', { includeAllCategories: true });
    allCatResults.forEach(issue => {
        console.log(`  ✓ ${issue.id} (${issue.category}): ${issue.demandNumber} - ${issue.activityName}`);
    });

    console.log('\n--- Pattern Extraction Demo ---');
    const testPatterns = ['DEM-2024-001', 'URGENT-2024-001', 'REQ123', 'TEST-2023-ABC-999'];
    
    testPatterns.forEach(pattern => {
        const extracted = engine.extractDemandPatterns(pattern);
        console.log(`  "${pattern}" → [${extracted.join(', ')}]`);
    });
    
    return issues;
}

/**
 * Demo: Error Handling and Edge Cases
 */
function demoErrorHandling() {
    console.log('\n\n=== Error Handling Demo ===');
    
    const engine = new DashboardEngine();
    
    console.log('Testing edge cases and error conditions:');
    
    // Test invalid allocation objects
    const testCases = [
        { name: 'Null allocation', allocation: null },
        { name: 'Undefined allocation', allocation: undefined },
        { name: 'Empty object', allocation: {} },
        { name: 'No phase', allocation: { id: 'TEST', plan: { taskStart: '2024-01-01' } } },
        { name: 'No plan', allocation: { id: 'TEST', phase: 'Planning' } },
        { name: 'Invalid date', allocation: { id: 'TEST', phase: 'Planning', plan: { taskStart: 'invalid-date' } } },
        { name: 'No start date', allocation: { id: 'TEST', phase: 'Planning', plan: { taskEnd: '2024-01-15' } } }
    ];
    
    testCases.forEach(testCase => {
        console.log(`\n${testCase.name}:`);
        const result = engine.calculatePhaseSpan(testCase.allocation, 'Completed');
        
        console.log(`  Valid: ${result.isValid}`);
        if (!result.isValid) {
            console.log(`  Error: ${result.error}`);
        }
        console.log(`  Days: ${result.days}, Hours: ${result.hours}`);
        console.log(`  Start Phase: ${result.startPhase}, End Phase: ${result.endPhase}`);
    });
    
    // Test filtering with invalid data
    console.log('\nTesting filtering with invalid data:');
    
    const invalidFilterTests = [
        { name: 'Null allocations', allocations: null, dateRange: { start: '2024-01-01' } },
        { name: 'Invalid date range', allocations: [], dateRange: { start: 'invalid-date' } },
        { name: 'Null date range', allocations: [], dateRange: null }
    ];
    
    invalidFilterTests.forEach(test => {
        console.log(`\n${test.name}:`);
        try {
            const result = engine.filterByDateRange(test.allocations, test.dateRange);
            console.log(`  Result length: ${result.length}`);
            console.log(`  ✓ Handled gracefully`);
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }
    });
}

/**
 * Run all demos
 */
function runAllDemos() {
    console.log('🚀 Dashboard Engine Demo');
    console.log('=' .repeat(50));
    
    try {
        const allocations = demoPhaseBasedDurationCalculation();
        const stats = demoPhaseTransitionStats();
        const dateFiltering = demoDateRangeFiltering();
        const demandSearch = demoDemandNumberSearch();
        demoErrorHandling();
        
        console.log('\n\n✅ All Dashboard Engine demos completed successfully!');
        console.log('\nKey Features Demonstrated:');
        console.log('• Phase-based duration calculation from allocation phase to completion');
        console.log('• Support for both actual and projected time spans');
        console.log('• Comprehensive phase transition statistics');
        console.log('• Flexible date range filtering for dashboard views');
        console.log('• Support issue search by demand number');
        console.log('• Robust error handling for invalid inputs');
        console.log('• Quick filter options for common date ranges');
        
        return {
            allocations,
            stats,
            dateFiltering,
            demandSearch
        };
        
    } catch (error) {
        console.error('❌ Demo failed:', error);
        throw error;
    }
}

// Export for testing
export {
    demoPhaseBasedDurationCalculation,
    demoPhaseTransitionStats,
    demoDateRangeFiltering,
    demoDemandNumberSearch,
    demoErrorHandling,
    runAllDemos
};

// Run demos if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllDemos();
}