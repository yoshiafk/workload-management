import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { leavesApi } from '../../services/api';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Loader2, AlertCircle, Info, Umbrella } from 'lucide-react';
import { cn } from '@/lib/utils';

const LeaveRequestForm = ({ open, onClose, onSuccess, balances = [] }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        halfDay: 'FULL',
        reason: ''
    });

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (isNaN(start) || isNaN(end)) return 0;

        const diffTime = Math.abs(end - start);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (formData.halfDay !== 'FULL' && diffDays === 1) {
            diffDays = 0.5;
        }
        return diffDays;
    };

    const days = calculateDays();
    const selectedBalance = balances.find(b => b.leaveTypeId === formData.leaveTypeId);
    const remaining = selectedBalance ? (parseFloat(selectedBalance.totalDays) - parseFloat(selectedBalance.usedDays)) : 0;
    const isInsufficient = selectedBalance && days > remaining;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.leaveTypeId || !formData.startDate || !formData.endDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (isInsufficient) {
            toast.error('Insufficient leave balance');
            return;
        }

        try {
            setIsLoading(true);
            await leavesApi.submitRequest(formData);
            toast.success('Leave request submitted successfully');
            onSuccess?.();
            onClose();
            // Reset form
            setFormData({
                leaveTypeId: '',
                startDate: '',
                endDate: '',
                halfDay: 'FULL',
                reason: ''
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="flex items-center gap-3 text-lg font-black tracking-tight">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <Umbrella className="h-5 w-5 text-indigo-500" />
                        </div>
                        Request Leave
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium text-xs mt-1">
                        Submit a new leave request for approval.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="leaveType" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Leave Type</Label>
                        <Select
                            value={formData.leaveTypeId}
                            onValueChange={(v) => setFormData({ ...formData, leaveTypeId: v })}
                        >
                            <SelectTrigger id="leaveType" className="bg-muted/20 border-border/40 rounded-xl font-bold h-11">
                                <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border bg-popover">
                                {balances.map(b => (
                                    <SelectItem key={b.leaveTypeId} value={b.leaveTypeId} className="font-bold">
                                        {b.leaveType?.name} ({parseFloat(b.totalDays) - parseFloat(b.usedDays)} days left)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Date</Label>
                            <div className="relative">
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                    className="bg-muted/20 border-border/40 rounded-xl font-bold h-11 pl-4"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Date</Label>
                            <div className="relative">
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                    className="bg-muted/20 border-border/40 rounded-xl font-bold h-11 pl-4"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Day Configuration</Label>
                        <RadioGroup
                            value={formData.halfDay}
                            onValueChange={(v) => setFormData({ ...formData, halfDay: v })}
                            className="flex gap-6 p-1"
                            disabled={days > 1}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="FULL" id="full" className="border-border/60" />
                                <Label htmlFor="full" className="font-bold text-xs cursor-pointer">Full Day</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="AM" id="am" className="border-border/60" />
                                <Label htmlFor="am" className="font-bold text-xs cursor-pointer">AM Only</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="PM" id="pm" className="border-border/60" />
                                <Label htmlFor="pm" className="font-bold text-xs cursor-pointer">PM Only</Label>
                            </div>
                        </RadioGroup>
                        {days > 1 && (
                            <p className="text-[9px] text-muted-foreground/60 font-medium italic translate-x-1">Half day options only available for single day requests.</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Reason (Optional)</Label>
                        <Textarea
                            id="reason"
                            placeholder="Briefly explain your request..."
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="resize-none h-24 bg-muted/20 border-border/40 rounded-xl font-medium focus:ring-indigo-500/20"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        {days > 0 && (
                            <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">Duration Projection</span>
                                <span className="text-sm font-black text-emerald-600 uppercase tracking-tight">{days} day{days !== 1 ? 's' : ''}</span>
                            </div>
                        )}

                        {selectedBalance && (
                            <div className={cn(
                                "flex items-start gap-3 p-4 rounded-xl border transition-all duration-300",
                                isInsufficient
                                    ? "bg-red-500/5 border-red-500/20 text-red-600 shadow-sm shadow-red-500/5"
                                    : "bg-indigo-500/5 border-indigo-500/20 text-indigo-600 shadow-sm shadow-indigo-500/5"
                            )}>
                                {isInsufficient ? <AlertCircle className="h-5 w-5 shrink-0" /> : <Info className="h-5 w-5 shrink-0" />}
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                                        {isInsufficient ? 'Insufficient Balance' : 'Balance Check'}
                                    </p>
                                    <p className="text-xs font-bold leading-relaxed opacity-90">
                                        {isInsufficient
                                            ? `Available: ${remaining} days for ${selectedBalance.leaveType?.name}.`
                                            : `Remaining after request: ${remaining - days} days.`
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                <DialogFooter className="p-6 pt-2 bg-muted/10 border-t border-border/40 gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-xl font-bold text-xs hover:bg-muted"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !formData.leaveTypeId || !formData.startDate || !formData.endDate || isInsufficient}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 font-black text-[10px] uppercase tracking-wider shadow-lg shadow-indigo-500/20 h-10 border-none"
                    >
                        {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin text-white" />}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LeaveRequestForm;
