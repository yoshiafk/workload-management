# Workload Resource Management

A comprehensive web application for tracking and managing team workload, resource allocation, and daily performance metrics. Built with React + Vite for hosting on GitHub Pages.

## 🚀 Features

- **Configuration Management** - Set up task categories, complexity levels, costs, holidays, and team members
- **Resource Allocation Tracking** - Plan and track actual task assignments with automatic workload calculations
- **Workload Summary Dashboard** - Visual overview of team workload and resource utilization
- **No Backend Required** - All data stored in LocalStorage with JSON import/export

## 📁 Documentation

| Document | Description |
|----------|-------------|
| [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) | Complete technical specification and requirements |
| [Architecture](docs/ARCHITECTURE.md) | System diagrams, ERD, data flows, and schemas |
| [Tasks](docs/TASKS.md) | Development task breakdown and checklist |

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite 5
- **Routing**: React Router v6
- **State Management**: React Context + useReducer
- **Styling**: CSS Modules + CSS Variables
- **Charts**: Recharts
- **Deployment**: GitHub Pages

## 📊 Core Modules

### 1. Library (Configuration)
- Team Members management
- Task Phases (8 phases)
- Task Templates with complexity estimates
- Complexity Settings (Low/Medium/High)
- Resource Costs (monthly, daily, hourly rates in IDR)

### 2. Important Dates
- Indonesian Public Holidays (pre-loaded for 2025)
- Team Leave Plans

### 3. Resource Allocation
- Activity tracking with Plan/Actual dates
- Auto-calculated fields:
  - Plan Task End (WORKDAY formula)
  - Project Cost (cycleActivity × hourlyRate)
  - Monthly Cost (projectCost / months)
  - Workload Percentage

### 4. Workload Summary Dashboard
- Top 5 tasks per team member
- Task allocation matrix
- Workload charts and statistics

## 🏃 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📄 License

MIT
