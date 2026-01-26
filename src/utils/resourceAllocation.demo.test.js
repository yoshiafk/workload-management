/**
 * ResourceAllocationEngine Demo Test
 * Verifies that the demo runs without errors
 */

import { describe, it, expect } from 'vitest';
import { runResourceAllocationDemo } from './resourceAllocation.demo.js';

describe('ResourceAllocationEngine Demo', () => {
    it('should run demo without errors', () => {
        // Capture console output
        const originalLog = console.log;
        const logs = [];
        console.log = (...args) => logs.push(args.join(' '));

        try {
            // Run the demo
            runResourceAllocationDemo();
            
            // Verify demo ran and produced output
            expect(logs.length).toBeGreaterThan(0);
            expect(logs[0]).toContain('ResourceAllocationEngine Demo');
            expect(logs.some(log => log.includes('Current Resource Utilization'))).toBe(true);
            expect(logs.some(log => log.includes('Over-Allocation Detection'))).toBe(true);
            expect(logs.some(log => log.includes('Allocation Request Validation'))).toBe(true);
            expect(logs.some(log => log.includes('Resource Availability'))).toBe(true);
            expect(logs.some(log => log.includes('Team Utilization Summary'))).toBe(true);
            expect(logs.some(log => log.includes('Strict Enforcement Mode'))).toBe(true);
            expect(logs.some(log => log.includes('Demo completed successfully'))).toBe(true);
        } finally {
            // Restore console.log
            console.log = originalLog;
        }
    });
});