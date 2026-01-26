/**
 * Property-Based Tests for CostCenterManager
 * Tests budget enforcement correctness across all enforcement modes
 * 
 * Property 8: Budget Enforcement Correctness
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 */

import fc from 'fast-check';
import { 
    CostCenterManager, 
    BUDGET_ENFORCEMENT_MODES,
    BUDGET_VALIDATION_RESULT
} from './costCenterManager.js';

describe('CostCenterManager Property Tests', () => {
    
    /**
     * Property 8: Budget Enforcement Correctness
     * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
     * 
     * For any allocation request, the system should validate that projected spend 
     * (current spend + new allocation cost) does not exceed available budget, 
     * and enforcement behavior should match the configured mode (strict/warning/none).
     */
    describe('Property 8: Budget Enforcement Correctness', () => {
        
        test('should enforce budget limits correctly across all enforcement modes', () => {
            fc.assert(fc.property(
                // Generate test data
                fc.record({
                    // Cost center configuration (exclude zero budget)
                    monthlyBudget: fc.integer(1000000, 1000000000), // 1M to 1B IDR (no zero)
                    actualMonthlyCost: fc.integer(0, 500000000), // 0 to 500M IDR
                    enforcementMode: fc.constantFrom('strict', 'warning', 'none'),
                    overBudgetThreshold: fc.integer(0, 50), // 0% to 50% over-budget allowed
                    
                    // Existing allocations
                    existingAllocations: fc.array(
                        fc.record({
                            costMonthly: fc.integer(1000000, 50000000) // 1M to 50M IDR
                        }),
                        { minLength: 0, maxLength: 5 }
                    ),
                    
                    // New allocation request (positive costs only for main test)
                    newAllocationCost: fc.integer(1000000, 200000000) // 1M to 200M IDR
                }).filter(data => data.monthlyBudget > 0), // Explicitly filter out zero budget
                (data) => {
                    // Setup cost center
                    const costCenter = {
                        id: 'CC-TEST',
                        name: 'Test Cost Center',
                        monthlyBudget: data.monthlyBudget,
                        actualMonthlyCost: Math.min(data.actualMonthlyCost, data.monthlyBudget), // Ensure actual doesn't exceed budget
                        budgetEnforcement: data.enforcementMode,
                        overBudgetThreshold: data.overBudgetThreshold
                    };
                    
                    // Setup existing allocations
                    const allocations = data.existingAllocations.map((alloc, index) => ({
                        id: `ALLOC-${index}`,
                        costCenterId: 'CC-TEST',
                        plan: {
                            costMonthly: alloc.costMonthly
                        }
                    }));
                    
                    // Create manager
                    const manager = new CostCenterManager([costCenter], allocations);
                    
                    // Calculate expected values
                    const currentSpend = costCenter.actualMonthlyCost;
                    const pendingSpend = allocations.reduce((sum, alloc) => sum + alloc.plan.costMonthly, 0);
                    const projectedSpendBeforeAllocation = currentSpend + pendingSpend;
                    const projectedSpendAfterAllocation = projectedSpendBeforeAllocation + data.newAllocationCost;
                    const totalBudget = costCenter.monthlyBudget;
                    const maxAllowedSpend = totalBudget * (1 + costCenter.overBudgetThreshold / 100);
                    
                    // Validate budget capacity
                    const result = manager.validateBudgetCapacity('CC-TEST', data.newAllocationCost, 'monthly');
                    
                    // Property assertions based on enforcement mode
                    switch (data.enforcementMode) {
                        case BUDGET_ENFORCEMENT_MODES.STRICT:
                            if (projectedSpendAfterAllocation > totalBudget && totalBudget > 0) {
                                // Requirement 5.2: WHEN an allocation would exceed the cost center's available budget, 
                                // THE System SHALL prevent the allocation
                                return result.result === BUDGET_VALIDATION_RESULT.REJECTED &&
                                       result.message.includes('exceed') &&
                                       result.details.newProjectedSpend === projectedSpendAfterAllocation;
                            } else {
                                // Requirement 5.1: THE System SHALL validate budget capacity before creating new allocations
                                // Special case: zero budget with negative cost should be approved (improves situation)
                                // Special case: zero budget with positive cost should be rejected
                                if (totalBudget === 0 && data.newAllocationCost > 0) {
                                    return result.result === BUDGET_VALIDATION_RESULT.REJECTED;
                                }
                                return result.result === BUDGET_VALIDATION_RESULT.APPROVED;
                            }
                            
                        case BUDGET_ENFORCEMENT_MODES.WARNING:
                            if (projectedSpendAfterAllocation > maxAllowedSpend && totalBudget > 0) {
                                // Should warn when exceeding threshold
                                return result.result === BUDGET_VALIDATION_RESULT.WARNING &&
                                       result.message.includes('warning');
                            } else if (projectedSpendAfterAllocation > totalBudget && totalBudget > 0) {
                                // Should warn when exceeding budget but within threshold
                                return result.result === BUDGET_VALIDATION_RESULT.WARNING &&
                                       result.message.includes('warning');
                            } else {
                                // Should approve when within budget or zero budget case
                                return result.result === BUDGET_VALIDATION_RESULT.APPROVED;
                            }
                            
                        case BUDGET_ENFORCEMENT_MODES.NONE:
                            // Requirement 5.3: THE System SHALL provide configurable budget enforcement modes
                            // In 'none' mode, all allocations should be approved regardless of budget
                            return result.result === BUDGET_VALIDATION_RESULT.APPROVED;
                            
                        default:
                            return false; // Unknown enforcement mode
                    }
                }
            ), { numRuns: 100 });
        });
        
        test('should calculate projected spend correctly including new allocation', () => {
            fc.assert(fc.property(
                fc.record({
                    monthlyBudget: fc.integer(10000000, 500000000), // 10M to 500M IDR
                    actualMonthlyCost: fc.integer(0, 100000000), // 0 to 100M IDR
                    existingAllocations: fc.array(
                        fc.integer(1000000, 20000000), // 1M to 20M IDR per allocation
                        { minLength: 0, maxLength: 10 }
                    ),
                    newAllocationCost: fc.integer(1000000, 100000000) // 1M to 100M IDR
                }),
                (data) => {
                    // Setup test data
                    const costCenter = {
                        id: 'CC-PROJ-TEST',
                        name: 'Projection Test Center',
                        monthlyBudget: data.monthlyBudget,
                        actualMonthlyCost: data.actualMonthlyCost,
                        budgetEnforcement: 'warning'
                    };
                    
                    const allocations = data.existingAllocations.map((cost, index) => ({
                        id: `ALLOC-PROJ-${index}`,
                        costCenterId: 'CC-PROJ-TEST',
                        plan: { costMonthly: cost }
                    }));
                    
                    const manager = new CostCenterManager([costCenter], allocations);
                    
                    // Test projected spend calculation
                    const result = manager.validateBudgetCapacity('CC-PROJ-TEST', data.newAllocationCost, 'monthly');
                    
                    // Requirement 5.4: THE System SHALL calculate projected spend including the new allocation 
                    // against remaining budget
                    const expectedCurrentSpend = data.actualMonthlyCost;
                    const expectedPendingSpend = data.existingAllocations.reduce((sum, cost) => sum + cost, 0);
                    const expectedProjectedSpend = expectedCurrentSpend + expectedPendingSpend + data.newAllocationCost;
                    
                    return result.details.currentProjectedSpend === (expectedCurrentSpend + expectedPendingSpend) &&
                           result.details.newProjectedSpend === expectedProjectedSpend &&
                           result.details.allocationCost === data.newAllocationCost &&
                           result.details.totalBudget === data.monthlyBudget;
                }
            ), { numRuns: 100 });
        });
        
        test('should handle edge cases in budget enforcement', () => {
            fc.assert(fc.property(
                fc.record({
                    monthlyBudget: fc.integer(0, 1000000000), // Include zero budget
                    actualMonthlyCost: fc.integer(0, 100000000),
                    enforcementMode: fc.constantFrom('strict', 'warning', 'none'),
                    newAllocationCost: fc.integer(-50000000, 200000000), // Include negative costs (refunds)
                    overBudgetThreshold: fc.integer(0, 100)
                }),
                (data) => {
                    const costCenter = {
                        id: 'CC-EDGE-TEST',
                        name: 'Edge Case Test Center',
                        monthlyBudget: data.monthlyBudget,
                        actualMonthlyCost: Math.min(data.actualMonthlyCost, data.monthlyBudget * 2), // Allow some over-spend
                        budgetEnforcement: data.enforcementMode,
                        overBudgetThreshold: data.overBudgetThreshold
                    };
                    
                    const manager = new CostCenterManager([costCenter], []);
                    const result = manager.validateBudgetCapacity('CC-EDGE-TEST', data.newAllocationCost, 'monthly');
                    
                    // Basic invariants that should always hold
                    const invariants = [
                        // Result should always be one of the valid types
                        Object.values(BUDGET_VALIDATION_RESULT).includes(result.result),
                        
                        // Details should contain required fields
                        result.details.costCenterId === 'CC-EDGE-TEST',
                        result.details.allocationCost === data.newAllocationCost,
                        result.details.totalBudget === data.monthlyBudget,
                        typeof result.details.newProjectedSpend === 'number',
                        typeof result.details.utilizationAfterAllocation === 'number',
                        
                        // Message should be a non-empty string
                        typeof result.message === 'string' && result.message.length > 0
                    ];
                    
                    // Special case: zero budget with positive allocation cost should be rejected in strict mode
                    if (data.monthlyBudget === 0 && data.newAllocationCost > 0 && data.enforcementMode === 'strict') {
                        invariants.push(result.result === BUDGET_VALIDATION_RESULT.REJECTED);
                    }
                    
                    // Special case: negative allocation cost (refund) should generally improve budget situation
                    if (data.newAllocationCost < 0) {
                        // Negative costs should improve budget situation
                        invariants.push(result.details.newProjectedSpend <= result.details.currentProjectedSpend);
                        
                        // For zero budget with negative cost, the result depends on enforcement mode
                        if (data.monthlyBudget === 0) {
                            // With zero budget and negative cost, we're improving the situation
                            // This should be approved in all modes since it reduces spend
                            invariants.push(result.result === BUDGET_VALIDATION_RESULT.APPROVED);
                        }
                    }
                    
                    return invariants.every(Boolean);
                }
            ), { numRuns: 100 });
        });
        
        test('should maintain consistency between budget status and validation results', () => {
            fc.assert(fc.property(
                fc.record({
                    monthlyBudget: fc.integer(1000000, 200000000), // 1M to 200M IDR (exclude zero)
                    actualMonthlyCost: fc.integer(0, 50000000), // 0 to 50M IDR
                    enforcementMode: fc.constantFrom('strict', 'warning', 'none'),
                    allocations: fc.array(
                        fc.integer(1000000, 10000000), // 1M to 10M IDR per allocation
                        { minLength: 0, maxLength: 5 }
                    )
                }).filter(data => data.monthlyBudget > 0), // Explicitly filter out zero budget
                (data) => {
                    const costCenter = {
                        id: 'CC-CONSISTENCY-TEST',
                        name: 'Consistency Test Center',
                        monthlyBudget: data.monthlyBudget,
                        actualMonthlyCost: data.actualMonthlyCost,
                        budgetEnforcement: data.enforcementMode
                    };
                    
                    const allocations = data.allocations.map((cost, index) => ({
                        id: `ALLOC-CONS-${index}`,
                        costCenterId: 'CC-CONSISTENCY-TEST',
                        plan: { costMonthly: cost }
                    }));
                    
                    const manager = new CostCenterManager([costCenter], allocations);
                    
                    // Get budget status
                    const budgetStatus = manager.getBudgetStatus('CC-CONSISTENCY-TEST');
                    
                    // Get utilization
                    const utilization = manager.getBudgetUtilization('CC-CONSISTENCY-TEST', 'monthly');
                    
                    // Get available budget
                    const availableBudget = manager.getAvailableBudget('CC-CONSISTENCY-TEST', 'monthly');
                    
                    // Consistency checks
                    const consistencyChecks = [
                        // Budget status should be found
                        budgetStatus.found === true,
                        
                        // Utilization should match between methods
                        Math.abs(budgetStatus.monthly.utilization - utilization) < 0.01,
                        
                        // Available budget should be consistent
                        budgetStatus.monthly.availableBudget === availableBudget,
                        
                        // Over-budget flag should be consistent with utilization
                        budgetStatus.monthly.isOverBudget === (utilization > 100),
                        
                        // Status text should match utilization level
                        // Special case: zero budget has special handling in the implementation
                        (data.monthlyBudget === 0) ? true : // Skip status check for zero budget
                        (utilization >= 100 && budgetStatus.monthly.status === 'Over Budget') ||
                        (utilization >= 90 && utilization < 100 && budgetStatus.monthly.status === 'Critical') ||
                        (utilization >= 75 && utilization < 90 && budgetStatus.monthly.status === 'High') ||
                        (utilization >= 40 && utilization < 75 && budgetStatus.monthly.status === 'Moderate') ||
                        (utilization < 40 && budgetStatus.monthly.status === 'Low')
                    ];
                    
                    return consistencyChecks.every(Boolean);
                }
            ), { numRuns: 100 });
        });
        
        test('should handle multiple cost centers independently', () => {
            fc.assert(fc.property(
                fc.array(
                    fc.record({
                        id: fc.string({ minLength: 5, maxLength: 10 }),
                        monthlyBudget: fc.integer(10000000, 100000000), // 10M to 100M IDR
                        actualMonthlyCost: fc.integer(0, 30000000), // 0 to 30M IDR
                        enforcementMode: fc.constantFrom('strict', 'warning', 'none'),
                        allocationCost: fc.integer(1000000, 50000000) // 1M to 50M IDR
                    }),
                    { minLength: 2, maxLength: 5 }
                ),
                (costCenterData) => {
                    // Ensure unique IDs
                    const uniqueData = costCenterData.map((data, index) => ({
                        ...data,
                        id: `CC-MULTI-${index}`
                    }));
                    
                    // Setup cost centers
                    const costCenters = uniqueData.map(data => ({
                        id: data.id,
                        name: `Test Center ${data.id}`,
                        monthlyBudget: data.monthlyBudget,
                        actualMonthlyCost: data.actualMonthlyCost,
                        budgetEnforcement: data.enforcementMode
                    }));
                    
                    const manager = new CostCenterManager(costCenters, []);
                    
                    // Test each cost center independently
                    const results = uniqueData.map(data => {
                        const result = manager.validateBudgetCapacity(data.id, data.allocationCost, 'monthly');
                        
                        // Calculate expected behavior for this specific cost center
                        const projectedSpend = data.actualMonthlyCost + data.allocationCost;
                        const exceedsBudget = projectedSpend > data.monthlyBudget;
                        
                        let expectedResult;
                        switch (data.enforcementMode) {
                            case 'strict':
                                expectedResult = exceedsBudget ? BUDGET_VALIDATION_RESULT.REJECTED : BUDGET_VALIDATION_RESULT.APPROVED;
                                break;
                            case 'warning':
                                expectedResult = exceedsBudget ? BUDGET_VALIDATION_RESULT.WARNING : BUDGET_VALIDATION_RESULT.APPROVED;
                                break;
                            case 'none':
                                expectedResult = BUDGET_VALIDATION_RESULT.APPROVED;
                                break;
                        }
                        
                        return {
                            costCenterId: data.id,
                            actualResult: result.result,
                            expectedResult,
                            matches: result.result === expectedResult,
                            details: result.details
                        };
                    });
                    
                    // All cost centers should be validated independently and correctly
                    return results.every(r => r.matches && r.details.costCenterId === r.costCenterId);
                }
            ), { numRuns: 50 }); // Reduced runs due to complexity
        });
    });
});