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

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, LayoutDashboard, Calendar, Users, ListPlus, Activity, TrendingUp, Clock } from "lucide-react"

// Chart colors - Indigo, Emerald, Amber, Rose, Sky, Slate
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9', '#64748b', '#8b5cf6'];

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

    // Calculate stats
    const activeCount = allocations.filter(a => a.taskName !== 'Completed' && a.taskName !== 'Idle').length;
    const completedCount = allocations.filter(a => a.taskName === 'Completed').length;

    // Chart data: Workload by team member (as % of capacity)
    const workloadChartData = useMemo(() => {
        return memberWorkloads.map(w => ({
            name: w.name,
            workload: parseFloat(w.percentage.toFixed(1)),
            capacity: 100, // Reference line at 100%
            color: w.percentage > 100 ? '#f43f5e' : '#4f46e5'
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
            { name: 'Project', value: stats.project, color: '#4f46e5' },
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

    // Capacity Heatmap Data - next 7 days (for all members)
    const heatmapData = useMemo(() => {
        const days = [];
        const today = new Date();

        // Generate next 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push({
                date: date,
                label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                shortLabel: date.toLocaleDateString('en-US', { weekday: 'narrow' })
            });
        }

        // Calculate load per member per day (all members now)
        return members.map(member => {
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
        <div className="workload-summary space-y-8 animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-glass-bg glass-effect p-4 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm rounded-full bg-indigo-500/10 px-2.5 py-0.5 font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Analytical Overview</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-500/10 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                        <label className="text-xs font-bold text-slate-500 px-2 uppercase tracking-tight">Period:</label>
                        <input
                            type="date"
                            className="bg-transparent border border-slate-200 dark:border-slate-800 rounded-md py-1 px-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-slate-700 dark:text-slate-200"
                            value={dateFilter.start}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                        />
                        <span className="text-slate-400 text-[10px] font-bold">TO</span>
                        <input
                            type="date"
                            className="bg-transparent border border-slate-200 dark:border-slate-800 rounded-md py-1 px-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-slate-700 dark:text-slate-200"
                            value={dateFilter.end}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                        />
                    </div>
                    {(dateFilter.start || dateFilter.end) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => setDateFilter({ start: '', end: '' })}
                        >
                            <span className="text-lg leading-none">×</span>
                        </Button>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl shadow-sm border-slate-200" onClick={() => navigate('/allocation')}>
                        <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-500" />
                        View tasks
                    </Button>
                    <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100" onClick={() => navigate('/allocation?action=add')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add allocation
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <Card className="border-none shadow-md shadow-indigo-500/5 bg-glass-bg backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Team Members</CardTitle>
                        <Users className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{members.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Active resources</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md shadow-indigo-500/5 bg-glass-bg backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Allocations</CardTitle>
                        <ListPlus className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{allocations.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Task assignments</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md shadow-indigo-500/5 bg-glass-bg backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">In Progress</CardTitle>
                        <Activity className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Active tasks</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md shadow-indigo-500/5 bg-glass-bg backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Cost</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate text-slate-900 dark:text-white">{formatCurrency(totalCost)}</div>
                        <p className="text-xs text-slate-500 mt-1">Project budget</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md shadow-indigo-500/5 bg-glass-bg backdrop-blur-md border border-indigo-500/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Availability</CardTitle>
                        <Clock className="h-4 w-4 text-cyan-500" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                            <span className="text-xs font-semibold text-emerald-700">{availabilitySummary.availableNow} available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                            <span className="text-xs font-medium text-slate-600">{availabilitySummary.fullyBooked} Booked</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

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
                    {/* Workload by Member - Horizontal Bar Chart */}
                    <div className="chart-card">
                        <h3 className="chart-title">Workload Capacity Utilization (%)</h3>
                        <div className="chart-container chart-container-tall">
                            {workloadChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={Math.max(250, workloadChartData.length * 36)}>
                                    <BarChart
                                        data={workloadChartData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                                    >
                                        <XAxis
                                            type="number"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            domain={[0, (dataMax) => Math.max(100, dataMax + 10)]}
                                            tickFormatter={(value) => `${value}%`}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            width={75}
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
                                        <Bar
                                            dataKey="workload"
                                            name="Workload %"
                                            radius={[0, 4, 4, 0]}
                                            onClick={handleMemberClick}
                                            style={{ cursor: 'pointer' }}
                                            barSize={20}
                                        >
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
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => {
                                                if (value === 0) return 'Rp 0';
                                                if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
                                                if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}Jt`;
                                                if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}Rb`;
                                                return `Rp ${value}`;
                                            }}
                                            width={70}
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

            {/* Team Overview - Compact Heatmap Cards */}
            <section className="section team-overview-section">
                <div className="section-header">
                    <h2 className="section-title">Team Overview</h2>
                    <p className="section-subtitle">7-day availability at a glance (max 5 concurrent tasks per member)</p>
                </div>

                <div className="member-grid compact">
                    {members.map(member => {
                        const workload = memberWorkloads.find(w => w.name === member.name);
                        const availability = taskAvailability.find(a => a.memberName === member.name);
                        const memberHeatmap = heatmapData.find(h => h.member === member.name);

                        return (
                            <div
                                key={member.id}
                                className={`member-card-compact status-${availability?.status || 'available'}`}
                                onClick={() => navigate(`/member/${member.id}`)}
                                title="Click to view task history"
                            >
                                {/* Header: Avatar, Name, Status Badge */}
                                <div className="card-header-compact">
                                    <div className="member-avatar-compact">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="member-info-compact">
                                        <h3 className="member-name-compact">{member.name}</h3>
                                        <span className="member-role-compact">
                                            {defaultRoleTiers[member.type]?.name || member.type}
                                        </span>
                                    </div>
                                    <div className={`status-badge-compact ${availability?.status || 'available'}`}>
                                        {availability?.hasCapacity ? 'Available' : 'Busy'}
                                    </div>
                                </div>

                                {/* Mini Heatmap - 7 days */}
                                <div className="mini-heatmap">
                                    <span className="heatmap-label">Next 7 days:</span>
                                    <div className="heatmap-cells">
                                        {memberHeatmap?.days.map((day, idx) => (
                                            <div
                                                key={idx}
                                                className={`heatmap-cell-mini ${day.status}`}
                                                title={`${day.date}: ${day.count} task${day.count !== 1 ? 's' : ''}`}
                                            >
                                                {day.status === 'leave' ? '—' : (day.count > 0 ? day.count : '')}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="heatmap-days-labels">
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].slice(0, memberHeatmap?.days.length || 0).map((d, i) => (
                                            <span key={i} className="day-label">{memberHeatmap?.days[i]?.shortLabel || d}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className="stats-row-compact">
                                    <div className="stat-item-compact">
                                        <span className="stat-value-compact">{availability?.currentTaskCount || 0}/{availability?.maxConcurrentTasks || 5}</span>
                                        <span className="stat-label-compact">tasks</span>
                                    </div>
                                    <div className="stat-divider"></div>
                                    <div className="stat-item-compact">
                                        <span className={`stat-value-compact ${workload?.percentage > 100 ? 'overloaded' : workload?.percentage > 80 ? 'high' : ''}`}>
                                            {workload?.percentage?.toFixed(0) || 0}%
                                        </span>
                                        <span className="stat-label-compact">utilized</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div >
    );
}
