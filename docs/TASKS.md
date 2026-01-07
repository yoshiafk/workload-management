# Workload Resource Management - Task Breakdown

## Phase 1: MVP - Core Application

### 1. Project Setup & Foundation
- [x] Initialize Vite + React project
- [x] Configure Vite for GitHub Pages deployment (`base` path)
- [x] Set up folder structure (components, pages, hooks, utils, data, context)
- [x] Install dependencies (react-router-dom, recharts, date-fns, gh-pages)
- [x] Create design system CSS (index.css with variables, colors, typography)
- [x] Create component styles (Layout.css, Sidebar.css, Header.css)
- [x] Create page-specific styles (WorkloadSummary.css, LibraryPage.css, PagePlaceholder.css)
- [x] Implement professional light theme with CSS variables
- [x] Replace all emojis with inline SVG icons

### 2. Layout & Navigation
- [x] Create Layout component (sidebar + header + main content)
- [x] Create Sidebar component with navigation links
- [x] Create Header component
- [x] Set up React Router with all routes
- [x] Implement active link highlighting
- [x] Add collapsible sections for Library sub-pages

### 3. State Management & Data Persistence
- [x] Create AppContext with useReducer
- [/] Implement useLocalStorage hook
- [x] Create storage utility functions (save, load, export, import)
- [x] Define initial state structure
- [ ] Implement data migration/versioning

### 4. UI Component Library
- [x] Button component (btn, btn-primary, btn-secondary, btn-icon)
- [x] Input component (text, number, with validation)
- [x] Select component (dropdown)
- [ ] DatePicker component
- [x] Modal component (animated dialog)
- [x] Card component (glass effect)
- [x] Table component (sortable, with actions)
- [x] Badge component (status indicators)
- [x] ConfirmDialog component

### 5. Pre-loaded Data
- [x] Create indonesiaHolidays.js (2025-2026 holidays)
- [x] Create defaultTeam.js (7 team members: Beatrix, Herindra, Care BA, Azdan, Laili, Cici, Yosy)
- [x] Create defaultPhases.js (8 phases)
- [x] Create defaultTasks.js (12 task templates with complexity percentages)
- [x] Create defaultCosts.js (resource cost tiers)
- [x] Create defaultComplexity.js (Low, Medium, High settings)

---

### 6. Library Module (Config - Sheet 4)

#### 6.1 Team Members Page
- [x] Create TeamMembers.jsx page
- [x] Display table with: ID, Name, Type (BA/PM), Max Hours/Week, Status
- [x] Add "Add Member" button with SVG plus icon
- [x] Edit/Delete action buttons with SVG icons
- [x] Add member modal form functionality
- [x] Edit member functionality
- [x] Delete member with confirmation
- [ ] Link to resource cost tier

#### 6.2 Phases Page
- [x] Create Phases.jsx page
- [x] Display list of phases with card layout
- [x] Show terminal phase indicator badge
- [x] Edit phase name
- [ ] Reorder phases (drag or move buttons)
- [x] Add phase functionality
- [x] Delete phase functionality

#### 6.3 Task Templates Page
- [x] Create TaskTemplates.jsx page
- [x] Display table with task names and estimates
- [x] Show Low/Medium/High estimates (days, hours, percentage)
- [ ] Edit task template modal
- [ ] Add new task template

#### 6.4 Complexity Settings Page
- [x] Create Complexity.jsx page
- [x] Display Low/Medium/High settings with card layout
- [x] Show days, hours, cycleActivity values
- [x] Edit complexity settings
- [ ] Color picker for complexity indicators

#### 6.5 Resource Costs Page
- [x] Create ResourceCosts.jsx page
- [x] Display table: Resource, Monthly Cost, Per Day, Per Hour
- [x] Format currency as IDR
- [x] Add/Edit/Delete action buttons with SVG icons
- [x] Add cost tier modal functionality
- [x] Edit cost tier functionality
- [x] Delete cost tier with confirmation

---

### 7. Important Dates Module (Sheet 3)

#### 7.1 Holidays Section
- [x] Create ImportantDates.jsx page
- [x] Display holidays table: Date, Name, Type, Year
- [x] Pre-load Indonesian holidays 2026
- [x] Add holiday functionality
- [x] Edit/delete holidays
- [x] Year filter dropdown

#### 7.2 Leave Section
- [x] Display leaves table: Member Name, Date
- [x] Add leave with member selection
- [x] Date range selection for multi-day leaves
- [x] Edit/delete leaves
- [x] Filter by team member

---

### 8. Resource Allocation Module (Sheet 2)

#### 8.1 Allocation Table
- [x] Create ResourceAllocation.jsx page
- [x] Display main table with all columns:
  - Activity Name
  - Resource (team member dropdown)
  - Category (complexity dropdown)
  - Phase (dropdown)
  - Task Name (dropdown)
  - Plan: TaskStart (date picker)
  - Plan: TaskEnd (auto-calculated)
  - Plan: Cost Project (auto-calculated)
  - Plan: Cost Monthly (auto-calculated)
  - Workload (auto-calculated)
  - Remarks (text)

#### 8.2 Auto-Calculations
- [x] Implement calculatePlanEndDate() - WORKDAY formula
- [x] Implement calculateProjectCost() - cycleActivity × hourlyRate
- [x] Implement calculateMonthlyCost() - projectCost / months
- [x] Implement calculateWorkloadPercentage() - XLOOKUP formula
- [x] Create useCalculations hook (integrated in component)

#### 8.3 CRUD Operations
- [x] Add new allocation modal
- [x] Edit allocation (modal)
- [x] Delete allocation with confirmation
- [ ] Bulk delete selected rows

---

### 9. Workload Summary Dashboard (Sheet 1)

#### 9.1 Top 5 Tasks Section
- [x] Create WorkloadSummary.jsx page
- [x] Display cards for each team member with avatar
- [x] Show top 5 tasks with finish dates per member
- [x] Sort by Plan TaskEnd date
- [x] Filter non-completed tasks
- [x] Stats cards with SVG icons (Team Members, Allocations, In Progress, Completed)

#### 9.2 Task Allocation Matrix
- [x] Create matrix table: Tasks × Members
- [x] Implement COUNTIFS logic for cell values
- [x] Count badge styling for values
- [x] Row for each task type
- [x] Column for each team member

#### 9.3 Charts (using Recharts)
- [ ] WorkloadChart - bar chart of workload per member
- [ ] CostChart - monthly cost trend line chart
- [ ] StatusPie - task status distribution

---

### 10. Data Import/Export
- [x] Export all data to JSON
- [x] Import data from JSON file
- [x] Clear all data with confirmation
- [x] Validate imported data structure

---

### 11. Final Polish & Deployment
- [ ] Responsive design testing
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Error handling and validation
- [ ] Build production bundle
- [ ] Deploy to GitHub Pages
- [ ] Verify deployed site functionality

---

## Phase 2: Enhanced Analytics (Future)

### 12. Additional KPIs
- [ ] Utilization Rate calculation and display
- [ ] Capacity Available tracking
- [ ] Overdue Tasks counter
- [ ] On-Time Delivery percentage

### 13. Variance Analysis
- [ ] Add variance fields to allocation schema
- [ ] Calculate Planned vs Actual variance
- [ ] Display variance in table and dashboard
- [ ] Variance trend chart

### 14. Workload Alerts
- [ ] Define alert thresholds (configurable)
- [ ] Alert banner component
- [ ] Dashboard notification system
- [ ] Workload status indicators per member

### 15. Workload Heatmap
- [ ] Heatmap component
- [ ] Weekly/monthly view
- [ ] Color gradient based on workload level
- [ ] Hover details

---

## Phase 3: Visual Planning (Future)

### 16. Gantt Chart
- [ ] Gantt chart component
- [ ] Timeline visualization
- [ ] Color-coding by member/phase/complexity
- [ ] Holiday/leave indicators
- [ ] Drag-and-drop rescheduling

### 17. Calendar View
- [ ] Calendar component
- [ ] Month/week/day views
- [ ] Resource availability display
- [ ] Click to add/edit allocations

### 18. Drag-and-Drop
- [ ] Draggable allocation rows
- [ ] Drop zones for team members
- [ ] Auto-recalculate on drop
- [ ] Undo functionality

---

## Phase 4: Advanced Features (Future)

### 19. Skill-Based Matching
- [ ] Add skills to team member schema
- [ ] Add required skills to task templates
- [ ] Skill match scoring function
- [ ] Suggest best-fit resources

### 20. Budget Tracking
- [ ] Budget entity and storage
- [ ] Budget vs Actual dashboard
- [ ] Budget alerts
- [ ] Cost forecasting

### 21. Excel Import/Export
- [ ] Parse xlsx files
- [ ] Export to xlsx format
- [ ] Column mapping UI

### 22. PDF Reports
- [ ] Report templates
- [ ] PDF generation library
- [ ] Download functionality

---

## Technical Debt & Maintenance

### 23. Testing
- [ ] Unit tests for calculation functions
- [ ] Component tests
- [ ] Integration tests

### 24. Documentation
- [ ] README.md
- [ ] Component documentation
- [ ] API/function documentation

### 25. CI/CD
- [ ] GitHub Actions workflow
- [ ] Automated deployment
- [ ] Build status badge
