/**
 * Enhanced Data Table Component
 * Features: sorting, filtering, pagination, row selection, bulk actions, density support
 */

import * as React from "react"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Download, Trash2, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { useDensity } from "@/context/DensityContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

/**
 * Create a selection column for row checkbox selection
 */
export const createSelectionColumn = () => ({
    id: "select",
    header: ({ table }) => (
        <Checkbox
            checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
        />
    ),
    cell: ({ row }) => (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
        />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
})

const DataTable = ({
    columns,
    data,
    searchable = false,
    searchPlaceholder = "Search...",
    searchColumn,
    pagination = true,
    pageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    selection = false,
    onSelectionChange,
    bulkActions,
    toolbar,
    emptyState,
    className,
    onExport,
    ...props
}) => {
    const { isDense } = useDensity()
    const [sorting, setSorting] = React.useState([])
    const [columnFilters, setColumnFilters] = React.useState([])
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [rowSelection, setRowSelection] = React.useState({})

    // Enhanced columns with selection if enabled
    const enhancedColumns = React.useMemo(() => {
        if (selection) {
            return [createSelectionColumn(), ...columns]
        }
        return columns
    }, [columns, selection])

    const table = useReactTable({
        data,
        columns: enhancedColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            rowSelection,
        },
        initialState: {
            pagination: {
                pageSize,
            },
        },
    })

    // Notify parent of selection changes
    React.useEffect(() => {
        if (onSelectionChange) {
            const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
            onSelectionChange(selectedRows)
        }
    }, [rowSelection, onSelectionChange, table])

    const selectedCount = table.getFilteredSelectedRowModel().rows.length
    const hasSelection = selectedCount > 0

    // Density-based styles
    const cellPadding = isDense ? "py-2 px-3" : "py-3 px-4"
    const fontSize = isDense ? "text-sm" : "text-base"

    return (
        <div className={cn("space-y-4", className)} {...props}>
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    {searchable && (
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchColumn
                                    ? (table.getColumn(searchColumn)?.getFilterValue() ?? "")
                                    : globalFilter
                                }
                                onChange={(e) =>
                                    searchColumn
                                        ? table.getColumn(searchColumn)?.setFilterValue(e.target.value)
                                        : setGlobalFilter(e.target.value)
                                }
                                className="pl-9"
                            />
                        </div>
                    )}
                    {toolbar}
                </div>

                <div className="flex items-center gap-2">
                    {/* Export button */}
                    {onExport && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onExport(data)}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    )}
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {hasSelection && bulkActions && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-slide-up">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{selectedCount} selected</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        {bulkActions.map((action) => (
                            <Button
                                key={action.id}
                                variant={action.variant || "ghost"}
                                size="sm"
                                onClick={() => {
                                    const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
                                    action.onClick(selectedRows)
                                    if (action.clearSelection !== false) {
                                        table.resetRowSelection()
                                    }
                                }}
                                className={cn(
                                    "gap-2",
                                    action.variant === "destructive" && "text-destructive hover:text-destructive"
                                )}
                            >
                                {action.icon}
                                {action.label}
                            </Button>
                        ))}
                    </div>
                    <div className="ml-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => table.resetRowSelection()}
                        >
                            Clear selection
                        </Button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                                {headerGroup.headers.map((header) => {
                                    const canSort = header.column.getCanSort()
                                    const sorted = header.column.getIsSorted()

                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={cn(
                                                cellPadding,
                                                fontSize,
                                                canSort && "cursor-pointer select-none hover:bg-muted"
                                            )}
                                            style={{ width: header.column.columnDef.size }}
                                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                        >
                                            <div className="flex items-center gap-2">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                {canSort && (
                                                    <span className="text-muted-foreground">
                                                        {sorted === "asc" ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : sorted === "desc" ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={cn(
                                        "row-interactive",
                                        row.getIsSelected() && "bg-primary/5"
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(cellPadding, fontSize)}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={enhancedColumns.length} className="h-24 text-center">
                                    {emptyState || "No results."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            {selection && selectedCount > 0 && (
                                <span className="font-medium text-foreground">
                                    {selectedCount} of{" "}
                                </span>
                            )}
                            {table.getFilteredRowModel().rows.length} row(s)
                        </div>

                        {/* Page size selector */}
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => table.setPageSize(Number(e.target.value))}
                            className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm"
                        >
                            {pageSizeOptions.map(size => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <div className="text-sm text-muted-foreground min-w-[100px] text-center">
                            Page {table.getState().pagination.pageIndex + 1} of{" "}
                            {table.getPageCount()}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export { DataTable }

