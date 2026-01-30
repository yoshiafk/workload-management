import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const LeaveRequestList = ({ requests = [], isLoading, onCancel }) => {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const statusColors = {
        PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
        APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        REJECTED: 'bg-rose-100 text-rose-800 border-rose-200',
        CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const statusIcons = {
        PENDING: <Clock className="h-3 w-3 mr-1" />,
        APPROVED: <CheckCircle2 className="h-3 w-3 mr-1" />,
        REJECTED: <XCircle className="h-3 w-3 mr-1" />,
        CANCELLED: <AlertCircle className="h-3 w-3 mr-1" />
    };

    const filteredRequests = requests.filter(req => {
        const matchesFilter = filter === 'all' || req.status === filter;
        const matchesSearch = search === '' ||
            req.leaveType?.name?.toLowerCase().includes(search.toLowerCase()) ||
            req.reason?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    return (
        <Card className="shadow-none border-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                    <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
                        <TabsList className="bg-muted/50 border border-main">
                            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                            <TabsTrigger value="PENDING" className="text-xs">Pending</TabsTrigger>
                            <TabsTrigger value="APPROVED" className="text-xs text-emerald-600">Approved</TabsTrigger>
                            <TabsTrigger value="REJECTED" className="text-xs text-rose-600">Rejected</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search requests..."
                            className="pl-9 h-9 text-xs"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
                {filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-main rounded-xl bg-white/50">
                        <Calendar className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">No leave requests found</p>
                        <p className="text-xs text-muted-foreground/60">{search ? 'Try adjusting your search or filters' : 'Your history will appear here'}</p>
                    </div>
                ) : (
                    filteredRequests.map((request) => (
                        <div
                            key={request.id}
                            className="group relative bg-white border border-main rounded-xl p-4 transition-all hover:shadow-sm hover:border-primary/20 flex flex-col sm:flex-row justify-between gap-4"
                        >
                            <div className="flex gap-4">
                                <div
                                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${request.leaveType?.color || 'var(--primary)'}15` }}
                                >
                                    <Calendar className="h-5 w-5" style={{ color: request.leaveType?.color }} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-foreground">{request.leaveType?.name}</h4>
                                        <Badge className={`text-[10px] h-5 px-2 font-bold variant-outline ${statusColors[request.status]}`}>
                                            {statusIcons[request.status]}
                                            {request.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1 font-medium bg-muted/30 px-1.5 py-0.5 rounded">
                                            {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                                        </span>
                                        <span className="text-foreground/70 font-bold">{request.days} days {request.halfDay !== 'FULL' ? `(${request.halfDay})` : ''}</span>
                                    </div>
                                    {request.reason && (
                                        <p className="text-xs text-muted-foreground italic line-clamp-1 border-l-2 border-muted pl-2 mt-2">
                                            "{request.reason}"
                                        </p>
                                    )}
                                    {request.rejectionReason && (
                                        <div className="mt-2 text-[10px] text-rose-600 bg-rose-50 p-2 rounded border border-rose-100">
                                            <span className="font-bold">Reason for Rejection:</span> {request.rejectionReason}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-row sm:flex-col justify-between sm:justify-center items-end gap-2">
                                <div className="text-[10px] text-muted-foreground text-right">
                                    Submitted {format(new Date(request.createdAt), 'MMM d, h:mm a')}
                                </div>
                                {request.status === 'PENDING' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold text-xs"
                                        onClick={() => onCancel(request.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                                        Cancel
                                    </Button>
                                )}
                                {request.status === 'APPROVED' && request.reviewer && (
                                    <div className="text-[10px] text-emerald-600 font-medium">
                                        Approved by {request.reviewer.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export default LeaveRequestList;
