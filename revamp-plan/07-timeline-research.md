# Timeline/Gantt Chart UI/UX Research & Best Practices

**Research Date**: January 23, 2026  
**Purpose**: Comprehensive research for rebuilding the Timeline component with industry-standard patterns

---

## Executive Summary

After analyzing leading project management tools (Monday.com, Asana, TeamGantt, Jira, Microsoft Project, ClickUp), several critical patterns emerge for building robust, performant timeline views:

1. **Canvas-based rendering** for large datasets (>100 tasks)
2. **Virtual scrolling** for rows to handle 1000+ resources
3. **Fixed-width grid cells** with explicit date calculations
4. **Separate scroll contexts** for header vs content (with sync)
5. **Clipping containers** to prevent overflow

---

## 1. Architecture Patterns

### 1.1 Rendering Strategy

**Canvas-Based (Recommended for Performance)**
- **Used by**: Asana, Monday.com (timeline view), Microsoft Project
- **Pros**: 
  - Handles 10,000+ task bars without DOM bloat
  - Smooth 60 FPS scrolling
  - Precise pixel control
- **Cons**:
  - More complex implementation
  - Requires custom hit detection for interactions
- **Implementation**: Use HTML5 Canvas for rendering bars, SVG for today indicator

**DOM-Based with Virtualization**
- **Used by**: Jira, ClickUp, TeamGantt
- **Pros**:
  - Easier to implement
  - Standard DOM events work
  - Better accessibility
- **Cons**:
  - Performance degrades >500 visible task bars
  - Requires virtual scrolling for rows
- **Implementation**: Render only visible rows (using react-window or custom logic)

**Recommendation**: Start with **DOM + Virtual Scrolling**, migrate to Canvas if performance issues arise.

---

### 1.2 Scroll Architecture

**Industry Standard Pattern**:
```
┌─────────────────────────────────────┐
│  [Fixed Header: Resource Names]    │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │  Scrollable Date Header      │  │ ← Synced Scroll Container
│  └──────────────────────────────┘  │
├─────────────────────────────────────┤
│  ┌─────┬────────────────────────┐  │
│  │ Res │  Task Bars (scrolls)   │  │ ← Main Scroll Container
│  │ ◄───┼────────────────────────►  │    (controls both axes)
│  │ Fix │                         │  │
│  │ Stk │                         │  │
│  └─────┴────────────────────────┘  │
└─────────────────────────────────────┘
```

**Key Pattern (Monday.com/Asana)**:
- **ONE** scroll container for vertical + horizontal
- Date header is a **separate element** with `overflow-x: hidden`
- JavaScript syncs `scrollLeft` from main container to header
- Resource column uses `position: sticky; left: 0`

---

### 1.3 Layout Constraints (CRITICAL)

**The Golden Rule**: Every container must have **explicit width** based on:
```
totalWidth = (numberOfDays * cellWidth) + resourceColumnWidth
```

**Overflow Containment**:
```css
.timeline-root {
  overflow: hidden; /* Prevent external leakage */
}

.timeline-scroll-container {
  overflow: auto; /* Enable internal scrolling */
}

.timeline-task-container {
  overflow: hidden; /* CRITICAL: Clip overflowing task bars */
  width: calc(var(--num-days) * var(--cell-width));
}
```

---

## 2. UI/UX Best Practices

### 2.1 Date Header Design

**Multi-Level Headers** (Standard across all tools):
```
┌───────────────────────────────────────┐
│  January 2026  │  February 2026  │... │ ← Month level
├─────┬─────┬─────┬─────┬─────┬─────────┤
│ Mon │ Tue │ Wed │ Thu │ Fri │ Sat ... │ ← Day level
│  13 │  14 │  15 │  16 │  17 │  18 ... │
└─────┴─────┴─────┴─────┴─────┴─────────┘
```

**Cell Width Standards**:
- **Day view**: 40-60px per day (Monday.com: 48px, Asana: 52px)
- **Week view**: 80-120px per week
- **Month view**: 160-240px per month

**Visual Hierarchy**:
- Weekends: Subtle gray background (#f5f5f5 light, #1a1a1a dark)
- Today: Primary color background at 8-10% opacity
- Borders: 1px solid with 20-30% opacity

---

### 2.2 Task Bar Design

**Sizing & Positioning**:
```
Task Bar:
  height: 28-36px (comfortable), 20-24px (compact)
  padding: 0 8-12px
  border-radius: 6-8px
  left: (daysSinceGridStart * cellWidth)px
  width: (durationInDays * cellWidth)px
```

**Minimum Width Rule** (Asana pattern):
- If `width < cellWidth`, set `width = cellWidth` (show at least 1 day)
- If `width < 100px`, hide text label, show only color indicator

**Visual Hierarchy**:
- Project tasks: Deep, saturated colors (Indigo, Purple)
- Support tasks: Bright, energetic colors (Green, Teal)
- Maintenance: Warm, cautionary colors (Amber, Orange)
- Add subtle shadow: `box-shadow: 0 2px 8px rgba(0,0,0,0.12)`

**Interaction States**:
- Hover: Subtle lift (`transform: translateY(-2px)`)
- Dragging: Increased opacity + larger shadow
- Selected: 2px border in primary color

---

### 2.3 Resource Column (Sticky)

**Layout** (TeamGantt pattern):
```
┌──────────────────────┐
│  [Avatar]  Name      │  ← 240-280px width
│            Role      │
│            [Badge]   │  (e.g., "3 tasks")
└──────────────────────┘
```

**Technical Implementation**:
```css
.resource-cell {
  position: sticky;
  left: 0;
  z-index: 20; /* Above task bars (z=10) */
  background: var(--card-bg);
  border-right: 1px solid var(--border);
  box-shadow: 2px 0 4px rgba(0,0,0,0.04); /* Subtle depth */
}
```

---

### 2.4 Today Indicator

**Visual Design** (Industry Standard):
- Vertical line: 2px wide, primary color
- Top marker: 8px circle or triangle
- **Placement**: Centered on today's column (`left: todayIndex * cellWidth + cellWidth/2`)
- **Layer**: `z-index: 25` (above grid, below modals)

**Animation** (Monday.com pattern):
- Subtle pulse animation on the top marker
- No animation on the line itself (performance)

---

## 3. Data Management

### 3.1 State Structure

```typescript
interface TimelineState {
  // View Configuration
  zoom: 'day' | 'week' | 'month';
  density: 'comfortable' | 'compact';
  centerDate: Date;
  
  // Data
  resources: Resource[];
  tasks: Task[];
  holidays: Holiday[];
  
  // Derived (memoized)
  dateRange: Date[];
  visibleRowRange: { start: number; end: number };
}

interface Task {
  id: string;
  resourceId: string;
  activityName: string;
  start: Date; // ISO string in storage, Date in memory
  end: Date;
  category: 'Project' | 'Support' | 'Maintenance';
  progress: number; // 0-100
}
```

### 3.2 Performance Optimizations

**1. Virtual Scrolling** (for >50 resources):
```jsx
// Only render visible rows
const visibleStart = Math.floor(scrollTop / rowHeight);
const visibleEnd = visibleStart + Math.ceil(viewportHeight / rowHeight);
const visibleResources = resources.slice(visibleStart, visibleEnd);
```

**2. Memoization** (prevent unnecessary recalculations):
```jsx
const dateRange = useMemo(() => 
  calculateDateRange(centerDate, zoom), 
  [centerDate, zoom]
);

const taskPositions = useMemo(() => 
  tasks.map(task => calculatePosition(task, dateRange, cellWidth)),
  [tasks, dateRange, cellWidth]
);
```

**3. Throttled Scroll Sync**:
```jsx
const syncScroll = useCallback(
  throttle((scrollLeft) => {
    headerRef.current.scrollLeft = scrollLeft;
  }, 16), // 60 FPS
  []
);
```

---

## 4. Technical Implementation Plan

### 4.1 Component Architecture

```
Timeline/ (Main orchestrator)
├── TimelineHeader/
│   ├── MonthGroupHeader
│   └── DayHeader
├── TimelineGrid/ (Background grid cells)
├── TimelineBody/
│   ├── VirtualizedRows/ (react-window)
│   │   └── TimelineRow/
│   │       ├── ResourceCell (sticky)
│   │       └── TaskTrack/
│   │           └── TaskBar (draggable)
│   └── TodayIndicator
└── TimelineControls/
    ├── ZoomButtons
    ├── DensityToggle
    └── DateNavigator
```

### 4.2 CSS Strategy

**Use CSS Grid for Date Headers**:
```css
.timeline-date-header {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: var(--cell-width);
}
```

**Absolute Positioning for Task Bars**:
```css
.task-bar {
  position: absolute;
  left: calc(var(--start-day-offset) * var(--cell-width));
  width: calc(var(--duration-days) * var(--cell-width));
  top: calc(var(--track-index) * var(--track-height));
}
```

**Prevent Overflow Leakage**:
```css
.timeline-root {
  contain: layout size style; /* CSS containment */
  overflow: hidden;
}

.timeline-scroll-area {
  overflow: auto;
  overscroll-behavior: contain; /* Prevent scroll chaining */
}
```

---

## 5. Accessibility Considerations

**Keyboard Navigation** (WCAG 2.1 AA):
- Arrow keys: Navigate between task bars
- Enter: Expand task details
- Tab: Move between interactive elements
- Escape: Close modals/details

**Screen Reader Support**:
```html
<div role="grid" aria-label="Project Timeline">
  <div role="row" aria-rowindex="1">
    <div role="columnheader">Resource</div>
    <div role="columnheader">Jan 13</div>
    <!-- ... -->
  </div>
  <div role="row">
    <div role="rowheader">John Doe</div>
    <div role="gridcell">
      <div role="button" aria-label="Project Alpha, Jan 15 to Jan 25">
        <!-- Task bar -->
      </div>
    </div>
  </div>
</div>
```

---

## 6. Common Pitfalls to Avoid

### ❌ Don't:
1. **Use flexbox with `flex: 1` for grid cells** → causes infinite expansion
2. **Sync scroll with `useEffect` only** → causes visible lag
3. **Render all tasks at once** → DOM bloat, poor performance
4. **Use `overflow: visible` on task containers** → breaks clipping
5. **Calculate positions in render** → causes jank, use `useMemo`

### ✅ Do:
1. **Use explicit widths** based on date range length
2. **Implement scroll sync with both CSS and JS** (CSS for initial, JS for updates)
3. **Use virtual scrolling** for rows with >50 resources
4. **Clip task bars** with `overflow: hidden` on container
5. **Memoize all calculations** that depend on scroll/zoom state

---

## 7. Implementation Phases

### Phase 1: Core Layout (Foundation)
- [ ] Fixed-width grid with explicit calculations
- [ ] Single scroll container architecture
- [ ] Sticky resource column (CSS only)
- [ ] Basic date header (no sync yet)
- **Target**: No infinite scroll, proper containment

### Phase 2: Visual Polish
- [ ] Implement scroll sync (header ↔ content)
- [ ] Add today indicator
- [ ] Style task bars with category colors
- [ ] Implement hover/focus states

### Phase 3: Interactions
- [ ] Drag-and-drop rescheduling
- [ ] Zoom controls (Day/Week/Month)
- [ ] Density toggle
- [ ] Task detail tooltips

### Phase 4: Performance
- [ ] Virtual scrolling for rows
- [ ] Memoize all calculations
- [ ] Throttle scroll sync
- [ ] Lazy load task data

### Phase 5: Accessibility
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Screen reader announcements
- [ ] Focus management

---

## 8. Recommended Libraries

### Rendering
- **react-window** or **react-virtualized** - Virtual scrolling
- **framer-motion** - Smooth drag interactions
- **date-fns** - Date calculations (already in use)

### Drag & Drop
- **@dnd-kit/core** - Modern, accessible DnD (Recommended)
- **react-beautiful-dnd** - Older but battle-tested
- **framer-motion** - Lower-level control

### NOT Recommended
- ~~dhtmlxGantt~~ - Heavy, outdated, expensive license
- ~~gantt-schedule-timeline-calendar~~ - Complex API
- Custom Canvas solution - Too much complexity for this use case

---

## 9. Success Metrics

**Performance**:
- [ ] 60 FPS scrolling with 100 tasks visible
- [ ] <100ms to render initial view
- [ ] <16ms scroll sync latency

**Usability**:
- [ ] No horizontal scroll on page body
- [ ] Task bars align with date columns
- [ ] Sticky column works at all scroll positions
- [ ] Today indicator visible and accurate

**Accessibility**:
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigable
- [ ] Screen reader friendly

---

## 10. Next Steps

1. **Delete existing Timeline implementation**:
   - Remove `src/components/ui/timeline/` directory
   - Remove `src/pages/TimelineView.jsx` and `.css`
   
2. **Create new architecture**:
   - Start with Phase 1 (Foundation)
   - Build incrementally, test each phase
   - Prioritize correctness over features

3. **Testing strategy**:
   - Browser test at each phase
   - Verify no layout leakage
   - Test with varying data sizes (10, 100, 500 tasks)

---

## References & Inspiration

- **Monday.com**: Best-in-class scroll sync, smooth interactions
- **Asana Timeline**: Excellent visual hierarchy, clean design
- **TeamGantt**: Great color system, clear task relationships
- **Jira Timeline**: Robust filtering, good keyboard nav
- **Microsoft Project**: Industry standard for complex projects
