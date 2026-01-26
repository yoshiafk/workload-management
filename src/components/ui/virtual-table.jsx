/**
 * Virtual Table Component
 * High-performance table with virtual scrolling for large datasets
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { List } from 'react-window';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 60; // Height of each table row in pixels
const HEADER_HEIGHT = 48; // Height of table header

/**
 * Virtual Table Row Component
 */
const VirtualTableRow = ({ index, style, data }) => {
    // Add safety checks for data
    if (!data || !data.items || !Array.isArray(data.items) || !data.columns || !Array.isArray(data.columns)) {
        return <div style={style}></div>;
    }
    
    const { items, columns, onRowClick, selectedRows } = data;
    const item = items[index];
    
    // Safety check for item
    if (!item) {
        return <div style={style}></div>;
    }
    
    const isSelected = selectedRows?.has(item.id);
    
    return (
        <div style={style}>
            <TableRow 
                className={cn(
                    "hover:bg-muted/50 transition-colors cursor-pointer",
                    isSelected && "bg-muted"
                )}
                onClick={() => onRowClick?.(item)}
            >
                {columns.map((column, colIndex) => (
                    <TableCell 
                        key={colIndex} 
                        className="py-4 px-4 text-sm align-middle"
                        style={{ 
                            width: column.width || 'auto',
                            minWidth: column.minWidth || 100
                        }}
                    >
                        {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                ))}
            </TableRow>
        </div>
    );
};

/**
 * Virtual Table Component
 */
export function VirtualTable({
    data = [],
    columns = [],
    height = 400,
    onRowClick,
    selectedRows,
    className,
    emptyMessage = "No data available",
    loading = false
}) {
    const listRef = useRef();
    const [containerHeight, setContainerHeight] = useState(height);
    
    // Ensure data is always an array
    const safeData = Array.isArray(data) ? data : [];
    const safeColumns = Array.isArray(columns) ? columns : [];
    
    // Memoize the item data to prevent unnecessary re-renders
    const itemData = useMemo(() => ({
        items: safeData,
        columns: safeColumns,
        onRowClick,
        selectedRows
    }), [safeData, safeColumns, onRowClick, selectedRows]);
    
    // Handle container resize
    useEffect(() => {
        const handleResize = () => {
            if (listRef.current) {
                listRef.current.resetAfterIndex(0);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Scroll to top when data changes
    useEffect(() => {
        if (listRef.current && safeData.length > 0) {
            listRef.current.scrollToItem(0);
        }
    }, [safeData]);
    
    if (loading) {
        return (
            <div className={cn("rounded-xl border border-border bg-card shadow-sm", className)}>
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-sm text-slate-500">Loading data...</p>
                </div>
            </div>
        );
    }
    
    if (safeData.length === 0) {
        return (
            <div className={cn("rounded-xl border border-border bg-card shadow-sm", className)}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {safeColumns.map((column, index) => (
                                <TableHead 
                                    key={index}
                                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider h-12 py-3 bg-muted/50"
                                    style={{ 
                                        width: column.width || 'auto',
                                        minWidth: column.minWidth || 100
                                    }}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                </Table>
                <div className="p-8 text-center">
                    <p className="text-sm text-slate-500">{emptyMessage}</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className={cn("rounded-xl border border-border bg-card shadow-sm overflow-hidden", className)}>
            {/* Table Header */}
            <Table>
                <TableHeader>
                    <TableRow>
                        {safeColumns.map((column, index) => (
                            <TableHead 
                                key={index}
                                className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider h-12 py-3 bg-muted/50"
                                style={{ 
                                    width: column.width || 'auto',
                                    minWidth: column.minWidth || 100
                                }}
                            >
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
            </Table>
            
            {/* Virtual Scrolling Body */}
            <div style={{ height: containerHeight - HEADER_HEIGHT }}>
                {safeData.length > 0 && itemData && (
                    <List
                        ref={listRef}
                        height={containerHeight - HEADER_HEIGHT}
                        itemCount={safeData.length}
                        itemSize={ITEM_HEIGHT}
                        itemData={itemData}
                        overscanCount={5}
                    >
                        {VirtualTableRow}
                    </List>
                )}
            </div>
            
            {/* Footer with item count */}
            <div className="px-4 py-2 bg-muted/30 border-t border-border">
                <p className="text-xs text-slate-500">
                    Showing {safeData.length} items
                </p>
            </div>
        </div>
    );
}

/**
 * Virtual List Component (for non-table data)
 */
export function VirtualList({
    data = [],
    renderItem,
    itemHeight = 60,
    height = 400,
    className,
    emptyMessage = "No items available",
    loading = false
}) {
    const listRef = useRef();
    
    // Ensure data is always an array
    const safeData = Array.isArray(data) ? data : [];
    
    const ItemRenderer = useCallback(({ index, style }) => (
        <div style={style}>
            {renderItem(safeData[index], index)}
        </div>
    ), [safeData, renderItem]);
    
    if (loading) {
        return (
            <div className={cn("rounded-xl border border-border bg-card shadow-sm p-8 text-center", className)}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-sm text-slate-500">Loading items...</p>
            </div>
        );
    }
    
    if (safeData.length === 0) {
        return (
            <div className={cn("rounded-xl border border-border bg-card shadow-sm p-8 text-center", className)}>
                <p className="text-sm text-slate-500">{emptyMessage}</p>
            </div>
        );
    }
    
    return (
        <div className={cn("rounded-xl border border-border bg-card shadow-sm overflow-hidden", className)}>
            <List
                ref={listRef}
                height={height}
                itemCount={safeData.length}
                itemSize={itemHeight}
                overscanCount={5}
            >
                {ItemRenderer}
            </List>
            
            <div className="px-4 py-2 bg-muted/30 border-t border-border">
                <p className="text-xs text-slate-500">
                    Showing {safeData.length} items
                </p>
            </div>
        </div>
    );
}

/**
 * Hook for managing virtual table state
 */
export function useVirtualTable({
    data = [],
    pageSize = 50,
    searchTerm = '',
    filters = {}
}) {
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    
    // Ensure data is always an array
    const safeData = Array.isArray(data) ? data : [];
    const safeFilters = filters || {};
    const safeSearchTerm = searchTerm || '';
    
    // Filter and search data
    const filteredData = useMemo(() => {
        let filtered = safeData;
        
        // Apply search
        if (safeSearchTerm.trim()) {
            const search = safeSearchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                Object.values(item || {}).some(value => 
                    value && value.toString().toLowerCase().includes(search)
                )
            );
        }
        
        // Apply filters
        Object.entries(safeFilters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                filtered = filtered.filter(item => item && item[key] === value);
            }
        });
        
        return filtered;
    }, [safeData, safeSearchTerm, safeFilters]);
    
    // Paginated data for virtual scrolling
    const paginatedData = useMemo(() => {
        const startIndex = currentPage * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, currentPage, pageSize]);
    
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const hasNextPage = currentPage < totalPages - 1;
    const hasPrevPage = currentPage > 0;
    
    const loadNextPage = useCallback(() => {
        if (hasNextPage && !isLoading) {
            setIsLoading(true);
            // Simulate async loading
            setTimeout(() => {
                setCurrentPage(prev => prev + 1);
                setIsLoading(false);
            }, 100);
        }
    }, [hasNextPage, isLoading]);
    
    const loadPrevPage = useCallback(() => {
        if (hasPrevPage && !isLoading) {
            setCurrentPage(prev => prev - 1);
        }
    }, [hasPrevPage, isLoading]);
    
    const resetPage = useCallback(() => {
        setCurrentPage(0);
    }, []);
    
    // Reset page when filters change
    useEffect(() => {
        resetPage();
    }, [searchTerm, filters, resetPage]);
    
    return {
        data: paginatedData,
        filteredData,
        totalItems: filteredData.length,
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage,
        isLoading,
        loadNextPage,
        loadPrevPage,
        resetPage
    };
}