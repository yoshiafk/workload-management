/**
 * Optimized Report Generation Utilities
 * High-performance report generation with streaming and chunking
 */

import { useState, useCallback } from 'react';

import { 
    memoizedAggregateCostsByCostCenter,
    memoizedGetCostCenterUtilization,
    memoizedCalculateMonthlyTrend,
    clearMemoForFunction
} from './memoizedCalculations';
import { formatCurrency, formatPercentage } from './calculations';

// Report generation status
const REPORT_STATUS = {
    IDLE: 'idle',
    GENERATING: 'generating',
    COMPLETED: 'completed',
    ERROR: 'error'
};

/**
 * Report Generator Class
 * Handles large dataset processing with progress tracking
 */
class ReportGenerator {
    constructor() {
        this.status = REPORT_STATUS.IDLE;
        this.progress = 0;
        this.currentReport = null;
        this.abortController = null;
    }

    /**
     * Generate cost center report with progress tracking
     */
    async generateCostCenterReport(data, options = {}) {
        const {
            includeCharts = true,
            includeDetails = true,
            chunkSize = 100,
            onProgress = () => {},
            signal
        } = options;

        this.status = REPORT_STATUS.GENERATING;
        this.progress = 0;
        this.abortController = new AbortController();

        try {
            const report = {
                metadata: {
                    generatedAt: new Date().toISOString(),
                    totalCostCenters: data.costCenters.length,
                    totalMembers: data.members.length,
                    totalAllocations: data.allocations.length,
                    reportType: 'cost-center-analysis'
                },
                summary: {},
                costCenters: [],
                charts: includeCharts ? {} : null,
                details: includeDetails ? {} : null
            };

            // Step 1: Generate summary (20% progress)
            onProgress(10, 'Calculating summary metrics...');
            await this.delay(50);
            
            report.summary = await this.generateSummary(data);
            this.progress = 20;
            onProgress(20, 'Summary completed');

            // Step 2: Process cost centers in chunks (60% progress)
            onProgress(25, 'Processing cost centers...');
            
            const activeCostCenters = data.costCenters.filter(cc => cc.isActive);
            const chunks = this.chunkArray(activeCostCenters, chunkSize);
            
            for (let i = 0; i < chunks.length; i++) {
                if (this.abortController.signal.aborted) {
                    throw new Error('Report generation cancelled');
                }

                const chunk = chunks[i];
                const chunkResults = await this.processCostCenterChunk(chunk, data);
                report.costCenters.push(...chunkResults);

                const chunkProgress = 20 + ((i + 1) / chunks.length) * 40;
                this.progress = chunkProgress;
                onProgress(chunkProgress, `Processed ${i + 1}/${chunks.length} cost center chunks`);
                
                // Allow UI to update
                await this.delay(10);
            }

            // Step 3: Generate charts (15% progress)
            if (includeCharts) {
                onProgress(80, 'Generating charts...');
                report.charts = await this.generateCharts(data, report.costCenters);
                this.progress = 90;
                onProgress(90, 'Charts completed');
            }

            // Step 4: Generate detailed analysis (5% progress)
            if (includeDetails) {
                onProgress(95, 'Generating detailed analysis...');
                report.details = await this.generateDetailedAnalysis(data, report.costCenters);
            }

            this.progress = 100;
            this.status = REPORT_STATUS.COMPLETED;
            this.currentReport = report;
            onProgress(100, 'Report generation completed');

            return report;

        } catch (error) {
            this.status = REPORT_STATUS.ERROR;
            this.progress = 0;
            throw error;
        }
    }

    /**
     * Generate summary metrics
     */
    async generateSummary(data) {
        const activeCostCenters = data.costCenters.filter(cc => cc.isActive);
        
        // Use memoized calculations for performance
        const utilizationData = memoizedGetCostCenterUtilization(
            data.allocations,
            data.members,
            activeCostCenters
        );

        const costAggregation = memoizedAggregateCostsByCostCenter(
            data.allocations,
            activeCostCenters
        );

        const totalAssignedMembers = data.members.filter(m => m.costCenterId).length;
        const unassignedMembers = data.members.filter(m => !m.costCenterId).length;
        
        const totalProjectCosts = utilizationData.reduce((sum, item) => sum + item.totalProjectCost, 0);
        const totalMonthlyCosts = utilizationData.reduce((sum, item) => sum + item.totalMonthlyCost, 0);
        
        const averageUtilization = utilizationData.length > 0 
            ? utilizationData.reduce((sum, item) => sum + item.utilizationRate, 0) / utilizationData.length 
            : 0;

        return {
            totalCostCenters: data.costCenters.length,
            activeCostCenters: activeCostCenters.length,
            totalMembers: data.members.length,
            totalAssignedMembers,
            unassignedMembers,
            assignmentRate: data.members.length > 0 ? (totalAssignedMembers / data.members.length) * 100 : 0,
            totalAllocations: data.allocations.length,
            totalProjectCosts,
            totalMonthlyCosts,
            averageUtilization,
            topCostCenter: utilizationData.reduce((max, item) => 
                item.totalProjectCost > (max?.totalProjectCost || 0) ? item : max, null
            ),
            leastUtilizedCostCenter: utilizationData.reduce((min, item) => 
                item.utilizationRate < (min?.utilizationRate || Infinity) ? item : min, null
            )
        };
    }

    /**
     * Process cost center chunk
     */
    async processCostCenterChunk(costCenters, data) {
        return costCenters.map(costCenter => {
            const assignedMembers = data.members.filter(m => m.costCenterId === costCenter.id);
            const costCenterAllocations = data.allocations.filter(a => 
                assignedMembers.some(m => m.name === a.resource)
            );

            const totalProjectCost = costCenterAllocations.reduce((sum, a) => sum + (a.plan?.costProject || 0), 0);
            const totalMonthlyCost = costCenterAllocations.reduce((sum, a) => sum + (a.plan?.costMonthly || 0), 0);
            const totalWorkload = costCenterAllocations.reduce((sum, a) => sum + (a.workload || 0), 0);
            
            const maxCapacity = assignedMembers.reduce((sum, m) => sum + (m.maxHoursPerWeek || 40), 0) / 40;
            const utilizationRate = maxCapacity > 0 ? Math.min((totalWorkload / maxCapacity) * 100, 100) : 0;

            return {
                costCenter,
                metrics: {
                    memberCount: assignedMembers.length,
                    activeMembers: assignedMembers.filter(m => m.isActive).length,
                    allocationCount: costCenterAllocations.length,
                    activeAllocations: costCenterAllocations.filter(a => 
                        a.status !== 'completed' && a.status !== 'cancelled'
                    ).length,
                    totalProjectCost,
                    totalMonthlyCost,
                    totalWorkload,
                    maxCapacity,
                    utilizationRate,
                    efficiency: totalProjectCost > 0 ? totalMonthlyCost / totalProjectCost : 0
                },
                members: assignedMembers.map(m => ({
                    id: m.id,
                    name: m.name,
                    type: m.type,
                    isActive: m.isActive,
                    allocations: costCenterAllocations.filter(a => a.resource === m.name).length
                })),
                topAllocations: costCenterAllocations
                    .sort((a, b) => (b.plan?.costProject || 0) - (a.plan?.costProject || 0))
                    .slice(0, 5)
                    .map(a => ({
                        id: a.id,
                        resource: a.resource,
                        taskName: a.taskName,
                        projectCost: a.plan?.costProject || 0,
                        monthlyCost: a.plan?.costMonthly || 0
                    }))
            };
        });
    }

    /**
     * Generate chart data
     */
    async generateCharts(data, processedCostCenters) {
        const monthlyTrend = memoizedCalculateMonthlyTrend(data.allocations);
        
        // Cost distribution chart
        const costDistribution = processedCostCenters.map(item => ({
            name: item.costCenter.name,
            code: item.costCenter.code,
            value: item.metrics.totalProjectCost,
            percentage: 0 // Will be calculated after sorting
        })).sort((a, b) => b.value - a.value);

        const totalCost = costDistribution.reduce((sum, item) => sum + item.value, 0);
        costDistribution.forEach(item => {
            item.percentage = totalCost > 0 ? (item.value / totalCost) * 100 : 0;
        });

        // Utilization chart
        const utilizationChart = processedCostCenters.map(item => ({
            name: item.costCenter.name,
            code: item.costCenter.code,
            utilization: item.metrics.utilizationRate,
            members: item.metrics.memberCount,
            capacity: item.metrics.maxCapacity
        })).sort((a, b) => b.utilization - a.utilization);

        // Member distribution chart
        const memberDistribution = processedCostCenters.map(item => ({
            name: item.costCenter.name,
            code: item.costCenter.code,
            total: item.metrics.memberCount,
            active: item.metrics.activeMembers,
            inactive: item.metrics.memberCount - item.metrics.activeMembers
        }));

        return {
            monthlyTrend,
            costDistribution,
            utilizationChart,
            memberDistribution,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Generate detailed analysis
     */
    async generateDetailedAnalysis(data, processedCostCenters) {
        // Performance insights
        const insights = [];
        
        // High utilization cost centers
        const highUtilization = processedCostCenters.filter(item => item.metrics.utilizationRate > 90);
        if (highUtilization.length > 0) {
            insights.push({
                type: 'warning',
                title: 'High Utilization Alert',
                description: `${highUtilization.length} cost centers are operating above 90% capacity`,
                costCenters: highUtilization.map(item => item.costCenter.name),
                recommendation: 'Consider redistributing workload or adding resources'
            });
        }

        // Underutilized cost centers
        const underUtilized = processedCostCenters.filter(item => 
            item.metrics.utilizationRate < 50 && item.metrics.memberCount > 0
        );
        if (underUtilized.length > 0) {
            insights.push({
                type: 'info',
                title: 'Underutilization Opportunity',
                description: `${underUtilized.length} cost centers have capacity for additional work`,
                costCenters: underUtilized.map(item => item.costCenter.name),
                recommendation: 'Consider reallocating work to optimize resource utilization'
            });
        }

        // Cost efficiency analysis
        const costEfficiency = processedCostCenters.map(item => ({
            costCenter: item.costCenter.name,
            efficiency: item.metrics.efficiency,
            costPerMember: item.metrics.memberCount > 0 ? item.metrics.totalMonthlyCost / item.metrics.memberCount : 0
        })).sort((a, b) => a.efficiency - b.efficiency);

        return {
            insights,
            costEfficiency,
            recommendations: this.generateRecommendations(processedCostCenters),
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(processedCostCenters) {
        const recommendations = [];
        
        // Resource reallocation recommendations
        const overUtilized = processedCostCenters.filter(item => item.metrics.utilizationRate > 85);
        const underUtilized = processedCostCenters.filter(item => item.metrics.utilizationRate < 60);
        
        if (overUtilized.length > 0 && underUtilized.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'Resource Optimization',
                title: 'Rebalance Workload Distribution',
                description: 'Move work from over-utilized to under-utilized cost centers',
                impact: 'Improve overall efficiency and reduce bottlenecks',
                effort: 'Medium'
            });
        }

        // Cost optimization recommendations
        const highCostCenters = processedCostCenters
            .sort((a, b) => b.metrics.totalMonthlyCost - a.metrics.totalMonthlyCost)
            .slice(0, 3);
        
        if (highCostCenters.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'Cost Management',
                title: 'Review High-Cost Centers',
                description: `Focus on optimizing the top ${highCostCenters.length} cost centers`,
                impact: 'Potential significant cost savings',
                effort: 'High'
            });
        }

        return recommendations;
    }

    /**
     * Export report to different formats
     */
    async exportReport(report, format = 'json') {
        switch (format.toLowerCase()) {
            case 'json':
                return this.exportToJSON(report);
            case 'csv':
                return this.exportToCSV(report);
            case 'pdf':
                return this.exportToPDF(report);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Export to JSON
     */
    exportToJSON(report) {
        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });
        return {
            blob,
            filename: `cost-center-report-${new Date().toISOString().split('T')[0]}.json`
        };
    }

    /**
     * Export to CSV
     */
    exportToCSV(report) {
        const headers = [
            'Cost Center Code',
            'Cost Center Name',
            'Manager',
            'Member Count',
            'Active Members',
            'Total Allocations',
            'Active Allocations',
            'Total Project Cost',
            'Total Monthly Cost',
            'Utilization Rate (%)',
            'Status'
        ];

        const rows = report.costCenters.map(item => [
            item.costCenter.code,
            item.costCenter.name,
            item.costCenter.manager,
            item.metrics.memberCount,
            item.metrics.activeMembers,
            item.metrics.allocationCount,
            item.metrics.activeAllocations,
            formatCurrency(item.metrics.totalProjectCost),
            formatCurrency(item.metrics.totalMonthlyCost),
            item.metrics.utilizationRate.toFixed(1),
            item.costCenter.isActive ? 'Active' : 'Inactive'
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        return {
            blob,
            filename: `cost-center-report-${new Date().toISOString().split('T')[0]}.csv`
        };
    }

    /**
     * Export to PDF (simplified - would need proper PDF library)
     */
    exportToPDF(report) {
        // This would require a PDF generation library like jsPDF
        // For now, return a text representation
        const content = this.generateTextReport(report);
        const blob = new Blob([content], { type: 'text/plain' });
        return {
            blob,
            filename: `cost-center-report-${new Date().toISOString().split('T')[0]}.txt`
        };
    }

    /**
     * Generate text report
     */
    generateTextReport(report) {
        let content = `COST CENTER ANALYSIS REPORT\n`;
        content += `Generated: ${new Date(report.metadata.generatedAt).toLocaleString()}\n\n`;
        
        content += `SUMMARY\n`;
        content += `=======\n`;
        content += `Total Cost Centers: ${report.summary.totalCostCenters}\n`;
        content += `Active Cost Centers: ${report.summary.activeCostCenters}\n`;
        content += `Total Members: ${report.summary.totalMembers}\n`;
        content += `Assignment Rate: ${report.summary.assignmentRate.toFixed(1)}%\n`;
        content += `Total Project Costs: ${formatCurrency(report.summary.totalProjectCosts)}\n`;
        content += `Total Monthly Costs: ${formatCurrency(report.summary.totalMonthlyCosts)}\n`;
        content += `Average Utilization: ${report.summary.averageUtilization.toFixed(1)}%\n\n`;

        content += `COST CENTER DETAILS\n`;
        content += `==================\n`;
        report.costCenters.forEach(item => {
            content += `${item.costCenter.code} - ${item.costCenter.name}\n`;
            content += `  Manager: ${item.costCenter.manager}\n`;
            content += `  Members: ${item.metrics.memberCount} (${item.metrics.activeMembers} active)\n`;
            content += `  Allocations: ${item.metrics.allocationCount} (${item.metrics.activeAllocations} active)\n`;
            content += `  Project Cost: ${formatCurrency(item.metrics.totalProjectCost)}\n`;
            content += `  Monthly Cost: ${formatCurrency(item.metrics.totalMonthlyCost)}\n`;
            content += `  Utilization: ${item.metrics.utilizationRate.toFixed(1)}%\n\n`;
        });

        return content;
    }

    /**
     * Cancel report generation
     */
    cancel() {
        if (this.abortController) {
            this.abortController.abort();
        }
        this.status = REPORT_STATUS.IDLE;
        this.progress = 0;
    }

    /**
     * Utility methods
     */
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStatus() {
        return {
            status: this.status,
            progress: this.progress,
            hasReport: !!this.currentReport
        };
    }
}

// Export singleton instance
export const reportGenerator = new ReportGenerator();

/**
 * React hook for report generation
 */
export function useReportGenerator() {
    const [status, setStatus] = useState(REPORT_STATUS.IDLE);
    const [progress, setProgress] = useState(0);
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);

    const generateReport = useCallback(async (data, options = {}) => {
        try {
            setError(null);
            setStatus(REPORT_STATUS.GENERATING);
            
            const onProgress = (progress, message) => {
                setProgress(progress);
                options.onProgress?.(progress, message);
            };

            const generatedReport = await reportGenerator.generateCostCenterReport(data, {
                ...options,
                onProgress
            });

            setReport(generatedReport);
            setStatus(REPORT_STATUS.COMPLETED);
            return generatedReport;

        } catch (err) {
            setError(err.message);
            setStatus(REPORT_STATUS.ERROR);
            throw err;
        }
    }, []);

    const exportReport = useCallback(async (format = 'json') => {
        if (!report) throw new Error('No report available to export');
        return reportGenerator.exportReport(report, format);
    }, [report]);

    const cancelGeneration = useCallback(() => {
        reportGenerator.cancel();
        setStatus(REPORT_STATUS.IDLE);
        setProgress(0);
    }, []);

    const clearReport = useCallback(() => {
        setReport(null);
        setStatus(REPORT_STATUS.IDLE);
        setProgress(0);
        setError(null);
    }, []);

    return {
        status,
        progress,
        report,
        error,
        generateReport,
        exportReport,
        cancelGeneration,
        clearReport,
        isGenerating: status === REPORT_STATUS.GENERATING,
        isCompleted: status === REPORT_STATUS.COMPLETED,
        hasError: status === REPORT_STATUS.ERROR
    };
}