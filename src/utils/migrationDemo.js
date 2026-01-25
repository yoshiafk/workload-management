/**
 * Migration Demonstration Script
 * Shows how the data migration system works for cost center integration
 */

import { migrateData, validateMigrationIntegrity, getMigrationStatus, CURRENT_VERSION } from './migration.js';
import { saveToStorage, loadFromStorage, clearAllStorage } from './storage.js';

/**
 * Demonstrate migration from version 1.2.0 to 1.3.0
 */
export function demonstrateMigration() {
    console.log('=== Cost Center Migration Demonstration ===\n');

    // Clear existing data
    clearAllStorage();

    // Set up old data structure (v1.2.0)
    console.log('1. Setting up old data structure (v1.2.0)...');
    const oldData = {
        version: '1.2.0',
        members: [
            {
                id: 'MEM-001',
                name: 'John Developer',
                type: 'FULLSTACK',
                maxHoursPerWeek: 40,
                costTierId: 'COST-FULL-2',
                isActive: true
                // Note: No cost center fields yet
            },
            {
                id: 'MEM-002',
                name: 'Jane QA',
                type: 'QA',
                maxHoursPerWeek: 40,
                costTierId: 'COST-QA-1',
                isActive: true
            }
        ],
        allocations: [
            {
                id: 'ALLOC-001',
                memberId: 'MEM-001',
                projectName: 'E-Commerce Platform',
                complexity: 'high',
                category: 'Project',
                slaStatus: 'Within SLA'
                // Note: No cost center tracking yet
            }
        ],
        settings: {
            currency: 'IDR',
            theme: 'dark'
            // Note: No cost center settings yet
        }
    };

    // Save old data
    saveToStorage('version', oldData.version);
    saveToStorage('members', oldData.members);
    saveToStorage('allocations', oldData.allocations);
    saveToStorage('settings', oldData.settings);

    console.log('   ✓ Old data saved with version', oldData.version);
    console.log('   ✓ Team members without cost center fields');
    console.log('   ✓ Allocations without cost center tracking');
    console.log('   ✓ Settings without cost center configuration\n');

    // Check migration status
    console.log('2. Checking migration status...');
    const status = getMigrationStatus();
    console.log('   Current version:', status.currentVersion);
    console.log('   Target version:', status.targetVersion);
    console.log('   Needs migration:', status.needsMigration);
    console.log('   Migration path:', status.migrationPath.map(p => `${p.from} → ${p.to}`).join(', '));
    console.log('');

    // Run migration
    console.log('3. Running migration...');
    try {
        const result = migrateData();
        console.log('   ✓ Migration completed successfully');
        console.log('   ✓ Migrated from version', result.from, 'to', result.version);
        console.log('');
    } catch (error) {
        console.error('   ✗ Migration failed:', error.message);
        return;
    }

    // Verify migrated data
    console.log('4. Verifying migrated data...');
    const migratedMembers = loadFromStorage('members', []);
    const migratedAllocations = loadFromStorage('allocations', []);
    const costCenters = loadFromStorage('costCenters', []);
    const coa = loadFromStorage('coa', []);
    const migratedSettings = loadFromStorage('settings', {});

    console.log('   Team Members:');
    migratedMembers.forEach(member => {
        console.log(`     - ${member.name}:`);
        console.log(`       ✓ Has costCenterId field: ${member.costCenterId !== undefined}`);
        console.log(`       ✓ Has costCenterHistory field: ${Array.isArray(member.costCenterHistory)}`);
        console.log(`       ✓ Has costCenterAssignedAt field: ${member.costCenterAssignedAt !== undefined}`);
    });

    console.log('   Allocations:');
    migratedAllocations.forEach(allocation => {
        console.log(`     - ${allocation.projectName}:`);
        console.log(`       ✓ Has costCenterId field: ${allocation.costCenterId !== undefined}`);
        console.log(`       ✓ Has costCenterSnapshot field: ${allocation.costCenterSnapshot !== undefined}`);
    });

    console.log('   Cost Centers:');
    console.log(`     ✓ Added ${costCenters.length} default cost centers`);
    costCenters.forEach(cc => {
        console.log(`       - ${cc.code}: ${cc.name} (${cc.status})`);
    });

    console.log('   Chart of Accounts:');
    console.log(`     ✓ Added ${coa.length} default COA entries`);
    coa.forEach(account => {
        console.log(`       - ${account.code}: ${account.name} (${account.category})`);
    });

    console.log('   Settings:');
    console.log(`     ✓ Added cost center settings: ${migratedSettings.costCenterSettings !== undefined}`);
    if (migratedSettings.costCenterSettings) {
        console.log(`       - Require manager approval: ${migratedSettings.costCenterSettings.requireManagerApproval}`);
        console.log(`       - Allow bulk assignment: ${migratedSettings.costCenterSettings.allowBulkAssignment}`);
        console.log(`       - Track assignment history: ${migratedSettings.costCenterSettings.trackAssignmentHistory}`);
    }
    console.log('');

    // Validate migration integrity
    console.log('5. Validating migration integrity...');
    const validation = validateMigrationIntegrity();
    if (validation.valid) {
        console.log('   ✓ Migration integrity validation passed');
        console.log('   ✓ All required data structures are present');
        console.log('   ✓ Schema version is correct:', validation.version);
    } else {
        console.log('   ✗ Migration integrity validation failed:');
        validation.issues.forEach(issue => {
            console.log(`     - ${issue}`);
        });
    }
    console.log('');

    console.log('=== Migration Demonstration Complete ===');
    console.log('The application is now ready to use cost center features!');
}

/**
 * Demonstrate rollback functionality
 */
export function demonstrateRollback() {
    console.log('=== Migration Rollback Demonstration ===\n');

    // This would be called in case of migration failure
    // The actual rollback is handled automatically in migrateData()
    console.log('Rollback functionality is built into the migration system:');
    console.log('1. Before migration starts, a backup is created');
    console.log('2. If any migration step fails, the system automatically rolls back');
    console.log('3. All data is restored to the pre-migration state');
    console.log('4. The version number is reverted to the original version');
    console.log('5. Error details are provided for troubleshooting');
    console.log('');
    console.log('This ensures data safety during the migration process.');
}

// Export for use in other modules or testing
export { migrateData, validateMigrationIntegrity, getMigrationStatus, CURRENT_VERSION };