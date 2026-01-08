/**
 * Workload Summary Page
 * Dashboard with statistics, team overview, charts, and task matrix
 */

import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getMemberWorkloads, formatCurrency, calculateMonthlyTrend } from '../utils/calculations';
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
    const { members, allocations, tasks, costs, complexity } = state;

    const memberWorkloads = getMemberWorkloads(allocations, members);

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

    // Chart data: Allocation by category
    const categoryChartData = useMemo(() => {
        const stats = {};
        Object.keys(complexity).forEach(key => {
            stats[key.toLowerCase()] = 0;
        });

        allocations.forEach(a => {
            const cat = a.category?.toLowerCase();
            if (cat && stats.hasOwnProperty(cat)) {
                stats[cat]++;
            }
        });

        return Object.values(complexity).map(level => ({
            name: level.label,
            value: stats[level.level.toLowerCase()] || 0,
            color: level.color
        })).filter(d => d.value > 0);
    }, [allocations, complexity]);

    // Chart data: Cost Trend
    const costTrendData = useMemo(() => {
        return calculateMonthlyTrend(allocations);
    }, [allocations]);

    // Chart data: Allocation by Phase
    const phaseChartData = useMemo(() => {
        const phases = {};
        allocations.forEach(a => {
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
    }, [allocations]);

    // Total project cost
    const totalCost = useMemo(() => {
        return allocations.reduce((sum, a) => sum + (a.plan?.costProject || 0), 0);
    }, [allocations]);

    return (
        <div className="workload-summary">
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
                                        <Bar dataKey="workload" name="Workload %" radius={[4, 4, 0, 0]}>
                                            {workloadChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="chart-empty">No allocation data yet</div>
                            )}
                        </div>
                    </div>

                    {/* Allocation by Category */}
                    <div className="chart-card">
                        <h3 className="chart-title">Allocation by Complexity</h3>
                        <div className="chart-container">
                            {categoryChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={categoryChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {categoryChartData.map((entry, index) => (
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
                                <div className="chart-empty">No allocation data yet</div>
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
                                <div className="chart-empty">No cost data available</div>
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
                                <div className="chart-empty">No phase data available</div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Tasks per Member */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-title">Team Overview</h2>
                    <p className="section-subtitle">Top upcoming tasks for each team member</p>
                </div>

                <div className="member-grid">
                    {members.map(member => {
                        const topTasks = getTopTasks(member.name);
                        const workload = memberWorkloads.find(w => w.name === member.name);

                        return (
                            <div key={member.id} className="member-card">
                                <div className="member-header">
                                    <div className="member-avatar">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="member-info">
                                        <h3 className="member-name">{member.name}</h3>
                                        <span className="member-role">{member.type === 'BA' ? 'Business Analyst' : 'Project Manager'}</span>
                                    </div>
                                    <div className="member-badge">
                                        <span className={`status-indicator ${workload?.percentage > 100 ? 'overloaded' : workload?.percentage > 0 ? 'active' : 'idle'}`}></span>
                                        {workload?.percentage?.toFixed(0)}% Capacity
                                    </div>
                                </div>

                                <div className="capacity-container">
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
                                                <span className="task-number">{index + 1}</span>
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
