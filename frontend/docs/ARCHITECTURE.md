# Workload Resource Management - Architecture

This document contains all system diagrams, data relationships, and architectural decisions for the Workload Resource Management application.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Data Schemas](#data-schemas)
5. [LocalStorage Structure](#localstorage-structure)
6. [Calculation Formulas](#calculation-formulas)
7. [Project Structure](#project-structure)

---

## System Overview

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 + Vite 5 |
| **Routing** | React Router v6 |
| **State Management** | React Context + useReducer |
| **Styling** | CSS Modules + CSS Variables |
| **Charts** | Recharts |
| **Date Utilities** | date-fns |
| **Data Persistence** | LocalStorage |
| **Deployment** | GitHub Pages (gh-pages) |

### Application Modules

```
┌─────────────────────────────────────────────────────────────────┐
│                    Workload Resource Management                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Library    │  │  Important   │  │      Resource        │  │
│  │   (Config)   │  │    Dates     │  │     Allocation       │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────────────┤  │
│  │ Team Members │  │ Holidays     │  │ Allocation Table     │  │
│  │ Phases       │  │ Leave Plans  │  │ Auto-calculations    │  │
│  │ Tasks        │  │              │  │ CRUD Operations      │  │
│  │ Complexity   │  │              │  │                      │  │
│  │ Costs        │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Workload Summary Dashboard              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ Top 5 Tasks per Member │ Task Matrix │ Charts & Stats    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Entity Relationship Diagram

### Core Entities

```mermaid
erDiagram
    TEAM_MEMBER ||--o{ ALLOCATION : "assigned to"
    TEAM_MEMBER ||--o{ LEAVE : "takes"
    TEAM_MEMBER }o--|| RESOURCE_COST : "has cost tier"
    
    PHASE ||--o{ TASK_TEMPLATE : "contains"
    PHASE ||--o{ ALLOCATION : "current status"
    
    TASK_COMPLEXITY ||--o{ ALLOCATION : "defines effort"
    TASK_TEMPLATE ||--o{ ALLOCATION : "task type"
    
    HOLIDAY ||--o{ ALLOCATION : "affects schedule"
    
    ALLOCATION ||--|| PLAN_DATES : "has planned"
    ALLOCATION ||--o| ACTUAL_DATES : "has actual"
    ALLOCATION ||--|| WORKLOAD_CALC : "generates"

    TEAM_MEMBER {
        string id PK "e.g. R1, R2"
        string name "Full name"
        string type "BA or PM"
        number maxHoursPerWeek "Default: 40"
        string costTierId FK "Reference to RESOURCE_COST"
        boolean isActive "Default: true"
        datetime createdAt
    }

    PHASE {
        number id PK "1-8"
        string name "Phase name"
        number sortOrder "Display order"
        boolean isTerminal "Idle/Completed are terminal"
    }

    TASK_TEMPLATE {
        string id PK "T001, T002, etc"
        string name "Task template name"
        number phaseId FK "Reference to PHASE"
        object lowEstimate "days, hours, percentage"
        object mediumEstimate "days, hours, percentage"
        object highEstimate "days, hours, percentage"
    }

    TASK_COMPLEXITY {
        string level PK "low|medium|high"
        number days "Total duration days"
        number hours "Total duration hours"
        number workload "Workload value"
        string color "Visual indicator"
    }

    RESOURCE_COST {
        string id PK "UUID or name"
        string resourceName "Team member name"
        number monthlyCost "Monthly cost in IDR"
        number perDayCost "Daily rate in IDR"
        number perHourCost "Hourly rate in IDR"
        string currency "IDR"
    }

    HOLIDAY {
        string id PK "UUID"
        date date "Holiday date"
        string name "Holiday name"
        string type "national"
        number year "2025, 2026"
    }

    LEAVE {
        string id PK "UUID"
        string memberId FK "Reference to TEAM_MEMBER"
        date date "Leave date"
        string memberName "Team member name"
    }

    ALLOCATION {
        string id PK "UUID"
        string activityName "Project/Activity name"
        string resource FK "Team member name"
        string category "Low|Medium|High (complexity)"
        string phase "Current phase status"
        string taskName "Current task status"
        number workload "Workload percentage"
        string remarks "Notes"
        datetime createdAt
        datetime updatedAt
    }

    PLAN_DATES {
        string allocationId PK,FK "Reference to ALLOCATION"
        date taskStart "Plan Start Date"
        date taskEnd "Plan End Date (auto-calculated)"
        number costProject "Total project cost (auto-calculated)"
        number costMonthly "Monthly cost (auto-calculated)"
    }

    ACTUAL_DATES {
        string allocationId PK,FK "Reference to ALLOCATION"
        date taskStart "Actual Start Date"
        date taskEnd "Actual End Date (nullable)"
    }

    WORKLOAD_CALC {
        string allocationId PK,FK "Reference to ALLOCATION"
        number percentage "Calculated workload % (auto-calculated)"
        string status "underload|optimal|overload"
    }
```

### Entity Relationships Summary

| Parent Entity | Child Entity | Relationship | Description |
|--------------|--------------|--------------|-------------|
| `ResourceCost` | `TeamMember` | One-to-Many | One cost tier can apply to multiple team members |
| `TeamMember` | `Leave` | One-to-Many | One member can have multiple leave records |
| `TeamMember` | `Allocation` | One-to-Many | One member can have multiple task allocations |
| `Phase` | `TaskTemplate` | One-to-Many | One phase contains multiple task templates |
| `TaskTemplate` | `Allocation` | One-to-Many | One task template can be used in multiple allocations |
| `TaskComplexity` | `Allocation` | One-to-Many | One complexity level can apply to multiple allocations |
| `Holiday` | `Allocation` | Many-to-Many | Holidays affect workload calculations for all allocations |
| `Allocation` | `PlanDates` | One-to-One | Each allocation has one set of planned dates |
| `Allocation` | `ActualDates` | One-to-Zero/One | Allocation may or may not have actual dates yet |
| `Allocation` | `WorkloadCalc` | One-to-One | Each allocation has computed workload metrics |

---

## Data Flow Diagrams

### Level 0: Context Diagram

```mermaid
flowchart TB
    subgraph External["External Entities"]
        User([Team Manager])
        Excel([Excel Import])
        Export([JSON/CSV Export])
    end
    
    subgraph System["Workload Resource Management System"]
        App[["WRM Application"]]
    end
    
    User -->|"Configure settings"| App
    User -->|"Manage allocations"| App
    User -->|"View dashboards"| App
    App -->|"Display data & charts"| User
    App -->|"Export data"| Export
    Excel -->|"Import existing data"| App
```

---

### Level 1: Main Process Flow

```mermaid
flowchart TB
    subgraph User["User Interface"]
        UI[React Components]
    end
    
    subgraph Processes["Core Processes"]
        P1["1.0<br/>Library<br/>(Config)"]
        P2["2.0<br/>Resource<br/>Allocation"]
        P3["3.0<br/>Workload<br/>Calculation"]
        P4["4.0<br/>Workload<br/>Summary"]
        P5["5.0<br/>Important<br/>Dates"]
    end
    
    subgraph DataStores["Data Stores (LocalStorage)"]
        D1[(Library Data)]
        D2[(Allocation Data)]
        D3[(Important Dates)]
        D4[(Computed Metrics)]
    end
    
    UI -->|"Config inputs"| P1
    UI -->|"Allocation inputs"| P2
    UI -->|"Date inputs"| P5
    UI -->|"View requests"| P4
    
    P1 -->|"Store config"| D1
    P5 -->|"Store dates"| D3
    
    D1 -->|"Read config"| P2
    D3 -->|"Read dates"| P3
    P2 -->|"Store allocations"| D2
    P2 -->|"Trigger calc"| P3
    
    D1 -->|"Team, costs"| P3
    D2 -->|"Allocation data"| P3
    P3 -->|"Store metrics"| D4
    
    D1 -->|"Team members"| P4
    D2 -->|"Allocations"| P4
    D4 -->|"Metrics"| P4
    P4 -->|"Dashboard view"| UI
```

---

### Level 2: Library (Config) Module Flow

```mermaid
flowchart LR
    subgraph ConfigUI["Library Config Sections"]
        TM[Team Members]
        PH[Phases]
        TT[Task Templates]
        CX[Complexity Levels]
        RC[Resource Costs]
    end
    
    subgraph Actions["User Actions"]
        A1[Create]
        A2[Read]
        A3[Update]
        A4[Delete]
    end
    
    subgraph Context["AppContext"]
        Dispatch{{"dispatch()"}}
        State[["state"]]
    end
    
    subgraph Storage["LocalStorage"]
        LS1[("wrm_members")]
        LS2[("wrm_phases")]
        LS3[("wrm_tasks")]
        LS4[("wrm_complexity")]
        LS5[("wrm_costs")]
    end
    
    TM & PH & TT & CX & RC --> A1 & A2 & A3 & A4
    
    A1 & A3 & A4 --> Dispatch
    Dispatch --> State
    State --> A2
    
    State <--> LS1 & LS2 & LS3 & LS4 & LS5
```

---

### Level 2: Resource Allocation Flow

```mermaid
flowchart TB
    subgraph Input["Input Fields (matching Excel)"]
        I1[Activity Name]
        I2[Resource - Team Member]
        I3[Category - Complexity]
        I4[Phase - Current Status]
        I5[Task Name - Current Task]
        I6[Plan TaskStart]
        I7[Actual TaskStart]
        I8[Actual TaskEnd]
        I9[Remarks]
    end
    
    subgraph AutoCalc["Auto-Calculated Fields"]
        C1["Plan TaskEnd<br/>=WORKDAY(Start, Days, Holidays+Leaves)"]
        C2["Cost Project<br/>=Workload × HourlyRate"]
        C3["Cost Monthly<br/>=CostProject / Months"]
        C4["Workload %<br/>=XLOOKUP(Task → ComplexityPct)"]
    end
    
    subgraph Dependencies["Lookup Data"]
        D1[(Team Members)]
        D2[(Resource Costs)]
        D3[(Complexity Settings)]
        D4[(Holidays)]
        D5[(Leaves)]
        D6[(Task Templates)]
    end
    
    subgraph Output["Output"]
        O1[Allocation Record]
        O2[Updated Table Row]
    end
    
    I1 & I2 & I3 & I4 & I5 --> O1
    I6 --> C1
    I7 & I8 --> O1
    I9 --> O1
    
    I3 --> C1 & C2
    I2 --> C1 & C2
    D3 --> C1 & C2
    D4 & D5 --> C1
    D2 --> C2
    C1 --> C3
    C2 --> C3
    I5 --> C4
    D6 --> C4
    
    C1 & C2 & C3 & C4 --> O1
    O1 --> O2
```

---

### Level 2: Workload Calculation Detail

```mermaid
flowchart TB
    subgraph Inputs["Calculation Inputs"]
        A[Allocation Record]
        M[Team Member]
        H[Holidays in Period]
        L[Leaves in Period]
        CX[Complexity Settings]
    end
    
    subgraph Step1["Step 1: Calculate End Date"]
        S1A["Get Plan TaskStart"]
        S1B["Lookup complexity → days"]
        S1C["Get holidays list"]
        S1D["Filter member leaves"]
        S1E["WORKDAY calculation"]
        S1F["Result: Plan TaskEnd"]
    end
    
    subgraph Step2["Step 2: Calculate Project Cost"]
        S2A["Lookup complexity → workload"]
        S2B["Lookup resource → perHourCost"]
        S2C["Multiply: cycle × hourly"]
        S2D["Result: Cost Project"]
    end
    
    subgraph Step3["Step 3: Calculate Monthly Cost"]
        S3A["Get date range months"]
        S3B["Cost Project / Months"]
        S3C["Result: Cost Monthly"]
    end
    
    subgraph Step4["Step 4: Calculate Workload %"]
        S4A["Lookup TaskName in templates"]
        S4B["Select complexity column"]
        S4C["Result: Workload Percentage"]
    end
    
    A --> S1A
    CX --> S1B
    H --> S1C
    L --> S1D
    M --> S1D
    S1A --> S1E
    S1B --> S1E
    S1C --> S1E
    S1D --> S1E
    S1E --> S1F
    
    CX --> S2A
    M --> S2B
    S2A --> S2C
    S2B --> S2C
    S2C --> S2D
    
    S1A --> S3A
    S1F --> S3A
    S2D --> S3B
    S3A --> S3B
    S3B --> S3C
    
    A --> S4A
    CX --> S4B
    S4A --> S4C
    S4B --> S4C
```

---

### Level 2: Workload Summary Dashboard Flow

```mermaid
flowchart TB
    subgraph Sources["Data Sources"]
        AL[(All Allocations)]
        TM[(Team Members)]
        TT[(Task Templates)]
    end
    
    subgraph Section1["Section 1: Top 5 Tasks per Member"]
        S1A["Filter allocations by member"]
        S1B["Sort by TaskEnd date"]
        S1C["Take top 5"]
        S1D["Display: Task Name + Finish Date"]
    end
    
    subgraph Section2["Section 2: Task Allocation Matrix"]
        S2A["List all task types"]
        S2B["For each member"]
        S2C["COUNTIFS: count allocations"]
        S2D["Display matrix grid"]
    end
    
    subgraph Section3["Section 3: Member Workload Summary"]
        S3A["SUMIFS: total workload per member"]
        S3B["Calculate active workload ratio"]
        S3C["Display workload gauges"]
    end
    
    subgraph Output["Dashboard Display"]
        O1["Member Task Cards"]
        O2["Task Matrix Table"]
        O3["Workload Summary"]
    end
    
    AL --> S1A
    TM --> S1A
    S1A --> S1B --> S1C --> S1D --> O1
    
    TT --> S2A
    TM --> S2B
    AL --> S2C
    S2A --> S2C
    S2B --> S2C
    S2C --> S2D --> O2
    
    AL --> S3A
    TM --> S3A
    S3A --> S3B --> S3C --> O3
```

---

### Level 2: Important Dates Flow

```mermaid
flowchart TB
    subgraph HolidaySection["Indonesia Public Holiday"]
        H1[Date Input]
        H2[Holiday Name]
        H3[Year Filter]
    end
    
    subgraph LeaveSection["Leave Plan"]
        L1[Member Name]
        L2[Leave Date]
    end
    
    subgraph WorkingDaysCalc["Working Days Calculation"]
        W1["Get date range"]
        W2["Count calendar days"]
        W3["Subtract weekends"]
        W4["Subtract holidays"]
        W5["Subtract member leaves"]
        W6["Result: Available Days"]
    end
    
    subgraph Storage["Storage"]
        LS1[(wrm_holidays)]
        LS2[(wrm_leaves)]
    end
    
    H1 & H2 --> LS1
    L1 & L2 --> LS2
    
    LS1 --> W4
    LS2 --> W5
    
    W1 --> W2 --> W3 --> W4 --> W5 --> W6
```

---

### Level 2: Cost Calculation Flow

```mermaid
flowchart TB
    subgraph Inputs["Calculation Inputs"]
        I1[Plan TaskStart]
        I2[Complexity Level]
        I3[Resource/Member]
    end
    
    subgraph Lookup["Lookup Tables"]
        L1[(Complexity Settings<br/>Low: 27d, 2.45 cycle<br/>Medium: 72d, 8.55 cycle<br/>High: 102d, 19.13 cycle)]
        L2[(Resource Costs<br/>Beatrix: 6,250/hr<br/>Herindra: 15,625/hr<br/>etc.)]
        L3[(Holidays)]
        L4[(Leaves)]
    end
    
    subgraph Step1["Step 1: Calculate End Date"]
        S1A["Lookup complexity → days"]
        S1B["Combine holidays + leaves"]
        S1C["WORKDAY(Start, Days, Excluded)"]
        S1D["= Plan TaskEnd"]
    end
    
    subgraph Step2["Step 2: Calculate Project Cost"]
        S2A["Lookup complexity → workload"]
        S2B["Lookup resource → perHourCost"]
        S2C["workload × perHourCost"]
        S2D["= Cost Project"]
    end
    
    subgraph Step3["Step 3: Calculate Monthly Cost"]
        S3A["DATEDIF(Start, End, months)"]
        S3B["Cost Project / Months"]
        S3C["= Cost Monthly"]
    end
    
    subgraph Output["Output"]
        O1[Plan TaskEnd]
        O2[Cost Project in IDR]
        O3[Cost Monthly in IDR]
    end
    
    I1 --> S1C
    I2 --> S1A
    I3 --> S1B
    L1 --> S1A
    L3 --> S1B
    L4 --> S1B
    S1A --> S1C
    S1B --> S1C
    S1C --> S1D --> O1
    
    I2 --> S2A
    I3 --> S2B
    L1 --> S2A
    L2 --> S2B
    S2A --> S2C
    S2B --> S2C
    S2C --> S2D --> O2
    
    I1 --> S3A
    S1D --> S3A
    S2D --> S3B
    S3A --> S3B
    S3B --> S3C --> O3
```

---

## Data Schemas

### Team Member

```javascript
{
  id: "R1",                    // ResourceID
  name: "Beatrix",             // Full name
  type: "BA",                  // BA or PM
  maxHoursPerWeek: 40,         // Max work hours
  costTierId: "beatrix",       // Link to resource cost
  isActive: true,
  createdAt: "2026-01-06T10:00:00Z"
}
```

### Phase

```javascript
{
  id: 1,                       // Phase number
  name: "Requirement Gathering & Analysis",
  tasks: ["T001", "T002"],     // Task IDs in this phase
  sortOrder: 1,
  isTerminal: false            // true for Idle/Completed
}
```

### Task Template

```javascript
{
  id: "T001",
  name: "Stakeholder Interviews",
  phaseId: 1,
  estimates: {
    low: { days: 2, hours: 1, percentage: 0.125 },
    medium: { days: 5, hours: 2, percentage: 0.25 },
    high: { days: 10, hours: 4, percentage: 0.5 }
  }
}
```

### Complexity

```javascript
{
  low: {
    level: "low",
    days: 27,
    hours: 14.5,
    workload: 2.446875,
    color: "#10b981"
  },
  medium: {
    level: "medium",
    days: 72,
    hours: 19,
    workload: 8.55,
    color: "#3b82f6"
  },
  high: {
    level: "high",
    days: 102,
    hours: 30,
    workload: 19.125,
    color: "#f59e0b"
  }
}
```

### Resource Cost

```javascript
{
  id: "beatrix",
  resourceName: "Beatrix",
  monthlyCost: 1000000,        // IDR
  perDayCost: 50000,           // IDR
  perHourCost: 6250,           // IDR
  currency: "IDR"
}
```

### Holiday

```javascript
{
  id: "hd_001",
  date: "2025-01-01",
  name: "New Year's Day",
  type: "national",
  year: 2025
}
```

### Leave

```javascript
{
  id: "lv_001",
  memberId: "R1",
  memberName: "Beatrix",
  date: "2025-03-20"
}
```

### Allocation (Complete)

```javascript
{
  id: "alloc_001",
  
  // Core fields
  activityName: "SMART ACTIVE NEW TOC",
  resource: "Care BA",
  category: "High",
  phase: "Completed",
  taskName: "Completed",
  
  // Plan section
  plan: {
    taskStart: "2025-02-12",
    taskEnd: "2025-07-22",      // Auto-calculated
    costProject: 375000,        // Auto-calculated
    costMonthly: 75000          // Auto-calculated
  },
  
  // Actual section
  actual: {
    taskStart: "2025-02-12",
    taskEnd: "2025-05-12"
  },
  
  workload: 0,                  // Auto-calculated
  remarks: "",
  
  createdAt: "2026-01-06T10:00:00Z",
  updatedAt: "2026-01-06T10:00:00Z"
}
```

---

## LocalStorage Structure

| Key | Data Type | Description |
|-----|-----------|-------------|
| `wrm_members` | `TeamMember[]` | All team members |
| `wrm_phases` | `Phase[]` | All phases with task references |
| `wrm_tasks` | `TaskTemplate[]` | All task templates with estimates |
| `wrm_complexity` | `Object` | Complexity settings (low, medium, high) |
| `wrm_costs` | `ResourceCost[]` | All resource cost tiers |
| `wrm_holidays` | `Holiday[]` | National and company holidays |
| `wrm_leaves` | `Leave[]` | All team member leaves |
| `wrm_allocations` | `Allocation[]` | All resource allocations |
| `wrm_settings` | `Object` | App settings (theme, currency, etc.) |
| `wrm_version` | `string` | Data schema version for migrations |

---

## Calculation Formulas

### 1. Plan Task End Date (WORKDAY)

```javascript
function calculatePlanEndDate(startDate, complexity, resourceName, holidays, leaves) {
  const durationDays = complexitySettings[complexity].days;
  const memberLeaves = leaves.filter(l => l.memberName === resourceName);
  const excludedDates = [
    ...holidays.map(h => h.date),
    ...memberLeaves.map(l => l.date)
  ];
  return addWorkdays(startDate, durationDays, excludedDates);
}
```

### 2. Project Cost

```javascript
function calculateProjectCost(complexity, resourceName, complexitySettings, resourceCosts) {
  const workload = complexitySettings[complexity].workload;
  const resource = resourceCosts.find(r => r.name === resourceName);
  return workload * resource.perHourCost;
}
```

### 3. Monthly Cost

```javascript
function calculateMonthlyCost(projectCost, startDate, endDate) {
  const months = differenceInMonths(endDate, startDate) || 1;
  return projectCost / months;
}
```

### 4. Workload Percentage

```javascript
function calculateWorkloadPercentage(taskName, complexity, taskTemplates) {
  const task = taskTemplates.find(t => t.name === taskName);
  if (!task) return 0;
  return task.estimates[complexity.toLowerCase()].percentage;
}
```

### 5. Task Matrix Count (COUNTIFS)

```javascript
function countTasksByMember(taskName, memberName, allocations) {
  return allocations.filter(a => 
    a.taskName === taskName && a.resource === memberName
  ).length;
}
```

### 6. Total Workload per Member (SUMIFS)

```javascript
function getTotalWorkload(memberName, allocations) {
  return allocations
    .filter(a => a.resource === memberName)
    .reduce((sum, a) => sum + a.workload, 0);
}
```

---

## Project Structure

```
hr-management/
├── index.html
├── package.json
├── vite.config.js
├── docs/
│   ├── ARCHITECTURE.md          # This file
│   ├── TASKS.md                 # Task breakdown
│   └── IMPLEMENTATION_PLAN.md   # Full implementation plan
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   │
│   ├── context/
│   │   └── AppContext.jsx
│   │
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   └── useCalculations.js
│   │
│   ├── utils/
│   │   ├── storage.js
│   │   ├── calculations.js
│   │   └── dates.js
│   │
│   ├── data/
│   │   ├── indonesiaHolidays.js
│   │   ├── defaultTeam.js
│   │   ├── defaultPhases.js
│   │   ├── defaultTasks.js
│   │   └── defaultCosts.js
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Layout.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── DatePicker.jsx
│   │   │   └── Badge.jsx
│   │   └── charts/
│   │       ├── WorkloadChart.jsx
│   │       ├── CostChart.jsx
│   │       └── TaskMatrix.jsx
│   │
│   └── pages/
│       ├── WorkloadSummary.jsx
│       ├── ResourceAllocation.jsx
│       ├── ImportantDates.jsx
│       └── Library/
│           ├── index.jsx
│           ├── TeamMembers.jsx
│           ├── Phases.jsx
│           ├── TaskTemplates.jsx
│           ├── Complexity.jsx
│           └── ResourceCosts.jsx
│
└── public/
    └── favicon.svg
```

---

## Future Architecture: Skill-Based Matching

```mermaid
erDiagram
    TEAM_MEMBER ||--o{ MEMBER_SKILL : "has"
    SKILL ||--o{ MEMBER_SKILL : "possessed by"
    SKILL ||--o{ TASK_SKILL : "required for"
    TASK_TEMPLATE ||--o{ TASK_SKILL : "requires"

    SKILL {
        string id PK
        string name
        string category
    }

    MEMBER_SKILL {
        string memberId FK
        string skillId FK
        string level "Beginner|Intermediate|Expert"
    }

    TASK_SKILL {
        string taskId FK
        string skillId FK
        boolean isRequired
    }
```
