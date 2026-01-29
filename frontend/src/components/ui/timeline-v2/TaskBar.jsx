import { useMemo, useState } from 'react';
import { differenceInDays, startOfDay, format, addDays } from 'date-fns';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function TaskBar({ task, dateRange, cellWidth, lane = 0, onTaskUpdate }) {
    const [isDragging, setIsDragging] = useState(false);

    const position = useMemo(() => {
        if (!task.plan?.taskStart || !task.plan?.taskEnd) return null;

        const timelineStart = startOfDay(dateRange[0]);
        const taskStart = startOfDay(new Date(task.plan.taskStart));
        const taskEnd = startOfDay(new Date(task.plan.taskEnd));

        // Calculate days from timeline start
        const startOffset = differenceInDays(taskStart, timelineStart);
        // Calculate duration (inclusive)
        const duration = differenceInDays(taskEnd, taskStart) + 1;

        return {
            left: startOffset * cellWidth,
            width: Math.max(cellWidth, duration * cellWidth), // Min 1 day width
            duration
        };
    }, [task, dateRange, cellWidth]);

    if (!position) return null;

    const startDate = new Date(task.plan.taskStart);
    const endDate = new Date(task.plan.taskEnd);

    const handleDragEnd = (event, info) => {
        setIsDragging(false);

        // Calculate how many days moved (snap to day boundaries)
        const daysMoved = Math.round(info.offset.x / cellWidth);

        if (daysMoved !== 0 && onTaskUpdate) {
            const newStart = addDays(startDate, daysMoved);
            const newEnd = addDays(endDate, daysMoved);

            onTaskUpdate({
                ...task,
                plan: {
                    ...task.plan,
                    taskStart: format(newStart, 'yyyy-MM-dd'),
                    taskEnd: format(newEnd, 'yyyy-MM-dd')
                }
            });
        }
    };

    // Calculate vertical position based on lane
    const taskHeight = 36;
    const taskMargin = 8;
    const top = 12 + lane * (taskHeight + taskMargin);

    return (
        <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
                <motion.div
                    drag="x"
                    dragMomentum={false}
                    dragElastic={0.1}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                        "timeline-task-bar",
                        task.category?.toLowerCase(),
                        isDragging && "dragging"
                    )}
                    style={{
                        left: `${position.left}px`,
                        width: `${position.width}px`,
                        top: `${top}px`,
                        height: `${taskHeight}px`,
                        cursor: 'grab'
                    }}
                    whileDrag={{ cursor: 'grabbing' }}
                >
                    <span className="task-label">{task.activityName}</span>
                </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs p-3 space-y-2">
                <div className="font-bold text-sm text-slate-900">{task.activityName}</div>
                <div className="text-xs space-y-1">
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-600">Project:</span>
                        <span className="font-medium text-slate-900">{task.projectName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-600">Duration:</span>
                        <span className="font-medium text-slate-900">{position.duration} days</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-600">Start:</span>
                        <span className="font-medium text-slate-900">{format(startDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-600">End:</span>
                        <span className="font-medium text-slate-900">{format(endDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-600">Category:</span>
                        <span className="font-medium text-slate-900 capitalize">{task.category || 'N/A'}</span>
                    </div>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

