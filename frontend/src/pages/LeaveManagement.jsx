import React, { useState } from 'react';
import { useLeaveBalance, useMyLeaveRequests } from '../hooks/useLeave';
import LeaveBalanceWidget from '../components/leave/LeaveBalanceWidget';
import LeaveRequestList from '../components/leave/LeaveRequestList';
import LeaveRequestForm from '../components/leave/LeaveRequestForm';
import { Button } from '@/components/ui/button';
import { Plus, Umbrella, History, RefreshCcw } from 'lucide-react';
import { PageTransition } from '@/components/ui/page-transition';
import { toast } from 'sonner';

const LeaveManagement = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { balances, isLoading: isBalanceLoading, refreshBalances } = useLeaveBalance();
    const { requests, isLoading: isRequestsLoading, refreshRequests, cancelRequest } = useMyLeaveRequests();

    const handleRefresh = () => {
        refreshBalances();
        refreshRequests();
        toast.info('Data refreshed');
    };

    const handleSuccess = () => {
        refreshBalances();
        refreshRequests();
    };

    return (
        <PageTransition>
            <div className="container mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-main pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Umbrella className="h-8 w-8 text-primary" />
                            Leave Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Track your leave balances and manage your time off requests.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRefresh}
                            className="shrink-0 border-main hover:bg-muted"
                        >
                            <RefreshCcw className="h-4 w-4" />
                        </Button>
                        <Button
                            className="w-full sm:w-auto shadow-sm gap-2 font-bold"
                            onClick={() => setIsFormOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Request Leave
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Balance Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                        <LeaveBalanceWidget
                            onRequestLeave={() => setIsFormOpen(true)}
                        />

                        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Policy Highlights</h4>
                            <ul className="text-[11px] text-muted-foreground space-y-2 list-disc pl-4">
                                <li>Annual leave requires 2 weeks notice for durations over 3 days.</li>
                                <li>Unused annual leave (up to 5 days) carries over to next year.</li>
                                <li>Sick leave may require medical certificate for more than 2 consecutive days.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Request History */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center gap-2 border-b border-main pb-2">
                            <History className="h-4 w-4 text-primary" />
                            <h2 className="text-lg font-bold">My Requests</h2>
                        </div>

                        <LeaveRequestList
                            requests={requests}
                            isLoading={isRequestsLoading}
                            onCancel={cancelRequest}
                        />
                    </div>
                </div>

                {/* Submit Form Dialog */}
                <LeaveRequestForm
                    open={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={handleSuccess}
                    balances={balances}
                />
            </div>
        </PageTransition>
    );
};

export default LeaveManagement;
