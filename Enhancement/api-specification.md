# API Specification: HR Workload Enhancement

This document details all new API endpoints for the enhancement project.

---

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Leave Management APIs

### Member Leave Endpoints

#### GET /api/leaves/me

Get the authenticated member's leave requests.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | all | Filter by status (PENDING, APPROVED, REJECTED, CANCELLED) |
| year | integer | current | Filter by year |
| limit | integer | 20 | Max results |
| offset | integer | 0 | Pagination offset |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "leaveType": {
        "id": "uuid",
        "name": "Annual Leave",
        "color": "#22C55E"
      },
      "startDate": "2024-03-10",
      "endDate": "2024-03-14",
      "days": 5,
      "halfDay": "FULL",
      "reason": "Family vacation",
      "status": "PENDING",
      "createdAt": "2024-03-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 20,
    "offset": 0
  }
}
```

---

#### GET /api/leaves/balance

Get the authenticated member's leave balances.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "leaveType": {
        "id": "uuid",
        "name": "Annual Leave",
        "color": "#22C55E"
      },
      "year": 2024,
      "totalDays": 20,
      "usedDays": 8,
      "pendingDays": 5,
      "remainingDays": 7
    },
    {
      "id": "uuid",
      "leaveType": {
        "id": "uuid",
        "name": "Sick Leave",
        "color": "#EF4444"
      },
      "year": 2024,
      "totalDays": 10,
      "usedDays": 2,
      "pendingDays": 0,
      "remainingDays": 8
    }
  ]
}
```

---

#### POST /api/leaves

Submit a new leave request.

**Request Body:**
```json
{
  "leaveTypeId": "uuid",
  "startDate": "2024-03-10",
  "endDate": "2024-03-14",
  "halfDay": "FULL",
  "reason": "Family vacation"
}
```

**Validation Rules:**
- `leaveTypeId` - Required, must exist
- `startDate` - Required, must be today or future
- `endDate` - Required, must be >= startDate
- `halfDay` - Optional, one of: FULL, AM, PM
- `reason` - Optional, max 1000 characters

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "days": 5,
    "message": "Leave request submitted successfully"
  }
}
```

**Error Responses:**
- 400: Invalid date range
- 400: Insufficient balance
- 400: Overlapping request exists

---

#### PUT /api/leaves/:id/cancel

Cancel a pending leave request.

**Response:**
```json
{
  "success": true,
  "message": "Leave request cancelled successfully"
}
```

**Error Responses:**
- 404: Request not found
- 403: Not your request
- 400: Cannot cancel (already processed)

---

### Admin Leave Endpoints

#### GET /api/admin/leaves/pending

Get all pending leave requests.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "member": {
        "id": "uuid",
        "name": "John Doe",
        "type": "Engineer"
      },
      "leaveType": {
        "id": "uuid",
        "name": "Annual Leave",
        "color": "#22C55E"
      },
      "startDate": "2024-03-10",
      "endDate": "2024-03-14",
      "days": 5,
      "reason": "Family vacation",
      "status": "PENDING",
      "createdAt": "2024-03-01T10:00:00Z",
      "balanceAfter": 12,
      "teamConflicts": [
        {
          "memberId": "uuid",
          "memberName": "Jane Smith",
          "dates": ["2024-03-11"]
        }
      ]
    }
  ]
}
```

---

#### GET /api/admin/leaves

Get all leave requests with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| memberId | uuid | Filter by member |
| leaveTypeId | uuid | Filter by leave type |
| startDate | date | Filter by start date range |
| endDate | date | Filter by end date range |

---

#### PUT /api/admin/leaves/:id/approve

Approve a leave request.

**Request Body (optional):**
```json
{
  "note": "Approved. Enjoy your vacation!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave request approved successfully"
}
```

---

#### PUT /api/admin/leaves/:id/reject

Reject a leave request.

**Request Body:**
```json
{
  "reason": "Critical project deadline during requested period"
}
```

**Validation:**
- `reason` - Required, min 10 characters

**Response:**
```json
{
  "success": true,
  "message": "Leave request rejected"
}
```

---

#### GET /api/admin/leave-balances

Get all member leave balances.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| memberId | uuid | Filter by member |
| year | integer | Filter by year |

---

#### PUT /api/admin/leave-balances/:id

Adjust a member's leave balance.

**Request Body:**
```json
{
  "totalDays": 22,
  "reason": "Carry-over from previous year"
}
```

---

#### GET /api/admin/leave-types

Get all leave types.

---

#### POST /api/admin/leave-types

Create a new leave type.

**Request Body:**
```json
{
  "name": "Study Leave",
  "defaultDays": 5,
  "carryOverMax": 0,
  "requiresApproval": true,
  "color": "#F59E0B"
}
```

---

## Timesheet APIs

### Member Timesheet Endpoints

#### GET /api/time-entries/me

Get my time entries.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | date | Filter from date |
| endDate | date | Filter to date |
| allocationId | uuid | Filter by allocation |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "allocation": {
        "id": "uuid",
        "taskTemplate": { "name": "Website Redesign" },
        "phase": { "name": "Design" }
      },
      "date": "2024-03-05",
      "hours": 4.5,
      "notes": "Worked on homepage mockups"
    }
  ]
}
```

---

#### POST /api/time-entries

Log a time entry.

**Request Body:**
```json
{
  "allocationId": "uuid",
  "date": "2024-03-05",
  "hours": 4.5,
  "notes": "Worked on homepage mockups"
}
```

**Validation:**
- `allocationId` - Required, must belong to member
- `date` - Required, not in future
- `hours` - Required, 0.25 to 24
- `notes` - Optional, max 500 characters

---

#### PUT /api/time-entries/:id

Update a time entry.

---

#### DELETE /api/time-entries/:id

Delete a time entry.

---

#### GET /api/timesheets/me

Get my timesheet periods.

---

#### PUT /api/timesheets/:id/submit

Submit a timesheet for approval.

---

### Admin Timesheet Endpoints

#### GET /api/admin/timesheets/pending

Get pending timesheets.

---

#### PUT /api/admin/timesheets/:id/approve

Approve a timesheet.

---

#### PUT /api/admin/timesheets/:id/reject

Reject a timesheet.

---

## Task Status APIs

#### PUT /api/allocations/:id/status

Update task status (member can update own tasks).

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Validation:**
- `status` - Required, one of: NOT_STARTED, IN_PROGRESS, ON_HOLD, COMPLETED

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "IN_PROGRESS",
    "statusUpdatedAt": "2024-03-05T10:30:00Z"
  }
}
```

---

#### GET /api/admin/tasks/progress

Get task progress statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "teamCompletion": 78,
    "totalTasks": 50,
    "completedTasks": 39,
    "overdueCount": 3,
    "byMember": [
      {
        "memberId": "uuid",
        "memberName": "John Doe",
        "total": 10,
        "completed": 10,
        "percentage": 100,
        "overdue": 0
      }
    ]
  }
}
```

---

#### GET /api/admin/tasks/overdue

Get overdue tasks.

---

## Notification APIs

#### GET /api/notifications

Get my notifications.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| unreadOnly | boolean | false | Only unread |
| limit | integer | 20 | Max results |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "LEAVE_APPROVED",
      "title": "Leave Approved",
      "message": "Your annual leave request (Mar 10-14) has been approved.",
      "link": "/leave",
      "isRead": false,
      "createdAt": "2024-03-02T09:00:00Z"
    }
  ]
}
```

---

#### GET /api/notifications/unread-count

Get unread notification count.

**Response:**
```json
{
  "success": true,
  "count": 5
}
```

---

#### PUT /api/notifications/:id/read

Mark notification as read.

---

#### PUT /api/notifications/read-all

Mark all notifications as read.

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Human readable error message",
    "details": {}
  }
}
```

**Common Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Not allowed to access resource |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| CONFLICT | 409 | Resource conflict |
| INTERNAL_ERROR | 500 | Server error |
