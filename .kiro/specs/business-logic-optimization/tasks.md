# Implementation Plan: Business Logic Optimization

## Overview

This implementation plan addresses the critical business logic optimization needs identified in the analysis. The tasks are prioritized by impact, focusing first on fixing the broken complexity model and cost calculations, then enhancing resource management, and finally implementing UI/UX improvements and advanced features.

The plan is structured to build incrementally, ensuring each step validates core functionality early through code and maintains backward compatibility with existing allocations.

## Tasks

- [ ] 1. Fix Core Complexity Model and Cost Calculations (HIGHEST PRIORITY)
  - [x] 1.1 Update defaultComplexity.js with effort-based model
    - Replace arbitrary "hours" multipliers with actual effort hours (40h, 120h, 320h, 640h)
    - Add complexity multipliers, risk factors, and skill sensitivity parameters
    - Maintain backward compatibility during transition
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [x] 1.2 Write property test for effort-based complexity model
    - **Property 1: Effort-Based Complexity Model Correctness**
    - **Validates: Requirements 1.1, 1.4**

  - [x] 1.3 Implement tier-based skill adjustment calculations
    - Create getTierEffortMultiplier function using existing tierLevel (1-5)
    - Apply skill multipliers (Junior: 1.4x, Mid: 1.0x, Senior: 0.8x, Lead: 0.7x, Principal: 0.6x)
    - Integrate skill sensitivity factors from complexity model
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 1.4 Write property test for tier-based skill adjustments
    - **Property 3: Tier-Based Skill Adjustment Correctness**
    - **Validates: Requirements 2.1, 2.3, 2.4, 2.5**

  - [x] 1.5 Update calculations.js with new cost formula
    - Replace calculateProjectCost with tier-aware version
    - Implement formula: Actual Effort Hours × Tier-Adjusted Hourly Rate
    - Separate effort hours from duration days calculation
    - Provide detailed cost breakdowns
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 1.6 Write property tests for cost calculation correctness
    - **Property 4: Cost Calculation Formula Correctness**
    - **Property 5: Cost Breakdown Completeness**
    - **Validates: Requirements 3.1, 3.2, 3.4, 3.5**

  - [x] 1.7 Write property test for effort-duration separation
    - **Property 2: Effort-Duration Separation**
    - **Validates: Requirements 1.2, 3.3, 6.2, 6.3**

- [x] 2. Checkpoint - Validate Core Calculations
  - Ensure all complexity and cost calculation tests pass, ask the user if questions arise.

- [ ] 3. Implement Resource Management Enhancements (MEDIUM PRIORITY)
  - [x] 3.1 Add resource over-allocation detection
    - Create ResourceAllocationEngine class in new utils/resourceAllocation.js
    - Implement detectOverAllocation method with configurable thresholds
    - Add real-time utilization tracking across all active allocations
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 3.2 Write property tests for resource utilization tracking
    - **Property 6: Resource Utilization Tracking Accuracy**
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [x] 3.3 Implement percentage-based allocation support
    - Add allocationPercentage field to allocation model
    - Update duration calculations to use allocation percentage
    - Calculate effective hours based on percentage
    - Validate percentage ranges (0.1 to 1.0)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 3.4 Write property tests for percentage-based allocations
    - **Property 9: Allocation Percentage Validation**
    - **Property 10: Percentage-Based Allocation Calculations**
    - **Validates: Requirements 6.1, 6.4, 6.5**

  - [x] 3.5 Add comprehensive resource validation
    - Create ValidationEngine class in new utils/validationEngine.js
    - Implement pre-allocation validation for availability, skills, capacity
    - Add detailed validation feedback and conflict resolution
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 3.6 Write property test for comprehensive resource validation
    - **Property 11: Comprehensive Resource Validation**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

- [ ] 4. Implement Budget Enforcement (MEDIUM PRIORITY)
  - [x] 4.1 Add budget capacity validation
    - Create CostCenterManager class in new utils/costCenterManager.js
    - Implement budget enforcement with configurable modes (strict/warning/none)
    - Add projected spend calculations including new allocations
    - Prevent over-budget allocations when strict enforcement enabled
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.2 Write property tests for budget enforcement
    - **Property 8: Budget Enforcement Correctness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [x] 4.3 Add over-allocation prevention
    - Integrate over-allocation detection with allocation creation workflow
    - Implement strict enforcement mode to prevent over-allocation
    - Provide clear feedback about capacity conflicts
    - _Requirements: 4.5_

  - [x] 4.4 Write property test for over-allocation prevention
    - **Property 7: Over-Allocation Prevention**
    - **Validates: Requirements 4.5**

- [x] 5. Checkpoint - Validate Resource and Budget Management
  - Ensure all resource management and budget enforcement tests pass, ask the user if questions arise.

- [ ] 6. Implement User-Requested Enhancements (LOWER PRIORITY)
  - [x] 6.1 Add selective complexity calculation
    - Create TaskTypeClassifier to determine when to apply complexity
    - Apply complexity calculations only to Project tasks
    - Use simple time estimates for Support/Maintenance tasks
    - _User Requirement: Remove Complexity Calculation except for Project Task_

  - [x] 6.2 Write property test for selective complexity application
    - **Property 18: Selective Complexity Application**
    - **Validates: User Requirement - Remove Complexity Calculation except for Project Task**

  - [x] 6.3 Implement SLA priority mapping
    - Create SLAEngine class for priority-to-time mapping
    - Define SLA requirements for each priority level
    - Add SLA compliance tracking
    - _User Requirement: Set SLA time mapping to Priority_

  - [x] 6.4 Write property test for SLA priority mapping
    - **Property 17: SLA Priority Mapping Correctness**
    - **Validates: User Requirement - SLA Time Mapping to Priority**

  - [x] 6.5 Add phase-based duration calculation
    - Implement calculatePhaseSpan method in DashboardEngine
    - Calculate time spans from allocation phase to completion phase
    - Update allocation model to support phase tracking
    - _User Requirement: Calculate span until phase Completed_

  - [x] 6.6 Write property test for phase-based duration calculation
    - **Property 19: Phase-Based Duration Calculation**
    - **Validates: User Requirement - Calculate span until phase Completed**

- [ ] 7. Implement UI/UX Enhancements (LOWER PRIORITY)
  - [x] 7.1 Update capacity status terminology
    - Change "At Capacity" to "Over Capacity" for >100% utilization
    - Update all UI components and status displays
    - Align color schemes for member load status
    - _User Requirement: Update At Capacity word into Over Capacity, Align color for Member Load Status_

  - [x] 7.2 Write property test for capacity status terminology
    - **Property 20: Capacity Status Terminology Accuracy**
    - **Validates: User Requirement - Update At Capacity word into Over Capacity**

  - [x] 7.3 Enhance dashboard date filtering
    - Update date filter functions on dashboard view
    - Improve date picker modal implementation
    - Add quick filter options (Today, This Week, This Month)
    - _User Requirement: Update Date Filter Function on Dashboard View, Check modal for Date Picker Implementation_

  - [~] 7.4 Write property test for dashboard date filter functionality
    - **Property 21: Dashboard Date Filter Functionality**
    - **Validates: User Requirement - Update Date Filter Function on Dashboard View**

  - [x] 7.5 Add demand number search for Support issues
    - Implement search functionality for Support issue demand numbers
    - Add optional demand number field to Support tasks
    - Enable search by related demand numbers
    - _User Requirement: Add Search Demand Number if Support Issue_

  - [~] 7.6 Write property test for demand number search capability
    - **Property 22: Demand Number Search Capability**
    - **Validates: User Requirement - Add Search Demand Number for Support Issue**

- [ ] 8. Implement Advanced Features (LOWER PRIORITY)
  - [~] 8.1 Add multi-factor complexity scoring
    - Extend complexity model with technical/business/risk factors (1-10 scale)
    - Implement composite scoring algorithm
    - Add different skill sensitivities by complexity type
    - Track integration points and unknown requirements
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [~] 8.2 Write property test for multi-factor complexity scoring
    - **Property 12: Multi-Factor Complexity Scoring**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

  - [~] 8.3 Enhance working days calculation with overhead factors
    - Add overhead factors and inflation adjustments to rate calculations
    - Provide detailed working days breakdowns
    - Maintain existing Indonesia-specific holiday logic
    - _Requirements: 9.1, 9.2, 9.4, 9.5_

  - [~] 8.4 Write property test for working days calculation preservation
    - **Property 13: Working Days Calculation Preservation**
    - **Validates: Requirements 9.1, 9.2, 9.4**

- [ ] 9. Implement Performance Optimizations (LOWER PRIORITY)
  - [~] 9.1 Add selective recalculation and memoization
    - Implement debounced recalculation with 500ms delay
    - Add selective recalculation for only affected allocations
    - Implement memoized calculations for frequently accessed values
    - Optimize memory usage by avoiding full cost center snapshots
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [~] 9.2 Write property test for performance optimization correctness
    - **Property 14: Performance Optimization Correctness**
    - **Validates: Requirements 10.2, 10.3, 10.5**

- [ ] 10. Implement Enhanced Reporting and Analytics (LOWER PRIORITY)
  - [~] 10.1 Add comprehensive reporting capabilities
    - Create real-time resource utilization dashboards
    - Add cost breakdowns by complexity factors and skill adjustments
    - Implement historical variance tracking (estimated vs actual)
    - Add portfolio-level aggregation across projects
    - Support data export for external analysis tools
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [~] 10.2 Write property test for reporting data accuracy
    - **Property 15: Reporting Data Accuracy**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**

- [ ] 11. Integration and Auto-Recalculation Updates
  - [x] 11.1 Update AppContext.jsx for auto-recalculation integration
    - Integrate new calculation engines with existing auto-recalculation system
    - Update dependency tracking for new complexity and cost models
    - Ensure backward compatibility with existing allocation data
    - Add performance optimizations to recalculation triggers
    - _Requirements: 1.5, 10.2, 10.3_

  - [~] 11.2 Write property test for backward compatibility preservation
    - **Property 16: Backward Compatibility Preservation**
    - **Validates: Requirements 1.5**

- [ ] 12. Final Integration Testing and Validation
  - [~] 12.1 Comprehensive integration testing
    - Test end-to-end allocation creation workflow with new calculations
    - Validate cross-component data consistency
    - Test performance under realistic data volumes
    - Verify backward compatibility with existing allocations
    - _All Requirements_

  - [~] 12.2 Write integration tests for complete workflow
    - Test allocation creation from start to finish
    - Validate all calculation engines work together
    - Test error handling and recovery scenarios

- [~] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation from start
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Tasks are prioritized by impact: Core fixes → Resource management → UI enhancements → Advanced features
- Backward compatibility is maintained throughout the implementation
- Performance optimizations are applied incrementally to avoid disrupting core functionality