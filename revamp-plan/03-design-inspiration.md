# Design Inspiration Gallery

> **Curated References for Workload Resource Management Revamp**

---

## 1. Dashboard Designs

### 1.1 Monday.com Workload View
**Source:** monday.com  
**Why It's Relevant:**
- Visual workload circles showing work distribution
- Real-time capacity calculations
- Color-coded team member cards
- Interactive allocation adjustment

**Key Patterns:**
- Large KPI numbers with contextual color
- Workload bars per team member
- Quick-add buttons on hover
- Filterable views

---

### 1.2 Linear Dashboard
**Source:** linear.app  
**Why It's Relevant:**
- Extreme information density
- Minimal visual noise
- Fast keyboard navigation
- Clean, professional aesthetic

**Key Patterns:**
- Dense list views with subtle separators
- Inline status badges
- Command palette (⌘K)
- Muted color palette with accent highlights

---

### 1.3 Float Resource Scheduling
**Source:** float.com  
**Why It's Relevant:**
- Dedicated resource planning tool
- Visual timeline scheduling
- Integrated financial insights

**Key Patterns:**
- Drag-and-drop scheduling
- Color-coded availability
- Side-by-side project/resource view
- Capacity percentage indicators

---

### 1.4 Runn Planning View
**Source:** runn.io  
**Why It's Relevant:**
- Project scheduling with allocations
- Robust forecasting capabilities
- Dynamic view switching

**Key Patterns:**
- Allocation bars with resource avatars
- Phase and milestone visualization
- Monthly/Quarterly view toggle
- Capacity heatmaps

---

## 2. Timeline & Gantt Designs

### 2.1 Modern Gantt Characteristics
- Clean horizontal bars with rounded corners
- Color-coded by status or category
- Milestone markers (diamond shapes)
- Dependency arrows (optional)
- Zoom controls (Day/Week/Month)

### 2.2 Visual Reference Pattern
```
           ┌─ Zoom Controls ─┐
           │ Day Week Month  │
┌──────────┴─────────────────┴──────────────────────┐
│ Resource │ W1  │ W2  │ W3  │ W4  │ W5  │ W6  │   │
├──────────┼─────┴─────┴─────┴─────┴─────┴─────┴───┤
│ ⚪ John  │ ████████████░░░░░░░░░░░░░░░░░░░░░░░   │
│          │ Design Phase                           │
├──────────┼───────────────────────────────────────┤
│ ⚪ Jane  │ ░░░░░░░░████████████████░░░░░░░░░░░   │
│          │         Development                    │
├──────────┼───────────────────────────────────────┤
│ ⚪ Bob   │ ░░░░░░░░░░░░░░░░░░████████████████░   │
│          │                   Testing Phase        │
└──────────┴───────────────────────────────────────┘
```

---

## 3. Data Table Designs

### 3.1 Ideal Table Features
- **Column Management:** Resize, reorder, hide/show
- **Sorting:** Multi-column sort with indicators
- **Filtering:** Column-level filters, global search
- **Pagination:** Configurable page size or infinite scroll
- **Bulk Actions:** Select all, multi-select with actions bar
- **Inline Editing:** Click cell to edit, tab navigation
- **Row Actions:** Hover to reveal edit/delete buttons

### 3.2 Visual Reference
```
┌──────────────────────────────────────────────────────────────┐
│ 📋 Allocations                             [Search] [Filter] │
├────┬──────────┬────────────┬─────────┬─────────┬────────────┤
│ ☐  │ Resource │ Task       │ Phase   │ Status  │ Actions    │
├────┼──────────┼────────────┼─────────┼─────────┼────────────┤
│ ☐  │ ⚪ John  │ Design API │ Design  │ 🟢 Active│ ⋮          │
│ ☐  │ ⚪ Jane  │ Build FE   │ Dev     │ 🟡 Risk  │ ⋮          │
│ ☐  │ ⚪ Bob   │ Write Docs │ Complete│ ⚪ Done  │ ⋮          │
├────┴──────────┴────────────┴─────────┴─────────┴────────────┤
│ Showing 1-3 of 24                        < 1 2 3 4 5 ... >  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Card Designs

### 4.1 KPI Card Pattern
```
┌─────────────────────────────┐
│ 📊 Active Projects          │
│                             │
│        24                   │  ← Large prominent number
│       +12%                  │  ← Trend indicator
│                             │
│ vs. last month              │  ← Context
└─────────────────────────────┘
```

### 4.2 Team Member Card Pattern
```
┌─────────────────────────────┐
│ ⚪ John Doe          🔵 BA  │  ← Avatar + Name + Role badge
│                             │
│ ████████████░░░░░░░ 78%     │  ← Capacity bar
│                             │
│ 📋 5 active tasks           │  ← Quick stats
│ 📅 Available: Jan 28        │  
└─────────────────────────────┘
```

### 4.3 Project Card Pattern
```
┌─────────────────────────────┐
│ 🎯 Website Redesign         │
│ Phase: Development          │
│                             │
│ ████████░░░░░░░░░░ 45%      │  ← Progress
│                             │
│ 👥 4 members                │
│ 💰 Rp 45.2M                 │
│                             │
│ Due: Feb 15, 2026           │
└─────────────────────────────┘
```

---

## 5. Color Schemes

### 5.1 Professional Dark Mode
```
Background:     #0d1117 (GitHub-style blue-black)
Surface:        #161b22
Border:         #30363d
Text Primary:   #e6edf3
Text Secondary: #8b949e
Accent:         #6366f1 (Indigo)
```

### 5.2 Clean Light Mode
```
Background:     #f8fafc (Warm white)
Surface:        #ffffff
Border:         #e2e8f0
Text Primary:   #0f172a
Text Secondary: #64748b
Accent:         #4f46e5 (Indigo)
```

### 5.3 Status Color System
```
Available:   #10b981 (Emerald)
Busy:        #f59e0b (Amber)
At Capacity: #ef4444 (Red)
On Leave:    #6b7280 (Gray)
Completed:   #22c55e (Green)
```

---

## 6. Animation Patterns

### 6.1 Micro-interactions
- **Button hover:** Scale 1.02, shadow increase
- **Card hover:** Subtle lift (translate-y: -2px)
- **Toggle switch:** Spring animation
- **Number changes:** Count-up animation
- **Status changes:** Color fade transition

### 6.2 Page Transitions
- **Enter:** Fade in + slide up (200ms)
- **Exit:** Fade out (150ms)
- **Modal:** Scale from 0.95 + fade (250ms)
- **Sidebar:** Slide from left (200ms)

---

## 7. Typography Scale

### 7.1 Recommended Sizes
```
Display:  2.25rem (36px) - Page titles
H1:       1.875rem (30px) - Section titles
H2:       1.5rem (24px) - Card titles
H3:       1.25rem (20px) - Subsections
Body:     0.9375rem (15px) - Main text
Small:    0.875rem (14px) - Meta text
Tiny:     0.75rem (12px) - Labels
```

### 7.2 Font Weight Usage
- **Bold (700):** Headlines, KPI numbers
- **Semibold (600):** Card titles, buttons
- **Medium (500):** Labels, navigation
- **Regular (400):** Body text, descriptions

---

## 8. Icon Usage

### 8.1 Recommended Icon Set: Lucide
- Consistent stroke width (2px)
- Clean, minimal aesthetic
- Good library coverage
- React component support

### 8.2 Common Icons
```
📊 Dashboard:     LayoutDashboard
📋 Allocations:   ClipboardList
📅 Calendar:      Calendar
👥 Team:          Users
⏱️ Timeline:      Clock
💰 Cost:          DollarSign
⚙️ Settings:      Settings
➕ Add:           Plus
✏️ Edit:          Pencil
🗑️ Delete:        Trash2
🔍 Search:        Search
```

---

## 9. Online Resources

### 9.1 Design Inspiration Sites
- **Dribbble:** dribbble.com/search/dashboard
- **Mobbin:** mobbin.com (mobile patterns)
- **Saas Pages:** saaspages.xyz
- **Land-book:** land-book.com
- **Pageflows:** pageflows.com

### 9.2 UI Component References
- **shadcn/ui:** ui.shadcn.com
- **Radix UI:** radix-ui.com
- **Origin UI:** originui.com
- **Magic UI:** magicui.design

### 9.3 Specific Tools to Study
- **Linear:** linear.app (keyboard-first, dense UI)
- **Float:** float.com (resource scheduling)
- **Monday:** monday.com (workload management)
- **Notion:** notion.so (flexible dashboards)
- **Asana:** asana.com (project tracking)

---

*This gallery serves as a visual reference guide for the UI/UX revamp implementation.*
