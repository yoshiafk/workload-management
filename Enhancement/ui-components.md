# UI Components Specification: HR Workload Enhancement

This document details UI component specifications and mockups for the enhancement project.

---

## Component Hierarchy

```
App
├── Header
│   └── NotificationBell (NEW)
├── Sidebar
│   └── Navigation (UPDATED)
└── Main Content
    ├── Member Views
    │   ├── MemberDashboard (ENHANCED)
    │   │   ├── LeaveBalanceWidget (NEW)
    │   │   └── TimesheetSummary (NEW)
    │   ├── LeaveManagement (NEW)
    │   │   ├── LeaveRequestForm (NEW)
    │   │   └── LeaveRequestList (NEW)
    │   ├── Timesheet (NEW)
    │   │   ├── WeeklyTimesheet (NEW)
    │   │   └── TimeEntryForm (NEW)
    │   └── MyTasks (NEW)
    │       └── StatusSelector (NEW)
    └── Admin Views
        ├── WorkloadSummary (ENHANCED)
        │   ├── PendingApprovalsWidget (NEW)
        │   └── TaskProgressWidget (NEW)
        ├── LeaveAdmin (NEW)
        ├── LeaveConfiguration (NEW)
        └── TimesheetReview (NEW)
```

---

## Member Components

### LeaveBalanceWidget

Dashboard widget showing member's leave balance.

**Location:** `src/components/leave/LeaveBalanceWidget.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| onRequestLeave | function | Callback when "Request Leave" clicked |

**States:**
- Loading
- Error
- Empty (no balances)
- Normal

**UI Mockup:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏖️ MY LEAVE BALANCE                       [Request Leave +]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Annual Leave     ████████████░░░░░░░    12/20 days         │
│                                                             │
│ Sick Leave       ████░░░░░░░░░░░░░░░     4/10 days         │
│                                                             │
│ Personal Days    ░░░░░░░░░░░░░░░░░░░     0/3 days          │
│                                                             │
│ ⏳ Pending: 5 days (1 request awaiting approval)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Code Structure:**
```jsx
function LeaveBalanceWidget({ onRequestLeave }) {
  const { data: balances, isLoading, error } = useLeaveBalance();
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Leave Balance</CardTitle>
        <Button onClick={onRequestLeave}>Request Leave +</Button>
      </CardHeader>
      <CardContent>
        {balances.map(balance => (
          <LeaveBalanceBar key={balance.id} balance={balance} />
        ))}
        {pendingDays > 0 && (
          <PendingIndicator days={pendingDays} />
        )}
      </CardContent>
    </Card>
  );
}
```

---

### LeaveRequestForm

Modal form for submitting leave requests.

**Location:** `src/components/leave/LeaveRequestForm.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| open | boolean | Dialog open state |
| onClose | function | Close callback |
| onSuccess | function | Success callback |

**UI Mockup:**
```
┌─────────────────────────────────────────────────────────────┐
│                     REQUEST LEAVE                       [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Leave Type                                                  │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Annual Leave                                          ▼ ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Dates                                                       │
│ ┌────────────────────┐  ┌────────────────────┐             │
│ │ Start: Mar 10, 2024│  │ End: Mar 14, 2024  │             │
│ └────────────────────┘  └────────────────────┘             │
│                                                             │
│ Duration: 5 working days                                    │
│                                                             │
│ Half Day (Optional)                                         │
│ ○ Full Day  ○ AM Only  ○ PM Only                           │
│                                                             │
│ Reason                                                      │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Family vacation to Japan                                ││
│ │                                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ℹ️ Remaining balance after request: 12 days                │
│                                                             │
│              [Cancel]                [Submit Request]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### LeaveRequestList

List of leave requests with filters.

**Location:** `src/components/leave/LeaveRequestList.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| requests | array | Leave requests |
| onCancel | function | Cancel request callback |

**UI Mockup:**
```
┌─────────────────────────────────────────────────────────────┐
│ [All] [Pending] [Approved] [Rejected]                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 🏖️ Annual Leave                            [PENDING ⏳] ││
│ │ Mar 10-14, 2024 (5 days)                                ││
│ │ "Family vacation"                                       ││
│ │ Submitted: Mar 1, 2024                    [Cancel]      ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 🏥 Sick Leave                             [APPROVED ✓]  ││
│ │ Feb 20, 2024 (1 day)                                    ││
│ │ "Flu"                                                   ││
│ │ Approved by: Admin • Feb 20, 2024                       ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### StatusSelector

Dropdown for updating task status.

**Location:** `src/components/tasks/StatusSelector.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| value | string | Current status |
| onChange | function | Status change callback |
| disabled | boolean | Disable selector |

**Status Options:**
| Status | Label | Color | Icon |
|--------|-------|-------|------|
| NOT_STARTED | Not Started | Gray | ○ |
| IN_PROGRESS | In Progress | Blue | ◐ |
| ON_HOLD | On Hold | Yellow | ⏸ |
| COMPLETED | Completed | Green | ✓ |

**UI Mockup (Dropdown):**
```
┌─────────────────────┐
│ In Progress ◐     ▼ │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│ ○ Not Started       │
│ ◐ In Progress    ✓  │
│ ⏸ On Hold           │
│ ✓ Completed         │
└─────────────────────┘
```

---

### WeeklyTimesheet

Grid view of weekly time entries.

**Location:** `src/components/timesheet/WeeklyTimesheet.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| weekStart | Date | Monday of week |
| entries | array | Time entries |
| allocations | array | Member's allocations |
| onEntryChange | function | Entry change callback |
| onSubmit | function | Submit week callback |

**UI Mockup:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⏱️ TIMESHEET                    [◀ Prev Week] Mar 4-10, 2024 [Next Week ▶] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Task/Project          │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │ TOTAL    │
│ ──────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼───────── │
│ 📋 Website Redesign   │ 2.0 │ 3.0 │ 4.0 │ 2.5 │ 1.0 │  -  │  -  │ 12.5h    │
│    Phase: Design      │     │     │     │     │     │     │     │          │
│ ──────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼───────── │
│ 📋 API Development    │ 4.0 │ 3.0 │ 2.0 │ 3.5 │ 4.0 │  -  │  -  │ 16.5h    │
│    Phase: Backend     │     │     │     │     │     │     │     │          │
│ ──────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼───────── │
│ 📋 Bug Fixes          │ 2.0 │ 2.0 │ 2.0 │ 2.0 │ 3.0 │  -  │  -  │ 11.0h    │
│    Phase: Support     │     │     │     │     │     │     │     │          │
│ ══════════════════════╪═════╪═════╪═════╪═════╪═════╪═════╪═════╪══════════│
│ DAILY TOTAL           │ 8.0 │ 8.0 │ 8.0 │ 8.0 │ 8.0 │  -  │  -  │          │
│ WEEK TOTAL            │     │     │     │     │     │     │     │ 40.0h ✓  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ Status: ⏳ Draft                           [+ Quick Log]  [Submit Week ▶]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### TimeEntryForm

Quick time logging dialog.

**Location:** `src/components/timesheet/TimeEntryForm.jsx`

**UI Mockup:**
```
┌─────────────────────────────────────────────────────────────┐
│                      LOG TIME                           [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Task                                                        │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Website Redesign - Design Phase                       ▼ ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Date                                                        │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 📅 March 5, 2024 (Today)                                ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Hours                                                       │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 2.5                                                     ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Notes (optional)                                            │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Completed homepage wireframes                           ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│                     [Cancel]              [Save Entry]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Admin Components

### PendingApprovalsWidget

Dashboard widget for quick approvals.

**Location:** `src/components/leave/PendingApprovalsWidget.jsx`

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| maxItems | number | Max items to show (default 3) |
| onViewAll | function | View all callback |

**UI Mockup:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔔 PENDING APPROVALS (5)                      [View All →]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 👤 John Doe              Annual Leave         2h ago    ││
│ │    Mar 10-14 (5 days) • "Family vacation"               ││
│ │    Balance after: 12 days                               ││
│ │    ⚠️ Team conflict: Mike Brown off Mar 11              ││
│ │                                                         ││
│ │    [Reject]                              [Approve ✓]    ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 👤 Jane Smith            Sick Leave         Yesterday   ││
│ │    Mar 20 (1 day) • "Medical appointment"               ││
│ │                                                         ││
│ │    [Reject]                              [Approve ✓]    ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ + 3 more pending...                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### TaskProgressWidget

Dashboard widget showing team task progress.

**Location:** `src/components/tasks/TaskProgressWidget.jsx`

**UI Mockup:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 TASK PROGRESS                            [View Details →]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Team Completion Rate: ████████████████░░░░ 78%  ⚠️ 3 overdue│
│                                                             │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ John Doe      ████████████████████ 100% (10/10)        │ │
│ │ Jane Smith    ██████████████████░░  90% (9/10)         │ │
│ │ Mike Brown    ██████████░░░░░░░░░░  50% (3/6)  ⚠️ 2    │ │
│ │ Sarah Lee     ████████████████░░░░  80% (8/10)         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### NotificationBell

Header notification indicator.

**Location:** `src/components/notifications/NotificationBell.jsx`

**States:**
- No notifications: Gray bell icon
- Unread notifications: Bell with red badge showing count
- Dropdown open: Shows notification list

**UI Mockup:**
```
Normal:          With Badge:
  🔔                🔔
                    ⬤5

Dropdown Open:
  🔔
  ⬤5
  │
  ▼
┌──────────────────────────────────────────┐
│ NOTIFICATIONS                [Mark All ✓]│
├──────────────────────────────────────────┤
│ ◉ Leave Approved                  2h ago │
│   Your annual leave has been approved    │
├──────────────────────────────────────────┤
│ ◉ New Task Assigned              Yesterday│
│   You've been assigned: API Update       │
├──────────────────────────────────────────┤
│ ○ Task Due Soon                  Mar 1   │
│   Website Redesign due in 2 days         │
├──────────────────────────────────────────┤
│              [View All Notifications]    │
└──────────────────────────────────────────┘
```

---

## Page Layouts

### Leave Management Page (Member)

**Route:** `/leave`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Sidebar │ LEAVE MANAGEMENT                              [+ Request Leave]   │
│         ├───────────────────────────────────────────────────────────────────┤
│ 📊 Dash │                                                                   │
│ 📋 Tasks│ ┌─────────────────────────────────────────────────────────────┐ │
│ ⏱️ Time │ │ MY BALANCE                                                  │ │
│ 🏖️ Leave│ │                                                             │ │
│ 📅 Cal  │ │ Annual ████████████░░░░░ 12/20   Sick ████░░░░░ 4/10       │ │
│         │ └─────────────────────────────────────────────────────────────┘ │
│ LIBRARY │                                                                   │
│  Phases │ ┌─────────────────────────────────────────────────────────────┐ │
│  Team   │ │ MY REQUESTS                                                 │ │
│         │ │ [All] [Pending] [Approved] [Rejected]          🔍 Search    │ │
│ ⚙️ Set  │ ├─────────────────────────────────────────────────────────────┤ │
│         │ │                                                             │ │
│         │ │ 🏖️ Annual Leave  Mar 10-14 (5d)  PENDING ⏳      [Cancel]  │ │
│         │ │ 🏥 Sick Leave    Feb 20 (1d)     APPROVED ✓                │ │
│         │ │                                                             │ │
│         │ └─────────────────────────────────────────────────────────────┘ │
│         │                                                                   │
└─────────┴───────────────────────────────────────────────────────────────────┘
```

---

### Timesheet Page (Member)

**Route:** `/timesheets`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Sidebar │ TIMESHEETS                 [◀ Prev] Mar 4-10, 2024 [Next ▶]      │
│         ├───────────────────────────────────────────────────────────────────┤
│ 📊 Dash │                                                                   │
│ 📋 Tasks│ ┌─────────────────────────────────────────────────────────────┐ │
│ ⏱️ Time │ │                Mon Tue Wed Thu Fri Sat Sun │ TOTAL          │ │
│ 🏖️ Leave│ ├───────────────┼───┼───┼───┼───┼───┼───┼───┼────────────────┤ │
│ 📅 Cal  │ │ Website       │2.0│3.0│4.0│2.5│1.0│ - │ - │ 12.5h          │ │
│         │ │ API Dev       │4.0│3.0│2.0│3.5│4.0│ - │ - │ 16.5h          │ │
│ LIBRARY │ │ Bug Fixes     │2.0│2.0│2.0│2.0│3.0│ - │ - │ 11.0h          │ │
│  Phases │ ├───────────────┼───┼───┼───┼───┼───┼───┼───┼────────────────┤ │
│  Team   │ │ TOTAL         │8.0│8.0│8.0│8.0│8.0│ - │ - │ 40.0h ✓        │ │
│         │ └─────────────────────────────────────────────────────────────┘ │
│ ⚙️ Set  │                                                                   │
│         │ Status: Draft ⏳                    [+ Quick Log] [Submit Week]  │
│         │                                                                   │
└─────────┴───────────────────────────────────────────────────────────────────┘
```

---

### Leave Admin Page

**Route:** `/admin/leaves`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Sidebar │ LEAVE MANAGEMENT                    🔍 Search  [Filter ▼] [Export]│
│         ├───────────────────────────────────────────────────────────────────┤
│ 📊 Dash │                                                                   │
│ 📋 Alloc│ [Pending (5)] [Approved] [Rejected] [All]                         │
│ 📅 Time │                                                                   │
│         │ ┌─────────────────────────────────────────────────────────────┐ │
│ APPROVAL│ │ ☐ Select All                    [Bulk Approve] [Bulk Reject]│ │
│ 🏖️ Leave│ ├─────────────────────────────────────────────────────────────┤ │
│ ⏱️ Sheets│ │ ☐ John Doe    Annual   Mar 10-14   5d   Pending   [•••]    │ │
│         │ │ ☐ Jane Smith  Sick     Mar 20       1d   Pending   [•••]    │ │
│ LIBRARY │ │ ☐ Mike Brown  Annual   Mar 25-26    2d   Pending   [•••]    │ │
│  ...    │ └─────────────────────────────────────────────────────────────┘ │
│         │                                                                   │
│         │ Showing 1-5 of 5 pending requests                                │
│         │                                                                   │
└─────────┴───────────────────────────────────────────────────────────────────┘
```

---

## Color Palette for Status

| Status | Background | Text | Border |
|--------|------------|------|--------|
| Pending | `#FEF3C7` | `#92400E` | `#F59E0B` |
| Approved | `#D1FAE5` | `#065F46` | `#10B981` |
| Rejected | `#FEE2E2` | `#991B1B` | `#EF4444` |
| In Progress | `#DBEAFE` | `#1E40AF` | `#3B82F6` |
| On Hold | `#FEF9C3` | `#713F12` | `#EAB308` |
| Completed | `#D1FAE5` | `#065F46` | `#22C55E` |
| Not Started | `#F3F4F6` | `#374151` | `#9CA3AF` |

---

## Responsive Breakpoints

| Breakpoint | Width | Sidebar | Layout |
|------------|-------|---------|--------|
| Mobile | < 640px | Hidden/Overlay | Single column |
| Tablet | 640-1024px | Collapsed | Two columns |
| Desktop | > 1024px | Expanded | Full layout |

---

## Accessibility Requirements

- All interactive elements must have focus states
- Color contrast ratio minimum 4.5:1
- Form inputs must have labels
- Status must not rely on color alone (use icons)
- Keyboard navigation support
- Screen reader announcements for status changes
