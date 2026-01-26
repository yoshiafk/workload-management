# Manual Verification Guide - Business Logic Improvements

## Overview

This guide provides step-by-step instructions to manually verify that all business logic improvements are working correctly across the application. Follow these tests to ensure proper implementation.

---

## 1. Core Complexity Model Verification

### Test 1.1: Effort-Based Calculations
**Location**: Create/Edit Allocation page

**Steps**:
1. Create a new allocation with "Project" category
2. Select different complexity levels (Low, Medium, High, Sophisticated)
3. **Verify**: Each complexity shows different effort hours:
   - Low: ~40 hours base effort
   - Medium: ~120 hours base effort  
   - High: ~320 hours base effort
   - Sophisticated: ~640 hours base effort

**Expected Result**: ✅ Effort hours should be realistic work estimates, not arbitrary multipliers

### Test 1.2: Complexity Multipliers
**Location**: Allocation cost breakdown

**Steps**:
1. Create allocation with same resource but different complexity
2. Check cost breakdown details
3. **Verify**: Complexity multiplier affects final effort:
   - Low complexity: 0.8x multiplier
   - Medium complexity: 1.0x multiplier
   - High complexity: 1.5x multiplier
   - Sophisticated: 2.5x multiplier

**Expected Result**: ✅ Higher complexity = higher effort hours after multipliers applied

---

## 2. Tier-Based Skill Adjustments Verification

### Test 2.1: Skill Multiplier Application
**Location**: Create Allocation with different team members

**Steps**:
1. Create identical allocations for team members of different tiers:
   - Junior (Tier 1)
   - Mid (Tier 2) 
   - Senior (Tier 3)
   - Lead (Tier 4)
   - Principal (Tier 5)
2. Use same complexity and project
3. **Verify**: Effort hours vary by tier:
   - Junior: 40% MORE effort than Mid
   - Senior: 20% LESS effort than Mid
   - Lead: 30% LESS effort than Mid
   - Principal: 40% LESS effort than Mid

**Expected Result**: ✅ Junior requires most effort, Principal requires least effort

### Test 2.2: Skill Sensitivity
**Location**: Compare different complexity levels

**Steps**:
1. Create allocations with Junior vs Principal for:
   - Low complexity (low skill sensitivity)
   - Sophisticated complexity (high skill sensitivity)
2. **Verify**: Skill difference is more pronounced for sophisticated tasks

**Expected Result**: ✅ Tier impact varies based on complexity skill sensitivity

---

## 3. Cost Calculation Formula Verification

### Test 3.1: Cost Formula Accuracy
**Location**: Allocation cost breakdown

**Steps**:
1. Create allocation and note:
   - Base effort hours
   - Skill multiplier applied
   - Complexity multiplier applied
   - Hourly rate
2. **Verify**: Total Cost = (Base Hours × Skill Multiplier × Complexity Multiplier) × Hourly Rate

**Expected Result**: ✅ Cost calculation follows proper formula

### Test 3.2: Effort vs Duration Separation
**Location**: Allocation planning details

**Steps**:
1. Create allocation with 50% allocation percentage
2. **Verify**:
   - Effort hours = actual work required
   - Duration days = effort hours ÷ (allocation percentage × 8 hours/day)
   - Duration should be DOUBLE the effort days for 50% allocation

**Expected Result**: ✅ Effort and duration are calculated separately

---

## 4. Resource Over-Allocation Detection

### Test 4.1: Over-Allocation Flagging
**Location**: Resource Allocation page / Workload Summary

**Steps**:
1. Create multiple allocations for same resource
2. Ensure total allocation percentage > 100%
3. **Verify**: 
   - Resource shows "Over Capacity" status (red color)
   - Over-allocation warning appears
   - Utilization percentage > 100%

**Expected Result**: ✅ Over-allocation is detected and flagged

### Test 4.2: Capacity Threshold Configuration
**Location**: Resource management

**Steps**:
1. Check resource with exactly 100% allocation
2. Check resource with 120% allocation
3. **Verify**:
   - 100% = "At Capacity" (orange)
   - >100% = "Over Capacity" (red)

**Expected Result**: ✅ Different status for 100% vs >100% utilization

---

## 5. Budget Enforcement Verification

### Test 5.1: Budget Validation
**Location**: Create Allocation page

**Steps**:
1. Find cost center near budget limit
2. Try creating allocation that would exceed budget
3. **Verify**: 
   - Warning or prevention based on enforcement mode
   - Budget remaining calculation is accurate
   - Projected spend includes new allocation

**Expected Result**: ✅ Budget enforcement prevents/warns about over-budget allocations

### Test 5.2: Enforcement Modes
**Location**: Cost center settings

**Steps**:
1. Test different enforcement modes:
   - Strict: Should prevent over-budget allocation
   - Warning: Should allow with warning
   - None: Should allow without restriction

**Expected Result**: ✅ Each mode behaves differently

---

## 6. Selective Complexity Calculation

### Test 6.1: Task Category Behavior
**Location**: Create Allocation page

**Steps**:
1. Create allocation with "Project" category
2. Create allocation with "Support" category
3. Create allocation with "Maintenance" category
4. **Verify**:
   - Project: Uses complexity calculations
   - Support: Uses simple time estimates from templates
   - Maintenance: Uses simple time estimates from templates

**Expected Result**: ✅ Only Project tasks use complexity calculations

### Test 6.2: Simple vs Complex Calculations
**Location**: Cost breakdown comparison

**Steps**:
1. Compare Project vs Support allocation cost breakdowns
2. **Verify**:
   - Project: Shows complexity multipliers, skill adjustments
   - Support: Shows simple template-based estimates

**Expected Result**: ✅ Different calculation methods used

---

## 7. SLA Priority Mapping Verification

### Test 7.1: Priority Time Mappings
**Location**: Support task creation/viewing

**Steps**:
1. Create or view tasks with different priorities:
   - P1 (Critical): 1h response, 4h resolution
   - P2 (High): 4h response, 24h resolution  
   - P3 (Medium): 8h response, 72h resolution
   - P4 (Low): 24h response, 168h resolution
2. **Verify**: SLA times match expected values

**Expected Result**: ✅ Each priority has correct SLA time requirements

### Test 7.2: SLA Compliance Tracking
**Location**: Support dashboard/reports

**Steps**:
1. View SLA compliance status for active tasks
2. **Verify**:
   - "Within SLA" for tasks with time remaining
   - "At Risk" for tasks approaching deadline
   - "Breached" for overdue tasks

**Expected Result**: ✅ SLA status accurately reflects time remaining

---

## 8. Phase-Based Duration Calculation

### Test 8.1: Phase Span Calculation
**Location**: Dashboard/Timeline views

**Steps**:
1. View allocation in different phases (Planning, Execution, etc.)
2. Check phase span calculation to completion
3. **Verify**:
   - Shows time from current phase to completion
   - Handles both actual and projected calculations
   - Provides human-readable time spans

**Expected Result**: ✅ Phase spans calculated correctly

### Test 8.2: Completed Task Handling
**Location**: Completed allocations

**Steps**:
1. View allocation already in "Completed" phase
2. **Verify**: Shows 0 days/hours span with appropriate message

**Expected Result**: ✅ Completed tasks show zero span

---

## 9. Capacity Status Terminology

### Test 9.1: Status Display
**Location**: Workload Summary, Resource views

**Steps**:
1. Find resources with different utilization levels:
   - <100%: Should show appropriate status (Available, High Utilization, etc.)
   - Exactly 100%: Should show "At Capacity" (orange)
   - >100%: Should show "Over Capacity" (red)

**Expected Result**: ✅ Correct terminology and colors displayed

### Test 9.2: Color Consistency
**Location**: All UI components showing capacity

**Steps**:
1. Check capacity colors across:
   - Workload Summary
   - Resource Allocation page
   - Dashboard heatmaps
   - Status badges
2. **Verify**: Consistent color scheme everywhere

**Expected Result**: ✅ Colors aligned across all components

---

## 10. Enhanced Dashboard Date Filtering

### Test 10.1: Quick Filter Options
**Location**: Dashboard date filter

**Steps**:
1. Open date filter modal
2. **Verify** quick filter buttons exist:
   - Today
   - This Week  
   - This Month
   - Last Week
   - Last Month
   - Next Week
   - Next Month
3. Click each button and verify correct date range applied

**Expected Result**: ✅ Quick filters set correct date ranges

### Test 10.2: Enhanced Modal Features
**Location**: Date picker modal

**Steps**:
1. Open date picker modal
2. **Verify** enhanced features:
   - Visual quick filter buttons with icons
   - Custom date range inputs
   - Filter preview/statistics (if enabled)
   - Clear/reset functionality
   - Smooth animations

**Expected Result**: ✅ Modal provides improved user experience

---

## 11. Demand Number Search

### Test 11.1: Basic Search Functionality
**Location**: Resource Allocation page

**Steps**:
1. Find demand number search input
2. Enter demand number (e.g., "DEM-2024-001")
3. **Verify**:
   - Only Support category issues shown
   - Exact matches appear first
   - Partial matches included
   - Search is case-insensitive

**Expected Result**: ✅ Search finds relevant Support issues

### Test 11.2: Extended Search Features
**Location**: Demand number search

**Steps**:
1. Search for partial terms (e.g., "2024")
2. Search for ticket IDs
3. Search for activity names
4. **Verify**:
   - Searches across multiple fields
   - Related demand patterns found
   - Results grouped appropriately

**Expected Result**: ✅ Extended search finds related issues

---

## 12. Integration Testing

### Test 12.1: End-to-End Allocation Creation
**Location**: Complete allocation workflow

**Steps**:
1. Create new allocation from start to finish
2. **Verify** all improvements work together:
   - Complexity calculations (if Project)
   - Tier-based adjustments
   - Proper cost formula
   - Over-allocation detection
   - Budget validation
   - Capacity status updates

**Expected Result**: ✅ All systems work together seamlessly

### Test 12.2: Existing Data Compatibility
**Location**: Existing allocations

**Steps**:
1. View existing allocations created before improvements
2. Edit existing allocation
3. **Verify**:
   - Old allocations still display correctly
   - Editing applies new business logic
   - No data corruption or errors

**Expected Result**: ✅ Backward compatibility maintained

---

## 13. Performance Verification

### Test 13.1: Calculation Speed
**Location**: Large allocation lists

**Steps**:
1. View pages with many allocations (50+)
2. Apply filters and searches
3. Create new allocations
4. **Verify**:
   - Pages load quickly (<2 seconds)
   - Filters respond immediately
   - Calculations complete without delay

**Expected Result**: ✅ Performance remains acceptable

### Test 13.2: Memory Usage
**Location**: Browser developer tools

**Steps**:
1. Monitor memory usage during normal operations
2. Create/edit multiple allocations
3. **Verify**: No significant memory leaks or excessive usage

**Expected Result**: ✅ Memory usage remains stable

---

## 14. Error Handling Verification

### Test 14.1: Invalid Input Handling
**Location**: Various input forms

**Steps**:
1. Try invalid inputs:
   - Negative allocation percentages
   - Invalid dates
   - Missing required fields
   - Extreme values
2. **Verify**: Graceful error handling with helpful messages

**Expected Result**: ✅ Errors handled gracefully

### Test 14.2: Edge Case Handling
**Location**: Various scenarios

**Steps**:
1. Test edge cases:
   - 0% allocation
   - 100% allocation
   - Resources without tier levels
   - Tasks without complexity
2. **Verify**: System handles edge cases appropriately

**Expected Result**: ✅ Edge cases handled correctly

---

## Verification Completion Checklist

### Core Business Logic ✅
- [ ] Complexity model uses actual effort hours
- [ ] Tier adjustments affect calculations
- [ ] Cost formula is mathematically correct
- [ ] Effort and duration calculated separately

### Resource Management ✅
- [ ] Over-allocation detection works
- [ ] Percentage-based allocations supported
- [ ] Resource validation comprehensive
- [ ] Capacity tracking accurate

### User Features ✅
- [ ] Selective complexity by task category
- [ ] SLA priority mappings correct
- [ ] Phase duration calculations work
- [ ] Capacity terminology updated
- [ ] Date filtering enhanced
- [ ] Demand number search functional

### Integration & Performance ✅
- [ ] All features work together
- [ ] Backward compatibility maintained
- [ ] Performance acceptable
- [ ] Error handling robust

---

## Troubleshooting Common Issues

### Issue: Calculations seem incorrect
**Check**: 
- Verify complexity model has `baseEffortHours` not `hours`
- Confirm tier multipliers are applied
- Check allocation percentage affects duration

### Issue: Over-allocation not detected
**Check**:
- Resource has `maxCapacity` and `overAllocationThreshold` set
- Total allocation percentages exceed threshold
- Status calculation logic updated

### Issue: UI shows old terminology
**Check**:
- Status badge component updated
- Resource allocation logic updated
- All UI components using new status values

### Issue: Search not working
**Check**:
- DashboardEngine has search methods
- UI integration in ResourceAllocation page
- Search input connected to filter logic

---

## Final Verification Sign-off

After completing all tests above, the business logic improvements are verified as:

- [ ] **Functionally Complete**: All features work as designed
- [ ] **Properly Integrated**: Features work together seamlessly  
- [ ] **User-Friendly**: UI improvements enhance user experience
- [ ] **Performance Optimized**: System remains responsive
- [ ] **Error-Resistant**: Graceful handling of edge cases
- [ ] **Backward Compatible**: Existing data continues to work

**Verification Completed By**: _________________ **Date**: _________

**Ready for Production Deployment**: ☐ Yes ☐ No (see issues below)

**Outstanding Issues**: 
_________________________________
_________________________________
_________________________________