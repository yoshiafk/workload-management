import { useState, useMemo, useCallback, memo } from 'react';
import { useApp, ACTIONS } from '../../context/AppContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { 
    useMemoizedFilteredData, 
    useMemoizedTableData,
    usePerformanceMonitor 
} from '../../utils/memoizedCalculations';
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
    Building2,
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
const generateId = () => `CC-${Date.now().toString(36).toUpperCase()}`;

// Empty cost center template
const emptyCostCenter = {
    id: '',
    code: '',
    name: '',
    description: '',
    manager: '',
    parentCostCenterId: '',
    isActive: true,
    // Budget fields
    monthlyBudget: 0,
    yearlyBudget: 0,
    budgetPeriod: new Date().getFullYear().toString(),
};

// Memoized Cost Center Form Component
const CostCenterForm = memo(({ 
    formData, 
    errors, 
    isSubmitting, 
    onSubmit, 
    onCancel, 
    onChange,
    availableParents,
    editingCostCenter 
}) => {
    return (
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
                <DialogTitle>
                    {editingCostCenter ? 'Edit Cost Center' : 'Add Cost Center'}
                </DialogTitle>
                <DialogDescription>
                    Configure organizational unit details and management information.
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
                                        onChange={(e) => onChange('code', e.target.value.toUpperCase())}
                                        className={cn("rounded-lg h-9 font-mono flex-1", errors.code && "border-red-500")}
                                        placeholder="e.g. ENG, PROD"
                                        maxLength={10}
                                    />
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs">
                                            <p>2-10 characters, uppercase letters, numbers, underscores, and hyphens only. Must be unique.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </FormField>
                            <FormField label="Manager" error={errors.manager} required>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={formData.manager}
                                        onChange={(e) => onChange('manager', e.target.value)}
                                        className={cn("rounded-lg h-9 flex-1", errors.manager && "border-red-500")}
                                        placeholder="Manager name"
                                        maxLength={100}
                                    />
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs">
                                            <p>Can be external (not required to be in team member list). 2-100 characters, letters, spaces, hyphens, and apostrophes only.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </FormField>
                        </FormGrid>
                        
                        <FormField label="Name" error={errors.name} required>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={formData.name}
                                    onChange={(e) => onChange('name', e.target.value)}
                                    className={cn("rounded-lg h-9 flex-1", errors.name && "border-red-500")}
                                    placeholder="e.g. Engineering"
                                    maxLength={100}
                                />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                        <p>2-100 characters, no reserved words (ADMIN, SYSTEM, ROOT, DEFAULT). Letters, numbers, spaces, and common punctuation allowed.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </FormField>
                        
                        <FormField label="Description" error={errors.description}>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={formData.description}
                                    onChange={(e) => onChange('description', e.target.value)}
                                    className={cn("rounded-lg h-9 flex-1", errors.description && "border-red-500")}
                                    placeholder="Brief description of this organizational unit"
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

                        {/* Budget Section */}
                        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Budget Information</h4>
                            
                            <FormGrid>
                                <FormField label="Monthly Budget (IDR)" error={errors.monthlyBudget}>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={formData.monthlyBudget || ''}
                                            onChange={(e) => onChange('monthlyBudget', parseInt(e.target.value) || 0)}
                                            className={cn("rounded-lg h-9 flex-1", errors.monthlyBudget && "border-red-500")}
                                            placeholder="150000000"
                                            min="0"
                                        />
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs">
                                                <p>Optional. Monthly budget allocation in Indonesian Rupiah. Must be positive number, max 999 billion IDR.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </FormField>
                                <FormField label="Budget Period" error={errors.budgetPeriod}>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={formData.budgetPeriod || new Date().getFullYear().toString()}
                                            onChange={(e) => onChange('budgetPeriod', e.target.value)}
                                            className={cn("rounded-lg h-9 flex-1", errors.budgetPeriod && "border-red-500")}
                                            placeholder="2024"
                                            maxLength={4}
                                        />
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs">
                                                <p>Budget year in YYYY format. Must be between 2020 and {new Date().getFullYear() + 10}.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </FormField>
                            </FormGrid>
                            
                            <FormField label="Yearly Budget (IDR)" error={errors.yearlyBudget}>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={formData.yearlyBudget || ''}
                                        onChange={(e) => onChange('yearlyBudget', parseInt(e.target.value) || 0)}
                                        className={cn("rounded-lg h-9 flex-1", errors.yearlyBudget && "border-red-500")}
                                        placeholder="1800000000"
                                        min="0"
                                    />
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs">
                                            <p>Optional. Annual budget allocation in Indonesian Rupiah. Should be approximately 12x monthly budget (±20% tolerance).</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </FormField>
                        </div>
                        
                        <FormField label="Parent Cost Center" error={errors.parentCostCenterId}>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={formData.parentCostCenterId || 'none'}
                                    onValueChange={(value) => onChange('parentCostCenterId', value === 'none' ? null : value)}
                                >
                                    <SelectTrigger className={cn("rounded-lg h-9 flex-1", errors.parentCostCenterId && "border-red-500")}>
                                        <SelectValue placeholder="Select parent cost center (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Parent</SelectItem>
                                        {availableParents.map(cc => (
                                            <SelectItem key={cc.id} value={cc.id}>
                                                {cc.code} - {cc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs">
                                            <p>Optional. Select another cost center as parent to create organizational hierarchy (e.g., Engineering → QA Team). Cannot create circular references or exceed 5 levels deep.</p>
                                        </TooltipContent>
                                    </Tooltip>
                            </div>
                        </FormField>
                        
                        <div className="flex items-center space-x-3 pt-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(v) => onChange('isActive', v)}
                            />
                            <Label htmlFor="isActive" className="text-sm font-medium leading-none cursor-pointer">
                                Active Cost Center
                            </Label>
                        </div>

                        {errors.general && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                {errors.general}
                            </div>
                        )}
                        
                        {/* Cost Center vs COA Info */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                            <p className="font-medium mb-1">💡 Cost Center vs Chart of Accounts:</p>
                            <p>Cost Centers track <em>where</em> expenses occur (departments), while Chart of Accounts tracks <em>what type</em> of expenses they are. They work together but are separate organizational structures.</p>
                        </div>
                    </FormSection>
                </TooltipProvider>
            </div>
            
            <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="font-bold"
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onSubmit}
                    className="shadow-lg px-8 font-bold"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                            {editingCostCenter ? 'Updating...' : 'Adding...'}
                        </>
                    ) : (
                        `${editingCostCenter ? 'Update' : 'Add'} Cost Center`
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
});

CostCenterForm.displayName = 'CostCenterForm';

export default function CostCenters() {
    const { state, dispatch } = useApp();
    
    // Performance monitoring
    usePerformanceMonitor('CostCenters');

    // Early return if state is not loaded
    if (!state || !state.costCenters) {
        return (
            <div className="library-page space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-slate-500">Loading cost centers...</span>
                </div>
            </div>
        );
    }

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingCostCenter, setEditingCostCenter] = useState(null);
    const [costCenterToDelete, setCostCenterToDelete] = useState(null);

    // Form state
    const [formData, setFormData] = useState(emptyCostCenter);
    const [errors, setErrors] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    
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

    // TanStack Table Columns - Memoized for performance
    const columns = useMemo(() => [
        {
            key: "id",
            header: "ID",
            width: 120,
            render: (item) => <span className="text-[10px] font-mono text-slate-400">{item.id}</span>,
        },
        {
            key: "code", 
            header: "Code",
            width: 100,
            render: (item) => <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">{item.code}</span>,
        },
        {
            key: "name",
            header: "Name", 
            minWidth: 200,
            render: (item) => <span className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</span>,
        },
        {
            key: "parentCostCenterId",
            header: "Parent",
            width: 120,
            render: (item) => {
                if (!item.parentCostCenterId) return <span className="text-xs text-slate-400">—</span>;
                const parent = state.costCenters.find(cc => cc.id === item.parentCostCenterId);
                return parent ? (
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">{parent.code}</span>
                ) : (
                    <span className="text-xs text-red-500">Invalid</span>
                );
            },
        },
        {
            key: "description",
            header: "Description",
            minWidth: 200,
            render: (item) => <span className="text-sm text-slate-600 dark:text-slate-400">{item.description}</span>,
        },
        {
            key: "manager",
            header: "Manager",
            width: 150,
            render: (item) => <span className="text-sm text-slate-600 dark:text-slate-400">{item.manager}</span>,
        },
        {
            key: "monthlyBudget",
            header: "Monthly Budget",
            width: 130,
            render: (item) => (
                <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                    {item.monthlyBudget ? `IDR ${(item.monthlyBudget / 1000000).toFixed(0)}M` : '—'}
                </span>
            ),
        },
        {
            key: "budgetPeriod",
            header: "Budget Year",
            width: 100,
            render: (item) => <span className="text-sm text-slate-600 dark:text-slate-400">{item.budgetPeriod || '—'}</span>,
        },
        {
            key: "isActive",
            header: "Status",
            width: 100,
            render: (item) => (
                <Badge className={cn(
                    "rounded-full px-2 py-0 text-[10px] uppercase font-bold",
                    item.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "bg-slate-500/10 text-slate-600 border-slate-200"
                )}>
                    {item.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            width: 120,
            render: (item) => (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => handleEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDeleteClick(item)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ], [state.costCenters]);

    // Get available parent cost centers (active ones, excluding self and descendants)
    const getAvailableParents = useCallback((excludeId = null) => {
        return state.costCenters.filter(cc => {
            if (!cc.isActive) return false;
            if (cc.id === excludeId) return false;
            
            // Don't allow selecting descendants as parents (would create circular reference)
            if (excludeId) {
                let currentId = cc.parentCostCenterId;
                while (currentId) {
                    if (currentId === excludeId) return false;
                    const current = state.costCenters.find(c => c.id === currentId);
                    currentId = current?.parentCostCenterId;
                }
            }
            
            return true;
        });
    }, [state.costCenters]);

    // Use memoized filtering and sorting
    const filteredCostCenters = useMemoizedFilteredData(
        state.costCenters || [], 
        {}, // No additional filters for now
        globalFilter
    ) || [];

    const sortedCostCenters = useMemoizedTableData(filteredCostCenters, sorting) || [];

    // Check if cost center has active team member assignments
    const hasActiveAssignments = (costCenterId) => {
        return state.members.some(member => member.costCenterId === costCenterId);
    };

    // Check if cost center has child cost centers
    const hasChildCostCenters = (costCenterId) => {
        return state.costCenters.some(cc => cc.parentCostCenterId === costCenterId);
    };

    // Memoized calculations for better performance
    const availableParents = useMemo(() => 
        getAvailableParents(formData.id), 
        [getAvailableParents, formData.id]
    );

    // Optimized change handler
    const handleChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    }, [errors]);

    // Optimized row click handler
    const handleRowClick = useCallback((costCenter) => {
        // Could be used for quick view or selection
        console.log('Row clicked:', costCenter);
    }, []);

    // Open add modal
    const handleAdd = useCallback(() => {
        setFormData({ ...emptyCostCenter, id: generateId() });
        setEditingCostCenter(null);
        setErrors({});
        setIsFormOpen(true);
    }, []);

    // Open edit modal
    const handleEdit = useCallback((costCenter) => {
        setFormData({ ...costCenter });
        setEditingCostCenter(costCenter);
        setErrors({});
        setIsFormOpen(true);
    }, []);

    // Open delete confirmation
    const handleDeleteClick = useCallback((costCenter) => {
        setCostCenterToDelete(costCenter);
        setIsDeleteOpen(true);
    }, []);

    // Validate form
    const validate = () => {
        const newErrors = {};
        
        // Use comprehensive validation functions
        const codeErrors = validateCostCenterCode(formData.code, state.costCenters, formData.id);
        const nameErrors = validateCostCenterName(formData.name);
        const descriptionErrors = validateCostCenterDescription(formData.description);
        const managerErrors = validateCostCenterManager(formData.manager, state.members);
        const budgetErrors = validateCostCenterBudget(formData.monthlyBudget, formData.yearlyBudget);
        const budgetPeriodErrors = validateBudgetPeriod(formData.budgetPeriod);
        
        if (codeErrors.length > 0) newErrors.code = codeErrors[0];
        if (nameErrors.length > 0) newErrors.name = nameErrors[0];
        if (descriptionErrors.length > 0) newErrors.description = descriptionErrors[0];
        if (managerErrors.length > 0) newErrors.manager = managerErrors[0];
        if (budgetErrors.length > 0) {
            // Split budget errors between monthly and yearly
            budgetErrors.forEach(error => {
                if (error.includes('Monthly')) newErrors.monthlyBudget = error;
                else if (error.includes('Yearly')) newErrors.yearlyBudget = error;
                else newErrors.monthlyBudget = error; // Default to monthly for cross-validation errors
            });
        }
        if (budgetPeriodErrors.length > 0) newErrors.budgetPeriod = budgetPeriodErrors[0];
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Import validation functions (add this at the top of the component)
    const validateCostCenterCode = (code, existingCostCenters = [], excludeId = null) => {
        const errors = [];
        
        if (!code || !code.trim()) {
            errors.push('Code is required');
            return errors;
        }
        
        const trimmedCode = code.trim().toUpperCase();
        
        // Length validation
        if (trimmedCode.length < 2) {
            errors.push('Code must be at least 2 characters long');
        }
        if (trimmedCode.length > 10) {
            errors.push('Code must not exceed 10 characters');
        }
        
        // Format validation
        if (!/^[A-Z0-9_-]+$/.test(trimmedCode)) {
            errors.push('Code must contain only uppercase letters, numbers, underscores, and hyphens');
        }
        
        // Reserved words validation
        const reservedWords = ['ADMIN', 'SYSTEM', 'ROOT', 'DEFAULT', 'NULL', 'UNDEFINED'];
        if (reservedWords.includes(trimmedCode)) {
            errors.push(`"${trimmedCode}" is a reserved word and cannot be used as a code`);
        }
        
        // Uniqueness validation
        const duplicate = existingCostCenters.find(cc => 
            cc.code.toUpperCase() === trimmedCode && cc.id !== excludeId
        );
        if (duplicate) {
            errors.push('Code must be unique');
        }
        
        return errors;
    };

    const validateCostCenterName = (name) => {
        const errors = [];
        
        if (!name || !name.trim()) {
            errors.push('Name is required');
            return errors;
        }
        
        const trimmedName = name.trim();
        
        // Length validation
        if (trimmedName.length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
        if (trimmedName.length > 100) {
            errors.push('Name must not exceed 100 characters');
        }
        
        // Format validation
        if (!/^[a-zA-Z0-9\s\-_&().,]+$/.test(trimmedName)) {
            errors.push('Name contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed');
        }
        
        // Reserved words validation
        const upperName = trimmedName.toUpperCase();
        const reservedWords = ['ADMIN', 'SYSTEM', 'ROOT', 'DEFAULT'];
        if (reservedWords.some(word => upperName.includes(word))) {
            errors.push('Name cannot contain reserved words (ADMIN, SYSTEM, ROOT, DEFAULT)');
        }
        
        return errors;
    };

    const validateCostCenterDescription = (description) => {
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

    const validateCostCenterManager = (manager, teamMembers = []) => {
        const errors = [];
        
        if (!manager || !manager.trim()) {
            errors.push('Manager is required');
            return errors;
        }
        
        const trimmedManager = manager.trim();
        
        // Length validation
        if (trimmedManager.length < 2) {
            errors.push('Manager name must be at least 2 characters long');
        }
        if (trimmedManager.length > 100) {
            errors.push('Manager name must not exceed 100 characters');
        }
        
        // Format validation
        if (!/^[a-zA-Z\s\-'.]+$/.test(trimmedManager)) {
            errors.push('Manager name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed');
        }
        
        // Note: Removed manager existence validation - managers can be external to team members
        
        return errors;
    };

    const validateCostCenterBudget = (monthlyBudget, yearlyBudget) => {
        const errors = [];
        
        // Monthly budget validation (optional)
        if (monthlyBudget !== undefined && monthlyBudget !== null && monthlyBudget !== '') {
            const monthly = Number(monthlyBudget);
            if (isNaN(monthly) || monthly < 0) {
                errors.push('Monthly budget must be a positive number');
            }
            if (monthly > 999999999999) { // 999 billion IDR limit
                errors.push('Monthly budget exceeds maximum limit (999 billion IDR)');
            }
        }
        
        // Yearly budget validation (optional)
        if (yearlyBudget !== undefined && yearlyBudget !== null && yearlyBudget !== '') {
            const yearly = Number(yearlyBudget);
            if (isNaN(yearly) || yearly < 0) {
                errors.push('Yearly budget must be a positive number');
            }
            if (yearly > 9999999999999) { // 9.9 trillion IDR limit
                errors.push('Yearly budget exceeds maximum limit (9.9 trillion IDR)');
            }
        }
        
        // Cross-validation: yearly should be roughly 12x monthly (with some tolerance)
        if (monthlyBudget && yearlyBudget) {
            const monthly = Number(monthlyBudget);
            const yearly = Number(yearlyBudget);
            const expectedYearly = monthly * 12;
            const tolerance = 0.2; // 20% tolerance
            
            if (yearly < expectedYearly * (1 - tolerance) || yearly > expectedYearly * (1 + tolerance)) {
                errors.push('Yearly budget should be approximately 12 times the monthly budget');
            }
        }
        
        return errors;
    };

    const validateBudgetPeriod = (budgetPeriod) => {
        const errors = [];
        
        if (!budgetPeriod) return errors; // Optional field
        
        const trimmedPeriod = budgetPeriod.trim();
        
        // Format validation (YYYY)
        if (!/^\d{4}$/.test(trimmedPeriod)) {
            errors.push('Budget period must be a 4-digit year (e.g., 2024)');
        }
        
        // Range validation
        const year = parseInt(trimmedPeriod);
        const currentYear = new Date().getFullYear();
        if (year < 2020 || year > currentYear + 10) {
            errors.push(`Budget period must be between 2020 and ${currentYear + 10}`);
        }
        
        return errors;
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validate()) return;
        
        setIsSubmitting(true);
        setErrors({});
        
        const costCenterData = {
            ...formData,
            createdAt: editingCostCenter ? editingCostCenter.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        try {
            if (editingCostCenter) {
                dispatch({ type: ACTIONS.UPDATE_COST_CENTER, payload: costCenterData });
                toast.success(`Cost center "${costCenterData.name}" updated successfully`);
            } else {
                dispatch({ type: ACTIONS.ADD_COST_CENTER, payload: costCenterData });
                toast.success(`Cost center "${costCenterData.name}" created successfully`);
            }
            setIsFormOpen(false);
        } catch (error) {
            // Handle hierarchical validation errors
            if (error.message.includes('Circular reference')) {
                setErrors({ parentCostCenterId: 'This would create a circular reference in the hierarchy' });
            } else if (error.message.includes('Maximum hierarchy depth')) {
                setErrors({ parentCostCenterId: 'This would exceed the maximum hierarchy depth of 5 levels' });
            } else if (error.message.includes('Invalid parent cost center')) {
                setErrors({ parentCostCenterId: 'Parent cost center must exist and be active' });
            } else if (error.message.includes('Code must be unique')) {
                setErrors({ code: 'This code is already in use' });
            } else if (error.message.includes('Required fields missing')) {
                setErrors({ 
                    code: !formData.code?.trim() ? 'Code is required' : null,
                    name: !formData.name?.trim() ? 'Name is required' : null,
                    manager: !formData.manager?.trim() ? 'Manager is required' : null,
                });
            } else {
                // Generic error handling
                console.error('Cost center operation failed:', error);
                setErrors({ general: error.message || 'An error occurred while saving the cost center' });
                toast.error(`Failed to ${editingCostCenter ? 'update' : 'create'} cost center: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Confirm delete
    const handleDeleteConfirm = async () => {
        if (!costCenterToDelete) return;
        
        setIsDeleting(true);
        
        try {
            dispatch({ type: ACTIONS.DELETE_COST_CENTER, payload: costCenterToDelete.id });
            toast.success(`Cost center "${costCenterToDelete.name}" deleted successfully`);
            setIsDeleteOpen(false);
            setCostCenterToDelete(null);
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error(`Failed to delete cost center: ${error.message}`);
            // Keep dialog open to show error
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <CostCenterErrorBoundary componentName="CostCenters" showErrorDetails={process.env.NODE_ENV === 'development'}>
            <div className="library-page space-y-6 animate-in fade-in duration-500">
            {/* Header section with glass effect */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-900">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Cost Centers</h2>
                        <p className="text-sm text-slate-500 font-medium dark:text-slate-400">Manage organizational units and cost tracking</p>
                    </div>
                </div>

                <Button className="rounded-xl shadow-lg dark:shadow-none transition-all active:scale-95" onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Cost Center
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                        placeholder="Search by name, code, or manager..."
                        className="pl-9 bg-muted border-slate-200 dark:border-slate-800 rounded-lg focus-visible:ring-indigo-500"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>
                <div className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider dark:text-slate-500">
                    {filteredCostCenters.length} OF {state.costCenters.length} COST CENTERS
                </div>
            </div>

            {/* Standard Table Container with Loading States */}
            <ProgressiveLoader
                isLoading={isSubmitting || isDeleting}
                skeleton={<TableSkeleton rows={8} columns={8} />}
                delay={200}
            >
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column, index) => (
                                    <TableHead 
                                        key={index}
                                        className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider h-12 py-3 bg-muted/50"
                                        style={{ 
                                            width: column.width || 'auto',
                                            minWidth: column.minWidth || 100
                                        }}
                                    >
                                        {column.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedCostCenters.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                            <Building2 className="h-12 w-12 opacity-20" />
                                            <div className="text-center">
                                                <p className="font-medium">No cost centers found</p>
                                                <p className="text-xs text-slate-400">
                                                    {globalFilter ? 'Try adjusting your search terms' : 'Create your first cost center to get started'}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedCostCenters.map((costCenter) => (
                                    <TableRow 
                                        key={costCenter.id}
                                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => handleRowClick(costCenter)}
                                    >
                                        {columns.map((column, colIndex) => (
                                            <TableCell 
                                                key={colIndex} 
                                                className="py-4 px-4 text-sm align-middle"
                                                style={{ 
                                                    width: column.width || 'auto',
                                                    minWidth: column.minWidth || 100
                                                }}
                                            >
                                                {column.render ? column.render(costCenter) : costCenter[column.key]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    
                    {/* Footer with item count */}
                    <div className="px-4 py-2 bg-muted/30 border-t border-border">
                        <p className="text-xs text-slate-500">
                            Showing {sortedCostCenters.length} cost centers
                        </p>
                    </div>
                </div>
            </ProgressiveLoader>

            {/* Add/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <CostCenterForm
                    formData={formData}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    onChange={handleChange}
                    availableParents={availableParents}
                    editingCostCenter={editingCostCenter}
                />
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Cost Center</DialogTitle>
                        <DialogDescription>
                            {hasActiveAssignments(costCenterToDelete?.id) || hasChildCostCenters(costCenterToDelete?.id) ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="font-semibold">Warning: Cannot Delete</span>
                                    </div>
                                    <div className="space-y-2">
                                        {hasActiveAssignments(costCenterToDelete?.id) && (
                                            <p>Cost center <span className="font-bold text-slate-900">"{costCenterToDelete?.name}"</span> has active team member assignments.</p>
                                        )}
                                        {hasChildCostCenters(costCenterToDelete?.id) && (
                                            <p>Cost center <span className="font-bold text-slate-900">"{costCenterToDelete?.name}"</span> has child cost centers.</p>
                                        )}
                                        <p className="text-sm text-slate-600">
                                            Please {hasActiveAssignments(costCenterToDelete?.id) ? 'reassign team members' : ''} 
                                            {hasActiveAssignments(costCenterToDelete?.id) && hasChildCostCenters(costCenterToDelete?.id) ? ' and ' : ''}
                                            {hasChildCostCenters(costCenterToDelete?.id) ? 'reassign or delete child cost centers' : ''} before deleting this cost center.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p>
                                    Are you sure you want to delete <span className="font-bold text-slate-900">"{costCenterToDelete?.name}"</span>?
                                    This action cannot be undone.
                                </p>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsDeleteOpen(false)} 
                            className="rounded-xl"
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        {!hasActiveAssignments(costCenterToDelete?.id) && !hasChildCostCenters(costCenterToDelete?.id) && (
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteConfirm} 
                                className="rounded-xl bg-red-600 hover:bg-red-700"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Cost Center'
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </CostCenterErrorBoundary>
    );
}