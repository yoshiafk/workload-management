/**
 * DatePickerModal Component
 * Enhanced date picker modal with quick filter options for dashboard filtering
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, 
    X, 
    Filter, 
    Clock, 
    ChevronLeft, 
    ChevronRight,
    Check,
    RotateCcw
} from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { dashboardEngine } from '@/utils/dashboardEngine';

const modalVariants = {
    hidden: { 
        opacity: 0, 
        scale: 0.95,
        y: 20
    },
    visible: { 
        opacity: 1, 
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 300
        }
    },
    exit: { 
        opacity: 0, 
        scale: 0.95,
        y: 20,
        transition: {
            duration: 0.2
        }
    }
};

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

export function DatePickerModal({ 
    isOpen, 
    onClose, 
    onApply, 
    initialDateRange = { start: '', end: '' },
    title = "Filter by Date Range",
    showStats = false,
    allocations = []
}) {
    const [dateRange, setDateRange] = useState(initialDateRange);
    const [selectedQuickFilter, setSelectedQuickFilter] = useState(null);
    const [stats, setStats] = useState(null);

    // Get quick filter options from dashboard engine
    const quickFilters = dashboardEngine.getQuickFilterOptions();

    // Update local state when initial values change
    useEffect(() => {
        setDateRange(initialDateRange);
        setSelectedQuickFilter(null);
    }, [initialDateRange]);

    // Calculate stats when date range changes
    useEffect(() => {
        if (showStats && allocations.length > 0 && (dateRange.start || dateRange.end)) {
            const rangeStats = dashboardEngine.getDateRangeStats(allocations, dateRange);
            setStats(rangeStats);
        } else {
            setStats(null);
        }
    }, [dateRange, showStats, allocations]);

    const handleQuickFilterClick = (filter) => {
        setDateRange({ start: filter.start, end: filter.end });
        setSelectedQuickFilter(filter.value);
    };

    const handleDateChange = (field, value) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
        setSelectedQuickFilter(null); // Clear quick filter selection when manually changing dates
    };

    const handleApply = () => {
        onApply(dateRange);
        onClose();
    };

    const handleClear = () => {
        setDateRange({ start: '', end: '' });
        setSelectedQuickFilter(null);
    };

    const handleReset = () => {
        setDateRange(initialDateRange);
        setSelectedQuickFilter(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Overlay */}
                <motion.div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    className="relative z-10 w-full max-w-2xl mx-4"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <Card className="shadow-2xl border-border/50">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">{title}</CardTitle>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="h-8 w-8 p-0 hover:bg-muted"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Quick Filters */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Quick Filters</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {quickFilters.slice(0, 7).map((filter) => (
                                        <Button
                                            key={filter.value}
                                            variant={selectedQuickFilter === filter.value ? "default" : "outline"}
                                            size="sm"
                                            className={cn(
                                                "h-auto p-3 flex flex-col items-center gap-1 text-xs",
                                                selectedQuickFilter === filter.value && "ring-2 ring-primary/20"
                                            )}
                                            onClick={() => handleQuickFilterClick(filter)}
                                        >
                                            <span className="text-base">{filter.icon}</span>
                                            <span className="font-medium">{filter.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Date Range */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Custom Date Range</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            value={dateRange.start}
                                            onChange={(e) => handleDateChange('start', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            value={dateRange.end}
                                            onChange={(e) => handleDateChange('end', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stats Preview */}
                            {stats && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                            Preview
                                        </Badge>
                                        <span className="text-sm font-medium">Filter Results</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-primary">{stats.totalAllocations}</div>
                                            <div className="text-xs text-muted-foreground">Allocations</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-green-600">{stats.totalEffortHours}h</div>
                                            <div className="text-xs text-muted-foreground">Total Effort</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-blue-600">{stats.averageDuration}d</div>
                                            <div className="text-xs text-muted-foreground">Avg Duration</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-purple-600">
                                                {Object.keys(stats.phaseDistribution).length}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Phases</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClear}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Clear
                                    </Button>
                                    {(dateRange.start !== initialDateRange.start || dateRange.end !== initialDateRange.end) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleReset}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Reset
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleApply}
                                        className="gap-2"
                                    >
                                        <Check className="h-4 w-4" />
                                        Apply Filter
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default DatePickerModal;