import React, { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { allocationsApi } from '../../services/api';
import { useApp, ACTIONS } from '../../context/AppContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const STATUS_CONFIG = {
    'open': { label: 'Open', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
    'in-progress': { label: 'In Progress', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    'under-review': { label: 'Under Review', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    'completed': { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    'on-hold': { label: 'On Hold', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export default function StatusSelector({ allocationId, currentStatus, onStatusChange }) {
    const { dispatch } = useApp();
    const [status, setStatus] = useState(currentStatus || 'open');
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusChange = async (newStatus) => {
        try {
            setIsLoading(true);
            const response = await allocationsApi.updateStatus(allocationId, { status: newStatus });
            
            // Update global state
            dispatch({
                type: ACTIONS.UPDATE_ALLOCATION,
                payload: response.data
            });

            setStatus(newStatus);
            onStatusChange?.(newStatus);
            toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setIsLoading(false);
        }
    };

    const config = STATUS_CONFIG[status] || STATUS_CONFIG['open'];

    return (
        <div className="flex items-center gap-2">
            <Select
                value={status}
                onValueChange={handleStatusChange}
                disabled={isLoading}
            >
                <SelectTrigger className={cn(
                    "h-8 w-fit px-3 rounded-full border border-transparent font-black text-[10px] uppercase tracking-widest transition-all",
                    config.color,
                    "hover:opacity-80"
                )}>
                    {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    <SelectValue>
                        {STATUS_CONFIG[status]?.label || status}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <SelectItem
                            key={key}
                            value={key}
                            className="text-[10px] font-black uppercase tracking-widest py-2"
                        >
                            <span className={cn("px-2 py-0.5 rounded-full", cfg.color)}>
                                {cfg.label}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
