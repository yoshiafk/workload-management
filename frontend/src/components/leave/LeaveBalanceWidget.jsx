import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaveBalance } from '../../hooks/useLeave';
import { Plane, Plus, Info, Clock } from 'lucide-react';

const LeaveBalanceWidget = ({ onRequestLeave }) => {
    const { balances, isLoading, error } = useLeaveBalance();

    if (isLoading) {
        return (
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Skeleton className="h-4 w-32" />
                    </CardTitle>
                    <Skeleton className="h-8 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/50">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <Info className="h-8 w-8 text-destructive opacity-50" />
                    <p className="text-sm text-destructive">{error}</p>
                </CardContent>
            </Card>
        );
    }

    const pendingDays = balances.reduce((sum, b) => sum + (b.pendingDays || 0), 0);

    return (
        <Card className="shadow-sm border-main hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2 tracking-tight">
                    <Plane className="h-4 w-4 text-primary" />
                    MY LEAVE BALANCE
                </CardTitle>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onRequestLeave}
                    className="h-8 gap-1 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Request Leave
                </Button>
            </CardHeader>
            <CardContent className="space-y-5">
                {balances.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                        No leave balances found.
                    </div>
                ) : (
                    balances.map((balance) => {
                        const total = parseFloat(balance.totalDays);
                        const used = parseFloat(balance.usedDays);
                        const remaining = total - used;
                        const percentage = total > 0 ? (used / total) * 100 : 0;
                        const color = balance.leaveType?.color || 'var(--primary)';

                        return (
                            <div key={balance.id} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-medium px-0.5">
                                    <span className="text-foreground">{balance.leaveType?.name}</span>
                                    <span className="text-muted-foreground">
                                        <span className="font-bold text-foreground">{remaining}</span> / {total} days
                                    </span>
                                </div>
                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 ease-spring"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: color
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}

                {pendingDays > 0 && (
                    <div className="pt-2 flex items-start gap-2 text-xs font-medium text-amber-600 bg-amber-50/50 p-2.5 rounded-md border border-amber-100/50">
                        <Clock className="h-3.5 w-3.5 mt-0.5" />
                        <div>
                            <p>⏳ Pending: {pendingDays} days</p>
                            <p className="text-[10px] opacity-70">Awaiting approval from manager</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default LeaveBalanceWidget;
