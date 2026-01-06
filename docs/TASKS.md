# Workload Resource Management - Task Breakdown

## Phase 1: MVP - Core Application

### 1. Project Setup & Foundation
- [ ] Initialize Vite + React project
- [ ] Configure Vite for GitHub Pages deployment (`base` path)
- [ ] Set up folder structure (components, pages, hooks, utils, data, context)
- [ ] Install dependencies (react-router-dom, recharts, date-fns, gh-pages)
- [ ] Create design system CSS (index.css with variables, colors, typography)
- [ ] Create component styles (components.css)
- [ ] Create page-specific styles (pages.css)

### 2. Layout & Navigation
- [ ] Create Layout component (sidebar + header + main content)
- [ ] Create Sidebar component with navigation links
- [ ] Create Header component
- [ ] Set up React Router with all routes
- [ ] Implement active link highlighting
- [ ] Add collapsible sections for Library sub-pages

### 3. State Management & Data Persistence
- [ ] Create AppContext with useReducer
- [ ] Implement useLocalStorage hook
- [ ] Create storage utility functions (save, load, export, import)
- [ ] Define initial state structure
- [ ] Implement data migration/versioning

### 4. UI Component Library
- [ ] Button component (variants: primary, secondary, ghost, danger)
- [ ] Input component (text, number, with validation)
- [ ] Select component (dropdown)
- [ ] DatePicker component
- [ ] Modal component (animated dialog)
- [ ] Card component (glass effect)
- [ ] Table component (sortable, with actions)
- [ ] Badge component (status indicators)

### 5. Pre-loaded Data
- [ ] Create indonesiaHolidays.js (2025-2026 holidays)
- [ ] Create defaultTeam.js (7 team members: Beatrix, Herindra, Care BA, Azdan, Laili, Cici, Yosy)
- [ ] Create defaultPhases.js (8 phases)
- [ ] Create defaultTasks.js (12 task templates with complexity percentages)
- [ ] Create defaultCosts.js (resource cost tiers)
- [ ] Create defaultComplexity.js (Low, Medium, High settings)

---

### 6. Library Module (Config - Sheet 4)

#### 6.1 Team Members Page
- [ ] Create TeamMembers.jsx page
- [ ] Display table with: ID, Name, Type (BA/PM), Max Hours/Week
- [ ] Add "Add Member" button with modal form
- [ ] Edit member functionality
- [ ] Delete member with confirmation
- [ ] Link to resource cost tier

#### 6.2 Phases Page
- [ ] Create Phases.jsx page
- [ ] Display list of 8 phases
- [ ] Edit phase name
- [ ] Reorder phases (drag or move buttons)
- [ ] Mark terminal phases (Idle, Completed)

#### 6.3 Task Templates Page
- [ ] Create TaskTemplates.jsx page
- [ ] Display table with task names and estimates
- [ ] Show Low/Medium/High estimates (days, hours, percentage)
- [ ] Edit task template modal
- [ ] Add new task template

#### 6.4 Complexity Settings Page
- [ ] Create Complexity.jsx page
- [ ] Display Low/Medium/High settings
- [ ] Edit: days, hours, cycleActivity values
- [ ] Show calculated values
- [ ] Color picker for complexity indicators

#### 6.5 Resource Costs Page
- [ ] Create ResourceCosts.jsx page
- [ ] Display table: Resource, Monthly Cost, Per Day, Per Hour
- [ ] Add new cost tier
- [ ] Edit cost tier
- [ ] Delete cost tier
- [ ] Format currency as IDR

---

### 7. Important Dates Module (Sheet 3)

#### 7.1 Holidays Section
- [ ] Create ImportantDates.jsx page
- [ ] Display holidays table: Date, Name, Type, Year
- [ ] Pre-load Indonesian holidays 2025
- [ ] Add holiday functionality
- [ ] Edit/delete holidays
- [ ] Year filter dropdown

#### 7.2 Leave Section
- [ ] Display leaves table: Member Name, Date
- [ ] Add leave with member selection
- [ ] Date range selection for multi-day leaves
- [ ] Edit/delete leaves
- [ ] Filter by team member

---

### 8. Resource Allocation Module (Sheet 2)

#### 8.1 Allocation Table
- [ ] Create ResourceAllocation.jsx page
- [ ] Display main table with all columns:
  - Activity Name
  - Resource (team member dropdown)
  - Category (complexity dropdown)
  - Phase (dropdown)
  - Task Name (dropdown)
  - Plan: TaskStart (date picker)
  - Plan: TaskEnd (auto-calculated)
  - Plan: Cost Project (auto-calculated)
  - Plan: Cost Monthly (auto-calculated)
  - Actual: TaskStart (date picker)
  - Actual: TaskEnd (date picker)
  - Workload (auto-calculated)
  - Remarks (text)

#### 8.2 Auto-Calculations
- [ ] Implement calculatePlanEndDate() - WORKDAY formula
- [ ] Implement calculateProjectCost() - cycleActivity × hourlyRate
- [ ] Implement calculateMonthlyCost() - projectCost / months
- [ ] Implement calculateWorkloadPercentage() - XLOOKUP formula
- [ ] Create useCalculations hook

#### 8.3 CRUD Operations
- [ ] Add new allocation modal
- [ ] Edit allocation (inline or modal)
- [ ] Delete allocation with confirmation
- [ ] Bulk delete selected rows

---

### 9. Workload Summary Dashboard (Sheet 1)

#### 9.1 Top 5 Tasks Section
- [ ] Create WorkloadSummary.jsx page
- [ ] Display cards for each team member
- [ ] Show top 5 tasks with finish dates per member
- [ ] Sort by Plan TaskEnd date
- [ ] Filter non-completed tasks

#### 9.2 Task Allocation Matrix
- [ ] Create matrix table: Tasks × Members
- [ ] Implement COUNTIFS logic for cell values
- [ ] Highlight high counts
- [ ] Row for each task type
- [ ] Column for each team member

#### 9.3 Charts (using Recharts)
- [ ] WorkloadChart - bar chart of workload per member
- [ ] CostChart - monthly cost trend line chart
- [ ] StatusPie - task status distribution

---

### 10. Data Import/Export
- [ ] Export all data to JSON
- [ ] Import data from JSON file
- [ ] Clear all data with confirmation
- [ ] Validate imported data structure

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
