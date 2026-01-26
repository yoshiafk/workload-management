/**
 * Dashboard Engine
 * Provides dashboard-specific functionality including phase-based duration calculations,
 * date filtering, and search capabilities for Support issues.
 */

import { differenceInDays, differenceInHours, parseISO, isValid } from 'date-fns';

/**
 * Dashboard Engine Class
 * Handles dashboard-specific calculations and filtering operations
 */
export class DashboardEngine {
    constructor() {
        this.completionPhases = ['Completed', 'Idle']; // Terminal phases
    }

    /**
     * Calculate time span from allocation phase to completion phase
     * @param {Object} allocation - The allocation object
     * @param {string} completionPhase - Target completion phase (default: 'Completed')
     * @returns {Object} Time span information
     */
    calculatePhaseSpan(allocation, completionPhase = 'Completed') {
        try {
            // Validate input
            if (!allocation || typeof allocation !== 'object') {
                return {
                    isValid: false,
                    error: 'Invalid allocation object',
                    days: 0,
                    hours: 0,
                    startPhase: null,
                    endPhase: null
                };
            }

            // Get allocation phase (current phase)
            const allocationPhase = allocation.phase;
            if (!allocationPhase) {
                return {
                    isValid: false,
                    error: 'No allocation phase specified',
                    days: 0,
                    hours: 0,
                    startPhase: null,
                    endPhase: completionPhase
                };
            }

            // Check if already in completion phase
            if (allocationPhase === completionPhase || this.completionPhases.includes(allocationPhase)) {
                return {
                    isValid: true,
                    isCompleted: true,
                    days: 0,
                    hours: 0,
                    startPhase: allocationPhase,
                    endPhase: completionPhase,
                    message: `Task is already in ${allocationPhase} phase`
                };
            }

            // Get task dates
            const taskStart = allocation.plan?.taskStart;
            const taskEnd = allocation.plan?.taskEnd;

            if (!taskStart) {
                return {
                    isValid: false,
                    error: 'No task start date available',
                    days: 0,
                    hours: 0,
                    startPhase: allocationPhase,
                    endPhase: completionPhase
                };
            }

            // Parse dates
            const startDate = typeof taskStart === 'string' ? parseISO(taskStart) : new Date(taskStart);
            
            if (!isValid(startDate)) {
                return {
                    isValid: false,
                    error: 'Invalid task start date',
                    days: 0,
                    hours: 0,
                    startPhase: allocationPhase,
                    endPhase: completionPhase
                };
            }

            let endDate;
            let isProjected = false;

            // If task has an end date, use it; otherwise use current date for projection
            if (taskEnd) {
                endDate = typeof taskEnd === 'string' ? parseISO(taskEnd) : new Date(taskEnd);
                if (!isValid(endDate)) {
                    endDate = new Date();
                    isProjected = true;
                }
            } else {
                endDate = new Date();
                isProjected = true;
            }

            // Calculate time span
            const days = Math.abs(differenceInDays(endDate, startDate));
            const hours = Math.abs(differenceInHours(endDate, startDate));

            return {
                isValid: true,
                isCompleted: false,
                isProjected,
                days,
                hours,
                startPhase: allocationPhase,
                endPhase: completionPhase,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                message: isProjected 
                    ? `Projected span from ${allocationPhase} phase to ${completionPhase}`
                    : `Actual span from ${allocationPhase} phase to ${completionPhase}`
            };

        } catch (error) {
            return {
                isValid: false,
                error: `Calculation error: ${error.message}`,
                days: 0,
                hours: 0,
                startPhase: allocation?.phase || null,
                endPhase: completionPhase
            };
        }
    }

    /**
     * Filter allocations by date range
     * @param {Array} allocations - Array of allocation objects
     * @param {Object} dateRange - Date range with start and end properties
     * @returns {Array} Filtered allocations
     */
    filterByDateRange(allocations, dateRange) {
        if (!Array.isArray(allocations) || !dateRange) {
            return allocations || [];
        }

        const { start, end } = dateRange;
        if (!start && !end) {
            return allocations;
        }

        try {
            const filterStart = start ? parseISO(start) : null;
            const filterEnd = end ? parseISO(end) : null;

            // Check for invalid dates
            if ((start && !isValid(filterStart)) || (end && !isValid(filterEnd))) {
                console.warn('Invalid date format in filter range');
                return allocations;
            }

            return allocations.filter(allocation => {
                const taskStart = allocation.plan?.taskStart;
                const taskEnd = allocation.plan?.taskEnd;

                if (!taskStart) return false;

                const allocationStart = parseISO(taskStart);
                const allocationEnd = taskEnd ? parseISO(taskEnd) : allocationStart;

                // Check if allocation overlaps with filter range
                if (filterStart && filterEnd) {
                    return allocationStart <= filterEnd && allocationEnd >= filterStart;
                } else if (filterStart) {
                    return allocationEnd >= filterStart;
                } else if (filterEnd) {
                    return allocationStart <= filterEnd;
                }

                return true;
            });
        } catch (error) {
            console.warn('Date filtering error:', error);
            return allocations;
        }
    }

    /**
     * Search Support issues by demand number
     * @param {Array} issues - Array of Support issue objects or allocations
     * @param {string} demandNumber - Demand number to search for
     * @param {Object} options - Search options
     * @returns {Array} Matching Support issues
     */
    searchByDemandNumber(issues, demandNumber, options = {}) {
        if (!Array.isArray(issues) || !demandNumber) {
            return issues || [];
        }

        const searchTerm = demandNumber.toLowerCase().trim();
        if (!searchTerm) {
            return issues;
        }

        const {
            exactMatch = false,
            includeAllCategories = false,
            searchInTicketId = true,
            searchInActivityName = true,
            caseSensitive = false
        } = options;

        return issues.filter(issue => {
            // Check category filter - by default only Support issues
            if (!includeAllCategories && issue.category !== 'Support') {
                return false;
            }

            // Prepare search term based on case sensitivity
            const term = caseSensitive ? demandNumber.trim() : searchTerm;
            
            // Search in demand number field
            const issueDemandNumber = caseSensitive 
                ? (issue.demandNumber || '') 
                : (issue.demandNumber?.toLowerCase() || '');
            
            let matches = false;

            // Primary search: demand number
            if (exactMatch) {
                matches = issueDemandNumber === term;
            } else {
                matches = issueDemandNumber.includes(term);
            }

            // Extended search: ticket ID (for Support issues)
            if (!matches && searchInTicketId && issue.ticketId) {
                const ticketId = caseSensitive 
                    ? issue.ticketId 
                    : issue.ticketId.toLowerCase();
                
                matches = exactMatch ? ticketId === term : ticketId.includes(term);
            }

            // Extended search: activity name
            if (!matches && searchInActivityName && issue.activityName) {
                const activityName = caseSensitive 
                    ? issue.activityName 
                    : issue.activityName.toLowerCase();
                
                matches = exactMatch ? activityName === term : activityName.includes(term);
            }

            return matches;
        });
    }

    /**
     * Enhanced demand number search with related demand lookup
     * @param {Array} issues - Array of Support issue objects or allocations
     * @param {string} demandNumber - Demand number to search for
     * @param {Object} options - Search options
     * @returns {Object} Search results with main matches and related demands
     */
    searchByDemandNumberEnhanced(issues, demandNumber, options = {}) {
        if (!Array.isArray(issues) || !demandNumber) {
            return {
                mainMatches: issues || [],
                relatedMatches: [],
                searchTerm: demandNumber,
                totalResults: (issues || []).length
            };
        }

        const searchTerm = demandNumber.toLowerCase().trim();
        if (!searchTerm) {
            return {
                mainMatches: issues,
                relatedMatches: [],
                searchTerm: demandNumber,
                totalResults: issues.length
            };
        }

        const {
            includeRelated = true,
            maxRelatedResults = 10,
            includeAllCategories = false
        } = options;

        // Get main matches (exact and partial)
        const exactMatches = this.searchByDemandNumber(issues, demandNumber, {
            ...options,
            exactMatch: true
        });

        const partialMatches = this.searchByDemandNumber(issues, demandNumber, {
            ...options,
            exactMatch: false
        }).filter(issue => !exactMatches.some(exact => exact.id === issue.id));

        const mainMatches = [...exactMatches, ...partialMatches];

        let relatedMatches = [];

        // Find related demands if enabled
        if (includeRelated && searchTerm.length >= 3) {
            // Extract potential demand number patterns
            const demandPatterns = this.extractDemandPatterns(searchTerm);
            
            relatedMatches = issues.filter(issue => {
                // Skip if already in main matches
                if (mainMatches.some(main => main.id === issue.id)) {
                    return false;
                }

                // Check category filter
                if (!includeAllCategories && issue.category !== 'Support') {
                    return false;
                }

                const issueDemandNumber = (issue.demandNumber || '').toLowerCase();
                
                // Look for related patterns
                return demandPatterns.some(pattern => {
                    return issueDemandNumber.includes(pattern) && 
                           issueDemandNumber !== searchTerm; // Exclude exact matches
                });
            }).slice(0, maxRelatedResults);
        }

        return {
            mainMatches,
            relatedMatches,
            searchTerm: demandNumber,
            totalResults: mainMatches.length + relatedMatches.length,
            hasExactMatch: exactMatches.length > 0,
            hasPartialMatch: partialMatches.length > 0,
            hasRelatedMatch: relatedMatches.length > 0
        };
    }

    /**
     * Extract demand number patterns for related search
     * @param {string} searchTerm - The search term
     * @returns {Array} Array of potential related patterns
     */
    extractDemandPatterns(searchTerm) {
        const patterns = [];
        
        // Add the original term (lowercased for consistency)
        patterns.push(searchTerm.toLowerCase());
        
        // Extract year patterns (e.g., "2024" from "DEM-2024-001")
        const yearMatch = searchTerm.match(/\b(20\d{2})\b/);
        if (yearMatch) {
            patterns.push(yearMatch[1]);
        }
        
        // Extract prefix patterns (e.g., "DEM" from "DEM-2024-001")
        const prefixMatch = searchTerm.match(/^([A-Z]+)/i);
        if (prefixMatch && prefixMatch[1].length >= 2) {
            patterns.push(prefixMatch[1].toLowerCase());
        }
        
        // Extract number sequences (e.g., "001" from "DEM-2024-001")
        const numberMatches = searchTerm.match(/\d{3,}/g);
        if (numberMatches) {
            patterns.push(...numberMatches);
        }
        
        return [...new Set(patterns)]; // Remove duplicates
    }

    /**
     * Calculate phase transition statistics for a set of allocations
     * @param {Array} allocations - Array of allocation objects
     * @returns {Object} Phase transition statistics
     */
    calculatePhaseTransitionStats(allocations) {
        if (!Array.isArray(allocations)) {
            return {
                totalAllocations: 0,
                phaseDistribution: {},
                averageSpanToCompletion: 0,
                completedCount: 0,
                inProgressCount: 0
            };
        }

        const phaseDistribution = {};
        let totalSpanDays = 0;
        let completedCount = 0;
        let inProgressCount = 0;

        allocations.forEach(allocation => {
            const phase = allocation.phase || 'Unknown';
            phaseDistribution[phase] = (phaseDistribution[phase] || 0) + 1;

            if (this.completionPhases.includes(phase)) {
                completedCount++;
            } else {
                inProgressCount++;
            }

            // Calculate span for completed tasks
            if (phase === 'Completed' && allocation.plan?.taskStart && allocation.plan?.taskEnd) {
                try {
                    const taskStart = parseISO(allocation.plan.taskStart);
                    const taskEnd = parseISO(allocation.plan.taskEnd);
                    if (isValid(taskStart) && isValid(taskEnd)) {
                        const actualSpanDays = Math.abs(differenceInDays(taskEnd, taskStart));
                        totalSpanDays += actualSpanDays;
                    }
                } catch (error) {
                    // Skip invalid dates
                }
            }
        });

        const completedTasksCount = allocations.filter(a => a.phase === 'Completed').length;

        return {
            totalAllocations: allocations.length,
            phaseDistribution,
            averageSpanToCompletion: completedTasksCount > 0 ? Math.round(totalSpanDays / completedTasksCount) : 0,
            completedCount,
            inProgressCount
        };
    }

    /**
     * Get quick filter options for dashboard date filtering
     * @returns {Array} Array of quick filter options
     */
    getQuickFilterOptions() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
        const endOfLastWeek = new Date(startOfWeek);
        endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);

        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        const startOfNextWeek = new Date(startOfWeek);
        startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
        const endOfNextWeek = new Date(startOfNextWeek);
        endOfNextWeek.setDate(endOfNextWeek.getDate() + 6);

        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

        return [
            {
                label: 'Today',
                value: 'today',
                start: today.toISOString().split('T')[0],
                end: today.toISOString().split('T')[0],
                icon: '📅',
                description: 'Tasks scheduled for today'
            },
            {
                label: 'This Week',
                value: 'this-week',
                start: startOfWeek.toISOString().split('T')[0],
                end: new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                icon: '📊',
                description: 'Current week tasks'
            },
            {
                label: 'This Month',
                value: 'this-month',
                start: startOfMonth.toISOString().split('T')[0],
                end: endOfMonth.toISOString().split('T')[0],
                icon: '📈',
                description: 'Current month tasks'
            },
            {
                label: 'Last Week',
                value: 'last-week',
                start: startOfLastWeek.toISOString().split('T')[0],
                end: endOfLastWeek.toISOString().split('T')[0],
                icon: '⏪',
                description: 'Previous week tasks'
            },
            {
                label: 'Last Month',
                value: 'last-month',
                start: startOfLastMonth.toISOString().split('T')[0],
                end: endOfLastMonth.toISOString().split('T')[0],
                icon: '📉',
                description: 'Previous month tasks'
            },
            {
                label: 'Next Week',
                value: 'next-week',
                start: startOfNextWeek.toISOString().split('T')[0],
                end: endOfNextWeek.toISOString().split('T')[0],
                icon: '⏩',
                description: 'Upcoming week tasks'
            },
            {
                label: 'Next Month',
                value: 'next-month',
                start: startOfNextMonth.toISOString().split('T')[0],
                end: endOfNextMonth.toISOString().split('T')[0],
                icon: '🔮',
                description: 'Upcoming month tasks'
            }
        ];
    }

    /**
     * Apply quick filter to date range
     * @param {string} filterValue - Quick filter value
     * @returns {Object} Date range object with start and end dates
     */
    applyQuickFilter(filterValue) {
        const quickFilters = this.getQuickFilterOptions();
        const filter = quickFilters.find(f => f.value === filterValue);
        
        if (!filter) {
            return { start: null, end: null };
        }

        return {
            start: filter.start,
            end: filter.end,
            label: filter.label,
            description: filter.description
        };
    }

    /**
     * Enhanced date filtering with better overlap detection
     * @param {Array} allocations - Array of allocation objects
     * @param {Object} dateRange - Date range with start and end properties
     * @param {Object} options - Additional filtering options
     * @returns {Array} Filtered allocations
     */
    filterByDateRangeEnhanced(allocations, dateRange, options = {}) {
        if (!Array.isArray(allocations) || !dateRange) {
            return allocations || [];
        }

        const { start, end } = dateRange;
        const { 
            includePartialOverlap = true, 
            strictDateMatch = false,
            includeNoEndDate = true 
        } = options;

        if (!start && !end) {
            return allocations;
        }

        try {
            const filterStart = start ? parseISO(start) : null;
            const filterEnd = end ? parseISO(end) : null;

            // Check for invalid dates
            if ((start && !isValid(filterStart)) || (end && !isValid(filterEnd))) {
                console.warn('Invalid date format in filter range');
                return allocations;
            }

            return allocations.filter(allocation => {
                const taskStart = allocation.plan?.taskStart;
                const taskEnd = allocation.plan?.taskEnd;

                if (!taskStart) return false;

                const allocationStart = parseISO(taskStart);
                const allocationEnd = taskEnd ? parseISO(taskEnd) : null;

                // Handle allocations without end dates
                if (!allocationEnd && !includeNoEndDate) {
                    return false;
                }

                // For allocations without end dates, use start date for comparison
                const effectiveEnd = allocationEnd || allocationStart;

                if (strictDateMatch) {
                    // Strict matching: allocation must be entirely within filter range
                    if (filterStart && filterEnd) {
                        return allocationStart >= filterStart && effectiveEnd <= filterEnd;
                    } else if (filterStart) {
                        return allocationStart >= filterStart;
                    } else if (filterEnd) {
                        return effectiveEnd <= filterEnd;
                    }
                } else {
                    // Overlap matching: any overlap between allocation and filter range
                    if (filterStart && filterEnd) {
                        return includePartialOverlap 
                            ? allocationStart <= filterEnd && effectiveEnd >= filterStart
                            : allocationStart >= filterStart && effectiveEnd <= filterEnd;
                    } else if (filterStart) {
                        return effectiveEnd >= filterStart;
                    } else if (filterEnd) {
                        return allocationStart <= filterEnd;
                    }
                }

                return true;
            });
        } catch (error) {
            console.warn('Enhanced date filtering error:', error);
            return allocations;
        }
    }

    /**
     * Get date range statistics for filtered allocations
     * @param {Array} allocations - Array of allocation objects
     * @param {Object} dateRange - Date range with start and end properties
     * @returns {Object} Statistics about the filtered date range
     */
    getDateRangeStats(allocations, dateRange) {
        const filtered = this.filterByDateRangeEnhanced(allocations, dateRange);
        
        const stats = {
            totalAllocations: filtered.length,
            totalCost: 0,
            totalEffortHours: 0,
            averageDuration: 0,
            phaseDistribution: {},
            complexityDistribution: {},
            categoryDistribution: {}
        };

        let totalDurationDays = 0;
        let durationsCount = 0;

        filtered.forEach(allocation => {
            // Cost calculation
            stats.totalCost += allocation.plan?.costProject || 0;
            
            // Effort hours
            stats.totalEffortHours += allocation.effort?.adjustedEffortHours || allocation.plan?.effortHours || 0;
            
            // Duration calculation
            if (allocation.plan?.taskStart && allocation.plan?.taskEnd) {
                try {
                    const start = parseISO(allocation.plan.taskStart);
                    const end = parseISO(allocation.plan.taskEnd);
                    if (isValid(start) && isValid(end)) {
                        const duration = Math.abs(differenceInDays(end, start));
                        totalDurationDays += duration;
                        durationsCount++;
                    }
                } catch (error) {
                    // Skip invalid dates
                }
            }
            
            // Phase distribution
            const phase = allocation.phase || 'Unknown';
            stats.phaseDistribution[phase] = (stats.phaseDistribution[phase] || 0) + 1;
            
            // Complexity distribution
            const complexity = allocation.complexity || 'Unknown';
            stats.complexityDistribution[complexity] = (stats.complexityDistribution[complexity] || 0) + 1;
            
            // Category distribution
            const category = allocation.category || 'Project';
            stats.categoryDistribution[category] = (stats.categoryDistribution[category] || 0) + 1;
        });

        stats.averageDuration = durationsCount > 0 ? Math.round(totalDurationDays / durationsCount) : 0;

        return stats;
    }
}

// Create default instance
export const dashboardEngine = new DashboardEngine();

// Export individual functions for convenience
export const calculatePhaseSpan = (allocation, completionPhase) => 
    dashboardEngine.calculatePhaseSpan(allocation, completionPhase);

export const filterByDateRange = (allocations, dateRange) => 
    dashboardEngine.filterByDateRange(allocations, dateRange);

export const searchByDemandNumber = (issues, demandNumber, options) => 
    dashboardEngine.searchByDemandNumber(issues, demandNumber, options);

export const searchByDemandNumberEnhanced = (issues, demandNumber, options) => 
    dashboardEngine.searchByDemandNumberEnhanced(issues, demandNumber, options);

export default dashboardEngine;