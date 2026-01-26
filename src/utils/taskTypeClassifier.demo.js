/**
 * Demo: Selective Complexity Calculation
 * Demonstrates how the TaskTypeClassifier applies different calculation methods
 * based on task category (Project vs Support/Maintenance)
 */

import { 
    shouldUseComplexityCalculation,
    shouldUseSimpleTimeEstimate,
    getCalculationMethod,
    getTaskCategory
} from './taskTypeClassifier.js';
import { 
    calculateEnhancedProjectCost,
    getDetailedCostBreakdown 
} from './calculations.js';
import { defaultComplexity } from '../data/defaultComplexity.js';
import { defaultTaskTemplates } from '../data/defaultTasks.js';

// Mock resource costs for demo
const mockResourceCosts = [
    {
        id: 'RES-001',
        resourceName: 'Senior Developer',
        perHourCost: 75000, // IDR 75,000 per hour
        monthlyCost: 12000000 // IDR 12,000,000 per month
    }
];

console.log('='.repeat(80));
console.log('SELECTIVE COMPLEXITY CALCULATION DEMO');
console.log('='.repeat(80));

// Demo 1: Task Category Classification
console.log('\n1. TASK CATEGORY CLASSIFICATION');
console.log('-'.repeat(40));

const taskCategories = ['Project', 'Support', 'Maintenance', 'Terminal', 'Unknown'];
taskCategories.forEach(category => {
    const useComplexity = shouldUseComplexityCalculation(category);
    const useSimple = shouldUseSimpleTimeEstimate(category);
    const method = getCalculationMethod(category);
    
    console.log(`${category.padEnd(12)}: Complexity=${useComplexity.toString().padEnd(5)} Simple=${useSimple.toString().padEnd(5)} Method=${method}`);
});

// Demo 2: Task Template Lookup
console.log('\n2. TASK TEMPLATE CATEGORY LOOKUP');
console.log('-'.repeat(40));

const sampleTasks = [
    'Project Charter',
    'Feature Development', 
    'Incident Resolution',
    'System Monitoring'
];

sampleTasks.forEach(taskName => {
    const category = getTaskCategory(taskName, defaultTaskTemplates);
    const method = getCalculationMethod(category);
    console.log(`${taskName.padEnd(20)}: Category=${(category || 'Unknown').padEnd(12)} Method=${method}`);
});

// Demo 3: Cost Calculation Comparison
console.log('\n3. COST CALCULATION COMPARISON');
console.log('-'.repeat(40));

const complexity = 'medium';
const tierLevel = 3; // Senior
const allocationPercentage = 1.0; // 100%

// Find task templates for comparison
const projectTask = defaultTaskTemplates.find(t => t.category === 'Project' && t.name === 'Feature Development');
const supportTask = defaultTaskTemplates.find(t => t.category === 'Support' && t.name === 'Incident Resolution');

console.log(`\nComplexity Level: ${complexity}`);
console.log(`Resource Tier: ${tierLevel} (Senior)`);
console.log(`Allocation: ${allocationPercentage * 100}%`);

// Project Task Calculation
console.log('\nPROJECT TASK: Feature Development');
const projectResult = calculateEnhancedProjectCost(
    complexity,
    'RES-001',
    defaultComplexity,
    mockResourceCosts,
    tierLevel,
    allocationPercentage,
    'Project',
    projectTask
);

console.log(`  Method: Complexity-based calculation`);
console.log(`  Base Effort Hours: ${projectResult.breakdown.baseEffortHours}`);
console.log(`  Skill Multiplier: ${projectResult.breakdown.skillMultiplier}x`);
console.log(`  Complexity Multiplier: ${projectResult.breakdown.complexityMultiplier}x`);
console.log(`  Risk Multiplier: ${projectResult.breakdown.riskMultiplier}x`);
console.log(`  Final Effort Hours: ${projectResult.effortHours}`);
console.log(`  Duration Days: ${projectResult.durationDays}`);
console.log(`  Total Cost: IDR ${projectResult.totalCost.toLocaleString('id-ID')}`);

// Support Task Calculation
console.log('\nSUPPORT TASK: Incident Resolution');
const supportResult = calculateEnhancedProjectCost(
    complexity,
    'RES-001',
    defaultComplexity,
    mockResourceCosts,
    tierLevel,
    allocationPercentage,
    'Support',
    supportTask
);

console.log(`  Method: Simple time estimate`);
console.log(`  Template Hours: ${supportTask.estimates[complexity].hours}`);
console.log(`  Final Effort Hours: ${supportResult.effortHours}`);
console.log(`  Duration Days: ${supportResult.durationDays}`);
console.log(`  Total Cost: IDR ${supportResult.totalCost.toLocaleString('id-ID')}`);

// Demo 4: Detailed Cost Breakdown
console.log('\n4. DETAILED COST BREAKDOWN');
console.log('-'.repeat(40));

const projectBreakdown = getDetailedCostBreakdown(
    'sophisticated',
    'RES-001',
    defaultComplexity,
    mockResourceCosts,
    1, // Junior tier
    0.5, // 50% allocation
    'Project',
    null
);

console.log('\nPROJECT TASK (Sophisticated, Junior, 50% allocation):');
console.log(`  Summary:`);
console.log(`    Total Cost: IDR ${projectBreakdown.summary.totalCost.toLocaleString('id-ID')}`);
console.log(`    Effort Hours: ${projectBreakdown.summary.effortHours}`);
console.log(`    Duration Days: ${projectBreakdown.summary.durationDays}`);
console.log(`    Allocation: ${projectBreakdown.summary.allocationPercentage * 100}%`);

console.log(`  Effort Breakdown:`);
console.log(`    Base Hours: ${projectBreakdown.effortBreakdown.baseEffortHours}`);
console.log(`    After Complexity: ${projectBreakdown.effortBreakdown.afterComplexityMultiplier}`);
console.log(`    After Risk: ${projectBreakdown.effortBreakdown.afterRiskMultiplier}`);
console.log(`    Final Hours: ${projectBreakdown.effortBreakdown.finalAdjustedHours}`);

console.log(`  Multipliers:`);
console.log(`    Skill: ${projectBreakdown.effortBreakdown.skillMultiplier}x (Junior penalty)`);
console.log(`    Complexity: ${projectBreakdown.effortBreakdown.complexityMultiplier}x`);
console.log(`    Risk: ${projectBreakdown.effortBreakdown.riskMultiplier}x`);

const supportBreakdown = getDetailedCostBreakdown(
    'sophisticated',
    'RES-001',
    defaultComplexity,
    mockResourceCosts,
    1, // Junior tier (should be ignored)
    0.5, // 50% allocation
    'Support',
    supportTask
);

console.log('\nSUPPORT TASK (Sophisticated, Junior ignored, 50% allocation):');
console.log(`  Summary:`);
console.log(`    Total Cost: IDR ${supportBreakdown.summary.totalCost.toLocaleString('id-ID')}`);
console.log(`    Effort Hours: ${supportBreakdown.summary.effortHours}`);
console.log(`    Duration Days: ${supportBreakdown.summary.durationDays}`);

console.log(`  Simple Calculation:`);
console.log(`    Template Hours: ${supportTask.estimates.sophisticated.hours}`);
console.log(`    No skill adjustment applied`);
console.log(`    No complexity multipliers applied`);

// Demo 5: Edge Cases
console.log('\n5. EDGE CASES');
console.log('-'.repeat(40));

// Unknown category
console.log('\nUnknown Category:');
const unknownResult = calculateEnhancedProjectCost(
    'medium',
    'RES-001',
    defaultComplexity,
    mockResourceCosts,
    2,
    1.0,
    'UnknownCategory',
    null
);
console.log(`  Method: ${shouldUseComplexityCalculation('UnknownCategory') ? 'Complexity' : 'Simple'}`);
console.log(`  Effort Hours: ${unknownResult.effortHours}`);
console.log(`  Cost: IDR ${unknownResult.totalCost.toLocaleString('id-ID')}`);

// Support task without template (fallback)
console.log('\nSupport Task without Template (Fallback):');
const fallbackResult = calculateEnhancedProjectCost(
    'high',
    'RES-001',
    defaultComplexity,
    mockResourceCosts,
    2,
    1.0,
    'Support',
    null // No template provided
);
console.log(`  Fallback to complexity calculation`);
console.log(`  Effort Hours: ${fallbackResult.effortHours}`);
console.log(`  Cost: IDR ${fallbackResult.totalCost.toLocaleString('id-ID')}`);

console.log('\n' + '='.repeat(80));
console.log('DEMO COMPLETE');
console.log('Key Takeaways:');
console.log('• Project tasks use full complexity model with skill adjustments');
console.log('• Support/Maintenance tasks use simple time estimates from templates');
console.log('• Unknown categories default to simple calculation');
console.log('• Fallback to complexity calculation when templates are missing');
console.log('='.repeat(80));