import React, { useState, useMemo } from 'react';
import { useTimesheet } from '../hooks/useTimesheet';
import { useApp } from '../context/AppContext';
import {
    format,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    eachDayOfInterval,
    isSameDay,
    parseISO
} from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Save,
    Clock,
    AlertCircle,
    CheckCircle2,
    Calendar as CalendarIcon,
    RefreshCcw,
    Send
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/ui/page-transition';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const Timesheet = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
    const weekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
    const weekDays = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

    const {
        entries,
        periods,
        isLoading,
        logTime,
        submitTimesheet,
        refresh
    } = useTimesheet(format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd'));

    const { state } = useApp();
    const { allocations } = state;

    const currentPeriod = useMemo(() => {
        return periods.find(p => p.startDate === format(weekStart, 'yyyy-MM-dd'));
    }, [periods, weekStart]);

    const status = currentPeriod?.status || 'DRAFT';

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    const totalHours = useMemo(() => {
        return entries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
    }, [entries]);

    const handleSubmit = async () => {
        if (totalHours === 0) {
            toast.error('Cannot submit an empty timesheet');
            return;
        }
        try {
            await submitTimesheet({
                startDate: format(weekStart, 'yyyy-MM-dd'),
                endDate: format(weekEnd, 'yyyy-MM-dd')
            });
        } catch (err) {
            // Error toast handled in hook
        }
    };

    return (
        <PageTransition>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                            <Clock className="h-8 w-8 text-primary" />
                            TIMESHEET
                        </h1>
                        <p className="text-muted-foreground font-medium">Log your weekly work hours and activities</p>
                    </div>

                    <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border border-main">
                        <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="h-9 w-9">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="px-4 font-bold text-sm min-w-[200px] text-center">
                            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleNextWeek} className="h-9 w-9">
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                        <div className="w-[1px] h-4 bg-border mx-1" />
                        <Button variant="ghost" size="sm" onClick={handleToday} className="text-xs font-bold uppercase tracking-wider">
                            Today
                        </Button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="shadow-sm border-main overflow-hidden">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Hours</p>
                                <p className="text-xl font-bold">{totalHours}h</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-main overflow-hidden">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${status === 'APPROVED' ? 'bg-emerald-100' :
                                status === 'SUBMITTED' ? 'bg-amber-100' : 'bg-slate-100'
                                }`}>
                                {status === 'APPROVED' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-slate-500" />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold">{status}</span>
                                    {status === 'REJECTED' && (
                                        <Badge variant="destructive" className="text-[8px] animate-pulse">Action Required</Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="md:col-span-2 flex justify-end items-center gap-3">
                        <Button
                            variant="outline"
                            className="gap-2 border-main hover:border-primary/50 font-bold"
                            onClick={() => refresh()}
                        >
                            <RefreshCcw className="h-4 w-4" /> Refresh
                        </Button>
                        <Button
                            disabled={status === 'SUBMITTED' || status === 'APPROVED'}
                            className="gap-2 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
                            onClick={handleSubmit}
                        >
                            <Send className="h-4 w-4" /> Submit Week
                        </Button>
                    </div>
                </div>

                {/* Main Grid */}
                <Card className="shadow-lg border-main overflow-hidden rounded-3xl min-h-[400px]">
                    <CardHeader className="border-b border-main bg-muted/10">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Weekly Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/30">
                                        <th className="px-6 py-4 border-b border-main text-[10px] font-black uppercase tracking-widest text-muted-foreground min-w-[250px]">Activity / Allocation</th>
                                        {weekDays.map(day => (
                                            <th key={day.toString()} className="px-4 py-4 border-b border-l border-main text-center min-w-[100px]">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{format(day, 'EEE')}</div>
                                                <div className={`text-base font-bold ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                                                    {format(day, 'd')}
                                                </div>
                                            </th>
                                        ))}
                                        <th className="px-4 py-4 border-b border-l border-main text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground min-w-[80px]">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-main">
                                    {/* Project Allocations */}
                                    {allocations.length > 0 ? allocations.map(alloc => (
                                        <tr key={alloc.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm text-foreground">{alloc.task?.name || 'General Allocation'}</p>
                                                <p className="text-[10px] font-medium text-muted-foreground uppercase">{alloc.phase?.name}</p>
                                            </td>
                                            {weekDays.map(day => {
                                                const dayStr = format(day, 'yyyy-MM-dd');
                                                const entry = entries.find(e => e.date === dayStr && e.allocationId === alloc.id);
                                                return (
                                                    <td key={dayStr} className="px-2 py-2 border-l border-main group relative">
                                                        <TimeCell
                                                            entry={entry}
                                                            date={dayStr}
                                                            allocationId={alloc.id}
                                                            category="PROJECT"
                                                            disabled={status === 'SUBMITTED' || status === 'APPROVED'}
                                                            onSave={(data) => logTime({ ...data, allocationId: alloc.id, id: entry?.id })}
                                                        />
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-2 border-l border-main text-center font-black text-sm text-slate-400">
                                                {entries.filter(e => e.allocationId === alloc.id).reduce((sum, e) => sum + parseFloat(e.hours), 0)}h
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                                                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                <p className="font-bold">No active project allocations found.</p>
                                                <p className="text-xs">You can still log time using the 'General' row below.</p>
                                            </td>
                                        </tr>
                                    )}

                                    {/* General Activity */}
                                    <tr className="bg-muted/5">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm text-foreground">General Activity</p>
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase">Meetings, Admin, Support</p>
                                        </td>
                                        {weekDays.map(day => {
                                            const dayStr = format(day, 'yyyy-MM-dd');
                                            const entry = entries.find(e => e.date === dayStr && !e.allocationId);
                                            return (
                                                <td key={dayStr} className="px-2 py-2 border-l border-main">
                                                    <TimeCell
                                                        entry={entry}
                                                        date={dayStr}
                                                        category="ADMIN"
                                                        disabled={status === 'SUBMITTED' || status === 'APPROVED'}
                                                        onSave={(data) => logTime({ ...data, allocationId: null, id: entry?.id })}
                                                    />
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-2 border-l border-main text-center font-black text-sm text-slate-400">
                                            {entries.filter(e => !e.allocationId).reduce((sum, e) => sum + parseFloat(e.hours), 0)}h
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="bg-muted/30 font-black">
                                        <td className="px-6 py-4 border-t-2 border-primary/20 text-right uppercase tracking-widest text-[10px]">Daily Total</td>
                                        {weekDays.map(day => {
                                            const dayStr = format(day, 'yyyy-MM-dd');
                                            const dailyTotal = entries.filter(e => e.date === dayStr).reduce((sum, e) => sum + parseFloat(e.hours), 0);
                                            return (
                                                <td key={dayStr} className="px-4 py-4 border-l border-main border-t-2 border-primary/20 text-center text-primary">
                                                    {dailyTotal}h
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-4 border-l border-main border-t-2 border-primary/20 text-center bg-primary text-white">
                                            {totalHours}h
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageTransition>
    );
};

// Inline helper component for the time cell
const TimeCell = ({ entry, date, allocationId, category, onSave, disabled }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(entry?.hours ? entry.hours.toString() : '');

    const handleBlur = () => {
        setIsEditing(false);
        if (value !== (entry?.hours ? entry.hours.toString() : '')) {
            onSave({ date, hours: parseFloat(value) || 0, category });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleBlur();
        if (e.key === 'Escape') {
            setIsEditing(false);
            setValue(entry?.hours ? entry.hours.toString() : '');
        }
    };

    if (disabled) {
        return (
            <div className={`h-10 w-full flex items-center justify-center font-bold text-sm ${entry?.hours > 0 ? 'text-foreground' : 'text-muted-foreground/30'}`}>
                {entry?.hours || '-'}
            </div>
        );
    }

    if (isEditing) {
        return (
            <input
                autoFocus
                className="w-full h-10 bg-white border-2 border-primary rounded-lg text-center font-bold text-sm outline-none shadow-sm"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="0"
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={`h-10 w-full flex items-center justify-center cursor-pointer rounded-lg border border-transparent hover:border-primary/20 hover:bg-white transition-all group font-bold text-sm ${entry?.hours > 0 ? 'bg-primary/5 text-primary' : 'text-muted-foreground/30'
                }`}
        >
            {entry?.hours || '0'}
            <Plus className="h-3 w-3 absolute bottom-1 right-1 opacity-0 group-hover:opacity-40" />
        </div>
    );
};

export default Timesheet;
