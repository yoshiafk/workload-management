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
            low: { days: 2, hours: 1, percentage: 0.0625 },
            medium: { days: 5, hours: 2, percentage: 0.05 },
            high: { days: 10, hours: 4, percentage: 0.05 },
            sophisticated: { days: 15, hours: 6, percentage: 0.05 },
        },
    },
    {
        id: 'T002',
        name: 'Requirements Documentation',
        phaseId: 1,
        estimates: {
            low: { days: 4, hours: 2, percentage: 0.0625 },
            medium: { days: 6, hours: 3, percentage: 0.0625 },
            high: { days: 8, hours: 4, percentage: 0.0625 },
        },
    },
    {
        id: 'T003',
        name: 'UI/UX Design',
        phaseId: 2,
        estimates: {
            low: { days: 2, hours: 1, percentage: 0.0625 },
            medium: { days: 4, hours: 2, percentage: 0.0625 },
            high: { days: 6, hours: 3, percentage: 0.0625 },
        },
    },
    {
        id: 'T004',
        name: 'System Functional Design',
        phaseId: 2,
        estimates: {
            low: { days: 2, hours: 1, percentage: 0.0625 },
            medium: { days: 2, hours: 1, percentage: 0.0625 },
            high: { days: 4, hours: 2, percentage: 0.0625 },
        },
    },
    {
        id: 'T005',
        name: 'Test Case Creation',
        phaseId: 3,
        estimates: {
            low: { days: 4, hours: 2, percentage: 0.0625 },
            medium: { days: 4, hours: 2, percentage: 0.0625 },
            high: { days: 8, hours: 4, percentage: 0.0625 },
        },
    },
    {
        id: 'T006',
        name: 'Frontend & Backend Development',
        phaseId: 3,
        estimates: {
            low: { days: 2, hours: 1, percentage: 0.0625 },
            medium: { days: 2, hours: 1, percentage: 0.0625 },
            high: { days: 8, hours: 4, percentage: 0.0625 },
        },
    },
    {
        id: 'T007',
        name: 'Integration Testing',
        phaseId: 4,
        estimates: {
            low: { days: 4, hours: 2, percentage: 0.0625 },
            medium: { days: 4, hours: 2, percentage: 0.0625 },
            high: { days: 6, hours: 3, percentage: 0.0625 },
        },
    },
    {
        id: 'T008',
        name: 'User Acceptance Test',
        phaseId: 4,
        estimates: {
            low: { days: 6, hours: 3, percentage: 0.0625 },
            medium: { days: 6, hours: 3, percentage: 0.0625 },
            high: { days: 6, hours: 3, percentage: 0.0625 },
        },
    },
    {
        id: 'T009',
        name: 'Deployment to Production',
        phaseId: 5,
        estimates: {
            low: { days: 2, hours: 1, percentage: 0.0625 },
            medium: { days: 4, hours: 2, percentage: 0.0625 },
            high: { days: 4, hours: 2, percentage: 0.0625 },
        },
    },
    {
        id: 'T010',
        name: 'Post-Deployment Support',
        phaseId: 6,
        estimates: {
            low: { days: 1, hours: 0.5, percentage: 0.0625 },
            medium: { days: 2, hours: 1, percentage: 0.0625 },
            high: { days: 2, hours: 1, percentage: 0.0625 },
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
