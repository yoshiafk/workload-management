# Feature Requirements: Member View

## Overview

This document details the specific features that members (non-admin users) should have access to in the application, based on market research and user needs analysis.

---

## Feature Categories

### 1. 🏠 Dashboard & Overview

#### 1.1 Personal Dashboard
**Priority:** ✅ Already Implemented (Enhancement Needed)

**Current State:**
- Shows active/upcoming/overdue/completed task counts
- Displays workload percentage
- Lists active and upcoming tasks

**Enhancements Needed:**
| Enhancement | Description | Priority |
|-------------|-------------|----------|
| Quick action buttons | Mark task complete from dashboard | High |
| Leave balance widget | Show remaining leave days | High |
| Recent activity feed | Show recent task changes | Medium |
| Pending approvals indicator | Show items awaiting approval | Medium |

---

### 2. 📋 Task Management

#### 2.1 My Tasks View
**Priority:** High

**User Story:**
> As a member, I want to see all my assigned tasks in one place so I can manage my work effectively.

**Requirements:**

| Requirement | Description | Must Have |
|-------------|-------------|-----------|
| Task list | All assigned tasks with filters | ✅ |
| Status filter | Filter by: All, Active, Completed, Overdue | ✅ |
| Date range filter | Filter by time period | ✅ |
| Search | Search by task/project name | ⚪ |
| Sorting | Sort by due date, priority, status | ✅ |

#### 2.2 Task Status Updates
**Priority:** Critical

**User Story:**
> As a member, I want to update the status of my tasks so my manager can track progress.

**Requirements:**

| Requirement | Description | Must Have |
|-------------|-------------|-----------|
| Status options | Not Started, In Progress, Completed | ✅ |
| Quick toggle | One-click status change | ✅ |
| Completion date | Auto-set when marked complete | ✅ |
| Confirmation | Confirm before marking complete | ⚪ |
| Comments | Add notes when updating status | ⚪ |

**UI Mockup:**
```
┌─────────────────────────────────────────────────────┐
│ ☐ Task Name                         [In Progress ▼]│
│    Project Name • Due: Mar 15                       │
│    ───────────────○──────────── 60% complete       │
│                                                     │
│    [Log Time] [View Details] [Mark Complete ✓]     │
└─────────────────────────────────────────────────────┘
```

---

### 3. 🏖️ Leave Management

#### 3.1 Request Leave
**Priority:** Critical

**User Story:**
> As a member, I want to request time-off so I can plan my vacations and personal days.

**Requirements:**

| Requirement | Description | Must Have |
|-------------|-------------|-----------|
| Leave type selection | Annual, Sick, Personal, Other | ✅ |
| Date range picker | Start and end date | ✅ |
| Half-day option | AM/PM half-day selection | ⚪ |
| Reason/notes | Text field for explanation | ✅ |
| Submit for approval | Send to manager/admin | ✅ |
| Cancel request | Cancel pending requests | ✅ |

#### 3.2 Leave Balance
**Priority:** High

**User Story:**
> As a member, I want to see my remaining leave balance so I can plan accordingly.

**Requirements:**

| Requirement | Description | Must Have |
|-------------|-------------|-----------|
| Balance by type | Show balance per leave type | ✅ |
| Used/remaining | Visual progress bar | ✅ |
| History | Past leave taken | ✅ |
| Projected balance | Balance after pending requests | ⚪ |

#### 3.3 Leave Request Status
**Priority:** High

**User Story:**
> As a member, I want to track the status of my leave requests.

**Requirements:**

| Requirement | Description | Must Have |
|-------------|-------------|-----------|
| Status display | Pending, Approved, Rejected | ✅ |
| Request history | All past and current requests | ✅ |
| Approval notes | Admin comments on rejection | ⚪ |
| Notifications | Alert when status changes | ⚪ |

**UI Mockup:**
```
┌─────────────────────────────────────────────────────┐
│ 🏖️ LEAVE BALANCE                                    │
├─────────────────────────────────────────────────────┤
│ Annual Leave     ████████░░░░░░░░░    12/20 days   │
│ Sick Leave       ███░░░░░░░░░░░░░░     3/10 days   │
│ Personal Days    ░░░░░░░░░░░░░░░░░     0/3 days    │
├─────────────────────────────────────────────────────┤
│ [+ Request Leave]                                   │
├─────────────────────────────────────────────────────┤
│ PENDING REQUESTS                                    │
│ ┌─────────────────────────────────────────────────┐│
│ │ Mar 10-14 • Annual Leave • 5 days   [PENDING]  ││
│ │ "Family vacation"         [Cancel]             ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

---

### 4. ⏱️ Time Tracking

#### 4.1 Log Time
**Priority:** High

**User Story:**
> As a member, I want to log the hours I worked on tasks so we can track actual vs planned effort.

**Requirements:**

| Requirement | Description | Must Have |
|-------------|-------------|-----------|
| Select task | Choose from assigned tasks | ✅ |
| Enter hours | Decimal hours (e.g., 2.5h) | ✅ |
| Date selection | Default today, can change | ✅ |
| Notes | Optional description of work | ⚪ |
| Quick log | Timer start/stop option | ⚪ |

#### 4.2 Timesheet View
**Priority:** Medium

**User Story:**
> As a member, I want to see a summary of my logged hours by week/month.

**Requirements:**

| Requirement | Description | Must Have |
|-------------|-------------|-----------|
| Weekly view | Hours by day of week | ✅ |
| Monthly summary | Total hours by month | ⚪ |
| By task/project | Hours breakdown | ✅ |
| Export option | Download as CSV/PDF | ⚪ |

**UI Mockup:**
```
┌─────────────────────────────────────────────────────┐
│ ⏱️ TIMESHEET - Week of Mar 4-10                      │
├─────────────────────────────────────────────────────┤
│        Mon  Tue  Wed  Thu  Fri  Sat  Sun  TOTAL    │
│ Task A  2h   3h   4h   2h   1h   -    -    12h     │
│ Task B  4h   2h   3h   4h   4h   -    -    17h     │
│ Task C  2h   3h   1h   2h   3h   -    -    11h     │
├─────────────────────────────────────────────────────┤
│ TOTAL   8h   8h   8h   8h   8h   -    -    40h     │
├─────────────────────────────────────────────────────┤
│ [Submit Week]                        [+ Log Time]  │
└─────────────────────────────────────────────────────┘
```

---

### 5. 👤 Profile & Settings

#### 5.1 Personal Profile
**Priority:** Medium

**User Story:**
> As a member, I want to update my personal information so it stays current.

**Requirements:**

| Requirement | Description | Must Have |
|-------------|-------------|-----------|
| View profile | See all personal info | ✅ |
| Edit contact info | Phone, email, address | ✅ |
| Emergency contact | Add/edit emergency contact | ⚪ |
| Profile photo | Upload/change avatar | ⚪ |
| Change password | Security setting | ✅ |

#### 5.2 Notification Preferences
**Priority:** Low

**Requirements:**

| Requirement | Description | Must Have |
|-------------|-------------|-----------|
| Email notifications | Toggle on/off | ⚪ |
| In-app alerts | Per notification type | ⚪ |
| Reminder timing | When to remind about due dates | ⚪ |

---

### 6. 📅 Calendar & Scheduling

#### 6.1 Personal Calendar
**Priority:** Medium

**User Story:**
> As a member, I want to see my tasks and leave on a calendar view.

**Requirements:**

| Requirement | Description | Must Have |
|-------------|-------------|-----------|
| Task deadlines | Show on calendar | ✅ |
| My leave | Approved leave highlighted | ✅ |
| Team availability | See who's off (optional) | ⚪ |

#### 6.2 Team Calendar
**Priority:** Low

**User Story:**
> As a member, I want to see when my teammates are on leave so I can coordinate.

**Requirements:**

| Requirement | Description | Must Have |
|-------------|-------------|-----------|
| Team view | See team members' leave | ⚪ |
| Filter by team | Show specific team only | ⚪ |

---

### 7. 🔔 Notifications

#### 7.1 Notification Center
**Priority:** Medium

**User Story:**
> As a member, I want to receive notifications about important events.

**Notification Types:**

| Event | Notification | Priority |
|-------|--------------|----------|
| New task assigned | "You've been assigned: [Task]" | High |
| Task deadline approaching | "Due in 2 days: [Task]" | High |
| Leave approved/rejected | "Your leave has been approved" | High |
| Status update by admin | "Task updated: [Details]" | Medium |
| Weekly summary | "Your week summary: 5 tasks" | Low |

---

## Data Requirements

### New Database Models Needed

#### LeaveRequest Model
```javascript
{
  id: UUID,
  memberId: UUID (FK),
  leaveType: ENUM('ANNUAL', 'SICK', 'PERSONAL', 'OTHER'),
  startDate: DATE,
  endDate: DATE,
  halfDay: ENUM('FULL', 'AM', 'PM'),
  reason: TEXT,
  status: ENUM('PENDING', 'APPROVED', 'REJECTED'),
  approvedBy: UUID (FK to User),
  approvedAt: DATETIME,
  rejectionReason: TEXT,
  createdAt: DATETIME,
  updatedAt: DATETIME
}
```

#### LeaveBalance Model
```javascript
{
  id: UUID,
  memberId: UUID (FK),
  leaveType: ENUM('ANNUAL', 'SICK', 'PERSONAL', 'OTHER'),
  year: INTEGER,
  totalDays: DECIMAL,
  usedDays: DECIMAL,
  createdAt: DATETIME,
  updatedAt: DATETIME
}
```

#### TimeEntry Model
```javascript
{
  id: UUID,
  memberId: UUID (FK),
  allocationId: UUID (FK),
  date: DATE,
  hours: DECIMAL,
  notes: TEXT,
  createdAt: DATETIME,
  updatedAt: DATETIME
}
```

#### Notification Model
```javascript
{
  id: UUID,
  userId: UUID (FK),
  type: STRING,
  title: STRING,
  message: TEXT,
  link: STRING,
  isRead: BOOLEAN,
  createdAt: DATETIME
}
```

---

## API Endpoints Needed

### Leave Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaves/me` | Get my leave requests |
| GET | `/api/leaves/balance` | Get my leave balance |
| POST | `/api/leaves` | Submit leave request |
| PUT | `/api/leaves/:id/cancel` | Cancel pending request |
| PUT | `/api/leaves/:id/approve` | Admin: Approve request |
| PUT | `/api/leaves/:id/reject` | Admin: Reject request |

### Time Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/time-entries/me` | Get my time entries |
| POST | `/api/time-entries` | Log time entry |
| PUT | `/api/time-entries/:id` | Update time entry |
| DELETE | `/api/time-entries/:id` | Delete time entry |

### Task Updates (Member)
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/allocations/:id/status` | Update my task status |
| GET | `/api/allocations/me` | Get my allocations |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get my profile |
| PUT | `/api/profile` | Update my profile |
| PUT | `/api/profile/password` | Change password |

---

## Implementation Priority

### Phase 1: Core Self-Service (Weeks 1-2)
1. Task status updates (members can mark complete)
2. Leave request submission
3. Leave balance display
4. Admin leave approval interface

### Phase 2: Time Tracking (Weeks 3-4)
1. Time entry logging
2. Timesheet view
3. Actual vs planned comparison on tasks

### Phase 3: Enhanced Experience (Weeks 5-6)
1. Notification system
2. Profile management
3. Personal calendar view

### Phase 4: Polish & Extras (Week 7+)
1. Team calendar
2. Document access
3. Mobile optimization
