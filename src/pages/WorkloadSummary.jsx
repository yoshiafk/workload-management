import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
    getMemberWorkloads,
    formatCurrency,
    calculateMonthlyTrend,
    getMemberTaskAvailability
} from '../utils/calculations';
import { resourceAllocationEngine } from '../utils/resourceAllocation';
import { dashboardEngine } from '../utils/dashboardEngine';

import { StatCard } from "@/components/ui/stat-card";
import {
    CapacityHeatmap,
    WorkloadUtilizationChart,
    DistributionPieChart,
    ProjectedCostChart,
    TeamPreview
} from "@/components/dashboard";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Button } from "@/components/ui/button";
import { DatePickerModal } from "@/components/ui/DatePickerModal";
import { Badge } from "@/components/ui/badge";
import { useDensity } from "@/context/DensityContext";
import {
    Plus,
    LayoutDashboard,
    Users,
    ListPlus,
    Activity,
    TrendingUp,
    Clock,
    FilterX,
    Download,
    Calendar,
    Filter
} from "lucide-react";
import { exportElementAsPng } from "@/utils/export";
import { cn } from "@/lib/utils"; // Assuming cn utility is available

import './WorkloadSummary.css';

// Animation variants for staggered entrance
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1.0]
        }
    }
};

export default function WorkloadSummary() {
    const { state } = useApp();
    const navigate = useNavigate();
    const { isDense } = useDensity();
    const { members, allocations, costs, complexity, leaves } = state;

    // Date range filter state
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [activeQuickFilter, setActiveQuickFilter] = useState(null);

    // Filter allocations by date range using enhanced dashboard engine
    const filteredAllocations = useMemo(() => {
        if (!dateFilter.start && !dateFilter.end) {
            setActiveQuickFilter(null);
            return allocations;
        }

        return dashboardEngine.filterByDateRangeEnhanced(allocations, dateFilter, {
            includePartialOverlap: true,
            includeNoEndDate: true
        });
    }, [allocations, dateFilter]);

    // Get quick filter options
    const quickFilters = dashboardEngine.getQuickFilterOptions();

    // Handle date filter application
    const handleDateFilterApply = (newDateRange) => {
        setDateFilter(newDateRange);
        
        // Check if the applied range matches any quick filter
        const matchingQuickFilter = quickFilters.find(filter => 
            filter.start === newDateRange.start && filter.end === newDateRange.end
        );
        setActiveQuickFilter(matchingQuickFilter?.value || null);
    };

    // Handle quick filter selection
    const handleQuickFilterSelect = (filterValue) => {
        const filter = dashboardEngine.applyQuickFilter(filterValue);
        if (filter.start || filter.end) {
            setDateFilter({ start: filter.start, end: filter.end });
            setActiveQuickFilter(filterValue);
        }
    };

    // Clear date filter
    const handleClearDateFilter = () => {
        setDateFilter({ start: '', end: '' });
        setActiveQuickFilter(null);
    };

    // Get filter stats
    const filterStats = useMemo(() => {
        if (!dateFilter.start && !dateFilter.end) return null;
        return dashboardEngine.getDateRangeStats(allocations, dateFilter);
    }, [allocations, dateFilter]);

    const memberWorkloads = getMemberWorkloads(filteredAllocations, members);
    const taskAvailability = getMemberTaskAvailability(allocations, members, 5);

    // Calculate core stats
    const activeCount = allocations.filter(a => a.taskName !== 'Completed' && a.taskName !== 'Idle').length;
    const totalCost = allocations.reduce((sum, a) => sum + (a.plan?.costProject || 0), 0);

    // Availability Summary
    const availabilitySummary = useMemo(() => {
        let availableNow = 0;
        let fullyBooked = 0;

        taskAvailability.forEach(member => {
            if (member.hasCapacity) availableNow++;
            else fullyBooked++;
        });

        return { availableNow, fullyBooked };
    }, [taskAvailability]);

    // Chart Data: Workload Utilization
    const workloadChartData = useMemo(() => {
        return memberWorkloads.map(w => ({
            name: w.name,
            workload: parseFloat(w.percentage.toFixed(1))
        }));
    }, [memberWorkloads]);

    // Chart Data: Allocation by Complexity
    const complexityChartData = useMemo(() => {
        const stats = {};
        Object.keys(complexity).forEach(key => stats[key.toLowerCase()] = 0);

        filteredAllocations.forEach(a => {
            const comp = a.complexity?.toLowerCase();
            if (comp && stats.hasOwnProperty(comp)) stats[comp]++;
        });

        return Object.values(complexity).map(level => ({
            name: level.label,
            value: stats[level.level.toLowerCase()] || 0,
            color: level.color
        })).filter(d => d.value > 0);
    }, [filteredAllocations, complexity]);

    // Chart Data: Allocation by Work Category
    const workCategoryChartData = useMemo(() => {
        const stats = { project: 0, support: 0, maintenance: 0 };
        filteredAllocations.forEach(a => {
            const cat = a.category?.toLowerCase() || 'project';
            if (stats.hasOwnProperty(cat)) stats[cat]++;
        });

        return [
            { name: 'Project', value: stats.project, color: '#4f46e5' },
            { name: 'Support', value: stats.support, color: '#10b981' },
            { name: 'Maintenance', value: stats.maintenance, color: '#f59e0b' }
        ].filter(d => d.value > 0);
    }, [filteredAllocations]);

    // Chart Data: Cost Trend
    const costTrendData = useMemo(() => calculateMonthlyTrend(filteredAllocations), [filteredAllocations]);

    // heatmap data extraction
    const heatmapData = useMemo(() => {
        const days = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push({
                date: date,
                label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            });
        }

        return members.map(member => {
            const memberLeaves = (leaves || []).filter(l => l.memberName === member.name);

            const daysData = days.map(day => {
                const isOnLeave = memberLeaves.some(l => {
                    const start = l.startDate ? new Date(l.startDate) : null;
                    const end = l.endDate ? new Date(l.endDate) : null;
                    if (!start || !end) return false;
                    const dayOnly = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
                    const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                    const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                    return dayOnly >= startOnly && dayOnly <= endOnly;
                });

                if (isOnLeave) return { date: day.label, count: 0, status: 'leave' };

                // Use ResourceAllocation engine for accurate capacity calculation
                const dayStart = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
                const dayEnd = new Date(dayStart);
                dayEnd.setDate(dayEnd.getDate() + 1);
                
                const availability = resourceAllocationEngine.getResourceAvailability(
                    member.name, 
                    allocations, 
                    members, 
                    { startDate: dayStart.toISOString(), endDate: dayEnd.toISOString() }
                );

                // Count active tasks for display
                const memberAllocations = allocations.filter(a => a.resource === member.name);
                const activeCount = memberAllocations.filter(a => {
                    const start = a.plan?.taskStart ? new Date(a.plan.taskStart) : null;
                    const end = a.plan?.taskEnd ? new Date(a.plan.taskEnd) : null;
                    if (!start || !end) return false;
                    return day.date >= start && day.date <= end;
                }).length;

                return { 
                    date: day.label, 
                    count: activeCount, 
                    status: availability.status || 'available' 
                };
            });

            return { member: member.name, days: daysData };
        });
    }, [members, allocations, leaves]);

    // Sample sparkline data (based on allocations count over last few months)
    // In a real app, this would be computed from history
    const sparklineData = useMemo(() => [10, 15, 8, 12, 18, 14, 20], []);

    return (
        <div className={cn("workload-summary space-y-6 animate-in fade-in duration-700", isDense ? "space-y-4" : "space-y-6")}>
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 p-4 px-6 rounded-2xl border border-border/60 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">Workload Summary</h1>
                        <p className="text-xs text-muted-foreground font-medium">Core analytics and resource metrics</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Quick Filter Buttons */}
                    <div className="flex items-center gap-2">
                        {quickFilters.slice(0, 3).map((filter) => (
                            <Button
                                key={filter.value}
                                variant={activeQuickFilter === filter.value ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                    "h-8 px-3 text-xs gap-1.5",
                                    activeQuickFilter === filter.value && "ring-2 ring-primary/20"
                                )}
                                onClick={() => handleQuickFilterSelect(filter.value)}
                            >
                                <span>{filter.icon}</span>
                                {filter.label}
                            </Button>
                        ))}
                    </div>

                    {/* Date Filter Controls */}
                    <div className="flex items-center gap-2 bg-muted/50 p-1.5 px-3 rounded-xl border border-border/50">
                        <Filter className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Period</span>
                        
                        {/* Current Filter Display */}
                        {(dateFilter.start || dateFilter.end) ? (
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                    {dateFilter.start || 'Start'} - {dateFilter.end || 'End'}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 hover:bg-rose-500/20 text-rose-500"
                                    onClick={handleClearDateFilter}
                                >
                                    <FilterX className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <span className="text-xs text-muted-foreground">All Time</span>
                        )}

                        {/* Date Picker Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs gap-1"
                            onClick={() => setIsDatePickerOpen(true)}
                        >
                            <Calendar className="h-3 w-3" />
                            Custom
                        </Button>
                    </div>

                    {/* Filter Stats */}
                    {filterStats && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                                {filterStats.totalAllocations} tasks
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {filterStats.totalEffortHours}h effort
                            </Badge>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button className="rounded-xl shadow-md h-10 px-6 gap-2" onClick={() => navigate('/allocation?action=add')}>
                            <Plus className="h-4 w-4" />
                            Add Allocation
                        </Button>
                    </div>
                </div>
            </div>

            {/* KPI Stats */}
            <motion.div
                className={cn(
                    "grid gap-4",
                    isDense ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-5" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
                )}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <StatCard
                    title="Team Members"
                    value={members.length}
                    icon={Users}
                    color="primary"
                    variants={cardVariants}
                />
                <StatCard
                    title="Total Allocations"
                    value={allocations.length}
                    icon={ListPlus}
                    color="info"
                    sparklineData={sparklineData}
                    trend={12}
                    variants={cardVariants}
                />
                <StatCard
                    title="In Progress"
                    value={activeCount}
                    icon={Activity}
                    color="warning"
                    trend={-5}
                    variants={cardVariants}
                />
                <StatCard
                    title="Total Cost"
                    value={formatCurrency(totalCost)}
                    icon={TrendingUp}
                    color="success"
                    variants={cardVariants}
                />
                <StatCard
                    title="Team Capacity"
                    value={`${availabilitySummary.availableNow} / ${members.length}`}
                    subValue="Available Now"
                    icon={Clock}
                    color="primary"
                    variants={cardVariants}
                />
            </motion.div>

            {/* Capacity Heatmap */}
            <CollapsibleSection
                title="Team Capacity Heatmap"
                id="heatmap"
                headerActions={
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => exportElementAsPng('heatmap', 'team-capacity-heatmap.png')}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        <span className="text-xs">Export</span>
                    </Button>
                }
            >
                <div id="heatmap"> {/* Inner ID for cleaner capture */}
                    <CapacityHeatmap data={heatmapData} />
                </div>
            </CollapsibleSection>

            {/* Charts Grid */}
            <CollapsibleSection
                title="Dashboard Analytics"
                id="charts"
                headerActions={
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => exportElementAsPng('charts-export-view', 'dashboard-analytics.png')}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        <span className="text-xs">Export All</span>
                    </Button>
                }
            >
                <div id="charts-export-view" className={cn(
                    "grid gap-4 lg:gap-6",
                    isDense ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                )}>
                    <WorkloadUtilizationChart
                        data={workloadChartData}
                        onMemberClick={(data) => navigate(`/allocation?resource=${encodeURIComponent(data.name)}`)}
                    />
                    <DistributionPieChart
                        title="Work Category Distribution"
                        data={workCategoryChartData}
                        onCellClick={(data) => navigate(`/allocation?category=${data.name.toLowerCase()}`)}
                    />
                    <DistributionPieChart
                        title="Allocation by Complexity"
                        data={complexityChartData}
                        onCellClick={(data) => navigate(`/allocation?complexity=${data.name.toLowerCase()}`)}
                    />
                    <div className="md:col-span-2">
                        <ProjectedCostChart
                            data={costTrendData}
                            currencyFormatter={formatCurrency}
                        />
                    </div>
                </div>
            </CollapsibleSection>

            {/* Team Overview Section */}
            <CollapsibleSection title="Team Overview" id="team">
                <TeamPreview
                    members={members}
                    workloads={memberWorkloads}
                    availability={taskAvailability}
                    heatmap={heatmapData}
                />
            </CollapsibleSection>

            {/* Date Picker Modal */}
            <DatePickerModal
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onApply={handleDateFilterApply}
                initialDateRange={dateFilter}
                title="Filter Dashboard by Date Range"
                showStats={true}
                allocations={allocations}
            />
        </div>
    );
}
