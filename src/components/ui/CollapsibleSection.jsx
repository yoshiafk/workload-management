import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CollapsibleSection({
    title,
    id,
    children,
    defaultOpen = true,
    className,
    headerActions
}) {
    const storageKey = `section-expanded-${id}`;
    const [isExpanded, setIsExpanded] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved !== null ? JSON.parse(saved) : defaultOpen;
    });

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(isExpanded));
    }, [isExpanded, storageKey]);

    return (
        <section className={cn("bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all", className)}>
            <div
                className={cn(
                    "flex items-center justify-between p-4 px-6 cursor-pointer select-none hover:bg-muted/30 transition-colors",
                    !isExpanded && "border-b-0"
                )}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="text-muted-foreground">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                    <h2 className="font-bold text-sm tracking-tight uppercase text-foreground/80">{title}</h2>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {headerActions}
                </div>
            </div>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <div className="p-6 pt-2 border-t border-border/40">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
