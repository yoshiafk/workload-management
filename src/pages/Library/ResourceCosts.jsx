import { useState, useMemo } from 'react';
import { useApp, ACTIONS } from '../../context/AppContext';
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
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Plus,
    Edit2,
    Trash2,
    Banknote,
    Search,
    ChevronDown,
    Settings,
    DollarSign,
    Calculator,
    Clock,
    Target
} from "lucide-react"
import { formatCurrency } from '../../utils/calculations';
import { defaultRoleTiers, getTierByRoleAndLevel, getRoleOptions } from '../../data';
import { cn } from "@/lib/utils"
import './LibraryPage.css';

// Generate unique ID
const generateId = () => `COST-${Date.now().toString(36).toUpperCase()}`;

// Working days per month and hours per day constants
const WORKING_DAYS_PER_MONTH = 20;
const WORKING_HOURS_PER_DAY = 8;

// Empty cost template
const emptyCost = {
    id: '',
    resourceName: '',
    roleType: 'FULLSTACK',
    tierLevel: 1,
    minMonthlyCost: 8000000,
    maxMonthlyCost: 12000000,
    monthlyCost: 10000000,
    perDayCost: 0,
    perHourCost: 0,
};

export default function ResourceCosts() {
    const { state, dispatch } = useApp();

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingCost, setEditingCost] = useState(null);
    const [costToDelete, setCostToDelete] = useState(null);

    // Form state
    const [formData, setFormData] = useState(emptyCost);
    const [errors, setErrors] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");

    // TanStack Table Columns
    const columns = useMemo(() => [
        {
            accessorKey: "resourceName",
            header: "Resource",
            cell: ({ row }) => <span className="font-semibold text-slate-900">{row.getValue("resourceName")}</span>,
        },
        {
            accessorKey: "roleType",
            header: "Role",
            cell: ({ row }) => {
                const type = row.getValue("roleType");
                const label = defaultRoleTiers[type]?.name || type;
                return (
                    <Badge variant={
                        type === 'FRONTEND' ? 'info' :
                            type === 'BACKEND' ? 'secondary' : 'success'
                    } className="font-semibold px-3">
                        {label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "tierLevel",
            header: "Tier",
            cell: ({ row }) => (
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 px-3">
                    Tier {row.getValue("tierLevel")}
                </Badge>
            ),
        },
        {
            accessorKey: "monthlyCost",
            header: () => <div className="text-right">Monthly Cost</div>,
            cell: ({ row }) => <div className="text-right font-bold text-slate-900 tabular-nums">{formatCurrency(row.getValue("monthlyCost"))}</div>,
        },
        {
            accessorKey: "perHourCost",
            header: () => <div className="text-right">Per Hour</div>,
            cell: ({ row }) => <div className="text-right font-medium text-slate-500 tabular-nums">{formatCurrency(row.getValue("perHourCost"))}</div>,
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => handleEdit(row.original)}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDeleteClick(row.original)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ], []);

    const [sorting, setSorting] = useState([]);

    const table = useReactTable({
        data: state.costs,
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
    const filteredCosts = useMemo(() => {
        if (!globalFilter) return state.costs;
        const filter = globalFilter.toLowerCase();
        return state.costs.filter(c =>
            c.resourceName.toLowerCase().includes(filter) ||
            c.roleType.toLowerCase().includes(filter)
        );
    }, [state.costs, globalFilter]);

    // Open add modal
    const handleAdd = () => {
        const tier = getTierByRoleAndLevel('FULLSTACK', 1);
        setFormData({
            ...emptyCost,
            id: generateId(),
            resourceName: tier?.name || 'Junior Fullstack',
            minMonthlyCost: tier?.minCost || 8000000,
            maxMonthlyCost: tier?.maxCost || 12000000,
            monthlyCost: tier?.midCost || 10000000,
            perDayCost: Math.round((tier?.midCost || 10000000) / WORKING_DAYS_PER_MONTH),
            perHourCost: Math.round((tier?.midCost || 10000000) / WORKING_DAYS_PER_MONTH / WORKING_HOURS_PER_DAY),
        });
        setEditingCost(null);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open edit modal
    const handleEdit = (cost) => {
        setFormData({ ...cost });
        setEditingCost(cost);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open delete confirmation
    const handleDeleteClick = (cost) => {
        setCostToDelete(cost);
        setIsDeleteOpen(true);
    };

    // Handle form input change
    const handleChange = (name, value) => {
        const updated = { ...formData, [name]: value };

        if (name === 'roleType' || name === 'tierLevel') {
            const tier = getTierByRoleAndLevel(updated.roleType, updated.tierLevel);
            if (tier) {
                updated.minMonthlyCost = tier.minCost;
                updated.maxMonthlyCost = tier.maxCost;
                updated.monthlyCost = tier.midCost;
                updated.resourceName = tier.name;
                updated.perDayCost = Math.round(tier.midCost / WORKING_DAYS_PER_MONTH);
                updated.perHourCost = Math.round(tier.midCost / WORKING_DAYS_PER_MONTH / WORKING_HOURS_PER_DAY);
            }
        }

        if (name === 'monthlyCost') {
            const numVal = parseInt(value) || 0;
            updated.monthlyCost = numVal;
            updated.perDayCost = Math.round(numVal / WORKING_DAYS_PER_MONTH);
            updated.perHourCost = Math.round(numVal / WORKING_DAYS_PER_MONTH / WORKING_HOURS_PER_DAY);
        }

        setFormData(updated);
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Validate form
    const validate = () => {
        const newErrors = {};
        if (!formData.resourceName.trim()) newErrors.resourceName = 'Name is required';
        if (!formData.monthlyCost || formData.monthlyCost < 1) newErrors.monthlyCost = 'Required';

        if (formData.monthlyCost < formData.minMonthlyCost) {
            newErrors.monthlyCost = `Min ${formatCurrency(formData.minMonthlyCost)}`;
        }
        if (formData.monthlyCost > formData.maxMonthlyCost) {
            newErrors.monthlyCost = `Max ${formatCurrency(formData.maxMonthlyCost)}`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = () => {
        if (!validate()) return;
        if (editingCost) {
            dispatch({ type: ACTIONS.UPDATE_COST, payload: formData });
        } else {
            dispatch({ type: ACTIONS.ADD_COST, payload: formData });
        }
        setIsFormOpen(false);
    };

    // Confirm delete
    const handleDeleteConfirm = () => {
        if (costToDelete) {
            dispatch({ type: ACTIONS.DELETE_COST, payload: costToDelete.id });
        }
        setIsDeleteOpen(false);
        setCostToDelete(null);
    };

    // Generate tier level options
    const getTierLevelOptions = (roleType) => {
        const role = defaultRoleTiers[roleType];
        if (!role) return [];
        return role.tiers.map(tier => ({
            value: tier.level.toString(),
            label: `Tier ${tier.level}: ${tier.name}`
        }));
    };

    return (
        <div className="library-page space-y-6 animate-in fade-in duration-500">
            {/* Header section with glass effect */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 glass-effect p-6 rounded-2xl border border-white/20 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <Banknote className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Resource Costs</h2>
                        <p className="text-sm text-slate-500 font-medium">Manage role-based salary tiers and hourly rates</p>
                    </div>
                </div>

                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95" onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add cost tier
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cost Tracking Settings Card */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 p-5 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                <Settings className="h-4 w-4" />
                            </div>
                            <h3 className="font-bold text-slate-800">Tracking Controls</h3>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(defaultRoleTiers).map(([roleKey, role]) => {
                                const isEnabled = state.settings?.costTrackingByRole?.[roleKey] ?? role.hasCostTracking;
                                return (
                                    <div key={roleKey} className="flex items-center justify-between group">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold text-slate-700">{role.name}</Label>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Cost Tracking</p>
                                        </div>
                                        <Switch
                                            checked={isEnabled}
                                            onCheckedChange={(checked) => {
                                                dispatch({
                                                    type: ACTIONS.UPDATE_SETTINGS,
                                                    payload: {
                                                        costTrackingByRole: {
                                                            ...state.settings?.costTrackingByRole,
                                                            [roleKey]: checked
                                                        }
                                                    }
                                                });
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200/50">
                        <div className="flex items-center gap-2 opacity-80 mb-4">
                            <Target className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Market Comparison</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed opacity-90">
                            Rates are automatically tiered based on current regional industry standards for technology resources.
                        </p>
                    </div>
                </div>

                {/* Table Container */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Filter Bar */}
                    <div className="flex items-center bg-white/40 glass-effect p-3 rounded-xl border border-white/20 shadow-sm">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                placeholder="Search costs..."
                                className="pl-9 bg-white/50 border-slate-200/50 rounded-lg h-9 focus-visible:ring-indigo-500"
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest h-10 py-3">
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
                                                <TableCell key={cell.id} className="py-3 px-4 text-sm align-middle">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-32 text-center align-middle">
                                            <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                                <Banknote className="h-8 w-8 opacity-20" />
                                                <p>No cost tiers found.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCost ? 'Edit Cost Tier' : 'Add Cost Tier'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure financial properties for this resource category.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role Type</Label>
                                <Select value={formData.roleType} onValueChange={(v) => handleChange('roleType', v)}>
                                    <SelectTrigger className="rounded-lg h-9">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getRoleOptions().map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level Tier</Label>
                                <Select value={formData.tierLevel.toString()} onValueChange={(v) => handleChange('tierLevel', parseInt(v))}>
                                    <SelectTrigger className="rounded-lg h-9">
                                        <SelectValue placeholder="Select tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getTierLevelOptions(formData.roleType).map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resource Display Name</Label>
                            <Input
                                value={formData.resourceName}
                                onChange={(e) => handleChange('resourceName', e.target.value)}
                                className={cn("rounded-lg h-9", errors.resourceName && "border-red-500")}
                                placeholder="e.g. Senior Backend Architect"
                            />
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Budget (IDR)</Label>
                            <div className="relative group">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                                <Input
                                    type="number"
                                    value={formData.monthlyCost}
                                    onChange={(e) => handleChange('monthlyCost', e.target.value)}
                                    className={cn("pl-9 pr-4 rounded-lg h-10 font-bold text-slate-900 group-focus-within:ring-emerald-500", errors.monthlyCost && "border-red-500")}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] px-1">
                                <span className="font-medium text-slate-400">Min: {formatCurrency(formData.minMonthlyCost)}</span>
                                <span className="font-medium text-slate-400">Max: {formatCurrency(formData.maxMonthlyCost)}</span>
                            </div>
                            {errors.monthlyCost && <p className="text-[10px] text-red-500 font-bold text-right">{errors.monthlyCost}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                    <Calculator className="h-3 w-3" />
                                    Per Day Rate
                                </div>
                                <div className="text-sm font-bold text-slate-900">{formatCurrency(formData.perDayCost)}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                    <Clock className="h-3 w-3" />
                                    Hourly Rate
                                </div>
                                <div className="text-sm font-bold text-slate-900">{formatCurrency(formData.perHourCost)}</div>
                            </div>
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
                            {editingCost ? 'Update' : 'Confirm'} tier
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 font-bold">Delete Cost Tier</DialogTitle>
                        <DialogDescription className="font-medium">
                            Are you sure you want to delete <span className="text-slate-900 font-bold">"{costToDelete?.resourceName}"</span>?
                            This cost configuration will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} className="rounded-xl bg-red-600 hover:bg-red-700 font-bold">Delete Tier</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
