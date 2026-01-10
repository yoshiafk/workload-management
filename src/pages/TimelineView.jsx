/**
 * Timeline View Page
 * Gantt-style visualization of task allocations per team member
 */

import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { defaultRoleTiers } from '../data';
import './TimelineView.css';

// Get date range for the timeline
const getDateRange = (startDate, days) => {
    const dates = [];
    const start = new Date(startDate);
    for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(date);
    }
    return dates;
};

// Format date for display
const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDayShort = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Check if date is weekend
const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
};

// Check if date is today
const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

export default function TimelineView() {
    const { state } = useApp();
    const { members, allocations, leaves, holidays } = state;

    // View state
    const [viewDays, setViewDays] = useState(14); // 14 days by default
    const [startOffset, setStartOffset] = useState(-3); // Start 3 days before today

    // Calculate date range
    const dateRange = useMemo(() => {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + startOffset);
        return getDateRange(startDate, viewDays);
    }, [viewDays, startOffset]);

    // Get allocations for a member on a specific date
    const getMemberTasks = (memberName, date) => {
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        return allocations.filter(a => {
            if (a.resource !== memberName) return false;
            if (a.taskName === 'Idle' || a.taskName === 'Completed') return false;

            const start = a.plan?.taskStart ? new Date(a.plan.taskStart) : null;
            const end = a.plan?.taskEnd ? new Date(a.plan.taskEnd) : null;

            if (!start || !end) return false;

            const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());

            return dateOnly >= startOnly && dateOnly <= endOnly;
        });
    };

    // Check if date is a holiday
    const getHoliday = (date) => {
        const dateString = date.toISOString().split('T')[0];
        return (holidays || []).find(h => h.date === dateString);
    };

    // Check if member is on leave
    const isOnLeave = (memberName, date) => {
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        return (leaves || []).some(l => {
            if (l.memberName !== memberName) return false;

            const start = l.startDate ? new Date(l.startDate) : null;
            const end = l.endDate ? new Date(l.endDate) : null;

            if (!start || !end) return false;

            const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());

            return dateOnly >= startOnly && dateOnly <= endOnly;
        });
    };

    // Get task color based on category
    const getTaskColor = (task) => {
        const colors = {
            'Project': '#3b82f6',
            'Support': '#10b981',
            'Maintenance': '#f59e0b',
        };
        return colors[task.category] || '#8b5cf6';
    };

    // Navigation handlers
    const handlePrevious = () => {
        setStartOffset(prev => prev - 7);
    };

    const handleNext = () => {
        setStartOffset(prev => prev + 7);
    };

    const handleToday = () => {
        setStartOffset(-3);
    };

    // Active members only
    const activeMembers = members.filter(m => m.isActive);

    return (
        <div className="timeline-page">
            {/* Header */}
            <div className="timeline-header">
                <div className="timeline-header-left">
                    <h2>Timeline View</h2>
                    <span className="timeline-subtitle">
                        {formatDate(dateRange[0])} — {formatDate(dateRange[dateRange.length - 1])}
                    </span>
                </div>
                <div className="timeline-controls">
                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${viewDays === 7 ? 'active' : ''}`}
                            onClick={() => setViewDays(7)}
                        >
                            1 Week
                        </button>
                        <button
                            className={`toggle-btn ${viewDays === 14 ? 'active' : ''}`}
                            onClick={() => setViewDays(14)}
                        >
                            2 Weeks
                        </button>
                    </div>
                    <div className="nav-buttons">
                        <button className="nav-btn" onClick={handlePrevious}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button className="nav-btn today-btn" onClick={handleToday}>
                            Today
                        </button>
                        <button className="nav-btn" onClick={handleNext}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Timeline Grid */}
            <div className="timeline-container">
                <div className="timeline-grid">
                    {/* Header Row - Dates */}
                    <div className="timeline-row timeline-header-row">
                        <div className="timeline-member-cell">Team Member</div>
                        {dateRange.map((date, idx) => {
                            const holiday = getHoliday(date);
                            return (
                                <div
                                    key={idx}
                                    className={`timeline-date-cell ${isWeekend(date) ? 'weekend' : ''} ${isToday(date) ? 'today' : ''} ${holiday ? 'holiday' : ''}`}
                                    title={holiday ? holiday.name : undefined}
                                >
                                    <span className="date-day">{formatDayShort(date)}</span>
                                    <span className="date-num">{date.getDate()}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Member Rows */}
                    {activeMembers.map(member => (
                        <div key={member.id} className="timeline-row">
                            <div className="timeline-member-cell">
                                <div className="member-avatar-small">
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="member-info-compact">
                                    <span className="member-name-text">{member.name}</span>
                                    <span className="member-role-text">
                                        {defaultRoleTiers[member.type]?.name || member.type}
                                    </span>
                                </div>
                            </div>

                            {dateRange.map((date, idx) => {
                                const tasks = getMemberTasks(member.name, date);
                                const onLeave = isOnLeave(member.name, date);
                                const holiday = getHoliday(date);
                                const taskCount = tasks.length;

                                let cellClass = 'timeline-task-cell';
                                if (isWeekend(date)) cellClass += ' weekend';
                                if (isToday(date)) cellClass += ' today';
                                if (holiday) cellClass += ' holiday';
                                if (onLeave) cellClass += ' leave';
                                else if (taskCount >= 5) cellClass += ' overloaded';
                                else if (taskCount >= 3) cellClass += ' busy';
                                else if (taskCount > 0) cellClass += ' active';

                                return (
                                    <div
                                        key={idx}
                                        className={cellClass}
                                        title={
                                            holiday
                                                ? `Holiday: ${holiday.name}`
                                                : onLeave
                                                    ? `${member.name}: On leave`
                                                    : tasks.length > 0
                                                        ? `${member.name}: ${tasks.length} task(s)\n${tasks.map(t => t.activityName).join('\n')}`
                                                        : `${member.name}: Available`
                                        }
                                    >
                                        {onLeave ? (
                                            <span className="leave-text">Leave</span>
                                        ) : taskCount > 0 ? (
                                            <div className="task-count-indicator">
                                                <span className="task-dots">
                                                    {Array(Math.min(taskCount, 5)).fill(null).map((_, i) => (
                                                        <span
                                                            key={i}
                                                            className="task-dot"
                                                            style={{ backgroundColor: getTaskColor(tasks[i] || tasks[0]) }}
                                                        />
                                                    ))}
                                                </span>
                                                {taskCount > 5 && (
                                                    <span className="more-tasks">+{taskCount - 5}</span>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="timeline-legend">
                <div className="legend-item">
                    <span className="legend-dot available"></span>
                    <span>Available</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot active"></span>
                    <span>1-2 Tasks</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot busy"></span>
                    <span>3-4 Tasks</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot overloaded"></span>
                    <span>5+ Tasks</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot leave"></span>
                    <span>On Leave</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot holiday"></span>
                    <span>Holiday</span>
                </div>
            </div>
        </div>
    );
}
