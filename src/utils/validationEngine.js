/**
 * Validation Engine
 * Provides comprehensive pre-allocation validation for resource availability, skills, capacity, and constraints
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { resourceAllocationEngine } from './resourceAllocation.js';
import { getComplexityConfig } from '../data/defaultComplexity.js';

/**
 * ValidationEngine class for comprehensive resource validation
 * Implements pre-allocation validation for availability, skills, capacity, and detailed feedback
 */
export class ValidationEngine {
    constructor(options = {}) {
        // Default configuration
        this.config = {
            strictSkillMatching: false,     // Whether to require exact skill matches
            allowOverAllocation: false,     // Whether to allow over-allocation
            maxSkillGapTolerance: 2,       // Maximum skill level gap tolerance
            validateLeaveSchedules: true,   // Whether to check leave schedules
            validateCapacityLimits: true,   // Whether to enforce capacity limits
            ...options
        };
    }

    /**
     * Validate allocation creation with comprehensive checks
     * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
     * 
     * @param {Object} allocationData - Allocation request data
     * @param {Array} existingAllocations - Current allocations
     * @param {Array} teamMembers - Team member records
     * @param {Array} leaveSchedules - Leave schedule records
     * @param {Object} options - Validation options
     * @returns {Promise<Array>} Array of validation results
     */
    async validateAllocationCreation(allocationData, existingAllocations = [], teamMembers = [], leaveSchedules = [], options = {}) {
        const validationResults = [];
        
        try {
            // 1. Validate resource availability (Requirements 7.1, 7.2)
            const availabilityResult = await this.validateResourceAvailability(
                allocationData.resource,
                {
                    startDate: allocationData.startDate,
                    endDate: allocationData.endDate
                },
                existingAllocations,
                teamMembers,
                leaveSchedules,
                options
            );
            validationResults.push(availabilityResult);

            // 2. Validate skill match (Requirements 7.3)
            const skillMatchResult = await this.validateSkillMatch(
                allocationData.resource,
                allocationData.taskRequirements || [],
                allocationData.complexity,
                teamMembers,
                options
            );
            validationResults.push(skillMatchResult);

            // 3. Validate capacity limits (Requirements 7.4)
            const capacityResult = await this.validateCapacityLimits(
                allocationData.resource,
                allocationData.allocationPercentage || 1.0,
                existingAllocations,
                teamMembers,
                options
            );
            validationResults.push(capacityResult);

            // 4. Validate workload constraints (Requirements 7.5)
            const workloadResult = await this.validateWorkloadConstraints(
                allocationData,
                existingAllocations,
                teamMembers,
                options
            );
            validationResults.push(workloadResult);

            // 5. Cross-validation checks
            const crossValidationResult = await this.performCrossValidation(
                allocationData,
                validationResults,
                options
            );
            validationResults.push(crossValidationResult);

        } catch (error) {
            validationResults.push({
                type: 'system_error',
                isValid: false,
                severity: 'error',
                message: `Validation system error: ${error.message}`,
                details: {
                    error: error.message,
                    stack: error.stack
                }
            });
        }

        return validationResults;
    }

    /**
     * Validate resource availability during requested time period
     * Requirements: 7.1, 7.2
     * 
     * @param {string} resourceId - Resource identifier
     * @param {Object} dateRange - Date range with startDate and endDate
     * @param {Array} existingAllocations - Current allocations
     * @param {Array} teamMembers - Team member records
     * @param {Array} leaveSchedules - Leave schedule records
     * @param {Object} options - Validation options
     * @returns {Promise<Object>} Availability validation result
     */
    async validateResourceAvailability(resourceId, dateRange, existingAllocations = [], teamMembers = [], leaveSchedules = [], options = {}) {
        const result = {
            type: 'availability',
            isValid: true,
            severity: 'info',
            message: 'Resource is available',
            details: {
                resourceId,
                dateRange,
                conflicts: [],
                recommendations: []
            }
        };

        try {
            // Find the resource
            const resource = this._findResource(resourceId, teamMembers);
            if (!resource) {
                result.isValid = false;
                result.severity = 'error';
                result.message = `Resource not found: ${resourceId}`;
                return result;
            }

            // Check existing allocations for conflicts (Requirements 7.2)
            const allocationConflicts = this._checkAllocationConflicts(
                resourceId,
                dateRange,
                existingAllocations,
                resource
            );

            if (allocationConflicts.length > 0) {
                result.details.conflicts.push(...allocationConflicts);
                result.severity = 'warning';
                result.message = `Resource has ${allocationConflicts.length} conflicting allocation(s)`;
            }

            // Check leave schedules (Requirements 7.2)
            if (this.config.validateLeaveSchedules && leaveSchedules.length > 0) {
                const leaveConflicts = this._checkLeaveConflicts(
                    resourceId,
                    dateRange,
                    leaveSchedules,
                    resource
                );

                if (leaveConflicts.length > 0) {
                    result.details.conflicts.push(...leaveConflicts);
                    result.severity = 'error';
                    result.message = `Resource has ${leaveConflicts.length} leave conflict(s)`;
                    result.isValid = false;
                }
            }

            // Check capacity limits during the period (Requirements 7.2)
            const capacityCheck = this._checkPeriodCapacity(
                resourceId,
                dateRange,
                existingAllocations,
                resource
            );

            if (!capacityCheck.hasCapacity) {
                result.details.conflicts.push({
                    type: 'capacity_exceeded',
                    message: `Resource capacity exceeded during period`,
                    currentUtilization: capacityCheck.currentUtilization,
                    maxCapacity: capacityCheck.maxCapacity,
                    overAllocation: capacityCheck.overAllocation
                });
                
                if (capacityCheck.overAllocation > 0.2) { // More than 20% over capacity
                    result.isValid = false;
                    result.severity = 'error';
                    result.message = 'Resource significantly over-allocated during period';
                } else {
                    result.severity = 'warning';
                    result.message = 'Resource near capacity limit during period';
                }
            }

            // Add recommendations
            if (result.details.conflicts.length > 0) {
                result.details.recommendations.push(
                    'Consider adjusting allocation dates or reducing allocation percentage'
                );
                
                if (allocationConflicts.length > 0) {
                    result.details.recommendations.push(
                        'Review existing allocations for potential rescheduling'
                    );
                }
            }

        } catch (error) {
            result.isValid = false;
            result.severity = 'error';
            result.message = `Error validating availability: ${error.message}`;
            result.details.error = error.message;
        }

        return result;
    }

    /**
     * Validate skill match between resource capabilities and task requirements
     * Requirements: 7.3
     * 
     * @param {string} resourceId - Resource identifier
     * @param {Array} taskRequirements - Required skills for the task
     * @param {string} complexity - Task complexity level
     * @param {Array} teamMembers - Team member records
     * @param {Object} options - Validation options
     * @returns {Promise<Object>} Skill match validation result
     */
    async validateSkillMatch(resourceId, taskRequirements = [], complexity = 'medium', teamMembers = [], options = {}) {
        const result = {
            type: 'skill_match',
            isValid: true,
            severity: 'info',
            message: 'Skills match requirements',
            details: {
                resourceId,
                taskRequirements,
                complexity,
                skillGaps: [],
                skillMatches: [],
                recommendations: []
            }
        };

        try {
            // Find the resource
            const resource = this._findResource(resourceId, teamMembers);
            if (!resource) {
                result.isValid = false;
                result.severity = 'error';
                result.message = `Resource not found: ${resourceId}`;
                return result;
            }

            // Get resource skills and tier level
            const resourceSkills = resource.skillAreas || resource.skills || [];
            const tierLevel = resource.tierLevel || 2;
            const complexityConfig = getComplexityConfig(complexity);

            // If no specific requirements, check general capability based on tier and complexity
            if (taskRequirements.length === 0) {
                const isCapable = this._assessGeneralCapability(tierLevel, complexity, complexityConfig);
                if (!isCapable) {
                    result.severity = 'warning';
                    result.message = `Resource tier level (${tierLevel}) may not be optimal for ${complexity} complexity tasks`;
                    result.details.recommendations.push(
                        `Consider assigning a ${complexity === 'sophisticated' ? 'senior' : 'more experienced'} resource`
                    );
                }
                return result;
            }

            // Check each required skill
            const skillAnalysis = this._analyzeSkillRequirements(
                resourceSkills,
                taskRequirements,
                tierLevel,
                complexity
            );

            result.details.skillMatches = skillAnalysis.matches;
            result.details.skillGaps = skillAnalysis.gaps;

            // Determine validation result based on skill gaps
            if (skillAnalysis.gaps.length === 0) {
                result.message = 'All required skills are available';
            } else if (skillAnalysis.criticalGaps.length > 0) {
                result.isValid = this.config.strictSkillMatching ? false : true;
                result.severity = this.config.strictSkillMatching ? 'error' : 'warning';
                result.message = `Missing ${skillAnalysis.criticalGaps.length} critical skill(s)`;
                
                result.details.recommendations.push(
                    'Consider providing training or pairing with experienced team member'
                );
            } else {
                result.severity = 'warning';
                result.message = `Missing ${skillAnalysis.gaps.length} non-critical skill(s)`;
                result.details.recommendations.push(
                    'Resource can learn missing skills during task execution'
                );
            }

            // Check tier level appropriateness for complexity
            const tierAppropriate = this._checkTierComplexityMatch(tierLevel, complexity);
            if (!tierAppropriate.appropriate) {
                result.details.recommendations.push(tierAppropriate.recommendation);
                if (result.severity === 'info') {
                    result.severity = 'warning';
                    result.message = 'Skill match acceptable but tier level concerns exist';
                }
            }

        } catch (error) {
            result.isValid = false;
            result.severity = 'error';
            result.message = `Error validating skill match: ${error.message}`;
            result.details.error = error.message;
        }

        return result;
    }

    /**
     * Validate capacity limits and prevent over-allocation
     * Requirements: 7.4
     * 
     * @param {string} resourceId - Resource identifier
     * @param {number} requestedPercentage - Requested allocation percentage
     * @param {Array} existingAllocations - Current allocations
     * @param {Array} teamMembers - Team member records
     * @param {Object} options - Validation options
     * @returns {Promise<Object>} Capacity validation result
     */
    async validateCapacityLimits(resourceId, requestedPercentage = 1.0, existingAllocations = [], teamMembers = [], options = {}) {
        const result = {
            type: 'capacity_limits',
            isValid: true,
            severity: 'info',
            message: 'Capacity limits respected',
            details: {
                resourceId,
                requestedPercentage,
                currentUtilization: 0,
                projectedUtilization: 0,
                maxCapacity: 1.0,
                overAllocationThreshold: 1.2,
                recommendations: []
            }
        };

        try {
            // Find the resource
            const resource = this._findResource(resourceId, teamMembers);
            if (!resource) {
                result.isValid = false;
                result.severity = 'error';
                result.message = `Resource not found: ${resourceId}`;
                return result;
            }

            // Validate requested percentage range
            if (requestedPercentage < 0.1 || requestedPercentage > 1.0) {
                result.isValid = false;
                result.severity = 'error';
                result.message = `Invalid allocation percentage: ${requestedPercentage}. Must be between 0.1 and 1.0`;
                return result;
            }

            // Get current utilization
            const utilizationResult = resourceAllocationEngine.calculateUtilization(
                resourceId,
                existingAllocations,
                teamMembers
            );

            const maxCapacity = resource.maxCapacity || 1.0;
            const overAllocationThreshold = resource.overAllocationThreshold || 1.2;
            const currentUtilization = utilizationResult.currentUtilization;
            const projectedUtilization = currentUtilization + requestedPercentage;

            result.details.currentUtilization = currentUtilization;
            result.details.projectedUtilization = projectedUtilization;
            result.details.maxCapacity = maxCapacity;
            result.details.overAllocationThreshold = overAllocationThreshold;

            // Check capacity constraints (Requirements 7.4)
            if (projectedUtilization > overAllocationThreshold) {
                const overAmount = projectedUtilization - overAllocationThreshold;
                
                if (this.config.allowOverAllocation || !this.config.validateCapacityLimits) {
                    result.severity = 'warning';
                    result.message = `Allocation exceeds threshold by ${(overAmount * 100).toFixed(1)}%`;
                } else {
                    result.isValid = false;
                    result.severity = 'error';
                    result.message = `Allocation would exceed capacity threshold by ${(overAmount * 100).toFixed(1)}%`;
                }

                result.details.recommendations.push(
                    `Reduce allocation percentage to ${Math.max(0.1, overAllocationThreshold - currentUtilization).toFixed(2)} or less`
                );
                
                if (utilizationResult.activeAllocations.length > 0) {
                    result.details.recommendations.push(
                        'Consider rescheduling or reducing existing allocations'
                    );
                }
            } else if (projectedUtilization > maxCapacity) {
                result.severity = 'warning';
                result.message = `Allocation exceeds base capacity but within threshold`;
                result.details.recommendations.push(
                    'Monitor resource workload closely for signs of overwork'
                );
            }

            // Check for sustainable workload
            if (projectedUtilization > 0.9) {
                result.details.recommendations.push(
                    'Resource will be at very high utilization - ensure adequate support and monitoring'
                );
            }

        } catch (error) {
            result.isValid = false;
            result.severity = 'error';
            result.message = `Error validating capacity limits: ${error.message}`;
            result.details.error = error.message;
        }

        return result;
    }

    /**
     * Validate workload constraints and sustainable capacity
     * Requirements: 7.5
     * 
     * @param {Object} allocationData - Allocation request data
     * @param {Array} existingAllocations - Current allocations
     * @param {Array} teamMembers - Team member records
     * @param {Object} options - Validation options
     * @returns {Promise<Object>} Workload validation result
     */
    async validateWorkloadConstraints(allocationData, existingAllocations = [], teamMembers = [], options = {}) {
        const result = {
            type: 'workload_constraints',
            isValid: true,
            severity: 'info',
            message: 'Workload constraints satisfied',
            details: {
                resourceId: allocationData.resource,
                currentTaskCount: 0,
                maxConcurrentTasks: 5,
                workloadDistribution: [],
                sustainabilityScore: 100,
                recommendations: []
            }
        };

        try {
            // Find the resource
            const resource = this._findResource(allocationData.resource, teamMembers);
            if (!resource) {
                result.isValid = false;
                result.severity = 'error';
                result.message = `Resource not found: ${allocationData.resource}`;
                return result;
            }

            // Analyze current workload distribution
            const workloadAnalysis = this._analyzeWorkloadDistribution(
                allocationData.resource,
                existingAllocations,
                allocationData
            );

            result.details.currentTaskCount = workloadAnalysis.currentTaskCount;
            result.details.maxConcurrentTasks = workloadAnalysis.maxConcurrentTasks;
            result.details.workloadDistribution = workloadAnalysis.distribution;

            // Check concurrent task limits first
            if (workloadAnalysis.currentTaskCount >= workloadAnalysis.maxConcurrentTasks) {
                result.severity = 'warning';
                result.message = `Resource at maximum concurrent task limit (${workloadAnalysis.maxConcurrentTasks})`;
                result.details.recommendations.push(
                    'Consider waiting for current tasks to complete or reassigning to another resource'
                );
            }

            // Calculate sustainability score (Requirements 7.5)
            const sustainabilityScore = this._calculateSustainabilityScore(
                workloadAnalysis,
                allocationData,
                resource
            );

            result.details.sustainabilityScore = sustainabilityScore;

            // Only override message if not already set by concurrent task limit check
            if (sustainabilityScore < 70 && result.severity === 'info') {
                result.severity = 'warning';
                result.message = `Low workload sustainability score: ${sustainabilityScore}%`;
                result.details.recommendations.push(
                    'Workload may not be sustainable long-term - consider load balancing'
                );
            } else if (sustainabilityScore < 50) {
                result.isValid = false;
                result.severity = 'error';
                result.message = `Unsustainable workload detected: ${sustainabilityScore}%`;
                result.details.recommendations.push(
                    'Immediate action required to reduce workload or provide additional resources'
                );
            }

            // Check for workload variety and complexity balance
            const complexityBalance = this._checkComplexityBalance(
                workloadAnalysis.distribution,
                allocationData.complexity
            );

            if (!complexityBalance.balanced) {
                result.details.recommendations.push(complexityBalance.recommendation);
            }

        } catch (error) {
            result.isValid = false;
            result.severity = 'error';
            result.message = `Error validating workload constraints: ${error.message}`;
            result.details.error = error.message;
        }

        return result;
    }

    /**
     * Perform cross-validation checks across all validation results
     * 
     * @param {Object} allocationData - Allocation request data
     * @param {Array} validationResults - Previous validation results
     * @param {Object} options - Validation options
     * @returns {Promise<Object>} Cross-validation result
     */
    async performCrossValidation(allocationData, validationResults, options = {}) {
        const result = {
            type: 'cross_validation',
            isValid: true,
            severity: 'info',
            message: 'Cross-validation passed',
            details: {
                overallRisk: 'low',
                conflictingValidations: [],
                aggregatedRecommendations: [],
                finalRecommendation: 'proceed'
            }
        };

        try {
            // Count validation issues by severity
            const errorCount = validationResults.filter(r => r.severity === 'error').length;
            const warningCount = validationResults.filter(r => r.severity === 'warning').length;

            // Determine overall validation status
            if (errorCount > 0) {
                result.isValid = false;
                result.severity = 'error';
                result.message = `${errorCount} critical validation error(s) found`;
                result.details.finalRecommendation = 'reject';
                result.details.overallRisk = 'high';
            } else if (warningCount > 2) {
                result.severity = 'warning';
                result.message = `${warningCount} validation warning(s) found`;
                result.details.finalRecommendation = 'proceed_with_caution';
                result.details.overallRisk = 'medium';
            } else if (warningCount > 0) {
                result.severity = 'warning';
                result.message = `${warningCount} minor validation warning(s) found`;
                result.details.finalRecommendation = 'proceed_with_monitoring';
                result.details.overallRisk = 'low';
            }

            // Aggregate all recommendations
            const allRecommendations = validationResults
                .flatMap(r => r.details?.recommendations || [])
                .filter((rec, index, arr) => arr.indexOf(rec) === index); // Remove duplicates

            result.details.aggregatedRecommendations = allRecommendations;

            // Check for conflicting validations
            const conflicts = this._findValidationConflicts(validationResults);
            if (conflicts.length > 0) {
                result.details.conflictingValidations = conflicts;
                result.severity = 'warning';
                result.message += ' (with conflicting recommendations)';
            }

        } catch (error) {
            result.isValid = false;
            result.severity = 'error';
            result.message = `Error in cross-validation: ${error.message}`;
            result.details.error = error.message;
        }

        return result;
    }

    // Private helper methods

    /**
     * Find a resource by ID or name
     * @private
     */
    _findResource(resourceId, teamMembers) {
        return teamMembers.find(member => 
            member.id === resourceId || 
            member.name === resourceId ||
            (member.name && resourceId && member.name.toLowerCase() === resourceId.toLowerCase())
        );
    }

    /**
     * Check for allocation conflicts during the requested period
     * @private
     */
    _checkAllocationConflicts(resourceId, dateRange, existingAllocations, resource) {
        const conflicts = [];
        
        if (!dateRange.startDate || !dateRange.endDate) {
            return conflicts;
        }

        const requestStart = new Date(dateRange.startDate);
        const requestEnd = new Date(dateRange.endDate);

        const resourceAllocations = existingAllocations.filter(allocation =>
            allocation.resource === resourceId ||
            allocation.resource === resource.name ||
            (allocation.resource && resource.name && 
             allocation.resource.toLowerCase() === resource.name.toLowerCase())
        );

        resourceAllocations.forEach(allocation => {
            if (allocation.plan?.taskStart && allocation.plan?.taskEnd) {
                const allocStart = new Date(allocation.plan.taskStart);
                const allocEnd = new Date(allocation.plan.taskEnd);

                // Check for overlap
                if (allocStart <= requestEnd && allocEnd >= requestStart) {
                    conflicts.push({
                        type: 'allocation_overlap',
                        allocationId: allocation.id,
                        projectName: allocation.projectName || allocation.project,
                        taskName: allocation.taskName || allocation.task,
                        conflictPeriod: {
                            start: Math.max(allocStart.getTime(), requestStart.getTime()),
                            end: Math.min(allocEnd.getTime(), requestEnd.getTime())
                        },
                        allocationPercentage: allocation.allocationPercentage || allocation.workload || 1.0
                    });
                }
            }
        });

        return conflicts;
    }

    /**
     * Check for leave schedule conflicts
     * @private
     */
    _checkLeaveConflicts(resourceId, dateRange, leaveSchedules, resource) {
        const conflicts = [];
        
        if (!dateRange.startDate || !dateRange.endDate) {
            return conflicts;
        }

        const requestStart = new Date(dateRange.startDate);
        const requestEnd = new Date(dateRange.endDate);

        const resourceLeaves = leaveSchedules.filter(leave =>
            leave.memberName === resourceId ||
            leave.memberName === resource.name ||
            (leave.memberName && resource.name && 
             leave.memberName.toLowerCase() === resource.name.toLowerCase())
        );

        resourceLeaves.forEach(leave => {
            if (leave.startDate && leave.endDate) {
                const leaveStart = new Date(leave.startDate);
                const leaveEnd = new Date(leave.endDate);

                // Check for overlap
                if (leaveStart <= requestEnd && leaveEnd >= requestStart) {
                    conflicts.push({
                        type: 'leave_conflict',
                        leaveId: leave.id,
                        leaveType: leave.type || 'leave',
                        conflictPeriod: {
                            start: Math.max(leaveStart.getTime(), requestStart.getTime()),
                            end: Math.min(leaveEnd.getTime(), requestEnd.getTime())
                        }
                    });
                }
            }
        });

        return conflicts;
    }

    /**
     * Check capacity during a specific period
     * @private
     */
    _checkPeriodCapacity(resourceId, dateRange, existingAllocations, resource) {
        const maxCapacity = resource.maxCapacity || 1.0;
        const overAllocationThreshold = resource.overAllocationThreshold || 1.2;

        // Calculate utilization during the period
        const utilizationResult = resourceAllocationEngine.calculateUtilization(
            resourceId,
            existingAllocations,
            [resource],
            dateRange
        );

        const currentUtilization = utilizationResult.currentUtilization;
        const hasCapacity = currentUtilization <= overAllocationThreshold;
        const overAllocation = Math.max(0, currentUtilization - overAllocationThreshold);

        return {
            hasCapacity,
            currentUtilization,
            maxCapacity,
            overAllocationThreshold,
            overAllocation
        };
    }

    /**
     * Assess general capability based on tier and complexity
     * @private
     */
    _assessGeneralCapability(tierLevel, complexity, complexityConfig) {
        // Simple heuristic: higher complexity requires higher tier
        const complexityTierRequirements = {
            'low': 1,           // Any tier can handle low complexity
            'medium': 2,        // Mid-tier or above for medium
            'high': 3,          // Senior or above for high
            'sophisticated': 4  // Lead or above for sophisticated
        };

        const requiredTier = complexityTierRequirements[complexity] || 2;
        return tierLevel >= requiredTier;
    }

    /**
     * Analyze skill requirements against resource capabilities
     * @private
     */
    _analyzeSkillRequirements(resourceSkills, taskRequirements, tierLevel, complexity) {
        const matches = [];
        const gaps = [];
        const criticalGaps = [];

        // Define critical skills based on complexity
        const criticalSkillPatterns = {
            'sophisticated': ['architect', 'lead', 'senior', 'principal'],
            'high': ['senior', 'lead'],
            'medium': [],
            'low': []
        };

        const criticalPatterns = criticalSkillPatterns[complexity] || [];

        taskRequirements.forEach(requiredSkill => {
            const skillMatch = resourceSkills.find(skill => 
                skill.toLowerCase().includes(requiredSkill.toLowerCase()) ||
                requiredSkill.toLowerCase().includes(skill.toLowerCase())
            );

            if (skillMatch) {
                matches.push({
                    required: requiredSkill,
                    matched: skillMatch,
                    confidence: this._calculateSkillMatchConfidence(requiredSkill, skillMatch)
                });
            } else {
                const gap = {
                    skill: requiredSkill,
                    severity: this._determineSkillGapSeverity(requiredSkill, criticalPatterns),
                    canLearn: this._assessLearnability(requiredSkill, tierLevel)
                };
                
                gaps.push(gap);
                
                if (gap.severity === 'critical') {
                    criticalGaps.push(gap);
                }
            }
        });

        return {
            matches,
            gaps,
            criticalGaps
        };
    }

    /**
     * Check if tier level is appropriate for complexity
     * @private
     */
    _checkTierComplexityMatch(tierLevel, complexity) {
        const optimalTierRanges = {
            'low': [1, 3],          // Junior to Senior
            'medium': [2, 4],       // Mid to Lead
            'high': [3, 5],         // Senior to Principal
            'sophisticated': [4, 5] // Lead to Principal
        };

        const [minTier, maxTier] = optimalTierRanges[complexity] || [2, 4];
        const appropriate = tierLevel >= minTier && tierLevel <= maxTier;

        let recommendation = '';
        if (tierLevel < minTier) {
            recommendation = `Consider assigning a more senior resource (tier ${minTier}+ recommended for ${complexity} complexity)`;
        } else if (tierLevel > maxTier) {
            recommendation = `Resource may be overqualified for ${complexity} complexity task - consider utilizing on higher complexity work`;
        }

        return {
            appropriate,
            recommendation,
            optimalRange: [minTier, maxTier]
        };
    }

    /**
     * Analyze workload distribution for a resource
     * @private
     */
    _analyzeWorkloadDistribution(resourceId, existingAllocations, newAllocation) {
        const resourceAllocations = existingAllocations.filter(allocation =>
            allocation.resource === resourceId &&
            allocation.taskName !== 'Completed' &&
            allocation.taskName !== 'Idle'
        );

        const distribution = resourceAllocations.map(allocation => ({
            allocationId: allocation.id,
            projectName: allocation.projectName || allocation.project,
            taskName: allocation.taskName || allocation.task,
            complexity: allocation.complexity || 'medium',
            allocationPercentage: allocation.allocationPercentage || allocation.workload || 1.0,
            startDate: allocation.plan?.taskStart,
            endDate: allocation.plan?.taskEnd
        }));

        return {
            currentTaskCount: resourceAllocations.length,
            maxConcurrentTasks: 5, // Configurable limit
            distribution,
            totalUtilization: distribution.reduce((sum, d) => sum + d.allocationPercentage, 0)
        };
    }

    /**
     * Calculate sustainability score for workload
     * @private
     */
    _calculateSustainabilityScore(workloadAnalysis, newAllocation, resource) {
        let score = 100;

        // Penalize high utilization
        const totalUtilization = workloadAnalysis.totalUtilization + (newAllocation.allocationPercentage || 1.0);
        if (totalUtilization > 1.0) {
            score -= (totalUtilization - 1.0) * 30; // -30 points per 100% over-allocation
        }

        // Penalize too many concurrent tasks
        const taskCount = workloadAnalysis.currentTaskCount + 1;
        if (taskCount > 3) {
            score -= (taskCount - 3) * 10; // -10 points per task over 3
        }

        // Penalize complexity imbalance
        const complexities = workloadAnalysis.distribution.map(d => d.complexity);
        const sophisticatedCount = complexities.filter(c => c === 'sophisticated').length;
        if (sophisticatedCount > 1) {
            score -= (sophisticatedCount - 1) * 15; // -15 points per additional sophisticated task
        }

        // Bonus for appropriate tier level
        const tierLevel = resource.tierLevel || 2;
        if (tierLevel >= 3) {
            score += 5; // +5 points for senior resources
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * Check complexity balance in workload
     * @private
     */
    _checkComplexityBalance(distribution, newComplexity) {
        const complexities = [...distribution.map(d => d.complexity), newComplexity];
        const sophisticatedCount = complexities.filter(c => c === 'sophisticated').length;
        const highCount = complexities.filter(c => c === 'high').length;

        if (sophisticatedCount > 2) {
            return {
                balanced: false,
                recommendation: 'Too many sophisticated complexity tasks - consider redistributing workload'
            };
        }

        if (sophisticatedCount + highCount > 3) {
            return {
                balanced: false,
                recommendation: 'High concentration of complex tasks - ensure adequate support and monitoring'
            };
        }

        return { balanced: true };
    }

    /**
     * Calculate skill match confidence
     * @private
     */
    _calculateSkillMatchConfidence(requiredSkill, matchedSkill) {
        if (requiredSkill.toLowerCase() === matchedSkill.toLowerCase()) {
            return 1.0; // Perfect match
        }
        
        if (requiredSkill.toLowerCase().includes(matchedSkill.toLowerCase()) ||
            matchedSkill.toLowerCase().includes(requiredSkill.toLowerCase())) {
            return 0.8; // Good match
        }
        
        return 0.6; // Partial match
    }

    /**
     * Determine skill gap severity
     * @private
     */
    _determineSkillGapSeverity(skill, criticalPatterns) {
        const skillLower = skill.toLowerCase();
        const isCritical = criticalPatterns.some(pattern => 
            skillLower.includes(pattern) || pattern.includes(skillLower)
        );
        
        return isCritical ? 'critical' : 'moderate';
    }

    /**
     * Assess if a skill can be learned during task execution
     * @private
     */
    _assessLearnability(skill, tierLevel) {
        // Higher tier resources can learn new skills more easily
        const learnabilityByTier = {
            1: 0.6, // Junior - moderate learning ability
            2: 0.7, // Mid - good learning ability
            3: 0.8, // Senior - high learning ability
            4: 0.9, // Lead - very high learning ability
            5: 0.9  // Principal - very high learning ability
        };

        return (learnabilityByTier[tierLevel] || 0.7) > 0.7;
    }

    /**
     * Find conflicts between validation results
     * @private
     */
    _findValidationConflicts(validationResults) {
        const conflicts = [];
        
        // Example: If availability says proceed but capacity says reject
        const availabilityResult = validationResults.find(r => r.type === 'availability');
        const capacityResult = validationResults.find(r => r.type === 'capacity_limits');
        
        if (availabilityResult?.isValid && !capacityResult?.isValid) {
            conflicts.push({
                type: 'availability_capacity_conflict',
                message: 'Resource appears available but capacity limits would be exceeded'
            });
        }
        
        return conflicts;
    }
}

/**
 * Default instance for convenience
 */
export const validationEngine = new ValidationEngine();

/**
 * Convenience functions that use the default engine instance
 */

/**
 * Validate allocation creation using default engine
 * @param {Object} allocationData - Allocation request data
 * @param {Array} existingAllocations - Current allocations
 * @param {Array} teamMembers - Team member records
 * @param {Array} leaveSchedules - Leave schedule records
 * @param {Object} options - Validation options
 * @returns {Promise<Array>} Array of validation results
 */
export async function validateAllocationCreation(allocationData, existingAllocations = [], teamMembers = [], leaveSchedules = [], options = {}) {
    return validationEngine.validateAllocationCreation(allocationData, existingAllocations, teamMembers, leaveSchedules, options);
}

/**
 * Validate resource availability using default engine
 * @param {string} resourceId - Resource identifier
 * @param {Object} dateRange - Date range with startDate and endDate
 * @param {Array} existingAllocations - Current allocations
 * @param {Array} teamMembers - Team member records
 * @param {Array} leaveSchedules - Leave schedule records
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Availability validation result
 */
export async function validateResourceAvailability(resourceId, dateRange, existingAllocations = [], teamMembers = [], leaveSchedules = [], options = {}) {
    return validationEngine.validateResourceAvailability(resourceId, dateRange, existingAllocations, teamMembers, leaveSchedules, options);
}

/**
 * Validate skill match using default engine
 * @param {string} resourceId - Resource identifier
 * @param {Array} taskRequirements - Required skills for the task
 * @param {string} complexity - Task complexity level
 * @param {Array} teamMembers - Team member records
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Skill match validation result
 */
export async function validateSkillMatch(resourceId, taskRequirements = [], complexity = 'medium', teamMembers = [], options = {}) {
    return validationEngine.validateSkillMatch(resourceId, taskRequirements, complexity, teamMembers, options);
}

/**
 * Validate capacity limits using default engine
 * @param {string} resourceId - Resource identifier
 * @param {number} requestedPercentage - Requested allocation percentage
 * @param {Array} existingAllocations - Current allocations
 * @param {Array} teamMembers - Team member records
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Capacity validation result
 */
export async function validateCapacityLimits(resourceId, requestedPercentage = 1.0, existingAllocations = [], teamMembers = [], options = {}) {
    return validationEngine.validateCapacityLimits(resourceId, requestedPercentage, existingAllocations, teamMembers, options);
}

/**
 * Validate workload constraints using default engine
 * @param {Object} allocationData - Allocation request data
 * @param {Array} existingAllocations - Current allocations
 * @param {Array} teamMembers - Team member records
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Workload validation result
 */
export async function validateWorkloadConstraints(allocationData, existingAllocations = [], teamMembers = [], options = {}) {
    return validationEngine.validateWorkloadConstraints(allocationData, existingAllocations, teamMembers, options);
}