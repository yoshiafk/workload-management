import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useMemoizedCostCenterMetrics } from '../../utils/memoizedCalculations';
import { useReportGenerator } from '../../utils/optimizedReports';
import { LoadingOverlay } from '../../components/ui/skeleton-components';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    DollarSign,
    Download,
    Calendar,
    Filter,
    AlertTriangle,
    CheckCircle,
    Target,
    Activity,
    CheckSquare,
    Info
} from "lucide-react";
import './LibraryPage.css';

export default function CostCenterReports() {
    const { state } = useApp();
    const [selectedPeriod, setSelectedPeriod] = useState('current');
    const [selectedCostCenter, setSelectedCostCenter] = useState('all');
    const [activeTab, setActiveTab] = useState('dashboard');

    // Use optimized report generation
    const {
        progress,
        generateReport,
        exportReport,
        isGenerating,
        isCompleted
    } = useReportGenerator();

    // Use memoized metrics calculation
    const metrics = useMemoizedCostCenterMetrics(state);

    // Filter data based on selected cost center
    const filteredData = useMemo(() => {
        if (selectedCostCenter === 'all') {
            return metrics.utilizationData || [];
        }
        return (metrics.utilizationData || []).filter(item => item.costCenter.id === selectedCostCenter);
    }, [metrics.utilizationData, selectedCostCenter]);

    // Calculate budget variance metrics
    const budgetMetrics = useMemo(() => {
        const activeCostCenters = state.costCenters.filter(cc => cc.isActive);

        let totalBudget = 0;
        let totalActual = 0;
        let overBudgetCount = 0;
        let underBudgetCount = 0;
        let onTrackCount = 0;

        const centerVariances = activeCostCenters.map(cc => {
            const monthlyBudget = cc.monthlyBudget || 0;
            const actualCost = cc.actualMonthlyCost || 0;
            const variance = actualCost - monthlyBudget;
            const variancePercent = monthlyBudget > 0 ? (variance / monthlyBudget) * 100 : 0;

            totalBudget += monthlyBudget;
            totalActual += actualCost;

            if (variancePercent > 10) overBudgetCount++;
            else if (variancePercent < -10) underBudgetCount++;
            else onTrackCount++;

            return {
                ...cc,
                variance,
                variancePercent,
                status: variancePercent > 10 ? 'over' : variancePercent < -10 ? 'under' : 'on-track'
            };
        });

        return {
            totalBudget,
            totalActual,
            totalVariance: totalActual - totalBudget,
            totalVariancePercent: totalBudget > 0 ? ((totalActual - totalBudget) / totalBudget) * 100 : 0,
            overBudgetCount,
            underBudgetCount,
            onTrackCount,
            centerVariances
        };
    }, [state.costCenters]);

    // Handle report generation
    const handleGenerateReport = async () => {
        try {
            await generateReport(state, {
                includeCharts: true,
                includeDetails: true,
                onProgress: (progress, message) => {
                    console.log(`Report progress: ${progress}% - ${message}`);
                }
            });
        } catch (error) {
            console.error('Report generation failed:', error);
        }
    };

    const handleExport = async (format) => {
        try {
            if (!isCompleted) {
                await handleGenerateReport();
            }

            const exportData = await exportReport(format);

            // Create download link
            const url = URL.createObjectURL(exportData.blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = exportData.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            notation: 'compact'
        }).format(amount);
    };

    const getVarianceColor = (percent) => {
        if (percent > 10) return 'text-red-600';
        if (percent < -10) return 'text-green-600';
        return 'text-blue-600';
    };

    const getVarianceIcon = (percent) => {
        if (percent > 10) return <TrendingUp className="h-4 w-4 text-red-600" />;
        if (percent < -10) return <TrendingDown className="h-4 w-4 text-green-600" />;
        return <Target className="h-4 w-4 text-blue-600" />;
    };

    return (
        <TooltipProvider>
            <LoadingOverlay
                isLoading={isGenerating}
                message={`Generating report... ${progress}%`}
            >
                <div className="library-page space-y-6 animate-in fade-in duration-500">
                    {/* Header section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-900">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Cost Center Reports</h2>
                                <p className="text-sm text-slate-500 font-medium dark:text-slate-400">Analytics and insights for organizational cost tracking</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={handleGenerateReport}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        Generate Report
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleExport('csv')}
                                className="rounded-xl"
                                disabled={isGenerating}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleExport('pdf')}
                                className="rounded-xl"
                                disabled={isGenerating}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export PDF
                            </Button>
                        </div>
                    </div>

                    {/* Empty State - Show only when no cost centers exist */}
                    {state.costCenters.length === 0 ? (
                        <Card className="p-12 rounded-xl border border-border shadow-sm">
                            <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                                <BarChart3 className="h-16 w-16 opacity-20" />
                                <div className="text-center">
                                    <p className="font-medium text-lg">No Cost Centers Available</p>
                                    <p className="text-sm">Create cost centers to view analytics and reports</p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <>
                            {/* Tabbed Interface */}
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                                <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted p-1">
                                    <TabsTrigger value="dashboard" className="rounded-lg">Dashboard</TabsTrigger>
                                    <TabsTrigger value="budget" className="rounded-lg">Budget Analysis</TabsTrigger>
                                    <TabsTrigger value="coa" className="rounded-lg">Account Breakdown</TabsTrigger>
                                </TabsList>

                                {/* Dashboard Tab - Combines Overview + Performance */}
                                <TabsContent value="dashboard" className="space-y-6">
                                    {/* Filters for Dashboard */}
                                    <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filters:</span>
                                        </div>

                                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                            <SelectTrigger className="w-[180px] rounded-lg">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Select period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="current">Current Period</SelectItem>
                                                <SelectItem value="last30">Last 30 Days</SelectItem>
                                                <SelectItem value="last90">Last 90 Days</SelectItem>
                                                <SelectItem value="ytd">Year to Date</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={selectedCostCenter} onValueChange={setSelectedCostCenter}>
                                            <SelectTrigger className="w-[200px] rounded-lg">
                                                <Building2 className="mr-2 h-4 w-4" />
                                                <SelectValue placeholder="Select cost center" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Cost Centers</SelectItem>
                                                {state.costCenters.filter(cc => cc.isActive).map(costCenter => (
                                                    <SelectItem key={costCenter.id} value={costCenter.id}>
                                                        {costCenter.code} - {costCenter.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider dark:text-slate-500">
                                            {filteredData.length} OF {metrics.activeCostCenters} ACTIVE COST CENTERS
                                        </div>
                                    </div>

                                    {/* Summary KPI Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <Card className="rounded-xl border border-border shadow-sm">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600">
                                                        <Building2 className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cost Centers</p>
                                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.totalCostCenters}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-xl border border-border shadow-sm">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-green-600/10 flex items-center justify-center text-green-600">
                                                        <Users className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Members</p>
                                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.totalAssignedMembers}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-xl border border-border shadow-sm">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-purple-600/10 flex items-center justify-center text-purple-600">
                                                        <Activity className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Utilization</p>
                                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics.averageUtilization.toFixed(1)}%</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-xl border border-border shadow-sm">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-orange-600/10 flex items-center justify-center text-orange-600">
                                                        <DollarSign className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Monthly Cost</p>
                                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                            {formatCurrency(metrics.totalMonthlyCosts)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Performance Quick Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Card className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    High Performers
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                                    {filteredData.filter(item => item.utilizationRate > 80).length}
                                                </div>
                                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Centers above 80% utilization</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Underutilized
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                                                    {filteredData.filter(item => item.utilizationRate < 50).length}
                                                </div>
                                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Centers below 50% utilization</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                                    <Target className="h-4 w-4" />
                                                    Optimal Range
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                                    {filteredData.filter(item => item.utilizationRate >= 50 && item.utilizationRate <= 80).length}
                                                </div>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Centers in 50-80% range</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Comprehensive Cost Center Performance Table */}
                                    <Card className="rounded-xl border border-border shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span>Cost Center Performance Dashboard</span>
                                                <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                                                    {filteredData.length} Centers
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription>
                                                Comprehensive view of utilization, costs, and operational metrics
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                {filteredData.map(item => {
                                                    const utilizationColor = item.utilizationRate > 80 ? 'text-green-600' :
                                                        item.utilizationRate < 50 ? 'text-amber-600' : 'text-blue-600';

                                                    return (
                                                        <div key={item.costCenter.id} className="border border-border rounded-lg p-4 space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Building2 className="h-5 w-5 text-indigo-600" />
                                                                    <div>
                                                                        <div className="font-semibold text-slate-900 dark:text-slate-100">{item.costCenter.name}</div>
                                                                        <div className="text-sm text-slate-500">{item.costCenter.code}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`text-lg font-bold ${utilizationColor}`}>
                                                                        {item.utilizationRate.toFixed(1)}%
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">Utilization</div>
                                                                </div>
                                                            </div>

                                                            <Progress value={item.utilizationRate} className="h-2" />

                                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                                                <div>
                                                                    <div className="text-slate-500">Members</div>
                                                                    <div className="font-semibold">{item.totalMembers}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-slate-500">Allocations</div>
                                                                    <div className="font-semibold">{item.totalAllocations}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-slate-500">Efficiency</div>
                                                                    <div className="font-semibold">
                                                                        {item.totalMembers > 0 ? (item.totalAllocations / item.totalMembers).toFixed(1) : '0'}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-slate-500">Project Cost</div>
                                                                    <div className="font-semibold">{formatCurrency(item.totalProjectCost)}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-slate-500">Monthly Cost</div>
                                                                    <div className="font-semibold">{formatCurrency(item.totalMonthlyCost)}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Integration Status Summary - Simplified */}
                                    {state.members.filter(m => !m.costCenterId).length > 0 && (
                                        <Card className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                                    <div>
                                                        <p className="font-medium text-amber-800 dark:text-amber-200">
                                                            {state.members.filter(m => !m.costCenterId).length} team members are not assigned to cost centers
                                                        </p>
                                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                                            Consider assigning them to improve cost tracking accuracy
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>

                                {/* Budget Analysis Tab */}
                                <TabsContent value="budget" className="space-y-6">
                                    {/* Budget Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <Card className="rounded-xl border border-border shadow-sm">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600">
                                                        <Target className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Budget</p>
                                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                            {formatCurrency(budgetMetrics.totalBudget)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-xl border border-border shadow-sm">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-purple-600/10 flex items-center justify-center text-purple-600">
                                                        <DollarSign className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actual Spend</p>
                                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                            {formatCurrency(budgetMetrics.totalActual)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-xl border border-border shadow-sm">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${budgetMetrics.totalVariancePercent > 0 ? 'bg-red-600/10 text-red-600' : 'bg-green-600/10 text-green-600'
                                                        }`}>
                                                        {budgetMetrics.totalVariancePercent > 0 ?
                                                            <TrendingUp className="h-5 w-5" /> :
                                                            <TrendingDown className="h-5 w-5" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Variance</p>
                                                        <p className={`text-2xl font-bold ${getVarianceColor(budgetMetrics.totalVariancePercent)}`}>
                                                            {budgetMetrics.totalVariancePercent > 0 ? '+' : ''}{budgetMetrics.totalVariancePercent.toFixed(1)}%
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-xl border border-border shadow-sm">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-green-600/10 flex items-center justify-center text-green-600">
                                                        <CheckCircle className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On Track</p>
                                                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                            {budgetMetrics.onTrackCount}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Budget Status Overview */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Card className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    On Track
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                                    {budgetMetrics.onTrackCount}
                                                </div>
                                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                    Within ±10% of budget
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Over Budget
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                                                    {budgetMetrics.overBudgetCount}
                                                </div>
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                    More than 10% over budget
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                                    <TrendingDown className="h-4 w-4" />
                                                    Under Budget
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                                    {budgetMetrics.underBudgetCount}
                                                </div>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                    More than 10% under budget
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Detailed Budget Analysis */}
                                    <Card className="rounded-xl border border-border shadow-sm">
                                        <CardHeader>
                                            <CardTitle>Budget Variance Analysis</CardTitle>
                                            <CardDescription>
                                                Detailed budget vs actual spending analysis by cost center
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                {budgetMetrics.centerVariances.map(center => (
                                                    <div key={center.id} className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Building2 className="h-5 w-5 text-indigo-600" />
                                                                <div>
                                                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                                                        {center.name}
                                                                    </h4>
                                                                    <p className="text-sm text-slate-500">{center.code}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {getVarianceIcon(center.variancePercent)}
                                                                <div className="text-right">
                                                                    <div className={`text-lg font-bold ${getVarianceColor(center.variancePercent)}`}>
                                                                        {center.variancePercent > 0 ? '+' : ''}{center.variancePercent.toFixed(1)}%
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">Variance</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <div className="text-slate-500">Budget</div>
                                                                <div className="font-semibold">{formatCurrency(center.monthlyBudget)}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-slate-500">Actual</div>
                                                                <div className="font-semibold">{formatCurrency(center.actualMonthlyCost)}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-slate-500">Difference</div>
                                                                <div className={`font-semibold ${getVarianceColor(center.variancePercent)}`}>
                                                                    {formatCurrency(Math.abs(center.variance))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {center.monthlyBudget > 0 && (
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-xs text-slate-500">
                                                                    <span>Budget Utilization</span>
                                                                    <span>{((center.actualMonthlyCost / center.monthlyBudget) * 100).toFixed(1)}%</span>
                                                                </div>
                                                                <Progress
                                                                    value={Math.min((center.actualMonthlyCost / center.monthlyBudget) * 100, 100)}
                                                                    className="h-2"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Account Breakdown Tab */}
                                <TabsContent value="coa" className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Card className="md:col-span-2 rounded-xl border border-border shadow-sm">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <CheckSquare className="h-5 w-5 text-emerald-600" />
                                                    Expense Distribution by Account (COA)
                                                </CardTitle>
                                                <CardDescription>
                                                    Breakdown of costs across the Chart of Accounts
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-6">
                                                    {metrics.coaAggregation?.map(item => {
                                                        const percentage = metrics.totalProjectCosts > 0
                                                            ? (item.totalProjectCost / metrics.totalProjectCosts) * 100
                                                            : 0;

                                                        return (
                                                            <div key={item.account.id} className="space-y-2">
                                                                <div className="flex justify-between items-end">
                                                                    <div>
                                                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                                                            <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{item.account.code}</span>
                                                                            {item.account.name}
                                                                        </div>
                                                                        <div className="text-xs text-slate-500">{item.allocationCount} allocations mapped</div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-bold text-slate-900">{formatCurrency(item.totalProjectCost)}</div>
                                                                        <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                                                                            {percentage.toFixed(1)}% of total
                                                                            <Tooltip>
                                                                                <TooltipTrigger>
                                                                                    <Info className="h-3 w-3 opacity-40 hover:opacity-100 cursor-help" />
                                                                                </TooltipTrigger>
                                                                                <TooltipContent className="max-w-[200px]">
                                                                                    This account's share of the total project budget.
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Progress value={percentage} className="h-2 bg-slate-100" />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-xl border border-border shadow-sm">
                                            <CardHeader>
                                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Account Summary</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                                    <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Top Expense Account</p>
                                                    <p className="text-lg font-bold text-emerald-900">
                                                        {metrics.coaAggregation?.[0]?.account.name || 'N/A'}
                                                    </p>
                                                    <p className="text-sm text-emerald-700">
                                                        {formatCurrency(metrics.coaAggregation?.[0]?.totalProjectCost || 0)}
                                                    </p>
                                                </div>

                                                <div className="space-y-3 pt-2">
                                                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                                        <span className="text-sm text-slate-500">Active Accounts</span>
                                                        <span className="font-bold">{state.coa.filter(c => c.isActive).length}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                                        <span className="text-sm text-slate-500 flex items-center gap-1.5">
                                                            Utilization Rate
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Info className="h-3 w-3 opacity-40 hover:opacity-100 cursor-help" />
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-[200px]">
                                                                    <b>Catalog Coverage:</b> Percentage of defined account categories (COA) currently used in this project.
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </span>
                                                        <span className="font-bold">
                                                            {state.coa.length > 0
                                                                ? ((metrics.coaAggregation?.length || 0) / state.coa.length * 100).toFixed(0)
                                                                : 0}%
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                                        <span className="text-sm text-slate-500 flex items-center gap-1.5">
                                                            Unmapped Costs
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Info className="h-3 w-3 opacity-40 hover:opacity-100 cursor-help" />
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-[200px]">
                                                                    Labor costs from team members without a specific account assigned in their profile or tier.
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </span>
                                                        <span className="font-bold text-amber-600">
                                                            {formatCurrency(metrics.coaAggregation?.find(a => a.account.id === 'unmapped')?.totalProjectCost || 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </div>
            </LoadingOverlay>
        </TooltipProvider>
    );
}