/**
 * SLA Engine
 * Handles priority-to-time mapping and SLA compliance tracking
 * User Requirement: Set SLA time mapping to Priority
 */

/**
 * Priority levels supported by the system
 */
export const PRIORITY_LEVELS = {
    CRITICAL: 'P1',    // Critical priority
    HIGH: 'P2',        // High priority
    MEDIUM: 'P3',      // Medium priority
    LOW: 'P4'          // Low priority
};

/**
 * SLA time units
 */
export const SLA_TIME_UNITS = {
    MINUTES: 'minutes',
    HOURS: 'hours',
    DAYS: 'days'
};

/**
 * SLA compliance status
 */
export const SLA_COMPLIANCE_STATUS = {
    WITHIN_SLA: 'Within SLA',
    AT_RISK: 'At Risk',
    BREACHED: 'Breached'
};

/**
 * Default SLA time mappings for each priority level
 * Times are in hours for consistency with existing calculations
 */
export const DEFAULT_SLA_MAPPINGS = {
    [PRIORITY_LEVELS.CRITICAL]: {
        responseTime: 1,      // 1 hour response time
        resolutionTime: 4,    // 4 hours resolution time
        escalationTime: 2,    // 2 hours escalation time
        label: 'Critical',
        description: 'Immediate attention required - system down or critical business impact'
    },
    [PRIORITY_LEVELS.HIGH]: {
        responseTime: 4,      // 4 hours response time
        resolutionTime: 24,   // 24 hours (1 day) resolution time
        escalationTime: 8,    // 8 hours escalation time
        label: 'High',
        description: 'High impact - significant business disruption'
    },
    [PRIORITY_LEVELS.MEDIUM]: {
        responseTime: 8,      // 8 hours response time
        resolutionTime: 72,   // 72 hours (3 days) resolution time
        escalationTime: 24,   // 24 hours escalation time
        label: 'Medium',
        description: 'Medium impact - moderate business disruption'
    },
    [PRIORITY_LEVELS.LOW]: {
        responseTime: 24,     // 24 hours response time
        resolutionTime: 168,  // 168 hours (7 days) resolution time
        escalationTime: 72,   // 72 hours escalation time
        label: 'Low',
        description: 'Low impact - minor business disruption or enhancement request'
    }
};

/**
 * SLAEngine class for priority-to-time mapping and compliance tracking
 */
export class SLAEngine {
    constructor(options = {}) {
        // Configuration options
        this.config = {
            slaMappings: options.slaMappings || DEFAULT_SLA_MAPPINGS,
            businessHoursOnly: options.businessHoursOnly || false,
            businessHours: options.businessHours || { start: 9, end: 17 }, // 9 AM to 5 PM
            workingDays: options.workingDays || [1, 2, 3, 4, 5], // Monday to Friday
            timezone: options.timezone || 'Asia/Jakarta',
            ...options
        };
    }

    /**
     * Get SLA requirements for a specific priority level
     * 
     * @param {string} priority - Priority level (P1, P2, P3, P4)
     * @returns {Object} SLA requirements object
     */
    getSLARequirements(priority) {
        const normalizedPriority = this._normalizePriority(priority);
        const slaMapping = this.config.slaMappings[normalizedPriority];
        
        if (!slaMapping) {
            // Default to medium priority if priority not found
            return {
                ...this.config.slaMappings[PRIORITY_LEVELS.MEDIUM],
                priority: priority, // Keep original priority for error tracking
                error: `Unknown priority level: ${priority}. Using medium priority defaults.`
            };
        }

        // Check if the original priority was unknown (normalized to default)
        const isUnknownPriority = normalizedPriority === PRIORITY_LEVELS.MEDIUM && 
                                 priority && 
                                 !this._isKnownPriority(priority);

        return {
            ...slaMapping,
            priority: isUnknownPriority ? priority : normalizedPriority,
            businessHoursOnly: this.config.businessHoursOnly,
            ...(isUnknownPriority && { error: `Unknown priority level: ${priority}. Using medium priority defaults.` })
        };
    }

    /**
     * Calculate SLA deadlines based on priority and start time
     * 
     * @param {string} priority - Priority level
     * @param {Date|string} startTime - Task start time
     * @param {Object} options - Calculation options
     * @returns {Object} SLA deadlines object
     */
    calculateSLADeadlines(priority, startTime, options = {}) {
        const slaRequirements = this.getSLARequirements(priority);
        const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
        
        if (!start || isNaN(start.getTime())) {
            return {
                error: 'Invalid start time provided',
                priority,
                startTime
            };
        }

        const deadlines = {
            priority,
            startTime: typeof startTime === 'string' ? startTime : start.toISOString(),
            responseDeadline: this._calculateDeadline(start, slaRequirements.responseTime),
            resolutionDeadline: this._calculateDeadline(start, slaRequirements.resolutionTime),
            escalationDeadline: this._calculateDeadline(start, slaRequirements.escalationTime),
            slaRequirements
        };

        return deadlines;
    }

    /**
     * Check SLA compliance status for a task
     * 
     * @param {Object} task - Task object with priority and timestamps
     * @param {Date} currentTime - Current time (defaults to now)
     * @returns {Object} SLA compliance status
     */
    checkSLACompliance(task, currentTime = new Date()) {
        const priority = task.priority || PRIORITY_LEVELS.MEDIUM;
        const startTime = task.startTime || task.createdAt || task.plan?.taskStart;
        
        if (!startTime) {
            return {
                status: SLA_COMPLIANCE_STATUS.WITHIN_SLA,
                priority,
                error: 'No start time available for SLA calculation'
            };
        }

        const deadlines = this.calculateSLADeadlines(priority, startTime);
        const now = typeof currentTime === 'string' ? new Date(currentTime) : currentTime;

        // Determine which deadline to check based on task status
        let relevantDeadline;
        let deadlineType;

        if (task.status === 'completed' || task.taskName === 'Completed') {
            // For completed tasks, check resolution time
            relevantDeadline = new Date(deadlines.resolutionDeadline);
            deadlineType = 'resolution';
        } else if (task.responseTime || task.firstResponse) {
            // If response has been given, check resolution time
            relevantDeadline = new Date(deadlines.resolutionDeadline);
            deadlineType = 'resolution';
        } else {
            // For new tasks, check response time
            relevantDeadline = new Date(deadlines.responseDeadline);
            deadlineType = 'response';
        }

        // Calculate compliance status
        const status = this._calculateComplianceStatus(now, relevantDeadline, new Date(startTime));
        const timeRemaining = this._calculateTimeRemaining(now, relevantDeadline);

        return {
            status,
            priority,
            deadlineType,
            relevantDeadline: relevantDeadline.toISOString(),
            timeRemaining,
            deadlines,
            isBreached: status === SLA_COMPLIANCE_STATUS.BREACHED,
            isAtRisk: status === SLA_COMPLIANCE_STATUS.AT_RISK,
            compliancePercentage: this._calculateCompliancePercentage(
                new Date(startTime), 
                now, 
                relevantDeadline
            )
        };
    }

    /**
     * Track SLA compliance for multiple tasks
     * 
     * @param {Array} tasks - Array of task objects
     * @param {Date} currentTime - Current time (defaults to now)
     * @returns {Object} Compliance tracking summary
     */
    trackSLACompliance(tasks, currentTime = new Date()) {
        const complianceResults = tasks.map(task => ({
            taskId: task.id,
            taskName: task.taskName || task.task,
            projectName: task.projectName || task.project,
            ...this.checkSLACompliance(task, currentTime)
        }));

        // Calculate summary statistics
        const totalTasks = complianceResults.length;
        const breachedTasks = complianceResults.filter(r => r.isBreached).length;
        const atRiskTasks = complianceResults.filter(r => r.isAtRisk).length;
        const withinSLATasks = complianceResults.filter(r => 
            r.status === SLA_COMPLIANCE_STATUS.WITHIN_SLA
        ).length;

        const complianceRate = totalTasks > 0 ? 
            Math.round((withinSLATasks / totalTasks) * 100) : 100;

        // Group by priority
        const byPriority = {};
        Object.values(PRIORITY_LEVELS).forEach(priority => {
            const priorityTasks = complianceResults.filter(r => r.priority === priority);
            byPriority[priority] = {
                total: priorityTasks.length,
                breached: priorityTasks.filter(r => r.isBreached).length,
                atRisk: priorityTasks.filter(r => r.isAtRisk).length,
                withinSLA: priorityTasks.filter(r => 
                    r.status === SLA_COMPLIANCE_STATUS.WITHIN_SLA
                ).length,
                complianceRate: priorityTasks.length > 0 ? 
                    Math.round((priorityTasks.filter(r => 
                        r.status === SLA_COMPLIANCE_STATUS.WITHIN_SLA
                    ).length / priorityTasks.length) * 100) : 100
            };
        });

        return {
            summary: {
                totalTasks,
                breachedTasks,
                atRiskTasks,
                withinSLATasks,
                complianceRate
            },
            byPriority,
            tasks: complianceResults,
            generatedAt: currentTime.toISOString()
        };
    }

    /**
     * Get SLA configuration for all priority levels
     * 
     * @returns {Object} Complete SLA configuration
     */
    getSLAConfiguration() {
        return {
            priorityLevels: Object.values(PRIORITY_LEVELS),
            slaMappings: this.config.slaMappings,
            businessHoursOnly: this.config.businessHoursOnly,
            businessHours: this.config.businessHours,
            workingDays: this.config.workingDays,
            timezone: this.config.timezone
        };
    }

    /**
     * Update SLA mappings for specific priority levels
     * 
     * @param {Object} newMappings - New SLA mappings to merge
     * @returns {Object} Updated SLA configuration
     */
    updateSLAMappings(newMappings) {
        this.config.slaMappings = {
            ...this.config.slaMappings,
            ...newMappings
        };
        
        return this.getSLAConfiguration();
    }

    /**
     * Check if a priority is a known/valid priority
     * 
     * @param {string} priority - Priority to check
     * @returns {boolean} True if priority is known
     */
    _isKnownPriority(priority) {
        if (!priority) return false;
        
        const upperPriority = priority.toString().toUpperCase();
        const knownPriorities = [
            'P1', 'P2', 'P3', 'P4',
            'CRITICAL', 'HIGH', 'MEDIUM', 'LOW',
            '1', '2', '3', '4'
        ];
        
        return knownPriorities.includes(upperPriority);
    }

    /**
     * Get priority level from various input formats
     * 
     * @param {string} priority - Priority in various formats
     * @returns {string} Normalized priority level
     */
    _normalizePriority(priority) {
        if (!priority) return PRIORITY_LEVELS.MEDIUM;
        
        const upperPriority = priority.toString().toUpperCase();
        
        // Handle different priority formats
        const priorityMap = {
            'P1': PRIORITY_LEVELS.CRITICAL,
            'P2': PRIORITY_LEVELS.HIGH,
            'P3': PRIORITY_LEVELS.MEDIUM,
            'P4': PRIORITY_LEVELS.LOW,
            'CRITICAL': PRIORITY_LEVELS.CRITICAL,
            'HIGH': PRIORITY_LEVELS.HIGH,
            'MEDIUM': PRIORITY_LEVELS.MEDIUM,
            'LOW': PRIORITY_LEVELS.LOW,
            '1': PRIORITY_LEVELS.CRITICAL,
            '2': PRIORITY_LEVELS.HIGH,
            '3': PRIORITY_LEVELS.MEDIUM,
            '4': PRIORITY_LEVELS.LOW
        };

        return priorityMap[upperPriority] || PRIORITY_LEVELS.MEDIUM;
    }

    /**
     * Calculate deadline based on start time and duration in hours
     * 
     * @param {Date} startTime - Start time
     * @param {number} durationHours - Duration in hours
     * @returns {string} Deadline ISO string
     */
    _calculateDeadline(startTime, durationHours) {
        if (this.config.businessHoursOnly) {
            return this._calculateBusinessHoursDeadline(startTime, durationHours);
        }
        
        // Simple calendar time calculation
        const deadline = new Date(startTime);
        deadline.setHours(deadline.getHours() + durationHours);
        return deadline.toISOString();
    }

    /**
     * Calculate deadline considering only business hours
     * 
     * @param {Date} startTime - Start time
     * @param {number} durationHours - Duration in business hours
     * @returns {string} Deadline ISO string
     */
    _calculateBusinessHoursDeadline(startTime, durationHours) {
        let current = new Date(startTime);
        let remainingHours = durationHours;
        
        while (remainingHours > 0) {
            // Check if current time is within business hours and working days
            const dayOfWeek = current.getDay();
            const hour = current.getHours();
            
            if (this.config.workingDays.includes(dayOfWeek) && 
                hour >= this.config.businessHours.start && 
                hour < this.config.businessHours.end) {
                
                // We're in business hours, subtract time
                const hoursUntilEndOfDay = this.config.businessHours.end - hour;
                const hoursToSubtract = Math.min(remainingHours, hoursUntilEndOfDay);
                
                remainingHours -= hoursToSubtract;
                current.setHours(current.getHours() + hoursToSubtract);
            } else {
                // Skip to next business hour
                if (hour >= this.config.businessHours.end || 
                    !this.config.workingDays.includes(dayOfWeek)) {
                    // Move to next working day
                    current.setDate(current.getDate() + 1);
                    current.setHours(this.config.businessHours.start, 0, 0, 0);
                } else {
                    // Move to start of business hours today
                    current.setHours(this.config.businessHours.start, 0, 0, 0);
                }
            }
        }
        
        return current.toISOString();
    }

    /**
     * Calculate SLA compliance status based on current time and deadline
     * 
     * @param {Date} currentTime - Current time
     * @param {Date} deadline - SLA deadline
     * @param {Date} startTime - Task start time (for calculating total duration)
     * @returns {string} Compliance status
     */
    _calculateComplianceStatus(currentTime, deadline, startTime = null) {
        if (currentTime >= deadline) { // Changed from > to >= to include exact deadline
            return SLA_COMPLIANCE_STATUS.BREACHED;
        }
        
        // Calculate time remaining in hours
        const hoursRemaining = (deadline - currentTime) / (1000 * 60 * 60);
        
        // Calculate at-risk threshold based on actual SLA duration
        let atRiskThreshold = 2; // Default 2 hours
        
        if (startTime) {
            const totalDurationHours = (deadline - startTime) / (1000 * 60 * 60);
            // At risk if less than 15% of total time remaining, but minimum 10 minutes for short SLAs
            atRiskThreshold = Math.max(totalDurationHours * 0.15, 0.17); // 0.17 hours = ~10 minutes
        }
        
        if (hoursRemaining <= atRiskThreshold) {
            return SLA_COMPLIANCE_STATUS.AT_RISK;
        }
        
        return SLA_COMPLIANCE_STATUS.WITHIN_SLA;
    }

    /**
     * Calculate time remaining until deadline
     * 
     * @param {Date} currentTime - Current time
     * @param {Date} deadline - SLA deadline
     * @returns {Object} Time remaining breakdown
     */
    _calculateTimeRemaining(currentTime, deadline) {
        const diffMs = deadline - currentTime;
        
        if (diffMs <= 0) {
            return {
                totalHours: 0,
                totalMinutes: 0,
                isOverdue: true,
                overdueHours: Math.abs(diffMs) / (1000 * 60 * 60),
                humanReadable: 'Overdue'
            };
        }
        
        const totalHours = diffMs / (1000 * 60 * 60);
        const totalMinutes = diffMs / (1000 * 60);
        const days = Math.floor(totalHours / 24);
        const hours = Math.floor(totalHours % 24);
        const minutes = Math.floor((totalMinutes % 60));
        
        let humanReadable = '';
        if (days > 0) {
            humanReadable += `${days}d `;
        }
        if (hours > 0) {
            humanReadable += `${hours}h `;
        }
        if (minutes > 0 || humanReadable === '') {
            humanReadable += `${minutes}m`;
        }
        
        return {
            totalHours: Math.round(totalHours * 100) / 100,
            totalMinutes: Math.round(totalMinutes),
            days,
            hours,
            minutes,
            isOverdue: false,
            humanReadable: humanReadable.trim()
        };
    }

    /**
     * Calculate compliance percentage (0-100)
     * 
     * @param {Date} startTime - Task start time
     * @param {Date} currentTime - Current time
     * @param {Date} deadline - SLA deadline
     * @returns {number} Compliance percentage
     */
    _calculateCompliancePercentage(startTime, currentTime, deadline) {
        const totalDuration = deadline - startTime;
        const elapsed = currentTime - startTime;
        
        if (totalDuration <= 0) return 100;
        if (elapsed <= 0) return 100;
        if (elapsed >= totalDuration) return 0;
        
        const percentage = Math.max(0, Math.min(100, 
            Math.round(((totalDuration - elapsed) / totalDuration) * 100)
        ));
        
        return percentage;
    }
}

/**
 * Default SLA engine instance
 */
export const slaEngine = new SLAEngine();

/**
 * Convenience functions using the default engine instance
 */

/**
 * Get SLA requirements for a priority level
 * @param {string} priority - Priority level
 * @returns {Object} SLA requirements
 */
export function getSLARequirements(priority) {
    return slaEngine.getSLARequirements(priority);
}

/**
 * Calculate SLA deadlines for a task
 * @param {string} priority - Priority level
 * @param {Date|string} startTime - Task start time
 * @param {Object} options - Calculation options
 * @returns {Object} SLA deadlines
 */
export function calculateSLADeadlines(priority, startTime, options = {}) {
    return slaEngine.calculateSLADeadlines(priority, startTime, options);
}

/**
 * Check SLA compliance for a task
 * @param {Object} task - Task object
 * @param {Date} currentTime - Current time
 * @returns {Object} SLA compliance status
 */
export function checkSLACompliance(task, currentTime = new Date()) {
    return slaEngine.checkSLACompliance(task, currentTime);
}

/**
 * Track SLA compliance for multiple tasks
 * @param {Array} tasks - Array of task objects
 * @param {Date} currentTime - Current time
 * @returns {Object} Compliance tracking summary
 */
export function trackSLACompliance(tasks, currentTime = new Date()) {
    return slaEngine.trackSLACompliance(tasks, currentTime);
}

/**
 * Get complete SLA configuration
 * @returns {Object} SLA configuration
 */
export function getSLAConfiguration() {
    return slaEngine.getSLAConfiguration();
}

export default SLAEngine;