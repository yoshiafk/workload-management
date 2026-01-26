/**
 * Resource Allocation Engine
 * Manages resource capacity, detects over-allocation, and supports percentage-based assignments
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

/**
 * ResourceAllocationEngine class for managing resource capacity and allocation tracking
 * Implements over-allocation detection with configurable thresholds and real-time utilization monitoring
 */
export class ResourceAllocationEngine {
    constructor(options = {}) {
        // Default configuration
        this.config = {
            defaultCapacityThreshold: 1.2, // 120% capacity threshold
            strictEnforcement: false,      // Whether to prevent over-allocation
            trackingEnabled: true,         // Enable real-time tracking
            ...options
        };
    }

    /**
     * Detect over-allocation for a specific resource
     * Requirements: 4.1, 4.2, 4.3
     * 
     * @param {string} resourceId - Resource identifier (name or ID)
     * @param {Array} allocations - All active allocations
     * @param {Array} teamMembers - Team member records
     * @param {Object} options - Detection options
     * @returns {Object} Over-allocation detection result
     */
    detectOverAllocation(resourceId, allocations, teamMembers, options = {}) {
        // Find the resource
        const resource = this._findResource(resourceId, teamMembers);
        if (!resource) {
            return {
                isOverAllocated: false,
                currentUtilization: 0,
                maxCapacity: 0,
                overAllocationAmount: 0,
                conflictingAllocations: [],
                error: `Resource not found: ${resourceId}`
            };
        }

        // Get resource's capacity configuration
        const maxCapacity = resource.maxCapacity || 1.0;
        const overAllocationThreshold = resource.overAllocationThreshold || 
                                      options.capacityThreshold || 
                                      this.config.defaultCapacityThreshold;

        // Calculate current utilization across all active allocations
        const utilizationResult = this.calculateUtilization(resourceId, allocations, teamMembers);
        
        // Determine if over-allocated
        const isOverAllocated = utilizationResult.currentUtilization > overAllocationThreshold;
        const overAllocationAmount = Math.max(0, utilizationResult.currentUtilization - overAllocationThreshold);

        // Find conflicting allocations (those that contribute to over-allocation)
        const conflictingAllocations = isOverAllocated ? 
            utilizationResult.activeAllocations
                .filter(allocation => allocation.allocationPercentage > 0)
                .map(allocation => allocation.allocationId) : [];

        return {
            isOverAllocated,
            currentUtilization: utilizationResult.currentUtilization,
            maxCapacity,
            overAllocationThreshold,
            overAllocationAmount: Math.round(overAllocationAmount * 1000) / 1000, // Round to 3 decimal places
            conflictingAllocations,
            utilizationBreakdown: utilizationResult.breakdown,
            resourceName: resource.name,
            resourceId: resource.id || resourceId
        };
    }

    /**
     * Calculate real-time utilization for a resource across all active allocations
     * Requirements: 4.1, 4.4
     * 
     * @param {string} resourceId - Resource identifier
     * @param {Array} allocations - All allocations
     * @param {Array} teamMembers - Team member records
     * @param {Object} dateRange - Optional date range filter
     * @returns {Object} Utilization calculation result
     */
    calculateUtilization(resourceId, allocations, teamMembers, dateRange = null) {
        const resource = this._findResource(resourceId, teamMembers);
        if (!resource) {
            return {
                currentUtilization: 0,
                activeAllocations: [],
                breakdown: [],
                error: `Resource not found: ${resourceId}`
            };
        }

        // Filter allocations for this resource
        const resourceAllocations = allocations.filter(allocation => 
            this._matchesResource(allocation.resource, resourceId, resource)
        );

        // Filter for active allocations (not completed, cancelled, or idle)
        const activeAllocations = resourceAllocations.filter(allocation => 
            this._isActiveAllocation(allocation, dateRange)
        );

        // Calculate utilization breakdown
        const breakdown = activeAllocations.map(allocation => {
            const rawPercentage = this._getAllocationPercentage(allocation);
            // Don't clamp here - we need the actual values for over-allocation detection
            const allocationPercentage = rawPercentage;
            return {
                allocationId: allocation.id,
                projectName: allocation.projectName || allocation.project,
                taskName: allocation.taskName || allocation.task,
                allocationPercentage,
                startDate: allocation.plan?.taskStart,
                endDate: allocation.plan?.taskEnd,
                category: allocation.category,
                complexity: allocation.complexity
            };
        });

        // Sum up all allocation percentages
        const currentUtilization = breakdown.reduce((sum, item) => 
            sum + item.allocationPercentage, 0
        );

        const maxCapacity = resource.maxCapacity || 1.0;
        const utilizationPercentage = (currentUtilization / maxCapacity) * 100;

        return {
            currentUtilization: Math.round(currentUtilization * 1000) / 1000, // Round to 3 decimal places
            activeAllocations: breakdown,
            breakdown,
            resourceName: resource.name,
            resourceId: resource.id || resourceId,
            maxCapacity,
            utilizationPercentage: Math.round(utilizationPercentage * 100) / 100 // Round to 2 decimal places
        };
    }

    /**
     * Validate a new allocation request against resource capacity and constraints
     * Requirements: 4.5
     * 
     * @param {Object} allocationRequest - New allocation request
     * @param {Array} existingAllocations - Current allocations
     * @param {Array} teamMembers - Team member records
     * @param {Object} options - Validation options
     * @returns {Object} Validation result
     */
    validateAllocation(allocationRequest, existingAllocations, teamMembers, options = {}) {
        const validationResult = {
            isValid: true,
            warnings: [],
            errors: [],
            conflicts: [],
            recommendations: []
        };

        // Find the resource
        const resource = this._findResource(allocationRequest.resource, teamMembers);
        if (!resource) {
            validationResult.isValid = false;
            validationResult.errors.push(`Resource not found: ${allocationRequest.resource}`);
            return validationResult;
        }

        // Validate allocation percentage
        const requestedPercentage = this._getAllocationPercentage(allocationRequest);
        if (requestedPercentage < 0.1 || requestedPercentage > 1.0) {
            validationResult.isValid = false;
            validationResult.errors.push(`Invalid allocation percentage: ${requestedPercentage}. Must be between 0.1 and 1.0`);
        }

        // Calculate current utilization
        const currentUtilization = this.calculateUtilization(
            allocationRequest.resource, 
            existingAllocations, 
            teamMembers
        );

        // Calculate projected utilization with new allocation
        const projectedUtilization = currentUtilization.currentUtilization + requestedPercentage;
        const maxCapacity = resource.maxCapacity || 1.0;
        const overAllocationThreshold = resource.overAllocationThreshold || 
                                      options.capacityThreshold || 
                                      this.config.defaultCapacityThreshold;

        // Find conflicting allocations (those that contribute to over-allocation)
        const conflictingAllocations = currentUtilization.activeAllocations
            .filter(allocation => allocation.allocationPercentage > 0)
            .map(allocation => ({
                allocationId: allocation.allocationId,
                projectName: allocation.projectName,
                allocationPercentage: allocation.allocationPercentage,
                conflict: 'capacity_overlap'
            }));

        // Check for over-allocation
        if (projectedUtilization > overAllocationThreshold) {
            const overAmount = projectedUtilization - overAllocationThreshold;
            
            if (options.strictEnforcement || this.config.strictEnforcement) {
                validationResult.isValid = false;
                validationResult.errors.push(
                    `Allocation would cause over-allocation. ` +
                    `Projected utilization: ${(projectedUtilization * 100).toFixed(1)}%, ` +
                    `Threshold: ${(overAllocationThreshold * 100).toFixed(1)}%, ` +
                    `Over by: ${(overAmount * 100).toFixed(1)}%`
                );
            } else {
                validationResult.warnings.push(
                    `Allocation will exceed capacity threshold. ` +
                    `Projected utilization: ${(projectedUtilization * 100).toFixed(1)}%`
                );
            }

            // Add conflicting allocations
            validationResult.conflicts = conflictingAllocations;
        } else if (projectedUtilization > maxCapacity) {
            // Only add this warning if we're not already over the threshold
            validationResult.warnings.push(
                `Allocation exceeds resource's maximum capacity (${(maxCapacity * 100).toFixed(0)}%)`
            );
        }

        // Add recommendations
        if (projectedUtilization > 0.8 && projectedUtilization <= maxCapacity) {
            validationResult.recommendations.push(
                'Resource will be at high utilization. Consider monitoring workload closely.'
            );
        }

        if (currentUtilization.activeAllocations.length >= 5) {
            validationResult.recommendations.push(
                'Resource already has many concurrent allocations. Consider task prioritization.'
            );
        }

        return validationResult;
    }

    /**
     * Get resource availability information including capacity and scheduling
     * 
     * @param {string} resourceId - Resource identifier
     * @param {Array} allocations - All allocations
     * @param {Array} teamMembers - Team member records
     * @param {Object} dateRange - Optional date range filter
     * @returns {Object} Resource availability information
     */
    getResourceAvailability(resourceId, allocations, teamMembers, dateRange = null) {
        const resource = this._findResource(resourceId, teamMembers);
        if (!resource) {
            return {
                available: false,
                error: `Resource not found: ${resourceId}`
            };
        }

        const utilization = this.calculateUtilization(resourceId, allocations, teamMembers, dateRange);
        const maxCapacity = resource.maxCapacity || 1.0;
        const overAllocationThreshold = resource.overAllocationThreshold || this.config.defaultCapacityThreshold;

        // Calculate available capacity
        const availableCapacity = Math.max(0, overAllocationThreshold - utilization.currentUtilization);
        const availablePercentage = (availableCapacity * 100);

        // Determine availability status
        let status = 'available';
        const utilizationPercentage = (utilization.currentUtilization / maxCapacity) * 100;
        if (utilizationPercentage > 100) {
            status = 'over-capacity';
        } else if (utilizationPercentage >= 100) {
            status = 'at-capacity';
        } else if (utilizationPercentage >= 80) {
            status = 'high-utilization';
        } else if (utilizationPercentage >= 50) {
            status = 'moderate-utilization';
        }

        return {
            available: availableCapacity > 0,
            resourceName: resource.name,
            resourceId: resource.id || resourceId,
            currentUtilization: utilization.currentUtilization,
            maxCapacity,
            overAllocationThreshold,
            availableCapacity: Math.round(availableCapacity * 1000) / 1000, // Round to 3 decimal places
            availablePercentage: Math.round(availablePercentage * 10) / 10,
            status,
            activeAllocationsCount: utilization.activeAllocations.length,
            utilizationBreakdown: utilization.breakdown
        };
    }

    /**
     * Get utilization summary for all resources
     * 
     * @param {Array} allocations - All allocations
     * @param {Array} teamMembers - Team member records
     * @param {Object} options - Summary options
     * @returns {Array} Array of resource utilization summaries
     */
    getUtilizationSummary(allocations, teamMembers, options = {}) {
        return teamMembers
            .filter(member => member.isActive !== false)
            .map(member => {
                const utilization = this.calculateUtilization(member.name, allocations, teamMembers);
                const overAllocation = this.detectOverAllocation(member.name, allocations, teamMembers);
                
                return {
                    resourceId: member.id,
                    resourceName: member.name,
                    resourceType: member.type,
                    currentUtilization: utilization.currentUtilization,
                    utilizationPercentage: utilization.utilizationPercentage,
                    maxCapacity: member.maxCapacity || 1.0,
                    isOverAllocated: overAllocation.isOverAllocated,
                    overAllocationAmount: overAllocation.overAllocationAmount,
                    activeAllocationsCount: utilization.activeAllocations.length,
                    status: this._getUtilizationStatus(utilization.currentUtilization, member.maxCapacity || 1.0),
                    lastUpdated: new Date().toISOString()
                };
            })
            .sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);
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
     * Check if allocation resource matches the target resource
     * @private
     */
    _matchesResource(allocationResource, targetResourceId, targetResource) {
        return allocationResource === targetResourceId ||
               allocationResource === targetResource.name ||
               (allocationResource && targetResource.name && 
                allocationResource.toLowerCase() === targetResource.name.toLowerCase());
    }

    /**
     * Check if an allocation is currently active
     * @private
     */
    _isActiveAllocation(allocation, dateRange = null) {
        // Filter out completed, cancelled, or idle tasks
        const inactiveStatuses = ['completed', 'cancelled', 'idle'];
        const inactiveTaskNames = ['Completed', 'Idle', 'completed', 'idle'];
        
        if (allocation.status && inactiveStatuses.includes(allocation.status.toLowerCase())) {
            return false;
        }
        
        if (allocation.taskName && inactiveTaskNames.includes(allocation.taskName)) {
            return false;
        }

        // If date range is specified, check if allocation overlaps
        if (dateRange && dateRange.startDate && dateRange.endDate) {
            const allocationStart = allocation.plan?.taskStart ? new Date(allocation.plan.taskStart) : null;
            const allocationEnd = allocation.plan?.taskEnd ? new Date(allocation.plan.taskEnd) : null;
            const rangeStart = new Date(dateRange.startDate);
            const rangeEnd = new Date(dateRange.endDate);

            if (allocationStart && allocationEnd) {
                // Check if allocation overlaps with date range
                return allocationStart <= rangeEnd && allocationEnd >= rangeStart;
            }
        }

        return true;
    }

    /**
     * Get allocation percentage from allocation object
     * @private
     */
    _getAllocationPercentage(allocation) {
        // Check for explicit allocation percentage field
        if (allocation.allocationPercentage !== undefined && allocation.allocationPercentage !== null) {
            return allocation.allocationPercentage; // Don't clamp here, let validation handle it
        }

        // Check for workload field (legacy)
        if (allocation.workload !== undefined && allocation.workload !== null) {
            return allocation.workload; // Don't clamp here, let validation handle it
        }

        // Default to full-time allocation
        return 1.0;
    }

    /**
     * Get utilization status based on current utilization and capacity
     * @private
     */
    _getUtilizationStatus(currentUtilization, maxCapacity) {
        const utilizationPercentage = (currentUtilization / maxCapacity) * 100;
        
        if (utilizationPercentage > 100) {
            return 'over-capacity';
        } else if (utilizationPercentage >= 100) {
            return 'at-capacity';
        } else if (utilizationPercentage >= 80) {
            return 'high-utilization';
        } else if (utilizationPercentage >= 50) {
            return 'moderate-utilization';
        } else {
            return 'available';
        }
    }
}

/**
 * Default instance for convenience
 */
export const resourceAllocationEngine = new ResourceAllocationEngine();

/**
 * Convenience functions that use the default engine instance
 */

/**
 * Detect over-allocation for a resource using default engine
 * @param {string} resourceId - Resource identifier
 * @param {Array} allocations - All active allocations
 * @param {Array} teamMembers - Team member records
 * @param {Object} options - Detection options
 * @returns {Object} Over-allocation detection result
 */
export function detectOverAllocation(resourceId, allocations, teamMembers, options = {}) {
    return resourceAllocationEngine.detectOverAllocation(resourceId, allocations, teamMembers, options);
}

/**
 * Calculate resource utilization using default engine
 * @param {string} resourceId - Resource identifier
 * @param {Array} allocations - All allocations
 * @param {Array} teamMembers - Team member records
 * @param {Object} dateRange - Optional date range filter
 * @returns {Object} Utilization calculation result
 */
export function calculateResourceUtilization(resourceId, allocations, teamMembers, dateRange = null) {
    return resourceAllocationEngine.calculateUtilization(resourceId, allocations, teamMembers, dateRange);
}

/**
 * Validate allocation request using default engine
 * @param {Object} allocationRequest - New allocation request
 * @param {Array} existingAllocations - Current allocations
 * @param {Array} teamMembers - Team member records
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateAllocationRequest(allocationRequest, existingAllocations, teamMembers, options = {}) {
    return resourceAllocationEngine.validateAllocation(allocationRequest, existingAllocations, teamMembers, options);
}

/**
 * Get resource availability using default engine
 * @param {string} resourceId - Resource identifier
 * @param {Array} allocations - All allocations
 * @param {Array} teamMembers - Team member records
 * @param {Object} dateRange - Optional date range filter
 * @returns {Object} Resource availability information
 */
export function getResourceAvailability(resourceId, allocations, teamMembers, dateRange = null) {
    return resourceAllocationEngine.getResourceAvailability(resourceId, allocations, teamMembers, dateRange);
}

/**
 * Get utilization summary for all resources using default engine
 * @param {Array} allocations - All allocations
 * @param {Array} teamMembers - Team member records
 * @param {Object} options - Summary options
 * @returns {Array} Array of resource utilization summaries
 */
export function getUtilizationSummary(allocations, teamMembers, options = {}) {
    return resourceAllocationEngine.getUtilizationSummary(allocations, teamMembers, options);
}