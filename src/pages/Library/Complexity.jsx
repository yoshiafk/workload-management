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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Gauge,
    Clock,
    Calendar,
    Zap,
    Edit2,
    Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import './LibraryPage.css';

export default function Complexity() {
    const { state, dispatch } = useApp();
    const { complexity } = state;

    // Modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState(null);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    // Open edit modal
    const handleEdit = (level) => {
        setFormData({ ...level });
        setEditingLevel(level);
        setErrors({});
        setIsFormOpen(true);
    };

    // Handle form input change
    const handleChange = (name, value) => {
        const numValue = parseFloat(value) || 0;
        const updated = { ...formData, [name]: numValue };

        // Recalculate workload: hours / 8 (Man-Days)
        const hours = name === 'hours' ? numValue : formData.hours;
        updated.workload = hours / 8;

        setFormData(updated);

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Validate form
    const validate = () => {
        const newErrors = {};
        if (!formData.days || formData.days < 1) newErrors.days = 'Required (min 1)';
        if (formData.hours === undefined || formData.hours < 0) newErrors.hours = 'Required (min 0)';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = () => {
        if (!validate()) return;
        dispatch({
            type: ACTIONS.UPDATE_COMPLEXITY,
            payload: { [formData.level]: formData }
        });
        setIsFormOpen(false);
    };

    return (
        <div className="library-page space-y-6 animate-in fade-in duration-500">
            {/* Header section with glass effect */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-glass-bg glass-effect p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-900">
                        <Settings2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Complexity Settings</h2>
                        <p className="text-sm text-slate-500 font-medium dark:text-slate-400">Configure estimation baselines for project tasks</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.values(complexity).map(level => (
                    <Card key={level.level} className="relative overflow-hidden border-slate-200/60 dark:border-slate-800 bg-glass-bg backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                        <div
                            className="absolute top-0 left-0 w-full h-1"
                            style={{ backgroundColor: level.color }}
                        />
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg font-bold text-slate-800">{level.label}</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleEdit(level)}
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <Calendar className="h-3 w-3" />
                                        Duration
                                    </div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                                        {level.days}<span className="text-xs font-medium text-slate-400 ml-1">Days</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <Clock className="h-3 w-3" />
                                        Effort
                                    </div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                                        {level.hours}<span className="text-xs font-medium text-slate-400 ml-1">Hrs</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span>Task Multiplier (Man-Days)</span>
                                </div>
                                <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                                        style={{
                                            backgroundColor: level.color,
                                            width: `${Math.min((level.workload / 3) * 100, 100)}%`
                                        }}
                                    />
                                </div>
                                <div className="mt-2 text-2xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
                                    {level.workload.toFixed(2)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Complexity</DialogTitle>
                        <DialogDescription>
                            Review the impact and effort adjustment for this level.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="days">Duration (Days)</Label>
                            <Input
                                id="days"
                                type="number"
                                value={formData.days}
                                onChange={(e) => handleChange('days', e.target.value)}
                                className={cn("rounded-lg", errors.days && "border-red-500")}
                                min={1}
                            />
                            {errors.days && <p className="text-[10px] text-red-500 font-medium">{errors.days}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hours">Effort (Hours)</Label>
                            <Input
                                id="hours"
                                type="number"
                                value={formData.hours}
                                onChange={(e) => handleChange('hours', e.target.value)}
                                className={cn("rounded-lg", errors.hours && "border-red-500")}
                                min={0}
                            />
                            {errors.hours && <p className="text-[10px] text-red-500 font-medium">{errors.hours}</p>}
                        </div>
                        <div className="p-4 bg-surface-sunken dark:bg-white/5 rounded-xl space-y-2 border border-slate-200 dark:border-white/10">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span>Calculated Man-Days</span>
                                <Gauge className="h-3 w-3" />
                            </div>
                            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
                                {formData.workload?.toFixed(4)}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium leading-tight">
                                This value is used as a multiplier for resource calculations (Hours / 8).
                            </p>
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
                            Update settings
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
