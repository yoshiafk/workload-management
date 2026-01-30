import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Search, Trash2, Edit } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LeaveBalanceTable = ({ balances = [], isLoading, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBalances = balances.filter(b =>
        b.member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.leaveType?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="shadow-none border-main overflow-hidden">
            <div className="p-4 border-b border-main flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search balances..."
                        className="pl-10 h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                    Showing {filteredBalances.length} records
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 border-b border-main text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Member</th>
                            <th className="px-6 py-4">Leave Type</th>
                            <th className="px-6 py-4 text-center">Total</th>
                            <th className="px-6 py-4 text-center">Used</th>
                            <th className="px-6 py-4 text-center">Remaining</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-main">
                        {isLoading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={6} className="px-6 py-4 h-12 bg-muted/10" />
                                </tr>
                            ))
                        ) : filteredBalances.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                    No records found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredBalances.map(balance => (
                                <tr key={balance.id} className="hover:bg-muted/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-foreground">{balance.member?.name}</div>
                                        <div className="text-[10px] text-muted-foreground">{balance.year} Cycle</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium">
                                        <span
                                            className="inline-block w-2 h-2 rounded-full mr-2"
                                            style={{ backgroundColor: balance.leaveType?.color }}
                                        />
                                        {balance.leaveType?.name}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold">{balance.totalDays}d</td>
                                    <td className="px-6 py-4 text-center text-rose-600 font-medium">{balance.usedDays}d</td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant="outline" className="font-bold text-emerald-600 border-emerald-100 bg-emerald-50">
                                            {parseFloat(balance.totalDays) - parseFloat(balance.usedDays)}d
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white border border-transparent hover:border-main">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                                                <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => onEdit?.(balance)} className="gap-2">
                                                    <Edit className="h-4 w-4" /> Update Entitlement
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onDelete?.(balance.id)} className="text-rose-600 gap-2 font-bold">
                                                    <Trash2 className="h-4 w-4" /> Reset Balance
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default LeaveBalanceTable;
