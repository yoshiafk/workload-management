import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp, ACTIONS } from '../context/AppContext';
import {
    formatCurrency,
    calculatePlanEndDate,
    calculateProjectCost,
    calculateMonthlyCost,
    calculateWorkloadPercentage,
} from '../utils/calculations';
import { calculateSLAStatus, getPriorityColor } from '../utils/supportCalculations';
import { getStatusOptions } from '../data/defaultStatuses';
import { getTagOptions } from '../data/defaultTags';

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
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
import { Input } from "@/components/ui/input.jsx"
import {
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Select
} from "@/components/ui/select.jsx"
import { Badge } from "@/components/ui/badge.jsx"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog.jsx"
import { Label } from "@/components/ui/label.jsx"
import { Textarea } from "@/components/ui/textarea.jsx"
import { ScrollArea } from "@/components/ui/scroll-area.jsx"
import {
    Plus,
    Search,
    Filter,
    Trash2,
    Edit2,
    AlertCircle,
    Download,
    FileSpreadsheet
} from "lucide-react"
import { cn } from "@/lib/utils"

import './ResourceAllocation.css';

// Generate unique ID
const generateId = () => `ALLOC-${Date.now().toString(36).toUpperCase()}`;

// Empty allocation template
const emptyAllocation = {
    id: '',
    demandNumber: '',
    activityName: '',
    category: 'Project', // Project, Support, Maintenance
    resource: '',
    complexity: 'medium',
    priority: '',
    ticketId: '',
    slaDeadline: '',
    slaStatus: 'Within SLA',
    phase: '',
    taskName: '',
    status: 'open', // Task status
    tags: [], // Task tags

    plan: {
        taskStart: '',
        taskEnd: '',
        costProject: 0,
        costMonthly: 0,
    },
    actual: {
        taskStart: '',
        taskEnd: '',
        costProject: 0, // Actual cost (calculated from actual duration)
    },
    variance: {
        scheduleDays: 0, // Actual - Planned days (negative = early)
        costAmount: 0,   // Actual - Planned cost (negative = under budget)
    },
    workload: 0,
    remarks: '',
};

export default function ResourceAllocation() {
    const { state, dispatch } = useApp();
    const { members, phases, tasks, allocations, holidays, leaves, complexity, costs } = state;
    const [searchParams] = useSearchParams();

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [editingAllocation, setEditingAllocation] = useState(null);
    const [allocationToDelete, setAllocationToDelete] = useState(null);

    // Form state
    const [formData, setFormData] = useState(emptyAllocation);
    const [errors, setErrors] = useState({});

    // Filter states
    const [filterResource, setFilterResource] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterComplexity, setFilterComplexity] = useState('');
    const [searchText, setSearchText] = useState('');

    // Read URL query parameters on mount
    useEffect(() => {
        const resource = searchParams.get('resource');
        const category = searchParams.get('category');
        const complexityParam = searchParams.get('complexity');
        const status = searchParams.get('status');

        if (resource) setFilterResource(resource);
        if (category) setFilterCategory(category);
        if (complexityParam) setFilterComplexity(complexityParam);
        if (status) setFilterStatus(status);
    }, [searchParams]);

    // Filtered allocations
    const filteredAllocations = useMemo(() => {
        return allocations.filter(a => {
            if (filterResource && a.resource !== filterResource) return false;
            if (filterStatus && a.status !== filterStatus) return false;
            if (filterCategory && a.category?.toLowerCase() !== filterCategory.toLowerCase()) return false;
            if (filterComplexity && a.complexity?.toLowerCase() !== filterComplexity.toLowerCase()) return false;
            if (searchText) {
                const search = searchText.toLowerCase();
                const matchActivity = a.activityName?.toLowerCase().includes(search);
                const matchDemand = a.demandNumber?.toLowerCase().includes(search);
                const matchPhase = a.phase?.toLowerCase().includes(search);
                if (!matchActivity && !matchDemand && !matchPhase) return false;
            }
            return true;
        });
    }, [allocations, filterResource, filterStatus, filterCategory, filterComplexity, searchText]);

    // Dynamically filter tasks based on selected phase
    const taskOptions = useMemo(() => {
        const selectedPhase = phases.find(p => p.name === formData.phase);
        return tasks
            .filter(t => !formData.phase || t.phaseId === selectedPhase?.id)
            .map(t => ({ value: t.name, label: t.name }));
    }, [tasks, formData.phase, phases]);

    const complexityOptions = Object.values(complexity).map(level => ({
        value: level.level.toLowerCase(),
        label: level.label
    }));

    const workCategoryOptions = [
        { value: 'Project', label: 'Project' },
        { value: 'Support', label: 'Support' },
        { value: 'Maintenance', label: 'Maintenance' },
    ];

    const priorityOptions = [
        { value: 'P1', label: 'P1 - Critical' },
        { value: 'P2', label: 'P2 - High' },
        { value: 'P3', label: 'P3 - Medium' },
        { value: 'P4', label: 'P4 - Low' },
    ];

    // Calculate plan values when relevant form data changes
    const calculatedPlan = useMemo(() => {
        if (!formData.plan?.taskStart || !formData.resource || !formData.complexity) {
            return { taskEnd: '', costProject: 0, costMonthly: 0 };
        }

        const member = state.members.find(m => m.name === formData.resource);
        const costTierId = member?.costTierId;

        const taskEnd = calculatePlanEndDate(
            formData.plan.taskStart,
            formData.complexity,
            formData.resource,
            holidays,
            leaves,
            complexity
        );

        const isProject = formData.category === 'Project';
        const costProject = isProject ? calculateProjectCost(
            formData.complexity,
            costTierId || formData.resource,
            complexity,
            costs
        ) : 0;

        const costMonthly = calculateMonthlyCost(
            costProject,
            formData.plan.taskStart,
            taskEnd
        );

        return {
            taskEnd: taskEnd.toISOString().split('T')[0],
            costProject,
            costMonthly,
        };
    }, [formData.plan?.taskStart, formData.resource, formData.complexity, formData.category, holidays, leaves, complexity, costs, state.members]);

    // Open add modal
    const handleAdd = () => {
        setFormData({ ...emptyAllocation, id: generateId() });
        setEditingAllocation(null);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open edit modal
    const handleEdit = (allocation) => {
        setFormData({ ...allocation });
        setEditingAllocation(allocation);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open delete confirmation
    const handleDeleteClick = (allocation) => {
        setAllocationToDelete(allocation);
        setIsDeleteOpen(true);
    };

    // Handle form input change
    const handleChange = (name, value) => {
        setFormData(prev => {
            let next = { ...prev };

            if (name.includes('.')) {
                const [parent, child] = name.split('.');
                next[parent] = {
                    ...prev[parent],
                    [child]: value,
                };
            } else {
                next[name] = value;
            }

            if (name === 'category' && (value === 'Support' || value === 'Maintenance')) {
                const itOpsPhase = phases.find(p => p.name === 'IT Operations & Support');
                if (itOpsPhase) {
                    next.phase = itOpsPhase.name;
                    const currentTask = tasks.find(t => t.name === prev.taskName);
                    if (currentTask && currentTask.phaseId !== itOpsPhase.id) {
                        next.taskName = '';
                    }
                }
                if (!prev.plan?.taskStart) {
                    const today = new Date().toISOString().split('T')[0];
                    next.plan = { ...prev.plan, taskStart: today };
                }
            }

            if (name === 'phase') {
                const selectedPhase = phases.find(p => p.name === value);
                const currentTask = tasks.find(t => t.name === prev.taskName);
                if (value && currentTask && currentTask.phaseId !== selectedPhase?.id) {
                    next.taskName = '';
                }
            } else if (name === 'taskName') {
                const selectedTask = tasks.find(t => t.name === value);
                if (value && selectedTask) {
                    const taskPhase = phases.find(p => p.id === selectedTask.phaseId);
                    if (taskPhase && prev.phase !== taskPhase.name) {
                        next.phase = taskPhase.name;
                    }
                }
            }

            if (name === 'slaDeadline') {
                next.slaStatus = calculateSLAStatus(value);
            }

            return next;
        });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.activityName?.trim()) newErrors.activityName = 'Activity name is required';
        if (!formData.resource) newErrors.resource = 'Resource is required';
        if (!formData.taskName) newErrors.taskName = 'Task is required';
        if (!formData.plan?.taskStart) newErrors['plan.taskStart'] = 'Start date is required';

        if (formData.category === 'Support') {
            if (!formData.ticketId) newErrors.ticketId = 'Ticket ID is required';
            if (!formData.priority) newErrors.priority = 'Priority is required';
            if (!formData.slaDeadline) newErrors.slaDeadline = 'SLA Deadline is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const workload = calculateWorkloadPercentage(
            formData.taskName,
            formData.complexity,
            tasks
        );

        const allocationData = {
            ...formData,
            plan: {
                ...formData.plan,
                taskEnd: calculatedPlan.taskEnd,
                costProject: calculatedPlan.costProject,
                costMonthly: calculatedPlan.costMonthly,
            },
            workload,
        };

        if (editingAllocation) {
            dispatch({ type: ACTIONS.UPDATE_ALLOCATION, payload: allocationData });
        } else {
            dispatch({ type: ACTIONS.ADD_ALLOCATION, payload: allocationData });
        }
        setIsFormOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (allocationToDelete) {
            dispatch({ type: ACTIONS.DELETE_ALLOCATION, payload: allocationToDelete.id });
        }
        setAllocationToDelete(null);
        setIsDeleteOpen(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const columns = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
                        className="rounded border-slate-300 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={(e) => row.toggleSelected(!!e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 h-4 w-4 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "demandNumber",
            header: "Demand Number",
            cell: ({ row }) => <div className="font-bold text-slate-900 tabular-nums">{row.getValue("demandNumber") || "—"}</div>,
        },
        {
            accessorKey: "category",
            header: "Type",
            cell: ({ row }) => {
                const category = row.getValue("category");
                return (
                    <Badge variant={
                        category === 'Support' ? "success" :
                            category === 'Maintenance' ? "warning" : "default"
                    } className="font-semibold px-3">
                        {category}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "activityName",
            header: "Activity / Ticket",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5 max-w-[200px]">
                    {row.original.category === 'Support' && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.original.ticketId}</span>
                    )}
                    <span className="font-semibold text-slate-900 truncate" title={row.getValue("activityName")}>
                        {row.getValue("activityName")}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "resource",
            header: "Resource",
        },
        {
            accessorKey: "complexity",
            header: "Complexity",
            cell: ({ row }) => {
                const comp = row.getValue("complexity")?.toLowerCase();
                const label = complexity[comp]?.label || comp;
                return (
                    <Badge variant="secondary" className="font-medium px-2 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        {label.charAt(0).toUpperCase() + label.slice(1)}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "taskName",
            header: "Task / SLA",
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    {row.original.category === 'Support' && (
                        <div className="flex gap-1 items-center">
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: getPriorityColor(row.original.priority) }}
                                title={`Priority: ${row.original.priority}`}
                            />
                            <span className="text-[10px] font-medium text-slate-500">{row.original.slaStatus}</span>
                        </div>
                    )}
                    <span className="text-xs text-slate-600 line-clamp-1">{row.getValue("taskName")}</span>
                </div>
            ),
        },
        {
            accessorKey: "plan.taskStart",
            header: "Plan Start",
            cell: ({ row }) => <span className="text-slate-600 tabular-nums">{formatDate(row.original.plan?.taskStart)}</span>,
        },
        {
            accessorKey: "plan.taskEnd",
            header: "Plan End",
            cell: ({ row }) => <span className="text-slate-600 tabular-nums">{formatDate(row.original.plan?.taskEnd)}</span>,
        },
        {
            accessorKey: "plan.costProject",
            header: "Cost",
            cell: ({ row }) => <div className="text-right font-medium tabular-nums">{formatCurrency(row.original.plan?.costProject || 0)}</div>,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)} className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(row.original)} className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ], [phases, tasks, complexity]);

    const [sorting, setSorting] = useState([])
    const [rowSelection, setRowSelection] = useState({})

    const table = useReactTable({
        data: filteredAllocations,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            rowSelection,
        },
    })

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const hasSelection = selectedRows.length > 0;

    const handleBulkDeleteClick = () => {
        if (hasSelection) setIsBulkDeleteOpen(true);
    };

    const handleBulkDeleteConfirm = () => {
        selectedRows.forEach(row => {
            dispatch({ type: ACTIONS.DELETE_ALLOCATION, payload: row.original.id });
        });
        table.resetRowSelection();
        setIsBulkDeleteOpen(false);
    };

    const handleBulkStatusChange = (newStatus) => {
        if (!hasSelection || !newStatus) return;
        selectedRows.forEach(row => {
            dispatch({
                type: ACTIONS.UPDATE_ALLOCATION,
                payload: { ...row.original, status: newStatus }
            });
        });
        table.resetRowSelection();
    };

    return (
        <div className="allocation-page space-y-6 animate-in fade-in duration-500">
            {/* Action bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 px-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Actions & Bulk Operations</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {hasSelection && (
                        <div className="flex items-center gap-2 mr-2 bg-slate-500/10 p-1 rounded-xl border border-slate-500/20">
                            <span className="text-xs font-semibold px-2 text-slate-600 dark:text-slate-400">{selectedRows.length} selected</span>
                            <Select onValueChange={handleBulkStatusChange}>
                                <SelectTrigger className="h-8 w-[140px] bg-transparent border-none shadow-none text-xs text-slate-700 dark:text-slate-200">
                                    <SelectValue placeholder="Update Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getStatusOptions().map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleBulkDeleteClick}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <Button variant="outline" className="rounded-xl shadow-sm border-slate-200">
                        <Download className="mr-2 h-4 w-4 text-slate-500" />
                        Export
                    </Button>
                    <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100" onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add allocation
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="md:col-span-5 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search activity, demand #, phase..."
                        className="pl-9 bg-slate-500/5 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                <div className="md:col-span-3">
                    <Select value={filterResource} onValueChange={setFilterResource}>
                        <SelectTrigger className="bg-slate-500/5 border-slate-500/20 rounded-lg text-slate-700 dark:text-slate-200">
                            <SelectValue placeholder="All Resources" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Resources</SelectItem>
                            {members.map(m => (
                                <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="md:col-span-3">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="bg-slate-500/5 border-slate-500/20 rounded-lg text-slate-700 dark:text-slate-200">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {getStatusOptions().map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="md:col-span-1 flex items-center justify-end">
                    {(searchText || filterResource || filterStatus || filterCategory || filterComplexity) ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-slate-500 h-9"
                            onClick={() => {
                                setSearchText('');
                                setFilterResource('');
                                setFilterStatus('');
                                setFilterCategory('');
                                setFilterComplexity('');
                            }}
                        >
                            Reset
                        </Button>
                    ) : (
                        <div className="text-xs font-semibold text-slate-400 px-2 uppercase tracking-wider">{filteredAllocations.length} items</div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3 px-4 text-sm align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center align-middle text-slate-400">
                                    <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAllocation ? 'Edit Allocation' : 'Add Allocation'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAllocation ? `Updating details for ${editingAllocation.activityName}` : 'Create a new resource assignment'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[70vh] px-8 pb-8 overflow-y-auto">
                        <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="demandNumber" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Demand Number</Label>
                                    <Input
                                        id="demandNumber"
                                        placeholder="DM-000001"
                                        value={formData.demandNumber}
                                        onChange={(e) => handleChange('demandNumber', e.target.value)}
                                        className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Work Category</Label>
                                    <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                                        <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {workCategoryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="activityName" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Activity Name</Label>
                                    <Input
                                        id="activityName"
                                        value={formData.activityName}
                                        onChange={(e) => handleChange('activityName', e.target.value)}
                                        className={cn("rounded-xl border-slate-200", errors.activityName && "border-red-500")}
                                    />
                                    {errors.activityName && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.activityName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Complexity</Label>
                                    <Select value={formData.complexity} onValueChange={(v) => handleChange('complexity', v)}>
                                        <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {complexityOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {formData.category === 'Support' && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ticketId" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Ticket ID</Label>
                                        <Input id="ticketId" value={formData.ticketId} onChange={(e) => handleChange('ticketId', e.target.value)} className="rounded-xl border-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Priority</Label>
                                        <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                                            <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {priorityOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slaDeadline" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">SLA Deadline</Label>
                                        <Input id="slaDeadline" type="datetime-local" value={formData.slaDeadline} onChange={(e) => handleChange('slaDeadline', e.target.value)} className="rounded-xl border-slate-200" />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Resource</Label>
                                    <Select value={formData.resource} onValueChange={(v) => handleChange('resource', v)}>
                                        <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {members.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Phase</Label>
                                    <Select value={formData.phase} onValueChange={(v) => handleChange('phase', v)}>
                                        <SelectTrigger className="rounded-xl border-slate-200"><SelectValue placeholder="Select phase" /></SelectTrigger>
                                        <SelectContent>
                                            {phases.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Task</Label>
                                    <Select value={formData.taskName} onValueChange={(v) => handleChange('taskName', v)}>
                                        <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {taskOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="taskStart" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Start Date</Label>
                                    <Input id="taskStart" type="date" value={formData.plan?.taskStart || ''} onChange={(e) => handleChange('plan.taskStart', e.target.value)} className="rounded-xl border-slate-200" />
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Estimated End</p>
                                    <p className="text-sm font-black text-slate-900">{calculatedPlan.taskEnd ? formatDate(calculatedPlan.taskEnd) : '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Project Cost</p>
                                    <p className="text-sm font-black text-slate-900">{formData.category === 'Project' ? formatCurrency(calculatedPlan.costProject) : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Monthly Impact</p>
                                    <p className="text-sm font-black text-slate-900">{formatCurrency(calculatedPlan.costMonthly)}</p>
                                </div>
                            </div>



                            <div className="space-y-2">
                                <Label htmlFor="remarks" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Remarks</Label>
                                <Textarea id="remarks" value={formData.remarks} onChange={(e) => handleChange('remarks', e.target.value)} className="rounded-xl border-slate-200 min-h-[80px]" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="font-bold">Cancel</Button>
                        <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 px-8 font-bold">Save Allocation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center sm:text-center items-center">
                        <div className="h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                            <Trash2 className="h-8 w-8" />
                        </div>
                        <DialogTitle>Delete Allocation?</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this item? This cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="font-bold">Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} className="px-8 font-bold">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center sm:text-center items-center">
                        <div className="h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                            <AlertCircle className="h-8 w-8" />
                        </div>
                        <DialogTitle>Delete {selectedRows.length} Items?</DialogTitle>
                        <DialogDescription>This will permanently remove the selected allocations.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button variant="ghost" onClick={() => setIsBulkDeleteOpen(false)} className="font-bold">Cancel</Button>
                        <Button variant="destructive" onClick={handleBulkDeleteConfirm} className="px-8 font-bold">Delete All</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
