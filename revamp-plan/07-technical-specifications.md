# Technical Specifications

> **Component and API Specifications for UI/UX Revamp**  
> **Version:** 1.0

---

## Table of Contents

1. [New Component Specifications](#new-component-specifications)
2. [Enhanced Component Specifications](#enhanced-component-specifications)
3. [Hook Specifications](#hook-specifications)
4. [Context Specifications](#context-specifications)
5. [Utility Function Specifications](#utility-function-specifications)
6. [CSS Token Specifications](#css-token-specifications)

---

## 1. New Component Specifications

### 1.1 CommandPalette

**File:** `src/components/ui/command-palette/CommandPalette.jsx`

```typescript
interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  keywords?: string[];  // For fuzzy search
  action: () => void;
  category: 'navigation' | 'action' | 'search' | 'recent';
  disabled?: boolean;
}

interface CommandGroup {
  id: string;
  label: string;
  commands: Command[];
}
```

**Usage:**
```jsx
<CommandPalette 
  open={open} 
  onOpenChange={setOpen} 
/>
```

**Features:**
- Fuzzy search with character highlighting
- Keyboard navigation (↑↓ Enter Esc)
- Recent items (last 5, stored in localStorage)
- Grouped by category
- Shortcut hints aligned right
- Backdrop blur effect

**Internal State:**
- `searchQuery: string`
- `selectedIndex: number`
- `recentCommands: Command[]` (from localStorage)

---

### 1.2 Timeline

**File:** `src/components/ui/timeline/Timeline.jsx`

```typescript
interface TimelineProps {
  // Data
  resources: Resource[];
  allocations: Allocation[];
  holidays?: Holiday[];
  leaves?: Leave[];
  
  // View configuration
  startDate?: Date;       // Default: earliest allocation - 7 days
  endDate?: Date;         // Default: latest allocation + 7 days
  zoom: 'day' | 'week' | 'month';
  groupBy?: 'none' | 'project' | 'phase' | 'team';
  
  // Display options
  showCapacityOverlay?: boolean;
  showTodayIndicator?: boolean;
  showMilestones?: boolean;
  
  // Interactions
  onAllocationClick?: (allocation: Allocation) => void;
  onAllocationCreate?: (data: { resourceId: string; date: Date }) => void;
  onAllocationMove?: (id: string, newStart: Date, newEnd: Date) => void;
  onAllocationResize?: (id: string, newEnd: Date) => void;
  
  // Density
  density?: 'dense' | 'comfortable';
}

interface Resource {
  id: string;
  name: string;
  type: string;
  maxCapacity: number;
}

interface Allocation {
  id: string;
  resourceId: string;
  projectName: string;
  taskName: string;
  phase: string;
  startDate: Date;
  endDate: Date;
  color?: string;
}
```

**Usage:**
```jsx
<Timeline
  resources={members}
  allocations={allocations}
  zoom="week"
  showCapacityOverlay
  onAllocationClick={handleClick}
  onAllocationMove={handleMove}
/>
```

**Sub-components:**
- `TimelineHeader` - Date column headers
- `TimelineRow` - Resource row with bars
- `TimelineBar` - Draggable allocation bar
- `TimelineControls` - Zoom and navigation
- `TimelineMilestone` - Diamond marker for milestones

---

### 1.3 Skeleton Variants

**File:** `src/components/ui/skeleton.jsx` (enhanced)

```typescript
interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;      // For text variant
  className?: string;
  animate?: boolean;   // Default: true
}
```

**Usage:**
```jsx
// Text skeleton (default)
<Skeleton variant="text" lines={3} />

// Circle avatar
<Skeleton variant="circle" width={40} height={40} />

// Card skeleton
<Skeleton variant="card" height={200} />

// Custom rectangle
<Skeleton variant="rect" width="100%" height={20} />
```

---

## 2. Enhanced Component Specifications

### 2.1 DataTable

**File:** `src/components/ui/data-table/DataTable.jsx` (enhanced)

```typescript
interface DataTableProps<TData> {
  // Data
  data: TData[];
  columns: ColumnDef<TData>[];
  
  // Features (all optional, default false)
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableSelection?: boolean;
  enableInlineEdit?: boolean;
  enableVirtualization?: boolean;
  enableColumnResize?: boolean;
  enableColumnReorder?: boolean;
  enableExport?: boolean;
  
  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];
  
  // Callbacks
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (selected: TData[]) => void;
  onDataChange?: (row: TData, field: string, value: any) => void;
  
  // Bulk actions
  bulkActions?: BulkAction[];
  
  // Customization
  emptyState?: React.ReactNode;
  toolbar?: React.ReactNode;
  density?: 'compact' | 'normal' | 'relaxed';
  
  // Loading
  isLoading?: boolean;
}

interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
  onClick: (selectedRows: TData[]) => void;
}

interface ColumnDef<TData> {
  id: string;
  accessorKey?: keyof TData;
  header: string | React.ReactNode;
  cell?: (info: CellContext<TData>) => React.ReactNode;
  
  // Features per column
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableEditing?: boolean;
  enableResizing?: boolean;
  enableHiding?: boolean;
  
  // Editing
  editType?: 'text' | 'number' | 'select' | 'date';
  editOptions?: SelectOption[];  // For select type
  
  // Sizing
  size?: number;
  minSize?: number;
  maxSize?: number;
}
```

**Usage:**
```jsx
<DataTable
  data={allocations}
  columns={columns}
  enableSorting
  enableFiltering
  enableSelection
  enableInlineEdit
  enableVirtualization={allocations.length > 100}
  onDataChange={handleEdit}
  bulkActions={[
    { id: 'delete', label: 'Delete', variant: 'destructive', onClick: handleBulkDelete }
  ]}
  density={isDense ? 'compact' : 'normal'}
/>
```

---

### 2.2 StatCard (Enhanced)

**File:** `src/components/ui/stat-card.jsx` (enhanced)

```typescript
interface StatCardProps {
  // Core
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  
  // Trend (new)
  showTrend?: boolean;
  previousValue?: number;
  trendFormat?: 'percent' | 'absolute';
  invertTrend?: boolean;  // When decrease is good
  
  // Sparkline (new)
  showSparkline?: boolean;
  sparklineData?: number[];  // Last 7 values
  
  // Interaction (new)
  onClick?: () => void;
  href?: string;
  
  // Display
  description?: string;
  loading?: boolean;
  className?: string;
}
```

**Usage:**
```jsx
<StatCard
  title="Active Tasks"
  value={24}
  previousValue={18}
  showTrend
  icon={<Activity />}
  sparklineData={[15, 18, 22, 20, 24, 21, 24]}
  showSparkline
  onClick={() => navigate('/allocation?status=active')}
/>
```

---

## 3. Hook Specifications

### 3.1 useKeyboardShortcuts

**File:** `src/hooks/useKeyboardShortcuts.js`

```typescript
interface Shortcut {
  key: string;           // e.g., 'k', 'Enter', 'Escape'
  meta?: boolean;        // ⌘ / Ctrl
  shift?: boolean;
  alt?: boolean;
  handler: (event: KeyboardEvent) => void;
  disabled?: boolean;
  preventDefault?: boolean;  // Default: true
  description?: string;
}

function useKeyboardShortcuts(shortcuts: Shortcut[]): void;
```

**Usage:**
```jsx
useKeyboardShortcuts([
  { key: 'k', meta: true, handler: openCommandPalette },
  { key: 'n', handler: openAddModal },
  { key: 'Escape', handler: closeModal },
  { key: '?', handler: openShortcutsHelp },
]);
```

**Behavior:**
- Ignores when focus is in input/textarea/contenteditable
- Handles both Mac (meta) and Windows (ctrl)
- Prevents default browser behavior when handled

---

### 3.2 useDensity

**File:** `src/hooks/useDensity.js`

```typescript
interface DensityHook {
  density: 'dense' | 'comfortable';
  setDensity: (density: 'dense' | 'comfortable') => void;
  isDense: boolean;
  toggleDensity: () => void;
}

function useDensity(): DensityHook;
```

**Usage:**
```jsx
function MyComponent() {
  const { isDense, toggleDensity } = useDensity();
  
  return (
    <div className={isDense ? 'compact' : 'relaxed'}>
      <button onClick={toggleDensity}>Toggle Density</button>
    </div>
  );
}
```

---

### 3.3 useLocalStorage

**File:** `src/hooks/useLocalStorage.js`

```typescript
function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void];
```

**Usage:**
```jsx
const [recentCommands, setRecentCommands] = useLocalStorage('recent-commands', []);
const [collapsedSections, setCollapsedSections] = useLocalStorage('collapsed-sections', {});
```

---

### 3.4 useCommandPalette

**File:** `src/hooks/useCommandPalette.js`

```typescript
interface CommandPaletteHook {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  search: string;
  setSearch: (query: string) => void;
  filteredCommands: Command[];
  selectedIndex: number;
  selectNext: () => void;
  selectPrevious: () => void;
  executeSelected: () => void;
}

function useCommandPalette(commands: Command[]): CommandPaletteHook;
```

---

## 4. Context Specifications

### 4.1 DensityContext

**File:** `src/context/DensityContext.jsx`

```typescript
interface DensityContextValue {
  density: 'dense' | 'comfortable';
  setDensity: (density: 'dense' | 'comfortable') => void;
}

const DensityContext: React.Context<DensityContextValue>;
const DensityProvider: React.FC<{ children: React.ReactNode }>;
```

**Provider Setup:**
```jsx
// src/App.jsx
import { DensityProvider } from './context/DensityContext';

function App() {
  return (
    <DensityProvider>
      <ThemeProvider>
        <AppProvider>
          {/* ... */}
        </AppProvider>
      </ThemeProvider>
    </DensityProvider>
  );
}
```

---

## 5. Utility Function Specifications

### 5.1 Export Utilities

**File:** `src/utils/export.js`

```typescript
// Export table data to CSV
function exportToCSV(
  data: Record<string, any>[], 
  filename: string,
  columns?: { key: string; header: string }[]
): void;

// Export table data to Excel
function exportToExcel(
  data: Record<string, any>[], 
  filename: string,
  columns?: { key: string; header: string }[]
): void;

// Export chart as PNG image
function exportChartToPNG(
  chartRef: React.RefObject<HTMLElement>,
  filename: string
): Promise<void>;
```

**Usage:**
```jsx
import { exportToCSV, exportToExcel } from '@/utils/export';

const handleExport = (format) => {
  const columns = [
    { key: 'resource', header: 'Resource' },
    { key: 'taskName', header: 'Task' },
    { key: 'phase', header: 'Phase' },
  ];
  
  if (format === 'csv') {
    exportToCSV(allocations, 'allocations.csv', columns);
  } else {
    exportToExcel(allocations, 'allocations.xlsx', columns);
  }
};
```

---

### 5.2 Toast Helpers

**File:** `src/utils/toast.js`

```typescript
interface ToastHelpers {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => Promise<T>;
  action: (
    message: string, 
    action: { label: string; onClick: () => void }
  ) => void;
  dismiss: (toastId?: string) => void;
}

const showToast: ToastHelpers;
```

**Usage:**
```jsx
import { showToast } from '@/utils/toast';

// Simple notifications
showToast.success('Allocation saved');
showToast.error('Failed to save');

// With undo action
showToast.action('Allocation deleted', {
  label: 'Undo',
  onClick: () => restoreAllocation(id)
});

// Promise-based
showToast.promise(saveAllocation(data), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save'
});
```

---

### 5.3 Shortcut Registry

**File:** `src/utils/shortcuts.js`

```typescript
interface ShortcutDefinition {
  key: string;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  category: 'navigation' | 'action' | 'edit';
}

const APP_SHORTCUTS: Record<string, ShortcutDefinition> = {
  COMMAND_PALETTE: { key: 'k', meta: true, description: 'Open command palette', category: 'navigation' },
  TOGGLE_SIDEBAR: { key: 'b', meta: true, description: 'Toggle sidebar', category: 'navigation' },
  NEW_ALLOCATION: { key: 'n', description: 'New allocation', category: 'action' },
  SEARCH: { key: '/', description: 'Focus search', category: 'navigation' },
  HELP: { key: '?', description: 'Show keyboard shortcuts', category: 'navigation' },
  SAVE: { key: 's', meta: true, description: 'Save changes', category: 'edit' },
  CANCEL: { key: 'Escape', description: 'Cancel / Close', category: 'action' },
};

// Format shortcut for display
function formatShortcut(shortcut: ShortcutDefinition): string;
// Returns: "⌘K" or "Ctrl+K" depending on OS

// Group shortcuts by category
function getShortcutsByCategory(): Record<string, ShortcutDefinition[]>;
```

---

## 6. CSS Token Specifications

### 6.1 Dense Mode Spacing

**File:** `src/index.css`

```css
:root {
  /* Dense mode spacing */
  --spacing-dense-0: 0;
  --spacing-dense-1: 0.125rem;   /* 2px */
  --spacing-dense-2: 0.25rem;    /* 4px */
  --spacing-dense-3: 0.5rem;     /* 8px */
  --spacing-dense-4: 0.75rem;    /* 12px */
  --spacing-dense-6: 1rem;       /* 16px */
  --spacing-dense-8: 1.5rem;     /* 24px */
}

/* Apply via utility classes */
.density-dense {
  --spacing-unit: 0.125rem;  /* Base unit halved */
}

.density-comfortable {
  --spacing-unit: 0.25rem;   /* Normal base unit */
}
```

---

### 6.2 Capacity Colors

```css
:root {
  /* Capacity status colors */
  --color-capacity-available: hsl(160 84% 39%);      /* Emerald */
  --color-capacity-light: hsl(180 70% 45%);          /* Teal */
  --color-capacity-moderate: hsl(38 92% 50%);        /* Amber */
  --color-capacity-heavy: hsl(25 95% 53%);           /* Orange */
  --color-capacity-over: hsl(0 72% 51%);             /* Red */
  --color-capacity-leave: hsl(220 9% 46%);           /* Gray */
}

/* Usage in components */
.capacity-bar[data-level="available"] { background: var(--color-capacity-available); }
.capacity-bar[data-level="light"] { background: var(--color-capacity-light); }
.capacity-bar[data-level="moderate"] { background: var(--color-capacity-moderate); }
.capacity-bar[data-level="heavy"] { background: var(--color-capacity-heavy); }
.capacity-bar[data-level="over"] { background: var(--color-capacity-over); }
```

---

### 6.3 Animation Tokens

```css
:root {
  /* Duration tokens */
  --duration-instant: 50ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  
  /* Easing tokens */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Animation utilities */
.animate-fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.animate-slide-up {
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.animate-scale-in {
  animation: scaleIn var(--duration-fast) var(--ease-spring);
}
```

---

### 6.4 Interactive State Colors

```css
:root {
  /* Row states */
  --color-row-hover: hsl(var(--primary) / 0.05);
  --color-row-selected: hsl(var(--primary) / 0.1);
  --color-row-active: hsl(var(--primary) / 0.15);
  
  /* Cell states */
  --color-cell-focus: hsl(var(--primary) / 0.15);
  --color-cell-editing: hsl(var(--primary) / 0.08);
  
  /* Focus ring */
  --color-focus-ring: hsl(var(--primary) / 0.5);
  --shadow-focus: 0 0 0 2px var(--color-focus-ring);
}
```

---

## Appendix: File Tree

```
src/
├── components/
│   └── ui/
│       ├── command-palette/           [NEW]
│       │   ├── CommandPalette.jsx
│       │   ├── CommandItem.jsx
│       │   ├── CommandGroup.jsx
│       │   ├── CommandPalette.css
│       │   └── index.js
│       ├── data-table/                 [ENHANCED]
│       │   ├── DataTable.jsx
│       │   ├── DataTableHeader.jsx
│       │   ├── DataTableRow.jsx
│       │   ├── DataTableCell.jsx
│       │   ├── DataTablePagination.jsx
│       │   ├── DataTableToolbar.jsx
│       │   ├── DataTableBulkActions.jsx
│       │   ├── DataTable.css
│       │   └── index.js
│       ├── timeline/                   [NEW]
│       │   ├── Timeline.jsx
│       │   ├── TimelineHeader.jsx
│       │   ├── TimelineRow.jsx
│       │   ├── TimelineBar.jsx
│       │   ├── TimelineMilestone.jsx
│       │   ├── TimelineControls.jsx
│       │   ├── Timeline.css
│       │   └── index.js
│       ├── skeletons/                  [NEW]
│       │   ├── DashboardSkeleton.jsx
│       │   ├── TableSkeleton.jsx
│       │   ├── TimelineSkeleton.jsx
│       │   ├── CardSkeleton.jsx
│       │   └── index.js
│       ├── keyboard-shortcuts-help.jsx [NEW]
│       ├── toast.jsx                   [NEW]
│       ├── skeleton.jsx                [ENHANCED]
│       └── stat-card.jsx               [ENHANCED]
├── context/
│   └── DensityContext.jsx              [NEW]
├── hooks/
│   ├── useKeyboardShortcuts.js         [NEW]
│   ├── useDensity.js                   [NEW]
│   ├── useLocalStorage.js              [NEW]
│   └── useCommandPalette.js            [NEW]
├── utils/
│   ├── export.js                       [NEW]
│   ├── toast.js                        [NEW]
│   └── shortcuts.js                    [NEW]
└── data/
    └── commands.js                     [NEW]
```

---

*This specification document provides the technical details needed for implementation. Refer to the Implementation Plan for task sequencing.*
