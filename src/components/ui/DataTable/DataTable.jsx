import {
    flexRender,
} from "@tanstack/react-table";
import { ReactNode, Fragment } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useDensity } from "@/context/DensityContext";
import { cn } from "@/lib/utils";

export function DataTable({ table, columns, isLoading, renderSubComponent }) {
    const { isDense } = useDensity();

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className={cn(
                                            "text-xs font-bold text-muted-foreground uppercase tracking-wider",
                                            isDense ? "py-2 h-8" : "py-4 h-12"
                                        )}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <Fragment key={row.id}>
                                <TableRow
                                    data-state={row.getIsSelected() && "selected"}
                                    className={cn(
                                        "transition-colors",
                                        isDense ? "h-8" : "h-14"
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                "px-4 text-sm align-middle",
                                                isDense ? "py-1" : "py-3"
                                            )}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                {row.getIsExpanded() && renderSubComponent && (
                                    <TableRow className="bg-muted/30">
                                        <TableCell colSpan={row.getVisibleCells().length} className="p-0">
                                            {renderSubComponent({ row })}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Fragment>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        <span>Loading data...</span>
                                    </div>
                                ) : (
                                    "No results."
                                )}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
