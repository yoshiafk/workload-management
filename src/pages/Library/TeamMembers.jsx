import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp, ACTIONS } from '../../context/AppContext';
import { defaultRoleTiers, getRoleOptions, roleHasCostTracking } from '../../data/defaultRoleTiers';
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
import { Checkbox } from "@/components/ui/checkbox"
import { FormField, FormGrid, FormSection } from "@/components/ui/form-field"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    Plus,
    Edit2,
    Trash2,
    UserPlus,
    Users,
    Search,
    ChevronRight,
    Building2,
    CheckSquare
} from "lucide-react"
import { cn } from "@/lib/utils"
import './LibraryPage.css';

// Generate unique ID
const generateId = () => `MEM-${Date.now().toString(36).toUpperCase()}`;

// Empty member template
const emptyMember = {
    id: '',
    name: '',
    type: 'FULLSTACK',
    maxHoursPerWeek: 40,
    costTierId: '',
    costCenterId: '',
    defaultCoaId: '',
    isActive: true,
};

export default function TeamMembers() {
    const { state, dispatch } = useApp();

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [memberToDelete, setMemberToDelete] = useState(null);

    // Form state
    const [formData, setFormData] = useState(emptyMember);
    const [errors, setErrors] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");

    // Bulk assignment state
    const [selectedMembers, setSelectedMembers] = useState(new Set());
    const [bulkCostCenterId, setBulkCostCenterId] = useState('');
    const [bulkCoaId, setBulkCoaId] = useState('');
    const [bulkType, setBulkType] = useState('cost-center'); // 'cost-center' or 'coa'

    // TanStack Table Columns
    const columns = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => {
                        table.toggleAllPageRowsSelected(!!value);
                        if (value) {
                            setSelectedMembers(new Set(state.members.map(m => m.id)));
                        } else {
                            setSelectedMembers(new Set());
                        }
                    }}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedMembers.has(row.original.id)}
                    onCheckedChange={(value) => {
                        const newSelected = new Set(selectedMembers);
                        if (value) {
                            newSelected.add(row.original.id);
                        } else {
                            newSelected.delete(row.original.id);
                        }
                        setSelectedMembers(newSelected);
                    }}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <span className="text-[10px] font-mono text-slate-400">{row.getValue("id")}</span>,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => <span className="font-semibold text-slate-900">{row.getValue("name")}</span>,
        },
        {
            accessorKey: "type",
            header: "Role",
            cell: ({ row }) => {
                const type = row.getValue("type");
                const label = defaultRoleTiers[type]?.name || type;
                return (
                    <Badge variant={
                        type === 'FRONTEND' ? 'info' :
                            type === 'BACKEND' ? 'secondary' : 'success'
                    } className="font-semibold px-3">
                        {label}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "costTierId",
            header: "Cost Tier",
            cell: ({ row }) => {
                const costTier = state.costs.find(c => c.id === row.original.costTierId);
                return costTier ? (
                    <span className="text-sm text-slate-600">{costTier.resourceName}</span>
                ) : (
                    <Link to="/workload-management/library/costs" className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 group">
                        Not linked
                        <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                );
            },
        },
        {
            accessorKey: "costCenterId",
            header: "Cost Center",
            cell: ({ row }) => {
                const costCenter = state.costCenters.find(cc => cc.id === row.original.costCenterId);
                return costCenter ? (
                    <span className="text-sm text-slate-600">{costCenter.name}</span>
                ) : (
                    <span className="text-xs text-slate-400">Not assigned</span>
                );
            },
        },
        {
            accessorKey: "maxHoursPerWeek",
            header: "Cap / Week",
            cell: ({ row }) => <span className="tabular-nums font-medium text-slate-600">{row.getValue("maxHoursPerWeek")}h</span>,
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => (
                <Badge className={cn(
                    "rounded-full px-2 py-0 text-[10px] uppercase font-bold",
                    row.getValue("isActive") ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "bg-slate-500/10 text-slate-600 border-slate-200"
                )}>
                    {row.getValue("isActive") ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            accessorKey: "defaultCoaId",
            header: "Default Account",
            cell: ({ row }) => {
                const coa = state.coa.find(c => c.id === row.original.defaultCoaId);
                return coa ? (
                    <span className="text-sm text-slate-600 font-medium">{coa.code}</span>
                ) : (
                    <span className="text-xs text-slate-400">Not assigned</span>
                );
            },
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
    ], [state.costs, state.costCenters]);

    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data: state.members,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
            globalFilter,
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
    });

    // filtered data for display count
    const filteredMembers = useMemo(() => {
        if (!globalFilter) return state.members;
        const filter = globalFilter.toLowerCase();
        return state.members.filter(m =>
            m.name.toLowerCase().includes(filter) ||
            m.type.toLowerCase().includes(filter)
        );
    }, [state.members, globalFilter]);

    // Open add modal
    const handleAdd = () => {
        setFormData({ ...emptyMember, id: generateId() });
        setEditingMember(null);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open edit modal
    const handleEdit = (member) => {
        setFormData({ ...member });
        setEditingMember(member);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open delete confirmation
    const handleDeleteClick = (member) => {
        setMemberToDelete(member);
        setIsDeleteOpen(true);
    };

    // Handle form input change
    const handleChange = (name, value) => {
        // Convert special select values back to empty strings
        if (name === 'costCenterId' && value === 'no-cost-center') {
            value = '';
        }
        if (name === 'costTierId' && value === 'none') {
            value = '';
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Validate form
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.type) newErrors.type = 'Role type is required';
        if (!formData.maxHoursPerWeek || formData.maxHoursPerWeek < 1) {
            newErrors.maxHoursPerWeek = 'Max hours must be at least 1';
        }

        // Validate cost center assignment (Mandatory per Recommendation 2.1)
        if (!formData.costCenterId) {
            newErrors.costCenterId = 'Cost Center assignment is mandatory';
        } else {
            const costCenter = state.costCenters.find(cc => cc.id === formData.costCenterId);
            if (!costCenter) {
                newErrors.costCenterId = 'Selected cost center does not exist';
            } else if (!costCenter.isActive) {
                newErrors.costCenterId = 'Cannot assign to inactive cost center';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = () => {
        if (!validate()) return;
        if (editingMember) {
            dispatch({ type: ACTIONS.UPDATE_MEMBER, payload: formData });
        } else {
            dispatch({ type: ACTIONS.ADD_MEMBER, payload: formData });
        }
        setIsFormOpen(false);
    };

    // Confirm delete
    const handleDeleteConfirm = () => {
        if (memberToDelete) {
            dispatch({ type: ACTIONS.DELETE_MEMBER, payload: memberToDelete.id });
        }
        setIsDeleteOpen(false);
        setMemberToDelete(null);
    };

    // Bulk assignment functions
    const handleBulkAssign = (type = 'cost-center') => {
        if (selectedMembers.size === 0) return;
        setBulkType(type);
        setBulkCostCenterId('');
        setBulkCoaId('');
        setIsBulkAssignOpen(true);
    };

    const handleBulkAssignSubmit = () => {
        if (bulkType === 'cost-center') {
            // Convert special select value back to empty string
            let assignedCostCenterId = bulkCostCenterId;
            if (bulkCostCenterId === 'no-cost-center') {
                assignedCostCenterId = '';
            }

            // If assigning to a real cost center, validate it
            if (assignedCostCenterId) {
                const costCenter = state.costCenters.find(cc => cc.id === assignedCostCenterId);
                if (!costCenter || !costCenter.isActive) {
                    return;
                }
            }

            // Update all selected members
            selectedMembers.forEach(memberId => {
                const member = state.members.find(m => m.id === memberId);
                if (member) {
                    const updatedMember = {
                        ...member,
                        costCenterId: assignedCostCenterId,
                        updatedAt: new Date().toISOString(),
                    };
                    dispatch({ type: ACTIONS.UPDATE_MEMBER, payload: updatedMember });
                }
            });
        } else {
            // COA assignment
            let assignedCoaId = bulkCoaId;
            if (bulkCoaId === 'no-coa') {
                assignedCoaId = '';
            }

            selectedMembers.forEach(memberId => {
                const member = state.members.find(m => m.id === memberId);
                if (member) {
                    const updatedMember = {
                        ...member,
                        defaultCoaId: assignedCoaId,
                        updatedAt: new Date().toISOString(),
                    };
                    dispatch({ type: ACTIONS.UPDATE_MEMBER, payload: updatedMember });
                }
            });
        }

        // Clear selection and close modal
        setSelectedMembers(new Set());
        setIsBulkAssignOpen(false);
        setBulkCostCenterId('');
        setBulkCoaId('');
    };

    const handleClearSelection = () => {
        setSelectedMembers(new Set());
    };

    return (
        <div className="library-page space-y-6 animate-in fade-in duration-500">
            {/* Header section with glass effect */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-900">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Team Members</h2>
                        <p className="text-sm text-slate-500 font-medium dark:text-slate-400">Manage your team and resource capacity</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button className="rounded-xl shadow-lg dark:shadow-none transition-all active:scale-95" onClick={handleAdd}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add member
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedMembers.size > 0 && (
                <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                            {selectedMembers.size} member{selectedMembers.size !== 1 ? 's' : ''} selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearSelection}
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                        >
                            Clear selection
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleBulkAssign('cost-center')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Building2 className="mr-2 h-4 w-4" />
                            Assign Cost Center
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleBulkAssign('coa')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Assign COA
                        </Button>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                        placeholder="Search by name or role..."
                        className="pl-9 bg-muted border-slate-200 dark:border-slate-800 rounded-lg focus-visible:ring-indigo-500"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>
                <div className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider dark:text-slate-500">
                    {filteredMembers.length} OF {state.members.length} MEMBERS
                </div>
            </div>

            {/* Table Container */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider h-10 py-3">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
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
                                        <Users className="h-8 w-8 opacity-20" />
                                        <p>No team members found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure profile, role, and capacity for this resource.
                        </DialogDescription>
                    </DialogHeader>

                    <FormSection>
                        <FormGrid>
                            <FormField label="Name" error={errors.name} required>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className={cn("rounded-lg h-9", errors.name && "border-red-500")}
                                    placeholder="e.g. John Doe"
                                />
                            </FormField>

                            <FormField label="Role Type" required>
                                <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                                    <SelectTrigger className="rounded-lg h-9">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getRoleOptions().map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </FormGrid>

                        <FormField label="Max Hours per Week" required>
                            <Input
                                type="number"
                                value={formData.maxHoursPerWeek}
                                onChange={(e) => handleChange('maxHoursPerWeek', parseInt(e.target.value))}
                                className="rounded-lg h-9"
                                placeholder="e.g. 40"
                            />
                        </FormField>

                        {roleHasCostTracking(formData.type) && (
                            <FormField label="Cost Tier">
                                <Select
                                    value={formData.costTierId || 'none'}
                                    onValueChange={(v) => handleChange('costTierId', v)}
                                >
                                    <SelectTrigger className="rounded-lg h-9">
                                        <SelectValue placeholder="Select cost tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Select cost tier...</SelectItem>
                                        {state.costs
                                            .filter(cost => cost.roleType === formData.type)
                                            .map(cost => (
                                                <SelectItem key={cost.id} value={cost.id}>
                                                    {cost.resourceName} - Tier {cost.tierLevel}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        )}

                        <FormField label="Cost Center" error={errors.costCenterId}>
                            <Select
                                value={formData.costCenterId || 'no-cost-center'}
                                onValueChange={(v) => handleChange('costCenterId', v)}
                            >
                                <SelectTrigger className="rounded-lg h-9">
                                    <SelectValue placeholder="Select cost center" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no-cost-center">No cost center</SelectItem>
                                    {state.costCenters
                                        .filter(cc => cc.isActive)
                                        .map(costCenter => (
                                            <SelectItem key={costCenter.id} value={costCenter.id}>
                                                {costCenter.code} - {costCenter.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Default Account (COA)">
                            <Select
                                value={formData.defaultCoaId || 'no-coa'}
                                onValueChange={(v) => handleChange('defaultCoaId', v === 'no-coa' ? '' : v)}
                            >
                                <SelectTrigger className="rounded-lg h-9">
                                    <SelectValue placeholder="Select account..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no-coa">No account (use tier default)</SelectItem>
                                    {state.coa
                                        .filter(c => c.isActive)
                                        .map(account => (
                                            <SelectItem key={account.id} value={account.id}>
                                                {account.code} - {account.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <div className="flex items-center space-x-3 pt-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(v) => handleChange('isActive', v)}
                            />
                            <Label htmlFor="isActive" className="text-sm font-medium leading-none cursor-pointer">
                                Active Member
                            </Label>
                        </div>
                    </FormSection>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsFormOpen(false)}
                            className="font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="shadow-lg px-8 font-bold"
                        >
                            {editingMember ? 'Update' : 'Add'} member
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Team Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-bold text-slate-900">"{memberToDelete?.name}"</span>?
                            This action cannot be undone and may affect active allocations.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} className="rounded-xl bg-red-600 hover:bg-red-700">Delete Member</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Assignment Dialog */}
            <Dialog open={isBulkAssignOpen} onOpenChange={setIsBulkAssignOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {bulkType === 'cost-center' ? <Building2 className="h-5 w-5 text-indigo-600" /> : <CheckSquare className="h-5 w-5 text-emerald-600" />}
                            Bulk {bulkType === 'cost-center' ? 'Cost Center' : 'Account'} Assignment
                        </DialogTitle>
                        <DialogDescription>
                            Assign a {bulkType === 'cost-center' ? 'cost center' : 'chart of account'} to {selectedMembers.size} selected team member{selectedMembers.size !== 1 ? 's' : ''}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {bulkType === 'cost-center' ? (
                            <FormField label="Cost Center" required>
                                <Select
                                    value={bulkCostCenterId || 'no-cost-center'}
                                    onValueChange={setBulkCostCenterId}
                                >
                                    <SelectTrigger className="rounded-lg h-9">
                                        <SelectValue placeholder="Select cost center" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no-cost-center">No cost center</SelectItem>
                                        {state.costCenters
                                            .filter(cc => cc.isActive)
                                            .map(costCenter => (
                                                <SelectItem key={costCenter.id} value={costCenter.id}>
                                                    {costCenter.code} - {costCenter.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        ) : (
                            <FormField label="Chart of Accounts" required>
                                <Select
                                    value={bulkCoaId || 'no-coa'}
                                    onValueChange={setBulkCoaId}
                                >
                                    <SelectTrigger className="rounded-lg h-9">
                                        <SelectValue placeholder="Select account..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no-coa">No account</SelectItem>
                                        {state.coa
                                            .filter(c => c.isActive)
                                            .map(account => (
                                                <SelectItem key={account.id} value={account.id}>
                                                    {account.code} - {account.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        )}

                        {selectedMembers.size > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Selected Members:</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {Array.from(selectedMembers).map(memberId => {
                                        const member = state.members.find(m => m.id === memberId);
                                        return member ? (
                                            <div key={memberId} className="text-sm text-slate-700 dark:text-slate-300">
                                                {member.name} ({member.type})
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsBulkAssignOpen(false)}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkAssignSubmit}
                            disabled={bulkType === 'cost-center' ? !bulkCostCenterId : !bulkCoaId}
                            className={cn(
                                "rounded-xl font-bold",
                                bulkType === 'cost-center' ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"
                            )}
                        >
                            Assign to {selectedMembers.size} Member{selectedMembers.size !== 1 ? 's' : ''}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
