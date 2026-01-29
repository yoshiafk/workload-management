/**
 * Data Migration Utility
 * Handles schema versioning and migrations between versions
 */

import { loadFromStorage, saveToStorage } from './storage';
import { defaultComplexity, defaultCostCenters, defaultCOA, defaultTaskTemplates } from '../data';

// Current data version - increment when schema changes
export const CURRENT_VERSION = '2.2.0';

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
    // Migration from 1.1.0 to 1.2.0: allocation.category renamed to complexity, new category field for work type
    '1.1.0_1.2.0': (data) => {
        if (data.allocations) {
            data.allocations = data.allocations.map(a => {
                const isLegacyComplexity = ['low', 'medium', 'high', 'sophisticated'].includes(a.category?.toLowerCase());
                return {
                    ...a,
                    complexity: isLegacyComplexity ? a.category : 'medium',
                    category: isLegacyComplexity ? 'Project' : (a.category || 'Project'),
                    slaStatus: a.slaStatus || 'Within SLA'
                };
            });
        }
        return data;
    },
    // Migration from 1.2.0 to 1.3.0: Add cost center integration
    '1.2.0_1.3.0': (data) => {
        console.log('[Migration] Adding cost center integration...');

        // Initialize cost centers if not present or empty
        if (!data.costCenters || data.costCenters.length === 0) {
            data.costCenters = [...defaultCostCenters];
            console.log('[Migration] Added default cost centers');
        } else {
            // Migrate existing cost centers to new schema
            data.costCenters = data.costCenters.map(cc => ({
                ...cc,
                // Add new schema fields with defaults
                status: cc.status || (cc.isActive !== undefined ? (cc.isActive ? 'Active' : 'Inactive') : 'Active'),
                isActive: cc.isActive !== undefined ? cc.isActive : (cc.status === 'Active'),
                parentCostCenterId: cc.parentCostCenterId || null,
                createdAt: cc.createdAt || new Date().toISOString(),
                updatedAt: cc.updatedAt || new Date().toISOString(),
            }));
            console.log('[Migration] Updated cost center schema with hierarchical support');
        }

        // Initialize Chart of Accounts if not present or empty
        if (!data.coa || data.coa.length === 0) {
            data.coa = [...defaultCOA];
            console.log('[Migration] Added default Chart of Accounts');
        } else {
            // Migrate existing COA to new schema
            data.coa = data.coa.map(coa => ({
                ...coa,
                // Add new schema fields with defaults
                isActive: coa.isActive !== undefined ? coa.isActive : true,
                createdAt: coa.createdAt || new Date().toISOString(),
                updatedAt: coa.updatedAt || new Date().toISOString(),
            }));
            console.log('[Migration] Updated COA schema');
        }

        // Migrate team members to include cost center assignment fields
        if (data.members) {
            data.members = data.members.map(member => ({
                ...member,
                // Add cost center fields if not present
                costCenterId: member.costCenterId || '',
                costCenterAssignedAt: member.costCenterAssignedAt || null,
                costCenterAssignedBy: member.costCenterAssignedBy || null,
                costCenterHistory: member.costCenterHistory || [],
            }));
            console.log('[Migration] Added cost center fields to team members');
        }

        // Migrate allocations to include cost center tracking
        if (data.allocations) {
            data.allocations = data.allocations.map(allocation => {
                // Find the team member for this allocation
                const member = data.members?.find(m => m.id === allocation.memberId);
                const costCenterId = member?.costCenterId || '';
                const costCenter = data.costCenters?.find(cc => cc.id === costCenterId);

                return {
                    ...allocation,
                    // Add cost center tracking fields
                    costCenterId: allocation.costCenterId || costCenterId,
                    costCenterSnapshot: allocation.costCenterSnapshot || (costCenter ? {
                        id: costCenter.id,
                        code: costCenter.code,
                        name: costCenter.name,
                    } : null),
                };
            });
            console.log('[Migration] Added cost center tracking to allocations');
        }

        // Update settings to include cost center settings
        if (!data.settings) {
            data.settings = {};
        }
        if (!data.settings.costCenterSettings) {
            data.settings.costCenterSettings = {
                requireManagerApproval: false,
                allowBulkAssignment: true,
                trackAssignmentHistory: true,
            };
            console.log('[Migration] Added cost center settings');
        }

        return data;
    },
    // Migration from 1.3.0 to 1.4.0: Complexity adjustment, COA expansion, and Cuti Bersama
    '1.3.0_1.4.0': (data) => {
        console.log('[Migration] Updating to v1.4.0 (Business Logic Enhancements)...');

        // 1. Update Complexity Settings
        // We preserve custom settings but ensure new levels (trivial, small) exist
        if (data.complexity) {
            data.complexity = {
                ...defaultComplexity,
                ...data.complexity
            };

            // Adjust 'low' if it still has the old 27 days value
            if (data.complexity.low && data.complexity.low.days === 27) {
                data.complexity.low.days = 10;
                console.log('[Migration] Adjusted "low" complexity duration to 10 days');
            }
        }

        // 2. Expand COA
        // Add new accounts from defaultCOA while preserving existing ones
        if (data.coa) {
            const existingCodes = new Set(data.coa.map(item => item.code));
            const newAccounts = defaultCOA.filter(item => !existingCodes.has(item.code));

            if (newAccounts.length > 0) {
                data.coa = [...data.coa, ...newAccounts];
                console.log(`[Migration] Added ${newAccounts.length} new COA accounts`);
            }

            // Ensure all accounts have subcategory field
            data.coa = data.coa.map(item => {
                if (!item.subcategory) {
                    const defaultItem = defaultCOA.find(d => d.code === item.code);
                    return {
                        ...item,
                        subcategory: defaultItem?.subcategory || 'General'
                    };
                }
                return item;
            });
        }

        // 3. Initialize Cuti Bersama toggle in settings if not exists
        if (!data.settings) data.settings = {};
        if (data.settings.includeCutiBersama === undefined) {
            data.settings.includeCutiBersama = true;
            console.log('[Migration] Enabled cuti bersama by default in settings');
        }

        return data;
    },
    // Migration from 1.4.0 to 2.0.0: Financial integration and enhanced budgeting
    '1.4.0_2.0.0': (data) => {
        console.log('[Migration] Finalizing v2.0.0 (Global Finance & Audit)...');

        // Ensure auditLog exists
        if (!data.auditLog) {
            data.auditLog = [];
        }

        // Initialize any missing settings for 2.0
        if (!data.settings) data.settings = {};
        if (data.settings.capacityFactor === undefined) data.settings.capacityFactor = 0.85;

        data.auditLog.unshift({
            timestamp: new Date().toISOString(),
            type: 'info',
            message: 'System upgraded to v2.0.0 (LTS). Enhanced financial logic and audit trail enabled.'
        });

        return data;
    },
    // Migration from 2.0.0 to 2.1.0: Realignment of Complexity and Workload
    '2.0.0_2.1.0': (data) => {
        console.log('[Migration] Applying Complexity & Workload Realignment (v2.1.0)...');

        // 1. Force update complexity baselines to new market-aligned standards
        data.complexity = { ...defaultComplexity };
        console.log('[Migration] Updated complexity baselines in stored data');

        // 2. Update existing task templates estimates if they match default names
        if (data.tasks) {
            data.tasks = data.tasks.map(task => {
                const defaultTask = defaultTaskTemplates.find(t => t.name === task.name);
                if (defaultTask) {
                    return { ...task, estimates: { ...defaultTask.estimates } };
                }
                return task;
            });
            console.log('[Migration] Realignment applied to existing task templates in stored data');
        }

        return data;
    },
    // Migration from 2.1.0 to 2.2.0: Initialize new allocation fields (Demand Number, Support fields)
    '2.1.0_2.2.0': (data) => {
        console.log('[Migration] Initializing allocation enhancements (v2.2.0)...');

        if (data.allocations) {
            data.allocations = data.allocations.map(allocation => ({
                ...allocation,
                demandNumber: allocation.demandNumber || '',
                ticketId: allocation.ticketId || '',
                priority: allocation.priority || '',
                tags: allocation.tags || [],
                slaDeadline: allocation.slaDeadline || '',
                slaStatus: allocation.slaStatus || 'Within SLA',
            }));
            console.log(`[Migration] Updated ${data.allocations.length} allocations with new fields`);
        }

        return data;
    },
};

/**
 * Create a backup of current data before migration
 */
function createBackup() {
    const backup = {
        timestamp: new Date().toISOString(),
        version: loadFromStorage('version', '1.0.0'),
        members: loadFromStorage('members', []),
        phases: loadFromStorage('phases', []),
        tasks: loadFromStorage('tasks', []),
        complexity: loadFromStorage('complexity', defaultComplexity),
        costs: loadFromStorage('costs', []),
        holidays: loadFromStorage('holidays', []),
        leaves: loadFromStorage('leaves', []),
        allocations: loadFromStorage('allocations', []),
        costCenters: loadFromStorage('costCenters', []),
        coa: loadFromStorage('coa', []),
        settings: loadFromStorage('settings', {}),
    };

    // Store backup in localStorage with a special key
    try {
        localStorage.setItem('wrm_migration_backup', JSON.stringify(backup));
        console.log('[Migration] Backup created successfully');
        return true;
    } catch (error) {
        console.error('[Migration] Failed to create backup:', error);
        return false;
    }
}

/**
 * Restore data from backup in case of migration failure
 */
function restoreFromBackup() {
    try {
        const backupData = localStorage.getItem('wrm_migration_backup');
        if (!backupData) {
            console.error('[Migration] No backup found for rollback');
            return false;
        }

        const backup = JSON.parse(backupData);

        // Restore all data from backup
        if (backup.members) saveToStorage('members', backup.members);
        if (backup.phases) saveToStorage('phases', backup.phases);
        if (backup.tasks) saveToStorage('tasks', backup.tasks);
        if (backup.complexity) saveToStorage('complexity', backup.complexity);
        if (backup.costs) saveToStorage('costs', backup.costs);
        if (backup.holidays) saveToStorage('holidays', backup.holidays);
        if (backup.leaves) saveToStorage('leaves', backup.leaves);
        if (backup.allocations) saveToStorage('allocations', backup.allocations);
        if (backup.costCenters) saveToStorage('costCenters', backup.costCenters);
        if (backup.coa) saveToStorage('coa', backup.coa);
        if (backup.settings) saveToStorage('settings', backup.settings);
        if (backup.version) saveToStorage('version', backup.version);

        console.log(`[Migration] Successfully rolled back to version ${backup.version}`);
        return true;
    } catch (error) {
        console.error('[Migration] Failed to restore from backup:', error);
        return false;
    }
}

/**
 * Clean up migration backup after successful migration
 */
function cleanupBackup() {
    try {
        localStorage.removeItem('wrm_migration_backup');
        console.log('[Migration] Backup cleaned up');
    } catch (error) {
        console.error('[Migration] Failed to cleanup backup:', error);
    }
}

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
    const allVersions = ['1.0.0', '1.1.0', '1.2.0', '1.3.0', '1.4.0', '2.0.0', '2.1.0', '2.2.0']; // Add new versions here in order

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

    // Create backup before starting migration
    const backupCreated = createBackup();
    if (!backupCreated) {
        console.warn('[Migration] Could not create backup, proceeding with migration anyway');
    }

    try {
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
            costCenters: loadFromStorage('costCenters', []),
            coa: loadFromStorage('coa', []),
            settings: loadFromStorage('settings', {}),
        };

        // Run each migration in sequence
        for (const migration of migrationPath) {
            console.log(`[Migration] Running migration: v${migration.from} → v${migration.to}`);
            try {
                data = migration.migrate(data);
            } catch (error) {
                console.error(`[Migration] Failed at v${migration.from} → v${migration.to}:`, error);

                // Attempt rollback
                if (backupCreated) {
                    console.log('[Migration] Attempting rollback...');
                    const rollbackSuccess = restoreFromBackup();
                    if (rollbackSuccess) {
                        throw new Error(`Migration failed at v${migration.from} → v${migration.to}. Data has been rolled back to v${storedVersion}.`);
                    } else {
                        throw new Error(`Migration failed at v${migration.from} → v${migration.to}. Rollback also failed. Manual intervention required.`);
                    }
                } else {
                    throw new Error(`Migration failed at v${migration.from} → v${migration.to}. No backup available for rollback.`);
                }
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
        if (data.costCenters) saveToStorage('costCenters', data.costCenters);
        if (data.coa) saveToStorage('coa', data.coa);
        if (data.settings) saveToStorage('settings', data.settings);

        // Update version
        saveToStorage('version', CURRENT_VERSION);

        // Clean up backup after successful migration
        if (backupCreated) {
            cleanupBackup();
        }

        console.log(`[Migration] Successfully migrated to v${CURRENT_VERSION}`);

        return { migrated: true, version: CURRENT_VERSION, from: storedVersion };

    } catch (error) {
        console.error('[Migration] Migration process failed:', error);
        throw error;
    }
}

/**
 * Check if migration is needed
 */
export function needsMigration() {
    const storedVersion = loadFromStorage('version', '1.0.0');
    return parseVersion(storedVersion) < parseVersion(CURRENT_VERSION);
}

/**
 * Validate data integrity after migration
 */
export function validateMigrationIntegrity() {
    try {
        const version = loadFromStorage('version', '1.0.0');
        const members = loadFromStorage('members', []);
        const costCenters = loadFromStorage('costCenters', []);
        const coa = loadFromStorage('coa', []);
        const allocations = loadFromStorage('allocations', []);

        const issues = [];

        // Check if version is current
        if (version !== CURRENT_VERSION) {
            issues.push(`Version mismatch: expected ${CURRENT_VERSION}, got ${version}`);
        }

        // Check if cost center data exists for v1.3.0+
        if (parseVersion(version) >= parseVersion('1.3.0')) {
            if (!Array.isArray(costCenters) || costCenters.length === 0) {
                issues.push('Cost centers data is missing or invalid');
            }

            if (!Array.isArray(coa) || coa.length === 0) {
                issues.push('Chart of Accounts data is missing or invalid');
            }

            // Check if team members have cost center fields
            const membersWithoutCostCenterFields = members.filter(m =>
                m.costCenterId === undefined ||
                m.costCenterHistory === undefined
            );
            if (membersWithoutCostCenterFields.length > 0) {
                issues.push(`${membersWithoutCostCenterFields.length} team members missing cost center fields`);
            }

            // Check if allocations have cost center tracking
            const allocationsWithoutCostCenter = allocations.filter(a =>
                a.costCenterId === undefined
            );
            if (allocationsWithoutCostCenter.length > 0) {
                issues.push(`${allocationsWithoutCostCenter.length} allocations missing cost center tracking`);
            }
        }

        return {
            valid: issues.length === 0,
            issues,
            version
        };
    } catch (error) {
        return {
            valid: false,
            issues: [`Validation error: ${error.message}`],
            version: 'unknown'
        };
    }
}

/**
 * Get migration status and information
 */
export function getMigrationStatus() {
    const storedVersion = loadFromStorage('version', '1.0.0');
    const needsUpdate = needsMigration();
    const hasBackup = localStorage.getItem('wrm_migration_backup') !== null;

    return {
        currentVersion: storedVersion,
        targetVersion: CURRENT_VERSION,
        needsMigration: needsUpdate,
        hasBackup,
        migrationPath: needsUpdate ? getMigrationPath(storedVersion, CURRENT_VERSION) : []
    };
}
