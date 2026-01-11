import { useState } from 'react';
import { useApp, ACTIONS } from '../../context/AppContext';
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
import {
    Plus,
    Edit2,
    Trash2,
    ChevronUp,
    ChevronDown,
    Layers,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import './LibraryPage.css';

// Empty phase template
const emptyPhase = {
    id: 0,
    name: '',
    tasks: [],
    isTerminal: false,
};

export default function Phases() {
    const { state, dispatch } = useApp();

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingPhase, setEditingPhase] = useState(null);
    const [phaseToDelete, setPhaseToDelete] = useState(null);

    // Form state
    const [formData, setFormData] = useState(emptyPhase);
    const [errors, setErrors] = useState({});

    // Get next available ID
    const getNextId = () => {
        const maxId = state.phases.reduce((max, p) => Math.max(max, p.id), 0);
        return maxId + 1;
    };

    // Open add modal
    const handleAdd = () => {
        setFormData({ ...emptyPhase, id: getNextId() });
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
    const handleSubmit = () => {
        if (!validate()) return;

        if (editingPhase) {
            dispatch({ type: ACTIONS.UPDATE_PHASE, payload: formData });
        } else {
            dispatch({ type: ACTIONS.ADD_PHASE, payload: formData });
        }
        setIsFormOpen(false);
    };

    // Confirm delete
    const handleDeleteConfirm = () => {
        if (phaseToDelete) {
            dispatch({ type: ACTIONS.DELETE_PHASE, payload: phaseToDelete.id });
        }
        setIsDeleteOpen(false);
        setPhaseToDelete(null);
    };

    // Move phase up
    const handleMoveUp = (index) => {
        if (index === 0) return;
        const newPhases = [...state.phases];
        [newPhases[index - 1], newPhases[index]] = [newPhases[index], newPhases[index - 1]];
        // Update IDs to reflect new order
        const reorderedPhases = newPhases.map((p, i) => ({ ...p, id: i + 1 }));
        dispatch({ type: ACTIONS.SET_PHASES, payload: reorderedPhases });
    };

    // Move phase down
    const handleMoveDown = (index) => {
        if (index === state.phases.length - 1) return;
        const newPhases = [...state.phases];
        [newPhases[index], newPhases[index + 1]] = [newPhases[index + 1], newPhases[index]];
        // Update IDs to reflect new order
        const reorderedPhases = newPhases.map((p, i) => ({ ...p, id: i + 1 }));
        dispatch({ type: ACTIONS.SET_PHASES, payload: reorderedPhases });
    };

    return (
        <div className="library-page space-y-6 animate-in fade-in duration-500">
            {/* Header section with glass effect */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 glass-effect p-6 rounded-2xl border border-white/20 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <Layers className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Task Phases</h2>
                        <p className="text-sm text-slate-500 font-medium">Define and order your project workflow</p>
                    </div>
                </div>

                <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95" onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add phase
                </Button>
            </div>

            <div className="grid gap-3">
                {state.phases.map((phase, index) => (
                    <div
                        key={phase.id}
                        className={cn(
                            "group flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm transition-all hover:shadow-md hover:border-blue-200",
                            phase.isTerminal && "opacity-80 grayscale-[0.2]"
                        )}
                    >
                        <div className="flex flex-col gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                            >
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === state.phases.length - 1}
                            >
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-500 font-bold text-lg border border-slate-200">
                            {index + 1}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800">{phase.name}</h3>
                                {phase.isTerminal && (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] py-0 px-1.5 uppercase tracking-wide">
                                        Terminal
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                                {phase.tasks.length} task templates linked
                            </p>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => handleEdit(phase)}>
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDeleteClick(phase)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {state.phases.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400">
                        <Layers className="h-10 w-10 mb-2 opacity-20" />
                        <p className="font-medium">No phases defined yet.</p>
                        <Button variant="link" onClick={handleAdd} className="text-blue-500">Add your first phase</Button>
                    </div>
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPhase ? 'Edit Phase' : 'Add Phase'}
                        </DialogTitle>
                        <DialogDescription>
                            Define a new project stage or lifecycle phase.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Phase Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={cn("rounded-lg", errors.name && "border-red-500")}
                                placeholder="e.g. Planning, Execution, Review"
                            />
                            {errors.name && <p className="text-[10px] text-red-500 font-medium">{errors.name}</p>}
                        </div>

                        <div className="flex items-start space-x-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                            <Checkbox
                                id="isTerminal"
                                checked={formData.isTerminal}
                                onCheckedChange={(v) => handleChange('isTerminal', v)}
                                className="mt-1 rounded-[4px]"
                            />
                            <div className="space-y-1">
                                <Label htmlFor="isTerminal" className="text-sm font-bold text-amber-900 cursor-pointer">
                                    Terminal Phase
                                </Label>
                                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                    Marks the end of work. Tasks in this phase won't count towards active workload capacity.
                                </p>
                            </div>
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
                            {editingPhase ? 'Update' : 'Create'} phase
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Phase</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-bold text-slate-900">"{phaseToDelete?.name}"</span>?
                            This stage will be removed from all active project timelines.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} className="rounded-xl bg-red-600 hover:bg-red-700">Delete Phase</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
