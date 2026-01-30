import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
    formatCurrency
} from '../utils/calculations';
import {
    differenceInDays,
    parseISO,
    format,
    isAfter,
    isBefore,
    startOfDay,
    endOfDay
} from 'date-fns';
import {
    LayoutDashboard,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    ChevronRight,
    ArrowRight,
    Activity
} from 'lucide-react';
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import LeaveBalanceWidget from '../components/leave/LeaveBalanceWidget';
import StatusSelector from '../components/tasks/StatusSelector';

export default function MemberDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { state } = useApp();
    const { allocations, members } = state;

    // Find the member associated with the logged-in user
    // In a real app, we'd match by email or a system ID. 
    // For this prototype, we'll try to find a member with a similar name or just the first one if not found.
    const member = useMemo(() => {
        if (!members || members.length === 0) return null;
        return members.find(m => m.name.toLowerCase() === user?.name?.toLowerCase()) ||
            members.find(m => m.isActive) || members[0];
    }, [members, user]);

    // Get allocations for this member
    const myAllocations = useMemo(() => {
        if (!member || !allocations) return [];
        return allocations
            .filter(a => a.resource === member.name)
            .sort((a, b) => new Date(a.plan?.taskStart) - new Date(b.plan?.taskStart));
    }, [allocations, member]);

    // Categorize tasks
    const tasks = useMemo(() => {
        const now = startOfDay(new Date());
        return {
            active: myAllocations.filter(a => {
                const start = startOfDay(parseISO(a.plan?.taskStart));
                const end = endOfDay(parseISO(a.plan?.taskEnd));
                return isBefore(start, now) && isAfter(end, now) && a.status !== 'completed';
            }),
            upcoming: myAllocations.filter(a => {
                const start = startOfDay(parseISO(a.plan?.taskStart));
                return isAfter(start, now);
            }),
            completed: myAllocations.filter(a => a.status === 'completed'),
            overdue: myAllocations.filter(a => {
                const end = endOfDay(parseISO(a.plan?.taskEnd));
                return isBefore(end, now) && a.status !== 'completed';
            })
        };
    }, [myAllocations]);

    const workload = useMemo(() => {
        if (!member) return 0;
        // Recommendation 2.4: Sum up workload from active tasks
        const totalWorkload = tasks.active.reduce((sum, a) => sum + (a.workload || 0), 0);
        return Math.round(totalWorkload * 100);
    }, [member, tasks.active]);

    if (!member) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertCircle className="h-12 w-12 text-slate-300" />
                <h2 className="text-xl font-bold text-slate-900 border-none">No Member Profile Found</h2>
                <p className="text-slate-500 max-w-md text-center">
                    Your user account isn't linked to a team member profile.
                    Please contact an administrator to set up your resource profile.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 p-6 rounded-3xl border border-border/60 backdrop-blur-md">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-200 dark:shadow-none">
                        {member.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 border-none">
                            Welcome back, {member.name.split(' ')[0]}!
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500">
                                {member.type}
                            </Badge>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                You have {tasks.active.length} active tasks today.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-900 flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Workload</span>
                        <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{workload}%</span>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-950/20 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-900 flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Availability</span>
                        <span className="text-xl font-bold text-indigo-700 dark:text-indigo-400">{member.maxHoursPerWeek}h/w</span>
                    </div>
                </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Active Tasks"
                    value={tasks.active.length}
                    icon={Clock}
                    color="primary"
                />
                <StatCard
                    title="Upcoming"
                    value={tasks.upcoming.length}
                    icon={Calendar}
                    color="info"
                />
                <StatCard
                    title="Overdue"
                    value={tasks.overdue.length}
                    icon={AlertCircle}
                    color="destructive"
                    trend={tasks.overdue.length > 0 ? 100 : 0}
                />
                <StatCard
                    title="Completed"
                    value={tasks.completed.length}
                    icon={CheckCircle2}
                    color="success"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Tasks List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 border-none">Active Tasks</h2>
                        <Link to={`/member/${member.id}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            View All History <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {tasks.active.length === 0 ? (
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-dashed border-slate-200 dark:border-slate-800 text-center">
                                <p className="text-slate-400 text-sm font-medium">No active tasks assigned for today.</p>
                            </div>
                        ) : (
                            tasks.active.map(task => (
                                <div key={task.id} className="group bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 block">
                                                {task.category || 'Project'} • {task.phase}
                                            </span>
                                            <h3 className="font-bold text-slate-900 dark:text-slate-100">{task.activityName}</h3>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge variant={task.complexity === 'High' ? 'destructive' : task.complexity === 'Medium' ? 'warning' : 'info'} className="font-bold">
                                                {task.complexity}
                                            </Badge>
                                            <StatusSelector
                                                allocationId={task.id}
                                                currentStatus={task.status}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>Ends {format(parseISO(task.plan.taskEnd), 'MMM d')}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{(task.workload * (member.maxHoursPerWeek || 40)).toFixed(1)}h est.</span>
                                            </div>
                                        </div>
                                        <Link to={`/member/${member.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase tracking-widest">Details</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Upcoming & Info */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 border-none px-2">Upcoming Tasks</h2>
                        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                            {tasks.upcoming.length === 0 ? (
                                <div className="p-6 text-center">
                                    <p className="text-slate-400 text-xs font-medium">No upcoming tasks scheduled.</p>
                                </div>
                            ) : (
                                tasks.upcoming.slice(0, 5).map((task, idx) => (
                                    <div key={task.id} className={cn(
                                        "p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors",
                                        idx !== tasks.upcoming.slice(0, 5).length - 1 && "border-b border-border"
                                    )}>
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-[10px] font-black leading-tight text-slate-500">
                                            <span>{format(parseISO(task.plan.taskStart), 'MMM').toUpperCase()}</span>
                                            <span className="text-sm text-slate-900 dark:text-slate-100">{format(parseISO(task.plan.taskStart), 'd')}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{task.activityName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{task.taskName}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-300" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold mb-2 text-white border-none">Efficiency Tip</h3>
                            <p className="text-sm text-indigo-100 mb-4 opacity-90">
                                You're most productive between 10am-12pm. Try scheduling your "High" complexity tasks during this window.
                            </p>
                            <Button variant="secondary" className="w-full font-bold bg-white text-indigo-600 hover:bg-indigo-50 border-none h-10 rounded-xl">
                                View Productivity Insights
                            </Button>
                        </div>
                        <Activity className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10" />
                    </div>

                    <LeaveBalanceWidget
                        onRequestLeave={() => navigate('/leave')}
                    />
                </div>
            </div>
        </div>

    );
}
