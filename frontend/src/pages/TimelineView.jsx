import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Timeline } from '@/components/ui/timeline-v2';
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Calendar,
    Search,
    Filter,
} from "lucide-react";
import {
    format,
    addDays,
    subDays,
    startOfToday,
    eachDayOfInterval,
    addMonths,
    subMonths
} from 'date-fns';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function TimelineView() {
    const { state, dispatch } = useApp();
    const { members, allocations, holidays } = state;

    // View state
    const [zoom, setZoom] = useState('day'); // 'day' | 'week' | 'month'
    const [density, setDensity] = useState('comfortable'); // 'comfortable' | 'compact'
    const [centerDate, setCenterDate] = useState(startOfToday());
    const [searchQuery, setSearchQuery] = useState("");

    // Calculate date range based on zoom level
    const dateRange = useMemo(() => {
        let start, end;

        if (zoom === 'day') {
            start = subDays(centerDate, 15);
            end = addDays(centerDate, 15);
        } else if (zoom === 'week') {
            start = subDays(centerDate, 35);
            end = addDays(centerDate, 35);
        } else {
            start = subMonths(centerDate, 2);
            end = addMonths(centerDate, 2);
        }

        return eachDayOfInterval({ start, end });
    }, [zoom, centerDate]);

    // Calculate cell width based on zoom
    const cellWidth = useMemo(() => {
        return zoom === 'day' ? 50 : zoom === 'week' ? 100 : 200;
    }, [zoom]);

    // Calculate row height based on density
    const rowHeight = useMemo(() => {
        return density === 'comfortable' ? 60 : 40;
    }, [density]);

    // Handle task update from drag-and-drop
    const handleTaskUpdate = (updatedTask) => {
        dispatch({
            type: 'UPDATE_ALLOCATION',
            payload: updatedTask
        });
    };

    // Navigation handlers
    const handlePrevious = () => {
        if (zoom === 'day') setCenterDate(prev => subDays(prev, 7));
        else if (zoom === 'week') setCenterDate(prev => subDays(prev, 21));
        else setCenterDate(prev => subMonths(prev, 1));
    };

    const handleNext = () => {
        if (zoom === 'day') setCenterDate(prev => addDays(prev, 7));
        else if (zoom === 'week') setCenterDate(prev => addDays(prev, 21));
        else setCenterDate(prev => addMonths(prev, 1));
    };

    const handleToday = () => setCenterDate(startOfToday());

    // Filter members based on search
    const filteredMembers = useMemo(() => {
        return members.filter(m =>
            m.isActive &&
            m.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [members, searchQuery]);

    return (
        <TooltipProvider>
            <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4 animate-in fade-in duration-500 overflow-hidden">
                {/* Control Bar */}
                <div className="flex justify-between items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm shrink-0">
                    {/* Left Side - Title */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <CalendarDays className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Timeline View</h2>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                <Calendar className="h-3 w-3" />
                                <span>{format(dateRange[0], 'MMM d')} — {format(dateRange[dateRange.length - 1], 'MMM d, yyyy')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Controls */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Search Field */}
                        <div className="relative w-64 hidden xl:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search team..."
                                className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:ring-primary/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Density Toggle */}
                        <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                            <Button
                                variant={density === 'comfortable' ? "secondary" : "ghost"}
                                size="sm"
                                className={cn("rounded-md h-7 w-7 p-0", density === 'comfortable' && "bg-background shadow-sm")}
                                onClick={() => setDensity('comfortable')}
                                title="Comfortable View"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <div className="w-3 h-1 bg-current rounded-full opacity-60" />
                                    <div className="w-3 h-1 bg-current rounded-full" />
                                    <div className="w-3 h-1 bg-current rounded-full opacity-60" />
                                </div>
                            </Button>
                            <Button
                                variant={density === 'compact' ? "secondary" : "ghost"}
                                size="sm"
                                className={cn("rounded-md h-7 w-7 p-0", density === 'compact' && "bg-background shadow-sm")}
                                onClick={() => setDensity('compact')}
                                title="Compact View"
                            >
                                <div className="flex flex-col gap-px">
                                    <div className="w-3 h-0.5 bg-current rounded-full opacity-40" />
                                    <div className="w-3 h-0.5 bg-current rounded-full opacity-70" />
                                    <div className="w-3 h-0.5 bg-current rounded-full" />
                                    <div className="w-3 h-0.5 bg-current rounded-full opacity-70" />
                                    <div className="w-3 h-0.5 bg-current rounded-full opacity-40" />
                                </div>
                            </Button>
                        </div>

                        <div className="h-4 w-px bg-border mx-1" />

                        {/* Zoom Controls */}
                        <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                            <Button
                                variant={zoom === 'day' ? "secondary" : "ghost"}
                                size="sm"
                                className={cn("rounded-md h-7 text-[10px] font-black uppercase tracking-widest px-3", zoom === 'day' && "bg-background shadow-sm")}
                                onClick={() => setZoom('day')}
                            >
                                Day
                            </Button>
                            <Button
                                variant={zoom === 'week' ? "secondary" : "ghost"}
                                size="sm"
                                className={cn("rounded-md h-7 text-[10px] font-black uppercase tracking-widest px-3", zoom === 'week' && "bg-background shadow-sm")}
                                onClick={() => setZoom('week')}
                            >
                                Week
                            </Button>
                            <Button
                                variant={zoom === 'month' ? "secondary" : "ghost"}
                                size="sm"
                                className={cn("rounded-md h-7 text-[10px] font-black uppercase tracking-widest px-3", zoom === 'month' && "bg-background shadow-sm")}
                                onClick={() => setZoom('month')}
                            >
                                Month
                            </Button>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" onClick={handlePrevious} className="h-9 w-9">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleToday} className="h-9 font-bold px-3">
                                Today
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNext} className="h-9 w-9">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Timeline Component */}
                <div className="flex-1 bg-card rounded-xl border border-border shadow-xl overflow-hidden max-w-full">
                    <Timeline
                        resources={filteredMembers}
                        tasks={allocations}
                        dateRange={dateRange}
                        cellWidth={cellWidth}
                        rowHeight={rowHeight}
                        holidays={holidays}
                        onTaskUpdate={handleTaskUpdate}
                    />
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between px-2 bg-transparent">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Project</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8_rgba(16,185,129,0.4)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Support</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Maintenance</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="h-5 text-[9px] font-black uppercase tracking-tighter bg-muted/30 border-border/50 text-muted-foreground/60">
                            {filteredMembers.length} Resources Active
                        </Badge>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
