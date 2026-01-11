import { useState, useMemo } from 'react';
import { useApp, ACTIONS } from '../../context/AppContext';
import { formatPercentage } from '../../utils/calculations';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Edit2,
    Trash2,
    List,
    Search,
    ChevronDown,
    Activity,
    Clock,
    Zap,
    Scale
} from "lucide-react"
import { cn } from "@/lib/utils"
import './LibraryPage.css';

const initialFormState = {
    id: '',
    name: '',
    phaseId: '',
    estimates: {
        low: { days: 2, hours: 1, percentage: 0.125 },
        medium: { days: 5, hours: 2, percentage: 0.25 },
        high: { days: 10, hours: 4, percentage: 0.5 },
        sophisticated: { days: 20, hours: 6, percentage: 0.75 },
    },
};

export default function TaskTemplates() {
    const { state, dispatch } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [globalFilter, setGlobalFilter] = useState("");

    // TanStack Table Columns with Grouping
    const columns = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <span className="text-[10px] font-mono text-slate-400">{row.getValue("id")}</span>,
        },
        {
            accessorKey: "name",
            header: "Task Name",
            cell: ({ row }) => <span className="font-semibold text-slate-800">{row.getValue("name")}</span>,
        },
        {
            header: "Complexity: Low",
            columns: [
                {
                    accessorKey: "estimates.low.days",
                    header: "D",
                    cell: ({ row }) => <span className="text-xs text-slate-600 font-medium">{row.original.estimates?.low?.days ?? 0}</span>,
                },
                {
                    accessorKey: "estimates.low.hours",
                    header: "H",
                    cell: ({ row }) => <span className="text-xs text-slate-600 font-medium">{row.original.estimates?.low?.hours ?? 0}</span>,
                },
                {
                    accessorKey: "estimates.low.percentage",
                    header: "%",
                    cell: ({ row }) => <span className="text-xs text-indigo-600 font-bold">{formatPercentage(row.original.estimates?.low?.percentage ?? 0)}</span>,
                },
            ],
        },
        {
            header: "Complexity: Medium",
            columns: [
                {
                    accessorKey: "estimates.medium.days",
                    header: "D",
                    cell: ({ row }) => <span className="text-xs text-slate-600 font-medium">{row.original.estimates?.medium?.days ?? 0}</span>,
                },
                {
                    accessorKey: "estimates.medium.hours",
                    header: "H",
                    cell: ({ row }) => <span className="text-xs text-slate-600 font-medium">{row.original.estimates?.medium?.hours ?? 0}</span>,
                },
                {
                    accessorKey: "estimates.medium.percentage",
                    header: "%",
                    cell: ({ row }) => <span className="text-xs text-indigo-600 font-bold">{formatPercentage(row.original.estimates?.medium?.percentage ?? 0)}</span>,
                },
            ],
        },
        {
            header: "Complexity: High",
            columns: [
                {
                    accessorKey: "estimates.high.days",
                    header: "D",
                    cell: ({ row }) => <span className="text-xs text-slate-600 font-medium">{row.original.estimates?.high?.days ?? 0}</span>,
                },
                {
                    accessorKey: "estimates.high.hours",
                    header: "H",
                    cell: ({ row }) => <span className="text-xs text-slate-600 font-medium">{row.original.estimates?.high?.hours ?? 0}</span>,
                },
                {
                    accessorKey: "estimates.high.percentage",
                    header: "%",
                    cell: ({ row }) => <span className="text-xs text-purple-600 font-bold">{formatPercentage(row.original.estimates?.high?.percentage ?? 0)}</span>,
                },
            ],
        },
        {
            header: "Complexity: Sophisticated",
            columns: [
                {
                    accessorKey: "estimates.sophisticated.days",
                    header: "D",
                    cell: ({ row }) => <span className="text-xs text-slate-600 font-medium">{row.original.estimates?.sophisticated?.days ?? 0}</span>,
                },
                {
                    accessorKey: "estimates.sophisticated.hours",
                    header: "H",
                    cell: ({ row }) => <span className="text-xs text-slate-600 font-medium">{row.original.estimates?.sophisticated?.hours ?? 0}</span>,
                },
                {
                    accessorKey: "estimates.sophisticated.percentage",
                    header: "%",
                    cell: ({ row }) => <span className="text-xs text-rose-600 font-bold">{formatPercentage(row.original.estimates?.sophisticated?.percentage ?? 0)}</span>,
                },
            ],
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => handleEdit(row.original)}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(row.original)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ], []);

    const [sorting, setSorting] = useState([]);

    const table = useReactTable({
        data: state.tasks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
    });

    // filtered data for display count
    const filteredTasks = useMemo(() => {
        if (!globalFilter) return state.tasks;
        const filter = globalFilter.toLowerCase();
        return state.tasks.filter(t =>
            t.name.toLowerCase().includes(filter) ||
            t.id.toLowerCase().includes(filter)
        );
    }, [state.tasks, globalFilter]);

    const handleAdd = () => {
        const nextId = `T${String(state.tasks.length + 1).padStart(3, '0')}`;
        setFormData({ ...initialFormState, id: nextId });
        setCurrentTask(null);
        setIsModalOpen(true);
    };

    const handleEdit = (task) => {
        // Merge with initial form state to ensure estimates structure exists
        const mergedFormData = {
            ...initialFormState,
            ...task,
            estimates: {
                ...initialFormState.estimates,
                ...task.estimates,
                low: { ...initialFormState.estimates.low, ...task.estimates?.low },
                medium: { ...initialFormState.estimates.medium, ...task.estimates?.medium },
                high: { ...initialFormState.estimates.high, ...task.estimates?.high },
                sophisticated: { ...initialFormState.estimates.sophisticated, ...task.estimates?.sophisticated },
            },
        };
        setFormData(mergedFormData);
        setCurrentTask(task);
        setIsModalOpen(true);
    };

    const handleDelete = (task) => {
        setCurrentTask(task);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (currentTask) {
            dispatch({ type: ACTIONS.DELETE_TASK, payload: currentTask.id });
        }
        setIsDeleteOpen(false);
        setCurrentTask(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentTask) {
            dispatch({ type: ACTIONS.UPDATE_TASK, payload: formData });
        } else {
            dispatch({ type: ACTIONS.ADD_TASK, payload: formData });
        }
        setIsModalOpen(false);
    };

    const updateEstimate = (level, field, value) => {
        const numValue = parseInt(value, 10) || 0;
        const updatedEstimate = {
            ...formData.estimates[level],
            [field]: numValue,
        };

        if (field === 'hours' || field === 'days') {
            const hours = field === 'hours' ? numValue : formData.estimates[level].hours;
            const days = field === 'days' ? numValue : formData.estimates[level].days;
            updatedEstimate.percentage = days > 0 ? hours / (days * 8) : 0;
        }

        setFormData({
            ...formData,
            estimates: {
                ...formData.estimates,
                [level]: updatedEstimate,
            },
        });
    };

    return (
        <div className="library-page space-y-6 animate-in fade-in duration-500">
            {/* Header section with glass effect */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 glass-effect p-6 rounded-2xl border border-white/20 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <List className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Task Templates</h2>
                        <p className="text-sm text-slate-500 font-medium">Define effort estimates for common resource tasks</p>
                    </div>
                </div>

                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95" onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add template
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/40 glass-effect p-4 rounded-xl border border-white/20 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                        placeholder="Search templates..."
                        className="pl-9 bg-white/50 border-slate-200/50 rounded-lg focus-visible:ring-indigo-500"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>
                <div className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">
                    {filteredTasks.length} OF {state.tasks.length} TEMPLATES
                </div>
            </div>

            {/* Table Container */}
            <div className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className={cn(
                                                "text-[10px] font-bold text-slate-500 uppercase tracking-widest h-auto py-2 border-b border-slate-100",
                                                header.column.columnDef.header.toString().includes('Complexity') ? "text-center bg-slate-100/30" : "text-left"
                                            )}
                                        >
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className="hover:bg-slate-50/30 transition-colors border-slate-100">
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className={cn("py-2.5 px-4 text-sm align-middle h-10")}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center align-middle">
                                        <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                            <List className="h-8 w-8 opacity-20" />
                                            <p>No task templates found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {currentTask ? 'Edit Template' : 'Add Template'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure effort estimation and details for this task.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 pb-0 max-h-[60vh] overflow-y-auto pt-4">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-tight text-slate-400">Template ID</Label>
                                <Input value={formData.id} readOnly className="bg-slate-50 rounded-lg border-slate-200 text-slate-500 font-mono text-xs h-9" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-tight text-slate-400">Task Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="rounded-lg h-9"
                                    placeholder="e.g. System Integration Testing"
                                    required
                                />
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <Label htmlFor="phase" className="text-xs font-bold uppercase tracking-tight text-slate-400">Linked Phase</Label>
                                <Select
                                    value={formData.phaseId?.toString()}
                                    onValueChange={(v) => setFormData({ ...formData, phaseId: parseInt(v) })}
                                >
                                    <SelectTrigger className="rounded-lg h-9">
                                        <SelectValue placeholder="Select Phase" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {state.phases.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 px-6">
                            {['low', 'medium', 'high', 'sophisticated'].map(level => {
                                const levelConfig = {
                                    low: { icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50" },
                                    medium: { icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
                                    high: { icon: Zap, color: "text-purple-500", bg: "bg-purple-50" },
                                    sophisticated: { icon: Scale, color: "text-rose-500", bg: "bg-rose-50" }
                                }[level];

                                const Icon = levelConfig.icon;

                                return (
                                    <div key={level} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={cn("p-1.5 rounded-lg", levelConfig.bg, levelConfig.color)}>
                                                <Icon className="h-3.5 w-3.5" />
                                            </div>
                                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                                {level}
                                            </h5>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-1.5 text-center">
                                                <Label className="text-[10px] font-bold text-slate-400">Days</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.estimates[level].days}
                                                    onChange={(e) => updateEstimate(level, 'days', e.target.value)}
                                                    className="h-8 rounded-lg text-center text-xs"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="space-y-1.5 text-center">
                                                <Label className="text-[10px] font-bold text-slate-400">Hours</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.estimates[level].hours}
                                                    onChange={(e) => updateEstimate(level, 'hours', e.target.value)}
                                                    className="h-8 rounded-lg text-center text-xs"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="space-y-1.5 text-center">
                                                <Label className="text-[10px] font-bold text-slate-400">Workload</Label>
                                                <div className="h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-900 border-dashed">
                                                    {(formData.estimates[level].percentage * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 px-8 font-bold"
                        >
                            {currentTask ? 'Update' : 'Create'} template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Task Template</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-bold text-slate-900">"{currentTask?.name}"</span>?
                            This template will be removed from future selection, but existing allocations will remain.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} className="rounded-xl bg-red-600 hover:bg-red-700">Delete Template</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
