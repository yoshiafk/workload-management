/**
 * Default Task Phases
 * Standard Project Management phases based on SDLC
 * Plus Support and Terminal phases
 */

export const defaultPhases = [
    // Project Phases (SDLC)
    {
        id: 1,
        name: 'Initiation',
        description: 'Project kickoff, charter, and stakeholder identification',
        category: 'Project',
        tasks: ['T001', 'T002'],
        sortOrder: 1,
        isTerminal: false,
    },
    {
        id: 2,
        name: 'Planning',
        description: 'Requirements, design, and estimation',
        category: 'Project',
        tasks: ['T003', 'T004', 'T005'],
        sortOrder: 2,
        isTerminal: false,
    },
    {
        id: 3,
        name: 'Execution',
        description: 'Development, coding, and implementation',
        category: 'Project',
        tasks: ['T006', 'T007', 'T008', 'T009'],
        sortOrder: 3,
        isTerminal: false,
    },
    {
        id: 4,
        name: 'Monitoring & Controlling',
        description: 'Testing, QA, and code review',
        category: 'Project',
        tasks: ['T010', 'T011', 'T012'],
        sortOrder: 4,
        isTerminal: false,
    },
    {
        id: 5,
        name: 'Closing',
        description: 'Deployment, handover, and documentation',
        category: 'Project',
        tasks: ['T013', 'T014', 'T015'],
        sortOrder: 5,
        isTerminal: false,
    },
    // Support Phase
    {
        id: 6,
        name: 'IT Operations & Support',
        description: 'Incident resolution, service requests, and monitoring',
        category: 'Support',
        tasks: ['T101', 'T102', 'T103'],
        sortOrder: 6,
        isTerminal: false,
    },
    // Terminal Phases
    {
        id: 7,
        name: 'Idle',
        description: 'No active work assigned',
        category: 'Terminal',
        tasks: ['T901'],
        sortOrder: 7,
        isTerminal: true,
    },
    {
        id: 8,
        name: 'Completed',
        description: 'Task finished and closed',
        category: 'Terminal',
        tasks: ['T902'],
        sortOrder: 8,
        isTerminal: true,
    },
];
