/**
 * Default Task Templates
 * Task types aligned with new SDLC phases
 * Each task has estimates for Low, Medium, High, and Sophisticated complexity
 */

export const defaultTaskTemplates = [
    // === INITIATION PHASE ===
    {
        id: 'T001',
        name: 'Project Charter',
        phaseId: 1,
        category: 'Project',
        estimates: {
            low: { days: 2, hours: 2 },
            medium: { days: 4, hours: 3 },
            high: { days: 6, hours: 4 },
            sophisticated: { days: 10, hours: 5 },
        },
    },
    {
        id: 'T002',
        name: 'Stakeholder Analysis',
        phaseId: 1,
        category: 'Project',
        estimates: {
            low: { days: 1, hours: 2 },
            medium: { days: 3, hours: 3 },
            high: { days: 5, hours: 4 },
            sophisticated: { days: 8, hours: 5 },
        },
    },

    // === PLANNING PHASE ===
    {
        id: 'T003',
        name: 'Requirements Gathering',
        phaseId: 2,
        category: 'Project',
        estimates: {
            low: { days: 3, hours: 3 },
            medium: { days: 6, hours: 4 },
            high: { days: 10, hours: 5 },
            sophisticated: { days: 15, hours: 6 },
        },
    },
    {
        id: 'T004',
        name: 'Technical Design',
        phaseId: 2,
        category: 'Project',
        estimates: {
            low: { days: 2, hours: 2 },
            medium: { days: 5, hours: 4 },
            high: { days: 8, hours: 5 },
            sophisticated: { days: 12, hours: 6 },
        },
    },
    {
        id: 'T005',
        name: 'Sprint Planning',
        phaseId: 2,
        category: 'Project',
        estimates: {
            low: { days: 1, hours: 2 },
            medium: { days: 2, hours: 3 },
            high: { days: 3, hours: 4 },
            sophisticated: { days: 4, hours: 4 },
        },
    },

    // === EXECUTION PHASE ===
    {
        id: 'T006',
        name: 'Bug Fix',
        phaseId: 3,
        category: 'Project',
        estimates: {
            low: { days: 1, hours: 2 },
            medium: { days: 2, hours: 4 },
            high: { days: 4, hours: 6 },
            sophisticated: { days: 6, hours: 8 },
        },
    },
    {
        id: 'T007',
        name: 'Feature Development',
        phaseId: 3,
        category: 'Project',
        estimates: {
            low: { days: 3, hours: 4 },
            medium: { days: 7, hours: 5 },
            high: { days: 14, hours: 6 },
            sophisticated: { days: 21, hours: 7 },
        },
    },
    {
        id: 'T008',
        name: 'Infrastructure Setup',
        phaseId: 3,
        category: 'Project',
        estimates: {
            low: { days: 2, hours: 3 },
            medium: { days: 5, hours: 4 },
            high: { days: 8, hours: 5 },
            sophisticated: { days: 12, hours: 6 },
        },
    },
    {
        id: 'T009',
        name: 'Security Audit',
        phaseId: 3,
        category: 'Project',
        estimates: {
            low: { days: 2, hours: 2 },
            medium: { days: 4, hours: 3 },
            high: { days: 7, hours: 4 },
            sophisticated: { days: 10, hours: 5 },
        },
    },

    // === MONITORING & CONTROLLING PHASE ===
    {
        id: 'T010',
        name: 'Code Review',
        phaseId: 4,
        category: 'Project',
        estimates: {
            low: { days: 1, hours: 2 },
            medium: { days: 2, hours: 3 },
            high: { days: 3, hours: 4 },
            sophisticated: { days: 5, hours: 5 },
        },
    },
    {
        id: 'T011',
        name: 'Integration Testing',
        phaseId: 4,
        category: 'Project',
        estimates: {
            low: { days: 2, hours: 3 },
            medium: { days: 4, hours: 4 },
            high: { days: 6, hours: 5 },
            sophisticated: { days: 10, hours: 6 },
        },
    },
    {
        id: 'T012',
        name: 'User Acceptance Testing',
        phaseId: 4,
        category: 'Project',
        estimates: {
            low: { days: 3, hours: 3 },
            medium: { days: 5, hours: 4 },
            high: { days: 8, hours: 5 },
            sophisticated: { days: 12, hours: 6 },
        },
    },

    // === CLOSING PHASE ===
    {
        id: 'T013',
        name: 'Deployment',
        phaseId: 5,
        category: 'Project',
        estimates: {
            low: { days: 1, hours: 2 },
            medium: { days: 2, hours: 4 },
            high: { days: 4, hours: 5 },
            sophisticated: { days: 6, hours: 6 },
        },
    },
    {
        id: 'T014',
        name: 'Documentation',
        phaseId: 5,
        category: 'Project',
        estimates: {
            low: { days: 2, hours: 2 },
            medium: { days: 4, hours: 3 },
            high: { days: 6, hours: 4 },
            sophisticated: { days: 8, hours: 5 },
        },
    },
    {
        id: 'T015',
        name: 'Knowledge Transfer',
        phaseId: 5,
        category: 'Project',
        estimates: {
            low: { days: 1, hours: 2 },
            medium: { days: 2, hours: 3 },
            high: { days: 3, hours: 4 },
            sophisticated: { days: 5, hours: 5 },
        },
    },

    // === SUPPORT PHASE ===
    {
        id: 'T101',
        name: 'Incident Resolution',
        phaseId: 6,
        category: 'Support',
        estimates: {
            low: { days: 1, hours: 2 },
            medium: { days: 2, hours: 4 },
            high: { days: 3, hours: 6 },
            sophisticated: { days: 5, hours: 8 },
        },
    },
    {
        id: 'T102',
        name: 'Service Request',
        phaseId: 6,
        category: 'Support',
        estimates: {
            low: { days: 1, hours: 1 },
            medium: { days: 2, hours: 2 },
            high: { days: 4, hours: 3 },
            sophisticated: { days: 6, hours: 4 },
        },
    },
    {
        id: 'T103',
        name: 'System Monitoring',
        phaseId: 6,
        category: 'Support',
        estimates: {
            low: { days: 1, hours: 1 },
            medium: { days: 1, hours: 2 },
            high: { days: 2, hours: 3 },
            sophisticated: { days: 3, hours: 4 },
        },
    },

    // === TERMINAL PHASES ===
    {
        id: 'T901',
        name: 'Idle',
        phaseId: 7,
        category: 'Terminal',
        estimates: {
            low: { days: 0, hours: 0 },
            medium: { days: 0, hours: 0 },
            high: { days: 0, hours: 0 },
            sophisticated: { days: 0, hours: 0 },
        },
    },
    {
        id: 'T902',
        name: 'Completed',
        phaseId: 8,
        category: 'Terminal',
        estimates: {
            low: { days: 0, hours: 0 },
            medium: { days: 0, hours: 0 },
            high: { days: 0, hours: 0 },
            sophisticated: { days: 0, hours: 0 },
        },
    },
];
