/**
 * ResourceAllocationEngine Demo
 * Demonstrates the key features of the resource over-allocation detection system
 */

import {
    ResourceAllocationEngine,
    detectOverAllocation,
    calculateResourceUtilization,
    validateAllocationRequest,
    getResourceAvailability,
    getUtilizationSummary
} from './resourceAllocation.js';

// Sample data for demonstration
const sampleTeamMembers = [
    {
        id: 'MEM-001',
        name: 'Alice Developer',
        type: 'FULLSTACK',
        maxHoursPerWeek: 40,
        maxCapacity: 1.0,
        overAllocationThreshold: 1.2, // Can handle up to 120%
        isActive: true
    },
    {
        id: 'MEM-002',
        name: 'Bob Tester',
        type: 'QA',
        maxHoursPerWeek: 40,
        maxCapacity: 1.0,
        overAllocationThreshold: 1.1, // More conservative threshold
        isActive: true
    },
    {
        id: 'MEM-003',
        name: 'Charlie Support',
        type: 'SUPPORT',
        maxHoursPerWeek: 40,
        maxCapacity: 1.5, // Can handle 150% capacity
        isActive: true
    }
];

const sampleAllocations = [
    {
        id: 'ALLOC-001',
        resource: 'Alice Developer',
        projectName: 'Project Alpha',
        taskName: 'Development',
        category: 'Project',
        complexity: 'Medium',
        allocationPercentage: 0.8, // 80% allocation
        plan: {
            taskStart: '2024-01-01',
            taskEnd: '2024-01-31',
            costProject: 10000000,
            costMonthly: 5000000
        }
    },
    {
        id: 'ALLOC-002',
        resource: 'Alice Developer',
        projectName: 'Project Beta',
        taskName: 'Code Review',
        category: 'Project',
        complexity: 'Low',
        allocationPercentage: 0.4, // 40% allocation
        plan: {
            taskStart: '2024-01-15',
            taskEnd: '2024-02-15',
            costProject: 5000000,
            costMonthly: 2500000
        }
    },
    {
        id: 'ALLOC-003',
        resource: 'Bob Tester',
        projectName: 'Project Alpha',
        taskName: 'Testing',
        category: 'Project',
        complexity: 'Medium',
        allocationPercentage: 0.6, // 60% allocation
        plan: {
            taskStart: '2024-01-01',
            taskEnd: '2024-01-31',
            costProject: 8000000,
            costMonthly: 4000000
        }
    }
];

/**
 * Demo function to showcase ResourceAllocationEngine features
 */
export function runResourceAllocationDemo() {
    console.log('🚀 ResourceAllocationEngine Demo');
    console.log('=====================================\n');

    // 1. Calculate current utilization
    console.log('1. Current Resource Utilization:');
    console.log('--------------------------------');
    
    const aliceUtilization = calculateResourceUtilization('Alice Developer', sampleAllocations, sampleTeamMembers);
    console.log(`Alice Developer: ${(aliceUtilization.currentUtilization * 100).toFixed(1)}% utilization`);
    console.log(`  - Active allocations: ${aliceUtilization.activeAllocations.length}`);
    console.log(`  - Projects: ${aliceUtilization.activeAllocations.map(a => a.projectName).join(', ')}`);
    
    const bobUtilization = calculateResourceUtilization('Bob Tester', sampleAllocations, sampleTeamMembers);
    console.log(`Bob Tester: ${(bobUtilization.currentUtilization * 100).toFixed(1)}% utilization`);
    console.log(`  - Active allocations: ${bobUtilization.activeAllocations.length}`);
    
    console.log('\n');

    // 2. Over-allocation detection
    console.log('2. Over-Allocation Detection:');
    console.log('-----------------------------');
    
    const aliceOverAllocation = detectOverAllocation('Alice Developer', sampleAllocations, sampleTeamMembers);
    console.log(`Alice Developer:`);
    console.log(`  - Over-allocated: ${aliceOverAllocation.isOverAllocated ? 'YES' : 'NO'}`);
    console.log(`  - Current utilization: ${(aliceOverAllocation.currentUtilization * 100).toFixed(1)}%`);
    console.log(`  - Threshold: ${(aliceOverAllocation.overAllocationThreshold * 100).toFixed(1)}%`);
    
    const bobOverAllocation = detectOverAllocation('Bob Tester', sampleAllocations, sampleTeamMembers);
    console.log(`Bob Tester:`);
    console.log(`  - Over-allocated: ${bobOverAllocation.isOverAllocated ? 'YES' : 'NO'}`);
    console.log(`  - Current utilization: ${(bobOverAllocation.currentUtilization * 100).toFixed(1)}%`);
    console.log(`  - Threshold: ${(bobOverAllocation.overAllocationThreshold * 100).toFixed(1)}%`);
    
    console.log('\n');

    // 3. Validate new allocation request
    console.log('3. Allocation Request Validation:');
    console.log('---------------------------------');
    
    const newAllocationRequest = {
        resource: 'Alice Developer',
        projectName: 'Project Gamma',
        taskName: 'Emergency Fix',
        category: 'Support',
        complexity: 'High',
        allocationPercentage: 0.3, // 30% more - will push Alice to 150%
        plan: {
            taskStart: '2024-02-01',
            taskEnd: '2024-02-15'
        }
    };
    
    const validationResult = validateAllocationRequest(newAllocationRequest, sampleAllocations, sampleTeamMembers);
    console.log(`New allocation for Alice (30% more):`);
    console.log(`  - Valid: ${validationResult.isValid ? 'YES' : 'NO'}`);
    console.log(`  - Warnings: ${validationResult.warnings.length}`);
    if (validationResult.warnings.length > 0) {
        validationResult.warnings.forEach(warning => console.log(`    - ${warning}`));
    }
    console.log(`  - Conflicts: ${validationResult.conflicts.length}`);
    
    console.log('\n');

    // 4. Resource availability
    console.log('4. Resource Availability:');
    console.log('-------------------------');
    
    const aliceAvailability = getResourceAvailability('Alice Developer', sampleAllocations, sampleTeamMembers);
    console.log(`Alice Developer:`);
    console.log(`  - Available: ${aliceAvailability.available ? 'YES' : 'NO'}`);
    console.log(`  - Available capacity: ${(aliceAvailability.availableCapacity * 100).toFixed(1)}%`);
    console.log(`  - Status: ${aliceAvailability.status}`);
    
    const charlieAvailability = getResourceAvailability('Charlie Support', sampleAllocations, sampleTeamMembers);
    console.log(`Charlie Support:`);
    console.log(`  - Available: ${charlieAvailability.available ? 'YES' : 'NO'}`);
    console.log(`  - Available capacity: ${(charlieAvailability.availableCapacity * 100).toFixed(1)}%`);
    console.log(`  - Status: ${charlieAvailability.status}`);
    
    console.log('\n');

    // 5. Team utilization summary
    console.log('5. Team Utilization Summary:');
    console.log('----------------------------');
    
    const utilizationSummary = getUtilizationSummary(sampleAllocations, sampleTeamMembers);
    utilizationSummary.forEach(member => {
        console.log(`${member.resourceName}:`);
        console.log(`  - Utilization: ${member.utilizationPercentage.toFixed(1)}%`);
        console.log(`  - Status: ${member.status}`);
        console.log(`  - Over-allocated: ${member.isOverAllocated ? 'YES' : 'NO'}`);
        console.log(`  - Active allocations: ${member.activeAllocationsCount}`);
    });
    
    console.log('\n');

    // 6. Demonstrate strict enforcement
    console.log('6. Strict Enforcement Mode:');
    console.log('---------------------------');
    
    const strictValidation = validateAllocationRequest(
        newAllocationRequest, 
        sampleAllocations, 
        sampleTeamMembers, 
        { strictEnforcement: true }
    );
    console.log(`Same allocation with strict enforcement:`);
    console.log(`  - Valid: ${strictValidation.isValid ? 'YES' : 'NO'}`);
    console.log(`  - Errors: ${strictValidation.errors.length}`);
    if (strictValidation.errors.length > 0) {
        strictValidation.errors.forEach(error => console.log(`    - ${error}`));
    }
    
    console.log('\n✅ Demo completed successfully!');
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runResourceAllocationDemo();
}