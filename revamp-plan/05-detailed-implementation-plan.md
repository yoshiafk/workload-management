# Detailed Implementation Plan

> **Workload Resource Management - Total UI/UX Revamp**  
> **Version:** 1.0  
> **Created:** January 23, 2026  
> **Estimated Duration:** 8 weeks (40 working days)

---

## Table of Contents

1. [Phase 1: Foundation & Design System](#phase-1-foundation--design-system)
2. [Phase 2: Core Components](#phase-2-core-components)
3. [Phase 3: Dashboard Revamp](#phase-3-dashboard-revamp)
4. [Phase 4: Resource Allocation Revamp](#phase-4-resource-allocation-revamp)
5. [Phase 5: Timeline Revamp](#phase-5-timeline-revamp)
6. [Phase 6: Secondary Pages](#phase-6-secondary-pages)
7. [Phase 7: Polish & Accessibility](#phase-7-polish--accessibility)
8. [Phase 8: Testing & Launch](#phase-8-testing--launch)

---

## Phase 1: Foundation & Design System
**Duration:** Days 1-5 (Week 1)  
**Goal:** Establish enhanced design tokens and utility system

### 1.1 Design Token Updates
**Priority:** Critical | **Effort:** 1 day

#### Tasks:
- [ ] **1.1.1** Create new spacing scale for dense mode in `src/index.css`
  ```css
  /* Add dense mode spacing tokens */
  --spacing-dense-1: 0.125rem;  /* 2px */
  --spacing-dense-2: 0.25rem;   /* 4px */
  --spacing-dense-3: 0.5rem;    /* 8px */
  --spacing-dense-4: 0.75rem;   /* 12px */
  ```
- [ ] **1.1.2** Add capacity status color tokens
  ```css
  --color-capacity-available: hsl(160 84% 39%);
  --color-capacity-light: hsl(180 70% 45%);
  --color-capacity-moderate: hsl(38 92% 50%);
  --color-capacity-heavy: hsl(25 95% 53%);
  --color-capacity-over: hsl(0 72% 51%);
  ```
- [ ] **1.1.3** Add animation duration tokens
  ```css
  --duration-instant: 50ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  ```
- [ ] **1.1.4** Add interactive state color tokens
  ```css
  --color-row-hover: hsl(var(--primary) / 0.05);
  --color-row-selected: hsl(var(--primary) / 0.1);
  --color-cell-focus: hsl(var(--primary) / 0.15);
  ```

#### Files to Modify:
- `src/index.css` - Add new design tokens
- `tailwind.config.js` - Extend Tailwind with new tokens

---

### 1.2 Density Mode Context
**Priority:** Critical | **Effort:** 1 day

#### Tasks:
- [ ] **1.2.1** Create `DensityContext` for app-wide density preference
  - Create `src/context/DensityContext.jsx`
  - Provide `dense` and `comfortable` modes
  - Persist preference to localStorage
  - Export `useDensity` hook

- [ ] **1.2.2** Create density utility classes
  ```css
  .density-dense { /* Compact spacing */ }
  .density-comfortable { /* Normal spacing */ }
  ```

- [ ] **1.2.3** Create `useDensity` hook
  ```javascript
  // src/hooks/useDensity.js
  export function useDensity() {
    const { density, setDensity } = useContext(DensityContext);
    return { density, setDensity, isDense: density === 'dense' };
  }
  ```

#### Files to Create:
- `src/context/DensityContext.jsx`
- `src/hooks/useDensity.js`

#### Files to Modify:
- `src/App.jsx` - Wrap with DensityProvider
- `src/index.css` - Add density utility classes

---

### 1.3 Keyboard Navigation System
**Priority:** High | **Effort:** 1 day

#### Tasks:
- [ ] **1.3.1** Create `useKeyboardShortcuts` hook
  ```javascript
  // src/hooks/useKeyboardShortcuts.js
  export function useKeyboardShortcuts(shortcuts) {
    // Register global keyboard shortcuts
    // Handle modifier keys (⌘, Ctrl, Shift)
    // Prevent conflicts with input fields
  }
  ```

- [ ] **1.3.2** Create keyboard shortcut registry
  ```javascript
  // src/utils/shortcuts.js
  export const APP_SHORTCUTS = {
    COMMAND_PALETTE: { key: 'k', meta: true },
    TOGGLE_SIDEBAR: { key: 'b', meta: true },
    NEW_ALLOCATION: { key: 'n' },
    SEARCH: { key: '/' },
    HELP: { key: '?' },
  };
  ```

- [ ] **1.3.3** Create `KeyboardShortcutsHelp` modal component
  - Display all available shortcuts
  - Grouped by category
  - Opens with `?` key

#### Files to Create:
- `src/hooks/useKeyboardShortcuts.js`
- `src/utils/shortcuts.js`
- `src/components/ui/keyboard-shortcuts-help.jsx`

---

### 1.4 Skeleton Loading Components
**Priority:** High | **Effort:** 1 day

#### Tasks:
- [ ] **1.4.1** Enhance existing Skeleton component
  - Add variant shapes (text, circle, rect, card)
  - Add pulse animation
  - Support custom dimensions

- [ ] **1.4.2** Create page-specific skeleton layouts
  ```javascript
  // src/components/ui/skeletons/
  DashboardSkeleton.jsx
  TableSkeleton.jsx
  TimelineSkeleton.jsx
  CardSkeleton.jsx
  ```

- [ ] **1.4.3** Create `Suspense` wrapper with skeleton fallback
  ```javascript
  // src/components/ui/page-skeleton.jsx
  export function PageSkeleton({ type }) {
    const skeletons = {
      dashboard: <DashboardSkeleton />,
      table: <TableSkeleton />,
      timeline: <TimelineSkeleton />,
    };
    return skeletons[type] || <DefaultSkeleton />;
  }
  ```

#### Files to Create:
- `src/components/ui/skeletons/DashboardSkeleton.jsx`
- `src/components/ui/skeletons/TableSkeleton.jsx`
- `src/components/ui/skeletons/TimelineSkeleton.jsx`
- `src/components/ui/skeletons/CardSkeleton.jsx`
- `src/components/ui/skeletons/index.js`

#### Files to Modify:
- `src/components/ui/skeleton.jsx` - Enhance with variants
- `src/components/ui/page-loader.jsx` - Use skeleton instead of spinner

---

### 1.5 Toast Notification System
**Priority:** High | **Effort:** 1 day

#### Tasks:
- [ ] **1.5.1** Install Sonner toast library
  ```bash
  npm install sonner
  ```

- [ ] **1.5.2** Create Toast wrapper component
  ```javascript
  // src/components/ui/toast.jsx
  import { Toaster, toast } from 'sonner';
  
  export function ToastProvider({ children }) {
    return (
      <>
        {children}
        <Toaster position="bottom-right" richColors />
      </>
    );
  }
  ```

- [ ] **1.5.3** Create toast helper functions
  ```javascript
  // src/utils/toast.js
  export const showToast = {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    info: (message) => toast.info(message),
    action: (message, action) => toast(message, { action }),
  };
  ```

- [ ] **1.5.4** Integrate toasts for CRUD operations
  - Add allocation success/error
  - Delete confirmation with undo
  - Import/Export feedback

#### Files to Create:
- `src/components/ui/toast.jsx`
- `src/utils/toast.js`

#### Files to Modify:
- `src/App.jsx` - Add ToastProvider
- `src/context/AppContext.jsx` - Add toast calls to actions

---

## Phase 2: Core Components
**Duration:** Days 6-12 (Week 2)  
**Goal:** Build enhanced UI components

### 2.1 Command Palette
**Priority:** Critical | **Effort:** 3 days

#### Tasks:
- [ ] **2.1.1** Install cmdk library
  ```bash
  npm install cmdk
  ```

- [ ] **2.1.2** Create CommandPalette component structure
  ```
  src/components/ui/command-palette/
  ├── CommandPalette.jsx      # Main wrapper
  ├── CommandItem.jsx         # Individual command item
  ├── CommandGroup.jsx        # Category group
  ├── CommandSearch.jsx       # Search input
  ├── CommandEmpty.jsx        # Empty state
  ├── CommandPalette.css      # Styles
  └── index.js                # Exports
  ```

- [ ] **2.1.3** Implement CommandPalette main component
  ```javascript
  export function CommandPalette({ open, onOpenChange }) {
    // Modal wrapper with backdrop
    // Search input with fuzzy matching
    // Grouped results (Navigation, Actions, Recent)
    // Keyboard navigation (↑↓ Enter Esc)
    // Shortcut hints display
  }
  ```

- [ ] **2.1.4** Create command registry
  ```javascript
  // src/data/commands.js
  export const commands = [
    // Navigation
    { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/'), category: 'navigation' },
    { id: 'nav-allocation', label: 'Go to Allocation', icon: ClipboardList, action: () => navigate('/allocation'), category: 'navigation' },
    // ... more navigation commands
    
    // Actions
    { id: 'action-add', label: 'Add New Allocation', icon: Plus, shortcut: 'N', action: openAddModal, category: 'action' },
    { id: 'action-export', label: 'Export Data', icon: Download, action: exportData, category: 'action' },
    
    // Search
    { id: 'search-member', label: 'Search Team Members', icon: Users, action: focusMemberSearch, category: 'search' },
  ];
  ```

- [ ] **2.1.5** Implement recent items tracking
  ```javascript
  // Track last 5 accessed items
  // Store in localStorage
  // Display in "Recent" section
  ```

- [ ] **2.1.6** Add global ⌘K handler
  ```javascript
  // In App.jsx or Layout.jsx
  useKeyboardShortcuts([
    { ...APP_SHORTCUTS.COMMAND_PALETTE, handler: () => setCommandPaletteOpen(true) }
  ]);
  ```

- [ ] **2.1.7** Style command palette
  - Modal overlay with blur
  - Search input with magnifying glass icon
  - Grouped sections with labels
  - Highlighted matching text
  - Shortcut badges
  - Hover and selected states

#### Files to Create:
- `src/components/ui/command-palette/CommandPalette.jsx`
- `src/components/ui/command-palette/CommandItem.jsx`
- `src/components/ui/command-palette/CommandGroup.jsx`
- `src/components/ui/command-palette/CommandPalette.css`
- `src/components/ui/command-palette/index.js`
- `src/data/commands.js`

#### Files to Modify:
- `src/components/layout/Layout.jsx` - Add CommandPalette and keyboard handler

---

### 2.2 Enhanced Data Table
**Priority:** Critical | **Effort:** 3 days

#### Tasks:
- [ ] **2.2.1** Install TanStack Table (already present, verify version)
  ```bash
  npm install @tanstack/react-table
  ```

- [ ] **2.2.2** Create enhanced DataTable component structure
  ```
  src/components/ui/data-table/
  ├── DataTable.jsx           # Main component
  ├── DataTableHeader.jsx     # Column headers with sort
  ├── DataTableRow.jsx        # Row component
  ├── DataTableCell.jsx       # Cell with edit mode
  ├── DataTablePagination.jsx # Pagination controls
  ├── DataTableToolbar.jsx    # Filters and actions
  ├── DataTableBulkActions.jsx# Selected rows actions
  ├── DataTable.css           # Styles
  └── index.js                # Exports
  ```

- [ ] **2.2.3** Implement column features
  ```javascript
  const columnFeatures = {
    sortable: true,       // Click header to sort
    resizable: true,      // Drag to resize
    reorderable: true,    // Drag to reorder
    hideable: true,       // Toggle visibility
    filterable: true,     // Column filter
  };
  ```

- [ ] **2.2.4** Implement inline cell editing
  ```javascript
  function EditableCell({ value, row, column, updateData }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    
    // Double-click to edit
    // Tab to next cell
    // Enter to save
    // Esc to cancel
  }
  ```

- [ ] **2.2.5** Implement row selection
  ```javascript
  // Checkbox column
  // Select all header
  // Shift+click range select
  // Bulk actions toolbar when selected
  ```

- [ ] **2.2.6** Implement virtual scrolling for 100+ rows
  ```javascript
  import { useVirtualizer } from '@tanstack/react-virtual';
  
  // Virtualize rows for performance
  // Maintain scroll position
  // Handle variable row heights
  ```

- [ ] **2.2.7** Implement export functionality
  ```javascript
  export function exportToCSV(data, filename) {
    // Convert data to CSV format
    // Trigger download
  }
  
  export function exportToExcel(data, filename) {
    // Using xlsx library
    // Create workbook and download
  }
  ```

- [ ] **2.2.8** Add density support to table
  ```javascript
  // Compact: py-1 text-sm
  // Comfortable: py-3 text-base
  ```

#### Files to Create/Modify:
- `src/components/ui/data-table/DataTable.jsx` (enhanced)
- `src/components/ui/data-table/DataTableHeader.jsx`
- `src/components/ui/data-table/DataTableRow.jsx`
- `src/components/ui/data-table/DataTableCell.jsx`
- `src/components/ui/data-table/DataTablePagination.jsx`
- `src/components/ui/data-table/DataTableToolbar.jsx`
- `src/components/ui/data-table/DataTableBulkActions.jsx`
- `src/components/ui/data-table/DataTable.css`
- `src/utils/export.js`

---

### 2.3 Interactive Timeline Component
**Priority:** Critical | **Effort:** 3 days

#### Tasks:
- [ ] **2.3.1** Create Timeline component structure
  ```
  src/components/ui/timeline/
  ├── Timeline.jsx           # Main component
  ├── TimelineHeader.jsx     # Date headers
  ├── TimelineRow.jsx        # Resource row
  ├── TimelineBar.jsx        # Allocation bar
  ├── TimelineMilestone.jsx  # Milestone marker
  ├── TimelineControls.jsx   # Zoom and nav
  ├── Timeline.css           # Styles
  └── index.js               # Exports
  ```

- [ ] **2.3.2** Implement date range calculation
  ```javascript
  function calculateDateRange(allocations, zoom) {
    // Find earliest start and latest end
    // Pad with buffer days
    // Calculate column widths based on zoom
  }
  ```

- [ ] **2.3.3** Implement zoom levels
  ```javascript
  const ZOOM_LEVELS = {
    day: { columnWidth: 40, headerFormat: 'MMM d' },
    week: { columnWidth: 100, headerFormat: 'Week W' },
    month: { columnWidth: 150, headerFormat: 'MMMM yyyy' },
  };
  ```

- [ ] **2.3.4** Implement drag-to-schedule
  ```javascript
  import { useDraggable, useDroppable } from '@dnd-kit/core';
  
  // Drag existing allocations to reschedule
  // Drag edge to resize duration
  // Drop on empty cell to create new
  ```

- [ ] **2.3.5** Implement capacity overlay
  ```javascript
  function CapacityOverlay({ resource, dateRange }) {
    // Show capacity percentage per day
    // Color-coded based on load
    // Tooltip with details
  }
  ```

- [ ] **2.3.6** Implement resource grouping
  ```javascript
  // Group by: resource, project, phase
  // Collapsible groups
  // Summary row per group
  ```

- [ ] **2.3.7** Add today indicator and scroll-to-today
  ```javascript
  // Vertical line for today
  // Button to scroll to today
  // Highlight today column
  ```

#### Files to Create:
- `src/components/ui/timeline/Timeline.jsx`
- `src/components/ui/timeline/TimelineHeader.jsx`
- `src/components/ui/timeline/TimelineRow.jsx`
- `src/components/ui/timeline/TimelineBar.jsx`
- `src/components/ui/timeline/TimelineMilestone.jsx`
- `src/components/ui/timeline/TimelineControls.jsx`
- `src/components/ui/timeline/Timeline.css`
- `src/components/ui/timeline/index.js`

---

## Phase 3: Dashboard Revamp
**Duration:** Days 13-17 (Week 3)  
**Goal:** Redesign dashboard with higher information density

### 3.1 KPI Cards Enhancement
**Priority:** High | **Effort:** 1 day

#### Tasks:
- [ ] **3.1.1** Add trend indicators to stat cards
  ```javascript
  function StatCardWithTrend({ value, previousValue, label, icon }) {
    const trend = ((value - previousValue) / previousValue) * 100;
    const isPositive = trend > 0;
    // Show ↑12% or ↓5% with color
  }
  ```

- [ ] **3.1.2** Add sparkline charts to cards
  ```javascript
  // Mini chart showing 7-day trend
  // Using Recharts Sparkline
  ```

- [ ] **3.1.3** Make cards interactive (click to drill down)
  ```javascript
  // Click "Active Tasks" → filter allocation view
  // Click "At Risk" → show at-risk allocations
  ```

#### Files to Modify:
- `src/components/ui/stat-card.jsx` - Add trend and sparkline support
- `src/pages/WorkloadSummary.jsx` - Update card usage

---

### 3.2 Chart Improvements
**Priority:** High | **Effort:** 2 days

#### Tasks:
- [ ] **3.2.1** Add chart interactivity
  ```javascript
  // onClick handler for chart elements
  // Navigate to filtered view on click
  // Highlight on hover
  ```

- [ ] **3.2.2** Add comparison to previous period
  ```javascript
  // Toggle: This Month vs Last Month
  // Show delta indicators
  // Dual-line for trend comparison
  ```

- [ ] **3.2.3** Add chart export functionality
  ```javascript
  // Export chart as PNG
  // Include in data export
  ```

- [ ] **3.2.4** Improve chart empty states
  ```javascript
  // Actionable CTAs
  // Helpful guidance text
  // Illustration/icon
  ```

- [ ] **3.2.5** Add chart loading skeletons
  ```javascript
  // Animated placeholder while data loads
  // Smooth transition to real data
  ```

#### Files to Modify:
- `src/pages/WorkloadSummary.jsx` - Chart enhancements
- `src/pages/WorkloadSummary.css` - Chart styles

---

### 3.3 Team Overview Compact View
**Priority:** Medium | **Effort:** 1 day

#### Tasks:
- [ ] **3.3.1** Create compact team member card
  ```javascript
  // Avatar + Name on one line
  // Capacity bar inline
  // Mini 7-day heatmap
  // Quick status badge
  ```

- [ ] **3.3.2** Add grid/list view toggle
  ```javascript
  // Grid: 4 columns of compact cards
  // List: Full-width rows with more details
  ```

- [ ] **3.3.3** Add quick actions on hover
  ```javascript
  // "Add Task" button
  // "View Detail" link
  // "Send Message" (future)
  ```

#### Files to Modify:
- `src/pages/WorkloadSummary.jsx` - Team section
- `src/pages/WorkloadSummary.css` - Compact card styles

---

### 3.4 Dashboard Layout Flexibility
**Priority:** Low | **Effort:** 1 day

#### Tasks:
- [ ] **3.4.1** Create section collapse/expand
  ```javascript
  // Collapsible sections
  // Remember state in localStorage
  ```

- [ ] **3.4.2** Add quick date range presets
  ```javascript
  // Today, This Week, This Month, This Quarter
  // Custom range picker
  ```

#### Files to Modify:
- `src/pages/WorkloadSummary.jsx`
- `src/pages/WorkloadSummary.css`

---

## Phase 4: Resource Allocation Revamp
**Duration:** Days 18-22 (Week 4)  
**Goal:** Transform allocation management with enhanced table

### 4.1 Replace Existing Table
**Priority:** Critical | **Effort:** 2 days

#### Tasks:
- [ ] **4.1.1** Migrate to enhanced DataTable component
  ```javascript
  // Replace current table with new DataTable
  // Configure columns with new features
  // Enable sorting, filtering, selection
  ```

- [ ] **4.1.2** Implement inline editing for all fields
  ```javascript
  // Resource: dropdown
  // Task: dropdown (filtered by phase)
  // Phase: dropdown
  // Complexity: dropdown
  // Dates: date picker
  // Status: dropdown
  ```

- [ ] **4.1.3** Add bulk operations
  ```javascript
  // Select multiple → Delete all
  // Select multiple → Change status
  // Select multiple → Reassign resource
  ```

- [ ] **4.1.4** Add row expansion for details
  ```javascript
  // Click row to expand
  // Show full allocation details
  // Edit form inline
  ```

#### Files to Modify:
- `src/pages/ResourceAllocation.jsx` - Major refactor
- `src/pages/ResourceAllocation.css` - Updated styles

---

### 4.2 Enhanced Filtering
**Priority:** High | **Effort:** 1 day

#### Tasks:
- [ ] **4.2.1** Create multi-select filters
  ```javascript
  // Multiple resources
  // Multiple phases
  // Multiple complexities
  // Date range
  ```

- [ ] **4.2.2** Add filter presets
  ```javascript
  // Save current filter as preset
  // Quick apply presets
  // Share presets (store in data)
  ```

- [ ] **4.2.3** Add global search
  ```javascript
  // Search across all fields
  // Highlight matches
  // Show match count
  ```

#### Files to Modify:
- `src/pages/ResourceAllocation.jsx`

---

### 4.3 Quick Add Improvements
**Priority:** Medium | **Effort:** 1 day

#### Tasks:
- [ ] **4.3.1** Create quick-add inline form
  ```javascript
  // Add row at bottom of table
  // Tab through fields
  // Enter to save, Esc to cancel
  ```

- [ ] **4.3.2** Improve add modal with smart defaults
  ```javascript
  // Pre-fill based on last allocation
  // Suggest next available date
  // Show resource availability
  ```

- [ ] **4.3.3** Add duplicate functionality
  ```javascript
  // Right-click → Duplicate
  // Or button in row actions
  // Opens modal with pre-filled data
  ```

#### Files to Modify:
- `src/pages/ResourceAllocation.jsx`

---

## Phase 5: Timeline Revamp
**Duration:** Days 23-27 (Week 5)  
**Goal:** Transform timeline from static heatmap to interactive Gantt

### 5.1 Replace Existing Timeline
**Priority:** Critical | **Effort:** 3 days

#### Tasks:
- [ ] **5.1.1** Replace heatmap with new Timeline component
  ```javascript
  // Use new Timeline component
  // Configure with allocation data
  // Set up event handlers
  ```

- [ ] **5.1.2** Implement drag-to-reschedule
  ```javascript
  // Drag allocation bar
  // Show preview during drag
  // Update dates on drop
  // Toast confirmation
  ```

- [ ] **5.1.3** Implement resize-to-change-duration
  ```javascript
  // Drag edges of bar
  // Update end date
  // Recalculate workload
  ```

- [ ] **5.1.4** Implement click-to-add
  ```javascript
  // Click empty cell
  // Opens add modal with date pre-filled
  // Resource pre-selected from row
  ```

#### Files to Modify:
- `src/pages/TimelineView.jsx` - Major refactor
- `src/pages/TimelineView.css` - Updated styles

---

### 5.2 Timeline Features
**Priority:** High | **Effort:** 2 days

#### Tasks:
- [ ] **5.2.1** Add zoom controls
  ```javascript
  // Day / Week / Month buttons
  // Zoom in/out buttons
  // Scroll wheel zoom
  ```

- [ ] **5.2.2** Add navigation controls
  ```javascript
  // Previous/Next period buttons
  // Today button
  // Date range picker
  ```

- [ ] **5.2.3** Add resource grouping
  ```javascript
  // Group by: None / Project / Phase / Team
  // Collapsible groups
  // Summary stats per group
  ```

- [ ] **5.2.4** Add capacity overlay
  ```javascript
  // Show capacity % per day
  // Color gradient based on load
  // Toggle overlay on/off
  ```

- [ ] **5.2.5** Add leave/holiday overlay
  ```javascript
  // Gray out leave days
  // Mark holidays
  // Show in tooltip
  ```

#### Files to Modify:
- `src/pages/TimelineView.jsx`
- `src/pages/TimelineView.css`

---

## Phase 6: Secondary Pages
**Duration:** Days 28-32 (Week 6)  
**Goal:** Polish remaining pages

### 6.1 Important Dates Page
**Priority:** Medium | **Effort:** 1 day

#### Tasks:
- [ ] **6.1.1** Improve calendar visualization
- [ ] **6.1.2** Add inline date editing
- [ ] **6.1.3** Add bulk date import

#### Files to Modify:
- `src/pages/ImportantDates.jsx`
- `src/pages/ImportantDates.css`

---

### 6.2 Settings Page
**Priority:** Medium | **Effort:** 1 day

#### Tasks:
- [ ] **6.2.1** Reorganize with tabs
  ```javascript
  // General | Appearance | Data | About
  ```
- [ ] **6.2.2** Add density toggle setting
- [ ] **6.2.3** Add keyboard shortcuts customization
- [ ] **6.2.4** Improve danger zone styling

#### Files to Modify:
- `src/pages/Settings.jsx`
- `src/pages/Settings.css`

---

### 6.3 Library Pages
**Priority:** Medium | **Effort:** 2 days

#### Tasks:
- [ ] **6.3.1** Apply enhanced DataTable to all library pages
- [ ] **6.3.2** Add inline editing
- [ ] **6.3.3** Improve add/edit modals
- [ ] **6.3.4** Add import/export functionality

#### Files to Modify:
- `src/pages/Library/TeamMembers.jsx`
- `src/pages/Library/Phases.jsx`
- `src/pages/Library/TaskTemplates.jsx`
- `src/pages/Library/Complexity.jsx`
- `src/pages/Library/ResourceCosts.jsx`

---

### 6.4 Project Cost Calculator
**Priority:** Low | **Effort:** 1 day

#### Tasks:
- [ ] **6.4.1** Improve form layout
- [ ] **6.4.2** Add visual cost breakdown chart
- [ ] **6.4.3** Add export to PDF functionality

#### Files to Modify:
- `src/pages/ProjectCostCalculator.jsx`

---

## Phase 7: Polish & Accessibility
**Duration:** Days 33-37 (Week 7)  
**Goal:** Ensure quality and accessibility

### 7.1 Accessibility Audit
**Priority:** Critical | **Effort:** 2 days

#### Tasks:
- [ ] **7.1.1** Run axe accessibility audit
- [ ] **7.1.2** Fix color contrast issues (WCAG AA)
- [ ] **7.1.3** Add aria labels to all interactive elements
- [ ] **7.1.4** Ensure keyboard navigation works throughout
- [ ] **7.1.5** Add focus indicators (visible focus rings)
- [ ] **7.1.6** Test with screen reader (VoiceOver/NVDA)
- [ ] **7.1.7** Add reduced motion support
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; }
  }
  ```

#### Files to Modify:
- Multiple component files
- `src/index.css` - Focus styles

---

### 7.2 Performance Optimization
**Priority:** High | **Effort:** 2 days

#### Tasks:
- [ ] **7.2.1** Audit bundle size with `npm run build -- --analyze`
- [ ] **7.2.2** Implement code splitting for heavy components
- [ ] **7.2.3** Memoize expensive calculations with `useMemo`
- [ ] **7.2.4** Optimize re-renders with `React.memo`
- [ ] **7.2.5** Lazy load charts and timeline
- [ ] **7.2.6** Implement request caching

---

### 7.3 Dark Mode Refinement
**Priority:** Medium | **Effort:** 1 day

#### Tasks:
- [ ] **7.3.1** Review all components in dark mode
- [ ] **7.3.2** Fix any contrast issues
- [ ] **7.3.3** Ensure consistent shadows
- [ ] **7.3.4** Test charts in dark mode

---

## Phase 8: Testing & Launch
**Duration:** Days 38-40 (Week 8)  
**Goal:** Validate quality and prepare for release

### 8.1 Testing
**Priority:** Critical | **Effort:** 2 days

#### Tasks:
- [ ] **8.1.1** Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] **8.1.2** Responsive testing (mobile, tablet, desktop)
- [ ] **8.1.3** End-to-end user flow testing
- [ ] **8.1.4** Data migration testing
- [ ] **8.1.5** Performance benchmarking

---

### 8.2 Documentation
**Priority:** High | **Effort:** 1 day

#### Tasks:
- [ ] **8.2.1** Update README with new features
- [ ] **8.2.2** Document keyboard shortcuts
- [ ] **8.2.3** Create user guide for new features
- [ ] **8.2.4** Document component API

---

## Summary Checklist

### Critical Path Items
- [ ] Design tokens update
- [ ] Command Palette implementation
- [ ] Enhanced Data Table
- [ ] Interactive Timeline
- [ ] Dashboard redesign
- [ ] Accessibility audit

### Dependencies
```
Phase 1 → Phase 2 (Core components need design tokens)
Phase 2 → Phase 3, 4, 5 (Pages need core components)
Phase 3, 4, 5 → Phase 7 (Polish after main work)
Phase 7 → Phase 8 (Testing after polish)
```

### Risk Mitigation
- Use feature flags to enable/disable new features
- Keep old components as fallback
- Incremental rollout per page
- Regular testing throughout

---

## Appendix: Quick Reference

### New npm Dependencies
```bash
npm install cmdk sonner @dnd-kit/core @dnd-kit/sortable xlsx
```

### New Files Count
- ~15 new component files
- ~5 new hook files
- ~3 new utility files
- ~5 new CSS files

### Modified Files Count
- ~20 existing component files
- ~10 page files
- ~3 context files
- ~2 config files

---

*This implementation plan provides a comprehensive roadmap for the UI/UX revamp. Adjust timelines based on team capacity and priorities.*
