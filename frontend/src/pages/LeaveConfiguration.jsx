import React from 'react';
import LeaveTypeManager from '../components/leave/LeaveTypeManager';
import LeaveBalanceTable from '../components/leave/LeaveBalanceTable';
import { useLeaveBalancesAdmin } from '../hooks/useAdminLeave';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Settings, UserCog, Palette, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/ui/page-transition';

const LeaveConfiguration = () => {
    const { balances, isLoading: isBalancesLoading, refresh: refreshBalances } = useLeaveBalancesAdmin();

    return (
        <PageTransition>
            <div className="container mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Settings className="h-8 w-8 text-primary" />
                            Leave Configuration
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Define leave policies and manage member entitlements.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => refreshBalances()} className="gap-2 border-main font-bold">
                        <RefreshCcw className="h-4 w-4" /> Sync Balances
                    </Button>
                </div>

                <Tabs defaultValue="types" className="space-y-6">
                    <TabsList className="bg-muted/50 border border-main h-11 p-1">
                        <TabsTrigger value="types" className="gap-2 px-6">
                            <Palette className="h-4 w-4" />
                            Leave Types
                        </TabsTrigger>
                        <TabsTrigger value="entitlements" className="gap-2 px-6">
                            <UserCog className="h-4 w-4" />
                            Member Entitlements
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="types" className="animate-in fade-in slide-in-from-left-4 duration-300">
                        <LeaveTypeManager />
                    </TabsContent>

                    <TabsContent value="entitlements" className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold">Member Balances</h3>
                            </div>
                            <LeaveBalanceTable
                                balances={balances}
                                isLoading={isBalancesLoading}
                                onEdit={(b) => alert('Edit Balance Modal - TBD')}
                                onDelete={(id) => alert('Delete/Reset Balance logic - TBD')}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 mt-12">
                    <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                        <UserCog className="h-5 w-5" />
                        Administrator's Note
                    </h4>
                    <p className="text-sm text-amber-900 opacity-80 leading-relaxed">
                        Changes to Leave Types (like default days) will only apply to <strong>newly created balances</strong>.
                        To update existing quotas, use the "Member Entitlements" tab to modify specific records or perform a global reset.
                    </p>
                </div>
            </div>
        </PageTransition>
    );
};

export default LeaveConfiguration;
