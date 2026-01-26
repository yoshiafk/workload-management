/**
 * Integration tests for tier-based skill adjustment calculations
 * Tests the new cost formula: Actual Effort Hours × Tier-Adjusted Hourly Rate
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { calculateEnhancedProjectCost, calculateDurationFromEffort, getDetailedCostBreakdown } from './calculations.js';
import { defaultComplexity, calculateTierAdjustedEffort } from '../data/defaultComplexity.js';

describe('Enhanced Cost Calculation Integration', () => {
    const mockResourceCosts = [
        {
            id: 'dev-001',
            resourceName: 'John Doe',
            perHourCost: 100000 // IDR per hour
        },
        {
            id: 'dev-002', 
            resourceName: 'Jane Smith',
            perHourCost: 150000 // IDR per hour
        }
    ];

    describe('Enhanced Project Cost Calculation', () => {
        test('should calculate cost with tier-based adjustments for Junior developer', () => {
            const result = calculateEnhancedProjectCost(
                'medium',
                'dev-001',
                defaultComplexity,
                mockResourceCosts,
                1 // Junior tier
            );

            // Medium complexity: 120h base * 1.0 complexity * 1.2 risk * 1.2 skill (Junior with 0.5 sensitivity)
            // Expected: 120 * 1.0 * 1.2 * 1.2 = 172.8h
            expect(result.effortHours).toBe(172.8);
            expect(result.totalCost).toBe(17280000); // 172.8h * 100,000 IDR/h
            expect(result.breakdown.skillMultiplier).toBe(1.2);
            expect(result.breakdown.baseEffortHours).toBe(120);
            expect(result.durationDays).toBe(22); // 172.8h ÷ 8h/day = 21.6, rounded up to 22
        });

        test('should calculate cost with tier-based adjustments for Senior developer', () => {
            const result = calculateEnhancedProjectCost(
                'medium',
                'dev-002',
                defaultComplexity,
                mockResourceCosts,
                3 // Senior tier
            );

            // Medium complexity: 120h base * 1.0 complexity * 1.2 risk * 0.9 skill (Senior with 0.5 sensitivity)
            // Expected: 120 * 1.0 * 1.2 * 0.9 = 129.6h
            expect(result.effortHours).toBe(129.6);
            expect(result.totalCost).toBe(19440000); // 129.6h * 150,000 IDR/h
            expect(result.breakdown.skillMultiplier).toBe(0.9);
            expect(result.breakdown.baseEffortHours).toBe(120);
            expect(result.durationDays).toBe(17); // 129.6h ÷ 8h/day = 16.2, rounded up to 17
        });

        test('should handle allocation percentage correctly', () => {
            const fullTimeResult = calculateEnhancedProjectCost(
                'medium',
                'dev-001',
                defaultComplexity,
                mockResourceCosts,
                2, // Mid tier
                1.0 // 100% allocation
            );

            const partTimeResult = calculateEnhancedProjectCost(
                'medium',
                'dev-001',
                defaultComplexity,
                mockResourceCosts,
                2, // Mid tier
                0.5 // 50% allocation
            );

            // Effort hours should be the same
            expect(fullTimeResult.effortHours).toBe(partTimeResult.effortHours);
            
            // Duration should be doubled for 50% allocation
            expect(partTimeResult.durationDays).toBe(fullTimeResult.durationDays * 2);
            
            // Cost should be the same (based on effort, not duration)
            expect(fullTimeResult.totalCost).toBe(partTimeResult.totalCost);
        });

        test('should show Junior requires more effort than Senior for same complexity', () => {
            const juniorResult = calculateEnhancedProjectCost(
                'high',
                'dev-001',
                defaultComplexity,
                mockResourceCosts,
                1 // Junior
            );

            const seniorResult = calculateEnhancedProjectCost(
                'high',
                'dev-001',
                defaultComplexity,
                mockResourceCosts,
                3 // Senior
            );

            expect(juniorResult.effortHours).toBeGreaterThan(seniorResult.effortHours);
            expect(juniorResult.breakdown.skillMultiplier).toBeGreaterThan(seniorResult.breakdown.skillMultiplier);
        });

        test('should handle different complexity levels with skill sensitivity', () => {
            // Low complexity has low skill sensitivity (0.3)
            const lowComplexityResult = calculateEnhancedProjectCost(
                'low',
                'dev-001',
                defaultComplexity,
                mockResourceCosts,
                1 // Junior
            );

            // High complexity has high skill sensitivity (0.8)
            const highComplexityResult = calculateEnhancedProjectCost(
                'high',
                'dev-001',
                defaultComplexity,
                mockResourceCosts,
                1 // Junior
            );

            // Junior should have less impact on low complexity tasks
            expect(lowComplexityResult.breakdown.skillMultiplier).toBeLessThan(highComplexityResult.breakdown.skillMultiplier);
        });

        test('should provide detailed cost breakdown', () => {
            const result = calculateEnhancedProjectCost(
                'sophisticated',
                'dev-002',
                defaultComplexity,
                mockResourceCosts,
                4 // Lead tier
            );

            expect(result.breakdown).toHaveProperty('baseEffortHours');
            expect(result.breakdown).toHaveProperty('adjustedEffortHours');
            expect(result.breakdown).toHaveProperty('skillMultiplier');
            expect(result.breakdown).toHaveProperty('complexityMultiplier');
            expect(result.breakdown).toHaveProperty('riskMultiplier');

            // Sophisticated complexity should have high multipliers
            expect(result.breakdown.complexityMultiplier).toBe(2.5);
            expect(result.breakdown.riskMultiplier).toBe(2.5);
            expect(result.breakdown.baseEffortHours).toBe(640);
        });

        test('should handle invalid inputs gracefully', () => {
            const result = calculateEnhancedProjectCost(
                'invalid',
                'nonexistent',
                defaultComplexity,
                mockResourceCosts,
                1
            );

            expect(result.totalCost).toBe(0);
            expect(result.effortHours).toBe(0);
            expect(result.durationDays).toBe(0);
            expect(result.breakdown.skillMultiplier).toBe(1.0);
        });
    });

    describe('Duration Calculation Separation', () => {
        test('should calculate duration separately from effort', () => {
            const effortHours = 120;
            const allocationPercentage = 0.5; // 50% allocation

            const durationResult = calculateDurationFromEffort(effortHours, allocationPercentage);

            expect(durationResult.effortHours).toBe(120);
            expect(durationResult.allocationPercentage).toBe(0.5);
            expect(durationResult.hoursPerDay).toBe(4); // 50% of 8 hours
            expect(durationResult.durationDays).toBe(30); // 120h ÷ 4h/day = 30 days
        });

        test('should handle edge cases in duration calculation', () => {
            // Zero effort hours
            const zeroResult = calculateDurationFromEffort(0, 1.0);
            expect(zeroResult.durationDays).toBe(0);

            // Very low allocation percentage (should be clamped to 0.1)
            const lowAllocationResult = calculateDurationFromEffort(80, 0.05);
            expect(lowAllocationResult.allocationPercentage).toBe(0.1);
            expect(lowAllocationResult.durationDays).toBe(100); // 80h ÷ 0.8h/day = 100 days

            // Very high allocation percentage (should be clamped to 1.0)
            const highAllocationResult = calculateDurationFromEffort(80, 1.5);
            expect(highAllocationResult.allocationPercentage).toBe(1.0);
            expect(highAllocationResult.durationDays).toBe(10); // 80h ÷ 8h/day = 10 days
        });
    });

    describe('Detailed Cost Breakdown', () => {
        test('should provide comprehensive cost analysis', () => {
            const breakdown = getDetailedCostBreakdown(
                'high',
                'dev-002',
                defaultComplexity,
                mockResourceCosts,
                3, // Senior tier
                0.75 // 75% allocation
            );

            expect(breakdown.summary).toHaveProperty('totalCost');
            expect(breakdown.summary).toHaveProperty('effortHours');
            expect(breakdown.summary).toHaveProperty('durationDays');
            expect(breakdown.summary).toHaveProperty('hourlyRate');
            expect(breakdown.summary).toHaveProperty('allocationPercentage');

            expect(breakdown.effortBreakdown).toHaveProperty('baseEffortHours');
            expect(breakdown.effortBreakdown).toHaveProperty('afterComplexityMultiplier');
            expect(breakdown.effortBreakdown).toHaveProperty('afterRiskMultiplier');
            expect(breakdown.effortBreakdown).toHaveProperty('finalAdjustedHours');

            expect(breakdown.durationBreakdown).toHaveProperty('effortHours');
            expect(breakdown.durationBreakdown).toHaveProperty('allocationPercentage');
            expect(breakdown.durationBreakdown).toHaveProperty('hoursPerDay');
            expect(breakdown.durationBreakdown).toHaveProperty('durationDays');

            expect(breakdown.costBreakdown).toHaveProperty('baseEffortCost');
            expect(breakdown.costBreakdown).toHaveProperty('skillAdjustmentCost');
            expect(breakdown.costBreakdown).toHaveProperty('totalCost');

            expect(breakdown.context).toHaveProperty('complexity');
            expect(breakdown.context).toHaveProperty('resourceName');
            expect(breakdown.context).toHaveProperty('tierLevel');
            expect(breakdown.context).toHaveProperty('tierLabel');
        });
    });

    describe('Direct Integration with calculateTierAdjustedEffort', () => {
        test('should produce consistent results with direct function call', () => {
            const complexityLevel = 'high';
            const tierLevel = 2; // Mid-tier
            
            // Direct calculation using the tier adjustment function
            const directResult = calculateTierAdjustedEffort(complexityLevel, tierLevel);
            
            // Integration calculation
            const integrationResult = calculateEnhancedProjectCost(
                complexityLevel,
                'dev-001',
                defaultComplexity,
                mockResourceCosts,
                tierLevel
            );

            // Results should be consistent
            expect(integrationResult.effortHours).toBe(directResult.adjustedEffortHours);
            expect(integrationResult.breakdown.skillMultiplier).toBe(directResult.skillMultiplier);
            expect(integrationResult.breakdown.baseEffortHours).toBe(directResult.baseEffortHours);
        });

        test('should demonstrate tier progression across all levels', () => {
            const complexityLevel = 'medium';
            const results = [];

            // Calculate for all tier levels
            for (let tier = 1; tier <= 5; tier++) {
                const result = calculateEnhancedProjectCost(
                    complexityLevel,
                    'dev-001',
                    defaultComplexity,
                    mockResourceCosts,
                    tier
                );
                results.push({ tier, effortHours: result.effortHours, skillMultiplier: result.breakdown.skillMultiplier });
            }

            // Verify effort decreases as tier increases (higher skill = less effort)
            for (let i = 1; i < results.length; i++) {
                expect(results[i].effortHours).toBeLessThanOrEqual(results[i-1].effortHours);
            }

            // Verify specific tier multipliers
            expect(results[0].skillMultiplier).toBe(1.2);  // Junior
            expect(results[1].skillMultiplier).toBe(1.0);  // Mid
            expect(results[2].skillMultiplier).toBe(0.9);  // Senior
            expect(results[3].skillMultiplier).toBe(0.85); // Lead
            expect(results[4].skillMultiplier).toBe(0.8);  // Principal
        });
    });
});