# Requirements Document

## Introduction

This specification addresses critical business logic optimization needs for the project management and resource allocation application. Based on comprehensive analysis against industry standards (SAP Project System, Microsoft Project, Tempo, Smartsheet), this optimization focuses on fixing broken complexity models, implementing proper tier-based cost calculations, and enhancing resource management capabilities.

The current working days calculation (Monday-Friday, excluding holidays/leave) is already industry-standard correct and requires no changes. The existing 5-tier system (Junior to Principal) provides an excellent foundation that will be leveraged for skill-based adjustments.

## Glossary

- **System**: The project management and resource allocation application
- **Complexity_Model**: The system component that defines effort estimation parameters for tasks
- **Tier_System**: The existing 5-level skill classification (1=Junior, 2=Mid, 3=Senior, 4=Lead, 5=Principal)
- **Effort_Hours**: Actual work hours required to complete a task
- **Duration_Days**: Calendar working days from task start to completion
- **Allocation_Percentage**: The percentage of a resource's capacity assigned to a task (0.0 to 1.0)
- **Cost_Center**: Budget management entity with monthly/yearly budget limits
- **Resource**: A team member with specific skills, tier level, and cost rates
- **Over_Allocation**: When a resource's total assignments exceed their available capacity

## Requirements

### Requirement 1: Fix Broken Complexity Model

**User Story:** As a project manager, I want accurate effort estimation based on actual work hours, so that I can create realistic project plans and budgets.

#### Acceptance Criteria

1. THE System SHALL replace the current arbitrary "hours" multipliers with actual effort hours in the complexity model
2. WHEN defining task complexity, THE System SHALL separate effort hours from duration days properly
3. THE System SHALL provide base effort hours for each complexity level (low: 40h, medium: 120h, high: 320h, sophisticated: 640h)
4. THE System SHALL include complexity multipliers, risk factors, and skill sensitivity parameters for each complexity level
5. THE System SHALL maintain backward compatibility with existing allocations during the transition

### Requirement 2: Implement Tier-Based Skill Adjustments

**User Story:** As a resource manager, I want effort estimates adjusted based on team member skill levels, so that I can accurately plan resource allocation and costs.

#### Acceptance Criteria

1. THE System SHALL use the existing tierLevel field (1=Junior to 5=Principal) for skill-based effort adjustments
2. WHEN calculating effort, THE System SHALL apply tier-based multipliers (Junior: 1.4x, Mid: 1.0x, Senior: 0.8x, Lead: 0.7x, Principal: 0.6x)
3. THE System SHALL adjust effort multipliers based on task complexity sensitivity to skill level
4. WHEN a Junior resource is assigned, THE System SHALL increase effort estimates by up to 40% compared to Mid-level baseline
5. WHEN a Principal resource is assigned, THE System SHALL decrease effort estimates by up to 40% compared to Mid-level baseline

### Requirement 3: Update Cost Calculation Formula

**User Story:** As a financial controller, I want accurate cost calculations based on actual effort and skill-adjusted rates, so that I can maintain proper budget control.

#### Acceptance Criteria

1. THE System SHALL calculate project costs using the formula: Actual Effort Hours × Tier-Adjusted Hourly Rate
2. WHEN calculating costs, THE System SHALL apply complexity multipliers, skill adjustments, and risk factors to base effort hours
3. THE System SHALL calculate duration separately as: Effort Hours ÷ (Allocation Percentage × 8 hours/day)
4. THE System SHALL provide detailed cost breakdowns showing base hours, skill multipliers, complexity factors, and final costs
5. THE System SHALL maintain the existing rate calculation structure (monthly → daily → hourly) while applying the new formula

### Requirement 4: Add Resource Over-Allocation Detection

**User Story:** As a resource manager, I want to detect when team members are over-allocated, so that I can prevent resource conflicts and maintain realistic schedules.

#### Acceptance Criteria

1. THE System SHALL track each resource's current utilization across all active allocations
2. WHEN total allocation exceeds a resource's capacity threshold, THE System SHALL flag the over-allocation
3. THE System SHALL support configurable over-allocation thresholds per resource (default: 120% capacity)
4. THE System SHALL provide real-time utilization monitoring and conflict alerts
5. THE System SHALL prevent new allocations that would cause over-allocation when strict enforcement is enabled

### Requirement 5: Implement Budget Enforcement

**User Story:** As a cost center manager, I want to prevent allocations that exceed available budget, so that I can maintain financial control without approval workflows.

#### Acceptance Criteria

1. THE System SHALL validate budget capacity before creating new allocations
2. WHEN an allocation would exceed the cost center's available budget, THE System SHALL prevent the allocation
3. THE System SHALL provide configurable budget enforcement modes (strict, warning, none)
4. THE System SHALL calculate projected spend including the new allocation against remaining budget
5. THE System SHALL display clear budget status and remaining capacity for each cost center

### Requirement 6: Add Percentage-Based Allocation Support

**User Story:** As a project manager, I want to assign resources at partial capacity percentages, so that I can share resources across multiple projects efficiently.

#### Acceptance Criteria

1. THE System SHALL support allocation percentages from 0.1 (10%) to 1.0 (100%) of resource capacity
2. WHEN calculating duration, THE System SHALL adjust timeline based on allocation percentage
3. THE System SHALL calculate effective hours as: Base Effort Hours ÷ Allocation Percentage
4. THE System SHALL track and display both allocated percentage and effective working hours
5. THE System SHALL validate that total allocations per resource do not exceed their maximum capacity

### Requirement 7: Enhance Validation for Resource Availability

**User Story:** As a project manager, I want comprehensive validation of resource availability and constraints, so that I can create feasible project plans.

#### Acceptance Criteria

1. THE System SHALL validate resource availability during the requested time period before creating allocations
2. WHEN checking availability, THE System SHALL consider existing allocations, leave schedules, and capacity limits
3. THE System SHALL validate skill match between resource capabilities and task requirements
4. THE System SHALL check workload limits and prevent assignments that exceed sustainable capacity
5. THE System SHALL provide detailed validation feedback explaining any conflicts or constraints

### Requirement 8: Multi-Factor Complexity Scoring

**User Story:** As a technical lead, I want complexity assessment based on multiple factors, so that I can create more accurate effort estimates.

#### Acceptance Criteria

1. THE System SHALL support technical complexity, business complexity, and risk factor scoring (1-10 scale each)
2. WHEN calculating effort, THE System SHALL combine multiple complexity factors into a composite score
3. THE System SHALL apply different skill sensitivity based on the type of complexity (technical vs business)
4. THE System SHALL track integration points and unknown requirements as additional complexity factors
5. THE System SHALL provide complexity factor breakdown in effort estimation reports

### Requirement 9: Enhanced Working Days Calculation

**User Story:** As a project manager, I want enhanced working days calculation with detailed breakdowns, so that I can better understand project timelines and scheduling.

#### Acceptance Criteria

1. THE System SHALL maintain the existing Indonesia-specific holiday calendar and working day logic
2. WHEN calculating working days, THE System SHALL provide detailed breakdowns showing total calendar days, weekends, holidays, and working days
3. THE System SHALL maintain the current 20 working days per month baseline for Indonesia operations
4. THE System SHALL support overhead factors and inflation adjustments in rate calculations
5. THE System SHALL provide working days analysis reports for project planning purposes

### Requirement 10: Performance Optimization for Large Datasets

**User Story:** As a system administrator, I want the application to perform efficiently with large numbers of allocations and resources, so that users have a responsive experience.

#### Acceptance Criteria

1. THE System SHALL implement debounced recalculation with 500ms delay to prevent excessive computation
2. WHEN dependencies change, THE System SHALL selectively recalculate only affected allocations
3. THE System SHALL use memoized calculations for frequently accessed computed values
4. THE System SHALL support pagination and virtualization for large allocation lists
5. THE System SHALL optimize memory usage by avoiding full cost center snapshots in every allocation

### Requirement 11: Enhanced Reporting and Analytics

**User Story:** As an executive, I want comprehensive reporting on resource utilization and project costs, so that I can make informed business decisions.

#### Acceptance Criteria

1. THE System SHALL provide real-time resource utilization dashboards showing capacity and allocation status
2. WHEN generating reports, THE System SHALL include cost breakdowns by complexity factors and skill adjustments
3. THE System SHALL track historical variance between estimated and actual effort for continuous improvement
4. THE System SHALL provide portfolio-level aggregation of resource usage across multiple projects
5. THE System SHALL support export of allocation and cost data for external analysis tools