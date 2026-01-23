import { useMemo } from 'react';
import { cn } from "@/lib/utils";

export function TimelineGrid({ dateRange, cellWidth, gridWidth, resourceWidth, holidays = [] }) {
    const holidayDates = useMemo(() =>
        new Set(holidays.map(h => h.date)),
        [holidays]
    );

    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const isToday = (date) => {
        return date.toDateString() === new Date().toDateString();
    };

    return (
        <div className="timeline-grid-background">
            {/* Resource column spacer */}
            <div className="timeline-grid-spacer" />

            {/* Grid cells */}
            <div className="timeline-grid-cells" style={{ width: `${gridWidth}px` }}>
                {dateRange.map((date, idx) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const weekend = isWeekend(date);
                    const today = isToday(date);
                    const holiday = holidayDates.has(dateStr);

                    return (
                        <div
                            key={idx}
                            className={cn(
                                "timeline-grid-cell",
                                weekend && "weekend",
                                today && "today",
                                holiday && "holiday"
                            )}
                            style={{
                                width: `${cellWidth}px`,
                                height: '100%'
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
