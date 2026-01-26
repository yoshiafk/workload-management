/**
 * Demo: Over-Allocation Prevention Integration
 * Demonstrates how the ResourceAllocationEngine and ValidationEngine work together
 * to prevent over-allocation when strict enforcement is enabled
 */

import { ResourceAllocationEngine } from './resourceAllocation.js';
import { ValidationEngine } from './validationEngine.js';

// Demo data
const teamMembers = [
    {
        id: '1',
        name: 'John Doe',
        tierLevel: 3,
        maxCapacity: 1.0,
        overAllocationThreshold: 1.2 // 120% capacity threshold
    },
    {
        id: '2',
        name: 'Jane Smith',
        tierLevel: 4,
        maxCapacity: 1.0,
        overAllocationThreshold: 1.1 // 110% capacity threshold (stricter)
    }
];

const existingAllocations = [
    {
        id: 'alloc-1',
        resource: 'John Doe',
        allocationPercentage: 0.8, // 80% allocation
        taskName: 'Frontend Development',
        projectName: 'Project Alpha',
        plan: {
            taskStart: '2024-01-01',
            taskEnd: '2024-03-31'
        }
    },
    {
        id: 'alloc-2',
        resource: 'John Doe',
        allocationPercentage: 0.3, // 30% allocation
        taskName: 'Code Review',
        projectName: 'Project Beta',
        plan: {
            taskStart: '2024-02-01',
            taskEnd: '2024-04-30'
        }
    }
];

async function demonstrateOverAllocationPrevention() {
    console.log('=== Over-Allocation Prevention Demo ===\n');

    const resourceEngine = new ResourceAllocationEngine({ strictEnforcement: true });
    const validationEngine = new ValidationEngine({ allowOverAllocation: false });

    // 1. Check current utilization
    console.log('1. Current Resource Utilization:');
    const utilization = resourceEngine.calculateUtilization('John Doe', existingAllocations, teamMembers);
    console.log(`   John Doe: ${(utilization.currentUtilization * 100).toFixed(1)}% utilized`);
    console.log(`   Threshold: ${(teamMembers[0].overAllocationThreshold * 100).toFixed(0)}%`);
    console.log(`   Available capacity: ${((teamMembers[0].overAllocationThreshold - utilization.currentUtilization) * 100).toFixed(1)}%\n`);

    // 2. Test allocation that would cause over-allocation
    console.log('2. Testing allocation that would cause over-allocation:');
    const overAllocationRequest = {
        resource: 'John Doe',
        allocationPercentage: 0.4, // 40% - would bring total to 150%
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        complexity: 'medium',
        category: 'Project'
    };

    console.log(`   Requesting: ${(overAllocationRequest.allocationPercentage * 100).toFixed(0)}% allocation`);
    console.log(`   Would result in: ${((utilization.currentUtilization + overAllocationRequest.allocationPercentage) * 100).toFixed(1)}% total utilization`);

    // Validate with strict enforcement
    const validationResults = await validationEngine.validateAllocationCreation(
        overAllocationRequest,
        existingAllocations,
        teamMembers,
        [], // No leave schedules
        { strictEnforcement: true }
    );

    console.log('\n   Validation Results:');
    validationResults.forEach((result, index) => {
        const status = result.isValid ? '✅ PASS' : '❌ FAIL';
        console.log(`   ${index + 1}. ${result.type}: ${status}`);
        console.log(`      Message: ${result.message}`);
        if (result.details?.recommendations) {
            result.details.recommendations.forEach(rec => {
                console.log(`      💡 ${rec}`);
            });
        }
    });

    // 3. Test allocation within capacity
    console.log('\n3. Testing allocation within capacity:');
    const validAllocationRequest = {
        resource: 'John Doe',
        allocationPercentage: 0.1, // 10% - would bring total to 120% (exactly at threshold)
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        complexity: 'low',
        category: 'Project'
    };

    console.log(`   Requesting: ${(validAllocationRequest.allocationPercentage * 100).toFixed(0)}% allocation`);
    console.log(`   Would result in: ${((utilization.currentUtilization + validAllocationRequest.allocationPercentage) * 100).toFixed(1)}% total utilization`);

    const validValidationResults = await validationEngine.validateAllocationCreation(
        validAllocationRequest,
        existingAllocations,
        teamMembers,
        [],
        { strictEnforcement: true }
    );

    console.log('\n   Validation Results:');
    validValidationResults.forEach((result, index) => {
        const status = result.isValid ? '✅ PASS' : '❌ FAIL';
        console.log(`   ${index + 1}. ${result.type}: ${status}`);
        console.log(`      Message: ${result.message}`);
    });

    // 4. Test with different resource (Jane Smith - stricter threshold)
    console.log('\n4. Testing with stricter resource (Jane Smith - 110% threshold):');
    const janeAllocationRequest = {
        resource: 'Jane Smith',
        allocationPercentage: 1.0, // 100% allocation
        startDate: '2024-03-01',
        endDate: '2024-05-31',
        complexity: 'high',
        category: 'Project'
    };

    const janeUtilization = resourceEngine.calculateUtilization('Jane Smith', existingAllocations, teamMembers);
    console.log(`   Jane Smith current utilization: ${(janeUtilization.currentUtilization * 100).toFixed(1)}%`);
    console.log(`   Requesting: ${(janeAllocationRequest.allocationPercentage * 100).toFixed(0)}% allocation`);
    console.log(`   Threshold: ${(teamMembers[1].overAllocationThreshold * 100).toFixed(0)}%`);

    const janeValidationResults = await validationEngine.validateAllocationCreation(
        janeAllocationRequest,
        existingAllocations,
        teamMembers,
        [],
        { strictEnforcement: true }
    );

    console.log('\n   Validation Results:');
    janeValidationResults.forEach((result, index) => {
        const status = result.isValid ? '✅ PASS' : '❌ FAIL';
        console.log(`   ${index + 1}. ${result.type}: ${status}`);
        console.log(`      Message: ${result.message}`);
    });

    // 5. Demonstrate non-strict mode
    console.log('\n5. Testing with non-strict enforcement (warnings only):');
    const nonStrictResults = await validationEngine.validateAllocationCreation(
        overAllocationRequest, // Same over-allocation request from step 2
        existingAllocations,
        teamMembers,
        [],
        { strictEnforcement: false, allowOverAllocation: true }
    );

    console.log('\n   Non-Strict Validation Results:');
    nonStrictResults.forEach((result, index) => {
        const status = result.isValid ? '✅ PASS' : '⚠️  WARN';
        console.log(`   ${index + 1}. ${result.type}: ${status}`);
        console.log(`      Message: ${result.message}`);
        console.log(`      Severity: ${result.severity}`);
    });

    console.log('\n=== Demo Complete ===');
    console.log('\nKey Features Demonstrated:');
    console.log('✅ Over-allocation detection with configurable thresholds');
    console.log('✅ Strict enforcement prevents over-allocation');
    console.log('✅ Clear feedback about capacity conflicts');
    console.log('✅ Detailed validation results with recommendations');
    console.log('✅ Support for different enforcement modes');
    console.log('✅ Resource-specific capacity thresholds');
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
    demonstrateOverAllocationPrevention().catch(console.error);
}

export { demonstrateOverAllocationPrevention };