import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePendingLeaves } from '../../hooks/useAdminLeave';
import { Check, X, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const PendingApprovalsWidget = ({ limit = 3 }) => {
    const { requests, isLoading, approve, reject } = usePendingLeaves();
    const navigate = useNavigate();

    if (isLoading) {
        return <Skeleton className="h-64 w-full rounded-3xl" />;
    }

    const displayRequests = requests.slice(0, limit);

    return (
        <Card className="shadow-lg border-main hover:border-primary/20 transition-all group rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        Pending Approvals ({requests.length})
                    </CardTitle>
                </div>
                {requests.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[10px] font-black uppercase tracking-widest text-primary gap-1"
                        onClick={() => navigate('/admin/leaves')}
                    >
                        View All <ArrowRight className="h-3 w-3" />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {requests.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-main">
                        <Check className="h-8 w-8 text-emerald-500/30 mx-auto mb-2" />
                        All caught up! No pending requests.
                    </div>
                ) : (
                    displayRequests.map((req) => (
                        <div key={req.id} className="p-4 rounded-2xl bg-muted/30 border border-main space-y-3 hover:bg-white transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {req.member?.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{req.member?.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{req.leaveType?.name}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] font-bold bg-white">
                                    {req.days} days
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                                <span className="bg-white px-1.5 py-0.5 rounded border border-main">
                                    {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                </span>
                            </div>

                            {req.teamConflicts?.length > 0 && (
                                <div className="flex items-start gap-2 p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-medium animate-pulse-subtle">
                                    <AlertTriangle className="h-3 w-3 shrink-0" />
                                    <span>Team conflict: {req.teamConflicts[0].memberName} off during this period</span>
                                </div>
                            )}

                            <div className="flex gap-2 pt-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 h-8 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold text-[10px] uppercase tracking-wide"
                                    onClick={() => reject(req.id, 'No reason provided')}
                                >
                                    <X className="h-3 w-3 mr-1" /> Reject
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] uppercase tracking-wide"
                                    onClick={() => approve(req.id)}
                                >
                                    <Check className="h-3 w-3 mr-1" /> Approve
                                </Button>
                            </div>
                        </div>
                    ))
                )}
                {requests.length > limit && (
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                        + {requests.length - limit} more pending
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default PendingApprovalsWidget;
