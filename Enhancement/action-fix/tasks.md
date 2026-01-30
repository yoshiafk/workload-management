# Task List: Frontend CRUD Backend Integration

## Overview

This document contains actionable tasks for fixing all frontend CRUD operations that are missing proper backend API support.

---

## Task Categories

- 🔴 **Critical** - Data loss risk, must fix immediately
- 🟡 **High** - Important for data integrity
- 🟢 **Medium** - Improves user experience
- ⚪ **Low** - Nice to have

---

## Phase 1: Quick Wins - Use Existing API Helpers

> [!NOTE]
> API helper functions already exist in AppContext (lines 1172-1199). The components just need to use them.

### Task 1.1: Update Phases to Use API Helpers
**Priority:** 🔴 Critical  
**Estimated Time:** 1-2 hours  
**Status:** [ ] Not Started

#### Subtasks:
- [ ] **1.1.1** Update `const { state, dispatch } = useApp()` to include API helpers
  - Change to `const { state, addPhase, updatePhase, deletePhase } = useApp()`
  
- [ ] **1.1.2** Replace dispatch in `handleSubmit` with API helpers
  - Replace `dispatch({ type: ACTIONS.ADD_PHASE, payload: formData })` 
  - With `await addPhase(formData)`
  - Replace `dispatch({ type: ACTIONS.UPDATE_PHASE, payload: formData })`
  - With `await updatePhase(formData.id, formData)`
  
- [ ] **1.1.3** Replace dispatch in `handleDeleteConfirm` with API helper
  - Replace `dispatch({ type: ACTIONS.DELETE_PHASE, payload: phaseToDelete.id })`
  - With `await deletePhase(phaseToDelete.id)`
  
- [ ] **1.1.4** Add try/catch error handling
  - Wrap API calls in try/catch
  - Show toast notification on error
  
- [ ] **1.1.5** Add loading states
  - Add `isSubmitting` state
  - Disable buttons during API calls
  
- [ ] **1.1.6** Handle phase reordering
  - Create `reorderPhases` helper in AppContext or loop through `updatePhase`
  
- [ ] **1.1.7** Test Phases CRUD operations
  - Test create, update, delete
  - Verify data persists after page refresh

---

### Task 1.2: Update Task Templates to Use API Helpers
**Priority:** 🔴 Critical  
**Estimated Time:** 1-2 hours  
**Status:** [ ] Not Started

#### Subtasks:
- [ ] **1.2.1** Update `const { state, dispatch } = useApp()` to include API helpers
  - Change to `const { state, addTask, updateTask, deleteTask } = useApp()`
  
- [ ] **1.2.2** Replace dispatch in `handleSubmit` with API helpers
  - Replace `dispatch({ type: ACTIONS.ADD_TASK, payload: formData })`
  - With `await addTask(formData)`
  - Replace `dispatch({ type: ACTIONS.UPDATE_TASK, payload: formData })`
  - With `await updateTask(formData.id, formData)`
  
- [ ] **1.2.3** Replace dispatch in `handleDeleteConfirm` with API helper
  - Replace `dispatch({ type: ACTIONS.DELETE_TASK, payload: currentTask.id })`
  - With `await deleteTask(currentTask.id)`
  
- [ ] **1.2.4** Add try/catch error handling
  - Wrap API calls in try/catch
  - Show toast notification on error
  
- [ ] **1.2.5** Add loading states
  - Add `isSubmitting` state
  - Disable buttons during API calls
  
- [ ] **1.2.6** Test Task Templates CRUD operations
  - Test create, update, delete
  - Verify estimates data structure is preserved
  - Verify data persists after page refresh

---

## Phase 2: Create New Backend APIs

### Task 2.1: Create Resource Costs Backend API
**Priority:** 🔴 Critical  
**Estimated Time:** 4-6 hours  
**Status:** [ ] Not Started

#### Subtasks:
- [ ] **2.1.1** Create `Cost` database model
  - File: `backend/src/models/Cost.js`
  - Fields: id, resourceName, roleType, tierLevel, monthlyCost, perDayCost, perHourCost, coaId
  - Add associations to ChartOfAccounts
  
- [ ] **2.1.2** Create costs routes
  - File: `backend/src/routes/costs.js`
  - Endpoints: GET /, GET /:id, POST /, PUT /:id, DELETE /:id
  - Add admin authorization for mutations
  
- [ ] **2.1.3** Register costs routes in server.js
  - Import and mount at `/costs`
  
- [ ] **2.1.4** Run database migration
  - Create costs table
  
- [ ] **2.1.5** Add `costsApi` to frontend api.js
  - Add all CRUD operations
  
- [ ] **2.1.6** Add cost API helpers to AppContext.jsx
  - `addCost`, `updateCost`, `deleteCost`
  
- [ ] **2.1.7** Update `ResourceCosts.jsx` to use API helpers
  - Replace direct dispatch calls
  - Add error handling
  
- [ ] **2.1.8** Update `loadData` in AppContext to fetch costs
  
- [ ] **2.1.9** Test Resource Costs CRUD
  - Full end-to-end testing

---

### Task 2.2: Create Complexity Settings Backend API
**Priority:** 🟡 High  
**Estimated Time:** 3-4 hours  
**Status:** [ ] Not Started

#### Subtasks:
- [ ] **2.2.1** Create `ComplexityLevel` database model
  - File: `backend/src/models/ComplexityLevel.js`
  - Fields: level (PK), label, days, hours, workload, color
  
- [ ] **2.2.2** Create complexity routes
  - File: `backend/src/routes/complexity.js`
  - Endpoints: GET /, PUT /:level
  - Read-only for non-admins
  
- [ ] **2.2.3** Register routes in server.js
  - Mount at `/config/complexity`
  
- [ ] **2.2.4** Run database migration
  - Create complexity_levels table
  - Seed default complexity levels
  
- [ ] **2.2.5** Add `complexityApi` to frontend api.js
  
- [ ] **2.2.6** Add complexity API helpers to AppContext.jsx
  - `updateComplexity`
  
- [ ] **2.2.7** Update `Complexity.jsx` to use API helpers
  
- [ ] **2.2.8** Update `loadData` in AppContext to fetch complexity
  
- [ ] **2.2.9** Test Complexity CRUD

---

## Phase 3: Settings Persistence

### Task 3.1: Create Application Settings Backend API
**Priority:** 🟢 Medium  
**Estimated Time:** 3-4 hours  
**Status:** [ ] Not Started

#### Subtasks:
- [ ] **3.1.1** Create `Setting` database model
  - File: `backend/src/models/Setting.js`
  - Fields: key (PK), value (JSON), category
  
- [ ] **3.1.2** Create settings routes
  - File: `backend/src/routes/settings.js`
  - Endpoints: GET /, GET /:key, PUT /:key
  
- [ ] **3.1.3** Register routes in server.js
  
- [ ] **3.1.4** Run database migration
  - Create settings table
  - Seed default settings
  
- [ ] **3.1.5** Add `settingsApi` to frontend api.js
  
- [ ] **3.1.6** Add settings API helpers to AppContext.jsx
  
- [ ] **3.1.7** Update `Settings.jsx` to persist to backend
  
- [ ] **3.1.8** Test Settings persistence

---

## Phase 4: Verification & Testing

### Task 4.1: End-to-End Testing
**Priority:** 🔴 Critical  
**Estimated Time:** 3-4 hours  
**Status:** [ ] Not Started

#### Subtasks:
- [ ] **4.1.1** Test all modules with fresh database
- [ ] **4.1.2** Verify data persists across page refreshes
- [ ] **4.1.3** Verify data syncs across multiple browser sessions
- [ ] **4.1.4** Test concurrent operations from multiple users
- [ ] **4.1.5** Verify error handling and rollback scenarios
- [ ] **4.1.6** Test admin vs member authorization

---

### Task 4.2: Data Migration
**Priority:** 🟡 High  
**Estimated Time:** 2-3 hours  
**Status:** [ ] Not Started

#### Subtasks:
- [ ] **4.2.1** Create data export utility
- [ ] **4.2.2** Create data import/migration script
- [ ] **4.2.3** Test migration with sample data
- [ ] **4.2.4** Document migration process

---

## Completion Checklist

| Task | Status | Notes |
|------|--------|-------|
| 1.1 Phases API Integration | [ ] | |
| 1.2 Tasks API Integration | [ ] | |
| 2.1 Costs Backend API | [ ] | |
| 2.2 Complexity Backend API | [ ] | |
| 3.1 Settings Backend API | [ ] | |
| 4.1 End-to-End Testing | [ ] | |
| 4.2 Data Migration | [ ] | |

---

## Notes

- Tasks can be worked on in parallel by different developers
- Phase 1 tasks have minimal dependencies and should be prioritized
- Backend changes require database migrations
- Frontend changes should include loading states and error handling
