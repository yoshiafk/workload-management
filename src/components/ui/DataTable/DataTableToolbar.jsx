import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDensity } from "@/context/DensityContext";
import { cn } from "@/lib/utils";

export function DataTableToolbar({
    table,
    searchKey,
    searchPlaceholder = "Search...",
    filters,
    actions,
}) {
    const { isDense } = useDensity();
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className={cn("flex flex-wrap items-center justify-between gap-4", isDense ? "py-2" : "py-4")}>
            <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="relative w-full md:w-[250px] lg:w-[350px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={(table.getColumn(searchKey)?.getFilterValue()) ?? ""}
                        onChange={(event) =>
                            table.getColumn(searchKey)?.setFilterValue(event.target.value)
                        }
                        className={cn(
                            "pl-9 bg-muted/30 border-border/60 rounded-xl focus-visible:ring-primary/20",
                            isDense ? "h-8 text-xs" : "h-10 text-sm"
                        )}
                    />
                </div>

                {filters && <div className="flex items-center gap-2">{filters}</div>}

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className={cn("h-8 px-2 lg:px-3 text-xs font-bold uppercase tracking-wider", isDense ? "h-7" : "h-8")}
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2">
                {actions}
            </div>
        </div>
    );
}
