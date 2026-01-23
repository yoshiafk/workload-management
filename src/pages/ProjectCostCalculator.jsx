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
            className="space-y-8 animate-in fade-in duration-500 pb-20"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            {/* Header */}
            <motion.div variants={fadeIn} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                        <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Project Cost Calculator</h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Manday & Budget Estimation</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-xl border border-border/50 text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Confidence Score: High</span>
                </div>
            </motion.div>

            {/* Hero Results Section */}
            <motion.div
                variants={fadeIn}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {/* Total Cost */}
                <motion.div
                    variants={numberAnimation}
                    className="relative overflow-hidden rounded-2xl bg-indigo-600 p-8 text-white shadow-2xl group transition-all hover:scale-[1.01]"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-all" />
                    <div className="relative">
                        <div className="flex items-center gap-2 text-indigo-100/60 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Total Estimated Budget</span>
                        </div>
                        <div className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                            {formatCurrency(calculations.totalCost)}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-100/80 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/10">
                            {resources.length} resource{resources.length > 1 ? 's' : ''} • {calculations.phaseSpan} phase{calculations.phaseSpan > 1 ? 's' : ''}
                        </div>
                    </div>
                </motion.div>

                {/* Total Mandays */}
                <motion.div
                    variants={numberAnimation}
                    className="relative overflow-hidden rounded-2xl bg-emerald-600 p-8 text-white shadow-2xl group transition-all hover:scale-[1.01]"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-all" />
                    <div className="relative">
                        <div className="flex items-center gap-2 text-emerald-100/60 mb-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Total Project Effort</span>
                        </div>
                        <div className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                            {calculations.totalMandays} <span className="text-xl md:text-2xl opacity-60">Mandays</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-100/80 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/10">
                            ~{Math.ceil(parseFloat(calculations.totalMandays) / WORKING_DAYS_PER_MONTH)} month{Math.ceil(parseFloat(calculations.totalMandays) / WORKING_DAYS_PER_MONTH) > 1 ? 's' : ''} duration
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Timeline Flow */}
            <motion.div variants={fadeIn} className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground border border-border/50">
                        <Briefcase className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phases Covered</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {phasesCovered.map((phase, index) => (
                        <div key={phase.id} className="flex items-center gap-2">
                            <div className="px-4 py-2 bg-muted/30 border border-border/50 rounded-xl text-xs font-bold transition-all hover:bg-muted/50 cursor-default">
                                {phase.name}
                            </div>
                            {index < phasesCovered.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
                            )}
                        </div>
                    ))}
                    <div className="flex items-center gap-2 ml-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-black text-emerald-500 uppercase tracking-widest">
                        Ready for Production <TrendingUp className="h-3 w-3 ml-1" />
                    </div>
                </div>
            </motion.div>

            {/* Config & Resources Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Sidebar Configuration */}
                <motion.div variants={fadeIn} className="lg:col-span-1 space-y-6">
                    <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/10">
                            <h3 className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Parameters</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phase Entry Point</Label>
                                <Select value={startPhase} onValueChange={setStartPhase}>
                                    <SelectTrigger className="h-11 bg-muted/20 border-border/40 font-bold rounded-xl focus:ring-indigo-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border">
                                        {projectPhases.map(phase => (
                                            <SelectItem key={phase.id} value={phase.id.toString()} className="font-bold">
                                                {phase.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Complexity Tier</Label>
                                <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
                                    <SelectTrigger className="h-11 bg-muted/20 border-border/40 font-bold rounded-xl focus:ring-indigo-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border">
                                        {Object.entries(complexitySettings).map(([key, data]) => (
                                            <SelectItem key={key} value={key} className="font-bold">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("h-2 w-2 rounded-full", getComplexityColor(key))} />
                                                    {data.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="p-4 bg-muted/20 rounded-xl border border-border/40 text-[10px] font-bold text-muted-foreground">
                                    Estimation Scale: {complexityData.hours}h per Phase
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-2xl p-6">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Note</p>
                        <p className="text-xs text-muted-foreground leading-relaxed leading-5">
                            Estimates are based on {WORKING_HOURS_PER_DAY}h working days and {WORKING_DAYS_PER_MONTH} days/month. Calculated from phase start until Support handover.
                        </p>
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <motion.div variants={fadeIn} className="lg:col-span-2 space-y-6">
                    <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden h-fit">
                        <div className="p-6 border-b border-border bg-muted/10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground border border-border/50">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-[10px]">Project Manpower</h3>
                                    <p className="text-[10px] font-medium text-muted-foreground">{resources.length} active allocations</p>
                                </div>
                            </div>
                            <Button
                                onClick={addResource}
                                className="h-10 px-4 rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-700 border-none font-black uppercase tracking-wider text-[10px]"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Resource
                            </Button>
                        </div>

                        {resources.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 px-6 opacity-40">
                                <UserPlus className="h-12 w-12 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No resources assigned</p>
                            </div>
                        ) : (
                            <div className="overflow-auto custom-scrollbar">
                                <Table>
                                    <TableHeader className="bg-muted/10">
                                        <TableRow className="border-border/40">
                                            <TableHead className="w-12 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground">#</TableHead>
                                            <TableHead className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Role</TableHead>
                                            <TableHead className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tier</TableHead>
                                            <TableHead className="text-right text-[9px] font-black uppercase tracking-widest text-muted-foreground px-6">Total Cost</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence mode="popLayout">
                                            {calculations.resourceBreakdown.map((item, index) => (
                                                <TableRow
                                                    key={item.id}
                                                    className="border-border/40 hover:bg-muted/5 transition-colors group"
                                                >
                                                    <TableCell className="text-center font-bold text-muted-foreground opacity-30 tabular-nums text-xs">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <Select
                                                            value={resources[index].roleType}
                                                            onValueChange={(v) => updateResource(item.id, 'roleType', v)}
                                                        >
                                                            <SelectTrigger className="border-none bg-transparent p-0 h-auto font-black uppercase tracking-widest text-[11px] focus:ring-0">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-popover border-border">
                                                                {getRoleOptions().map(opt => (
                                                                    <SelectItem key={opt.value} value={opt.value} className="font-bold">
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
                                                            <SelectTrigger className="border-none bg-transparent p-0 h-auto font-bold text-xs focus:ring-0 text-muted-foreground">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-popover border-border">
                                                                {getTierOptions(resources[index].roleType).map(opt => (
                                                                    <SelectItem key={opt.value} value={opt.value} className="font-bold">
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="text-right font-black text-slate-100 tabular-nums px-6">
                                                        {formatCurrency(item.cost)}
                                                    </TableCell>
                                                    <TableCell className="px-6">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeResource(item.id)}
                                                            className="h-8 w-8 text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-lg"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {resources.length > 0 && (
                            <div className="p-6 bg-muted/10 border-t border-border flex justify-end gap-12">
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Combined Effort</p>
                                    <p className="text-xl font-black text-emerald-500 tabular-nums tracking-tight">
                                        {calculations.totalMandays} <span className="text-[10px] opacity-60">DAYS</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Grand Total</p>
                                    <p className="text-xl font-black text-indigo-400 tabular-nums tracking-tight">
                                        {formatCurrency(calculations.totalCost)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Secondary Calculation Detail Card */}
                    {resources.length > 0 && (
                        <motion.div variants={fadeIn} className="bg-card rounded-2xl border border-border p-6 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground border border-border/50">
                                    <PieChart className="h-4 w-4" />
                                </div>
                                <h3 className="font-black uppercase tracking-widest text-[10px]">Resource Contribution</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {calculations.resourceBreakdown.map((item, index) => (
                                    <div key={item.id} className="p-4 bg-muted/10 rounded-xl border border-border/40 flex justify-between items-center group hover:border-indigo-500/30 transition-all">
                                        <div>
                                            <p className="text-xs font-black text-slate-100 uppercase tracking-widest mb-1">{item.roleName}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground">{item.tierName} • {formatCurrency(item.perHourCost)}/hr</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-indigo-400 tabular-nums">{formatCurrency(item.cost)}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground opacity-60 italic">{item.mandays} days</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Footer Calculation Meta */}
            <motion.div variants={fadeIn} className="flex justify-center flex-col items-center gap-2 py-8 opacity-40">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Computation Method: Resource Density × Phase Span</p>
                <div className="h-1 w-12 bg-border/40 rounded-full" />
            </motion.div>
        </motion.div>
    );
}
