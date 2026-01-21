/**
 * Project Cost Calculator - Redesigned
 * Best Practice: Results First, Single-Column Layout
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { defaultRoleTiers, getTierByRoleAndLevel, getRoleOptions } from '../data';
import { defaultPhases } from '../data/defaultPhases';
import { formatCurrency } from '../utils/calculations';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Calculator,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    Clock,
    Users,
    Briefcase,
    ArrowRight,
    UserPlus,
    PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";

// Working constants
const WORKING_HOURS_PER_DAY = 8;
const WORKING_DAYS_PER_MONTH = 20;

// Animation variants
const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const numberAnimation = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200 } }
};

// Generate unique ID
const generateId = () => `RES-${Date.now().toString(36).toUpperCase()}`;

export default function ProjectCostCalculator() {
    const { state } = useApp();
    const { complexity: complexitySettings } = state;

    // State
    const [startPhase, setStartPhase] = useState('2'); // Default: Planning
    const [selectedComplexity, setSelectedComplexity] = useState('medium');
    const [resources, setResources] = useState([]);
    const [isConfigExpanded, setIsConfigExpanded] = useState(true);

    // Get project phases only (exclude Support and Terminal)
    const projectPhases = useMemo(() => {
        return defaultPhases.filter(p =>
            p.category === 'Project' && !p.isTerminal
        ).sort((a, b) => a.sortOrder - b.sortOrder);
    }, []);

    // Calculate phase span
    const phaseSpan = useMemo(() => {
        const startIndex = projectPhases.findIndex(p => p.id.toString() === startPhase);
        if (startIndex === -1) return projectPhases.length;
        return projectPhases.length - startIndex;
    }, [startPhase, projectPhases]);

    // Get phases covered
    const phasesCovered = useMemo(() => {
        const startIndex = projectPhases.findIndex(p => p.id.toString() === startPhase);
        return projectPhases.slice(startIndex);
    }, [startPhase, projectPhases]);

    // Get complexity data
    const complexityData = useMemo(() => {
        return complexitySettings[selectedComplexity] || {
            hours: 19,
            days: 72,
            workload: 2.375
        };
    }, [selectedComplexity, complexitySettings]);

    // Calculate costs
    const calculations = useMemo(() => {
        let totalCost = 0;
        let totalMandays = 0;

        const resourceBreakdown = resources.map(resource => {
            const tier = getTierByRoleAndLevel(resource.roleType, resource.tierLevel);
            if (!tier) return null;

            const monthlyCost = tier.midCost;
            const perHourCost = Math.round(monthlyCost / WORKING_DAYS_PER_MONTH / WORKING_HOURS_PER_DAY);
            const baseCost = complexityData.hours * perHourCost;
            const phaseCost = baseCost * phaseSpan;
            const mandays = (complexityData.hours / WORKING_HOURS_PER_DAY) * phaseSpan;

            totalCost += phaseCost;
            totalMandays += mandays;

            return {
                id: resource.id,
                roleType: resource.roleType,
                tierLevel: resource.tierLevel,
                tierName: tier.name,
                roleName: defaultRoleTiers[resource.roleType]?.name || resource.roleType,
                monthlyCost,
                perHourCost,
                cost: phaseCost,
                mandays: mandays.toFixed(1)
            };
        }).filter(Boolean);

        return {
            resourceBreakdown,
            totalCost,
            totalMandays: totalMandays.toFixed(1),
            totalDuration: complexityData.days * phaseSpan,
            phaseSpan
        };
    }, [resources, complexityData, phaseSpan]);

    // Handlers
    const addResource = () => {
        setResources(prev => [...prev, {
            id: generateId(),
            roleType: 'FULLSTACK',
            tierLevel: 2
        }]);
    };

    const removeResource = (id) => {
        setResources(prev => prev.filter(r => r.id !== id));
    };

    const updateResource = (id, field, value) => {
        setResources(prev => prev.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        ));
    };

    // Get tier options
    const getTierOptions = (roleType) => {
        const role = defaultRoleTiers[roleType];
        if (!role) return [];
        return role.tiers.map(t => ({
            value: t.level.toString(),
            label: `Tier ${t.level}: ${t.name}`
        }));
    };

    // Complexity color
    const getComplexityColor = (level) => {
        const colors = {
            low: 'bg-emerald-500',
            medium: 'bg-blue-500',
            high: 'bg-amber-500',
            sophisticated: 'bg-red-500'
        };
        return colors[level] || 'bg-slate-500';
    };

    return (
        <motion.div
            className="max-w-4xl mx-auto space-y-6"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            {/* Header */}
            <motion.div variants={fadeIn} className="text-center space-y-2">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 mb-2">
                    <Calculator className="h-7 w-7" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Project Cost Calculator
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Estimate costs and mandays from phase start to completion
                </p>
            </motion.div>

            {/* Hero Results Section */}
            <motion.div
                variants={fadeIn}
                className="grid grid-cols-2 gap-4"
            >
                {/* Total Cost */}
                <motion.div
                    variants={numberAnimation}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                        <div className="flex items-center gap-2 text-emerald-100 mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Total Cost</span>
                        </div>
                        <div className="text-3xl md:text-4xl font-black tracking-tight">
                            {formatCurrency(calculations.totalCost)}
                        </div>
                        <div className="mt-2 text-sm text-emerald-100">
                            {resources.length} resource{resources.length > 1 ? 's' : ''} × {calculations.phaseSpan} phase{calculations.phaseSpan > 1 ? 's' : ''}
                        </div>
                    </div>
                </motion.div>

                {/* Total Mandays */}
                <motion.div
                    variants={numberAnimation}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-white shadow-xl"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                        <div className="flex items-center gap-2 text-indigo-100 mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Total Mandays</span>
                        </div>
                        <div className="text-3xl md:text-4xl font-black tracking-tight">
                            {calculations.totalMandays} days
                        </div>
                        <div className="mt-2 text-sm text-indigo-100">
                            ~{Math.ceil(parseFloat(calculations.totalMandays) / WORKING_DAYS_PER_MONTH)} month{Math.ceil(parseFloat(calculations.totalMandays) / WORKING_DAYS_PER_MONTH) > 1 ? 's' : ''} of work
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Phase Flow Visualization */}
            <motion.div variants={fadeIn} className="flex items-center justify-center gap-2 flex-wrap py-2">
                {phasesCovered.map((phase, index) => (
                    <div key={phase.id} className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                            {phase.name}
                        </Badge>
                        {index < phasesCovered.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                        )}
                    </div>
                ))}
                <ArrowRight className="h-4 w-4 text-emerald-500" />
                <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold">
                    Completed ✓
                </Badge>
            </motion.div>

            {/* Configuration Section (Collapsible) */}
            <motion.div variants={fadeIn}>
                <button
                    onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">Project Configuration</div>
                            <div className="text-sm text-slate-500">
                                {phasesCovered[0]?.name || 'Planning'} start • {complexitySettings[selectedComplexity]?.label || 'Medium'} complexity
                            </div>
                        </div>
                    </div>
                    {isConfigExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                </button>

                <AnimatePresence>
                    {isConfigExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-white dark:bg-slate-900 border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-xl space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Phase</Label>
                                        <Select value={startPhase} onValueChange={setStartPhase}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projectPhases.map(phase => (
                                                    <SelectItem key={phase.id} value={phase.id.toString()}>
                                                        {phase.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Complexity</Label>
                                        <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(complexitySettings).map(([key, data]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <span className="flex items-center gap-2">
                                                            <span className={cn("h-2 w-2 rounded-full", getComplexityColor(key))} />
                                                            {data.label} ({data.hours}h/phase)
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Resources Table */}
            <motion.div variants={fadeIn} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">Resources</div>
                            <div className="text-sm text-slate-500">{resources.length} team member{resources.length > 1 ? 's' : ''}</div>
                        </div>
                    </div>
                    <Button
                        onClick={addResource}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Resource
                    </Button>
                </div>

                {resources.length === 0 ? (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-16 px-4"
                    >
                        <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <UserPlus className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            No resources added
                        </h3>
                        <p className="text-slate-500 text-center max-w-sm mb-6">
                            Add team members to calculate the total project cost and effort estimation.
                        </p>
                        <Button
                            onClick={addResource}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Resource
                        </Button>
                    </motion.div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                <TableHead className="w-12 text-center">#</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Tier</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead className="text-right">Mandays</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {calculations.resourceBreakdown.map((item, index) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                        className="border-b border-slate-100 dark:border-slate-800"
                                    >
                                        <TableCell className="text-center font-medium text-slate-400">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={resources[index].roleType}
                                                onValueChange={(v) => updateResource(item.id, 'roleType', v)}
                                            >
                                                <SelectTrigger className="border-0 bg-transparent p-0 h-auto font-medium">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getRoleOptions().map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={resources[index].tierLevel.toString()}
                                                onValueChange={(v) => updateResource(item.id, 'tierLevel', parseInt(v))}
                                            >
                                                <SelectTrigger className="border-0 bg-transparent p-0 h-auto">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getTierOptions(resources[index].roleType).map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                                            {formatCurrency(item.cost)}
                                        </TableCell>
                                        <TableCell className="text-right text-slate-500 tabular-nums">
                                            {item.mandays} days
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeResource(item.id)}
                                                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                )}

                {/* Summary Row - only visible when resources exist */}
                {resources.length > 0 && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-8">
                        <div className="text-right">
                            <div className="text-xs font-medium text-slate-500 uppercase">Total Cost</div>
                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {formatCurrency(calculations.totalCost)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-medium text-slate-500 uppercase">Total Mandays</div>
                            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                                {calculations.totalMandays} days
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Cost Breakdown Section - Prominent */}
            {resources.length > 0 && (
                <motion.div variants={fadeIn} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                                <PieChart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">Cost Breakdown</div>
                                <div className="text-sm text-slate-500">Detailed cost analysis per resource</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        {calculations.resourceBreakdown.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                                            {item.tierName}
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {item.roleName} • {formatCurrency(item.perHourCost)}/hr
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                                        {formatCurrency(item.cost)}
                                    </div>
                                    <div className="text-sm text-slate-500 tabular-nums">
                                        {item.mandays} mandays
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Grand Total */}
                    <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="font-semibold text-slate-600 dark:text-slate-300">
                                Total Project Estimate
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xs font-medium text-slate-500 uppercase">Total Cost</div>
                                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                        {formatCurrency(calculations.totalCost)}
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-slate-300 dark:bg-slate-600" />
                                <div className="text-right">
                                    <div className="text-xs font-medium text-slate-500 uppercase">Total Mandays</div>
                                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                                        {calculations.totalMandays} days
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Calculation Info */}
            <motion.div variants={fadeIn} className="text-center text-sm text-slate-400 dark:text-slate-500">
                {resources.length > 0 ? (
                    <>Calculations: {complexityData.hours}h/phase × {calculations.phaseSpan} phases × hourly rate</>
                ) : (
                    <>Add resources above to see cost calculations</>
                )}
            </motion.div>
        </motion.div>
    );
}
