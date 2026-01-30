import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { allocationsApi } from '../../services/api';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

const STATUS_MAP = {
    'open': { label: 'Open', color: 'text-slate-500', icon: Clock },
    'in-progress': { label: 'In Progress', color: 'text-blue-500', icon: TrendingUp },
    'completed': { label: 'Completed', color: 'text-emerald-500', icon: CheckCircle2 },
    'under-review': { label: 'Under Review', color: 'text-amber-500', icon: AlertCircle },
};

export default function TaskStatsWidget() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await allocationsApi.getAdminStats();
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch task stats', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <Card className="rounded-3xl border-border/60 shadow-sm overflow-hidden">
                <CardContent className="h-48 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                </CardContent>
            </Card>
        );
    }

    if (!stats) return null;

    return (
        <Card className="rounded-3xl border-border/60 shadow-sm overflow-hidden bg-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                    Team Progress
                    <Badge variant="outline" className="text-[10px] font-black border-indigo-500/20 text-indigo-600 bg-indigo-500/5">
                        Live
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-black tracking-tight">{stats.avgProgress}%</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase pb-1">Average Completion</span>
                    </div>
                    <Progress value={parseFloat(stats.avgProgress)} className="h-2 rounded-full bg-slate-100" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(stats.byStatus).map(([status, count]) => {
                        const config = STATUS_MAP[status] || { label: status, color: 'text-slate-400', icon: Clock };
                        const Icon = config.icon;

                        return (
                            <div key={status} className="bg-muted/30 p-3 rounded-2xl border border-border/40">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className={cn("h-3.5 w-3.5", config.color)} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        {config.label}
                                    </span>
                                </div>
                                <div className="text-xl font-bold tracking-tight">
                                    {count}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
