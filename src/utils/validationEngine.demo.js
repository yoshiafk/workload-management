/**
 * ValidationEngine Demo
 * Demonstrates comprehensive resource validation functionality
 */

import { 
    ValidationEngine,
    validateAllocationCreation,
    validateResourceAvailability,
    validateSkillMatch,
    validateCapacityLimits,
    validateWorkloadConstraints
} from './validationEngine.js';

// Sample data for demonstration
const sampleTeamMembers = [
    {
        id: 'MEM-001',
        name: 'Alice Senior Developer',
        tierLevel: 3,
        type: 'FULLSTACK',
        maxCapacity: 1.0,
        overAllocationThreshold: 1.2,
        skillAreas: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'AWS']
    },
    {
        id: 'MEM-002',
        name: 'Bob Tech Lead',
        tierLevel: 4,
        type: 'LEAD',
        maxCapacity: 1.0,
        overAllocationThreshold: 1.3,
        skillAreas: ['Architecture', 'Leadership', 'React', 'AWS', 'System Design', 'Microservices']
    },
    {
        id: 'MEM-003',
        name: 'Charlie Junior Developer',
        tierLevel: 1,
        type: 'FULLSTACK',
        maxCapacity: 1.0,
        overAllocationThreshold: 1.1,
        skillAreas: ['HTML', 'CSS', 'JavaScript', 'React']
    }
];

const sampleExistingAllocations = [
    {
        id: 'ALLOC-001',
        resource: 'Alice Senior Developer',
        projectName: 'E-commerce Platform',
        taskName: 'Frontend Development',
        complexity: 'medium',
        allocationPercentage: 0.6,
        plan: {
            taskStart: '2024-01-15',
            taskEnd: '2024-02-15'
        }
    },
    {
        id: 'ALLOC-002',
        resource: 'Alice Senior Developer',
        projectName: 'Mobile App',
        taskName: 'API Integration',
        complexity: 'low',
        allocationPercentage: 0.3,
        plan: {
            taskStart: '2024-01-20',
            taskEnd: '2024-02-20'
        }
    },
    {
        id: 'ALLOC-003',
        resource: 'Charlie Junior Developer',
        projectName: 'Company Website',
        taskName: 'UI Components',
        complexity: 'low',
        allocationPercentage: 0.8,
        plan: {
            taskStart: '2024-01-10',
            taskEnd: '2024-02-10'
        }
    }
];

const sampleLeaveSchedules = [
    {
        id: 'LEAVE-001',
        memberName: 'Alice Senior Developer',
        type: 'vacation',
        startDate: '2024-02-10',
        endDate: '2024-02-15'
    },
    {
        id: 'LEAVE-002',
        memberName: 'Bob Tech Lead',
        type: 'conference',
        startDate: '2024-03-05',
        endDate: '2024-03-07'
    }
];

/**
 * Demo function to showcase ValidationEngine capabilities
 */
export async function runValidationDemo() {
    console.log('🔍 ValidationEngine Demo - Comprehensive Resource Validation\n');
    console.log('=' .repeat(80));

    // Demo 1: Successful allocation validation
    console.log('\n📋 Demo 1: Successful Allocation Validation');
    console.log('-'.repeat(50));
    
    const successfulAllocation = {
        resource: 'Bob Tech Lead',
        projectName: 'New Microservice',
        taskName: 'System Architecture',
        complexity: 'high',
        allocationPercentage: 0.7,
        startDate: '2024-03-15',
        endDate: '2024-04-15',
        taskRequirements: ['Architecture', 'System Design', 'Microservices']
    };

    try {
        const results = await validateAllocationCreation(
            successfulAllocation,
            sampleExistingAllocations,
            sampleTeamMembers,
            sampleLeaveSchedules
        );

        console.log(`✅ Validation completed with ${results.length} checks:`);
        results.forEach(result => {
            const icon = result.isValid ? '✅' : '❌';
            const severity = result.severity.toUpperCase();
            console.log(`   ${icon} ${result.type}: ${severity} - ${result.message}`);
            
            if (result.details.recommendations && result.details.recommendations.length > 0) {
                result.details.recommendations.forEach(rec => {
                    console.log(`      💡 ${rec}`);
                });
            }
        });

        const crossValidation = results.find(r => r.type === 'cross_validation');
        if (crossValidation) {
            console.log(`\n🎯 Final Recommendation: ${crossValidation.details.finalRecommendation.toUpperCase()}`);
            console.log(`🚨 Overall Risk: ${crossValidation.details.overallRisk.toUpperCase()}`);
        }
    } catch (error) {
        console.error('❌ Demo 1 failed:', error.message);
    }

    // Demo 2: Over-allocation scenario
    console.log('\n📋 Demo 2: Over-allocation Detection');
    console.log('-'.repeat(50));
    
    const overAllocationRequest = {
        resource: 'Alice Senior Developer',
        projectName: 'Critical Project',
        taskName: 'Full Stack Development',
        complexity: 'high',
        allocationPercentage: 0.8, // This will cause over-allocation
        startDate: '2024-01-25',
        endDate: '2024-02-25',
        taskRequirements: ['React', 'Node.js', 'TypeScript']
    };

    try {
        const results = await validateAllocationCreation(
            overAllocationRequest,
            sampleExistingAllocations,
            sampleTeamMembers,
            sampleLeaveSchedules
        );

        console.log(`⚠️  Over-allocation scenario detected:`);
        results.forEach(result => {
            if (result.severity === 'error' || result.severity === 'warning') {
                const icon = result.severity === 'error' ? '❌' : '⚠️';
                console.log(`   ${icon} ${result.type}: ${result.message}`);
                
                if (result.details.recommendations && result.details.recommendations.length > 0) {
                    result.details.recommendations.forEach(rec => {
                        console.log(`      💡 ${rec}`);
                    });
                }
            }
        });

        const capacityResult = results.find(r => r.type === 'capacity_limits');
        if (capacityResult && capacityResult.details) {
            console.log(`\n📊 Capacity Analysis:`);
            console.log(`   Current Utilization: ${(capacityResult.details.currentUtilization * 100).toFixed(1)}%`);
            console.log(`   Projected Utilization: ${(capacityResult.details.projectedUtilization * 100).toFixed(1)}%`);
            console.log(`   Threshold: ${(capacityResult.details.overAllocationThreshold * 100).toFixed(1)}%`);
        }
    } catch (error) {
        console.error('❌ Demo 2 failed:', error.message);
    }

    // Demo 3: Skill mismatch scenario
    console.log('\n📋 Demo 3: Skill Mismatch Detection');
    console.log('-'.repeat(50));
    
    const skillMismatchRequest = {
        resource: 'Charlie Junior Developer',
        projectName: 'Enterprise Architecture',
        taskName: 'System Design',
        complexity: 'sophisticated',
        allocationPercentage: 0.9,
        startDate: '2024-03-01',
        endDate: '2024-04-30',
        taskRequirements: ['Advanced Architecture', 'Distributed Systems', 'Machine Learning', 'DevOps']
    };

    try {
        const skillResult = await validateSkillMatch(
            skillMismatchRequest.resource,
            skillMismatchRequest.taskRequirements,
            skillMismatchRequest.complexity,
            sampleTeamMembers
        );

        console.log(`🎯 Skill Match Analysis:`);
        console.log(`   Status: ${skillResult.isValid ? 'VALID' : 'INVALID'} (${skillResult.severity.toUpperCase()})`);
        console.log(`   Message: ${skillResult.message}`);
        
        if (skillResult.details.skillMatches.length > 0) {
            console.log(`\n✅ Matching Skills:`);
            skillResult.details.skillMatches.forEach(match => {
                console.log(`   • ${match.required} → ${match.matched} (${(match.confidence * 100).toFixed(0)}% confidence)`);
            });
        }

        if (skillResult.details.skillGaps.length > 0) {
            console.log(`\n❌ Skill Gaps:`);
            skillResult.details.skillGaps.forEach(gap => {
                const severity = gap.severity === 'critical' ? '🚨' : '⚠️';
                const learnable = gap.canLearn ? '📚 Learnable' : '🔒 Requires Training';
                console.log(`   ${severity} ${gap.skill} (${gap.severity}) - ${learnable}`);
            });
        }

        if (skillResult.details.recommendations.length > 0) {
            console.log(`\n💡 Recommendations:`);
            skillResult.details.recommendations.forEach(rec => {
                console.log(`   • ${rec}`);
            });
        }
    } catch (error) {
        console.error('❌ Demo 3 failed:', error.message);
    }

    // Demo 4: Leave conflict scenario
    console.log('\n📋 Demo 4: Leave Conflict Detection');
    console.log('-'.repeat(50));
    
    try {
        const availabilityResult = await validateResourceAvailability(
            'Alice Senior Developer',
            { startDate: '2024-02-12', endDate: '2024-02-18' },
            sampleExistingAllocations,
            sampleTeamMembers,
            sampleLeaveSchedules
        );

        console.log(`📅 Availability Check:`);
        console.log(`   Status: ${availabilityResult.isValid ? 'AVAILABLE' : 'UNAVAILABLE'} (${availabilityResult.severity.toUpperCase()})`);
        console.log(`   Message: ${availabilityResult.message}`);

        if (availabilityResult.details.conflicts.length > 0) {
            console.log(`\n⚠️  Conflicts Detected:`);
            availabilityResult.details.conflicts.forEach(conflict => {
                if (conflict.type === 'leave_conflict') {
                    console.log(`   🏖️  Leave Conflict: ${conflict.leaveType} during requested period`);
                } else if (conflict.type === 'allocation_overlap') {
                    console.log(`   📋 Allocation Overlap: ${conflict.projectName} - ${conflict.taskName} (${(conflict.allocationPercentage * 100).toFixed(0)}%)`);
                } else if (conflict.type === 'capacity_exceeded') {
                    console.log(`   🚨 Capacity Exceeded: ${(conflict.currentUtilization * 100).toFixed(1)}% utilization`);
                }
            });
        }

        if (availabilityResult.details.recommendations.length > 0) {
            console.log(`\n💡 Recommendations:`);
            availabilityResult.details.recommendations.forEach(rec => {
                console.log(`   • ${rec}`);
            });
        }
    } catch (error) {
        console.error('❌ Demo 4 failed:', error.message);
    }

    // Demo 5: Workload sustainability analysis
    console.log('\n📋 Demo 5: Workload Sustainability Analysis');
    console.log('-'.repeat(50));
    
    const heavyWorkloadRequest = {
        resource: 'Alice Senior Developer',
        projectName: 'Another Complex Project',
        taskName: 'Full Stack Development',
        complexity: 'sophisticated',
        allocationPercentage: 0.4
    };

    try {
        const workloadResult = await validateWorkloadConstraints(
            heavyWorkloadRequest,
            sampleExistingAllocations,
            sampleTeamMembers
        );

        console.log(`⚖️  Workload Analysis:`);
        console.log(`   Status: ${workloadResult.isValid ? 'SUSTAINABLE' : 'UNSUSTAINABLE'} (${workloadResult.severity.toUpperCase()})`);
        console.log(`   Message: ${workloadResult.message}`);
        console.log(`   Current Tasks: ${workloadResult.details.currentTaskCount}/${workloadResult.details.maxConcurrentTasks}`);
        console.log(`   Sustainability Score: ${workloadResult.details.sustainabilityScore}%`);

        if (workloadResult.details.workloadDistribution.length > 0) {
            console.log(`\n📊 Current Workload Distribution:`);
            workloadResult.details.workloadDistribution.forEach(task => {
                console.log(`   • ${task.projectName}: ${task.complexity} complexity (${(task.allocationPercentage * 100).toFixed(0)}%)`);
            });
        }

        if (workloadResult.details.recommendations.length > 0) {
            console.log(`\n💡 Recommendations:`);
            workloadResult.details.recommendations.forEach(rec => {
                console.log(`   • ${rec}`);
            });
        }
    } catch (error) {
        console.error('❌ Demo 5 failed:', error.message);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 ValidationEngine Demo Complete!');
    console.log('\nThe ValidationEngine provides comprehensive validation for:');
    console.log('✅ Resource availability and scheduling conflicts');
    console.log('✅ Skill matching and capability assessment');
    console.log('✅ Capacity limits and over-allocation prevention');
    console.log('✅ Workload sustainability and balance');
    console.log('✅ Cross-validation and risk assessment');
    console.log('\nUse these validation functions before creating allocations to ensure');
    console.log('feasible project plans and optimal resource utilization.');
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runValidationDemo().catch(console.error);
}

export {
    sampleTeamMembers,
    sampleExistingAllocations,
    sampleLeaveSchedules
};