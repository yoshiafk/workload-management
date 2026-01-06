/**
 * Application Context
 * Global state management using React Context + useReducer
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import {
    saveToStorage,
    loadFromStorage,
} from '../utils/storage';
import {
    defaultTeamMembers,
    defaultPhases,
    defaultTaskTemplates,
    defaultResourceCosts,
    defaultComplexity,
    defaultHolidays,
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

    // Settings
    UPDATE_SETTINGS: 'UPDATE_SETTINGS',
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
    settings: {
        currency: 'IDR',
        theme: 'dark',
    },
    isLoaded: false,
};

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

        // Settings
        case ACTIONS.UPDATE_SETTINGS:
            return {
                ...state,
                settings: { ...state.settings, ...action.payload },
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
        const members = loadFromStorage('members', null);
        const phases = loadFromStorage('phases', null);
        const tasks = loadFromStorage('tasks', null);
        const complexity = loadFromStorage('complexity', null);
        const costs = loadFromStorage('costs', null);
        const holidays = loadFromStorage('holidays', null);
        const leaves = loadFromStorage('leaves', []);
        const allocations = loadFromStorage('allocations', []);
        const settings = loadFromStorage('settings', { currency: 'IDR', theme: 'dark' });

        // If no data exists, load defaults
        if (!members || members.length === 0) {
            dispatch({ type: ACTIONS.RESET_TO_DEFAULTS });
        } else {
            dispatch({
                type: ACTIONS.LOAD_DATA,
                payload: {
                    members,
                    phases: phases || defaultPhases,
                    tasks: tasks || defaultTaskTemplates,
                    complexity: complexity || defaultComplexity,
                    costs: costs || defaultResourceCosts,
                    holidays: holidays || defaultHolidays,
                    leaves,
                    allocations,
                    settings,
                },
            });
        }
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
        saveToStorage('settings', state.settings);
    }, [state]);

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
