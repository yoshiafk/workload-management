/**
 * Default Task Phases
 * Pre-loaded from Excel prototype (Library sheet)
 */

export const defaultPhases = [
    {
        id: 1,
        name: 'Requirement Gathering & Analysis',
        tasks: ['T001', 'T002'],
        sortOrder: 1,
        isTerminal: false,
    },
    {
        id: 2,
        name: 'Design',
        tasks: ['T003', 'T004'],
        sortOrder: 2,
        isTerminal: false,
    },
    {
        id: 3,
        name: 'Implementation',
        tasks: ['T005', 'T006'],
        sortOrder: 3,
        isTerminal: false,
    },
    {
        id: 4,
        name: 'Testing',
        tasks: ['T007', 'T008'],
        sortOrder: 4,
        isTerminal: false,
    },
    {
        id: 5,
        name: 'Deployment',
        tasks: ['T009'],
        sortOrder: 5,
        isTerminal: false,
    },
    {
        id: 6,
        name: 'Maintenance',
        tasks: ['T010'],
        sortOrder: 6,
        isTerminal: false,
    },
    {
        id: 7,
        name: 'Idle',
        tasks: ['T011'],
        sortOrder: 7,
        isTerminal: true,
    },
    {
        id: 8,
        name: 'Completed',
        tasks: ['T012'],
        sortOrder: 8,
        isTerminal: true,
    },
];
