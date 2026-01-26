/**
 * CostCenterManager Demo
 * Demonstrates budget capacity validation and enforcement functionality
 */

import { 
    CostCenterManager, 
    BUDGET_ENFORCEMENT_MODES,
    BUDGET_VALIDATION_RESULT
} from './costCenterManager.js';

/**
 * Demo data setup
 */
function createDemoData() {
    const costCenters = [
        {
            id: 'CC-001',
            code: 'ENG',
            name: 'Engineering',
            monthlyBudget: 200000000, // 200M IDR
            yearlyBudget: 2400000000, // 2.4B IDR
            actualMonthlyCost: 80000000, // 80M IDR current spend
            actualYearlyCost: 960000000, // 960M IDR current spend
            budgetEnforcement: BUDGET_ENFORCEMENT_MODES.STRICT,
            overBudgetThreshold: 0 // No over-budget allowed
        },
        {
            id: 'CC-002',
            code: 'PROD',
            name: 'Product Management',
            monthlyBudget: 100000000, // 100M IDR
            yearlyBudget: 1200000000, // 1.2B IDR
            actualMonthlyCost: 85000000, // 85M IDR current spend (already over!)
            actualYearlyCost: 1020000000, // 1.02B IDR current spend
            budgetEnforcement: BUDGET_ENFORCEMENT_MODES.WARNING,
            overBudgetThreshold: 15 // 15% over-budget allowed
        },
        {
            id: 'CC-003',
            code: 'QA',
            name: 'Quality Assurance',
            monthlyBudget: 75000000, // 75M IDR
            yearlyBudget: 900000000, // 900M IDR
            actualMonthlyCost: 30000000, // 30M IDR current spend
            actualYearlyCost: 360000000, // 360M IDR current spend
            budgetEnforcement: BUDGET_ENFORCEMENT_MODES.NONE
        }
    ];

    const allocations = [
        {
            id: 'ALLOC-001',
            costCenterId: 'CC-001',
            projectName: 'Mobile App Development',
            plan: {
                costMonthly: 25000000, // 25M IDR monthly
                costProject: 300000000 // 300M IDR total
            }
        },
        {
            id: 'ALLOC-002',
            costCenterId: 'CC-002',
            projectName: 'Product Redesign',
            plan: {
                costMonthly: 10000000, // 10M IDR monthly
                costProject: 120000000 // 120M IDR total
            }
        },
        {
            id: 'ALLOC-003',
            costCenterId: 'CC-003',
            projectName: 'Test Automation',
            plan: {
                costMonthly: 15000000, // 15M IDR monthly
                costProject: 180000000 // 180M IDR total
            }
        }
    ];

    return { costCenters, allocations };
}

/**
 * Demo: Basic Budget Status Overview
 */
function demoBudgetStatusOverview() {
    console.log('\n=== BUDGET STATUS OVERVIEW ===');
    
    const { costCenters, allocations } = createDemoData();
    const manager = new CostCenterManager(costCenters, allocations);

    // Get all budget summaries
    const summaries = manager.getAllBudgetSummaries();
    
    summaries.forEach(summary => {
        console.log(`\n📊 ${summary.costCenterName} (${summary.costCenterCode})`);
        console.log(`   Enforcement Mode: ${summary.enforcementMode.toUpperCase()}`);
        
        // Monthly status
        const monthly = summary.monthly;
        console.log(`   Monthly Budget: ${manager.formatCurrency(monthly.totalBudget)}`);
        console.log(`   Current Spend: ${manager.formatCurrency(monthly.currentSpend)}`);
        console.log(`   Projected Spend: ${manager.formatCurrency(monthly.projectedSpend)}`);
        console.log(`   Available: ${manager.formatCurrency(monthly.availableBudget)}`);
        console.log(`   Utilization: ${monthly.utilization}% (${monthly.status})`);
        console.log(`   ${monthly.isOverBudget ? '⚠️  OVER BUDGET' : '✅ Within Budget'}`);
    });
}

/**
 * Demo: Budget Validation Scenarios
 */
function demoBudgetValidationScenarios() {
    console.log('\n=== BUDGET VALIDATION SCENARIOS ===');
    
    const { costCenters, allocations } = createDemoData();
    const manager = new CostCenterManager(costCenters, allocations);

    const scenarios = [
        {
            name: 'Small allocation to Engineering (Strict mode)',
            costCenterId: 'CC-001',
            allocationCost: 30000000, // 30M IDR
            period: 'monthly'
        },
        {
            name: 'Large allocation to Engineering (Strict mode)',
            costCenterId: 'CC-001',
            allocationCost: 120000000, // 120M IDR - should exceed budget
            period: 'monthly'
        },
        {
            name: 'Allocation to Product (Warning mode, already over budget)',
            costCenterId: 'CC-002',
            allocationCost: 20000000, // 20M IDR
            period: 'monthly'
        },
        {
            name: 'Large allocation to QA (No enforcement)',
            costCenterId: 'CC-003',
            allocationCost: 100000000, // 100M IDR - way over budget but allowed
            period: 'monthly'
        }
    ];

    scenarios.forEach((scenario, index) => {
        console.log(`\n${index + 1}. ${scenario.name}`);
        console.log(`   Allocation Cost: ${manager.formatCurrency(scenario.allocationCost)}`);
        
        const result = manager.validateBudgetCapacity(
            scenario.costCenterId, 
            scenario.allocationCost, 
            scenario.period
        );

        const statusIcon = {
            [BUDGET_VALIDATION_RESULT.APPROVED]: '✅',
            [BUDGET_VALIDATION_RESULT.WARNING]: '⚠️',
            [BUDGET_VALIDATION_RESULT.REJECTED]: '❌'
        }[result.result];

        console.log(`   Result: ${statusIcon} ${result.result.toUpperCase()}`);
        console.log(`   Message: ${result.message}`);
        console.log(`   New Utilization: ${result.details.utilizationAfterAllocation}%`);
    });
}

/**
 * Demo: Over-Budget Cost Centers
 */
function demoOverBudgetCostCenters() {
    console.log('\n=== OVER-BUDGET COST CENTERS ===');
    
    const { costCenters, allocations } = createDemoData();
    const manager = new CostCenterManager(costCenters, allocations);

    const overBudgetMonthly = manager.getOverBudgetCostCenters('monthly');
    const overBudgetYearly = manager.getOverBudgetCostCenters('yearly');

    console.log(`\nMonthly Over-Budget Cost Centers: ${overBudgetMonthly.length}`);
    overBudgetMonthly.forEach(cc => {
        console.log(`   📈 ${cc.name} (${cc.code})`);
        console.log(`      Utilization: ${cc.utilization.toFixed(1)}%`);
        console.log(`      Overage: ${manager.formatCurrency(cc.overageAmount)}`);
    });

    console.log(`\nYearly Over-Budget Cost Centers: ${overBudgetYearly.length}`);
    overBudgetYearly.forEach(cc => {
        console.log(`   📈 ${cc.name} (${cc.code})`);
        console.log(`      Utilization: ${cc.utilization.toFixed(1)}%`);
        console.log(`      Overage: ${manager.formatCurrency(cc.overageAmount)}`);
    });
}

/**
 * Demo: Multiple Allocation Validation
 */
function demoMultipleAllocationValidation() {
    console.log('\n=== MULTIPLE ALLOCATION VALIDATION ===');
    
    const { costCenters, allocations } = createDemoData();
    const manager = new CostCenterManager(costCenters, allocations);

    const allocationRequests = [
        {
            projectName: 'New Feature Development',
            costCenterId: 'CC-001',
            allocationCost: 40000000,
            period: 'monthly'
        },
        {
            projectName: 'Market Research',
            costCenterId: 'CC-002',
            allocationCost: 15000000,
            period: 'monthly'
        },
        {
            projectName: 'Performance Testing',
            costCenterId: 'CC-003',
            allocationCost: 25000000,
            period: 'monthly'
        }
    ];

    console.log('\nValidating batch of allocation requests...');
    
    const results = manager.validateMultipleAllocations(allocationRequests);
    
    results.forEach((result, index) => {
        const statusIcon = {
            [BUDGET_VALIDATION_RESULT.APPROVED]: '✅',
            [BUDGET_VALIDATION_RESULT.WARNING]: '⚠️',
            [BUDGET_VALIDATION_RESULT.REJECTED]: '❌'
        }[result.validation.result];

        console.log(`\n${index + 1}. ${result.projectName}`);
        console.log(`   Cost Center: ${result.validation.details.costCenterName}`);
        console.log(`   Cost: ${manager.formatCurrency(result.allocationCost)}`);
        console.log(`   Status: ${statusIcon} ${result.validation.result.toUpperCase()}`);
        console.log(`   ${result.validation.message}`);
    });
}

/**
 * Demo: Budget Enforcement Mode Comparison
 */
function demoBudgetEnforcementComparison() {
    console.log('\n=== BUDGET ENFORCEMENT MODE COMPARISON ===');
    
    const { costCenters, allocations } = createDemoData();
    
    // Test the same allocation against different enforcement modes
    const testAllocation = {
        cost: 50000000, // 50M IDR
        period: 'monthly'
    };

    const modes = [
        { mode: BUDGET_ENFORCEMENT_MODES.STRICT, costCenterId: 'CC-001' },
        { mode: BUDGET_ENFORCEMENT_MODES.WARNING, costCenterId: 'CC-002' },
        { mode: BUDGET_ENFORCEMENT_MODES.NONE, costCenterId: 'CC-003' }
    ];

    console.log(`\nTesting allocation of ${new CostCenterManager().formatCurrency(testAllocation.cost)} across different enforcement modes:`);

    modes.forEach(({ mode, costCenterId }) => {
        const manager = new CostCenterManager(costCenters, allocations);
        const costCenter = manager.getCostCenter(costCenterId);
        
        const result = manager.validateBudgetCapacity(
            costCenterId, 
            testAllocation.cost, 
            testAllocation.period
        );

        const statusIcon = {
            [BUDGET_VALIDATION_RESULT.APPROVED]: '✅',
            [BUDGET_VALIDATION_RESULT.WARNING]: '⚠️',
            [BUDGET_VALIDATION_RESULT.REJECTED]: '❌'
        }[result.result];

        console.log(`\n📋 ${mode.toUpperCase()} Mode (${costCenter.name})`);
        console.log(`   Current Budget: ${manager.formatCurrency(costCenter.monthlyBudget)}`);
        console.log(`   Current Utilization: ${manager.getBudgetUtilization(costCenterId, 'monthly')}%`);
        console.log(`   Result: ${statusIcon} ${result.result.toUpperCase()}`);
        console.log(`   ${result.message}`);
    });
}

/**
 * Run all demos
 */
function runAllDemos() {
    console.log('🏦 COST CENTER MANAGER DEMO');
    console.log('============================');
    
    try {
        demoBudgetStatusOverview();
        demoBudgetValidationScenarios();
        demoOverBudgetCostCenters();
        demoMultipleAllocationValidation();
        demoBudgetEnforcementComparison();
        
        console.log('\n✅ All demos completed successfully!');
        console.log('\nKey Features Demonstrated:');
        console.log('• Budget capacity validation with configurable enforcement modes');
        console.log('• Projected spend calculations including pending allocations');
        console.log('• Real-time budget utilization tracking');
        console.log('• Over-budget detection and prevention');
        console.log('• Comprehensive budget status reporting');
        console.log('• Multiple allocation batch validation');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        console.error(error.stack);
    }
}

// Run demos if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllDemos();
}

export {
    createDemoData,
    demoBudgetStatusOverview,
    demoBudgetValidationScenarios,
    demoOverBudgetCostCenters,
    demoMultipleAllocationValidation,
    demoBudgetEnforcementComparison,
    runAllDemos
};