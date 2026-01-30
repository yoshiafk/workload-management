# Implementation Plan: Frontend CRUD Backend Integration

## Overview

This plan addresses the gaps identified in the CRUD operations audit, ensuring all frontend actions have proper backend API support and data persistence.

---

## Phase 1: Quick Wins - Use Existing API Helpers (Priority: HIGH)

> [!NOTE]
> The API helper functions already exist in AppContext. The components just need to use them.

### 1.1 Connect Phases to Backend API

**Problem:** `Phases.jsx` uses `dispatch({ type: ACTIONS.ADD_PHASE })` directly instead of calling existing API helpers.

**Files to Modify:**
- `frontend/src/pages/Library/Phases.jsx` - Replace dispatch calls with context API helpers

**API Helpers Already Exist (in AppContext):**
```javascript
// Lines 1172-1185 in AppContext.jsx
addPhase: async (phase) => { ... },
updatePhase: async (id, phase) => { ... },
deletePhase: async (id) => { ... }
```

**Implementation:**
1. Import `addPhase`, `updatePhase`, `deletePhase` from context (via destructuring)
2. Replace `dispatch({ type: ACTIONS.ADD_PHASE, payload: formData })` with `await addPhase(formData)`
3. Replace `dispatch({ type: ACTIONS.UPDATE_PHASE, payload: formData })` with `await updatePhase(formData.id, formData)`
4. Replace `dispatch({ type: ACTIONS.DELETE_PHASE, payload: id })` with `await deletePhase(id)`
5. Add error handling with try/catch
6. Add loading states during API calls

**Note:** `reorderPhases` may need a batch update helper or loop through individual updates.

**Estimated Effort:** 1-2 hours

---

### 1.2 Connect Task Templates to Backend API

**Problem:** `TaskTemplates.jsx` uses `dispatch({ type: ACTIONS.ADD_TASK })` directly instead of calling existing API helpers.

**Files to Modify:**
- `frontend/src/pages/Library/TaskTemplates.jsx` - Replace dispatch calls with context API helpers

**API Helpers Already Exist (in AppContext):**
```javascript
// Lines 1186-1199 in AppContext.jsx
addTask: async (task) => { ... },
updateTask: async (id, task) => { ... },
deleteTask: async (id) => { ... }
```

**Implementation:**
1. Import `addTask`, `updateTask`, `deleteTask` from context (via destructuring)
2. Replace `dispatch({ type: ACTIONS.ADD_TASK, payload: formData })` with `await addTask(formData)`
3. Replace `dispatch({ type: ACTIONS.UPDATE_TASK, payload: formData })` with `await updateTask(formData.id, formData)`
4. Replace `dispatch({ type: ACTIONS.DELETE_TASK, payload: id })` with `await deleteTask(id)`
5. Add error handling with try/catch
6. Add loading states during API calls

**Estimated Effort:** 1-2 hours

---

## Phase 2: New Backend APIs Required (Priority: HIGH)

### 2.1 Resource Costs Backend API

**Problem:** No backend API exists for resource costs management.

**Files to Create:**
- `backend/src/models/Cost.js` - Database model
- `backend/src/routes/costs.js` - API routes
- `backend/src/controllers/costsController.js` - Controller (optional, can use crudFactory)

**Files to Modify:**
- `backend/src/server.js` - Register routes
- `frontend/src/services/api.js` - Add costsApi
- `frontend/src/context/AppContext.jsx` - Add cost API helpers

**Database Model:**
```javascript
// Cost.js
module.exports = (sequelize, DataTypes) => {
  const Cost = sequelize.define('Cost', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    resourceName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roleType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tierLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    minMonthlyCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    maxMonthlyCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    monthlyCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    perDayCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    perHourCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    coaId: {
      type: DataTypes.STRING,
      references: { model: 'ChartOfAccounts', key: 'id' }
    }
  });
  return Cost;
};
```

**API Routes:**
```javascript
// costs.js
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', authorize('admin'), controller.create);
router.put('/:id', authorize('admin'), controller.update);
router.delete('/:id', authorize('admin'), controller.delete);
```

**Estimated Effort:** 4-6 hours

---

### 2.2 Complexity Settings Backend API

**Problem:** No backend API exists for complexity configuration.

**Files to Create:**
- `backend/src/models/ComplexityLevel.js` - Database model
- `backend/src/routes/complexity.js` - API routes

**Files to Modify:**
- `backend/src/server.js` - Register routes
- `frontend/src/services/api.js` - Add complexityApi
- `frontend/src/context/AppContext.jsx` - Add complexity API helpers

**Database Model:**
```javascript
// ComplexityLevel.js
module.exports = (sequelize, DataTypes) => {
  const ComplexityLevel = sequelize.define('ComplexityLevel', {
    level: {
      type: DataTypes.STRING,
      primaryKey: true  // e.g., 'trivial', 'small', 'low', 'medium', 'high', 'sophisticated'
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    days: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    workload: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#6366f1'
    }
  });
  return ComplexityLevel;
};
```

**Estimated Effort:** 3-4 hours

---

## Phase 3: Settings Persistence (Priority: MEDIUM)

### 3.1 Application Settings Backend API

**Problem:** Settings only persist to localStorage, not shared across users/sessions.

**Files to Create:**
- `backend/src/models/Setting.js` - Database model
- `backend/src/routes/settings.js` - API routes

**Files to Modify:**
- `backend/src/server.js` - Register routes
- `frontend/src/services/api.js` - Add settingsApi
- `frontend/src/context/AppContext.jsx` - Add settings API helpers

**Database Model:**
```javascript
// Setting.js
module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
    key: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    value: {
      type: DataTypes.JSON,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'general'
    }
  });
  return Setting;
};
```

**Estimated Effort:** 3-4 hours

---

## Phase 4: Verification & Testing (Priority: HIGH)

### 4.1 Integration Testing
- Test all CRUD operations for each module
- Verify data persists across page refreshes
- Verify data syncs across multiple browser sessions
- Test error handling and rollback scenarios

### 4.2 Data Migration
- Export existing localStorage/IDB data
- Import into database
- Verify data integrity

**Estimated Effort:** 2-3 hours per module

---

## Summary Timeline

| Phase | Description | Effort | Priority |
|-------|-------------|--------|----------|
| 1.1 | Connect Phases to API | 2-3 hrs | HIGH |
| 1.2 | Connect Tasks to API | 2-3 hrs | HIGH |
| 2.1 | Create Costs API | 4-6 hrs | HIGH |
| 2.2 | Create Complexity API | 3-4 hrs | MEDIUM |
| 3.1 | Create Settings API | 3-4 hrs | MEDIUM |
| 4.x | Testing & Verification | 6-9 hrs | HIGH |

**Total Estimated Effort:** 20-30 hours

---

## Dependencies

1. Phase 1 has no dependencies - can start immediately
2. Phase 2 requires database migration capability
3. Phase 3 can be deferred if not critical
4. Phase 4 must follow all implementation phases

---

## Risk Mitigation

1. **Data Loss Prevention:** Implement backend rollback on API failure
2. **Backward Compatibility:** Keep localStorage as fallback during migration
3. **Error Handling:** Implement toast notifications for API failures
4. **Testing:** Create test data before implementing to verify
