# Implement Cost Center Management (COA) Menu

This plan outlines the steps to add a new menu for Cost Center Management and Chart of Accounts (COA) into the HR/Workload Management application. This involves updating the global state, creating new CRUD pages, and updating the sidebar navigation.

## Proposed Changes

### [Data Layer]

#### [NEW] [defaultCostCenters.js](file:///Users/yoshiafk/Development/Personal%20Project/hr-management/src/data/defaultCostCenters.js)
- Define initial set of cost centers (Engineering, Product, QA, Operations).

#### [NEW] [defaultCOA.js](file:///Users/yoshiafk/Development/Personal%20Project/hr-management/src/data/defaultCOA.js)
- Define initial set of accounts (Salaries, Benefits, Software, etc.).

#### [MODIFY] [index.js](file:///Users/yoshiafk/Development/Personal%20Project/hr-management/src/data/index.js)
- Export the new default data.

---

### [State Management]

#### [MODIFY] [AppContext.jsx](file:///Users/yoshiafk/Development/Personal%20Project/hr-management/src/context/AppContext.jsx)
- Add `costCenters` and `coa` to the initial state.
- Add `ACTIONS`: `ADD_COST_CENTER`, `UPDATE_COST_CENTER`, `DELETE_COST_CENTER`, `ADD_COA`, `UPDATE_COA`, `DELETE_COA`.
- Update `appReducer` to handle these actions.
- Update `loadData` and `saveToStorage` to persist these new state slices.

---

### [UI Components & Pages]

#### [NEW] [CostCenters.jsx](file:///Users/yoshiafk/Development/Personal%20Project/hr-management/src/pages/Library/CostCenters.jsx)
- Create a new page for managing Cost Centers.
- Use `tanstack/react-table` for the list.
- Use `Dialog` for add/edit forms.

#### [NEW] [COA.jsx](file:///Users/yoshiafk/Development/Personal%20Project/hr-management/src/pages/Library/COA.jsx)
- Create a new page for managing Chart of Accounts.
- Follow the same design pattern as other library pages.

#### [MODIFY] [Sidebar.jsx](file:///Users/yoshiafk/Development/Personal%20Project/hr-management/src/components/layout/Sidebar.jsx)
- Add "Cost Centers" and "Chart of Accounts" to the `navItems`.
- Use appropriate icons (`Building2` and `AccountBook` or `FileText`).

#### [MODIFY] [App.jsx](file:///Users/yoshiafk/Development/Personal%20Project/hr-management/src/App.jsx)
- Register new routes for the pages.

---

### [Documentation]

#### [NEW] [research.md](file:///Users/yoshiafk/Development/Personal%20Project/hr-management/cost-center-menu/research.md) (Already Created)
- Summary of findings and concepts.

#### [NEW] [implementation_plan.md](file:///Users/yoshiafk/Development/Personal%20Project/hr-management/cost-center-menu/implementation_plan.md)
- Copy of this plan for easy access in the project folder.

## Verification Plan

### Manual Verification
1. **Navigation:** Verify that the new menu items appear in the sidebar and are correctly labeled.
2. **Cost Center CRUD:**
    - Navigate to Cost Centers page.
    - Add a new Cost Center.
    - Edit an existing Cost Center.
    - Delete a Cost Center.
    - Verify data persists after page reload.
3. **COA CRUD:**
    - Navigate to Chart of Accounts page.
    - Add a new account.
    - Edit an existing account.
    - Delete an account.
    - Verify data persists after page reload.
4. **Responsive Check:** Verify that the new pages look good on different screen sizes.
