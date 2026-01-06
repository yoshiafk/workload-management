/**
 * Default Task Templates
 * Pre-loaded from Excel prototype (Library sheet)
 * Each task has estimates for Low, Medium, and High complexity
 */

export const defaultTaskTemplates = [
    {
        id: 'T001',
        name: 'Stakeholder Interviews',
        phaseId: 1,
        estimates: {
            low: { days: 2, hours: 1, percentage: 0.125 },
            medium: { days: 5, hours: 2, percentage: 0.25 },
            high: { days: 10, hours: 4, percentage: 0.5 },
        },
    },
    {
        id: 'T002',
        name: 'Requirements Documentation',
        phaseId: 1,
        estimates: {
            low: { days: 4, hours: 2, percentage: 0.25 },
            medium: { days: 6, hours: 3, percentage: 0.375 },
            high: { days: 8, hours: 4, percentage: 0.5 },
        },
    },
    {
        id: 'T003',
        name: 'UI/UX Design',
        phaseId: 2,
        estimates: {
            low: { days: 2, hours: 1, percentage: 0.125 },
            medium: { days: 4, hours: 2, percentage: 0.25 },
            high: { days: 6, hours: 3, percentage: 0.375 },
        },
    },
    {
        id: 'T004',
        name: 'System Functional Design',
        phaseId: 2,
        estimates: {
            low: { days: 2, hours: 1, percentage: 0.125 },
            medium: { days: 2, hours: 1, percentage: 0.125 },
            high: { days: 4, hours: 2, percentage: 0.25 },
        },
    },
    {
        id: 'T005',
        name: 'Test Case Creation',
        phaseId: 3,
        estimates: {
            low: { days: 4, hours: 2, percentage: 0.25 },
            medium: { days: 4, hours: 2, percentage: 0.25 },
            high: { days: 8, hours: 4, percentage: 0.5 },
        },
    },
    {
        id: 'T006',
        name: 'Frontend & Backend Development',
        phaseId: 3,
        estimates: {
            low: { days: 2, hours: 1, percentage: 0.125 },
            medium: { days: 2, hours: 1, percentage: 0.125 },
            high: { days: 8, hours: 4, percentage: 0.5 },
        },
    },
    {
        id: 'T007',
        name: 'Integration Testing',
        phaseId: 4,
        estimates: {
            low: { days: 4, hours: 2, percentage: 0.25 },
            medium: { days: 4, hours: 2, percentage: 0.25 },
            high: { days: 6, hours: 3, percentage: 0.375 },
        },
    },
    {
        id: 'T008',
        name: 'User Acceptance Test',
        phaseId: 4,
        estimates: {
            low: { days: 6, hours: 3, percentage: 0.375 },
            medium: { days: 6, hours: 3, percentage: 0.375 },
            high: { days: 6, hours: 3, percentage: 0.375 },
        },
    },
    {
        id: 'T009',
        name: 'Deployment to Production',
        phaseId: 5,
        estimates: {
            low: { days: 2, hours: 1, percentage: 0.125 },
            medium: { days: 4, hours: 2, percentage: 0.25 },
            high: { days: 4, hours: 2, percentage: 0.25 },
        },
    },
    {
        id: 'T010',
        name: 'Post-Deployment Support',
        phaseId: 6,
        estimates: {
            low: { days: 1, hours: 0.5, percentage: 0.0625 },
            medium: { days: 2, hours: 1, percentage: 0.125 },
            high: { days: 2, hours: 1, percentage: 0.125 },
        },
    },
    {
        id: 'T011',
        name: 'Idle',
        phaseId: 7,
        estimates: {
            low: { days: 0, hours: 0, percentage: 0 },
            medium: { days: 0, hours: 0, percentage: 0 },
            high: { days: 0, hours: 0, percentage: 0 },
        },
    },
    {
        id: 'T012',
        name: 'Completed',
        phaseId: 8,
        estimates: {
            low: { days: 0, hours: 0, percentage: 0 },
            medium: { days: 0, hours: 0, percentage: 0 },
            high: { days: 0, hours: 0, percentage: 0 },
        },
    },
];
