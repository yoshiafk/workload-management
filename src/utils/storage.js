/**
 * LocalStorage Utilities
 * Handle data persistence, import/export
 */

const STORAGE_PREFIX = 'wrm_';

const STORAGE_KEYS = {
    members: `${STORAGE_PREFIX}members`,
    phases: `${STORAGE_PREFIX}phases`,
    tasks: `${STORAGE_PREFIX}tasks`,
    complexity: `${STORAGE_PREFIX}complexity`,
    costs: `${STORAGE_PREFIX}costs`,
    holidays: `${STORAGE_PREFIX}holidays`,
    leaves: `${STORAGE_PREFIX}leaves`,
    allocations: `${STORAGE_PREFIX}allocations`,
    settings: `${STORAGE_PREFIX}settings`,
    version: `${STORAGE_PREFIX}version`,
};

/**
 * Save data to localStorage
 * 
 * @param {string} key - Storage key (without prefix)
 * @param {any} data - Data to save
 */
export function saveToStorage(key, data) {
    try {
        const storageKey = STORAGE_KEYS[key] || `${STORAGE_PREFIX}${key}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to localStorage: ${key}`, error);
    }
}

/**
 * Load data from localStorage
 * 
 * @param {string} key - Storage key (without prefix)
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Parsed data or default value
 */
export function loadFromStorage(key, defaultValue = null) {
    try {
        const storageKey = STORAGE_KEYS[key] || `${STORAGE_PREFIX}${key}`;
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error loading from localStorage: ${key}`, error);
        return defaultValue;
    }
}

/**
 * Remove data from localStorage
 * 
 * @param {string} key - Storage key (without prefix)
 */
export function removeFromStorage(key) {
    try {
        const storageKey = STORAGE_KEYS[key] || `${STORAGE_PREFIX}${key}`;
        localStorage.removeItem(storageKey);
    } catch (error) {
        console.error(`Error removing from localStorage: ${key}`, error);
    }
}

/**
 * Clear all app data from localStorage
 */
export function clearAllStorage() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.error('Error clearing localStorage', error);
    }
}

/**
 * Export all data as JSON
 * 
 * @returns {Object} All app data
 */
export function exportAllData() {
    const data = {
        exportDate: new Date().toISOString(),
        version: loadFromStorage('version', '1.0.0'),
        members: loadFromStorage('members', []),
        phases: loadFromStorage('phases', []),
        tasks: loadFromStorage('tasks', []),
        complexity: loadFromStorage('complexity', {}),
        costs: loadFromStorage('costs', []),
        holidays: loadFromStorage('holidays', []),
        leaves: loadFromStorage('leaves', []),
        allocations: loadFromStorage('allocations', []),
        settings: loadFromStorage('settings', {}),
    };

    return data;
}

/**
 * Download data as JSON file
 * 
 * @param {string} filename - File name (without extension)
 */
export function downloadAsJson(filename = 'wrm-export') {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Import data from JSON
 * 
 * @param {Object} data - Data to import
 * @returns {boolean} Success status
 */
export function importData(data) {
    try {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
        }

        // Save each data type if present
        if (data.members) saveToStorage('members', data.members);
        if (data.phases) saveToStorage('phases', data.phases);
        if (data.tasks) saveToStorage('tasks', data.tasks);
        if (data.complexity) saveToStorage('complexity', data.complexity);
        if (data.costs) saveToStorage('costs', data.costs);
        if (data.holidays) saveToStorage('holidays', data.holidays);
        if (data.leaves) saveToStorage('leaves', data.leaves);
        if (data.allocations) saveToStorage('allocations', data.allocations);
        if (data.settings) saveToStorage('settings', data.settings);
        if (data.version) saveToStorage('version', data.version);

        return true;
    } catch (error) {
        console.error('Error importing data', error);
        return false;
    }
}

/**
 * Read JSON file from input
 * 
 * @param {File} file - File object from input
 * @returns {Promise<Object>} Parsed JSON data
 */
export function readJsonFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Error reading file'));
        };

        reader.readAsText(file);
    });
}

/**
 * Generate unique ID
 * 
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 */
export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

export { STORAGE_KEYS };
