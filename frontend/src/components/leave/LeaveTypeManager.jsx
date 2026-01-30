import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { leavesApi } from '../../services/api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Check, X, Palette, Loader2 } from 'lucide-react';

const LeaveTypeManager = () => {
    const [types, setTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(null); // ID of type being edited
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        defaultDays: '',
        color: '#4f46e5',
        carryOverLimit: '0'
    });

    const fetchTypes = async () => {
        try {
            setIsLoading(true);
            const response = await leavesApi.getLeaveTypes();
            setTypes(response.data.data || []);
        } catch (err) {
            toast.error('Failed to load leave types');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const handleSave = async (id) => {
        try {
            if (id) {
                await leavesApi.updateLeaveType(id, formData);
                toast.success('Leave type updated');
            } else {
                await leavesApi.createLeaveType(formData);
                toast.success('Leave type created');
            }
            setIsEditing(null);
            setIsAdding(false);
            setFormData({ name: '', defaultDays: '', color: '#4f46e5', carryOverLimit: '0' });
            fetchTypes();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save leave type');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This may affect existing requests.')) return;
        try {
            await leavesApi.deleteLeaveType(id);
            toast.success('Leave type deleted');
            fetchTypes();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    const startEdit = (type) => {
        setIsEditing(type.id);
        setIsAdding(false);
        setFormData({
            name: type.name,
            defaultDays: type.defaultDays.toString(),
            color: type.color,
            carryOverLimit: type.carryOverLimit.toString()
        });
    };

    if (isLoading && types.length === 0) {
        return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Leave Categories</h3>
                <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => { setIsAdding(true); setIsEditing(null); setFormData({ name: '', defaultDays: '', color: '#4f46e5', carryOverLimit: '0' }); }}
                    disabled={isAdding}
                >
                    <Plus className="h-4 w-4" /> Add Type
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isAdding && (
                    <Card className="border-primary/50 shadow-md animate-in fade-in zoom-in-95">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">New Leave Type</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Annual Leave" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Default Days</Label>
                                    <Input type="number" value={formData.defaultDays} onChange={e => setFormData({ ...formData, defaultDays: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Carry Over</Label>
                                    <Input type="number" value={formData.carryOverLimit} onChange={e => setFormData({ ...formData, carryOverLimit: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Theme Color</Label>
                                <div className="flex gap-2">
                                    <Input type="color" className="p-1 h-10 w-12" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                                    <Input type="text" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="font-mono uppercase" />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                                <Button className="flex-1" onClick={() => handleSave()}>Create</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {types.map(type => (
                    <Card key={type.id} className={`transition-all border-main ${isEditing === type.id ? 'ring-2 ring-primary/20 bg-primary/5' : 'hover:border-primary/20'}`}>
                        {isEditing === type.id ? (
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Default Days</Label>
                                        <Input type="number" value={formData.defaultDays} onChange={e => setFormData({ ...formData, defaultDays: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Carry Over</Label>
                                        <Input type="number" value={formData.carryOverLimit} onChange={e => setFormData({ ...formData, carryOverLimit: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Color</Label>
                                    <div className="flex gap-2">
                                        <Input type="color" className="p-1 h-8 w-10" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                                        <Input type="text" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="h-8 py-0 font-mono text-xs uppercase" />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => setIsEditing(null)}><X className="h-3 w-3 mr-1" /> Clear</Button>
                                    <Button size="sm" className="flex-1" onClick={() => handleSave(type.id)}><Check className="h-3 w-3 mr-1" /> Update</Button>
                                </div>
                            </CardContent>
                        ) : (
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                                        <h4 className="font-bold">{type.name}</h4>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => startEdit(type)}>
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-600" onClick={() => handleDelete(type.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="p-2 rounded bg-muted/50">
                                        <p className="text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Default Allotment</p>
                                        <p className="text-lg font-black text-foreground">{type.defaultDays} Days</p>
                                    </div>
                                    <div className="p-2 rounded bg-muted/50">
                                        <p className="text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Carry Over Limit</p>
                                        <p className="text-lg font-black text-foreground">{type.carryOverLimit} Days</p>
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default LeaveTypeManager;
