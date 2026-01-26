/**
 * Demo Test for CostCenterManager
 * Runs the demo functionality as a test to showcase features
 */

import { runAllDemos } from './costCenterManager.demo.js';

describe('CostCenterManager Demo', () => {
    test('should run all demo scenarios successfully', () => {
        // Capture console output
        const originalLog = console.log;
        const logs = [];
        console.log = (...args) => {
            logs.push(args.join(' '));
            originalLog(...args);
        };

        try {
            runAllDemos();
            
            // Verify that key demo sections were executed
            const logOutput = logs.join('\n');
            expect(logOutput).toContain('BUDGET STATUS OVERVIEW');
            expect(logOutput).toContain('BUDGET VALIDATION SCENARIOS');
            expect(logOutput).toContain('OVER-BUDGET COST CENTERS');
            expect(logOutput).toContain('MULTIPLE ALLOCATION VALIDATION');
            expect(logOutput).toContain('BUDGET ENFORCEMENT MODE COMPARISON');
            expect(logOutput).toContain('All demos completed successfully');
            
        } finally {
            // Restore console.log
            console.log = originalLog;
        }
    });
});