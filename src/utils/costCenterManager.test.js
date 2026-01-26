/**
 * Unit Tests for CostCenterManager
 * Tests budget capacity validation and enforcement functionality
 */

import { 
    CostCenterManager, 
    createCostCenterManager, 
    validateAllocationBudget,
    BUDGET_ENFORCEMENT_MODES,
    BUDGET_VALIDATION_RESULT
} from './costCenterManager.js';

describe('CostCenterManager', () => {
    let costCenters;
    let allocations;
    let manager;

    beforeEach(() => {
        // Sample cost centers with different enforcement modes
        costCenters = [
            {
                id: 'CC-001',
                code: 'ENG',
                name: 'Engineering',
                monthlyBudget: 100000000, // 100M IDR
                yearlyBudget: 1200000000, // 1.2B IDR
                actualMonthlyCost: 30000000, // 30M IDR
                actualYearlyCost: 360000000, // 360M IDR
                budgetEnforcement: 'strict',
                overBudgetThreshold: 0 // No over-budget allowed
            },
            {
                id: 'CC-002',
                code: 'PROD',
                name: 'Product Management',
                monthlyBudget: 50000000, // 50M IDR
                yearlyBudget: 600000000, // 600M IDR
                actualMonthlyCost: 40000000, // 40M IDR
                actualYearlyCost: 480000000, // 480M IDR
                budgetEnforcement: 'warning',
                overBudgetThreshold: 10 // 10% over-budget allowed
            },
            {
                id: 'CC-003',
                code: 'QA',
                name: 'Quality Assurance',
                monthlyBudget: 75000000, // 75M IDR
                yearlyBudget: 900000000, // 900M IDR
                actualMonthlyCost: 25000000, // 25M IDR
                actualYearlyCost: 300000000, // 300M IDR
                budgetEnforcement: 'none'
            }
        ];

        // Sample allocations
        allocations = [
            {
                id: 'ALLOC-001',
                costCenterId: 'CC-001',
                plan: {
                    costMonthly: 10000000, // 10M IDR monthly
                    costProject: 120000000 // 120M IDR total
                }
            },
            {
                id: 'ALLOC-002',
                costCenterId: 'CC-002',
                plan: {
                    costMonthly: 5000000, // 5M IDR monthly
                    costProject: 60000000 // 60M IDR total
                }
            }
        ];

        manager = new CostCenterManager(costCenters, allocations);
    });

    describe('Constructor and Basic Operations', () => {
        test('should create manager with cost centers and allocations', () => {
            expect(manager.costCenters).toEqual(costCenters);
            expect(manager.allocations).toEqual(allocations);
        });

        test('should create manager with empty arrays', () => {
            const emptyManager = new CostCenterManager();
            expect(emptyManager.costCenters).toEqual([]);
            expect(emptyManager.allocations).toEqual([]);
        });

        test('should update cost centers', () => {
            const newCostCenters = [{ id: 'CC-NEW', name: 'New Center' }];
            manager.updateCostCenters(newCostCenters);
            expect(manager.costCenters).toEqual(newCostCenters);
        });

        test('should update allocations', () => {
            const newAllocations = [{ id: 'ALLOC-NEW', costCenterId: 'CC-001' }];
            manager.updateAllocations(newAllocations);
            expect(manager.allocations).toEqual(newAllocations);
        });
    });

    describe('Cost Center Lookup', () => {
        test('should find cost center by ID', () => {
            const costCenter = manager.getCostCenter('CC-001');
            expect(costCenter).toEqual(costCenters[0]);
        });

        test('should return null for non-existent cost center', () => {
            const costCenter = manager.getCostCenter('CC-NONEXISTENT');
            expect(costCenter).toBeNull();
        });
    });

    describe('Current Spend Calculation', () => {
        test('should calculate monthly current spend', () => {
            const monthlySpend = manager.calculateCurrentSpend('CC-001', 'monthly');
            expect(monthlySpend).toBe(30000000);
        });

        test('should calculate yearly current spend', () => {
            const yearlySpend = manager.calculateCurrentSpend('CC-001', 'yearly');
            expect(yearlySpend).toBe(360000000);
        });

        test('should return 0 for non-existent cost center', () => {
            const spend = manager.calculateCurrentSpend('CC-NONEXISTENT', 'monthly');
            expect(spend).toBe(0);
        });
    });

    describe('Pending Allocations Cost Calculation', () => {
        test('should calculate pending monthly cost for cost center', () => {
            const pendingCost = manager.calculatePendingAllocationsCost('CC-001', 'monthly');
            expect(pendingCost).toBe(10000000); // From ALLOC-001
        });

        test('should calculate pending yearly cost for cost center', () => {
            const pendingCost = manager.calculatePendingAllocationsCost('CC-001', 'yearly');
            expect(pendingCost).toBe(120000000); // From ALLOC-001
        });

        test('should return 0 for cost center with no allocations', () => {
            const pendingCost = manager.calculatePendingAllocationsCost('CC-003', 'monthly');
            expect(pendingCost).toBe(0);
        });
    });

    describe('Projected Spend Calculation', () => {
        test('should calculate projected spend including current and pending', () => {
            const projectedSpend = manager.calculateProjectedSpend('CC-001', 0, 'monthly');
            expect(projectedSpend).toBe(40000000); // 30M current + 10M pending
        });

        test('should include additional cost in projection', () => {
            const projectedSpend = manager.calculateProjectedSpend('CC-001', 5000000, 'monthly');
            expect(projectedSpend).toBe(45000000); // 30M current + 10M pending + 5M additional
        });
    });

    describe('Available Budget Calculation', () => {
        test('should calculate available monthly budget', () => {
            const availableBudget = manager.getAvailableBudget('CC-001', 'monthly');
            expect(availableBudget).toBe(60000000); // 100M budget - 40M projected
        });

        test('should return 0 when over budget', () => {
            // CC-002 has 50M budget, 40M current + 5M pending = 45M projected
            const availableBudget = manager.getAvailableBudget('CC-002', 'monthly');
            expect(availableBudget).toBe(5000000); // 50M - 45M = 5M
        });

        test('should return 0 for non-existent cost center', () => {
            const availableBudget = manager.getAvailableBudget('CC-NONEXISTENT', 'monthly');
            expect(availableBudget).toBe(0);
        });
    });

    describe('Budget Utilization Calculation', () => {
        test('should calculate budget utilization percentage', () => {
            const utilization = manager.getBudgetUtilization('CC-001', 'monthly');
            expect(utilization).toBe(40); // 40M projected / 100M budget = 40%
        });

        test('should handle over 100% utilization', () => {
            // Add more allocations to push over budget
            manager.allocations.push({
                id: 'ALLOC-003',
                costCenterId: 'CC-002',
                plan: { costMonthly: 20000000 } // This will push CC-002 over budget
            });
            
            const utilization = manager.getBudgetUtilization('CC-002', 'monthly');
            expect(utilization).toBe(130); // (40M + 5M + 20M) / 50M = 130%
        });

        test('should return 0 for zero budget', () => {
            costCenters[0].monthlyBudget = 0;
            manager.updateCostCenters(costCenters);
            
            const utilization = manager.getBudgetUtilization('CC-001', 'monthly');
            expect(utilization).toBe(0);
        });
    });

    describe('Budget Enforcement Mode', () => {
        test('should return configured enforcement mode', () => {
            expect(manager.getBudgetEnforcementMode('CC-001')).toBe('strict');
            expect(manager.getBudgetEnforcementMode('CC-002')).toBe('warning');
            expect(manager.getBudgetEnforcementMode('CC-003')).toBe('none');
        });

        test('should default to warning mode when not specified', () => {
            delete costCenters[0].budgetEnforcement;
            manager.updateCostCenters(costCenters);
            
            expect(manager.getBudgetEnforcementMode('CC-001')).toBe('warning');
        });

        test('should return none for non-existent cost center', () => {
            expect(manager.getBudgetEnforcementMode('CC-NONEXISTENT')).toBe('none');
        });
    });

    describe('Budget Capacity Validation', () => {
        test('should approve allocation within budget (strict mode)', () => {
            const result = manager.validateBudgetCapacity('CC-001', 20000000, 'monthly');
            
            expect(result.result).toBe(BUDGET_VALIDATION_RESULT.APPROVED);
            expect(result.message).toContain('Budget validation passed');
            expect(result.details.costCenterId).toBe('CC-001');
            expect(result.details.allocationCost).toBe(20000000);
            expect(result.details.availableBudget).toBe(60000000); // 100M budget - 40M projected = 60M available
        });

        test('should reject allocation exceeding budget (strict mode)', () => {
            const result = manager.validateBudgetCapacity('CC-001', 80000000, 'monthly');
            
            expect(result.result).toBe(BUDGET_VALIDATION_RESULT.REJECTED);
            expect(result.message).toContain('Allocation rejected');
            expect(result.message).toContain('exceed monthly budget');
            expect(result.details.newProjectedSpend).toBe(120000000); // 40M + 80M
        });

        test('should warn for allocation exceeding budget (warning mode)', () => {
            const result = manager.validateBudgetCapacity('CC-002', 20000000, 'monthly');
            
            expect(result.result).toBe(BUDGET_VALIDATION_RESULT.WARNING);
            expect(result.message).toContain('Budget warning');
            expect(result.details.utilizationAfterAllocation).toBe(130); // (45M + 20M) / 50M
        });

        test('should approve allocation exceeding budget (none mode)', () => {
            const result = manager.validateBudgetCapacity('CC-003', 100000000, 'monthly');
            
            expect(result.result).toBe(BUDGET_VALIDATION_RESULT.APPROVED);
            expect(result.message).toContain('Budget validation passed');
        });

        test('should handle over-budget threshold in warning mode', () => {
            // CC-002 has 10% over-budget threshold
            const result = manager.validateBudgetCapacity('CC-002', 8000000, 'monthly');
            
            // 45M current + 8M new = 53M, which is 106% of 50M budget
            // This is within the 10% threshold (55M max), so should be approved
            expect(result.result).toBe(BUDGET_VALIDATION_RESULT.WARNING);
            expect(result.message).toContain('exceed monthly budget');
        });

        test('should reject non-existent cost center', () => {
            const result = manager.validateBudgetCapacity('CC-NONEXISTENT', 10000000, 'monthly');
            
            expect(result.result).toBe(BUDGET_VALIDATION_RESULT.REJECTED);
            expect(result.message).toBe('Cost center not found');
        });

        test('should validate yearly budget', () => {
            const result = manager.validateBudgetCapacity('CC-001', 200000000, 'yearly');
            
            expect(result.result).toBe(BUDGET_VALIDATION_RESULT.APPROVED);
            expect(result.details.period).toBe('yearly');
            expect(result.details.totalBudget).toBe(1200000000);
        });
    });

    describe('Budget Status', () => {
        test('should get comprehensive budget status', () => {
            const status = manager.getBudgetStatus('CC-001');
            
            expect(status.found).toBe(true);
            expect(status.costCenterId).toBe('CC-001');
            expect(status.costCenterName).toBe('Engineering');
            expect(status.enforcementMode).toBe('strict');
            expect(status.monthly).toBeDefined();
            expect(status.yearly).toBeDefined();
            expect(status.monthly.utilization).toBe(40);
            expect(status.monthly.status).toBe('Moderate');
        });

        test('should handle non-existent cost center', () => {
            const status = manager.getBudgetStatus('CC-NONEXISTENT');
            
            expect(status.found).toBe(false);
            expect(status.message).toBe('Cost center not found');
        });

        test('should categorize budget status correctly', () => {
            expect(manager.getBudgetStatusText(25)).toBe('Low');
            expect(manager.getBudgetStatusText(50)).toBe('Moderate');
            expect(manager.getBudgetStatusText(80)).toBe('High');
            expect(manager.getBudgetStatusText(95)).toBe('Critical');
            expect(manager.getBudgetStatusText(110)).toBe('Over Budget');
        });
    });

    describe('Multiple Allocations Validation', () => {
        test('should validate multiple allocation requests', () => {
            const requests = [
                { costCenterId: 'CC-001', allocationCost: 10000000, period: 'monthly' },
                { costCenterId: 'CC-002', allocationCost: 20000000, period: 'monthly' },
                { costCenterId: 'CC-003', allocationCost: 50000000, period: 'monthly' }
            ];
            
            const results = manager.validateMultipleAllocations(requests);
            
            expect(results).toHaveLength(3);
            expect(results[0].validation.result).toBe(BUDGET_VALIDATION_RESULT.APPROVED);
            expect(results[1].validation.result).toBe(BUDGET_VALIDATION_RESULT.WARNING);
            expect(results[2].validation.result).toBe(BUDGET_VALIDATION_RESULT.APPROVED);
        });
    });

    describe('Utility Functions', () => {
        test('should check sufficient budget', () => {
            expect(manager.hasSufficientBudget('CC-001', 20000000, 'monthly')).toBe(true);
            expect(manager.hasSufficientBudget('CC-001', 80000000, 'monthly')).toBe(false);
        });

        test('should get over-budget cost centers', () => {
            // Add allocation to push CC-002 over budget
            manager.allocations.push({
                id: 'ALLOC-OVER',
                costCenterId: 'CC-002',
                plan: { costMonthly: 20000000 }
            });
            
            const overBudget = manager.getOverBudgetCostCenters('monthly');
            
            expect(overBudget).toHaveLength(1);
            expect(overBudget[0].id).toBe('CC-002');
            expect(overBudget[0].utilization).toBe(130);
            expect(overBudget[0].overageAmount).toBe(15000000); // 65M - 50M
        });

        test('should get all budget summaries', () => {
            const summaries = manager.getAllBudgetSummaries();
            
            expect(summaries).toHaveLength(3);
            expect(summaries[0].costCenterId).toBe('CC-001');
            expect(summaries[1].costCenterId).toBe('CC-002');
            expect(summaries[2].costCenterId).toBe('CC-003');
        });

        test('should format currency correctly', () => {
            const formatted = manager.formatCurrency(100000000);
            expect(formatted).toContain('100.000.000');
            expect(formatted).toContain('Rp'); // Indonesian Rupiah uses "Rp" symbol
        });
    });

    describe('Factory Functions', () => {
        test('should create manager using factory function', () => {
            const newManager = createCostCenterManager(costCenters, allocations);
            
            expect(newManager).toBeInstanceOf(CostCenterManager);
            expect(newManager.costCenters).toEqual(costCenters);
            expect(newManager.allocations).toEqual(allocations);
        });

        test('should validate allocation using convenience function', () => {
            const result = validateAllocationBudget('CC-001', 20000000, costCenters, allocations, 'monthly');
            
            expect(result.result).toBe(BUDGET_VALIDATION_RESULT.APPROVED);
            expect(result.details.costCenterId).toBe('CC-001');
        });
    });

    describe('Edge Cases', () => {
        test('should handle allocations with costCenterSnapshot', () => {
            const allocationWithSnapshot = {
                id: 'ALLOC-SNAPSHOT',
                costCenterSnapshot: { id: 'CC-001' },
                plan: { costMonthly: 5000000 }
            };
            
            manager.allocations.push(allocationWithSnapshot);
            
            const pendingCost = manager.calculatePendingAllocationsCost('CC-001', 'monthly');
            expect(pendingCost).toBe(15000000); // 10M + 5M
        });

        test('should handle allocations without plan data', () => {
            const allocationWithoutPlan = {
                id: 'ALLOC-NO-PLAN',
                costCenterId: 'CC-001'
                // No plan property
            };
            
            manager.allocations.push(allocationWithoutPlan);
            
            const pendingCost = manager.calculatePendingAllocationsCost('CC-001', 'monthly');
            expect(pendingCost).toBe(10000000); // Only original allocation
        });

        test('should handle zero budget cost center', () => {
            costCenters[0].monthlyBudget = 0;
            manager.updateCostCenters(costCenters);
            
            const result = manager.validateBudgetCapacity('CC-001', 10000000, 'monthly');
            expect(result.result).toBe(BUDGET_VALIDATION_RESULT.REJECTED);
        });

        test('should handle negative allocation cost', () => {
            const result = manager.validateBudgetCapacity('CC-001', -10000000, 'monthly');
            
            // Negative cost should increase available budget
            expect(result.result).toBe(BUDGET_VALIDATION_RESULT.APPROVED);
            expect(result.details.newProjectedSpend).toBe(30000000); // 40M - 10M
        });
    });
});