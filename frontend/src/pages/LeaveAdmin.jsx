import React, { useState } from 'react';
import { usePendingLeaves, useLeaveBalancesAdmin } from '../hooks/useAdminLeave';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Umbrella,
    Search,
    CheckCircle2,
    Clock,
    User,
    Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { PageTransition } from '@/components/ui/page-transition';
import LeaveBalanceTable from '../components/leave/LeaveBalanceTable';

const LeaveAdmin = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { requests, isLoading, approve, reject } = usePendingLeaves();
    const { balances, isLoading: isBalancesLoading } = useLeaveBalancesAdmin();

    const filteredRequests = requests.filter(req =>
        req.member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.leaveType?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusColors = {
        PENDING: 'bg-amber-100 text-amber-800',
        APPROVED: 'bg-emerald-100 text-emerald-800',
        REJECTED: 'bg-rose-100 text-rose-800'
    };

    return (
        <PageTransition>
            <div className="container mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Umbrella className="h-8 w-8 text-primary" />
                            Leave Administration
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Review leave requests and manage team entitlements.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="pending" className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-main pb-4">
                        <TabsList className="bg-muted/50 border border-main">
                            <TabsTrigger value="pending" className="gap-2">
                                <Clock className="h-4 w-4" />
                                Pending Approvals
                                {requests.length > 0 && (
                                    <Badge className="ml-1 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                        {requests.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="balances" className="gap-2">
                                <User className="h-4 w-4" />
                                All Balances
                            </TabsTrigger>
                        </TabsList>

                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or type..."
                                className="pl-10 h-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <TabsContent value="pending" className="space-y-4">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted/50" />)}
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-main rounded-2xl">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500/20 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-foreground">No Pending Requests</h3>
                                <p className="text-muted-foreground">You've cleared the queue! Good job.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRequests.map(req => (
                                    <Card key={req.id} className="shadow-sm border-main hover:border-primary/20 transition-all flex flex-col">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {req.member?.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-base">{req.member?.name}</CardTitle>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{req.member?.roleType || 'Member'}</p>
                                                    </div>
                                                </div>
                                                <Badge className={statusColors[req.status]}>
                                                    {req.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4 flex-1">
                                            <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-foreground">{req.leaveType?.name}</span>
                                                    <span className="font-bold text-primary">{req.days} days</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(req.startDate), 'MMM d')} - {format(new Date(req.endDate), 'MMM d, yyyy')}
                                                </div>
                                            </div>

                                            {req.reason && (
                                                <p className="text-xs text-muted-foreground italic border-l-2 border-primary/20 pl-3">
                                                    "{req.reason}"
                                                </p>
                                            )}

                                            {req.teamConflicts?.length > 0 && (
                                                <div className="p-2 rounded bg-amber-50 border border-amber-100 text-[10px] text-amber-700 font-medium">
                                                    ⚠️ Conflict: {req.teamConflicts[0].memberName} is also off.
                                                </div>
                                            )}

                                            <div className="pt-2 flex gap-2 mt-auto">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 h-9 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                                                    onClick={() => {
                                                        const reason = prompt('Reason for rejection:');
                                                        if (reason) reject(req.id, reason);
                                                    }}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                                                    onClick={() => approve(req.id)}
                                                >
                                                    Approve
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="balances">
                        <LeaveBalanceTable
                            balances={balances}
                            isLoading={isBalancesLoading}
                            onEdit={(b) => alert('Edit Balance logic')}
                            onDelete={(id) => alert('Delete/Reset Balance logic')}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </PageTransition>
    );
};

export default LeaveAdmin;
