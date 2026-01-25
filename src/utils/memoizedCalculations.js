/**
 * Memoized Calculation Utilities
 * Performance-optimized versions of expensive calculations with caching
 */

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
    aggregateCostsByCostCenter,
    getCostCenterUtilization,
    getProjectCostCenterBreakdown,
    calculateMonthlyTrend,
    getMemberWorkloads,
    getMemberTaskAvailability
} from './calculations';

// Simple memoization cache
const memoCache = new Map();

/**
 * Create a cache key from arguments
 */
function createCacheKey(functionName, args) {
    return `${functionName}:${JSON.stringify(args)}`;
}

/**
 * Generic memoization wrapper
 */
function memoize(fn, keyGenerator) {
    return function(...args) {
        const key = keyGenerator ? keyGenerator(...args) : createCacheKey(fn.name, args);
        
        if (memoCache.has(key)) {
            return memoCache.get(key);
        }
        
        const result = fn.apply(this, args);
        memoCache.set(key, result);
        
        // Limit cache size to prevent memory leaks
        if (memoCache.size > 1000) {
            const firstKey = memoCache.keys().next().value;
            memoCache.delete(firstKey);
        }
        
        return result;
    };
}

/**
 * Clear memoization cache
 */
export function clearMemoCache() {
    memoCache.clear();
}

/**
 * Clear cache entries for specific function
 */
export function clearMemoForFunction(functionName) {
    for (const key of memoCache.keys()) {
        if (key.startsWith(`${functionName}:`)) {
            memoCache.delete(key);
        }
    }
}

// Memoized calculation functions
export const memoizedAggregateCostsByCostCenter = memoize(
    aggregateCostsByCostCenter,
    (allocations, costCenters) => `aggregateCosts:${allocations.length}:${costCenters.length}:${JSON.stringify(allocations.map(a => a.id + a.updatedAt).sort())}`
);

export const memoizedGetCostCenterUtilization = memoize(
    getCostCenterUtilization,
    (allocations, teamMembers, costCenters) => `utilization:${allocations.length}:${teamMembers.length}:${costCenters.length}:${Date.now() - (Date.now() % 60000)}` // Cache for 1 minute
);

export const memoizedGetProjectCostCenterBreakdown = memoize(
    getProjectCostCenterBreakdown,
    (allocations, projectId, costCenters) => `breakdown:${projectId}:${allocations.length}:${costCenters.length}`
);

export const memoizedCalculateMonthlyTrend = memoize(
    calculateMonthlyTrend,
    (allocations) => `trend:${allocations.length}:${JSON.stringify(allocations.map(a => a.id + (a.plan?.taskStart || '') + (a.plan?.taskEnd || '')).sort())}`
);

export const memoizedGetMemberWorkloads = memoize(
    getMemberWorkloads,
    (allocations, teamMembers) => `workloads:${allocations.length}:${teamMembers.length}:${JSON.stringify(teamMembers.map(m => m.id + m.updatedAt).sort())}`
);

export const memoizedGetMemberTaskAvailability = memoize(
    getMemberTaskAvailability,
    (allocations, teamMembers, maxTasks) => `availability:${allocations.length}:${teamMembers.length}:${maxTasks}`
);

/**
 * React hook for memoized cost center metrics
 */
export function useMemoizedCostCenterMetrics(state) {
    return useMemo(() => {
        const activeCostCenters = state.costCenters.filter(cc => cc.isActive);
        
        // Use memoized calculations
        const utilizationData = memoizedGetCostCenterUtilization(
            state.allocations, 
            state.members, 
            activeCostCenters
        );
        
        const costAggregation = memoizedAggregateCostsByCostCenter(
            state.allocations, 
            activeCostCenters
        );
        
        const memberWorkloads = memoizedGetMemberWorkloads(
            state.allocations,
            state.members
        );
        
        const monthlyTrend = memoizedCalculateMonthlyTrend(state.allocations);
        
        // Calculate derived metrics
        const totalAssignedMembers = state.members.filter(m => m.costCenterId).length;
        const unassignedMembers = state.members.filter(m => !m.costCenterId).length;
        const averageUtilization = utilizationData.length > 0 
            ? utilizationData.reduce((sum, item) => sum + item.utilizationRate, 0) / utilizationData.length 
            : 0;
        
        const totalProjectCosts = utilizationData.reduce((sum, item) => sum + item.totalProjectCost, 0);
        const totalMonthlyCosts = utilizationData.reduce((sum, item) => sum + item.totalMonthlyCost, 0);
        
        return {
            totalCostCenters: state.costCenters.length,
            activeCostCenters: activeCostCenters.length,
            totalAssignedMembers,
            unassignedMembers,
            utilizationData,
            costAggregation,
            memberWorkloads,
            monthlyTrend,
            averageUtilization,
            totalProjectCosts,
            totalMonthlyCosts
        };
    }, [
        state.costCenters.length,
        state.members.length,
        state.allocations.length,
        // Include timestamps to detect changes
        state.costCenters.map(cc => cc.updatedAt).join(','),
        state.members.map(m => m.updatedAt || m.id).join(','),
        state.allocations.map(a => a.updatedAt || a.id).join(',')
    ]);
}

/**
 * React hook for memoized filtered data
 */
export function useMemoizedFilteredData(data, filters, searchTerm) {
    return useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];
        
        let filtered = [...data];
        
        // Apply search filter
        if (searchTerm && searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(item => {
                // Generic search across common fields
                const searchableFields = [
                    item.name, item.code, item.manager, item.description,
                    item.category, item.status
                ].filter(Boolean);
                
                return searchableFields.some(field => 
                    field.toString().toLowerCase().includes(search)
                );
            });
        }
        
        // Apply category/status filters
        if (filters && typeof filters === 'object') {
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    filtered = filtered.filter(item => item[key] === value);
                }
            });
        }
        
        return filtered;
    }, [data, filters, searchTerm]);
}

/**
 * React hook for memoized table data with sorting
 */
export function useMemoizedTableData(data, sorting) {
    return useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];
        
        let sorted = [...data];
        
        if (sorting && Array.isArray(sorting) && sorting.length > 0) {
            const { id, desc } = sorting[0];
            
            sorted.sort((a, b) => {
                const aVal = a[id];
                const bVal = b[id];
                
                // Handle null/undefined values
                if (aVal == null && bVal == null) return 0;
                if (aVal == null) return desc ? 1 : -1;
                if (bVal == null) return desc ? -1 : 1;
                
                // Handle different data types
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return desc 
                        ? bVal.localeCompare(aVal)
                        : aVal.localeCompare(bVal);
                }
                
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return desc ? bVal - aVal : aVal - bVal;
                }
                
                if (aVal instanceof Date && bVal instanceof Date) {
                    return desc ? bVal - aVal : aVal - bVal;
                }
                
                // Fallback to string comparison
                return desc 
                    ? String(bVal).localeCompare(String(aVal))
                    : String(aVal).localeCompare(String(bVal));
            });
        }
        
        return sorted;
    }, [data, sorting]);
}

/**
 * React hook for debounced search
 */
export function useDebouncedSearch(searchTerm, delay = 300) {
    const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, delay);
        
        return () => clearTimeout(timer);
    }, [searchTerm, delay]);
    
    return debouncedTerm;
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName) {
    const renderCount = useRef(0);
    const startTime = useRef(Date.now());
    
    useEffect(() => {
        renderCount.current += 1;
        const renderTime = Date.now() - startTime.current;
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`${componentName} render #${renderCount.current} took ${renderTime}ms`);
        }
        
        startTime.current = Date.now();
    });
    
    return {
        renderCount: renderCount.current,
        componentName
    };
}