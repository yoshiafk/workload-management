# Implementation Plan: HR Workload Enhancement

## Executive Summary

Transform the workload management system into a comprehensive HR platform with member self-service and enhanced admin workflows.

---

## Project Overview

### Goals

1. **Member Self-Service**: Enable members to manage leave, time tracking, and task status
2. **Admin Workflow Enhancement**: Approval workflows and monitoring dashboards
3. **Improved Visibility**: Real-time insights into team capacity and task progress

### Current State vs Target

| Capability | Current Admin | Current Member | Target |
|-----------|--------------|----------------|--------|
| Leave Management | ❌ | ❌ | ✅ Full workflow |
| Time Tracking | ❌ | ❌ | ✅ Log & approve |
| Task Status Updates | ✅ Admin only | ❌ | ✅ Member can update |
| Notifications | ❌ | ❌ | ✅ In-app alerts |

---

## Implementation Phases

### Phase 1: Leave Management System (3 Weeks) 🔴 Critical

#### Backend

**New Models:**
- `LeaveType` - Leave categories (Annual, Sick, Personal)
- `LeaveBalance` - Member balances per year
- `LeaveRequest` - Request with approval workflow

**API Endpoints (Member):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaves/me` | My leave requests |
| GET | `/api/leaves/balance` | My leave balances |
| POST | `/api/leaves` | Submit request |
| PUT | `/api/leaves/:id/cancel` | Cancel pending |

**API Endpoints (Admin):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/leaves/pending` | Pending requests |
| PUT | `/api/admin/leaves/:id/approve` | Approve request |
| PUT | `/api/admin/leaves/:id/reject` | Reject request |
| GET | `/api/admin/leave-balances` | All balances |
| PUT | `/api/admin/leave-balances/:id` | Adjust balance |

#### Frontend

**New Pages:**
| Page | Route | Role |
|------|-------|------|
| LeaveManagement | `/leave` | Member |
| LeaveAdmin | `/admin/leaves` | Admin |
| LeaveConfiguration | `/library/leave-config` | Admin |

**New Components:**
- `LeaveBalanceWidget` - Dashboard widget showing remaining days
- `LeaveRequestForm` - Submit request dialog
- `PendingApprovalsWidget` - Admin quick approve/reject

---

### Phase 2: Timesheet & Time Tracking (2 Weeks) 🟠 High

#### Backend

**New Models:**
- `TimeEntry` - Individual time log entries
- `TimesheetPeriod` - Weekly submission for approval

**API Endpoints (Member):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/time-entries/me` | My time entries |
| POST | `/api/time-entries` | Log time |
| PUT | `/api/timesheets/:id/submit` | Submit week |

**API Endpoints (Admin):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/timesheets/pending` | Pending timesheets |
| PUT | `/api/admin/timesheets/:id/approve` | Approve |
| PUT | `/api/admin/timesheets/:id/reject` | Reject |

#### Frontend

**New Pages:**
| Page | Route | Role |
|------|-------|------|
| Timesheet | `/timesheets` | Member |
| TimesheetReview | `/admin/timesheets` | Admin |

**New Components:**
- `TimeEntryForm` - Log hours dialog
- `WeeklyTimesheet` - Grid view of weekly hours
- `PendingTimesheetsQueue` - Admin approval queue

---

### Phase 3: Task Status & Monitoring (1 Week) 🟠 High

#### Backend

**Database Changes:**
- Add `status` column to `allocations` table
- Status values: `NOT_STARTED`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED`

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/allocations/:id/status` | Update task status |
| GET | `/api/admin/tasks/progress` | Progress stats |
| GET | `/api/admin/tasks/overdue` | Overdue tasks |

#### Frontend

**Component Updates:**
- `StatusSelector` - Dropdown in task cards
- `TaskProgressWidget` - Admin dashboard widget

---

### Phase 4: Notifications & Polish (1 Week) 🟡 Medium

#### Backend

**New Model:**
- `Notification` - In-app notifications

**Notification Types:**
| Type | Trigger | Recipient |
|------|---------|-----------|
| `LEAVE_REQUEST` | Member submits | Admin |
| `LEAVE_APPROVED` | Admin approves | Member |
| `TASK_ASSIGNED` | New allocation | Member |
| `TASK_DUE_SOON` | 2 days before due | Member |

#### Frontend

**New Components:**
- `NotificationBell` - Header icon with unread count
- `NotificationList` - Dropdown list

---

## Navigation Updates

### Member Sidebar (New Items)
```
📊 Dashboard
📋 My Tasks        ← NEW
⏱️ Timesheets      ← NEW
🏖️ Leave           ← NEW
📅 Calendar
```

### Admin Sidebar (New Items)
```
📊 Dashboard
📋 Allocations
📅 Timeline
📆 Important Dates

APPROVALS          ← NEW SECTION
  🏖️ Leave         ← NEW
  ⏱️ Timesheets    ← NEW

LIBRARY
  🗓️ Leave Config  ← NEW (add to existing)
```

---

## Database Migrations Summary

| Migration | Description |
|-----------|-------------|
| `create-leave-types` | Leave categories table |
| `create-leave-balances` | Member balance tracking |
| `create-leave-requests` | Request workflow |
| `create-time-entries` | Time log entries |
| `create-timesheet-periods` | Weekly submission tracking |
| `create-notifications` | In-app notifications |
| `add-status-to-allocations` | Task status column |

---

## File Structure - New Files

### Backend
```
backend/src/
├── models/
│   ├── LeaveType.js
│   ├── LeaveBalance.js
│   ├── LeaveRequest.js
│   ├── TimeEntry.js
│   └── Notification.js
├── routes/
│   ├── leaveRoutes.js
│   ├── timesheetRoutes.js
│   └── notificationRoutes.js
└── controllers/
    ├── leaveController.js
    ├── timesheetController.js
    └── notificationController.js
```

### Frontend
```
frontend/src/
├── pages/
│   ├── member/
│   │   ├── LeaveManagement.jsx
│   │   ├── Timesheet.jsx
│   │   └── MyTasks.jsx
│   └── admin/
│       ├── LeaveAdmin.jsx
│       ├── LeaveConfiguration.jsx
│       └── TimesheetReview.jsx
└── components/
    ├── leave/
    ├── timesheet/
    ├── tasks/
    └── notifications/
```

---

## Timeline Summary

| Week | Phase | Focus |
|------|-------|-------|
| 1-3 | Phase 1 | Leave Management System |
| 4-5 | Phase 2 | Timesheets & Time Tracking |
| 6 | Phase 3 | Task Status & Monitoring |
| 7 | Phase 4 | Notifications & Polish |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Leave request adoption | 80% of members within 30 days |
| Approval turnaround | < 24 hours average |
| Time logging compliance | 70% of tasks have logged time |
| User satisfaction | 4.5/5 rating |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Complex leave calculations | Start with simple day count |
| Scope creep | Strict phase boundaries |
| Performance issues | Pagination from start |
| User adoption | Good UX, onboarding tooltips |
