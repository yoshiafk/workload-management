# Required Admin Updates for Member Self-Service

## Overview

This document details the specific admin-side updates required to support the member self-service features outlined in the member-view documentation.

---

## Feature Dependencies

Each member feature requires corresponding admin functionality:

| Member Feature | Required Admin Feature | Priority |
|----------------|----------------------|----------|
| Request Leave | Approve/Reject Leave | 🔴 Critical |
| View Leave Balance | Set/Manage Leave Balance | 🔴 Critical |
| Update Task Status | Monitor Task Progress | 🟠 High |
| Log Time (Timesheet) | Review/Approve Timesheets | 🟠 High |
| Profile Management | Admin Override Capability | 🟡 Medium |
| Notifications | Send/Manage Notifications | 🟡 Medium |

---

## Feature 1: Leave Approval System

### Admin Requirements

#### 1.1 Leave Approval Queue
**Location:** Dashboard widget + dedicated page

**Required UI Components:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📋 PENDING LEAVE REQUESTS                    [View All →]   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👤 John Doe                              2 hours ago    │ │
│ │ ──────────────────────────────────────────────────────  │ │
│ │ 🏖️ Annual Leave • March 10-14 (5 days)                 │ │
│ │ 💬 "Family vacation"                                    │ │
│ │ ⚠️ Team coverage: 2 others off on Mar 11               │ │
│ │                                                         │ │
│ │ [View Details]    [Reject ✗]    [Approve ✓]            │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👤 Jane Smith                            Yesterday      │ │
│ │ ──────────────────────────────────────────────────────  │ │
│ │ 🏥 Sick Leave • March 20 (1 day)                       │ │
│ │ 💬 "Medical appointment"                                │ │
│ │                                                         │ │
│ │ [View Details]    [Reject ✗]    [Approve ✓]            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 1.2 Approval Actions
| Action | Description |
|--------|-------------|
| Approve | Approve request, update balance, notify member |
| Reject | Reject with required reason, notify member |
| Request Info | Ask member for clarification (optional) |
| View Details | See full request context |
| Bulk Approve | Select multiple and approve at once |

#### 1.3 Rejection Dialog
```
┌──────────────────────────────────────────────────────────┐
│ ✗ Reject Leave Request                                   │
├──────────────────────────────────────────────────────────┤
│ You are rejecting John Doe's leave request for           │
│ March 10-14, 2024 (5 days)                               │
│                                                          │
│ Reason (required):                                       │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ e.g., "Critical project deadline during this period" │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ○ Suggest alternative dates                              │
│   [Mar 17] - [Mar 21]                                   │
│                                                          │
│              [Cancel]          [Confirm Rejection]       │
└──────────────────────────────────────────────────────────┘
```

---

#### 1.4 Leave Balance Administration

**Location:** New Library Page: `/library/leave-config`

**Features Needed:**
| Feature | Description |
|---------|-------------|
| Set entitlements | Annual days per member by type |
| Adjust balance | Corrections, carry-over, bonus |
| Configure types | Add/edit leave categories |
| Policy settings | Accrual rules, max carry-over |
| Reset annual | Process year-end reset |

**UI Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ Leave Administration                                        │
├─────────────────────────────────────────────────────────────┤
│ LEAVE BALANCES BY MEMBER                   [Bulk Adjust ▼]  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Member      │ Annual │ Sick │ Personal │ Actions        │ │
│ ├─────────────┼────────┼──────┼──────────┼────────────────┤ │
│ │ John Doe    │ 12/20  │ 3/10 │ 0/3      │ [Edit] [View]  │ │
│ │ Jane Smith  │ 15/20  │ 5/10 │ 1/3      │ [Edit] [View]  │ │
│ │ Mike Brown  │ 8/15   │ 2/10 │ 3/3      │ [Edit] [View]  │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ LEAVE TYPES                               [+ Add Type]      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Annual Leave    │ 20 days/year │ Carry-over: 5 max     │ │
│ │ Sick Leave      │ 10 days/year │ No carry-over         │ │
│ │ Personal Leave  │ 3 days/year  │ No carry-over         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature 2: Team Calendar Enhancement

### Admin Requirements

#### 2.1 Team Absence Calendar
**Location:** Enhanced ImportantDates or new page

**Features:**
- See all approved leave on calendar
- Pending requests shown differently (dashed border)
- Click on date to see who's off
- Click on person to see their requests

**UI Enhancement:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Team Calendar - March 2024       [Today] [◀ ▶] [Month ▼]│
├─────────────────────────────────────────────────────────────┤
│  Mon     Tue     Wed     Thu     Fri     Sat     Sun       │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │  10 │ │  11 │ │  12 │ │  13 │ │  14 │ │  15 │ │  16 │   │
│ │     │ │     │ │     │ │     │ │     │ │     │ │     │   │
│ │ JD  │ │ JD  │ │ JD  │ │ JD  │ │ JD  │ │     │ │     │   │
│ │ ░░░ │ │ MB  │ │     │ │     │ │     │ │     │ │     │   │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘   │
│                                                             │
│ Legend: █ Approved  ░ Pending                              │
│                                                             │
│ ABSENCES ON SELECTED DATE: March 11                        │
│ • John Doe - Annual Leave (Mar 10-14) ✓                    │
│ • Mike Brown - Sick Leave (Mar 11) ⏳ Pending              │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature 3: Timesheet Approval

### Admin Requirements

#### 3.1 Timesheet Review Queue
**Location:** Dashboard widget + dedicated page

**Features:**
| Feature | Description |
|---------|-------------|
| View submitted | See timesheets awaiting approval |
| Compare hours | Actual vs allocated comparison |
| Approve/reject | Accept or request changes |
| Weekly summary | Aggregate view by week |
| Flags | Highlight overtime or discrepancies |

**UI Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ ⏱️ TIMESHEETS PENDING APPROVAL                             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ John Doe • Week of Mar 4-10                  Submitted  │ │
│ │ ──────────────────────────────────────────────────────  │ │
│ │ Total Hours: 42h (2h overtime)                          │ │
│ │ Allocated: 40h                                          │ │
│ │ ⚠️ 2 hours over allocation                              │ │
│ │                                                         │ │
│ │ [View Details]    [Request Changes]    [Approve ✓]      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature 4: Task Status Monitoring

### Admin Requirements

#### 4.1 Progress Dashboard Widget
**Location:** WorkloadSummary dashboard

**Features:**
- Task completion rates by member
- Status breakdown (Not Started/In Progress/Completed)
- Overdue task alerts
- Progress trend over time

**UI Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 TASK PROGRESS                            [View All →]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Team Completion Rate: ████████████░░░░ 78%                 │
│                                                             │
│ ┌────────────┬──────────────────────────────────────────┐  │
│ │ John Doe   │ ████████████████░░░░ 80% (8/10 tasks)    │  │
│ │ Jane Smith │ ██████████████████░░ 90% (9/10 tasks)    │  │
│ │ Mike Brown │ ██████████░░░░░░░░░░ 50% (3/6 tasks)     │  │
│ └────────────┴──────────────────────────────────────────┘  │
│                                                             │
│ ⚠️ 3 tasks overdue (Mike: 2, John: 1)                      │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2 Enhanced Allocation Table
Add status column to ResourceAllocation page:

| Column | Shows |
|--------|-------|
| Status | Current status set by member |
| Last Updated | When status was changed |
| Progress | Visual indicator |

---

## Feature 5: Notification Management

### Admin Requirements

#### 5.1 Send Notifications
**Location:** New admin feature

**Features:**
| Feature | Description |
|---------|-------------|
| Send to all | Broadcast to entire team |
| Send to individual | Target specific member |
| Schedule | Send at specific time |
| Templates | Pre-made notification templates |
| History | View sent notifications |

---

## API Endpoints Required

### Leave Management (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/leaves/pending` | Get pending requests |
| GET | `/api/admin/leaves/all` | Get all leave requests |
| PUT | `/api/admin/leaves/:id/approve` | Approve request |
| PUT | `/api/admin/leaves/:id/reject` | Reject request |
| GET | `/api/admin/leave-balances` | Get all balances |
| PUT | `/api/admin/leave-balances/:id` | Update balance |
| POST | `/api/admin/leave-types` | Create leave type |

### Timesheet Management (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/timesheets/pending` | Get pending timesheets |
| PUT | `/api/admin/timesheets/:id/approve` | Approve timesheet |
| PUT | `/api/admin/timesheets/:id/reject` | Reject timesheet |

### Task Status (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/tasks/progress` | Get task progress stats |
| GET | `/api/admin/tasks/overdue` | Get overdue tasks |

---

## Navigation Updates

### Proposed Admin Sidebar

```
┌─────────────────────┐
│ WORKLOAD PRO       │
├─────────────────────┤
│ 📊 Dashboard       │  ← With approval queue
│ 📋 Allocations     │  ← With status column
│ 📅 Calendar        │  ← Enhanced with leave
│ ⏱️ Timesheets      │  ← NEW: Review page
│ 🏖️ Leave Admin     │  ← NEW: Approve & manage
├─────────────────────┤
│ LIBRARY            │
│   👥 Team Members  │
│   📁 Phases        │
│   📝 Tasks         │
│   ⚡ Complexity    │
│   💰 Costs         │
│   🏷️ Cost Centers  │
│   📖 COA           │
│   🗓️ Leave Config  │  ← NEW
├─────────────────────┤
│ 🔔 Notifications   │  ← NEW
│ ⚙️ Settings        │
└─────────────────────┘
```

---

## Implementation Order

### Phase 1: Leave System (Weeks 1-2)
1. Leave approval queue on dashboard
2. Approve/reject functionality
3. Leave balance administration
4. Team calendar with leave display

### Phase 2: Timesheets (Weeks 3-4)
1. Timesheet review queue
2. Approve/reject timesheets
3. Hours comparison view

### Phase 3: Monitoring & Notifications (Weeks 5-6)
1. Task progress dashboard widget
2. Status column in allocation table
3. Notification system

---

## Database Model Updates

### New Admin Tables

```sql
-- LeaveRequest (shared with member)
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  leave_type_id UUID REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days DECIMAL(4,1) NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- LeaveType (admin configured)
CREATE TABLE leave_types (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  annual_days INTEGER NOT NULL,
  carry_over_max INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- LeaveBalance (admin managed)
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  leave_type_id UUID REFERENCES leave_types(id),
  year INTEGER NOT NULL,
  total_days DECIMAL(4,1) NOT NULL,
  used_days DECIMAL(4,1) DEFAULT 0,
  UNIQUE(member_id, leave_type_id, year)
);
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Approval turnaround | < 24 hours | Request → Decision time |
| Queue visibility | 100% on dashboard | All pending items shown |
| Balance accuracy | 100% | Automated calculation |
| Admin satisfaction | 4.5/5 rating | User feedback |
