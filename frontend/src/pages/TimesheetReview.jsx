import React, { useState } from 'react';
import { useAdminTimesheet } from '../hooks/useAdminTimesheet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/ui/page-transition';
import {
    Clock,
    Check,
    X,
    Search,
    Calendar,
    User,
    FileText,
    ArrowRight,
    AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const TimesheetReview = () => {
    const { pendingTimesheets, isLoading, reviewTimesheet } = useAdminTimesheet();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTimesheet, setSelectedTimesheet] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const filtered = pendingTimesheets.filter(t =>
        t.member?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading && pendingTimesheets.length === 0) {
        return <div className="p-8 text-center text-muted-foreground"><Skeleton className="h-40 w-full" /></div>;
    }

    return (
        <PageTransition>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                            <Clock className="h-8 w-8 text-primary" />
                            TIMESHEET REVIEW
                        </h1>
                        <p className="text-muted-foreground font-medium">Review and approve employee weekly timesheets</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: List of Pending */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name..."
                                className="pl-10 h-10 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {filtered.length === 0 ? (
                            <Card className="border-dashed border-main bg-muted/20">
                                <CardContent className="p-12 text-center">
                                    <Check className="h-12 w-12 text-emerald-500/20 mx-auto mb-3" />
                                    <p className="font-bold text-muted-foreground">All caught up!</p>
                                    <p className="text-xs text-muted-foreground">No pending timesheets for review.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {filtered.map(t => (
                                    <Card
                                        key={t.id}
                                        onClick={() => setSelectedTimesheet(t)}
                                        className={`cursor-pointer transition-all border-main hover:border-primary/50 overflow-hidden ${selectedTimesheet?.id === t.id ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-lg' : ''
                                            }`}
                                    >
                                        <CardContent className="p-4 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <div className="font-bold text-foreground">{t.member?.name}</div>
                                                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">
                                                    {t.totalHours}h
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                                <Calendar className="h-3 w-3" />
                                                {format(parseISO(t.startDate), 'MMM d')} - {format(parseISO(t.endDate), 'MMM d')}
                                            </div>
                                            <div className="flex justify-end mt-1">
                                                <ArrowRight className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Detail View */}
                    <div className="lg:col-span-2">
                        {selectedTimesheet ? (
                            <Card className="border-main shadow-xl rounded-3xl overflow-hidden min-h-[500px] flex flex-col">
                                <CardHeader className="bg-muted/10 border-b border-main p-6">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl">
                                                {selectedTimesheet.member?.name.charAt(0)}
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-black">{selectedTimesheet.member?.name}</CardTitle>
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                    Week of {format(parseISO(selectedTimesheet.startDate), 'MMMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="h-10 px-4 rounded-xl border-main font-black text-lg text-primary bg-white">
                                            {selectedTimesheet.totalHours} Total Hours
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 flex-grow">
                                    <div className="space-y-6">
                                        <div className="bg-muted/30 p-4 rounded-2xl border border-main">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                                <FileText className="h-3 w-3" /> Review Details
                                            </h4>
                                            <p className="text-sm text-foreground">
                                                This member has submitted {selectedTimesheet.totalHours} hours for the period
                                                <span className="font-bold underline decoration-primary/30 mx-1">
                                                    {format(parseISO(selectedTimesheet.startDate), 'EEE, MMM d')} - {format(parseISO(selectedTimesheet.endDate), 'EEE, MMM d')}
                                                </span>.
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-3 pt-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Approval Actions</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-4">
                                                    <Button
                                                        className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold gap-2 text-white shadow-lg shadow-emerald-200"
                                                        onClick={() => {
                                                            reviewTimesheet(selectedTimesheet.id, 'APPROVED');
                                                            setSelectedTimesheet(null);
                                                        }}
                                                    >
                                                        <Check className="h-5 w-5" /> Approve Timesheet
                                                    </Button>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Input
                                                            placeholder="Reason for rejection (optional)..."
                                                            className="rounded-xl border-main text-sm"
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            className="w-full h-12 rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold gap-2"
                                                            onClick={() => {
                                                                reviewTimesheet(selectedTimesheet.id, 'REJECTED', rejectionReason);
                                                                setSelectedTimesheet(null);
                                                                setRejectionReason('');
                                                            }}
                                                        >
                                                            <X className="h-5 w-5" /> Reject Timesheet
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-muted/5 border-2 border-dashed border-main rounded-3xl min-h-[500px]">
                                <ArrowRight className="h-16 w-16 text-muted-foreground/10 mb-6 -rotate-45" />
                                <h3 className="text-lg font-bold text-muted-foreground">Select a timesheet to review</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">Click on a card from the list to see detailed work entries and take action.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default TimesheetReview;
