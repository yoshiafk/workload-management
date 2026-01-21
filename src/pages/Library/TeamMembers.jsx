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
import { Label } from "@/components/ui/label"
import {
    Plus,
    Edit2,
    Trash2,
    UserPlus,
    Users,
    Search,
    ChevronRight
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
    isActive: true,
};

export default function TeamMembers() {
    const { state, dispatch } = useApp();

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [memberToDelete, setMemberToDelete] = useState(null);

    // Form state
    const [formData, setFormData] = useState(emptyMember);
    const [errors, setErrors] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");

    // TanStack Table Columns
    const columns = useMemo(() => [
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
    ], [state.costs]);

    const [sorting, setSorting] = useState([]);

    const table = useReactTable({
        data: state.members,
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

                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95" onClick={handleAdd}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add member
                </Button>
            </div>

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

                    <div className="p-8 space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={cn("rounded-lg", errors.name && "border-red-500")}
                                placeholder="e.g. John Doe"
                            />
                            {errors.name && <p className="text-[10px] text-red-500 font-medium">{errors.name}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Label htmlFor="type" className="text-right">Role Type</Label>
                            <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                                <SelectTrigger className="rounded-lg">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getRoleOptions().map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Label htmlFor="hours" className="text-right">Max Hours per Week</Label>
                            <Input
                                id="hours"
                                type="number"
                                value={formData.maxHoursPerWeek}
                                onChange={(e) => handleChange('maxHoursPerWeek', parseInt(e.target.value))}
                                className="rounded-lg"
                            />
                        </div>
                        {roleHasCostTracking(formData.type) && (
                            <div className="grid grid-cols-2 gap-4">
                                <Label htmlFor="costTier" className="text-right">Cost Tier</Label>
                                <Select value={formData.costTierId} onValueChange={(v) => handleChange('costTierId', v)}>
                                    <SelectTrigger className="rounded-lg">
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
                            </div>
                        )}
                        <div className="flex items-center space-x-2 pt-2 col-span-2">
                            <Checkbox
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(v) => handleChange('isActive', v)}
                                className="rounded-[4px]"
                            />
                            <Label htmlFor="isActive" className="text-sm font-medium leading-none cursor-pointer">
                                Active Member
                            </Label>
                        </div>
                    </div>
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
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 px-8 font-bold"
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
        </div>
    );
}
