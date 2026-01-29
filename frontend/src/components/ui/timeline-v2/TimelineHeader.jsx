import { useMemo } from 'react';
import { format, isSameMonth, startOfMonth } from 'date-fns';
import { cn } from "@/lib/utils";

export function TimelineHeader({ dateRange, cellWidth, gridWidth }) {
    // Group dates by month
    const monthGroups = useMemo(() => {
        const groups = [];
        let currentGroup = {
            month: startOfMonth(dateRange[0]),
            startIndex: 0,
            count: 0
        };

        dateRange.forEach((date, idx) => {
            if (isSameMonth(date, currentGroup.month)) {
                currentGroup.count++;
            } else {
                groups.push(currentGroup);
                currentGroup = {
                    month: startOfMonth(date),
                    startIndex: idx,
                    count: 1
                };
            }
        });
        groups.push(currentGroup);
        return groups;
    }, [dateRange]);

    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const isToday = (date) => {
        return date.toDateString() === new Date().toDateString();
    };

    return (
        <div className="timeline-header" style={{ width: `${gridWidth}px` }}>
            {/* Month Level */}
            <div className="timeline-header-months">
                {monthGroups.map((group, idx) => (
                    <div
                        key={idx}
                        className="timeline-month-cell"
                        style={{ width: `${group.count * cellWidth}px` }}
                    >
                        {format(group.month, 'MMMM yyyy')}
                    </div>
                ))}
            </div>

            {/* Day Level */}
            <div className="timeline-header-days">
                {dateRange.map((date, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "timeline-day-cell",
                            isWeekend(date) && "weekend",
                            isToday(date) && "today"
                        )}
                        style={{ width: `${cellWidth}px` }}
                    >
                        <span className="day-name">{format(date, 'eee')}</span>
                        <span className="day-number">{format(date, 'd')}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
