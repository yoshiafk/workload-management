import { useRef, useEffect, useMemo } from 'react';
import { TimelineHeader } from './TimelineHeader';
import { TimelineGrid } from './TimelineGrid';
import { TimelineRow } from './TimelineRow';
import { TodayIndicator } from './TodayIndicator';
import './Timeline.css';

const RESOURCE_WIDTH = 240;

export function Timeline({
    resources,
    tasks,
    dateRange,
    cellWidth = 50,
    rowHeight = 60,
    holidays = [],
    onTaskUpdate
}) {
    const scrollContainerRef = useRef(null);
    const headerScrollRef = useRef(null);

    // Calculate explicit widths
    const gridWidth = useMemo(() =>
        dateRange.length * cellWidth,
        [dateRange.length, cellWidth]
    );

    const totalWidth = RESOURCE_WIDTH + gridWidth;

    // Sync header scroll with main scroll (synchronous for perfect alignment)
    useEffect(() => {
        const handleScroll = () => {
            if (headerScrollRef.current && scrollContainerRef.current) {
                headerScrollRef.current.scrollLeft = scrollContainerRef.current.scrollLeft;
            }
        };

        const container = scrollContainerRef.current;
        container?.addEventListener('scroll', handleScroll, { passive: true });

        return () => container?.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-scroll to today on mount
    useEffect(() => {
        const today = new Date().toDateString();
        const todayIdx = dateRange.findIndex(d => d.toDateString() === today);

        if (todayIdx !== -1 && scrollContainerRef.current) {
            // Calculate scroll position to show today ~1/3 from the left
            const viewportWidth = scrollContainerRef.current.clientWidth;
            const scrollPos = (todayIdx * cellWidth) - (viewportWidth / 4);

            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                scrollContainerRef.current?.scrollTo({
                    left: Math.max(0, scrollPos),
                    behavior: 'auto'
                });
            }, 100);
        }
    }, [dateRange, cellWidth]);

    return (
        <div
            className="timeline-root"
            style={{
                '--timeline-cell-width': `${cellWidth}px`,
                '--timeline-resource-width': `${RESOURCE_WIDTH}px`,
                '--timeline-grid-width': `${gridWidth}px`,
                '--timeline-row-height': `${rowHeight}px`
            }}
        >
            {/* Header Section */}
            <div className="timeline-header-section">
                <div className="timeline-header-resource">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        Resource
                    </span>
                </div>
                <div
                    ref={headerScrollRef}
                    className="timeline-header-scroll"
                >
                    <TimelineHeader
                        dateRange={dateRange}
                        cellWidth={cellWidth}
                        gridWidth={gridWidth}
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div ref={scrollContainerRef} className="timeline-scroll-container">
                <div
                    className="timeline-content"
                    style={{ width: `${totalWidth}px` }}
                >
                    {/* Background Grid */}
                    <TimelineGrid
                        dateRange={dateRange}
                        cellWidth={cellWidth}
                        gridWidth={gridWidth}
                        resourceWidth={RESOURCE_WIDTH}
                        holidays={holidays}
                    />

                    {/* Today Indicator */}
                    <TodayIndicator
                        dateRange={dateRange}
                        cellWidth={cellWidth}
                        resourceWidth={RESOURCE_WIDTH}
                    />

                    {/* Rows */}
                    <div className="timeline-rows">
                        {resources.filter(r => r.isActive).map(resource => (
                            <TimelineRow
                                key={resource.id}
                                resource={resource}
                                tasks={tasks.filter(t => t.resource === resource.name)}
                                dateRange={dateRange}
                                cellWidth={cellWidth}
                                gridWidth={gridWidth}
                                rowHeight={rowHeight}
                                onTaskUpdate={onTaskUpdate}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
