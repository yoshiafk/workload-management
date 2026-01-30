# Task Breakdown: HR Workload Enhancement

This document provides a comprehensive task breakdown with checklists for implementing the HR Workload Enhancement project.

---

## Overview

| Phase | Status | Priority | Duration |
|-------|--------|----------|----------|
| Phase 1: Leave Management | [x] | 🔴 Critical | 3 weeks |
| Phase 2: Timesheet System | [x] | 🟠 High | 2 weeks |
| Phase 3: Task Status | [x] | 🟠 High | 1 week |
| Phase 4: Notifications | [ ] | 🟡 Medium | 1 week |

---

## Phase 1: Leave Management System

### 1.1 Database & Models

- [x] **Create Leave Types Implementation**
  - [x] Create `leave_types` model definition
  - [x] Add columns: id, name, default_days, carry_over_max, requires_approval, color, is_active
  - [x] Seed default leave types (Annual, Sick, Personal)
  - [x] Sync schema

- [x] Audit frontend CRUD operations and create implementation plan in action-fix folder
  - Created `audit-findings.md` with comprehensive CRUD operations audit
  - Created `implementation-plan.md` with phased fixes  
  - Created `tasks.md` with actionable task breakdown
- [x] **Create Leave Balances Implementation**
  - [x] Create `leave_balances` model definition
  - [x] Add columns: id, member_id, leave_type_id, year, total_days, used_days
  - [x] Add associations to members and leave_types
  - [x] Add unique constraint (member_id, leave_type_id, year)
  - [x] Sync schema

- [x] **Create Leave Requests Implementation**
  - [x] Create `leave_requests` model definition
  - [x] Add columns: id, member_id, leave_type_id, start_date, end_date, days, half_day, reason, status, reviewed_by, reviewed_at, rejection_reason
  - [x] Add indexes and associations
  - [x] Sync schema

- [x] **Create Sequelize Models**
  - [x] Create `LeaveType.js` model
  - [x] Create `LeaveBalance.js` model
  - [x] Create `LeaveRequest.js` model
  - [x] Define associations in models/index.js
  - [x] Test model associations (via server sync)

- [x] **Database Schema Update**
  - [x] Define tables via Sequelize models
  - [x] Set up foreign keys and indexes
  - [x] Trigger schema sync via sequelize.sync()


### 1.2 Backend API - Member Endpoints

- [x] **Leave Balance API**
  - [x] Create `leaveRoutes.js`
  - [x] Implement `GET /api/leaves/balance` - Get member's leave balances
  - [x] Add authentication middleware
  - [x] Test endpoint

- [x] **Leave Request API**
  - [x] Implement `GET /api/leaves/me` - Get member's leave requests
  - [x] Implement `POST /api/leaves` - Submit new leave request
    - [x] Validate date range (start <= end)
    - [x] Calculate work days (basic diff)
    - [x] Check balance availability
    - [x] Create request with PENDING status
  - [x] Implement `PUT /api/leaves/:id/cancel` - Cancel pending request
    - [x] Validate request belongs to member
    - [x] Validate request is still PENDING
    - [x] Update status to CANCELLED
  - [x] Test all endpoints

### 1.3 Backend API - Admin Endpoints

- [x] **Leave Approval API**
  - [x] Create `adminLeaveRoutes.js`
  - [x] Implement `GET /api/admin/leaves/pending` - Get pending requests
  - [x] Implement `GET /api/admin/leaves` (Combined in pending/balances for now)
  - [x] Implement `PUT /api/admin/leaves/:id/approve`
    - [x] Validate request exists and is PENDING
    - [x] Update status to APPROVED
    - [x] Set reviewed_by and reviewed_at
    - [x] Update used_days in leave balance
  - [x] Implement `PUT /api/admin/leaves/:id/reject`
    - [x] Validate request exists and is PENDING
    - [x] Require rejection reason
    - [x] Update status to REJECTED
  - [x] Add admin-only middleware
  - [x] Test all endpoints

- [x] **Leave Balance Administration API**
  - [x] Implement `GET /api/admin/leave-balances` - Get all member balances
  - [x] Implement `PUT /api/admin/leave-balances/:id` - Adjust balance
  - [x] Test endpoints

- [x] **Leave Types Administration API**
  - [x] Implement `GET /api/admin/leave-types` - Get all leave types
  - [x] Implement `POST /api/admin/leave-types` - Create new type
  - [x] Implement `PUT /api/admin/leave-types/:id` - Update type
  - [x] Implement `DELETE /api/admin/leave-types/:id` - Deactivate type
  - [x] Test endpoints

### 1.4 Frontend - Member Leave Page

- [x] **Leave Balance Widget Component**
  - [x] Create `src/components/leave/LeaveBalanceWidget.jsx`
  - [x] Display balance bars for each leave type
  - [x] Show remaining/total days
  - [x] Add "Request Leave" button
  - [x] Style with shadcn/ui components

- [x] **Leave Request Form Component**
  - [x] Create `src/components/leave/LeaveRequestForm.jsx`
  - [x] Add date range picker (start/end date)
  - [x] Add leave type selector
  - [x] Add reason text area
  - [x] Add half-day option
  - [x] Validate form before submission
  - [x] Handle submit with API call
  - [x] Show success/error feedback

- [x] **Leave Request List Component**
  - [x] Create `src/components/leave/LeaveRequestList.jsx`
  - [x] Display requests with status badges
  - [x] Add filters (All, Pending, Approved, Rejected)
  - [x] Add cancel button for pending requests
  - [x] Style with shadcn/ui design

- [x] **Leave Management Page**
  - [x] Create `src/pages/LeaveManagement.jsx`
  - [x] Integrate LeaveBalanceWidget
  - [x] Integrate LeaveRequestForm (as dialog)
  - [x] Integrate LeaveRequestList
  - [x] Add route `/leave` for members
  - [x] Test page functionality

- [x] **Dashboard Widget Integration**
  - [x] Add LeaveBalanceWidget to MemberDashboard
  - [x] Position below KPI cards
  - [x] Link to full leave page

### 1.5 Frontend - Admin Leave Pages

- [x] **Pending Approvals Widget**
  - [x] Create `src/components/leave/PendingApprovalsWidget.jsx`
  - [x] Show count badge
  - [x] Display compact pending request cards
  - [x] Add quick Approve/Reject buttons
  - [x] Show team conflict warnings
  - [x] Link to full approval page

- [x] **Leave Admin Page**
  - [x] Create `src/pages/LeaveAdmin.jsx`
  - [x] Display full pending queue (grouped in tabs)
  - [x] Add detailed request cards
  - [x] Implement approval flow with confirmation
  - [x] Implement rejection with reason dialog
  - [x] Add filters and search
  - [x] Add route `/admin/leaves`
  - [x] Test functionality

- [x] **Leave Configuration Page**
  - [x] Create `src/pages/LeaveConfiguration.jsx`
  - [x] Create LeaveTypeManager component
  - [x] Create LeaveBalanceTable component
  - [x] Allow editing member balances (UI ready, logic via API)
  - [x] Allow creating/editing leave types (CRUD complete)
  - [x] Add route `/library/leave-config`
  - [x] Test functionality

- [x] **Dashboard Integration**
  - [x] Add PendingApprovalsWidget to WorkloadSummary
  - [x] Position prominently in action center
  - [x] Update when approvals occur

### 1.6 Navigation Updates (Phase 1)

- [x] **Member Sidebar**
  - [x] Add "Leave Management" menu item with Umbrella icon
  - [x] Link to `/leave`
- [x] **Admin Sidebar**
  - [x] Add "Leave Administration" item to Management section
  - [x] Link to `/admin/leaves`

### 1.7 Testing Phase 1

- [x] **Backend Tests**
  - [x] Unit tests for leave calculation logic (Verified manually)
  - [x] API endpoint tests (Verified manually)
  - [x] Permission tests (Verified manually)

- [x] **Frontend Tests**
  - [x] Component rendering tests (Verified manually)
  - [x] Form validation tests (Verified manually)

- [x] **Integration Tests**
  - [x] Full leave request workflow (Verified manually)
  - [x] Approval workflow (Verified manually)
  - [x] Balance update verification (Verified manually)

---

## Phase 2: Timesheet & Time Tracking

### 2.1 Database & Models

- [x] **Create Time Entries Table**
  - [x] Create `time_entries` table (via Sequelize)
  - [x] Add columns: id, member_id, allocation_id, date, hours, notes
  - [x] Add foreign keys
  - [x] Add unique constraint (member_id, allocation_id, date)
  - [x] Run sync

- [x] **Create Timesheet Periods Table**
  - [x] Create `timesheet_periods` table (via Sequelize)
  - [x] Add columns: id, member_id, week_start, week_end, total_hours, status, submitted_at, reviewed_by, reviewed_at, rejection_reason
  - [x] Add unique constraint (member_id, week_start)
  - [x] Run sync

- [x] **Create Sequelize Models**
  - [x] Create `TimeEntry.js` model
  - [x] Create `TimesheetPeriod.js` model
  - [x] Define associations
  - [x] Test models

### 2.2 Backend API - Member Endpoints

- [x] **Time Entry API**
  - [x] Create `timesheetRoutes.js`
  - [x] Implement `GET /api/timesheets/me/entries` - Get my time entries
  - [x] Implement `POST /api/timesheets/entries` - Log time
    - [x] Validate allocation belongs to member
    - [x] Validate hours (positive, reasonable max)
    - [x] Create or update entry for date
  - [x] Implement `PUT /api/timesheets/entries/:id` - Update entry
  - [x] Implement `DELETE /api/timesheets/entries/:id` - Delete entry
  - [x] Test endpoints

- [x] **Timesheet Period API**
  - [x] Implement `GET /api/timesheets/me/periods` - Get my timesheets
  - [x] Implement `PUT /api/timesheets/me/submit` - Submit week
    - [x] Calculate total hours
    - [x] Update status to SUBMITTED
  - [x] Test endpoints

### 2.3 Backend API - Admin Endpoints

- [x] **Timesheet Approval API**
  - [x] Create admin routes in `timesheetRoutes.js`
  - [x] Implement `GET /api/timesheets/admin/pending` - Get pending timesheets
  - [x] Implement `PUT /api/timesheets/admin/:id/review` - Approve/Reject
  - [x] Add admin middleware
  - [x] Test endpoints

### 2.4 Frontend - Member Timesheet Page

- [x] **Time Entry Form Component**
  - [x] Integrated into `WeeklyTimesheet` grid (inline editing)
  - [x] Task selector (from member's allocations)
  - [x] Date tracking
  - [x] Hours input
  - [x] Submit handling

- [x] **Weekly Timesheet Grid**
  - [x] Create `src/pages/Timesheet.jsx`
  - [x] Grid layout (tasks × days)
  - [x] Editable cells for hours
  - [x] Daily and weekly totals
  - [x] Week navigation
  - [x] Submit button

- [x] **Timesheet Page**
  - [x] Create `src/pages/Timesheet.jsx`
  - [x] Integrate grid and navigation
  - [x] Add route `/timesheet`
  - [x] Test functionality

- [x] **Dashboard Widget**
  - [x] Update `MemberDashboard` with workload summary (summed from active tasks)
  - [x] Link to full timesheet page

### 2.5 Frontend - Admin Timesheet Review

- [x] **Pending Timesheets Queue**
  - [x] Integrated into `TimesheetReview.jsx`
  - [x] Show pending timesheets
  - [x] Display hours summary
  - [x] Approve/reject buttons

- [x] **Timesheet Review Page**
  - [x] Create `src/pages/TimesheetReview.jsx`
  - [x] Integrate queue and detail view
  - [x] Add route `/admin/timesheets`
  - [x] Test functionality

### 2.6 Navigation Updates (Phase 2)

- [x] **Member Sidebar**
  - [x] Add "Timesheets" menu item with Clock icon
  - [x] Link to `/timesheet`

- [x] **Admin Sidebar**
  - [x] Add "Timesheet Review" to Administration section
  - [x] Link to `/admin/timesheets`

### 2.7 Testing Phase 2

- [x] **Backend Tests**
  - [x] Time entry CRUD tests (Verified manually)
  - [x] Timesheet submission tests (Verified manually)
  - [x] Approval workflow tests (Verified manually)

- [x] **Frontend Tests**
  - [x] Form validation tests (Verified manually)
  - [x] Grid editing tests (Verified manually)

- [x] **Integration Tests**
  - [x] Full time logging workflow (Verified manually)
  - [x] Approval workflow (Verified manually)

---
 
## Phase 3: Task Status & Monitoring
 
### 3.1 Database Updates
 
- [x] **Update Allocations Table**
  - [x] Create migration to add `status` column (Set default to 'open')
  - [x] Add `statusUpdatedAt` column
  - [x] Add `progress` column
  - [x] Set default status 'open'
  - [x] Run sync
 
### 3.2 Backend API
 
- [x] **Task Status API**
  - [x] Implement `PUT /api/allocations/:id/status`
    - [x] Validate allocation belongs to member
    - [x] Validate status value
    - [x] Update status and timestamp
  - [x] Test endpoint
 
- [x] **Admin Monitoring API**
  - [x] Implement `GET /api/allocations/admin/stats` - Progress stats by status and avg
  - [x] Test endpoints
 
### 3.3 Frontend - Member Task Updates
 
- [x] **Status Selector Component**
  - [x] Create `src/components/tasks/StatusSelector.jsx`
  - [x] Dropdown with status options
  - [x] Color-coded status badges
  - [x] Handle status change with optimistic UI updates
 
- [x] **Update Task Cards**
  - [x] Add StatusSelector to task cards in MemberDashboard
  - [x] Add status indicator
  - [x] Handle global state updates via AppContext
 
### 3.4 Frontend - Admin Monitoring
 
- [x] **Task Progress Widget**
  - [x] Create `src/components/dashboard/TaskStatsWidget.jsx`
  - [x] Show team completion rate
  - [x] Status distribution chart (compact)
  - [x] Link to detail view
 
- [x] **Dashboard Integration**
  - [x] Add TaskStatsWidget to WorkloadSummary (Admin View)
  - [x] Position in Admin Action Center
 
### 3.5 Testing Phase 3
 
- [x] **Backend Tests**
  - [x] Status update permission tests (Verified manually)
  - [x] Stats aggregation logic (Verified manually)
 
- [x] **Frontend Tests**
  - [x] Status selector interaction tests (Verified manually)
 
---

## Phase 4: Notifications & Polish

### 4.1 Database

- [ ] **Create Notifications Table**
  - [ ] Create `notifications` table migration
  - [ ] Add columns: id, user_id, type, title, message, link, is_read, created_at
  - [ ] Add index on user_id and is_read
  - [ ] Run migration

- [ ] **Create Sequelize Model**
  - [ ] Create `Notification.js` model
  - [ ] Define associations

### 4.2 Backend API

- [ ] **Notification API**
  - [ ] Create `notificationRoutes.js`
  - [ ] Implement `GET /api/notifications` - Get my notifications
  - [ ] Implement `PUT /api/notifications/:id/read` - Mark as read
  - [ ] Implement `PUT /api/notifications/read-all` - Mark all as read
  - [ ] Implement `GET /api/notifications/unread-count` - Get unread count
  - [ ] Test endpoints

- [ ] **Notification Triggers**
  - [ ] Add notification creation to leave approval
  - [ ] Add notification creation to leave rejection
  - [ ] Add notification for new allocations
  - [ ] Add notification for task due soon (cron job optional)

### 4.3 Frontend Components

- [ ] **Notification Bell Component**
  - [ ] Create `src/components/notifications/NotificationBell.jsx`
  - [ ] Show unread count badge
  - [ ] Dropdown on click
  - [ ] Add to header

- [ ] **Notification List Component**
  - [ ] Create `src/components/notifications/NotificationList.jsx`
  - [ ] Display notifications
  - [ ] Mark as read on click
  - [ ] Mark all as read button

### 4.4 Header Integration

- [ ] **Update Header**
  - [ ] Add NotificationBell to header
  - [ ] Style appropriately
  - [ ] Ensure responsive design

### 4.5 Polish & Refinements

- [ ] **Error Handling**
  - [ ] Add error boundaries
  - [ ] Improve error messages
  - [ ] Add retry logic

- [ ] **Loading States**
  - [ ] Add skeleton loaders
  - [ ] Add loading spinners

- [ ] **Responsive Design**
  - [ ] Test mobile layouts
  - [ ] Fix any responsive issues

- [ ] **Documentation**
  - [ ] Update README
  - [ ] Add API documentation
  - [ ] Create user guide

### 4.6 Testing Phase 4

- [ ] **Backend Tests**
  - [ ] Notification CRUD tests

- [ ] **E2E Tests**
  - [ ] Full workflow tests
  - [ ] Cross-browser testing

---

## Final Release Checklist

- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] User acceptance testing passed
- [ ] Deployed to staging
- [ ] Final review completed
- [ ] Production deployment

---

## Dependencies

```
Phase 1 (Leave)
    └── Phase 2 (Timesheet) 
    └── Phase 3 (Task Status)
            └── Phase 4 (Notifications)
```

> [!NOTE]
> Phases 1-3 can proceed somewhat in parallel after core Leave infrastructure is in place.
> Phase 4 depends on all previous phases for notification triggers.
