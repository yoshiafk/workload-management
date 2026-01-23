/**
 * DashboardCharts Component
 * Specialized chart components for the dashboard
 */

import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area,
    CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { useDensity } from "@/context/DensityContext";
import { cn } from "@/lib/utils";

// Consistent Chart Colors
const COLORS = {
    primary: '#4f46e5',   // Indigo 600
    secondary: '#10b981', // Emerald 500
    warning: '#f59e0b',   // Amber 500
    danger: '#f43f5e',    // Rose 500
    info: '#0ea5e9',      // Sky 500
    muted: '#94a3b8',     // Slate 400
    chart: [
        '#4f46e5', '#10b981', '#f59e0b', '#f43f5e',
        '#0ea5e9', '#8b5cf6', '#6366f1', '#ec4899'
    ]
};

const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-border bg-card p-3 shadow-xl backdrop-blur-sm">
                <p className="mb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                {payload.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm font-semibold">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
                        <span>{item.name}:</span>
                        <span className="text-foreground">{formatter ? formatter(item.value) : item.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function WorkloadUtilizationChart({ data, loading, onMemberClick }) {
    const { isDense } = useDensity();

    if (loading) return <ChartSkeleton height={isDense ? 200 : 300} />;

    return (
        <Card className="h-full">
            <CardHeader className={isDense ? "px-4 pt-4 pb-2" : "px-6 pt-6 pb-4"}>
                <CardTitle className={isDense ? "text-sm" : "text-base"}>Workload Capacity Utilization (%)</CardTitle>
            </CardHeader>
            <CardContent className={isDense ? "px-4 pb-4" : "px-6 pb-6"}>
                <div className={cn("w-full", isDense ? "h-[200px]" : "h-[300px]")}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                        >
                            <XAxis
                                type="number"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, (dataMax) => Math.max(100, dataMax + 10)]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                width={80}
                            />
                            <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
                            <Bar
                                dataKey="workload"
                                name="Workload"
                                radius={[0, 4, 4, 0]}
                                onClick={(data) => onMemberClick && onMemberClick(data)}
                                style={{ cursor: 'pointer' }}
                                barSize={isDense ? 16 : 24}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.workload > 100 ? COLORS.danger : COLORS.primary} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

export function DistributionPieChart({ title, data, loading, onCellClick }) {
    const { isDense } = useDensity();

    if (loading) return <ChartSkeleton height={isDense ? 200 : 300} />;

    return (
        <Card className="h-full">
            <CardHeader className={isDense ? "px-4 pt-4 pb-2" : "px-6 pt-6 pb-4"}>
                <CardTitle className={isDense ? "text-sm" : "text-base"}>{title}</CardTitle>
            </CardHeader>
            <CardContent className={isDense ? "px-4 pb-4" : "px-6 pb-6"}>
                <div className={cn("w-full", isDense ? "h-[200px]" : "h-[300px]")}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={isDense ? 40 : 60}
                                outerRadius={isDense ? 70 : 100}
                                paddingAngle={4}
                                dataKey="value"
                                onClick={(data) => onCellClick && onCellClick(data)}
                                style={{ cursor: 'pointer' }}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || COLORS.chart[index % COLORS.chart.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

export function ProjectedCostChart({ data, loading, currencyFormatter }) {
    const { isDense } = useDensity();

    if (loading) return <ChartSkeleton height={isDense ? 200 : 300} />;

    return (
        <Card className="h-full">
            <CardHeader className={isDense ? "px-4 pt-4 pb-2" : "px-6 pt-6 pb-4"}>
                <CardTitle className={isDense ? "text-sm" : "text-base"}>Projected Monthly Cost</CardTitle>
            </CardHeader>
            <CardContent className={isDense ? "px-4 pb-4" : "px-6 pb-6"}>
                <div className={cn("w-full", isDense ? "h-[200px]" : "h-[300px]")}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="month"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => {
                                    if (value === 0) return '0';
                                    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                    return value;
                                }}
                                width={40}
                            />
                            <Tooltip content={<CustomTooltip formatter={currencyFormatter} />} />
                            <Area
                                type="monotone"
                                dataKey="cost"
                                name="Cost"
                                stroke={COLORS.primary}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCost)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
