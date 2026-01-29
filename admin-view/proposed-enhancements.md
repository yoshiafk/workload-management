# Proposed Enhancements: Admin View

## Overview

This document outlines all proposed enhancements to the admin view, combining required updates for member self-service and additional improvements based on market best practices.

---

## Priority Matrix

| Priority | Feature | Effort | Impact | Dependencies |
|----------|---------|--------|--------|--------------|
| 🔴 Critical | Leave Approval Queue | Medium | High | Member leave feature |
| 🔴 Critical | Leave Balance Admin | Medium | High | Member leave feature |
| 🔴 Critical | Team Calendar with Leave | Low | High | Existing ImportantDates |
| 🟠 High | Timesheet Review | Medium | Medium | Member time logging |
| 🟠 High | Task Progress Widget | Low | Medium | Member status updates |
| 🟡 Medium | Notification System | High | Medium | All features |
| 🟡 Medium | Bulk Actions | Medium | Medium | Efficiency |
| 🟢 Low | Approval Delegation | Medium | Low | Coverage |
| 🟢 Low | Leave Analytics | Medium | Low | Reporting |

---

## Enhancement 1: Leave Approval Dashboard Widget

### Description
A prominent section on the admin dashboard showing all pending leave requests with quick approve/reject actions.

### User Story
> As an admin, I want to see pending leave requests immediately when I log in so I can approve them quickly.

### UI Mockup
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔔 PENDING APPROVALS (3)                        [View All →]    │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 👤 John Doe              Annual Leave         2h ago       │ │
│ │    Mar 10-14 (5 days) • "Family vacation"                  │ │
│ │    Balance after: 12 days                                   │ │
│ │                                                             │ │
│ │    [Reject]                              [Approve ✓]       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 👤 Jane Smith            Sick Leave           Yesterday    │ │
│ │    Mar 20 (1 day) • "Medical appointment"                  │ │
│ │    Balance after: 5 days                                    │ │
│ │                                                             │ │
│ │    [Reject]                              [Approve ✓]       │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Placement
Insert as new CollapsibleSection on WorkloadSummary dashboard, positioned below KPI stats and above heatmap.

### Technical Implementation
- New React component: `PendingApprovalsWidget`
- Fetch from: `GET /api/admin/leaves/pending`
- Actions: `PUT /api/admin/leaves/:id/approve` and `PUT /api/admin/leaves/:id/reject`

---

## Enhancement 2: Leave Management Page

### Description
Dedicated page (`/admin/leaves`) for comprehensive leave management with filtering, history, and bulk actions.

### Features
| Feature | Description |
|---------|-------------|
| Request list | All requests with filters (status, type, member) |
| Bulk approve | Select multiple and approve |
| History view | Past approved/rejected requests |
| Calendar sync | See leaves on calendar |
| Export | Download CSV/PDF |

### UI Mockup
```
┌─────────────────────────────────────────────────────────────────┐
│ Leave Management                     [Filter ▼] [Export ▼]     │
├─────────────────────────────────────────────────────────────────┤
│ [Pending (3)] [Approved] [Rejected] [All]                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ☐ Select All                      [Bulk Approve] [Bulk Reject] │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ ☐ │ John Doe  │ Annual │ Mar 10-14 │ 5d │ Pending │ [···] │  │
│ │ ☐ │ Jane Smith│ Sick   │ Mar 20    │ 1d │ Pending │ [···] │  │
│ │ ☐ │ Mike Brown│ Annual │ Mar 25-26 │ 2d │ Pending │ [···] │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│ Showing 1-3 of 3 pending requests                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Enhancement 3: Leave Balance Administration

### Description
Library page (`/library/leave-config`) for configuring leave policies and managing member balances.

### Features
| Feature | Description |
|---------|-------------|
| Leave types | Configure categories (Annual, Sick, etc.) |
| Default entitlements | Set standard allocations |
| Member balances | View/adjust individual balances |
| Policy settings | Accrual rules, max carry-over |
| Annual reset | Year-end processing |

### UI Mockup
```
┌─────────────────────────────────────────────────────────────────┐
│ Leave Configuration                                             │
├─────────────────────────────────────────────────────────────────┤
│ LEAVE TYPES                                    [+ Add Type]     │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ Annual Leave    │ 20 days │ Carry-over: 5 │ Active  [Edit] │  │
│ │ Sick Leave      │ 10 days │ Carry-over: 0 │ Active  [Edit] │  │
│ │ Personal Time   │ 3 days  │ Carry-over: 0 │ Active  [Edit] │  │
│ └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ MEMBER BALANCES                     [Bulk Adjust] [Reset Year]  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Member      │ Annual  │ Sick    │ Personal │ Actions       ││
│ ├─────────────┼─────────┼─────────┼──────────┼───────────────┤│
│ │ John Doe    │ 12/20   │ 3/10    │ 0/3      │ [Edit] [View] ││
│ │ Jane Smith  │ 15/20   │ 5/10    │ 1/3      │ [Edit] [View] ││
│ │ Mike Brown  │ 8/15    │ 2/10    │ 3/3      │ [Edit] [View] ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Enhancement 4: Enhanced Team Calendar

### Description
Upgrade ImportantDates page to show approved leave and pending requests.

### Features
| Feature | Description |
|---------|-------------|
| Leave overlay | Show approved leave on calendar |
| Pending indicator | Dashed border for pending requests |
| Day detail | Click date to see who's off |
| Filter by team | Optional team filter |
| Conflict warning | Alert when too many off |

### Integration
Enhance existing `ImportantDates.jsx` with:
- Leave data fetch from `/api/leaves`
- Visual overlay on calendar cells
- Legend for leave status

---

## Enhancement 5: Timesheet Approval System

### Description
Review and approve member-submitted timesheets.

### Features
| Feature | Description |
|---------|-------------|
| Pending queue | Timesheets awaiting review |
| Hours comparison | Actual vs allocated |
| Variance flags | Highlight overtime/under |
| Approve/reject | With optional notes |
| History | Past approved sheets |

### UI Mockup
```
┌─────────────────────────────────────────────────────────────────┐
│ Timesheet Review                              [Week ▼] [Export] │
├─────────────────────────────────────────────────────────────────┤
│ PENDING TIMESHEETS (2)                                          │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ John Doe • Week of Mar 4-10                                 ││
│ │ ───────────────────────────────────────────────────────────││
│ │ Logged: 42.0h │ Allocated: 40.0h │ Variance: +2.0h ⚠️       ││
│ │                                                             ││
│ │ Breakdown:                                                  ││
│ │   Project A: 20h │ Project B: 15h │ Support: 7h            ││
│ │                                                             ││
│ │ [View Details] [Request Changes]        [Approve ✓]        ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Enhancement 6: Task Progress Monitoring

### Description
Dashboard widget showing task completion status by member.

### Features
| Feature | Description |
|---------|-------------|
| Completion rates | % complete by member |
| Status breakdown | Not Started/In Progress/Done |
| Overdue alerts | Highlight overdue tasks |
| Trend chart | Progress over time |
| Click to filter | Navigate to allocation filtered |

### UI Mockup
```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 TASK PROGRESS                               [View Details →] │
├─────────────────────────────────────────────────────────────────┤
│ Team Completion: ██████████████░░░░░░ 72%    ⚠️ 5 overdue      │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ John Doe      ████████████████████ 100% (6/6)            │   │
│ │ Jane Smith    ██████████████░░░░░░  70% (7/10)   ⚠️ 1    │   │
│ │ Mike Brown    ████████░░░░░░░░░░░░  40% (2/5)    ⚠️ 2    │   │
│ │ Sarah Wilson  ████████████████░░░░  80% (8/10)           │   │
│ └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Enhancement 7: Notification Center

### Description
System for admin to send notifications and view history.

### Features
| Feature | Description |
|---------|-------------|
| Send notification | To individual or team |
| Templates | Pre-defined messages |
| Schedule | Future delivery time |
| History | View sent notifications |
| Read tracking | See who read what |

---

## Implementation Phases

### Phase 1: Leave System (Priority)
**Duration:** 2 weeks

| Task | Description | Effort |
|------|-------------|--------|
| Leave models | Database schema | 2h |
| Leave API endpoints | CRUD + approve/reject | 4h |
| Approval widget | Dashboard component | 4h |
| Leave management page | Full admin page | 6h |
| Balance administration | Library page | 4h |
| Calendar enhancement | Leave overlay | 4h |

### Phase 2: Timesheets
**Duration:** 2 weeks

| Task | Description | Effort |
|------|-------------|--------|
| TimeEntry model | Database schema | 2h |
| Timesheet API | CRUD + submit/approve | 4h |
| Review queue | Admin component | 4h |
| Detailed view | Hours breakdown | 4h |

### Phase 3: Monitoring & Polish
**Duration:** 1 week

| Task | Description | Effort |
|------|-------------|--------|
| Progress widget | Dashboard component | 3h |
| Status column | Allocation table enhancement | 2h |
| Bulk actions | Multi-select + batch ops | 3h |

---

## New Routes Required

| Route | Page | Description |
|-------|------|-------------|
| `/admin/leaves` | LeaveManagement | Approve/manage leave |
| `/admin/timesheets` | TimesheetReview | Approve timesheets |
| `/library/leave-config` | LeaveConfiguration | Leave types & balances |

---

## Sidebar Navigation Updates

```
┌─────────────────────────┐
│ WORKLOAD PRO           │
├─────────────────────────┤
│ 📊 Dashboard           │
│ 📋 Resource Allocation │
│ 📅 Timeline            │
│ 📆 Important Dates     │
│ 💰 Cost Calculator     │
├─────────────────────────┤
│ APPROVALS              │ ← NEW SECTION
│   🏖️ Leave Requests    │ ← NEW
│   ⏱️ Timesheets        │ ← NEW
├─────────────────────────┤
│ LIBRARY                │
│   👥 Team Members      │
│   📁 Phases            │
│   📝 Task Templates    │
│   ⚡ Complexity        │
│   💰 Resource Costs    │
│   🏷️ Cost Centers      │
│   📖 Chart of Accounts │
│   🗓️ Leave Config      │ ← NEW
├─────────────────────────┤
│ ⚙️ Settings            │
└─────────────────────────┘
```

---

## Benefits Summary

| Benefit | Description |
|---------|-------------|
| **Efficiency** | Quick approval actions reduce admin time |
| **Visibility** | All pending items visible on dashboard |
| **Control** | Admins maintain oversight of member actions |
| **Compliance** | Audit trail for all approvals |
| **Planning** | Calendar shows team availability |
| **Accuracy** | Automated balance calculations |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Approval overload | High | Prioritized queue, bulk actions |
| Stale requests | Medium | Email reminders, escalation |
| Complex policies | Medium | Start simple, iterate |
| Mobile access | Low | Responsive design |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Approval time | < 24 hours average | Request → Decision |
| Dashboard visibility | 100% pending shown | Queue accuracy |
| Admin efficiency | 50% time reduction | Survey feedback |
| Data accuracy | 99%+ | Balance calculations |
