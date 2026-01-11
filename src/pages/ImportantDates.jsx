import { useState, useMemo } from 'react';
import { useApp, ACTIONS } from '../context/AppContext';
import { refreshHolidays } from '../utils/holidayService';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    Plus,
    RefreshCw,
    Calendar,
    Users,
    Edit2,
    Trash2,
    ChevronDown,
    Search,
    Info,
    CalendarDays,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import './ImportantDates.css';

// Generate unique IDs
const generateHolidayId = (year) => `hd_${year}_${Date.now().toString(36)}`;
const generateLeaveId = () => `LV-${Date.now().toString(36).toUpperCase()}`;

// Empty templates
const emptyHoliday = {
    id: '',
    date: '',
    name: '',
    type: 'national',
    year: new Date().getFullYear(),
};

const emptyLeave = {
    id: '',
    memberId: '',
    memberName: '',
    startDate: '',
    endDate: '',
    reason: '',
};

// Calculate number of days between two dates (inclusive)
function calculateDays(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    try {
        return differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
    } catch (e) {
        return 0;
    }
}

// Format date for display
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch (e) {
        return dateStr;
    }
};

export default function ImportantDates() {
    const { state, dispatch } = useApp();

    // Filters
    const [yearFilter, setYearFilter] = useState('all');
    const [memberFilter, setMemberFilter] = useState('all');

    // Holiday modal states
    const [isHolidayFormOpen, setIsHolidayFormOpen] = useState(false);
    const [isHolidayDeleteOpen, setIsHolidayDeleteOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [holidayToDelete, setHolidayToDelete] = useState(null);
    const [holidayForm, setHolidayForm] = useState(emptyHoliday);
    const [holidayErrors, setHolidayErrors] = useState({});

    // Leave modal states
    const [isLeaveFormOpen, setIsLeaveFormOpen] = useState(false);
    const [isLeaveDeleteOpen, setIsLeaveDeleteOpen] = useState(false);
    const [editingLeave, setEditingLeave] = useState(null);
    const [leaveToDelete, setLeaveToDelete] = useState(null);
    const [leaveForm, setLeaveForm] = useState(emptyLeave);
    const [leaveErrors, setLeaveErrors] = useState({});

    // Refreshing state
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Get unique years from holidays
    const availableYears = useMemo(() => {
        const years = [...new Set(state.holidays.map(h => h.year))];
        return years.sort((a, b) => b - a); // Newest first
    }, [state.holidays]);

    // Filtered Data
    const filteredHolidays = useMemo(() => {
        let filtered = [...state.holidays];
        if (yearFilter !== 'all') {
            filtered = filtered.filter(h => h.year === parseInt(yearFilter));
        }
        return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [state.holidays, yearFilter]);

    const filteredLeaves = useMemo(() => {
        let filtered = [...state.leaves];
        if (memberFilter !== 'all') {
            filtered = filtered.filter(l => l.memberId === memberFilter);
        }
        return filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }, [state.leaves, memberFilter]);

    // Holiday Table Columns
    const holidayColumns = [
        {
            accessorKey: 'date',
            header: 'Date',
            cell: ({ row }) => (
                <div className="font-bold text-slate-800 tabular-nums">
                    {formatDate(row.original.date)}
                </div>
            )
        },
        {
            accessorKey: 'name',
            header: 'Event Name',
            cell: ({ row }) => <span className="font-medium text-slate-600">{row.original.name}</span>
        },
        {
            accessorKey: 'type',
            header: 'Category',
            cell: ({ row }) => {
                const type = row.original.type;
                return (
                    <Badge variant={type === 'national' ? 'default' : 'success'} className="px-3">
                        {type === 'national' ? 'National' : 'Mass Leave'}
                    </Badge>
                );
            }
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => handleEditHoliday(row.original)}
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteHolidayClick(row.original)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ];

    // Leave Table Columns
    const leaveColumns = [
        {
            accessorKey: 'memberName',
            header: 'Team Member',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                        {row.original.memberName?.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900">{row.original.memberName}</span>
                </div>
            )
        },
        {
            accessorKey: 'dateRange',
            header: 'Duration',
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5 min-w-[140px]">
                    <span className="text-xs font-bold text-slate-700">{formatDate(row.original.startDate)}</span>
                    <span className="text-[10px] font-medium text-slate-400">to {formatDate(row.original.endDate)}</span>
                </div>
            )
        },
        {
            id: 'days',
            header: 'Days',
            cell: ({ row }) => {
                const days = calculateDays(row.original.startDate, row.original.endDate);
                return (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-black px-2 tabular-nums">
                        {days} day{days !== 1 ? 's' : ''}
                    </Badge>
                );
            }
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => handleEditLeave(row.original)}
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteLeaveClick(row.original)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ];

    const holidayTable = useReactTable({
        data: filteredHolidays,
        columns: holidayColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const leaveTable = useReactTable({
        data: filteredLeaves,
        columns: leaveColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    // Holiday handlers
    const handleAddHoliday = () => {
        const currentYear = new Date().getFullYear();
        setHolidayForm({ ...emptyHoliday, id: generateHolidayId(currentYear), year: currentYear });
        setEditingHoliday(null);
        setHolidayErrors({});
        setIsHolidayFormOpen(true);
    };

    const handleEditHoliday = (holiday) => {
        setHolidayForm({ ...holiday });
        setEditingHoliday(holiday);
        setHolidayErrors({});
        setIsHolidayFormOpen(true);
    };

    const handleDeleteHolidayClick = (holiday) => {
        setHolidayToDelete(holiday);
        setIsHolidayDeleteOpen(true);
    };

    const handleHolidayChange = (name, value) => {
        setHolidayForm(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'date' && value) updated.year = new Date(value).getFullYear();
            return updated;
        });
        if (holidayErrors[name]) setHolidayErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateHoliday = () => {
        const errors = {};
        if (!holidayForm.date) errors.date = 'Date is required';
        if (!holidayForm.name.trim()) errors.name = 'Name is required';
        setHolidayErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleHolidaySubmit = () => {
        if (!validateHoliday()) return;
        if (editingHoliday) dispatch({ type: ACTIONS.UPDATE_HOLIDAY, payload: holidayForm });
        else dispatch({ type: ACTIONS.ADD_HOLIDAY, payload: holidayForm });
        setIsHolidayFormOpen(false);
    };

    const handleHolidayDeleteConfirm = () => {
        if (holidayToDelete) dispatch({ type: ACTIONS.DELETE_HOLIDAY, payload: holidayToDelete.id });
        setIsHolidayDeleteOpen(false);
        setHolidayToDelete(null);
    };

    // Leave handlers
    const handleAddLeave = () => {
        setLeaveForm({ ...emptyLeave, id: generateLeaveId() });
        setEditingLeave(null);
        setLeaveErrors({});
        setIsLeaveFormOpen(true);
    };

    const handleEditLeave = (leave) => {
        setLeaveForm({ ...leave });
        setEditingLeave(leave);
        setLeaveErrors({});
        setIsLeaveFormOpen(true);
    };

    const handleDeleteLeaveClick = (leave) => {
        setLeaveToDelete(leave);
        setIsLeaveDeleteOpen(true);
    };

    const handleLeaveChange = (name, value) => {
        setLeaveForm(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'memberId') {
                const member = state.members.find(m => m.id === value);
                updated.memberName = member ? member.name : '';
            }
            if (name === 'startDate' && !prev.endDate) updated.endDate = value;
            return updated;
        });
        if (leaveErrors[name]) setLeaveErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateLeave = () => {
        const errors = {};
        if (!leaveForm.memberId) errors.memberId = 'Team member is required';
        if (!leaveForm.startDate) errors.startDate = 'Start date is required';
        if (!leaveForm.endDate) errors.endDate = 'End date is required';
        if (leaveForm.startDate && leaveForm.endDate && leaveForm.startDate > leaveForm.endDate) errors.endDate = 'Invalid range';
        setLeaveErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLeaveSubmit = () => {
        if (!validateLeave()) return;
        if (editingLeave) dispatch({ type: ACTIONS.UPDATE_LEAVE, payload: leaveForm });
        else dispatch({ type: ACTIONS.ADD_LEAVE, payload: leaveForm });
        setIsLeaveFormOpen(false);
    };

    const handleLeaveDeleteConfirm = () => {
        if (leaveToDelete) dispatch({ type: ACTIONS.DELETE_LEAVE, payload: leaveToDelete.id });
        setIsLeaveDeleteOpen(false);
        setLeaveToDelete(null);
    };

    // Refresh holidays from API
    const handleRefreshHolidays = async () => {
        setIsRefreshing(true);
        try {
            const freshHolidays = await refreshHolidays();
            dispatch({ type: ACTIONS.SET_HOLIDAYS, payload: freshHolidays });
        } catch (error) {
            console.error('Failed to refresh holidays:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Stats
    const totalHolidayDays = filteredHolidays.length;
    const totalLeaveDays = filteredLeaves.reduce((sum, l) => sum + calculateDays(l.startDate, l.endDate), 0);

    return (
        <div className="important-dates-page space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Public Holidays Section */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 glass-effect p-6 rounded-2xl border border-white/20 shadow-sm transition-all hover:bg-white/50">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <CalendarDays className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-none mb-1.5">Public Holidays</h2>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{totalHolidayDays} Scheduled Events</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 rounded-xl bg-white/50 border-slate-200/60 font-medium text-slate-600 hover:text-indigo-600"
                                onClick={handleRefreshHolidays}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={cn("h-3.5 w-3.5 mr-2", isRefreshing && "animate-spin")} />
                                Refresh
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 border-none font-bold"
                                onClick={handleAddHoliday}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white/40 glass-effect rounded-2xl border border-white/20 shadow-xl overflow-hidden min-h-[400px]">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200/60 bg-white/20">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 rounded-xl border border-slate-200/50 text-slate-500">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Filter By Year</span>
                                <Select value={yearFilter} onValueChange={setYearFilter}>
                                    <SelectTrigger className="h-6 w-auto border-none bg-transparent p-0 text-slate-900 font-bold focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {availableYears.map(year => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="max-h-[500px] overflow-auto relative scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            <Table>
                                <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                    {holidayTable.getHeaderGroups().map(headerGroup => (
                                        <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-100">
                                            {headerGroup.headers.map(header => (
                                                <TableHead key={header.id} className="text-[10px] uppercase font-black tracking-widest text-slate-400 py-3 px-6 h-auto bg-slate-50">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {holidayTable.getRowModel().rows.length ? (
                                        holidayTable.getRowModel().rows.map(row => (
                                            <TableRow key={row.id} className="group hover:bg-white/30 border-slate-100">
                                                {row.getVisibleCells().map(cell => (
                                                    <TableCell key={cell.id} className="px-6 py-3.5">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={holidayColumns.length} className="h-32 text-center">
                                                <div className="flex flex-col items-center gap-2 text-slate-400 opacity-60">
                                                    <Calendar className="h-8 w-8" />
                                                    <p className="text-sm font-medium uppercase tracking-widest">No holidays found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Team Leaves Section */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 glass-effect p-6 rounded-2xl border border-white/20 shadow-sm transition-all hover:bg-white/50">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-none mb-1.5">Team Leaves</h2>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{totalLeaveDays} Total Days Away</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="default"
                                size="sm"
                                className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 border-none font-bold"
                                onClick={handleAddLeave}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Leave
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white/40 glass-effect rounded-2xl border border-white/20 shadow-xl overflow-hidden min-h-[400px]">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200/60 bg-white/20">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/50 rounded-xl border border-slate-200/50 text-slate-500 w-full max-w-[240px]">
                                <Search className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest shrink-0">By Member</span>
                                <Select value={memberFilter} onValueChange={setMemberFilter}>
                                    <SelectTrigger className="h-6 w-full border-none bg-transparent p-0 text-slate-900 font-bold focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Members</SelectItem>
                                        {state.members.map(member => (
                                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="max-h-[500px] overflow-auto relative scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            <Table>
                                <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                    {leaveTable.getHeaderGroups().map(headerGroup => (
                                        <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-100">
                                            {headerGroup.headers.map(header => (
                                                <TableHead key={header.id} className="text-[10px] uppercase font-black tracking-widest text-slate-400 py-3 px-6 h-auto bg-slate-50">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {leaveTable.getRowModel().rows.length ? (
                                        leaveTable.getRowModel().rows.map(row => (
                                            <TableRow key={row.id} className="group hover:bg-white/30 border-slate-100">
                                                {row.getVisibleCells().map(cell => (
                                                    <TableCell key={cell.id} className="px-6 py-3.5">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={leaveColumns.length} className="h-32 text-center">
                                                <div className="flex flex-col items-center gap-2 text-slate-400 opacity-60">
                                                    <Users className="h-8 w-8" />
                                                    <p className="text-sm font-medium uppercase tracking-widest">No leave records</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Holiday Dialog */}
            <Dialog open={isHolidayFormOpen} onOpenChange={setIsHolidayFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <CalendarDays className="h-4 w-4 text-indigo-600" />
                            </div>
                            {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure a holiday event for the resource calendar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-8 space-y-5 pt-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Date</Label>
                            <Input
                                type="date"
                                value={holidayForm.date}
                                onChange={(e) => handleHolidayChange('date', e.target.value)}
                                className={cn("bg-slate-50/50 border-slate-200 focus:border-blue-500 rounded-xl font-bold h-11 transition-all", holidayErrors.date && "border-red-400")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Holiday Name</Label>
                            <Input
                                value={holidayForm.name}
                                onChange={(e) => handleHolidayChange('name', e.target.value)}
                                placeholder="e.g., Independence Day"
                                className={cn("bg-slate-50/50 border-slate-200 focus:border-blue-500 rounded-xl font-bold h-11 transition-all", holidayErrors.name && "border-red-400")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</Label>
                            <Select
                                value={holidayForm.type}
                                onValueChange={(v) => handleHolidayChange('type', v)}
                            >
                                <SelectTrigger className="bg-slate-50/50 border-slate-200 rounded-xl font-bold h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200">
                                    <SelectItem value="national" className="font-bold">National Holiday</SelectItem>
                                    <SelectItem value="mass-leave" className="font-bold">Mass Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsHolidayFormOpen(false)} className="font-bold">Cancel</Button>
                        <Button onClick={handleHolidaySubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-bold shadow-lg shadow-indigo-100">
                            {editingHoliday ? 'Save Changes' : 'Add Holiday'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Leave Dialog */}
            <Dialog open={isLeaveFormOpen} onOpenChange={setIsLeaveFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <FileText className="h-4 w-4 text-indigo-600" />
                            </div>
                            {editingLeave ? 'Edit Leave' : 'Add Leave'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure a planned leave or absence for a team member.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-8 space-y-5 pt-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Team Member</Label>
                            <Select
                                value={leaveForm.memberId}
                                onValueChange={(v) => handleLeaveChange('memberId', v)}
                            >
                                <SelectTrigger className={cn("bg-slate-50/50 border-slate-200 rounded-xl font-bold h-11", leaveErrors.memberId && "border-red-400")}>
                                    <SelectValue placeholder="Select member..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200">
                                    {state.members.map(m => (
                                        <SelectItem key={m.id} value={m.id} className="font-bold">{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</Label>
                                <Input
                                    type="date"
                                    value={leaveForm.startDate}
                                    onChange={(e) => handleLeaveChange('startDate', e.target.value)}
                                    className={cn("bg-slate-50/50 border-slate-200 focus:border-emerald-500 rounded-xl font-bold h-11", leaveErrors.startDate && "border-red-400")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Date</Label>
                                <Input
                                    type="date"
                                    value={leaveForm.endDate}
                                    onChange={(e) => handleLeaveChange('endDate', e.target.value)}
                                    className={cn("bg-slate-50/50 border-slate-200 focus:border-emerald-500 rounded-xl font-bold h-11", leaveErrors.endDate && "border-red-400")}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 text-emerald-600/60">Estimated Days</Label>
                            <div className="h-11 flex items-center px-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-emerald-700 font-black text-sm tabular-nums">
                                {calculateDays(leaveForm.startDate, leaveForm.endDate)} workday(s)
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reason / Notes</Label>
                            <Input
                                value={leaveForm.reason}
                                onChange={(e) => handleLeaveChange('reason', e.target.value)}
                                placeholder="Optional notes..."
                                className="bg-slate-50/50 border-slate-200 focus:border-emerald-500 rounded-xl font-bold h-11"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsLeaveFormOpen(false)} className="font-bold">Cancel</Button>
                        <Button onClick={handleLeaveSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-bold shadow-lg shadow-indigo-100">
                            {editingLeave ? 'Save Changes' : 'Add Leave'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialogs */}
            <Dialog open={isHolidayDeleteOpen} onOpenChange={setIsHolidayDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="items-center text-center sm:text-center">
                        <div className="h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                            <Trash2 className="h-8 w-8" />
                        </div>
                        <DialogTitle>Delete Holiday?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this holiday? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button variant="ghost" onClick={() => setIsHolidayDeleteOpen(false)} className="font-bold">Cancel</Button>
                        <Button variant="destructive" onClick={handleHolidayDeleteConfirm} className="px-8 font-bold">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isLeaveDeleteOpen} onOpenChange={setIsLeaveDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="items-center text-center sm:text-center">
                        <div className="h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                            <Trash2 className="h-8 w-8" />
                        </div>
                        <DialogTitle>Delete Leave Record?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this leave record? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button variant="ghost" onClick={() => setIsLeaveDeleteOpen(false)} className="font-bold">Cancel</Button>
                        <Button variant="destructive" onClick={handleLeaveDeleteConfirm} className="px-8 font-bold">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
