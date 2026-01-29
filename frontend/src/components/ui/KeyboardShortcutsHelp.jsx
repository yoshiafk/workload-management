import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { getShortcutsByCategory, CATEGORY_NAMES } from "@/utils/shortcuts";
import { cn } from "@/lib/utils";

export function KeyboardShortcutsHelp({ open, onOpenChange }) {
    const categories = getShortcutsByCategory();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Keyboard Shortcuts</DialogTitle>
                    <DialogDescription>
                        Master the application with these helpful shortcuts.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    {Object.entries(categories).map(([category, shortcuts]) => (
                        <div key={category} className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
                                {CATEGORY_NAMES[category] || category}
                            </h3>
                            <div className="space-y-3">
                                {shortcuts.map((shortcut) => (
                                    <div key={shortcut.id} className="flex items-center justify-between group">
                                        <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                                            {shortcut.description}
                                        </span>
                                        <kbd className="inline-flex h-6 items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
                                            {shortcut.formatted}
                                        </kbd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-tighter">
                        Press <kbd className="bg-muted px-1 rounded border border-border">?</kbd> at any time to see this menu
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
