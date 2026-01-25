import { useState, useMemo, useCallback, memo } from 'react';
import { useApp, ACTIONS } from '../../context/AppContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { 
    useMemoizedFilteredData, 
    useMemoizedTableData,
    usePerformanceMonitor 
} from '../../utils/memoizedCalculations';
import { VirtualTable } from '../../components/ui/virtual-table';
import { 
    TableSkeleton, 
    LoadingOverlay,
    ProgressiveLoader 
} from '../../components/ui/skeleton-components';
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
import { FormField, FormGrid, FormSection } from "@/components/ui/form-field"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    Plus,
    Edit2,
    Trash2,
    Receipt,
    Search,
    AlertTriangle,
    Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui"
import { toast } from "sonner"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import CostCenterErrorBoundary from "../../components/cost-center/CostCenterErrorBoundary"
import './LibraryPage.css';

// Generate unique ID
const generateId = () => `COA-${Date.now().toString(36).toUpperCase()}`;

// Empty COA template
const emptyCOA = {
    id: '',
    code: '',
    name: '',
    category: 'Expense',
    description: '',
    isActive: true,
};

// Account categories
const accountCategories = [
    { value: 'Expense', label: 'Expense', color: 'bg-red-500/10 text-red-600 border-red-200' },
    { value: 'Revenue', label: 'Revenue', color: 'bg-green-500/10 text-green-600 border-green-200' },
    { value: 'Asset', label: 'Asset', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { value: 'Liability', label: 'Liability', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
];

export default function ChartOfAccounts() {
    const { state, dispatch } = useApp();

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingCOA, setEditingCOA] = useState(null);
    const [coaToDelete, setCOAToDelete] = useState(null);

    // Form state
    const [formData, setFormData] = useState(emptyCOA);
    const [errors, setErrors] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    
    // Loading states
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        'n': () => !isFormOpen && !isDeleteOpen && handleAdd(),
        'Escape': () => {
            if (isFormOpen) setIsFormOpen(false);
            if (isDeleteOpen) setIsDeleteOpen(false);
        },
        '/': (e) => {
            e.preventDefault();
            document.querySelector('input[placeholder*="Search"]')?.focus();
        }
    });

    // TanStack Table Columns
    const columns = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <span className="text-[10px] font-mono text-slate-400">{row.getValue("id")}</span>,
        },
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">{row.getValue("code")}</span>,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => <span className="font-semibold text-slate-900 dark:text-slate-100">{row.getValue("name")}</span>,
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => {
                const category = row.getValue("category");
                const categoryConfig = accountCategories.find(c => c.value === category);
                return (
                    <Badge className={cn(
                        "rounded-full px-2 py-0 text-[10px] uppercase font-bold",
                        categoryConfig?.color || "bg-slate-500/10 text-slate-600 border-slate-200"
                    )}>
                        {category}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => <span className="text-sm text-slate-600 dark:text-slate-400">{row.getValue("description")}</span>,
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
    ], []);

    const [sorting, setSorting] = useState([]);

    const table = useReactTable({
        data: state.coa,
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
    const filteredCOA = useMemo(() => {
        let filtered = state.coa;
        
        // Apply category filter
        if (categoryFilter !== "all") {
            filtered = filtered.filter(coa => coa.category === categoryFilter);
        }
        
        // Apply text filter
        if (globalFilter) {
            const filter = globalFilter.toLowerCase();
            filtered = filtered.filter(coa =>
                coa.name.toLowerCase().includes(filter) ||
                coa.code.toLowerCase().includes(filter) ||
                coa.category.toLowerCase().includes(filter) ||
                coa.description.toLowerCase().includes(filter)
            );
        }
        
        return filtered;
    }, [state.coa, globalFilter, categoryFilter]);

    // Check if COA entry has active references (placeholder for future implementation)
    const hasActiveReferences = (coaId) => {
        // TODO: Check if this COA entry is referenced by resource costs or transactions
        return false;
    };

    // Open add modal
    const handleAdd = () => {
        setFormData({ ...emptyCOA, id: generateId() });
        setEditingCOA(null);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open edit modal
    const handleEdit = (coa) => {
        setFormData({ ...coa });
        setEditingCOA(coa);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open delete confirmation
    const handleDeleteClick = (coa) => {
        setCOAToDelete(coa);
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
        
        // Use comprehensive validation functions
        const codeErrors = validateCOACode(formData.code, state.coa, formData.id);
        const nameErrors = validateCOAName(formData.name);
        const descriptionErrors = validateCOADescription(formData.description);
        const categoryErrors = validateCOACategory(formData.category);
        
        if (codeErrors.length > 0) newErrors.code = codeErrors[0];
        if (nameErrors.length > 0) newErrors.name = nameErrors[0];
        if (descriptionErrors.length > 0) newErrors.description = descriptionErrors[0];
        if (categoryErrors.length > 0) newErrors.category = categoryErrors[0];
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Import validation functions (add this at the top of the component)
    const validateCOACode = (code, existingCOA = [], excludeId = null) => {
        const errors = [];
        
        if (!code || !code.trim()) {
            errors.push('Code is required');
            return errors;
        }
        
        const trimmedCode = code.trim();
        
        // Length validation
        if (trimmedCode.length < 3) {
            errors.push('Code must be at least 3 characters long');
        }
        if (trimmedCode.length > 8) {
            errors.push('Code must not exceed 8 characters');
        }
        
        // Format validation (numeric only)
        if (!/^[0-9]+$/.test(trimmedCode)) {
            errors.push('Code must contain only numbers');
        }
        
        // Reserved codes validation
        const reservedCodes = ['0000', '9999', '0001', '9998'];
        if (reservedCodes.includes(trimmedCode)) {
            errors.push(`"${trimmedCode}" is a reserved code and cannot be used`);
        }
        
        // Uniqueness validation
        const duplicate = existingCOA.find(coa => 
            coa.code === trimmedCode && coa.id !== excludeId
        );
        if (duplicate) {
            errors.push('Code must be unique');
        }
        
        return errors;
    };

    const validateCOAName = (name) => {
        const errors = [];
        
        if (!name || !name.trim()) {
            errors.push('Name is required');
            return errors;
        }
        
        const trimmedName = name.trim();
        
        // Length validation
        if (trimmedName.length < 3) {
            errors.push('Name must be at least 3 characters long');
        }
        if (trimmedName.length > 150) {
            errors.push('Name must not exceed 150 characters');
        }
        
        // Format validation
        if (!/^[a-zA-Z0-9\s\-_&().,]+$/.test(trimmedName)) {
            errors.push('Name contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed');
        }
        
        // Reserved words validation
        const upperName = trimmedName.toUpperCase();
        const reservedWords = ['SYSTEM', 'ADMIN', 'ROOT', 'DEFAULT'];
        if (reservedWords.some(word => upperName.includes(word))) {
            errors.push('Name cannot contain reserved words (SYSTEM, ADMIN, ROOT, DEFAULT)');
        }
        
        return errors;
    };

    const validateCOADescription = (description) => {
        const errors = [];
        
        if (!description) return errors; // Description is optional
        
        const trimmedDescription = description.trim();
        
        // Length validation
        if (trimmedDescription.length > 500) {
            errors.push('Description must not exceed 500 characters');
        }
        
        // Format validation
        if (trimmedDescription && !/^[a-zA-Z0-9\s\-_&().,;:!?'"]+$/.test(trimmedDescription)) {
            errors.push('Description contains invalid characters');
        }
        
        return errors;
    };

    const validateCOACategory = (category) => {
        const errors = [];
        const validCategories = ['Expense', 'Revenue', 'Asset', 'Liability'];
        
        if (!category || !category.trim()) {
            errors.push('Category is required');
            return errors;
        }
        
        if (!validCategories.includes(category)) {
            errors.push(`Category must be one of: ${validCategories.join(', ')}`);
        }
        
        return errors;
    };

    // Submit form
    const handleSubmit = () => {
        if (!validate()) return;
        
        const coaData = {
            ...formData,
            createdAt: editingCOA ? editingCOA.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        if (editingCOA) {
            dispatch({ type: ACTIONS.UPDATE_COA, payload: coaData });
        } else {
            dispatch({ type: ACTIONS.ADD_COA, payload: coaData });
        }
        setIsFormOpen(false);
    };

    // Confirm delete
    const handleDeleteConfirm = () => {
        if (coaToDelete) {
            dispatch({ type: ACTIONS.DELETE_COA, payload: coaToDelete.id });
        }
        setIsDeleteOpen(false);
        setCOAToDelete(null);
    };

    return (
        <div className="library-page space-y-6 animate-in fade-in duration-500">
            {/* Header section with glass effect */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-900">
                        <Receipt className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Chart of Accounts</h2>
                        <p className="text-sm text-slate-500 font-medium dark:text-slate-400">Manage financial account categories and classifications</p>
                    </div>
                </div>

                <Button className="rounded-xl shadow-lg dark:shadow-none transition-all active:scale-95" onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Account
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                        placeholder="Search by name, code, category, or description..."
                        className="pl-9 bg-muted border-slate-200 dark:border-slate-800 rounded-lg focus-visible:ring-indigo-500"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px] rounded-lg">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {accountCategories.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                                {category.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                <div className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider dark:text-slate-500">
                    {filteredCOA.length} OF {state.coa.length} ACCOUNTS
                </div>
            </div>

            {/* Table Container */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider h-12 py-3 bg-muted/50">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4 px-4 text-sm align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center align-middle">
                                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                        <Receipt className="h-12 w-12 opacity-20" />
                                        <div>
                                            <p className="font-medium">No accounts found</p>
                                            <p className="text-xs text-slate-400">Create your first account to get started</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle>
                            {editingCOA ? 'Edit Account' : 'Add Account'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure financial account details and categorization.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                        <TooltipProvider>
                            <FormSection>
                                <FormGrid>
                                    <FormField label="Code" error={errors.code} required>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={formData.code}
                                                onChange={(e) => handleChange('code', e.target.value)}
                                                className={cn("rounded-lg h-9 font-mono flex-1", errors.code && "border-red-500")}
                                                placeholder="e.g. 5001, 6002"
                                                maxLength={8}
                                            />
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-xs">
                                                    <p>3-8 digits only, no reserved codes (0000, 9999, 0001, 9998). Must be unique.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </FormField>
                                    <FormField label="Category" error={errors.category} required>
                                        <div className="flex items-center gap-2">
                                            <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                                                <SelectTrigger className={cn("rounded-lg h-9 flex-1", errors.category && "border-red-500")}>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accountCategories.map(category => (
                                                        <SelectItem key={category.value} value={category.value}>
                                                            {category.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-xs">
                                                    <p>Must be Expense, Revenue, Asset, or Liability.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </FormField>
                                </FormGrid>
                                
                                <FormField label="Name" error={errors.name} required>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className={cn("rounded-lg h-9 flex-1", errors.name && "border-red-500")}
                                            placeholder="e.g. Basic Salary, Software Licenses"
                                            maxLength={150}
                                        />
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs">
                                                <p>3-150 characters, no reserved words (SYSTEM, ADMIN, ROOT, DEFAULT). Letters, numbers, spaces, and common punctuation allowed.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </FormField>
                                
                                <FormField label="Description" error={errors.description}>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            className={cn("rounded-lg h-9 flex-1", errors.description && "border-red-500")}
                                            placeholder="Brief description of this account"
                                            maxLength={500}
                                        />
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs">
                                                <p>Optional. Maximum 500 characters.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </FormField>
                                
                                <div className="flex items-center space-x-3 pt-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(v) => handleChange('isActive', v)}
                                    />
                                    <Label htmlFor="isActive" className="text-sm font-medium leading-none cursor-pointer">
                                        Active Account
                                    </Label>
                                </div>
                            </FormSection>
                        </TooltipProvider>
                    </div>
                    
                    <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
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
                            {editingCOA ? 'Update' : 'Add'} Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                        <DialogDescription>
                            {hasActiveReferences(coaToDelete?.id) ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="font-semibold">Warning: Active References</span>
                                    </div>
                                    <p>
                                        Account <span className="font-bold text-slate-900">"{coaToDelete?.name}"</span> has active references. 
                                        Consider deactivating this account instead of deleting it.
                                    </p>
                                </div>
                            ) : (
                                <p>
                                    Are you sure you want to delete <span className="font-bold text-slate-900">"{coaToDelete?.name}"</span>?
                                    This action cannot be undone.
                                </p>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl">Cancel</Button>
                        {!hasActiveReferences(coaToDelete?.id) && (
                            <Button variant="destructive" onClick={handleDeleteConfirm} className="rounded-xl bg-red-600 hover:bg-red-700">Delete Account</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}