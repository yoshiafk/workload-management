/**
 * Application Context
 * Global state management using React Context + useReducer
 */

import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import {
    saveToStorage,
    loadFromStorage,
} from '../utils/storage';
import { migrateData, CURRENT_VERSION } from '../utils/migration';
import { recalculateAllocations } from '../utils/recalculate';
import { getHolidaysWithFallback } from '../utils/holidayService';
import {
    defaultTeamMembers,
    defaultPhases,
    defaultTaskTemplates,
    defaultResourceCosts,
    defaultComplexity,
    defaultHolidays,
    defaultCostCenters,
    defaultCOA,
} from '../data';

// Action Types
const ACTIONS = {
    // Data loading
    LOAD_DATA: 'LOAD_DATA',
    RESET_TO_DEFAULTS: 'RESET_TO_DEFAULTS',

    // Members
    ADD_MEMBER: 'ADD_MEMBER',
    UPDATE_MEMBER: 'UPDATE_MEMBER',
    DELETE_MEMBER: 'DELETE_MEMBER',
    SET_MEMBERS: 'SET_MEMBERS',

    // Phases
    ADD_PHASE: 'ADD_PHASE',
    UPDATE_PHASE: 'UPDATE_PHASE',
    DELETE_PHASE: 'DELETE_PHASE',
    SET_PHASES: 'SET_PHASES',

    // Tasks
    ADD_TASK: 'ADD_TASK',
    UPDATE_TASK: 'UPDATE_TASK',
    DELETE_TASK: 'DELETE_TASK',
    SET_TASKS: 'SET_TASKS',

    // Complexity
    UPDATE_COMPLEXITY: 'UPDATE_COMPLEXITY',
    SET_COMPLEXITY: 'SET_COMPLEXITY',

    // Costs
    ADD_COST: 'ADD_COST',
    UPDATE_COST: 'UPDATE_COST',
    DELETE_COST: 'DELETE_COST',
    SET_COSTS: 'SET_COSTS',

    // Holidays
    ADD_HOLIDAY: 'ADD_HOLIDAY',
    UPDATE_HOLIDAY: 'UPDATE_HOLIDAY',
    DELETE_HOLIDAY: 'DELETE_HOLIDAY',
    SET_HOLIDAYS: 'SET_HOLIDAYS',

    // Leaves
    ADD_LEAVE: 'ADD_LEAVE',
    UPDATE_LEAVE: 'UPDATE_LEAVE',
    DELETE_LEAVE: 'DELETE_LEAVE',
    SET_LEAVES: 'SET_LEAVES',

    // Allocations
    ADD_ALLOCATION: 'ADD_ALLOCATION',
    UPDATE_ALLOCATION: 'UPDATE_ALLOCATION',
    DELETE_ALLOCATION: 'DELETE_ALLOCATION',
    SET_ALLOCATIONS: 'SET_ALLOCATIONS',

    // Cost Centers
    ADD_COST_CENTER: 'ADD_COST_CENTER',
    UPDATE_COST_CENTER: 'UPDATE_COST_CENTER',
    DELETE_COST_CENTER: 'DELETE_COST_CENTER',
    SET_COST_CENTERS: 'SET_COST_CENTERS',

    // Chart of Accounts
    ADD_COA: 'ADD_COA',
    UPDATE_COA: 'UPDATE_COA',
    DELETE_COA: 'DELETE_COA',
    SET_COA: 'SET_COA',

    // Settings
    UPDATE_SETTINGS: 'UPDATE_SETTINGS',

    // UI State
    SET_DIALOG_STATE: 'SET_DIALOG_STATE',
};

// Initial State
const initialState = {
    members: [],
    phases: [],
    tasks: [],
    complexity: {},
    costs: [],
    holidays: [],
    leaves: [],
    allocations: [],
    costCenters: [],
    coa: [],
    settings: {
        currency: 'IDR',
        theme: 'dark',
        costTrackingByRole: {
            BA: true,
            PM: true,
            FULLSTACK: true,
            BACKEND: true,
            FRONTEND: true,
            QA: true,
            DEVOPS: false,
            UIUX: false,
        },
        costCenterSettings: {
            requireManagerApproval: false,
            allowBulkAssignment: true,
            trackAssignmentHistory: true,
        },
    },
    ui: {
        isDialogOpen: false,
    },
    isLoaded: false,
};

// Business rule validation constants
const VALIDATION_RULES = {
    COST_CENTER: {
        CODE: {
            MIN_LENGTH: 2,
            MAX_LENGTH: 10,
            PATTERN: /^[A-Z0-9_-]+$/,
            RESERVED_WORDS: ['ADMIN', 'SYSTEM', 'ROOT', 'DEFAULT', 'NULL', 'UNDEFINED']
        },
        NAME: {
            MIN_LENGTH: 2,
            MAX_LENGTH: 100,
            PATTERN: /^[a-zA-Z0-9\s\-_&().,]+$/,
            RESERVED_WORDS: ['ADMIN', 'SYSTEM', 'ROOT', 'DEFAULT']
        },
        DESCRIPTION: {
            MAX_LENGTH: 500,
            PATTERN: /^[a-zA-Z0-9\s\-_&().,;:!?'"]+$/
        },
        MANAGER: {
            MIN_LENGTH: 2,
            MAX_LENGTH: 100,
            PATTERN: /^[a-zA-Z\s\-'.]+$/
        }
    },
    COA: {
        CODE: {
            MIN_LENGTH: 3,
            MAX_LENGTH: 8,
            PATTERN: /^[0-9]+$/,
            RESERVED_CODES: ['0000', '9999', '0001', '9998']
        },
        NAME: {
            MIN_LENGTH: 3,
            MAX_LENGTH: 150,
            PATTERN: /^[a-zA-Z0-9\s\-_&().,]+$/,
            RESERVED_WORDS: ['SYSTEM', 'ADMIN', 'ROOT', 'DEFAULT']
        },
        DESCRIPTION: {
            MAX_LENGTH: 500,
            PATTERN: /^[a-zA-Z0-9\s\-_&().,;:!?'"]+$/
        }
    }
};

// Comprehensive business rule validation functions
function validateCostCenterCode(code, existingCostCenters = [], excludeId = null) {
    const errors = [];

    if (!code || !code.trim()) {
        errors.push('Code is required');
        return errors;
    }

    const trimmedCode = code.trim().toUpperCase();

    // Length validation
    if (trimmedCode.length < VALIDATION_RULES.COST_CENTER.CODE.MIN_LENGTH) {
        errors.push(`Code must be at least ${VALIDATION_RULES.COST_CENTER.CODE.MIN_LENGTH} characters long`);
    }
    if (trimmedCode.length > VALIDATION_RULES.COST_CENTER.CODE.MAX_LENGTH) {
        errors.push(`Code must not exceed ${VALIDATION_RULES.COST_CENTER.CODE.MAX_LENGTH} characters`);
    }

    // Format validation
    if (!VALIDATION_RULES.COST_CENTER.CODE.PATTERN.test(trimmedCode)) {
        errors.push('Code must contain only uppercase letters, numbers, underscores, and hyphens');
    }

    // Reserved words validation
    if (VALIDATION_RULES.COST_CENTER.CODE.RESERVED_WORDS.includes(trimmedCode)) {
        errors.push(`"${trimmedCode}" is a reserved word and cannot be used as a code`);
    }

    // Uniqueness validation
    const duplicate = existingCostCenters.find(cc =>
        cc.code.toUpperCase() === trimmedCode && cc.id !== excludeId
    );
    if (duplicate) {
        errors.push('Code must be unique');
    }

    return errors;
}

function validateCostCenterName(name) {
    const errors = [];

    if (!name || !name.trim()) {
        errors.push('Name is required');
        return errors;
    }

    const trimmedName = name.trim();

    // Length validation
    if (trimmedName.length < VALIDATION_RULES.COST_CENTER.NAME.MIN_LENGTH) {
        errors.push(`Name must be at least ${VALIDATION_RULES.COST_CENTER.NAME.MIN_LENGTH} characters long`);
    }
    if (trimmedName.length > VALIDATION_RULES.COST_CENTER.NAME.MAX_LENGTH) {
        errors.push(`Name must not exceed ${VALIDATION_RULES.COST_CENTER.NAME.MAX_LENGTH} characters`);
    }

    // Format validation
    if (!VALIDATION_RULES.COST_CENTER.NAME.PATTERN.test(trimmedName)) {
        errors.push('Name contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed');
    }

    // Reserved words validation
    const upperName = trimmedName.toUpperCase();
    if (VALIDATION_RULES.COST_CENTER.NAME.RESERVED_WORDS.some(word => upperName.includes(word))) {
        errors.push('Name cannot contain reserved words (ADMIN, SYSTEM, ROOT, DEFAULT)');
    }

    return errors;
}

function validateCostCenterDescription(description) {
    const errors = [];

    if (!description) return errors; // Description is optional

    const trimmedDescription = description.trim();

    // Length validation
    if (trimmedDescription.length > VALIDATION_RULES.COST_CENTER.DESCRIPTION.MAX_LENGTH) {
        errors.push(`Description must not exceed ${VALIDATION_RULES.COST_CENTER.DESCRIPTION.MAX_LENGTH} characters`);
    }

    // Format validation
    if (trimmedDescription && !VALIDATION_RULES.COST_CENTER.DESCRIPTION.PATTERN.test(trimmedDescription)) {
        errors.push('Description contains invalid characters');
    }

    return errors;
}

function validateCostCenterManager(manager, teamMembers = []) {
    const errors = [];

    if (!manager || !manager.trim()) {
        errors.push('Manager is required');
        return errors;
    }

    const trimmedManager = manager.trim();

    // Length validation
    if (trimmedManager.length < VALIDATION_RULES.COST_CENTER.MANAGER.MIN_LENGTH) {
        errors.push(`Manager name must be at least ${VALIDATION_RULES.COST_CENTER.MANAGER.MIN_LENGTH} characters long`);
    }
    if (trimmedManager.length > VALIDATION_RULES.COST_CENTER.MANAGER.MAX_LENGTH) {
        errors.push(`Manager name must not exceed ${VALIDATION_RULES.COST_CENTER.MANAGER.MAX_LENGTH} characters`);
    }

    // Format validation
    if (!VALIDATION_RULES.COST_CENTER.MANAGER.PATTERN.test(trimmedManager)) {
        errors.push('Manager name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed');
    }

    // Note: Removed manager existence validation - managers can be external to team members

    return errors;
}

function validateCostCenterBudget(monthlyBudget, yearlyBudget) {
    const errors = [];

    // Monthly budget validation (optional)
    if (monthlyBudget !== undefined && monthlyBudget !== null && monthlyBudget !== '') {
        const monthly = Number(monthlyBudget);
        if (isNaN(monthly) || monthly < 0) {
            errors.push('Monthly budget must be a positive number');
        }
        if (monthly > 999999999999) { // 999 billion IDR limit
            errors.push('Monthly budget exceeds maximum limit (999 billion IDR)');
        }
    }

    // Yearly budget validation (optional)
    if (yearlyBudget !== undefined && yearlyBudget !== null && yearlyBudget !== '') {
        const yearly = Number(yearlyBudget);
        if (isNaN(yearly) || yearly < 0) {
            errors.push('Yearly budget must be a positive number');
        }
        if (yearly > 9999999999999) { // 9.9 trillion IDR limit
            errors.push('Yearly budget exceeds maximum limit (9.9 trillion IDR)');
        }
    }

    // Cross-validation: yearly should be roughly 12x monthly (with some tolerance)
    if (monthlyBudget && yearlyBudget) {
        const monthly = Number(monthlyBudget);
        const yearly = Number(yearlyBudget);
        const expectedYearly = monthly * 12;
        const tolerance = 0.2; // 20% tolerance

        if (yearly < expectedYearly * (1 - tolerance) || yearly > expectedYearly * (1 + tolerance)) {
            errors.push('Yearly budget should be approximately 12 times the monthly budget');
        }
    }

    return errors;
}

function validateBudgetPeriod(budgetPeriod) {
    const errors = [];

    if (!budgetPeriod) return errors; // Optional field

    const trimmedPeriod = budgetPeriod.trim();

    // Format validation (YYYY)
    if (!/^\d{4}$/.test(trimmedPeriod)) {
        errors.push('Budget period must be a 4-digit year (e.g., 2024)');
    }

    // Range validation
    const year = parseInt(trimmedPeriod);
    const currentYear = new Date().getFullYear();
    if (year < 2020 || year > currentYear + 10) {
        errors.push(`Budget period must be between 2020 and ${currentYear + 10}`);
    }

    return errors;
}

function validateCOACode(code, existingCOA = [], excludeId = null) {
    const errors = [];

    if (!code || !code.trim()) {
        errors.push('Code is required');
        return errors;
    }

    const trimmedCode = code.trim();

    // Length validation
    if (trimmedCode.length < VALIDATION_RULES.COA.CODE.MIN_LENGTH) {
        errors.push(`Code must be at least ${VALIDATION_RULES.COA.CODE.MIN_LENGTH} characters long`);
    }
    if (trimmedCode.length > VALIDATION_RULES.COA.CODE.MAX_LENGTH) {
        errors.push(`Code must not exceed ${VALIDATION_RULES.COA.CODE.MAX_LENGTH} characters`);
    }

    // Format validation (numeric only)
    if (!VALIDATION_RULES.COA.CODE.PATTERN.test(trimmedCode)) {
        errors.push('Code must contain only numbers');
    }

    // Reserved codes validation
    if (VALIDATION_RULES.COA.CODE.RESERVED_CODES.includes(trimmedCode)) {
        errors.push(`"${trimmedCode}" is a reserved code and cannot be used`);
    }

    // Uniqueness validation
    const duplicate = existingCOA.find(coa =>
        coa.code === trimmedCode && coa.id !== excludeId
    );
    if (duplicate) {
        errors.push('Code must be unique');
    }

    return errors;
}

function validateCOAName(name) {
    const errors = [];

    if (!name || !name.trim()) {
        errors.push('Name is required');
        return errors;
    }

    const trimmedName = name.trim();

    // Length validation
    if (trimmedName.length < VALIDATION_RULES.COA.NAME.MIN_LENGTH) {
        errors.push(`Name must be at least ${VALIDATION_RULES.COA.NAME.MIN_LENGTH} characters long`);
    }
    if (trimmedName.length > VALIDATION_RULES.COA.NAME.MAX_LENGTH) {
        errors.push(`Name must not exceed ${VALIDATION_RULES.COA.NAME.MAX_LENGTH} characters`);
    }

    // Format validation
    if (!VALIDATION_RULES.COA.NAME.PATTERN.test(trimmedName)) {
        errors.push('Name contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed');
    }

    // Reserved words validation
    const upperName = trimmedName.toUpperCase();
    if (VALIDATION_RULES.COA.NAME.RESERVED_WORDS.some(word => upperName.includes(word))) {
        errors.push('Name cannot contain reserved words (SYSTEM, ADMIN, ROOT, DEFAULT)');
    }

    return errors;
}

function validateCOADescription(description) {
    const errors = [];

    if (!description) return errors; // Description is optional

    const trimmedDescription = description.trim();

    // Length validation
    if (trimmedDescription.length > VALIDATION_RULES.COA.DESCRIPTION.MAX_LENGTH) {
        errors.push(`Description must not exceed ${VALIDATION_RULES.COA.DESCRIPTION.MAX_LENGTH} characters`);
    }

    // Format validation
    if (trimmedDescription && !VALIDATION_RULES.COA.DESCRIPTION.PATTERN.test(trimmedDescription)) {
        errors.push('Description contains invalid characters');
    }

    return errors;
}

function validateCOACategory(category) {
    const errors = [];
    const validCategories = ['Expense', 'Revenue', 'Asset', 'Liability'];

    if (!category || !category.trim()) {
        errors.push('Category is required');
        return errors;
    }

    if (!validCategories.includes(category)) {
        errors.push(`Category must be one of: ${validCategories.join(', ')}`);
    }

    return errors;
}

// Helper functions for hierarchical cost center validation
function hasCircularReference(costCenters, costCenterId, parentId) {
    if (!parentId || costCenterId === parentId) return true;

    const visited = new Set();
    let currentId = parentId;

    while (currentId && !visited.has(currentId)) {
        if (currentId === costCenterId) return true;
        visited.add(currentId);

        const current = costCenters.find(cc => cc.id === currentId);
        currentId = current?.parentCostCenterId;
    }

    return false;
}

function getHierarchyDepth(costCenters, costCenterId) {
    let depth = 1;
    let currentId = costCenterId;

    while (currentId) {
        const current = costCenters.find(cc => cc.id === currentId);
        if (!current?.parentCostCenterId) break;

        currentId = current.parentCostCenterId;
        depth++;

        // Prevent infinite loops
        if (depth > 10) break;
    }

    return depth;
}

function validateParentCostCenter(costCenters, parentId) {
    if (!parentId) return true; // No parent is valid

    const parent = costCenters.find(cc => cc.id === parentId);
    if (!parent) return false; // Parent must exist
    if (!parent.isActive) return false; // Parent must be active

    return true;
}

// Reducer
function appReducer(state, action) {
    switch (action.type) {
        case ACTIONS.LOAD_DATA:
            return {
                ...state,
                ...action.payload,
                isLoaded: true,
            };

        case ACTIONS.RESET_TO_DEFAULTS:
            return {
                ...state,
                members: defaultTeamMembers,
                phases: defaultPhases,
                tasks: defaultTaskTemplates,
                complexity: defaultComplexity,
                costs: defaultResourceCosts,
                holidays: defaultHolidays,
                costCenters: defaultCostCenters,
                coa: defaultCOA,
                leaves: [],
                allocations: [],
                isLoaded: true,
            };

        // Members
        case ACTIONS.SET_MEMBERS:
            return { ...state, members: action.payload };
        case ACTIONS.ADD_MEMBER:
            return { ...state, members: [...state.members, action.payload] };
        case ACTIONS.UPDATE_MEMBER:
            return {
                ...state,
                members: state.members.map(m =>
                    m.id === action.payload.id ? action.payload : m
                ),
            };
        case ACTIONS.DELETE_MEMBER:
            return {
                ...state,
                members: state.members.filter(m => m.id !== action.payload),
            };

        // Phases
        case ACTIONS.SET_PHASES:
            return { ...state, phases: action.payload };
        case ACTIONS.ADD_PHASE:
            return { ...state, phases: [...state.phases, action.payload] };
        case ACTIONS.UPDATE_PHASE:
            return {
                ...state,
                phases: state.phases.map(p =>
                    p.id === action.payload.id ? action.payload : p
                ),
            };
        case ACTIONS.DELETE_PHASE:
            return {
                ...state,
                phases: state.phases.filter(p => p.id !== action.payload),
            };

        // Tasks
        case ACTIONS.SET_TASKS:
            return { ...state, tasks: action.payload };
        case ACTIONS.ADD_TASK:
            return { ...state, tasks: [...state.tasks, action.payload] };
        case ACTIONS.UPDATE_TASK:
            return {
                ...state,
                tasks: state.tasks.map(t =>
                    t.id === action.payload.id ? action.payload : t
                ),
            };
        case ACTIONS.DELETE_TASK:
            return {
                ...state,
                tasks: state.tasks.filter(t => t.id !== action.payload),
            };

        // Complexity
        case ACTIONS.SET_COMPLEXITY:
            return { ...state, complexity: action.payload };
        case ACTIONS.UPDATE_COMPLEXITY:
            return {
                ...state,
                complexity: { ...state.complexity, ...action.payload },
            };

        // Costs
        case ACTIONS.SET_COSTS:
            return { ...state, costs: action.payload };
        case ACTIONS.ADD_COST:
            return { ...state, costs: [...state.costs, action.payload] };
        case ACTIONS.UPDATE_COST:
            return {
                ...state,
                costs: state.costs.map(c =>
                    c.id === action.payload.id ? action.payload : c
                ),
            };
        case ACTIONS.DELETE_COST:
            return {
                ...state,
                costs: state.costs.filter(c => c.id !== action.payload),
            };

        // Holidays
        case ACTIONS.SET_HOLIDAYS:
            return { ...state, holidays: action.payload };
        case ACTIONS.ADD_HOLIDAY:
            return { ...state, holidays: [...state.holidays, action.payload] };
        case ACTIONS.UPDATE_HOLIDAY:
            return {
                ...state,
                holidays: state.holidays.map(h =>
                    h.id === action.payload.id ? action.payload : h
                ),
            };
        case ACTIONS.DELETE_HOLIDAY:
            return {
                ...state,
                holidays: state.holidays.filter(h => h.id !== action.payload),
            };

        // Leaves
        case ACTIONS.SET_LEAVES:
            return { ...state, leaves: action.payload };
        case ACTIONS.ADD_LEAVE:
            return { ...state, leaves: [...state.leaves, action.payload] };
        case ACTIONS.UPDATE_LEAVE:
            return {
                ...state,
                leaves: state.leaves.map(l =>
                    l.id === action.payload.id ? action.payload : l
                ),
            };
        case ACTIONS.DELETE_LEAVE:
            return {
                ...state,
                leaves: state.leaves.filter(l => l.id !== action.payload),
            };

        // Allocations
        case ACTIONS.SET_ALLOCATIONS:
            return { ...state, allocations: action.payload };
        case ACTIONS.ADD_ALLOCATION:
            return { ...state, allocations: [...state.allocations, action.payload] };
        case ACTIONS.UPDATE_ALLOCATION:
            return {
                ...state,
                allocations: state.allocations.map(a =>
                    a.id === action.payload.id ? action.payload : a
                ),
            };
        case ACTIONS.DELETE_ALLOCATION:
            return {
                ...state,
                allocations: state.allocations.filter(a => a.id !== action.payload),
            };

        // Cost Centers
        case ACTIONS.SET_COST_CENTERS:
            return { ...state, costCenters: action.payload };
        case ACTIONS.ADD_COST_CENTER:
            // Comprehensive business rule validation
            const codeErrors = validateCostCenterCode(action.payload.code, state.costCenters);
            const nameErrors = validateCostCenterName(action.payload.name);
            const descriptionErrors = validateCostCenterDescription(action.payload.description);
            const managerErrors = validateCostCenterManager(action.payload.manager, state.members);
            const budgetErrors = validateCostCenterBudget(action.payload.monthlyBudget, action.payload.yearlyBudget);
            const budgetPeriodErrors = validateBudgetPeriod(action.payload.budgetPeriod);

            const allErrors = [...codeErrors, ...nameErrors, ...descriptionErrors, ...managerErrors, ...budgetErrors, ...budgetPeriodErrors];
            if (allErrors.length > 0) {
                throw new Error(allErrors.join('; '));
            }

            // Validate parent cost center if specified
            if (action.payload.parentCostCenterId) {
                if (!validateParentCostCenter(state.costCenters, action.payload.parentCostCenterId)) {
                    throw new Error('Invalid parent cost center: parent must exist and be active');
                }

                // Check for circular reference
                if (hasCircularReference(state.costCenters, action.payload.id, action.payload.parentCostCenterId)) {
                    throw new Error('Circular reference detected in cost center hierarchy');
                }

                // Check hierarchy depth limit (max 5 levels)
                const newCostCenters = [...state.costCenters, action.payload];
                if (getHierarchyDepth(newCostCenters, action.payload.id) > 5) {
                    throw new Error('Maximum hierarchy depth of 5 levels exceeded');
                }
            }

            return {
                ...state,
                costCenters: [...state.costCenters, {
                    ...action.payload,
                    code: action.payload.code.trim().toUpperCase(),
                    name: action.payload.name.trim(),
                    description: action.payload.description?.trim() || '',
                    manager: action.payload.manager.trim(),
                    monthlyBudget: Number(action.payload.monthlyBudget) || 0,
                    yearlyBudget: Number(action.payload.yearlyBudget) || 0,
                    actualMonthlyCost: 0, // Initialize actual costs
                    actualYearlyCost: 0,
                    budgetPeriod: action.payload.budgetPeriod || new Date().getFullYear().toString(),
                    createdAt: action.payload.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }]
            };
        case ACTIONS.UPDATE_COST_CENTER:
            // Comprehensive business rule validation
            const updateCodeErrors = validateCostCenterCode(action.payload.code, state.costCenters, action.payload.id);
            const updateNameErrors = validateCostCenterName(action.payload.name);
            const updateDescriptionErrors = validateCostCenterDescription(action.payload.description);
            const updateManagerErrors = validateCostCenterManager(action.payload.manager, state.members);
            const updateBudgetErrors = validateCostCenterBudget(action.payload.monthlyBudget, action.payload.yearlyBudget);
            const updateBudgetPeriodErrors = validateBudgetPeriod(action.payload.budgetPeriod);

            const updateAllErrors = [...updateCodeErrors, ...updateNameErrors, ...updateDescriptionErrors, ...updateManagerErrors, ...updateBudgetErrors, ...updateBudgetPeriodErrors];
            if (updateAllErrors.length > 0) {
                throw new Error(updateAllErrors.join('; '));
            }

            // Validate parent cost center if specified
            if (action.payload.parentCostCenterId) {
                if (!validateParentCostCenter(state.costCenters, action.payload.parentCostCenterId)) {
                    throw new Error('Invalid parent cost center: parent must exist and be active');
                }

                // Check for circular reference
                if (hasCircularReference(state.costCenters, action.payload.id, action.payload.parentCostCenterId)) {
                    throw new Error('Circular reference detected in cost center hierarchy');
                }

                // Check hierarchy depth limit
                const updatedCostCenters = state.costCenters.map(cc =>
                    cc.id === action.payload.id ? action.payload : cc
                );
                if (getHierarchyDepth(updatedCostCenters, action.payload.id) > 5) {
                    throw new Error('Maximum hierarchy depth of 5 levels exceeded');
                }
            }

            return {
                ...state,
                costCenters: state.costCenters.map(cc =>
                    cc.id === action.payload.id ? {
                        ...action.payload,
                        code: action.payload.code.trim().toUpperCase(),
                        name: action.payload.name.trim(),
                        description: action.payload.description?.trim() || '',
                        manager: action.payload.manager.trim(),
                        monthlyBudget: Number(action.payload.monthlyBudget) || 0,
                        yearlyBudget: Number(action.payload.yearlyBudget) || 0,
                        budgetPeriod: action.payload.budgetPeriod || new Date().getFullYear().toString(),
                        // Preserve actual costs during updates
                        actualMonthlyCost: cc.actualMonthlyCost || 0,
                        actualYearlyCost: cc.actualYearlyCost || 0,
                        updatedAt: new Date().toISOString(),
                    } : cc
                ),
            };
        case ACTIONS.DELETE_COST_CENTER:
            // Check if cost center has children
            const hasChildren = state.costCenters.some(cc => cc.parentCostCenterId === action.payload);
            if (hasChildren) {
                throw new Error('Cannot delete cost center with child cost centers. Please reassign or delete child cost centers first.');
            }

            // Check if cost center has active team member assignments
            const hasActiveAssignments = state.members?.some(member => member.costCenterId === action.payload);
            if (hasActiveAssignments) {
                throw new Error('Cannot delete cost center with active team member assignments. Please reassign team members first.');
            }

            return {
                ...state,
                costCenters: state.costCenters.filter(cc => cc.id !== action.payload),
            };

        // Chart of Accounts
        case ACTIONS.SET_COA:
            return { ...state, coa: action.payload };
        case ACTIONS.ADD_COA:
            // Comprehensive business rule validation
            const coaCodeErrors = validateCOACode(action.payload.code, state.coa);
            const coaNameErrors = validateCOAName(action.payload.name);
            const coaDescriptionErrors = validateCOADescription(action.payload.description);
            const coaCategoryErrors = validateCOACategory(action.payload.category);

            const coaAllErrors = [...coaCodeErrors, ...coaNameErrors, ...coaDescriptionErrors, ...coaCategoryErrors];
            if (coaAllErrors.length > 0) {
                throw new Error(coaAllErrors.join('; '));
            }

            return {
                ...state,
                coa: [...state.coa, {
                    ...action.payload,
                    code: action.payload.code.trim(),
                    name: action.payload.name.trim(),
                    description: action.payload.description?.trim() || '',
                    createdAt: action.payload.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }]
            };
        case ACTIONS.UPDATE_COA:
            // Comprehensive business rule validation
            const updateCOACodeErrors = validateCOACode(action.payload.code, state.coa, action.payload.id);
            const updateCOANameErrors = validateCOAName(action.payload.name);
            const updateCOADescriptionErrors = validateCOADescription(action.payload.description);
            const updateCOACategoryErrors = validateCOACategory(action.payload.category);

            const updateCOAAllErrors = [...updateCOACodeErrors, ...updateCOANameErrors, ...updateCOADescriptionErrors, ...updateCOACategoryErrors];
            if (updateCOAAllErrors.length > 0) {
                throw new Error(updateCOAAllErrors.join('; '));
            }

            return {
                ...state,
                coa: state.coa.map(c =>
                    c.id === action.payload.id ? {
                        ...action.payload,
                        code: action.payload.code.trim(),
                        name: action.payload.name.trim(),
                        description: action.payload.description?.trim() || '',
                        updatedAt: new Date().toISOString(),
                    } : c
                ),
            };
        case ACTIONS.DELETE_COA:
            return {
                ...state,
                coa: state.coa.filter(c => c.id !== action.payload),
            };

        // Settings
        case ACTIONS.UPDATE_SETTINGS:
            return {
                ...state,
                settings: { ...state.settings, ...action.payload },
            };

        case ACTIONS.SET_DIALOG_STATE:
            return {
                ...state,
                ui: {
                    ...state.ui,
                    isDialogOpen: action.payload,
                },
            };

        default:
            return state;
    }
}

// Context
const AppContext = createContext(null);

// Provider Component
export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Load data from localStorage on mount
    useEffect(() => {
        // Load initial data
        const loadData = async () => {
            // Run migrations first to ensure data schema is up-to-date
            try {
                const migrationResult = migrateData();
                if (migrationResult.migrated) {
                    console.log(`[AppContext] Data migrated from v${migrationResult.from} to v${migrationResult.version}`);
                }
            } catch (error) {
                console.error('[AppContext] Migration failed:', error);
            }

            // Load data after migrations
            const members = loadFromStorage('members', null);
            const phases = loadFromStorage('phases', null);
            const tasks = loadFromStorage('tasks', null);
            const complexity = loadFromStorage('complexity', null);
            const costs = loadFromStorage('costs', null);
            const holidays = loadFromStorage('holidays', null);
            const leaves = loadFromStorage('leaves', []);
            const allocations = loadFromStorage('allocations', []);
            const costCenters = loadFromStorage('costCenters', null);
            const coa = loadFromStorage('coa', null);
            const settings = loadFromStorage('settings', initialState.settings);

            // Fetch holidays from API (with cache and fallback)
            const fetchedHolidays = await getHolidaysWithFallback();

            // If no data exists, load defaults
            if (!members || members.length === 0) {
                dispatch({ type: ACTIONS.RESET_TO_DEFAULTS });
                // Override holidays with fetched data
                dispatch({ type: ACTIONS.SET_HOLIDAYS, payload: fetchedHolidays });
                // Save initial version
                saveToStorage('version', CURRENT_VERSION);
            } else {
                dispatch({
                    type: ACTIONS.LOAD_DATA,
                    payload: {
                        members,
                        phases: phases || defaultPhases,
                        tasks: tasks || defaultTaskTemplates,
                        // Merge default complexity with stored to ensure new levels are included
                        complexity: { ...defaultComplexity, ...complexity },
                        costs: costs || defaultResourceCosts,
                        holidays: fetchedHolidays,
                        leaves,
                        allocations,
                        costCenters: costCenters || defaultCostCenters,
                        coa: coa || defaultCOA,
                        settings,
                    },
                });
            }
        };

        loadData();
    }, []);

    // Persist to localStorage on state change
    useEffect(() => {
        if (!state.isLoaded) return;

        saveToStorage('members', state.members);
        saveToStorage('phases', state.phases);
        saveToStorage('tasks', state.tasks);
        saveToStorage('complexity', state.complexity);
        saveToStorage('costs', state.costs);
        saveToStorage('holidays', state.holidays);
        saveToStorage('leaves', state.leaves);
        saveToStorage('allocations', state.allocations);
        saveToStorage('costCenters', state.costCenters);
        saveToStorage('coa', state.coa);
        saveToStorage('settings', state.settings);
    }, [state]);

    // Track previous values for auto-recalculation
    const prevCostsRef = useRef(state.costs);
    const prevComplexityRef = useRef(state.complexity);
    const prevTasksRef = useRef(state.tasks);
    const prevHolidaysRef = useRef(state.holidays);
    const prevLeavesRef = useRef(state.leaves);
    const prevMembersRef = useRef(state.members);
    const prevCostCentersRef = useRef(state.costCenters);

    // Auto-recalculate allocations when dependencies change
    useEffect(() => {
        if (!state.isLoaded || state.allocations.length === 0) return;

        // Check if any relevant dependencies changed
        const costsChanged = prevCostsRef.current !== state.costs;
        const complexityChanged = prevComplexityRef.current !== state.complexity;
        const tasksChanged = prevTasksRef.current !== state.tasks;
        const holidaysChanged = prevHolidaysRef.current !== state.holidays;
        const leavesChanged = prevLeavesRef.current !== state.leaves;
        const membersChanged = prevMembersRef.current !== state.members;
        const costCentersChanged = prevCostCentersRef.current !== state.costCenters;

        if (costsChanged || complexityChanged || tasksChanged || holidaysChanged || leavesChanged || membersChanged || costCentersChanged) {
            // Update refs
            prevCostsRef.current = state.costs;
            prevComplexityRef.current = state.complexity;
            prevTasksRef.current = state.tasks;
            prevHolidaysRef.current = state.holidays;
            prevLeavesRef.current = state.leaves;
            prevMembersRef.current = state.members;
            prevCostCentersRef.current = state.costCenters;

            // Recalculate all allocations
            const updatedAllocations = recalculateAllocations(
                state.allocations,
                state.complexity,
                state.costs,
                state.tasks,
                state.holidays,
                state.leaves,
                state.members,
                state.costCenters,
                state.coa
            );

            // Only dispatch if there are actual changes
            const hasChanges = updatedAllocations.some((updated, i) => {
                const original = state.allocations[i];
                return (
                    updated.plan?.costProject !== original.plan?.costProject ||
                    updated.plan?.costMonthly !== original.plan?.costMonthly ||
                    updated.plan?.taskEnd !== original.plan?.taskEnd ||
                    updated.workload !== original.workload ||
                    updated.costCenterId !== original.costCenterId ||
                    JSON.stringify(updated.costCenterSnapshot) !== JSON.stringify(original.costCenterSnapshot) ||
                    updated.coaId !== original.coaId ||
                    JSON.stringify(updated.coaSnapshot) !== JSON.stringify(original.coaSnapshot)
                );
            });

            if (hasChanges) {
                console.log('[AppContext] Auto-recalculating allocations due to dependency changes');
                dispatch({ type: ACTIONS.SET_ALLOCATIONS, payload: updatedAllocations });
            }
        }
    }, [state.costs, state.complexity, state.tasks, state.holidays, state.leaves, state.members, state.costCenters, state.coa, state.allocations, state.isLoaded]);

    return (
        <AppContext.Provider value={{ state, dispatch, ACTIONS }}>
            {children}
        </AppContext.Provider>
    );
}

// Custom hook to use the context
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

export { ACTIONS };
export default AppContext;
