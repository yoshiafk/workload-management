# Workload Management & Resource Allocation System

A professional resource management platform designed to track team workload, project costs, and allocation schedules with automatic calculation synchronization.

## 🚀 Key Features

- **Dynamic Resource Allocation**: Assign team members (BA/PM) to specific project phases and tasks.
- **Context-Aware Mapping**: Phase-to-Task linking ensures only relevant tasks are selectable.
- **Auto-Sync Calculations**: Real-time updates for end dates, costs, and workload percentages.
- **Workload Dashboard**: Visual capacity tracking (percentage-based) with over-allocation alerts.
- **Holiday & Leave Integration**: Intelligent scheduling that skips weekends, holidays, and individual leave dates.
- **Premium Dark Mode**: Sophisticated dark theme with consistent table styling and high-fidelity aesthetics.
- **Custom Branding**: Integrated high-quality SVG logo and customized favicon for a professional look.

---

## 📊 Calculation Logic Reference

This project uses formulas translated from high-fidelity Excel prototypes to ensure financial and scheduling accuracy.

### 1. Plan End Date
Calculates when a task will finish based on working days, skipping weekends and holidays/leaves.
**Formula:** `End Date = WORKDAY(Start Date, Complexity Days, [Holidays + Member Leaves])`

*   **Logic**: Increments the start date by the number of days specified in Complexity Settings (Low/Medium/High), skipping any day that is a weekend or listed in the holiday/leave registry.

### 2. Project Cost
Determines the total cost of an allocation based on the effort required and the resource's rate.
**Formula:** `Total Cost = Complexity Hours × Resource Per-Hour Cost`

*   **Example**:
    *   Complexity "Medium" = 80 hours (from Settings)
    *   Resource "John Doe" = Rp 500,000 / hour
    *   **Result**: 80 * 500,000 = **Rp 40,000,000**

### 3. Monthly Cost
Distributes the total project cost across the duration of the plan.
**Formula:** `Monthly Cost = Total Project Cost / Duration in Months`

*   **Logic**: Calculates the difference in months between Start and End dates. If the task is less than 1 month, it defaults to a 1-month distribution.

### 4. Workload Calculations
The application uses two different ways to represent workload depending on the context:

#### A. Complexity Effort (Man-Days)
Used in **Library > Complexity** to show the total effort required for a project category.
**Formula:** `Effort (Man-Days) = Total Hours / 8`
*   *Example*: 14.5 hours = **1.8125 Man-Days**.

#### B. Individual Task Workload (%)
Used in **Resource Allocation** to calculate a person's daily utilization for a specific task.
**Formula:** `Workload % = Effort Hours / (Duration Days × 8 Hours/Day)`
*   *Example*: 10-day task with 4 hours of effort = **5.0%** daily utilization.

### 5. Capacity Utilization (Dashboard)
Shows a member's total workload relative to their individual maximum capacity.
**Formula:** `Utilization % = (Σ Active Workload percentages) / Max Capacity`

*   **Critical Alert**: If Utilization > 100% (or their specific max, e.g., 0.8), the dashboard highlights the resource in **RED**.

---

## 💡 Practical Examples

### Scenario A: Standard Task
*   **Resource**: Jane (Max Capacity: 1.0, Rate: Rp 600k)
*   **Task**: Process Design (Complexity: Medium - 10 days / 80 hours)
*   **Start**: Oct 1st
*   **Calculation**:
    *   **End Date**: Oct 15th (10 working days, skipping 2 weekends)
    *   **Total Cost**: 80 hrs * 600k = Rp 48,000,000
    *   **Workload**: 40% (assigned to Jane)

### Scenario B: Over-Allocation Alert
*   **Resource**: Bob (Max Capacity: 0.8)
*   **Current Load**: 3 tasks at 30% each (Total 90%)
*   **Dashboard View**: Bob's bar will show **112.5%** (90 / 80) and appear **RED**, indicating he has exceeded his 0.8 bandwidth.

---

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Vanilla CSS (Custom tokens, Glassmorphism elements)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Logic**: date-fns
- **State Management**: React Context API
- 

## Revise
- Set SLA time mapping to Priority
- Remove Complexcity Calculation except for Project Task
- Align the color for Member Load Status
- Check modal for Date Picker Implementation
- Update the Date Filter Function on Dashboard View
- Add Search Demand Number if Support Issue (since likely issue related to demand) not mandatory
- If Task Allocation phase selected, calculate the span until phase Completed
- update At Capacity word into Over Capacity to handle more than >100% Utilize
