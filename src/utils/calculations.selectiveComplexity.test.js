/**
 * Integration Tests for Selective Complexity Calculation
 * Tests that calculations.js properly applies selective complexity based on task category
 */

import { 
    calculateProjectCost, 
    calculateEnhancedProjectCost,
    getDetailedCostBreakdown 
} from './calculations.js';
import { defaultComplexity } from '../data/defaultComplexity.js';

describe('Selective Complexity Calculation Integration', () => {
    const mockResourceCosts = [
        {
            id: 'RES-001',
            resourceName: 'John Developer',
            perHourCost: 50000,
            monthlyCost: 8000000
        }
    ];

    const mockTaskTemplate = {
        id: 'T101',
        name: 'Incident Resolution',
        category: 'Support',
        estimates: {
            low: { days: 1, hours: 2 },
            medium: { days: 2, hours: 4 },
            high: { days: 3, hours: 6 },
            sophisticated: { days: 5, hours: 8 }
        }
    };

    describe('calculateEnhancedProjectCost with selective complexity', () => {
        test('should use complexity calculation for Project tasks', () => {
            const result = calculateEnhancedProjectCost(
                'medium',
                'RES-001',
                defaultComplexity,
                mockResourceCosts,
                2, // Mid-tier
                1.0, // 100% allocation
                'Project', // Project category
                null
            );

            // Project tasks should use the full complexity model
            expect(result.effortHours).toBeGreaterThan(0);
            expect(result.breakdown.skillMultiplier).toBeDefined();
            expect(result.breakdown.complexityMultiplier).toBeDefined();
            expect(result.breakdown.riskMultiplier).toBeDefined();
            
            // Should use baseEffortHours from complexity model (120 for medium)
            expect(result.breakdown.baseEffortHours).toBe(120);
        });

        test('should use simple time estimates for Support tasks', () => {
            const result = calculateEnhancedProjectCost(
                'medium',
                'RES-001',
                defaultComplexity,
                mockResourceCosts,
                2, // Mid-tier
                1.0, // 100% allocation
                'Support', // Support category
                mockTaskTemplate
            );

            // Support tasks should use simple time estimates from task template
            expect(result.effortHours).toBe(4); // From mockTaskTemplate.estimates.medium.hours
            expect(result.breakdown.baseEffortHours).toBe(4);
            expect(result.breakdown.skillMultiplier).toBe(1.0);
            expect(result.breakdown.complexityMultiplier).toBe(1.0);
            expect(result.breakdown.riskMultiplier).toBe(1.0);
        });

        test('should use simple time estimates for Maintenance tasks', () => {
            const maintenanceTemplate = {
                ...mockTaskTemplate,
                category: 'Maintenance',
                estimates: {
                    low: { days: 2, hours: 3 },
                    medium: { days: 4, hours: 6 },
                    high: { days: 6, hours: 9 },
                    sophisticated: { days: 8, hours: 12 }
                }
            };

            const result = calculateEnhancedProjectCost(
                'high',
                'RES-001',
                defaultComplexity,
                mockResourceCosts,
                3, // Senior tier
                1.0, // 100% allocation
                'Maintenance', // Maintenance category
                maintenanceTemplate
            );

            // Maintenance tasks should use simple time estimates
            expect(result.effortHours).toBe(9); // From maintenanceTemplate.estimates.high.hours
            expect(result.breakdown.baseEffortHours).toBe(9);
            expect(result.breakdown.skillMultiplier).toBe(1.0);
        });

        test('should fallback to complexity calculation when no task template provided for Support', () => {
            const result = calculateEnhancedProjectCost(
                'low',
                'RES-001',
                defaultComplexity,
                mockResourceCosts,
                2, // Mid-tier
                1.0, // 100% allocation
                'Support', // Support category
                null // No task template
            );

            // Should fallback to complexity calculation
            expect(result.effortHours).toBeGreaterThan(0);
            expect(result.breakdown.baseEffortHours).toBe(40); // From defaultComplexity.low.baseEffortHours
        });
    });

    describe('calculateProjectCost with selective complexity', () => {
        test('should return different costs for Project vs Support tasks', () => {
            const projectCost = calculateProjectCost(
                'medium',
                'RES-001',
                defaultComplexity,
                mockResourceCosts,
                2, // Mid-tier
                1.0, // 100% allocation
                false, // Enhanced calculation
                'Project', // Project category
                null
            );

            const supportCost = calculateProjectCost(
                'medium',
                'RES-001',
                defaultComplexity,
                mockResourceCosts,
                2, // Mid-tier
                1.0, // 100% allocation
                false, // Enhanced calculation
                'Support', // Support category
                mockTaskTemplate
            );

            // Project cost should be higher due to complexity calculation
            expect(projectCost).toBeGreaterThan(supportCost);
            
            // Support cost should be based on simple template hours (4 hours * 50000 = 200000)
            expect(supportCost).toBe(200000);
        });
    });

    describe('getDetailedCostBreakdown with selective complexity', () => {
        test('should provide detailed breakdown for Project tasks', () => {
            const breakdown = getDetailedCostBreakdown(
                'sophisticated',
                'RES-001',
                defaultComplexity,
                mockResourceCosts,
                1, // Junior tier
                0.5, // 50% allocation
                'Project', // Project category
                null
            );

            expect(breakdown.summary.totalCost).toBeGreaterThan(0);
            expect(breakdown.effortBreakdown.skillMultiplier).toBeGreaterThan(1.0); // Junior should have > 1.0 multiplier
            expect(breakdown.effortBreakdown.complexityMultiplier).toBeGreaterThan(1.0); // Sophisticated should have > 1.0
            expect(breakdown.context.complexity).toBe('sophisticated');
            expect(breakdown.context.tierLevel).toBe(1);
        });

        test('should provide simple breakdown for Support tasks', () => {
            const breakdown = getDetailedCostBreakdown(
                'high',
                'RES-001',
                defaultComplexity,
                mockResourceCosts,
                5, // Principal tier
                1.0, // 100% allocation
                'Support', // Support category
                mockTaskTemplate
            );

            // Should use simple calculation
            expect(breakdown.summary.effortHours).toBe(6); // From template
            expect(breakdown.effortBreakdown.skillMultiplier).toBe(1.0);
            expect(breakdown.effortBreakdown.complexityMultiplier).toBe(1.0);
            expect(breakdown.effortBreakdown.riskMultiplier).toBe(1.0);
        });
    });

    describe('edge cases', () => {
        test('should handle missing task template gracefully', () => {
            const result = calculateEnhancedProjectCost(
                'low',
                'RES-001',
                defaultComplexity,
                mockResourceCosts,
                2,
                1.0,
                'Support',
                null // No template
            );

            // Should fallback to complexity calculation
            expect(result.effortHours).toBeGreaterThan(0);
            expect(result.totalCost).toBeGreaterThan(0);
        });

        test('should handle invalid complexity level', () => {
            const result = calculateEnhancedProjectCost(
                'invalid',
                'RES-001',
                defaultComplexity,
                mockResourceCosts,
                2,
                1.0,
                'Support',
                mockTaskTemplate
            );

            // Should handle gracefully
            expect(result.effortHours).toBe(0);
            expect(result.totalCost).toBe(0);
        });

        test('should handle task object input', () => {
            const taskObject = {
                id: 'T101',
                name: 'Test Task',
                category: 'Support'
            };

            const result = calculateEnhancedProjectCost(
                'medium',
                'RES-001',
                defaultComplexity,
                mockResourceCosts,
                2,
                1.0,
                taskObject, // Task object instead of string
                mockTaskTemplate
            );

            // Should extract category from task object
            expect(result.effortHours).toBe(4); // Simple calculation
        });
    });
});