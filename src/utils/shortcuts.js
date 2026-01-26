/**
 * Keyboard Shortcuts Registry
 * Central registry for all application keyboard shortcuts
 */

/**
 * Detect if user is on Mac
 */
export const isMac = typeof navigator !== 'undefined'
    ? navigator.platform.toUpperCase().indexOf('MAC') >= 0
    : false;

/**
 * Get modifier key symbol based on platform
 */
export const getModifierKey = () => isMac ? '⌘' : 'Ctrl';

/**
 * Application-wide keyboard shortcuts
 */
export const APP_SHORTCUTS = {
    // Navigation
    COMMAND_PALETTE: {
        key: 'k',
        meta: true,
        description: 'Open command palette',
        category: 'navigation',
    },
    TOGGLE_SIDEBAR: {
        key: 'b',
        meta: true,
        description: 'Toggle sidebar',
        category: 'navigation',
    },
    GO_HOME: {
        key: 'h',
        meta: true,
        shift: true,
        description: 'Go to dashboard',
        category: 'navigation',
    },

    // Actions
    NEW_ALLOCATION: {
        key: 'n',
        description: 'New allocation',
        category: 'action',
    },
    NEW_COST_CENTER: {
        key: 'n',
        description: 'New cost center (when on cost centers page)',
        category: 'action',
    },
    NEW_COA_ENTRY: {
        key: 'n',
        description: 'New chart of accounts entry (when on COA page)',
        category: 'action',
    },
    SEARCH: {
        key: '/',
        description: 'Focus search',
        category: 'navigation',
    },
    HELP: {
        key: '?',
        description: 'Show keyboard shortcuts',
        category: 'help',
    },

    // Editing
    SAVE: {
        key: 's',
        meta: true,
        description: 'Save changes',
        category: 'edit',
    },
    CANCEL: {
        key: 'Escape',
        description: 'Cancel / Close modal',
        category: 'action',
    },
    DELETE: {
        key: 'Backspace',
        meta: true,
        description: 'Delete selected',
        category: 'edit',
    },

    // View
    TOGGLE_DENSITY: {
        key: 'd',
        meta: true,
        shift: true,
        description: 'Toggle density mode',
        category: 'view',
    },
};

/**
 * Format a shortcut for display
 * @param {Object} shortcut - Shortcut definition
 * @returns {string} Formatted shortcut string (e.g., "⌘K" or "Ctrl+K")
 */
export function formatShortcut(shortcut) {
    if (!shortcut) return '';

    const parts = [];

    if (shortcut.meta) {
        parts.push(getModifierKey());
    }
    if (shortcut.shift) {
        parts.push('⇧');
    }
    if (shortcut.alt) {
        parts.push(isMac ? '⌥' : 'Alt');
    }

    // Format special keys
    let key = shortcut.key;
    if (key === 'Escape') key = 'Esc';
    if (key === 'Backspace') key = '⌫';
    if (key === 'Enter') key = '↵';
    if (key === 'ArrowUp') key = '↑';
    if (key === 'ArrowDown') key = '↓';
    if (key === 'ArrowLeft') key = '←';
    if (key === 'ArrowRight') key = '→';

    parts.push(key.toUpperCase());

    return parts.join(isMac ? '' : '+');
}

/**
 * Get shortcuts grouped by category
 * @returns {Object} Shortcuts grouped by category
 */
export function getShortcutsByCategory() {
    const categories = {};

    for (const [id, shortcut] of Object.entries(APP_SHORTCUTS)) {
        const category = shortcut.category || 'other';
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push({
            id,
            ...shortcut,
            formatted: formatShortcut(shortcut),
        });
    }

    return categories;
}

/**
 * Category display names
 */
export const CATEGORY_NAMES = {
    navigation: 'Navigation',
    action: 'Actions',
    edit: 'Editing',
    view: 'View',
    help: 'Help',
    other: 'Other',
};
