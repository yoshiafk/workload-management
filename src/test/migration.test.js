/**
 * Migration System Tests
 * Test the data migration functionality for cost center integration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { migrateData, validateMigrationIntegrity, getMigrationStatus, CURRENT_VERSION } from '../utils/migration';
import { saveToStorage, loadFromStorage, clearAllStorage } from '../utils/storage';

describe('Data Migration System', () => {
    beforeEach(() => {
        // Clear all storage before each test
        clearAllStorage();
    });

    afterEach(() => {
        // Clean up after each test
        clearAllStorage();
    });

    it('should migrate from version 1.2.0 to 1.3.0 with cost center integration', () => {
        // Set up old data structure (v1.2.0)
        const oldMembers = [
            {
                id: 'MEM-001',
                name: 'Test User',
                type: 'FULLSTACK',
                maxHoursPerWeek: 40,
                costTierId: 'COST-001',
                isActive: true
            }
        ];

        const oldAllocations = [
            {
                id: 'ALLOC-001',
                memberId: 'MEM-001',
                projectName: 'Test Project',
                complexity: 'medium',
                category: 'Project'
            }
        ];

        // Save old data with version 1.2.0
        saveToStorage('version', '1.2.0');
        saveToStorage('members', oldMembers);
        saveToStorage('allocations', oldAllocations);

        // Run migration
        const result = migrateData();

        // Verify migration result
        expect(result.migrated).toBe(true);
        expect(result.version).toBe(CURRENT_VERSION);
        expect(result.from).toBe('1.2.0');

        // Verify migrated data
        const migratedMembers = loadFromStorage('members', []);
        const migratedAllocations = loadFromStorage('allocations', []);
        const costCenters = loadFromStorage('costCenters', []);
        const coa = loadFromStorage('coa', []);

        // Check that team members have new cost center fields
        expect(migratedMembers[0]).toHaveProperty('costCenterId');
        expect(migratedMembers[0]).toHaveProperty('costCenterAssignedAt');
        expect(migratedMembers[0]).toHaveProperty('costCenterAssignedBy');
        expect(migratedMembers[0]).toHaveProperty('costCenterHistory');

        // Check that allocations have cost center tracking
        expect(migratedAllocations[0]).toHaveProperty('costCenterId');
        expect(migratedAllocations[0]).toHaveProperty('costCenterSnapshot');

        // Check that default cost centers and COA were added
        expect(costCenters).toHaveLength(4); // Default cost centers
        expect(coa).toHaveLength(17); // Default COA entries (expanded in v1.4.0)

        // Verify cost center schema
        expect(costCenters[0]).toHaveProperty('status');
        expect(costCenters[0]).toHaveProperty('createdAt');
        expect(costCenters[0]).toHaveProperty('updatedAt');

        // Verify COA schema
        expect(coa[0]).toHaveProperty('isActive');
        expect(coa[0]).toHaveProperty('createdAt');
        expect(coa[0]).toHaveProperty('updatedAt');
    });

    it('should validate migration integrity correctly', () => {
        // Set up migrated data
        saveToStorage('version', CURRENT_VERSION);
        saveToStorage('members', [
            {
                id: 'MEM-001',
                name: 'Test User',
                costCenterId: 'CC-001',
                costCenterHistory: []
            }
        ]);
        saveToStorage('costCenters', [
            {
                id: 'CC-001',
                code: 'TEST',
                name: 'Test Center',
                status: 'Active'
            }
        ]);
        saveToStorage('coa', [
            {
                id: 'COA-001',
                code: '5001',
                name: 'Test Account',
                isActive: true
            }
        ]);
        saveToStorage('allocations', [
            {
                id: 'ALLOC-001',
                costCenterId: 'CC-001'
            }
        ]);

        const validation = validateMigrationIntegrity();

        expect(validation.valid).toBe(true);
        expect(validation.issues).toHaveLength(0);
        expect(validation.version).toBe(CURRENT_VERSION);
    });

    it('should detect missing cost center data in validation', () => {
        // Set up incomplete migrated data
        saveToStorage('version', CURRENT_VERSION);
        saveToStorage('members', []);
        // Missing costCenters and coa

        const validation = validateMigrationIntegrity();

        expect(validation.valid).toBe(false);
        expect(validation.issues).toContain('Cost centers data is missing or invalid');
        expect(validation.issues).toContain('Chart of Accounts data is missing or invalid');
    });

    it('should provide correct migration status', () => {
        // Test when migration is needed
        saveToStorage('version', '1.2.0');

        const status = getMigrationStatus();

        expect(status.currentVersion).toBe('1.2.0');
        expect(status.targetVersion).toBe(CURRENT_VERSION);
        expect(status.needsMigration).toBe(true);
        expect(status.migrationPath).toHaveLength(5);
        expect(status.migrationPath[0].from).toBe('1.2.0');
        expect(status.migrationPath[0].to).toBe('1.3.0');
    });

    it('should handle migration from older versions (1.0.0 to 1.3.0)', () => {
        // Set up very old data structure (v1.0.0)
        const oldData = {
            members: [
                {
                    id: 'MEM-001',
                    name: 'Test User',
                    type: 'FULLSTACK'
                }
            ],
            complexity: {
                low: { cycleActivity: 0.5 } // Old field name
            },
            allocations: [
                {
                    id: 'ALLOC-001',
                    category: 'low' // Old complexity format
                }
            ]
        };

        saveToStorage('version', '1.0.0');
        saveToStorage('members', oldData.members);
        saveToStorage('complexity', oldData.complexity);
        saveToStorage('allocations', oldData.allocations);

        // Run migration
        const result = migrateData();

        // Verify migration result
        expect(result.migrated).toBe(true);
        expect(result.version).toBe(CURRENT_VERSION);
        expect(result.from).toBe('1.0.0');

        // Verify all migrations were applied
        const migratedComplexity = loadFromStorage('complexity', {});
        const migratedAllocations = loadFromStorage('allocations', []);
        const migratedMembers = loadFromStorage('members', []);

        // Check 1.0.0 -> 1.1.0 migration (cycleActivity -> workload)
        expect(migratedComplexity.low).toHaveProperty('workload');
        expect(migratedComplexity.low).not.toHaveProperty('cycleActivity');

        // Check 1.1.0 -> 1.2.0 migration (category -> complexity)
        expect(migratedAllocations[0]).toHaveProperty('complexity');
        expect(migratedAllocations[0]).toHaveProperty('slaStatus');

        // Check 1.2.0 -> 1.3.0 migration (cost center integration)
        expect(migratedMembers[0]).toHaveProperty('costCenterId');
        expect(migratedAllocations[0]).toHaveProperty('costCenterId');
    });

    it('should migrate from version 2.1.0 to 2.2.0 with allocation enhancements', () => {
        // Set up old data structure (v2.1.0)
        const v21Allocations = [
            {
                id: 'ALLOC-210',
                activityName: 'Existing Activity',
                category: 'Project',
                resource: 'Team Lead',
                complexity: 'high'
            }
        ];

        saveToStorage('version', '2.1.0');
        saveToStorage('allocations', v21Allocations);

        // Run migration
        const result = migrateData();

        // Verify migration result
        expect(result.migrated).toBe(true);
        expect(result.version).toBe('2.2.0');
        expect(result.from).toBe('2.1.0');

        // Verify migrated data
        const migratedAllocations = loadFromStorage('allocations', []);
        const a = migratedAllocations[0];

        expect(a).toHaveProperty('demandNumber', '');
        expect(a).toHaveProperty('ticketId', '');
        expect(a).toHaveProperty('priority', '');
        expect(a).toHaveProperty('tags');
        expect(a.tags).toBeInstanceOf(Array);
        expect(a).toHaveProperty('slaDeadline', '');
        expect(a).toHaveProperty('slaStatus', 'Within SLA');
    });
});