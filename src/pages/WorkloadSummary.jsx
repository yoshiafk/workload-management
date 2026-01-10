/**
 * Workload Summary Page
 * Dashboard with statistics, team overview, charts, and task matrix
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getMemberWorkloads, formatCurrency, calculateMonthlyTrend, getMemberTaskAvailability } from '../utils/calculations';
import { defaultRoleTiers } from '../data';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area,
    CartesianGrid,
} from 'recharts';
import './WorkloadSummary.css';

// Chart colors
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function WorkloadSummary() {
    const { state } = useApp();
    const navigate = useNavigate();
    const { members, allocations, tasks, costs, complexity, leaves } = state;

    // Date range filter state
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

    // Filter allocations by date range
    const filteredAllocations = useMemo(() => {
        if (!dateFilter.start && !dateFilter.end) return allocations;

        return allocations.filter(a => {
            const taskStart = a.plan?.taskStart ? new Date(a.plan.taskStart) : null;
            const taskEnd = a.plan?.taskEnd ? new Date(a.plan.taskEnd) : null;

            if (!taskStart || !taskEnd) return false;

            const filterStart = dateFilter.start ? new Date(dateFilter.start) : null;
            const filterEnd = dateFilter.end ? new Date(dateFilter.end) : null;

            // Task overlaps with filter range
            if (filterStart && taskEnd < filterStart) return false;
            if (filterEnd && taskStart > filterEnd) return false;

            return true;
        });
    }, [allocations, dateFilter]);

    const memberWorkloads = getMemberWorkloads(filteredAllocations, members);

    // Calculate team task availability (max 5 concurrent tasks per member)
    const taskAvailability = useMemo(() => {
        return getMemberTaskAvailability(allocations, members, 5);
    }, [allocations, members]);

    // Get top 5 tasks for each member (sorted by end date)
    const getTopTasks = (memberName) => {
        return allocations
            .filter(a => a.resource === memberName && a.taskName !== 'Completed' && a.taskName !== 'Idle')
            .sort((a, b) => new Date(a.plan?.taskEnd) - new Date(b.plan?.taskEnd))
            .slice(0, 5);
    };

    // Count tasks by member for matrix
    const getTaskCount = (taskName, memberName) => {
        return allocations.filter(a =>
            a.taskName === taskName && a.resource === memberName
        ).length;
    };

    // Calculate stats
    const activeCount = allocations.filter(a => a.taskName !== 'Completed' && a.taskName !== 'Idle').length;
    const completedCount = allocations.filter(a => a.taskName === 'Completed').length;

    // Chart data: Workload by team member (as % of capacity)
    const workloadChartData = useMemo(() => {
        return memberWorkloads.map(w => ({
            name: w.name,
            workload: parseFloat(w.percentage.toFixed(1)),
            capacity: 100, // Reference line at 100%
            color: w.percentage > 100 ? '#ef4444' : '#3b82f6'
        }));
    }, [memberWorkloads]);

    // Chart data: Allocation by complexity (level)
    const complexityChartData = useMemo(() => {
        const stats = {};
        Object.keys(complexity).forEach(key => {
            stats[key.toLowerCase()] = 0;
        });

        filteredAllocations.forEach(a => {
            const comp = a.complexity?.toLowerCase();
            if (comp && stats.hasOwnProperty(comp)) {
                stats[comp]++;
            }
        });

        return Object.values(complexity).map(level => ({
            name: level.label,
            value: stats[level.level.toLowerCase()] || 0,
            color: level.color
        })).filter(d => d.value > 0);
    }, [filteredAllocations, complexity]);

    // Chart data: Allocation by work category (Project/Support/Maintenance)
    const workCategoryChartData = useMemo(() => {
        const stats = { project: 0, support: 0, maintenance: 0 };
        filteredAllocations.forEach(a => {
            const cat = a.category?.toLowerCase() || 'project';
            if (stats.hasOwnProperty(cat)) {
                stats[cat]++;
            }
        });

        return [
            { name: 'Project', value: stats.project, color: '#3b82f6' },
            { name: 'Support', value: stats.support, color: '#10b981' },
            { name: 'Maintenance', value: stats.maintenance, color: '#f59e0b' }
        ].filter(d => d.value > 0);
    }, [filteredAllocations]);

    // Chart data: Cost Trend
    const costTrendData = useMemo(() => {
        return calculateMonthlyTrend(filteredAllocations);
    }, [filteredAllocations]);

    // Chart data: Allocation by Phase
    const phaseChartData = useMemo(() => {
        const phases = {};
        filteredAllocations.forEach(a => {
            const phase = a.phase || 'Unspecified';
            phases[phase] = (phases[phase] || 0) + 1;
        });

        return Object.entries(phases)
            .map(([name, value], index) => ({
                name,
                value,
                color: COLORS[index % COLORS.length]
            }))
            .filter(d => d.value > 0);
    }, [filteredAllocations]);

    // Capacity Heatmap Data - next 7 days
    const heatmapData = useMemo(() => {
        const days = [];
        const today = new Date();

        // Generate next 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push({
                date: date,
                label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            });
        }

        // Calculate load per member per day
        return members.slice(0, 5).map(member => {
            const memberAllocations = allocations.filter(a => a.resource === member.name);

            // Get member's leaves
            const memberLeaves = (leaves || []).filter(l => l.memberName === member.name);

            const daysData = days.map(day => {
                // Check if member is on leave this day
                const isOnLeave = memberLeaves.some(l => {
                    const start = l.startDate ? new Date(l.startDate) : null;
                    const end = l.endDate ? new Date(l.endDate) : null;
                    if (!start || !end) return false;
                    const dayOnly = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
                    const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                    const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                    return dayOnly >= startOnly && dayOnly <= endOnly;
                });

                if (isOnLeave) {
                    return {
                        date: day.label,
                        count: 0,
                        status: 'leave'
                    };
                }

                // Count active allocations on this day
                const activeCount = memberAllocations.filter(a => {
                    const start = a.plan?.taskStart ? new Date(a.plan.taskStart) : null;
                    const end = a.plan?.taskEnd ? new Date(a.plan.taskEnd) : null;
                    if (!start || !end) return false;
                    return day.date >= start && day.date <= end;
                }).length;

                // Determine status
                let status = 'available';
                if (activeCount >= 5) status = 'at-capacity';
                else if (activeCount >= 3) status = 'limited';
                else if (activeCount >= 1) status = 'busy';

                return {
                    date: day.label,
                    count: activeCount,
                    status
                };
            });

            return {
                member: member.name,
                days: daysData
            };
        });
    }, [members, allocations, leaves]);

    // Total project cost
    const totalCost = useMemo(() => {
        return allocations.reduce((sum, a) => sum + (a.plan?.costProject || 0), 0);
    }, [allocations]);

    // Team Availability Summary
    const availabilitySummary = useMemo(() => {
        const now = new Date();
        let availableNow = 0;
        let fullyBooked = 0;
        let nextAvailable = null;

        taskAvailability.forEach(member => {
            if (member.hasCapacity) {
                availableNow++;
            } else {
                fullyBooked++;
                // Track next available date
                if (member.availableFrom) {
                    const availDate = new Date(member.availableFrom);
                    if (!nextAvailable || availDate < nextAvailable.date) {
                        nextAvailable = {
                            name: member.memberName,
                            date: availDate,
                        };
                    }
                }
            }
        });

        return { availableNow, fullyBooked, nextAvailable };
    }, [taskAvailability]);

    // Chart click handlers - navigate to filtered allocation view
    const handleCategoryClick = (data) => {
        if (data && data.name) {
            navigate(`/workload-management/allocation?category=${data.name.toLowerCase()}`);
        }
    };

    const handleComplexityClick = (data) => {
        if (data && data.name) {
            navigate(`/workload-management/allocation?complexity=${data.name.toLowerCase()}`);
        }
    };

    const handleMemberClick = (data) => {
        if (data && data.name) {
            navigate(`/workload-management/allocation?resource=${encodeURIComponent(data.name)}`);
        }
    };

    return (
        <div className="workload-summary">
            {/* Quick Actions Bar */}
            <div className="quick-actions-bar">
                <div className="quick-actions-left">
                    <h2 className="page-title">Dashboard</h2>
                    <span className="page-subtitle">Overview of team workload and resource utilization</span>
                </div>
                <div className="quick-actions-center">
                    <div className="date-filter">
                        <label className="date-filter-label">Date Range:</label>
                        <input
                            type="date"
                            className="date-input"
                            value={dateFilter.start}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                        />
                        <span className="date-separator">to</span>
                        <input
                            type="date"
                            className="date-input"
                            value={dateFilter.end}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                        />
                        {(dateFilter.start || dateFilter.end) && (
                            <button
                                className="date-clear-btn"
                                onClick={() => setDateFilter({ start: '', end: '' })}
                                title="Clear dates"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
                <div className="quick-actions-right">
                    <a href="/workload-management/allocation" className="btn btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M3 9h18" />
                        </svg>
                        View All Tasks
                    </a>
                    <a href="/workload-management/allocation?action=add" className="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Allocation
                    </a>
                </div>
            </div>

            {/* Stats Overview */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon-wrapper blue">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Team Members</span>
                            <div className="stat-value">{members.length}</div>
                            <div className="stat-footer">Active resources</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper purple">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                <rect x="8" y="2" width="8" height="4" rx="1" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Total Allocations</span>
                            <div className="stat-value">{allocations.length}</div>
                            <div className="stat-footer">Task assignments</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper amber">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">In Progress</span>
                            <div className="stat-value">{activeCount}</div>
                            <div className="stat-footer">Active tasks</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper green">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
                                <path d="M16 12h5" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Total Cost</span>
                            <div className="stat-value">{formatCurrency(totalCost)}</div>
                            <div className="stat-footer">Project costs</div>
                        </div>
                    </div>

                    {/* Team Availability Summary Card */}
                    <div className="stat-card availability-card">
                        <div className="stat-icon-wrapper cyan">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Team Availability</span>
                            <div className="availability-details">
                                <div className="availability-row available">
                                    <span className="availability-dot"></span>
                                    <span>{availabilitySummary.availableNow} Available Now</span>
                                </div>
                                <div className="availability-row booked">
                                    <span className="availability-dot"></span>
                                    <span>{availabilitySummary.fullyBooked} Fully Booked</span>
                                </div>
                                {availabilitySummary.nextAvailable && (
                                    <div className="availability-row next">
                                        <span className="availability-label">Next:</span>
                                        <span>{availabilitySummary.nextAvailable.name}</span>
                                        <span className="availability-date">
                                            {availabilitySummary.nextAvailable.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Capacity Heatmap Section */}
            <section className="heatmap-section">
                <div className="heatmap-card">
                    <div className="heatmap-header">
                        <h3 className="heatmap-title">Team Capacity - Next 7 Days</h3>
                        <div className="heatmap-legend">
                            <span className="legend-item"><span className="legend-dot available"></span> Available</span>
                            <span className="legend-item"><span className="legend-dot busy"></span> Busy</span>
                            <span className="legend-item"><span className="legend-dot limited"></span> Limited</span>
                            <span className="legend-item"><span className="legend-dot at-capacity"></span> At Capacity</span>
                            <span className="legend-item"><span className="legend-dot leave"></span> Leave</span>
                        </div>
                    </div>
                    <div className="heatmap-grid">
                        <div className="heatmap-row heatmap-header-row">
                            <div className="heatmap-cell heatmap-member-cell">Member</div>
                            {heatmapData[0]?.days.map((day, idx) => (
                                <div key={idx} className="heatmap-cell heatmap-day-header">
                                    {day.date}
                                </div>
                            ))}
                        </div>
                        {heatmapData.map((row, idx) => (
                            <div key={idx} className="heatmap-row">
                                <div className="heatmap-cell heatmap-member-cell">{row.member}</div>
                                {row.days.map((day, dayIdx) => (
                                    <div
                                        key={dayIdx}
                                        className={`heatmap-cell heatmap-status-cell ${day.status}`}
                                        title={day.status === 'leave'
                                            ? `${row.member}: On leave - ${day.date}`
                                            : `${row.member}: ${day.count} tasks on ${day.date}`}
                                    >
                                        {day.status === 'leave' ? 'Leave' : (day.count > 0 ? day.count : '')}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Charts Section */}
            <section className="section charts-section">
                <div className="charts-grid">
                    {/* Workload by Member */}
                    <div className="chart-card">
                        <h3 className="chart-title">Workload Capacity Utilization (%)</h3>
                        <div className="chart-container">
                            {workloadChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={workloadChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis
                                            dataKey="name"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            domain={[0, (dataMax) => Math.max(100, dataMax + 20)]}
                                            tickFormatter={(value) => `${value}%`}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`${value}%`, 'Workload']}
                                            contentStyle={{
                                                background: 'var(--color-bg-card)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                            }}
                                        />
                                        <Bar dataKey="workload" name="Workload %" radius={[4, 4, 0, 0]} onClick={handleMemberClick} style={{ cursor: 'pointer' }}>
                                            {workloadChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="chart-empty">
                                    <div className="chart-empty-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                        </svg>
                                    </div>
                                    <p className="chart-empty-text">No team workload data yet</p>
                                    <a href="/workload-management/allocation" className="chart-empty-cta">+ Add Allocation</a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Allocation by Work Category */}
                    <div className="chart-card">
                        <h3 className="chart-title">Work Category Distribution</h3>
                        <div className="chart-container">
                            {workCategoryChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={workCategoryChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                            onClick={handleCategoryClick}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {workCategoryChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--color-bg-card)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value) => <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="chart-empty">
                                    <div className="chart-empty-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="7" height="7" />
                                            <rect x="14" y="3" width="7" height="7" />
                                            <rect x="14" y="14" width="7" height="7" />
                                            <rect x="3" y="14" width="7" height="7" />
                                        </svg>
                                    </div>
                                    <p className="chart-empty-text">No category data yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Allocation by Complexity */}
                    <div className="chart-card">
                        <h3 className="chart-title">Allocation by Complexity</h3>
                        <div className="chart-container">
                            {complexityChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={complexityChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                            onClick={handleComplexityClick}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {complexityChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--color-bg-card)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value) => <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="chart-empty">
                                    <div className="chart-empty-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </div>
                                    <p className="chart-empty-text">No complexity data yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cost Trend */}
                    <div className="chart-card">
                        <h3 className="chart-title">Projected Monthly Cost</h3>
                        <div className="chart-container">
                            {costTrendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={costTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                        <XAxis
                                            dataKey="month"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value / 1000000}M`}
                                        />
                                        <Tooltip
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{
                                                background: 'var(--color-bg-card)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="cost"
                                            stroke="#8b5cf6"
                                            fillOpacity={1}
                                            fill="url(#colorCost)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="chart-empty">
                                    <div className="chart-empty-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="1" x2="12" y2="23" />
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                        </svg>
                                    </div>
                                    <p className="chart-empty-text">No cost data available</p>
                                    <a href="/workload-management/library/costs" className="chart-empty-cta">Setup Costs</a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Allocation by Phase */}
                    <div className="chart-card">
                        <h3 className="chart-title">Allocation by Phase</h3>
                        <div className="chart-container">
                            {phaseChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={phaseChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {phaseChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--color-bg-card)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value) => <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="chart-empty">
                                    <div className="chart-empty-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                        </svg>
                                    </div>
                                    <p className="chart-empty-text">No phase data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Overview with Task Availability */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-title">Team Overview</h2>
                    <p className="section-subtitle">Task assignments and availability (max 5 concurrent tasks per member)</p>
                </div>

                <div className="member-grid">
                    {members.map(member => {
                        const topTasks = getTopTasks(member.name);
                        const workload = memberWorkloads.find(w => w.name === member.name);
                        const availability = taskAvailability.find(a => a.memberName === member.name);

                        return (
                            <div
                                key={member.id}
                                className={`member-card status-${availability?.status || 'available'} clickable`}
                                onClick={() => navigate(`/member/${member.id}`)}
                                title="Click to view task history"
                            >
                                <div className="member-header">
                                    <div className="member-avatar">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="member-info">
                                        <h3 className="member-name">{member.name}</h3>
                                        <span className="member-role">{defaultRoleTiers[member.type]?.name || member.type}</span>
                                    </div>
                                    <div className={`task-count-badge ${availability?.status || 'available'}`}>
                                        {availability?.currentTaskCount || 0}/{availability?.maxConcurrentTasks || 5}
                                    </div>
                                </div>

                                <div className="capacity-container">
                                    <div className="capacity-header">
                                        <span className={`utilization-badge ${workload?.percentage > 100 ? 'overloaded' : workload?.percentage > 80 ? 'high' : ''}`}>
                                            {workload?.percentage?.toFixed(0) || 0}% Utilized
                                            {workload?.percentage > 100 && (
                                                <svg className="overload-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                                </svg>
                                            )}
                                        </span>
                                    </div>
                                    <div className="capacity-bar-wrapper">
                                        <div
                                            className={`capacity-bar ${workload?.percentage > 100 ? 'overloaded' : ''}`}
                                            style={{ width: `${Math.min(100, workload?.percentage || 0)}%` }}
                                        ></div>
                                    </div>
                                    <div className="capacity-stats">
                                        <span>Current: {workload?.currentHours?.toFixed(1)}h</span>
                                        <span>Max: {workload?.maxHours?.toFixed(1)}h</span>
                                    </div>
                                </div>

                                <div className="task-list">
                                    {topTasks.length > 0 ? (
                                        topTasks.map((task, index) => (
                                            <div key={task.id} className="task-item">
                                                <div className="task-content">
                                                    <span className="task-name">{task.activityName}</span>
                                                    <span className="task-phase">{task.phase}</span>
                                                </div>
                                                <span className="task-date">
                                                    {task.plan?.taskEnd
                                                        ? new Date(task.plan.taskEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                        : '—'
                                                    }
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <p>No active tasks</p>
                                        </div>
                                    )}
                                </div>

                                {/* Availability Footer */}
                                <div className="availability-footer">
                                    <span className="availability-label">Available for new task:</span>
                                    {availability?.hasCapacity ? (
                                        <span className="available-now">Now</span>
                                    ) : (
                                        <span className="available-date">
                                            {availability?.availableFrom
                                                ? new Date(availability.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                : '—'
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Task Allocation Matrix */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-title">Task Distribution</h2>
                    <p className="section-subtitle">Allocation count by task type and team member</p>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="th-task">Task Type</th>
                                {members.map(member => (
                                    <th key={member.id} className="th-member">{member.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.filter(t => t.name !== 'Idle' && t.name !== 'Completed').map(task => (
                                <tr key={task.id}>
                                    <td className="td-task">{task.name}</td>
                                    {members.map(member => {
                                        const count = getTaskCount(task.name, member.name);
                                        return (
                                            <td key={member.id} className="td-count">
                                                {count > 0 ? (
                                                    <span className="count-badge">{count}</span>
                                                ) : (
                                                    <span className="count-empty">—</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
