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
import { validateAllocationCreation } from '../utils/validationEngine';
import { resourceAllocationEngine } from '../utils/resourceAllocation';
import { searchByDemandNumberEnhanced } from '../utils/dashboardEngine';

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getExpandedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    DataTable,
    DataTablePagination,
    DataTableToolbar,
    DataTableViewOptions,
} from "@/components/ui/DataTable"
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
    DialogTrigger,
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
    FileSpreadsheet,
    ChevronDown,
    ChevronRight,
    Calendar,
    Save,
    X as CloseIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDensity } from "@/context/DensityContext"
import { exportToCsv } from "@/utils/export"

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
    
    // Cost center integration
    costCenterId: '',
    costCenterSnapshot: null,
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
    const [validationResults, setValidationResults] = useState([]);
    const [isValidating, setIsValidating] = useState(false);
    const [strictEnforcement, setStrictEnforcement] = useState(true); // Enable strict over-allocation prevention

    // Filter states
    const [filterResource, setFilterResource] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterComplexity, setFilterComplexity] = useState('');
    const [searchText, setSearchText] = useState('');
    const [demandNumberSearch, setDemandNumberSearch] = useState(''); // New demand number search state

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
        let filtered = allocations;

        // Apply basic filters first
        filtered = filtered.filter(a => {
            if (filterResource && a.resource !== filterResource) return false;
            if (filterStatus && a.status !== filterStatus) return false;
            if (filterCategory && a.category?.toLowerCase() !== filterCategory.toLowerCase()) return false;
            if (filterComplexity && a.complexity?.toLowerCase() !== filterComplexity.toLowerCase()) return false;
            return true;
        });

        // Apply general search text
        if (searchText) {
            const search = searchText.toLowerCase();
            filtered = filtered.filter(a => {
                const matchActivity = a.activityName?.toLowerCase().includes(search);
                const matchDemand = a.demandNumber?.toLowerCase().includes(search);
                const matchPhase = a.phase?.toLowerCase().includes(search);
                return matchActivity || matchDemand || matchPhase;
            });
        }

        // Apply demand number search (enhanced search for Support issues)
        if (demandNumberSearch) {
            const searchResults = searchByDemandNumberEnhanced(filtered, demandNumberSearch, {
                includeAllCategories: true, // Search in all categories, not just Support
                searchInTicketId: true,
                searchInActivityName: true,
                includeRelated: true
            });
            
            // Combine main matches and related matches
            filtered = [...searchResults.mainMatches, ...searchResults.relatedMatches];
        }

        return filtered;
    }, [allocations, filterResource, filterStatus, filterCategory, filterComplexity, searchText, demandNumberSearch]);

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
        // Initialize default values
        let taskEnd = '';
        let costProject = 0;
        let costMonthly = 0;
        let costCenterSnapshot = null;

        // Find member information first
        const member = formData.resource ? state.members.find(m => m.name === formData.resource) : null;
        const costTierId = member?.costTierId;
        const memberCostCenterId = member?.costCenterId;
        const tierLevel = member?.tierLevel || 2; // Default to mid-tier if not specified

        // Find the cost center information
        const costCenter = memberCostCenterId ? state.costCenters.find(cc => cc.id === memberCostCenterId) : null;
        costCenterSnapshot = costCenter ? {
            id: costCenter.id,
            code: costCenter.code,
            name: costCenter.name,
        } : null;

        // Calculate end date if we have start date, complexity, and resource
        if (formData.plan?.taskStart && formData.complexity && formData.resource) {
            try {
                const endDate = calculatePlanEndDate(
                    formData.plan.taskStart,
                    formData.complexity,
                    formData.resource,
                    holidays,
                    leaves,
                    complexity
                );
                taskEnd = endDate.toISOString().split('T')[0];
            } catch (error) {
                console.warn('Error calculating end date:', error);
                taskEnd = '';
            }
        }

        // Calculate costs if we have the required fields and it's a Project
        const isProject = formData.category === 'Project';
        if (isProject && formData.complexity && (costTierId || formData.resource)) {
            try {
                // Use enhanced cost calculation with tier-based adjustments
                costProject = calculateProjectCost(
                    formData.complexity,
                    costTierId || formData.resource,
                    complexity,
                    costs,
                    tierLevel, // Pass tier level for enhanced calculations
                    1.0,       // Default to 100% allocation
                    false      // Use enhanced calculation, not legacy
                );

                // Calculate monthly cost if we have project cost and dates
                if (costProject > 0 && formData.plan?.taskStart && taskEnd) {
                    costMonthly = calculateMonthlyCost(
                        costProject,
                        formData.plan.taskStart,
                        taskEnd
                    );
                }
            } catch (error) {
                console.warn('Error calculating costs:', error);
                costProject = 0;
                costMonthly = 0;
            }
        }

        return {
            taskEnd,
            costProject,
            costMonthly,
            costCenterSnapshot,
        };
    }, [formData.plan?.taskStart, formData.resource, formData.complexity, formData.category, holidays, leaves, complexity, costs, state.members, state.costCenters]);

    // Open add modal
    const handleAdd = () => {
        const today = new Date().toISOString().split('T')[0];
        setFormData({ 
            ...emptyAllocation, 
            id: generateId(),
            plan: {
                ...emptyAllocation.plan,
                taskStart: today // Set default start date to today
            }
        });
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

            // Auto-set category-specific defaults
            if (name === 'category' && (value === 'Support' || value === 'Maintenance')) {
                const itOpsPhase = phases.find(p => p.name === 'IT Operations & Support');
                if (itOpsPhase) {
                    next.phase = itOpsPhase.name;
                    const currentTask = tasks.find(t => t.name === prev.taskName);
                    if (currentTask && currentTask.phaseId !== itOpsPhase.id) {
                        next.taskName = '';
                    }
                }
                // Set default start date if not already set
                if (!prev.plan?.taskStart) {
                    const today = new Date().toISOString().split('T')[0];
                    next.plan = { ...prev.plan, taskStart: today };
                }
            }

            // Handle phase changes
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

            // Handle SLA deadline changes
            if (name === 'slaDeadline') {
                next.slaStatus = calculateSLAStatus(value);
            }

            // Set default start date when resource or complexity is selected for Project category
            if ((name === 'resource' || name === 'complexity') && next.category === 'Project' && !next.plan?.taskStart) {
                const today = new Date().toISOString().split('T')[0];
                next.plan = { ...next.plan, taskStart: today };
            }

            return next;
        });

        // Clear related errors when fields are updated
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }

        // Clear validation results when key fields change
        if (['resource', 'allocationPercentage', 'plan.taskStart'].includes(name)) {
            setValidationResults([]);
            setErrors(prev => {
                const { overAllocation, validation, ...rest } = prev;
                return rest;
            });
        }
    };

    // Trigger validation when resource or allocation details change
    useEffect(() => {
        if (formData.resource && formData.plan?.taskStart && calculatedPlan.taskEnd) {
            // Debounce validation to avoid excessive calls
            const timeoutId = setTimeout(() => {
                validateAllocation();
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [formData.resource, formData.allocationPercentage, formData.plan?.taskStart, calculatedPlan.taskEnd]);

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

        // Add validation for cost calculation requirements
        if (formData.category === 'Project') {
            if (!formData.complexity) newErrors.complexity = 'Complexity is required for cost calculation';
            if (!formData.resource) newErrors.resource = 'Resource is required for cost calculation';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Comprehensive validation including over-allocation prevention
    const validateAllocation = async () => {
        if (!validate()) return false;

        setIsValidating(true);
        setValidationResults([]);

        try {
            // Prepare allocation data for validation
            const allocationData = {
                resource: formData.resource,
                allocationPercentage: formData.allocationPercentage || 1.0, // Default to 100%
                startDate: formData.plan?.taskStart,
                endDate: calculatedPlan.taskEnd,
                taskRequirements: [], // Could be enhanced to include skill requirements
                complexity: formData.complexity,
                category: formData.category
            };

            // Get existing allocations (exclude current allocation if editing)
            const existingAllocations = editingAllocation 
                ? allocations.filter(a => a.id !== editingAllocation.id)
                : allocations;

            // Run comprehensive validation
            const results = await validateAllocationCreation(
                allocationData,
                existingAllocations,
                members,
                leaves, // Leave schedules
                {
                    strictEnforcement,
                    allowOverAllocation: !strictEnforcement,
                    validateCapacityLimits: true,
                    validateLeaveSchedules: true
                }
            );

            setValidationResults(results);

            // Check if validation passed
            const hasErrors = results.some(r => r.severity === 'error' && !r.isValid);
            const hasWarnings = results.some(r => r.severity === 'warning');

            // In strict enforcement mode, prevent allocation if there are capacity errors
            if (strictEnforcement && hasErrors) {
                const capacityErrors = results.filter(r => 
                    r.type === 'capacity_limits' && r.severity === 'error' && !r.isValid
                );
                
                if (capacityErrors.length > 0) {
                    // Add specific error for over-allocation prevention
                    setErrors(prev => ({
                        ...prev,
                        overAllocation: 'Cannot create allocation: would cause over-allocation. Reduce allocation percentage or choose different resource.'
                    }));
                    return false;
                }
            }

            return !hasErrors;

        } catch (error) {
            console.error('Validation error:', error);
            setErrors(prev => ({
                ...prev,
                validation: `Validation failed: ${error.message}`
            }));
            return false;
        } finally {
            setIsValidating(false);
        }
    };

    const handleSubmit = async () => {
        // Run comprehensive validation including over-allocation prevention
        const isValid = await validateAllocation();
        if (!isValid) return;

        const workload = calculateWorkloadPercentage(
            formData.taskName,
            formData.complexity,
            tasks
        );

        // Get member's current cost center information
        const member = state.members.find(m => m.name === formData.resource);
        const memberCostCenterId = member?.costCenterId;

        const allocationData = {
            ...formData,
            plan: {
                ...formData.plan,
                taskEnd: calculatedPlan.taskEnd,
                costProject: calculatedPlan.costProject,
                costMonthly: calculatedPlan.costMonthly,
            },
            workload,
            allocationPercentage: formData.allocationPercentage || 1.0, // Ensure allocation percentage is set
            // Cost center integration
            costCenterId: memberCostCenterId || '',
            costCenterSnapshot: calculatedPlan.costCenterSnapshot,
        };

        if (editingAllocation) {
            dispatch({ type: ACTIONS.UPDATE_ALLOCATION, payload: allocationData });
        } else {
            dispatch({ type: ACTIONS.ADD_ALLOCATION, payload: allocationData });
        }
        setIsFormOpen(false);
        setValidationResults([]); // Clear validation results
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

    const { isDense } = useDensity();
    const [columnVisibility, setColumnVisibility] = useState({});
    const [expanded, setExpanded] = useState({});

    const columns = useMemo(() => [
        {
            id: "expander",
            header: () => null,
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => row.toggleExpanded()}
                >
                    {row.getIsExpanded() ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </Button>
            ),
            enableHiding: false,
        },
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
                        className="rounded border-border h-4 w-4 text-primary focus:ring-primary/20"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={(e) => row.toggleSelected(!!e.target.checked)}
                        className="rounded border-border h-4 w-4 text-primary focus:ring-primary/20 bg-background"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "demandNumber",
            header: "Demand #",
            cell: ({ row }) => <div className="font-bold text-foreground tabular-nums opacity-80">{row.getValue("demandNumber") || "—"}</div>,
        },
        {
            accessorKey: "category",
            header: "Type",
            cell: ({ row }) => {
                const category = row.getValue("category");
                return (
                    <Badge variant={
                        category === 'Support' ? "info" :
                            category === 'Maintenance' ? "warning" : "primary"
                    } className="font-bold px-2 py-0 h-5 text-[10px] uppercase tracking-wider">
                        {category}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "activityName",
            header: "Activity/Ticket",
            cell: ({ row }) => (
                <div className="flex flex-col gap-0.5 max-w-[200px]">
                    {row.original.category === 'Support' && (
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{row.original.ticketId}</span>
                    )}
                    <span className="font-bold text-foreground truncate" title={row.getValue("activityName")}>
                        {row.getValue("activityName")}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "resource",
            header: "Resource",
            cell: ({ row }) => {
                const value = row.getValue("resource");
                return (
                    <Select
                        value={value}
                        onValueChange={(newValue) => {
                            dispatch({
                                type: ACTIONS.UPDATE_ALLOCATION,
                                payload: { ...row.original, resource: newValue }
                            });
                        }}
                    >
                        <SelectTrigger className="h-7 bg-transparent border-none shadow-none px-0 focus:ring-0 text-sm font-medium hover:bg-muted/50 rounded-md transition-colors w-full justify-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-black text-primary">
                                {value?.charAt(0)}
                            </div>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {members.map(m => (
                                <SelectItem key={m.id} value={m.name} className="text-xs">{m.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            }
        },
        {
            accessorKey: "costCenterSnapshot",
            header: "Cost Center",
            cell: ({ row }) => {
                const costCenter = row.original.costCenterSnapshot;
                if (!costCenter) {
                    return <span className="text-xs text-muted-foreground">Not assigned</span>;
                }
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-foreground">{costCenter.code}</span>
                        <span className="text-[10px] text-muted-foreground">{costCenter.name}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status");
                const options = getStatusOptions();
                const option = options.find(o => o.value === status) || { label: status, variant: 'secondary' };

                return (
                    <Select
                        value={status}
                        onValueChange={(newValue) => {
                            dispatch({
                                type: ACTIONS.UPDATE_ALLOCATION,
                                payload: { ...row.original, status: newValue }
                            });
                        }}
                    >
                        <SelectTrigger className="h-7 bg-transparent border-none shadow-none px-0 focus:ring-0 rounded-md hover:bg-muted/50 transition-colors w-[120px] justify-start">
                            <Badge variant={option.variant || "secondary"} className="font-bold py-0 h-5 text-[10px] uppercase tracking-wider cursor-pointer">
                                {option.label}
                                <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                            </Badge>
                        </SelectTrigger>
                        <SelectContent>
                            {options.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs font-bold uppercase tracking-widest">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            }
        },
        {
            accessorKey: "plan.taskStart",
            header: "Start",
            cell: ({ row }) => <span className="text-muted-foreground font-medium tabular-nums">{formatDate(row.original.plan?.taskStart)}</span>,
        },
        {
            accessorKey: "plan.taskEnd",
            header: "End",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-foreground font-bold tabular-nums">{formatDate(row.original.plan?.taskEnd)}</span>
                    {row.original.category === 'Support' && (
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            row.original.slaStatus === 'Violated' ? "text-destructive" : "text-success"
                        )}>
                            {row.original.slaStatus}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "plan.costProject",
            header: "Cost",
            cell: ({ row }) => (
                <div className="text-right font-bold tabular-nums text-primary/80">
                    {row.original.category === 'Project' ? formatCurrency(row.original.plan?.costProject || 0) : '—'}
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-right pr-4">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1 pr-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(row.original)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(row.original)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
            enableHiding: false,
        },
    ], [phases, tasks, complexity, isDense, members, dispatch]);

    const [sorting, setSorting] = useState([])
    const [rowSelection, setRowSelection] = useState({})
    const [columnFilters, setColumnFilters] = useState([])

    const table = useReactTable({
        data: filteredAllocations,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            rowSelection,
            columnFilters,
            columnVisibility,
            expanded,
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
        <div className="allocation-page space-y-4 animate-in fade-in duration-500">
            {/* Action Bar & Toolbar */}
            <DataTableToolbar
                table={table}
                searchKey="activityName"
                searchPlaceholder="Search activities..."
                filters={
                    <div className="flex items-center gap-2">
                        {/* Demand Number Search - Show prominently for Support issues */}
                        <div className="relative">
                            <Input
                                placeholder="Search demand numbers..."
                                value={demandNumberSearch}
                                onChange={(e) => setDemandNumberSearch(e.target.value)}
                                className={cn(
                                    "bg-muted/30 border-none shadow-none text-xs font-bold pl-8",
                                    isDense ? "h-8 w-[180px]" : "h-10 w-[200px]",
                                    demandNumberSearch && "bg-primary/10 border-primary/20"
                                )}
                            />
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            {demandNumberSearch && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-muted"
                                    onClick={() => setDemandNumberSearch('')}
                                >
                                    <CloseIcon className="h-3 w-3" />
                                </Button>
                            )}
                        </div>

                        <Select value={filterResource} onValueChange={setFilterResource}>
                            <SelectTrigger className={cn("bg-muted/30 border-none shadow-none text-xs font-bold", isDense ? "h-8 w-[140px]" : "h-10 w-[160px]")}>
                                <SelectValue placeholder="All Resources" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Resources</SelectItem>
                                {members.map(m => (
                                    <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className={cn("bg-muted/30 border-none shadow-none text-xs font-bold", isDense ? "h-8 w-[140px]" : "h-10 w-[160px]")}>
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {getStatusOptions().map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className={cn("bg-muted/30 border-none shadow-none text-xs font-bold", isDense ? "h-8 w-[120px]" : "h-10 w-[140px]")}>
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Support">Support</SelectItem>
                                <SelectItem value="Project">Project</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                }
                actions={
                    <div className="flex items-center gap-2">
                        {hasSelection && (
                            <div className="flex items-center gap-1 bg-primary/5 p-1 rounded-xl border border-primary/10 mr-2">
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 text-primary/60">{selectedRows.length} Selected</span>
                                <Select onValueChange={handleBulkStatusChange}>
                                    <SelectTrigger className="h-8 w-[130px] bg-transparent border-none shadow-none text-xs font-bold">
                                        <SelectValue placeholder="Update Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getStatusOptions().map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={handleBulkDeleteClick}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <DataTableViewOptions table={table} />

                        <Button
                            variant="outline"
                            className={cn("rounded-xl font-bold uppercase tracking-wider text-xs", isDense ? "h-8" : "h-10")}
                            onClick={() => exportToCsv(filteredAllocations, 'allocations.csv')}
                        >
                            <Download className="mr-2 h-4 w-4 opacity-60" />
                            Export
                        </Button>

                        <Button
                            className={cn("rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20", isDense ? "h-8" : "h-10")}
                            onClick={handleAdd}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Entry
                        </Button>
                    </div>
                }
            />

            {/* Search Results Info */}
            {demandNumberSearch && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-lg">
                    <Search className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                        Searching for demand number: <strong>"{demandNumberSearch}"</strong>
                    </span>
                    <span className="text-xs text-muted-foreground">
                        ({filteredAllocations.length} result{filteredAllocations.length !== 1 ? 's' : ''} found)
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-6 px-2 text-xs"
                        onClick={() => setDemandNumberSearch('')}
                    >
                        Clear search
                    </Button>
                </div>
            )}

            {/* Main Table */}
            <DataTable
                table={table}
                columns={columns}
                isLoading={false}
                renderSubComponent={({ row }) => (
                    <div className="p-4 px-12 bg-muted/20 border-t border-border/40 grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Remarks & Notes</h4>
                            <p className="text-xs font-medium text-foreground/80 leading-relaxed italic">
                                {row.original.remarks || "No remarks provided for this allocation."}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Actual Progress</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-muted-foreground">Start:</span>
                                        <span className="text-foreground">{formatDate(row.original.actual?.taskStart)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-muted-foreground">End:</span>
                                        <span className="text-foreground">{formatDate(row.original.actual?.taskEnd) || "In Progress"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 text-right">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Actual Cost</h4>
                                <p className="text-lg font-black text-primary tabular-nums">
                                    {row.original.category === 'Project' ? formatCurrency(row.original.actual?.costProject || 0) : "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            />

            {/* Pagination */}
            <DataTablePagination table={table} />

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
                                    <p className="text-sm font-black text-slate-900">
                                        {calculatedPlan.taskEnd ? formatDate(calculatedPlan.taskEnd) : 
                                         (formData.plan?.taskStart && formData.complexity && formData.resource ? 'Calculating...' : 'Select required fields')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Project Cost</p>
                                    <p className="text-sm font-black text-slate-900">
                                        {formData.category === 'Project' ? (
                                            calculatedPlan.costProject > 0 ? formatCurrency(calculatedPlan.costProject) :
                                            (formData.complexity && formData.resource ? 'Calculating...' : 'Select complexity & resource')
                                        ) : 'N/A'}
                                    </p>
                                    {formData.category === 'Project' && !formData.complexity && (
                                        <p className="text-[9px] text-amber-600 mt-1">⚠ Complexity required</p>
                                    )}
                                    {formData.category === 'Project' && !formData.resource && (
                                        <p className="text-[9px] text-amber-600 mt-1">⚠ Resource required</p>
                                    )}
                                    {formData.category === 'Project' && formData.complexity && formData.resource && calculatedPlan.costProject === 0 && (
                                        <p className="text-[9px] text-blue-600 mt-1">ℹ Using enhanced tier-based calculation</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Monthly Impact</p>
                                    <p className="text-sm font-black text-slate-900">
                                        {calculatedPlan.costMonthly > 0 ? formatCurrency(calculatedPlan.costMonthly) :
                                         (formData.plan?.taskStart && calculatedPlan.costProject > 0 ? 'Calculating...' : 'Complete form for calculation')}
                                    </p>
                                </div>
                            </div>

                            {/* Allocation Percentage Control */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="allocationPercentage" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                        Allocation Percentage
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="allocationPercentage"
                                            type="number"
                                            min="0.1"
                                            max="1.0"
                                            step="0.1"
                                            value={formData.allocationPercentage || 1.0}
                                            onChange={(e) => handleChange('allocationPercentage', parseFloat(e.target.value) || 1.0)}
                                            className="rounded-xl border-slate-200"
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            ({((formData.allocationPercentage || 1.0) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground ml-1">
                                        0.1 (10%) to 1.0 (100%) of resource capacity
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                        Enforcement Mode
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="strictEnforcement"
                                            checked={strictEnforcement}
                                            onChange={(e) => setStrictEnforcement(e.target.checked)}
                                            className="rounded border-border h-4 w-4 text-primary focus:ring-primary/20"
                                        />
                                        <Label htmlFor="strictEnforcement" className="text-xs font-medium">
                                            Strict over-allocation prevention
                                        </Label>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground ml-1">
                                        {strictEnforcement ? 'Prevent allocations that would cause over-allocation' : 'Allow over-allocation with warnings'}
                                    </p>
                                </div>
                            </div>

                            {/* Validation Results Display */}
                            {validationResults.length > 0 && (
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                        Capacity & Validation Status
                                    </Label>
                                    <div className="space-y-2">
                                        {validationResults.map((result, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "p-3 rounded-lg border text-xs",
                                                    result.severity === 'error' && !result.isValid
                                                        ? "bg-red-50 border-red-200 text-red-800"
                                                        : result.severity === 'warning'
                                                        ? "bg-amber-50 border-amber-200 text-amber-800"
                                                        : "bg-green-50 border-green-200 text-green-800"
                                                )}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full mt-1 flex-shrink-0",
                                                        result.severity === 'error' && !result.isValid
                                                            ? "bg-red-500"
                                                            : result.severity === 'warning'
                                                            ? "bg-amber-500"
                                                            : "bg-green-500"
                                                    )} />
                                                    <div className="flex-1">
                                                        <p className="font-bold mb-1">{result.message}</p>
                                                        {result.details?.recommendations && result.details.recommendations.length > 0 && (
                                                            <ul className="list-disc list-inside space-y-1 text-[10px] opacity-80">
                                                                {result.details.recommendations.map((rec, i) => (
                                                                    <li key={i}>{rec}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {result.details?.conflicts && result.details.conflicts.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="font-bold text-[10px] uppercase tracking-wider mb-1">Conflicts:</p>
                                                                <ul className="space-y-1 text-[10px]">
                                                                    {result.details.conflicts.map((conflict, i) => (
                                                                        <li key={i} className="flex justify-between">
                                                                            <span>{conflict.projectName || conflict.type}</span>
                                                                            {conflict.allocationPercentage && (
                                                                                <span className="font-bold">
                                                                                    {(conflict.allocationPercentage * 100).toFixed(0)}%
                                                                                </span>
                                                                            )}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Display over-allocation error */}
                            {errors.overAllocation && (
                                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <p className="text-sm font-bold text-red-800">{errors.overAllocation}</p>
                                    </div>
                                </div>
                            )}

                            {/* Display validation error */}
                            {errors.validation && (
                                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <p className="text-sm font-bold text-red-800">{errors.validation}</p>
                                    </div>
                                </div>
                            )}



                            <div className="space-y-2">
                                <Label htmlFor="remarks" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Remarks</Label>
                                <Textarea id="remarks" value={formData.remarks} onChange={(e) => handleChange('remarks', e.target.value)} className="rounded-xl border-slate-200 min-h-[80px]" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="font-bold">Cancel</Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={isValidating || (strictEnforcement && errors.overAllocation)}
                            className="shadow-lg px-8 font-bold"
                        >
                            {isValidating ? 'Validating...' : 'Save Allocation'}
                        </Button>
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
