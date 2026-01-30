import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FormField, FormSection } from "@/components/ui/form-field";
import {
    Plus,
    Edit2,
    Trash2,
    ChevronUp,
    ChevronDown,
    Layers,
    Search,
    Clock,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import './LibraryPage.css';

// Empty phase template
const emptyPhase = {
    name: '',
    tasks: [],
    isTerminal: false,
    sortOrder: 0,
};

export default function Phases() {
    const { state, addPhase, updatePhase, deletePhase } = useApp();

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingPhase, setEditingPhase] = useState(null);
    const [phaseToDelete, setPhaseToDelete] = useState(null);

    // Form state
    const [formData, setFormData] = useState(emptyPhase);
    const [errors, setErrors] = useState({});
    const [taskSearch, setTaskSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sort phases by sortOrder
    const sortedPhases = [...state.phases].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    // Open add modal
    const handleAdd = () => {
        const nextOrder = sortedPhases.length > 0
            ? Math.max(...sortedPhases.map(p => p.sortOrder || 0)) + 1
            : 0;

        setFormData({ ...emptyPhase, sortOrder: nextOrder });
        setEditingPhase(null);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open edit modal
    const handleEdit = (phase) => {
        setFormData({ ...phase });
        setEditingPhase(phase);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open delete confirmation
    const handleDeleteClick = (phase) => {
        setPhaseToDelete(phase);
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
        if (!formData.name.trim()) {
            newErrors.name = 'Phase name is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            if (editingPhase) {
                await updatePhase(editingPhase.id, formData);
                toast.success("Phase updated successfully");
            } else {
                await addPhase(formData);
                toast.success("Phase created successfully");
            }
            setIsFormOpen(false);
            setTaskSearch('');
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to save phase");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Confirm delete
    const handleDeleteConfirm = async () => {
        if (!phaseToDelete) return;
        setIsSubmitting(true);

        try {
            await deletePhase(phaseToDelete.id);
            toast.success("Phase deleted successfully");
            setIsDeleteOpen(false);
            setPhaseToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to delete phase");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Move phase up
    const handleMoveUp = async (index) => {
        if (index === 0) return;

        const currentPhase = sortedPhases[index];
        const prevPhase = sortedPhases[index - 1];

        // Swap sortOrder
        const currentOrder = currentPhase.sortOrder || 0;
        const prevOrder = prevPhase.sortOrder || 0;

        // If they have same sortOrder, we need to adjust
        const newCurrentOrder = prevOrder;
        const newPrevOrder = currentOrder;

        try {
            // Optimistic update would be complex here, so we just await
            await Promise.all([
                updatePhase(currentPhase.id, { ...currentPhase, sortOrder: newCurrentOrder }),
                updatePhase(prevPhase.id, { ...prevPhase, sortOrder: newPrevOrder })
            ]);
            toast.success("Phase order updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to reorder phases");
        }
    };

    // Move phase down
    const handleMoveDown = async (index) => {
        if (index === sortedPhases.length - 1) return;

        const currentPhase = sortedPhases[index];
        const nextPhase = sortedPhases[index + 1];

        // Swap sortOrder
        const currentOrder = currentPhase.sortOrder || 0;
        const nextOrder = nextPhase.sortOrder || 0;

        const newCurrentOrder = nextOrder;
        const newNextOrder = currentOrder;

        try {
            await Promise.all([
                updatePhase(currentPhase.id, { ...currentPhase, sortOrder: newCurrentOrder }),
                updatePhase(nextPhase.id, { ...nextPhase, sortOrder: newNextOrder })
            ]);
            toast.success("Phase order updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to reorder phases");
        }
    };

    return (
        <div className="library-page space-y-6 animate-in fade-in duration-500">
            {/* Header section with glass effect */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-900">
                        <Layers className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Task Phases</h2>
                        <p className="text-sm text-slate-500 font-medium dark:text-slate-400">Define and order your project workflow</p>
                    </div>
                </div>

                <Button
                    className="rounded-xl shadow-lg dark:shadow-none transition-all active:scale-95"
                    onClick={handleAdd}
                    disabled={isSubmitting}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add phase
                </Button>
            </div>

            <div className="grid gap-3">
                {sortedPhases.map((phase, index) => (
                    <div
                        key={phase.id}
                        className={cn(
                            "group flex items-center gap-4 p-4 rounded-xl border border-border bg-card transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800",
                            phase.isTerminal && "opacity-80 grayscale-[0.2]"
                        )}
                    >
                        <div className="flex flex-col gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0 || isSubmitting}
                            >
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === sortedPhases.length - 1 || isSubmitting}
                            >
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-lg border border-slate-200 dark:border-slate-700">
                            {index + 1}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100">{phase.name}</h3>
                                {phase.isTerminal && (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0 px-1.5 uppercase tracking-wide">
                                        Terminal
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                                {phase.tasks?.length || 0} task templates linked
                            </p>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => handleEdit(phase)} disabled={isSubmitting}>
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDeleteClick(phase)} disabled={isSubmitting}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {sortedPhases.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-border bg-muted/50 text-slate-400">
                        <Layers className="h-10 w-10 mb-2 opacity-20" />
                        <p className="font-medium">No phases defined yet.</p>
                        <Button variant="link" onClick={handleAdd} className="text-indigo-500 dark:text-indigo-400 font-bold">Add your first phase</Button>
                    </div>
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={(open) => {
                if (!isSubmitting) {
                    setIsFormOpen(open);
                    if (!open) setTaskSearch('');
                }
            }}>
                <DialogContent className="sm:max-w-xl bg-card border-border shadow-2xl p-0 overflow-hidden rounded-2xl">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="flex items-center gap-3 text-lg font-black tracking-tight">
                            <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                                <Layers className="h-5 w-5 text-indigo-600" />
                            </div>
                            {editingPhase ? 'Edit Phase' : 'Add Phase'}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium text-xs mt-1">
                            Configure SDLC stage and link relevant task templates.
                        </DialogDescription>
                    </DialogHeader>

                    <FormSection className="max-h-[60vh] overflow-y-auto custom-scrollbar p-6 space-y-5">
                        {/* Phase Name Input */}
                        <FormField label="Phase Name" error={errors.name} required>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={cn("rounded-lg h-9", errors.name && "border-red-500")}
                                placeholder="e.g. Planning, Execution, Review"
                                disabled={isSubmitting}
                            />
                        </FormField>

                        {/* Terminal Switch Area */}
                        <div className="flex items-start space-x-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 dark:bg-amber-500/10">
                            <Checkbox
                                id="isTerminal"
                                checked={formData.isTerminal}
                                onCheckedChange={(v) => handleChange('isTerminal', v)}
                                className="mt-1 rounded-[4px]"
                                disabled={isSubmitting}
                            />
                            <div className="space-y-1">
                                <Label htmlFor="isTerminal" className="text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer">
                                    Terminal Phase
                                </Label>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    Marks the end of work. Tasks in this phase won't count towards active workload capacity.
                                </p>
                            </div>
                        </div>

                        {/* Task Template Selection */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Linked Templates</Label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[10px] h-5 px-2 font-mono">
                                            {formData.tasks.length} selected
                                        </Badge>
                                    </div>
                                </div>
                                <div className="relative w-48">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                    <Input
                                        placeholder="Search tasks..."
                                        className="h-8 pl-8 text-xs rounded-lg dark:bg-slate-900"
                                        value={taskSearch}
                                        onChange={(e) => setTaskSearch(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="border rounded-xl p-2 bg-slate-500/5 overflow-hidden">
                                <div className="max-h-[220px] overflow-y-auto px-1 space-y-4 custom-scrollbar">
                                    {/* Grouped by Category */}
                                    {['Project', 'Support', 'Terminal'].map(category => {
                                        const categoryTasks = state.tasks.filter(t =>
                                            t.category === category &&
                                            t.name.toLowerCase().includes(taskSearch.toLowerCase())
                                        );

                                        if (categoryTasks.length === 0) return null;

                                        return (
                                            <div key={category} className="space-y-2">
                                                <div className="px-2 pt-1">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block border-b border-border pb-1 mb-2">
                                                        {category} Templates
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {categoryTasks.map(task => (
                                                        <div
                                                            key={task.id}
                                                            className={cn(
                                                                "flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer group",
                                                                formData.tasks.includes(task.id)
                                                                    ? "bg-indigo-600/5 shadow-sm border-indigo-500/20 ring-1 ring-indigo-500/10"
                                                                    : "bg-background border-border hover:border-indigo-500/30"
                                                            )}
                                                            onClick={() => {
                                                                if (isSubmitting) return;
                                                                const checked = !formData.tasks.includes(task.id);
                                                                const newTasks = checked
                                                                    ? [...formData.tasks, task.id]
                                                                    : formData.tasks.filter(id => id !== task.id);
                                                                handleChange('tasks', newTasks);
                                                            }}
                                                        >
                                                            <Checkbox
                                                                id={`task-${task.id}`}
                                                                checked={formData.tasks.includes(task.id)}
                                                                className="rounded-md"
                                                                disabled={isSubmitting}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <Label
                                                                    htmlFor={`task-${task.id}`}
                                                                    className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer block truncate"
                                                                >
                                                                    {task.name}
                                                                </Label>
                                                                <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold tabular-nums">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="h-2 w-2" />
                                                                        {task.estimates?.medium?.hours || 0}h
                                                                    </div>
                                                                    <span className="opacity-30">•</span>
                                                                    <span>{task.id.toString().substring(0, 8)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {state.tasks.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 text-slate-400 opacity-50">
                                            <Layers className="h-8 w-8 mb-2" />
                                            <p className="text-xs font-bold uppercase tracking-widest">No matching tasks</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </FormSection>

                    <DialogFooter className="p-6 bg-muted/10 border-t border-border mt-0 gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setIsFormOpen(false)}
                            className="font-bold rounded-xl h-11"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 font-black uppercase tracking-wider text-[10px] rounded-xl h-11 shadow-lg shadow-primary/20 bg-indigo-600 hover:bg-indigo-700 border-none min-w-[120px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>{editingPhase ? 'Update' : 'Create'} Stage</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={(open) => !isSubmitting && setIsDeleteOpen(open)}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Phase</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-bold text-slate-900">"{phaseToDelete?.name}"</span>?
                            This stage will be removed from all active project timelines.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl" disabled={isSubmitting}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            className="rounded-xl bg-red-600 hover:bg-red-700 min-w-[120px]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Phase"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
