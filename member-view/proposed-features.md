# Proposed Features: Member View Enhancements

## Overview

Based on market research and current state analysis, this document outlines the proposed new features for members (non-admin users) in priority order.

---

## Priority Matrix

| Priority | Feature | Effort | Impact | Score |
|----------|---------|--------|--------|-------|
| 🔴 Critical | Leave Request System | High | High | ⭐⭐⭐⭐⭐ |
| 🔴 Critical | Task Status Updates | Low | High | ⭐⭐⭐⭐⭐ |
| 🟠 High | Time Logging | Medium | High | ⭐⭐⭐⭐ |
| 🟠 High | Leave Balance Display | Low | Medium | ⭐⭐⭐⭐ |
| 🟡 Medium | Profile Management | Medium | Medium | ⭐⭐⭐ |
| 🟡 Medium | Notification System | High | Medium | ⭐⭐⭐ |
| 🟢 Low | Team Calendar | Medium | Low | ⭐⭐ |
| 🟢 Low | Document Portal | High | Low | ⭐⭐ |

---

## Feature 1: Leave Management System

### What It Does
Members can request time-off, view their leave balance, and track approval status.

### Member User Flow
```
┌─────────────────────────────────────────────────────────────┐
│ Member Action Flow                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  Member  │───▶│  Submit  │───▶│  Admin   │              │
│  │  Views   │    │  Leave   │    │ Reviews  │              │
│  │ Balance  │    │ Request  │    │          │              │
│  └──────────┘    └──────────┘    └────┬─────┘              │
│                                       │                     │
│                       ┌───────────────┴───────────────┐    │
│                       ▼                               ▼    │
│                ┌──────────┐                    ┌──────────┐│
│                │ Approved │                    │ Rejected ││
│                │          │                    │          ││
│                └──────────┘                    └──────────┘│
│                       │                               │    │
│                       ▼                               ▼    │
│            ┌────────────────┐              ┌──────────────┐│
│            │ Balance Updated│              │ Member Can   ││
│            │ Calendar Shows │              │ Edit/Resubmit││
│            └────────────────┘              └──────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### UI Components Needed

#### 1. Leave Balance Widget (Dashboard)
Small card showing remaining leave at a glance.

#### 2. Leave Request Page (`/leave`)
Full page with:
- Balance summary at top
- Request form
- Pending/history list

#### 3. Leave Request Dialog
Modal form for submitting new requests.

### Data Model

```javascript
// LeaveBalance
{
  memberId: UUID,
  type: 'ANNUAL' | 'SICK' | 'PERSONAL',
  year: 2024,
  total: 20,
  used: 8,
  remaining: 12  // computed
}

// LeaveRequest
{
  memberId: UUID,
  type: 'ANNUAL',
  startDate: '2024-03-10',
  endDate: '2024-03-14',
  days: 5,          // computed
  reason: 'Family vacation',
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
  reviewedBy: UUID,
  reviewNote: null
}
```

### Admin Interface Additions
- Leave requests queue on admin dashboard
- Approve/Reject buttons with optional note
- Team calendar showing who's off

---

## Feature 2: Task Status Updates

### What It Does
Members can update the status of their assigned tasks.

### Implementation

#### Status Options
| Status | Description | Color |
|--------|-------------|-------|
| `NOT_STARTED` | Task not yet begun | Gray |
| `IN_PROGRESS` | Currently working on | Blue |
| `ON_HOLD` | Temporarily paused | Yellow |
| `COMPLETED` | Finished | Green |

#### UI Changes to MemberDashboard
Add status dropdown/toggle to each task card:

```jsx
// Proposed task card enhancement
<TaskCard>
  <TaskInfo />
  <StatusSelector 
    value={task.status}
    onChange={(newStatus) => updateTaskStatus(task.id, newStatus)}
    options={['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED']}
  />
</TaskCard>
```

#### API Endpoint
```
PUT /api/allocations/:id/status
Body: { status: 'IN_PROGRESS' }
Auth: Member must own the allocation
```

### Member Benefits
- Mark tasks complete when done
- Indicate work in progress
- Better visibility for managers

---

## Feature 3: Time Logging

### What It Does
Members can log actual hours worked on tasks.

### UI Design

#### Time Entry Form
```
┌─────────────────────────────────────────────────┐
│ ⏱️ LOG TIME                                      │
├─────────────────────────────────────────────────┤
│ Task:   [Select Task        ▼]                  │
│ Date:   [Today - Mar 5, 2024]                   │
│ Hours:  [    ] hours  (e.g., 2.5)              │
│ Notes:  [Optional description...]               │
│                                                 │
│ [Cancel]                        [Save Entry]   │
└─────────────────────────────────────────────────┘
```

#### My Timesheet View
Weekly view showing logged hours per task.

### Benefits
- Track actual vs planned effort
- Better project cost estimation
- Identify capacity issues

---

## Feature 4: Member Navigation Updates

### Proposed Sidebar for Members

```
┌─────────────────────┐
│ WORKLOAD PRO       │
├─────────────────────┤
│ 📊 Dashboard       │  ← Current home
│ 📋 My Tasks        │  ← NEW: All tasks view
│ ⏱️ Timesheets      │  ← NEW: Time logging
│ 🏖️ Leave           │  ← NEW: Leave management
│ 📅 Calendar        │  ← Timeline (existing)
├─────────────────────┤
│ LIBRARY            │
│   📁 Phases        │  ← Read-only view
│   👥 Team          │  ← Read-only view
├─────────────────────┤
│ ⚙️ Settings        │  ← With profile section
└─────────────────────┘
```

### Route Structure

| Route | Page | Description |
|-------|------|-------------|
| `/` | MemberDashboard | Overview & stats |
| `/tasks` | MyTasks | All my assignments |
| `/timesheets` | Timesheet | Log & view hours |
| `/leave` | LeaveManagement | Request & balance |
| `/calendar` | PersonalCalendar | My schedule |
| `/settings/profile` | Profile | Personal info |

---

## Feature 5: Profile Management

### Editable Fields

| Field | Editable by Member |
|-------|-------------------|
| Display Name | ⚪ View only |
| Email | ⚪ View only |
| Phone | ✅ Editable |
| Emergency Contact | ✅ Editable |
| Profile Photo | ✅ Editable |
| Password | ✅ Changeable |
| Notification Prefs | ✅ Editable |

### Profile Page Layout
Add a "My Profile" section to Settings page.

---

## Implementation Phases

### Phase 1: Quick Wins (1 week)
- ✅ Task status updates (low effort, high impact)
- ✅ Leave balance widget on dashboard

### Phase 2: Leave System (2 weeks)
- Leave request form and submission
- Admin approval interface
- Leave history view
- Balance calculations

### Phase 3: Time Tracking (2 weeks)
- Time entry dialog
- Timesheet weekly view
- Actual vs planned comparison

### Phase 4: Polish (1 week)
- Profile management
- Navigation updates
- Notification foundations

---

## Technical Considerations

### Backend Changes
1. New models: `LeaveRequest`, `LeaveBalance`, `TimeEntry`
2. New API endpoints for leave and time management
3. Authorization middleware for member-specific routes
4. Seed data for leave balances

### Frontend Changes
1. New pages: `MyTasks`, `Leave`, `Timesheets`
2. Dashboard components for leave balance
3. Task card status selector component
4. Time entry form modal
5. Sidebar updates for member role

### Database Migrations
1. `create_leave_requests_table`
2. `create_leave_balances_table`
3. `create_time_entries_table`
4. `add_status_to_allocations`

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Leave request adoption | 80% of members use within 1 month | Usage analytics |
| Task completion rate | 20% improvement | Status changes tracked |
| Time logging compliance | 70% of tasks have time logged | Database query |
| Member satisfaction | 4.5/5 rating | User feedback |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | High | Strict MVP for each phase |
| Complex leave calculations | Medium | Start with simple accrual |
| Member adoption | Medium | Good UX, onboarding tips |
| Performance | Low | Lazy loading, pagination |

---

## Next Steps

1. **Review & approve** this proposal
2. **Prioritize** which features to build first
3. **Design** UI mockups for approved features
4. **Implement** Phase 1 (task status updates)
5. **Test & iterate** based on feedback
