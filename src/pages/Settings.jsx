import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
    downloadAsJson,
    readJsonFile,
    importData,
    clearAllStorage,
} from '../utils/storage';
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Download,
    Upload,
    Trash2,
    Database,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Users,
    Activity,
    Layers,
    ListTodo,
    Calendar,
    PlaneTakeoff,
    CircleDollarSign,
    LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import './Settings.css';

// Validation function for imported data
function validateImportData(data) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        errors.push('Invalid file format');
        return { valid: false, errors };
    }
    const requiredArrays = ['members', 'phases', 'tasks', 'costs'];
    for (const key of requiredArrays) {
        if (data[key] && !Array.isArray(data[key])) errors.push(`${key} must be an array`);
    }
    if (data.complexity && typeof data.complexity !== 'object') errors.push('complexity must be an object');
    return { valid: errors.length === 0, errors };
}

export default function Settings() {
    const { state } = useApp();
    const [importStatus, setImportStatus] = useState(null); // 'success' | 'error' | null
    const [importMessage, setImportMessage] = useState('');
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const fileInputRef = useRef(null);

    // Data statistics
    const stats = [
        { label: 'Team Members', count: state.members?.length || 0, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
        { label: 'Allocations', count: state.allocations?.length || 0, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
        { label: 'Phases', count: state.phases?.length || 0, icon: Layers, color: "text-amber-500", bg: "bg-amber-50" },
        { label: 'Task Templates', count: state.tasks?.length || 0, icon: ListTodo, color: "text-indigo-500", bg: "bg-indigo-50" },
        { label: 'Holidays', count: state.holidays?.length || 0, icon: Calendar, color: "text-sky-500", bg: "bg-sky-50" },
        { label: 'Leaves', count: state.leaves?.length || 0, icon: PlaneTakeoff, color: "text-rose-500", bg: "bg-rose-50" },
        { label: 'Cost Tiers', count: state.costs?.length || 0, icon: CircleDollarSign, color: "text-slate-500", bg: "bg-slate-50" },
    ];

    // Handle export
    const handleExport = () => {
        downloadAsJson('wrm-export');
        setImportStatus('success');
        setImportMessage('Data exported successfully!');
        setTimeout(() => setImportStatus(null), 3000);
    };

    // Handle file selection
    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const data = await readJsonFile(file);
            const validation = validateImportData(data);

            if (!validation.valid) {
                setImportStatus('error');
                setImportMessage(`Invalid file: ${validation.errors.join(', ')}`);
                return;
            }

            const success = importData(data);
            if (success) {
                setImportStatus('success');
                setImportMessage('Data imported successfully! Reloading...');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setImportStatus('error');
                setImportMessage('Failed to import data');
            }
        } catch (error) {
            setImportStatus('error');
            setImportMessage(error.message || 'Failed to read file');
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Handle clear all data
    const handleClearAll = () => {
        clearAllStorage();
        setShowClearConfirm(false);
        setImportStatus('success');
        setImportMessage('All data cleared! Reloading...');
        setTimeout(() => window.location.reload(), 1500);
    };

    return (
        <div className="settings-page space-y-8 animate-in fade-in duration-500 pb-20">

            {/* Notifications */}
            {importStatus && (
                <div className={cn(
                    "fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right duration-300 backdrop-blur-xl",
                    importStatus === 'success' ? "bg-emerald-500/90 text-white border-emerald-400" : "bg-red-500/90 text-white border-red-400"
                )}>
                    {importStatus === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    <span className="font-bold text-sm">{importMessage}</span>
                </div>
            )}

            {/* Application Header Card */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 transition-transform group-hover:scale-110 duration-700">
                    <Database size={240} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-black uppercase tracking-widest text-[10px] py-1 px-3 rounded-full">System v2.0</Badge>
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-black uppercase tracking-widest text-[10px] py-1 px-3 rounded-full">Stable</Badge>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter">System Settings</h1>
                        <p className="max-w-md text-slate-400 text-sm font-medium leading-relaxed">
                            Manage your application data, exports, and imports.
                            All information is stored locally in your browser's persistent storage.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[200px]">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Storage Usage</p>
                            <div className="flex items-end justify-between">
                                <span className="text-2xl font-black">Local</span>
                                <span className="text-xs font-bold text-blue-400">Persistent Storage</span>
                            </div>
                            <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Data Overview */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none glass-effect bg-white/40 shadow-xl rounded-3xl overflow-hidden overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <LayoutDashboard className="h-5 w-5 text-slate-400" />
                                <CardTitle className="text-xl font-black uppercase tracking-widest">Data Overview</CardTitle>
                            </div>
                            <CardDescription className="text-sm font-medium">Summary of all assets currently managed by the application.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {stats.map(stat => (
                                    <div key={stat.label} className="group p-5 rounded-2xl bg-white/30 border border-white/40 hover:bg-white/50 hover:border-indigo-200 transition-all hover:-translate-y-1 shadow-sm">
                                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                                            <stat.icon className="h-5 w-5" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                        <p className="text-2xl font-black text-slate-900 tabular-nums">{stat.count}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Export Card */}
                        <Card className="border-none glass-effect bg-white/40 shadow-xl rounded-3xl overflow-hidden hover:bg-white/50 transition-all">
                            <CardHeader className="p-8">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-100 mb-4">
                                    <Download className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl font-black uppercase tracking-widest">Export Data</CardTitle>
                                <CardDescription className="text-sm font-medium leading-relaxed">
                                    Create a complete backup of your entire workspace.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-0">
                                <p className="text-xs text-slate-500 font-medium">
                                    Downloads a single <code className="text-blue-600 font-bold">.json</code> file containing all members, allocations, holidays, and settings.
                                </p>
                            </CardContent>
                            <CardFooter className="p-8">
                                <Button onClick={handleExport} className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100 border-none transition-all active:scale-95">
                                    Export JSON
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Import Card */}
                        <Card className="border-none glass-effect bg-white/40 shadow-xl rounded-3xl overflow-hidden hover:bg-white/50 transition-all">
                            <CardHeader className="p-8">
                                <div className="h-12 w-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-600 border border-purple-100 mb-4">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl font-black uppercase tracking-widest">Import Data</CardTitle>
                                <CardDescription className="text-sm font-medium leading-relaxed">
                                    Restore from a previous session or external backup.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-0">
                                <p className="text-xs text-slate-500 font-medium whitespace-pre-wrap">
                                    <span className="text-violet-600 font-bold">WARNING:</span> This will merge imported data with your current workspace. Duplicate IDs will be replaced.
                                </p>
                            </CardContent>
                            <CardFooter className="p-8">
                                <div className="w-full relative">
                                    <Input
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileSelect}
                                        ref={fileInputRef}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-purple-100 cursor-pointer transition-all active:scale-95">
                                        <Upload className="h-4 w-4" />
                                        Select File
                                    </label>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Danger Zone */}
                <div className="space-y-8">
                    <Card className="border-none bg-red-50/40 border border-red-100 shadow-xl rounded-3xl overflow-hidden">
                        <CardHeader className="p-8">
                            <div className="h-12 w-12 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 border border-red-100 mb-4">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <CardTitle className="text-xl font-black uppercase tracking-widest text-red-800">Danger Zone</CardTitle>
                            <CardDescription className="text-sm font-medium text-red-600/70 leading-relaxed">
                                Irreversible system actions that affect all application data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 py-0 space-y-4">
                            <div className="p-4 rounded-xl bg-red-100/50 border border-red-200">
                                <h4 className="text-sm font-black text-red-900 mb-1 uppercase tracking-wider">Clear Storage</h4>
                                <p className="text-xs text-red-700/80 font-medium">Delete all team members, allocations, and settings. This cannot be undone.</p>
                            </div>
                            <ul className="text-[10px] space-y-2 text-red-700/60 font-black uppercase tracking-tight ml-1">
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Resets all table data</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Removes all custom templates</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Wipes local preferences</li>
                            </ul>
                        </CardContent>
                        <CardFooter className="p-8">
                            <Button
                                variant="destructive"
                                className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-200"
                                onClick={() => setShowClearConfirm(true)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Factory Reset
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="border-none glass-effect bg-white/20 shadow-sm rounded-3xl p-6 text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 italic">End of Settings</p>
                        <p className="text-[9px] font-bold text-slate-400">
                            Designed & Developed by Yosy Aliffakry
                        </p>
                    </Card>
                </div>
            </div>

            {/* Clear Confirmation Dialog */}
            <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="items-center text-center sm:text-center">
                        <div className="h-20 w-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-6 ring-8 ring-rose-50">
                            <Trash2 className="h-10 w-10" />
                        </div>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This will result in <span className="text-rose-600 font-bold">total data loss</span> across all modules. This action is final and cannot be reversed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:flex-col sm:space-x-0 gap-3">
                        <Button
                            variant="destructive"
                            onClick={handleClearAll}
                            className="h-12 w-full rounded-2xl text-base font-black uppercase tracking-widest shadow-lg shadow-rose-200 bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all"
                        >
                            Yes, Delete Everything
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setShowClearConfirm(false)}
                            className="h-12 w-full rounded-2xl text-base font-bold text-slate-500"
                        >
                            Cancel and Keep My Data
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
