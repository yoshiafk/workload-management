/**
 * Data Migration Utility
 * Handles schema versioning and migrations between versions
 */

import { loadFromStorage, saveToStorage } from './storage';
import { defaultComplexity } from '../data';

// Current data version - increment when schema changes
export const CURRENT_VERSION = '1.1.0';

/**
 * Migration functions - each migrates from previous version to target version
 * Key format: 'fromVersion_toVersion'
 */
const migrations = {
    // Migration from 1.0.0 to 1.1.0: cycleActivity renamed to workload
    '1.0.0_1.1.0': (data) => {
        // Migrate complexity settings: rename cycleActivity to workload
        if (data.complexity) {
            const migratedComplexity = {};
            for (const [key, value] of Object.entries(data.complexity)) {
                if (value.cycleActivity !== undefined && value.workload === undefined) {
                    migratedComplexity[key] = {
                        ...value,
                        workload: value.cycleActivity,
                    };
                    delete migratedComplexity[key].cycleActivity;
                } else {
                    migratedComplexity[key] = value;
                }
            }
            data.complexity = migratedComplexity;
        }
        return data;
    },
};

/**
 * Get version order for comparison
 */
function parseVersion(version) {
    const parts = version.split('.').map(Number);
    return parts[0] * 10000 + parts[1] * 100 + parts[2];
}

/**
 * Get all migration paths from oldVersion to newVersion
 */
function getMigrationPath(fromVersion, toVersion) {
    const path = [];
    const allVersions = ['1.0.0', '1.1.0']; // Add new versions here in order

    const fromIndex = allVersions.indexOf(fromVersion);
    const toIndex = allVersions.indexOf(toVersion);

    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
        return path;
    }

    for (let i = fromIndex; i < toIndex; i++) {
        const from = allVersions[i];
        const to = allVersions[i + 1];
        const migrationKey = `${from}_${to}`;
        if (migrations[migrationKey]) {
            path.push({ from, to, migrate: migrations[migrationKey] });
        }
    }

    return path;
}

/**
 * Run migrations to update data to current version
 */
export function migrateData() {
    const storedVersion = loadFromStorage('version', '1.0.0');

    if (storedVersion === CURRENT_VERSION) {
        return { migrated: false, version: CURRENT_VERSION };
    }

    console.log(`[Migration] Starting migration from v${storedVersion} to v${CURRENT_VERSION}`);

    const migrationPath = getMigrationPath(storedVersion, CURRENT_VERSION);

    if (migrationPath.length === 0) {
        // No migrations needed, just update version
        saveToStorage('version', CURRENT_VERSION);
        return { migrated: false, version: CURRENT_VERSION };
    }

    // Load all current data
    let data = {
        members: loadFromStorage('members', []),
        phases: loadFromStorage('phases', []),
        tasks: loadFromStorage('tasks', []),
        complexity: loadFromStorage('complexity', defaultComplexity),
        costs: loadFromStorage('costs', []),
        holidays: loadFromStorage('holidays', []),
        leaves: loadFromStorage('leaves', []),
        allocations: loadFromStorage('allocations', []),
        settings: loadFromStorage('settings', {}),
    };

    // Run each migration in sequence
    for (const migration of migrationPath) {
        console.log(`[Migration] Running migration: v${migration.from} → v${migration.to}`);
        try {
            data = migration.migrate(data);
        } catch (error) {
            console.error(`[Migration] Failed at v${migration.from} → v${migration.to}:`, error);
            throw error;
        }
    }

    // Save migrated data
    if (data.members) saveToStorage('members', data.members);
    if (data.phases) saveToStorage('phases', data.phases);
    if (data.tasks) saveToStorage('tasks', data.tasks);
    if (data.complexity) saveToStorage('complexity', data.complexity);
    if (data.costs) saveToStorage('costs', data.costs);
    if (data.holidays) saveToStorage('holidays', data.holidays);
    if (data.leaves) saveToStorage('leaves', data.leaves);
    if (data.allocations) saveToStorage('allocations', data.allocations);
    if (data.settings) saveToStorage('settings', data.settings);

    // Update version
    saveToStorage('version', CURRENT_VERSION);

    console.log(`[Migration] Successfully migrated to v${CURRENT_VERSION}`);

    return { migrated: true, version: CURRENT_VERSION, from: storedVersion };
}

/**
 * Check if migration is needed
 */
export function needsMigration() {
    const storedVersion = loadFromStorage('version', '1.0.0');
    return parseVersion(storedVersion) < parseVersion(CURRENT_VERSION);
}
