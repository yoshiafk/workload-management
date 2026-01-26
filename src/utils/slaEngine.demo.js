/**
 * SLA Engine Demo
 * Demonstrates priority-to-time mapping and SLA compliance tracking functionality
 */

import {
    SLAEngine,
    PRIORITY_LEVELS,
    SLA_COMPLIANCE_STATUS,
    getSLARequirements,
    calculateSLADeadlines,
    checkSLACompliance,
    trackSLACompliance
} from './slaEngine.js';

/**
 * Demo: Basic SLA Requirements Mapping
 */
export function demoSLARequirements() {
    console.log('=== SLA Requirements Demo ===');
    
    // Show SLA requirements for each priority level
    Object.values(PRIORITY_LEVELS).forEach(priority => {
        const requirements = getSLARequirements(priority);
        console.log(`\n${priority} (${requirements.label}):`);
        console.log(`  Response Time: ${requirements.responseTime} hours`);
        console.log(`  Resolution Time: ${requirements.resolutionTime} hours`);
        console.log(`  Escalation Time: ${requirements.escalationTime} hours`);
        console.log(`  Description: ${requirements.description}`);
    });
    
    // Show different priority format handling
    console.log('\n--- Priority Format Handling ---');
    const formats = ['P1', 'CRITICAL', 'high', '3', 'unknown'];
    formats.forEach(format => {
        const req = getSLARequirements(format);
        console.log(`Input: "${format}" -> Priority: ${req.priority} (${req.label})`);
    });
}

/**
 * Demo: SLA Deadline Calculations
 */
export function demoSLADeadlines() {
    console.log('\n=== SLA Deadline Calculations Demo ===');
    
    const startTime = new Date('2024-01-15T09:00:00Z'); // Monday 9 AM
    console.log(`Start Time: ${startTime.toISOString()}`);
    
    Object.values(PRIORITY_LEVELS).forEach(priority => {
        const deadlines = calculateSLADeadlines(priority, startTime);
        console.log(`\n${priority} Deadlines:`);
        console.log(`  Response: ${new Date(deadlines.responseDeadline).toLocaleString()}`);
        console.log(`  Resolution: ${new Date(deadlines.resolutionDeadline).toLocaleString()}`);
        console.log(`  Escalation: ${new Date(deadlines.escalationDeadline).toLocaleString()}`);
    });
}

/**
 * Demo: SLA Compliance Checking
 */
export function demoSLACompliance() {
    console.log('\n=== SLA Compliance Demo ===');
    
    const baseTime = new Date('2024-01-15T09:00:00Z');
    
    // Create sample tasks with different compliance statuses
    const tasks = [
        {
            id: 'task-1',
            taskName: 'Critical System Down',
            priority: 'P1',
            startTime: new Date(baseTime.getTime() - 30 * 60 * 1000).toISOString(), // 30 min ago
            status: 'in-progress'
        },
        {
            id: 'task-2',
            taskName: 'High Priority Bug',
            priority: 'P2',
            startTime: new Date(baseTime.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
            status: 'in-progress'
        },
        {
            id: 'task-3',
            taskName: 'Overdue Critical Issue',
            priority: 'P1',
            startTime: new Date(baseTime.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            status: 'in-progress'
        },
        {
            id: 'task-4',
            taskName: 'Completed Task',
            priority: 'P2',
            startTime: new Date(baseTime.getTime() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
            status: 'completed'
        },
        {
            id: 'task-5',
            taskName: 'Low Priority Enhancement',
            priority: 'P4',
            startTime: new Date(baseTime.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
            status: 'in-progress'
        }
    ];
    
    console.log(`Current Time: ${baseTime.toLocaleString()}\n`);
    
    tasks.forEach(task => {
        const compliance = checkSLACompliance(task, baseTime);
        const startTime = new Date(task.startTime);
        const elapsed = Math.round((baseTime - startTime) / (1000 * 60 * 60 * 100)) / 100; // hours with 2 decimals
        
        console.log(`Task: ${task.taskName} (${task.priority})`);
        console.log(`  Status: ${compliance.status}`);
        console.log(`  Deadline Type: ${compliance.deadlineType}`);
        console.log(`  Time Elapsed: ${elapsed} hours`);
        console.log(`  Time Remaining: ${compliance.timeRemaining.humanReadable}`);
        console.log(`  Compliance %: ${compliance.compliancePercentage}%`);
        console.log(`  Is Breached: ${compliance.isBreached}`);
        console.log(`  Is At Risk: ${compliance.isAtRisk}\n`);
    });
}

/**
 * Demo: SLA Compliance Tracking Summary
 */
export function demoSLATracking() {
    console.log('=== SLA Compliance Tracking Demo ===');
    
    const currentTime = new Date('2024-01-15T14:00:00Z'); // 2 PM
    
    // Create a larger set of sample tasks
    const tasks = [];
    const priorities = ['P1', 'P2', 'P3', 'P4'];
    const statuses = ['in-progress', 'completed', 'pending'];
    
    // Generate 20 sample tasks
    for (let i = 1; i <= 20; i++) {
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const hoursAgo = Math.floor(Math.random() * 48) + 1; // 1-48 hours ago
        
        tasks.push({
            id: `task-${i}`,
            taskName: `Sample Task ${i}`,
            projectName: `Project ${Math.ceil(i / 5)}`,
            priority,
            startTime: new Date(currentTime.getTime() - hoursAgo * 60 * 60 * 1000).toISOString(),
            status
        });
    }
    
    const tracking = trackSLACompliance(tasks, currentTime);
    
    console.log(`\nSLA Compliance Summary (as of ${currentTime.toLocaleString()}):`);
    console.log(`  Total Tasks: ${tracking.summary.totalTasks}`);
    console.log(`  Within SLA: ${tracking.summary.withinSLATasks}`);
    console.log(`  At Risk: ${tracking.summary.atRiskTasks}`);
    console.log(`  Breached: ${tracking.summary.breachedTasks}`);
    console.log(`  Overall Compliance Rate: ${tracking.summary.complianceRate}%`);
    
    console.log('\nCompliance by Priority:');
    Object.entries(tracking.byPriority).forEach(([priority, stats]) => {
        if (stats.total > 0) {
            console.log(`  ${priority}: ${stats.complianceRate}% (${stats.withinSLA}/${stats.total} tasks)`);
            if (stats.breached > 0) {
                console.log(`    ⚠️  ${stats.breached} breached tasks`);
            }
            if (stats.atRisk > 0) {
                console.log(`    ⏰ ${stats.atRisk} at-risk tasks`);
            }
        }
    });
    
    // Show some individual task details
    console.log('\nSample Task Details:');
    tracking.tasks.slice(0, 5).forEach(task => {
        console.log(`  ${task.taskName} (${task.priority}): ${task.status}`);
        if (task.isBreached) {
            console.log(`    🔴 BREACHED - ${task.timeRemaining.humanReadable}`);
        } else if (task.isAtRisk) {
            console.log(`    🟡 AT RISK - ${task.timeRemaining.humanReadable} remaining`);
        } else {
            console.log(`    🟢 Within SLA - ${task.timeRemaining.humanReadable} remaining`);
        }
    });
}

/**
 * Demo: Custom SLA Configuration
 */
export function demoCustomSLAConfiguration() {
    console.log('\n=== Custom SLA Configuration Demo ===');
    
    // Create SLA engine with custom configuration
    const customSLA = new SLAEngine({
        businessHoursOnly: true,
        businessHours: { start: 8, end: 18 }, // 8 AM to 6 PM
        workingDays: [1, 2, 3, 4, 5], // Monday to Friday
        timezone: 'Asia/Jakarta'
    });
    
    // Custom SLA mappings for a specific organization
    const customMappings = {
        P1: {
            responseTime: 0.5, // 30 minutes
            resolutionTime: 2,  // 2 hours
            escalationTime: 1,  // 1 hour
            label: 'Emergency',
            description: 'System outage or critical security issue'
        },
        P2: {
            responseTime: 2,    // 2 hours
            resolutionTime: 8,  // 8 hours (1 business day)
            escalationTime: 4,  // 4 hours
            label: 'Urgent',
            description: 'Significant business impact'
        }
    };
    
    customSLA.updateSLAMappings(customMappings);
    
    console.log('Custom SLA Configuration:');
    const config = customSLA.getSLAConfiguration();
    console.log(`  Business Hours Only: ${config.businessHoursOnly}`);
    console.log(`  Business Hours: ${config.businessHours.start}:00 - ${config.businessHours.end}:00`);
    console.log(`  Working Days: ${config.workingDays.join(', ')}`);
    console.log(`  Timezone: ${config.timezone}`);
    
    console.log('\nCustom SLA Mappings:');
    Object.entries(config.slaMappings).forEach(([priority, mapping]) => {
        console.log(`  ${priority} (${mapping.label}):`);
        console.log(`    Response: ${mapping.responseTime}h, Resolution: ${mapping.resolutionTime}h`);
    });
    
    // Test with business hours calculation
    const fridayEvening = new Date('2024-01-19T17:30:00Z'); // Friday 5:30 PM
    const deadlines = customSLA.calculateSLADeadlines('P1', fridayEvening);
    
    console.log(`\nBusiness Hours Calculation Example:`);
    console.log(`  Start: ${fridayEvening.toLocaleString()} (Friday evening)`);
    console.log(`  Response Deadline: ${new Date(deadlines.responseDeadline).toLocaleString()}`);
    console.log(`  (Should extend to next business day)`);
}

/**
 * Demo: Integration with Existing Support System
 */
export function demoSupportSystemIntegration() {
    console.log('\n=== Support System Integration Demo ===');
    
    // Simulate existing allocation data structure
    const supportAllocations = [
        {
            id: 'alloc-1',
            resource: 'John Doe',
            project: 'Customer Support',
            task: 'Fix Login Issue',
            category: 'Support',
            priority: 'P1',
            plan: {
                taskStart: new Date('2024-01-15T08:30:00Z').toISOString(),
                taskEnd: null
            },
            status: 'in-progress'
        },
        {
            id: 'alloc-2',
            resource: 'Jane Smith',
            project: 'Customer Support',
            task: 'Database Performance',
            category: 'Support',
            priority: 'P2',
            plan: {
                taskStart: new Date('2024-01-15T06:00:00Z').toISOString(),
                taskEnd: new Date('2024-01-15T14:00:00Z').toISOString()
            },
            status: 'completed'
        },
        {
            id: 'alloc-3',
            resource: 'Bob Wilson',
            project: 'Customer Support',
            task: 'Feature Request Review',
            category: 'Support',
            priority: 'P4',
            plan: {
                taskStart: new Date('2024-01-14T10:00:00Z').toISOString(),
                taskEnd: null
            },
            status: 'in-progress'
        }
    ];
    
    const currentTime = new Date('2024-01-15T15:00:00Z');
    
    // Convert allocations to tasks for SLA tracking
    const tasks = supportAllocations.map(allocation => ({
        id: allocation.id,
        taskName: allocation.task,
        projectName: allocation.project,
        priority: allocation.priority,
        startTime: allocation.plan.taskStart,
        status: allocation.status,
        resource: allocation.resource,
        category: allocation.category
    }));
    
    console.log('Support Tasks SLA Analysis:');
    tasks.forEach(task => {
        const compliance = checkSLACompliance(task, currentTime);
        const requirements = getSLARequirements(task.priority);
        
        console.log(`\n📋 ${task.taskName} (${task.priority})`);
        console.log(`   Assigned to: ${task.resource}`);
        console.log(`   SLA Status: ${compliance.status}`);
        console.log(`   Expected ${compliance.deadlineType} time: ${requirements[compliance.deadlineType + 'Time']}h`);
        
        if (compliance.isBreached) {
            console.log(`   🔴 BREACHED by ${compliance.timeRemaining.humanReadable}`);
        } else if (compliance.isAtRisk) {
            console.log(`   🟡 AT RISK - ${compliance.timeRemaining.humanReadable} remaining`);
        } else {
            console.log(`   🟢 ${compliance.timeRemaining.humanReadable} remaining`);
        }
    });
    
    // Overall support team SLA performance
    const tracking = trackSLACompliance(tasks, currentTime);
    console.log(`\n📊 Support Team SLA Performance:`);
    console.log(`   Overall Compliance: ${tracking.summary.complianceRate}%`);
    console.log(`   Tasks at Risk: ${tracking.summary.atRiskTasks}`);
    console.log(`   Breached Tasks: ${tracking.summary.breachedTasks}`);
}

/**
 * Run all demos
 */
export function runAllDemos() {
    console.log('🚀 SLA Engine Demo Suite\n');
    
    demoSLARequirements();
    demoSLADeadlines();
    demoSLACompliance();
    demoSLATracking();
    demoCustomSLAConfiguration();
    demoSupportSystemIntegration();
    
    console.log('\n✅ All demos completed!');
}

// Export individual demo functions for selective testing
export default {
    runAllDemos,
    demoSLARequirements,
    demoSLADeadlines,
    demoSLACompliance,
    demoSLATracking,
    demoCustomSLAConfiguration,
    demoSupportSystemIntegration
};