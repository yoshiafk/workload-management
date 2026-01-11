import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { defaultRoleTiers } from '../data';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Info,
    Calendar,
    Users,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
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
            'Project': '#4f46e5',    /* indigo-600 */
            'Support': '#10b981',    /* emerald-500 */
            'Maintenance': '#f59e0b', /* amber-500 */
        };
        return colors[task.category] || '#8b5cf6';
    };

    // Navigation handlers
    const handlePrevious = () => setStartOffset(prev => prev - 7);
    const handleNext = () => setStartOffset(prev => prev + 7);
    const handleToday = () => setStartOffset(-3);

    // Active members only
    const activeMembers = members.filter(m => m.isActive);

    return (
        <TooltipProvider>
            <div className="timeline-page space-y-6 animate-in fade-in duration-500">
                {/* Modern Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 glass-effect p-6 rounded-2xl border border-white/20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-100">
                            <CalendarDays className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Resource Timeline</h2>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(dateRange[0])} — {formatDate(dateRange[dateRange.length - 1])}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
                            <Button
                                variant={viewDays === 7 ? "secondary" : "ghost"}
                                size="sm"
                                className={cn("rounded-lg h-8 text-xs font-bold", viewDays === 7 && "bg-white shadow-sm")}
                                onClick={() => setViewDays(7)}
                            >
                                1 Week
                            </Button>
                            <Button
                                variant={viewDays === 14 ? "secondary" : "ghost"}
                                size="sm"
                                className={cn("rounded-lg h-8 text-xs font-bold", viewDays === 14 && "bg-white shadow-sm")}
                                onClick={() => setViewDays(14)}
                            >
                                2 Weeks
                            </Button>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" onClick={handlePrevious} className="h-9 w-9 rounded-lg">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleToday} className="h-9 font-bold px-4 rounded-lg">
                                Today
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNext} className="h-9 w-9 rounded-lg">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Timeline Visualization */}
                <div className="bg-white/40 glass-effect rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Date Header Row */}
                            <div className="flex border-b border-slate-200/60 bg-slate-50/50">
                                <div className="w-64 p-4 flex items-center gap-2 border-r border-slate-200/60">
                                    <Users className="h-4 w-4 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Team Member</span>
                                </div>
                                <div className="flex-1 flex">
                                    {dateRange.map((date, idx) => {
                                        const holiday = getHoliday(date);
                                        return (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "flex-1 flex flex-col items-center justify-center py-3 border-r border-slate-200/60 transition-colors",
                                                    isWeekend(date) && "bg-slate-100/30",
                                                    isToday(date) && "bg-indigo-50/50",
                                                    holiday && "bg-emerald-50/50"
                                                )}
                                            >
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">
                                                    {formatDayShort(date)}
                                                </span>
                                                <div className={cn(
                                                    "h-7 w-7 rounded-lg flex items-center justify-center text-sm font-black tabular-nums transition-all",
                                                    isToday(date) ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-600"
                                                )}>
                                                    {date.getDate()}
                                                </div>
                                                {holiday && (
                                                    <Badge className="mt-1 h-1 w-1 p-0 bg-emerald-500 rounded-full" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Member Rows */}
                            <div className="divide-y divide-slate-100">
                                {activeMembers.map(member => (
                                    <div key={member.id} className="flex hover:bg-white/20 transition-colors group">
                                        <div className="w-64 p-4 flex items-center gap-3 border-r border-slate-100 group-hover:bg-slate-50/30 transition-colors">
                                            <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                                                <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-bold text-xs uppercase">
                                                    {member.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-slate-800 truncate leading-tight">{member.name}</span>
                                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight truncate">
                                                    {defaultRoleTiers[member.type]?.name || member.type}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex">
                                            {dateRange.map((date, idx) => {
                                                const tasks = getMemberTasks(member.name, date);
                                                const onLeave = isOnLeave(member.name, date);
                                                const holiday = getHoliday(date);
                                                const taskCount = tasks.length;

                                                return (
                                                    <Tooltip key={idx}>
                                                        <TooltipTrigger asChild>
                                                            <div className={cn(
                                                                "flex-1 min-h-[56px] border-r border-slate-100 p-1 flex flex-col items-center justify-center cursor-pointer transition-all",
                                                                isWeekend(date) && "bg-slate-50/20",
                                                                onLeave && "bg-rose-50/40",
                                                                holiday && "bg-emerald-50/20",
                                                                taskCount > 0 && "group-hover:opacity-100"
                                                            )}>
                                                                {onLeave ? (
                                                                    <div className="w-full h-full rounded-md flex items-center justify-center">
                                                                        <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-100 border-rose-200 text-[8px] font-extrabold px-1.5 h-4 uppercase">Leave</Badge>
                                                                    </div>
                                                                ) : taskCount > 0 ? (
                                                                    <div className="flex flex-wrap justify-center gap-1 px-1">
                                                                        {tasks.slice(0, 3).map((task, i) => (
                                                                            <div
                                                                                key={i}
                                                                                className="h-1.5 w-1.5 rounded-full shadow-sm ring-1 ring-white/50"
                                                                                style={{ backgroundColor: getTaskColor(task) }}
                                                                            />
                                                                        ))}
                                                                        {taskCount > 3 && (
                                                                            <span className="text-[8px] font-black text-slate-400 leading-none">+{taskCount - 3}</span>
                                                                        )}

                                                                        {/* Heatmap background for heavy loads */}
                                                                        <div className={cn(
                                                                            "absolute inset-0 z-[-1] opacity-10",
                                                                            taskCount >= 5 ? "bg-rose-500" :
                                                                                taskCount >= 3 ? "bg-amber-500" :
                                                                                    "bg-indigo-500"
                                                                        )} />
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 border-slate-800 text-white p-3 rounded-xl shadow-2xl min-w-[200px]" side="bottom">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                                                                    <span className="text-xs font-black uppercase tracking-widest opacity-50">{formatDate(date)}</span>
                                                                    {holiday && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] px-1.5 py-0">Holiday</Badge>}
                                                                </div>
                                                                {onLeave ? (
                                                                    <div className="flex items-center gap-2 text-rose-400 font-bold">
                                                                        <Info className="h-3 w-3" />
                                                                        <span className="text-sm">{member.name} is on leave</span>
                                                                    </div>
                                                                ) : taskCount > 0 ? (
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2 text-blue-400">
                                                                            <Activity className="h-3.5 w-3.5" />
                                                                            <span className="text-sm font-bold">{taskCount} Assigned Activities</span>
                                                                        </div>
                                                                        <ul className="space-y-1.5">
                                                                            {tasks.map((t, i) => (
                                                                                <li key={i} className="flex gap-2 text-[11px] leading-tight">
                                                                                    <span className="h-1 w-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: getTaskColor(t) }} />
                                                                                    <div>
                                                                                        <p className="font-bold text-white">{t.activityName}</p>
                                                                                        <p className="opacity-50 font-medium">{t.taskName} ({t.category})</p>
                                                                                    </div>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                                                        <Calendar className="h-3 w-3" />
                                                                        <span className="text-sm">Available for work</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refined Legend Section */}
                <div className="bg-white/40 glass-effect p-4 rounded-xl border border-white/20 shadow-sm">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-slate-100 border border-slate-200" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">1-2 Tasks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-amber-500 shadow-sm shadow-amber-200" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">3-4 Tasks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-rose-500 shadow-sm shadow-rose-200" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overloaded (5+)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3.5 w-8 rounded-md bg-rose-100 border border-rose-200" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">On Leave</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Holiday</span>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
