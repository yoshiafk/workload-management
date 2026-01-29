import { useMemo } from 'react';
import { TaskBar } from './TaskBar';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { defaultRoleTiers } from '@/data';
import { isBefore, isAfter, parseISO } from 'date-fns';

export function TimelineRow({ resource, tasks, dateRange, cellWidth, gridWidth, rowHeight, onTaskUpdate }) {
    // Stacking algorithm: assign tasks to lanes
    const stackedTasks = useMemo(() => {
        if (!tasks.length) return [];

        // Sort tasks by start date
        const sortedTasks = [...tasks].sort((a, b) => {
            const startA = new Date(a.plan.taskStart);
            const startB = new Date(b.plan.taskStart);
            return startA - startB;
        });

        const lanes = []; // Array of arrays (lanes)

        sortedTasks.forEach(task => {
            let placed = false;
            const taskStart = new Date(task.plan.taskStart);
            const taskEnd = new Date(task.plan.taskEnd);

            for (let i = 0; i < lanes.length; i++) {
                // Check if this task overlaps with any task in this lane
                const hasOverlap = lanes[i].some(t => {
                    const tStart = new Date(t.plan.taskStart);
                    const tEnd = new Date(t.plan.taskEnd);

                    // (StartA <= EndB) and (EndA >= StartB)
                    return taskStart <= tEnd && taskEnd >= tStart;
                });

                if (!hasOverlap) {
                    lanes[i].push(task);
                    task.lane = i;
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                lanes.push([task]);
                task.lane = lanes.length - 1;
            }
        });

        return sortedTasks;
    }, [tasks]);

    const maxLanes = Math.max(1, ...stackedTasks.map(t => (t.lane || 0) + 1));
    const dynamicRowHeight = Math.max(rowHeight, maxLanes * 44 + 16);

    return (
        <div className="timeline-row" style={{ minHeight: `${dynamicRowHeight}px` }}>
            {/* Sticky Resource Cell */}
            <div className="timeline-resource-cell" style={{ minHeight: `${dynamicRowHeight}px` }}>
                <Avatar className="h-9 w-9 border border-border/50 shrink-0">
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-black uppercase">
                        {resource.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black text-foreground truncate">
                        {resource.name}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight truncate">
                        {defaultRoleTiers[resource.type]?.name || resource.type}
                    </span>
                </div>
            </div>

            {/* Task Container - EXPLICIT WIDTH */}
            <div
                className="timeline-task-container"
                style={{
                    width: `${gridWidth}px`,
                    minHeight: `${dynamicRowHeight}px`
                }}
            >
                {stackedTasks.map(task => (
                    <TaskBar
                        key={task.id}
                        task={task}
                        dateRange={dateRange}
                        cellWidth={cellWidth}
                        lane={task.lane || 0}
                        onTaskUpdate={onTaskUpdate}
                    />
                ))}
            </div>
        </div>
    );
}
