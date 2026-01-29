import { useMemo } from 'react';

export function TodayIndicator({ dateRange, cellWidth, resourceWidth }) {
    const todayIndex = useMemo(() => {
        return dateRange.findIndex(
            d => d.toDateString() === new Date().toDateString()
        );
    }, [dateRange]);

    if (todayIndex === -1) return null;

    const leftPosition = resourceWidth + (todayIndex * cellWidth) + (cellWidth / 2);

    return (
        <div
            className="timeline-today-line"
            style={{ left: `${leftPosition}px` }}
        />
    );
}
