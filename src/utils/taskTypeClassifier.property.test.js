/**
 * Property-Based Tests for Selective Complexity Application
 * **Property 18: Selective Complexity Application**
 * **Validates: User Requirement - Remove Complexity Calculation except for Project Task**
 */

import fc from 'fast-check';
import { 
    shouldUseComplexityCalculation,
    shouldUseSimpleTimeEstimate,
    getCalculationMethod,
    TASK_CATEGORIES
} from './taskTypeClassifier.js';
import { 
    calculateEnhancedProjectCost,
    calculateProjectCost 
} from './calculations.js';
import { defaultComplexity } from '../data/defaultComplexity.js';

describe('Property-Based Tests: Selective Complexity Application', () => {
    const mockResourceCosts = [
        {
            id: 'RES-001',
            resourceName: 'Test Resource',
            perHourCost: 50000,
            monthlyCost: 8000000
        }
    ];

    const mockTaskTemplate = {
        id: 'T001',
        name: 'Test Task',
        estimates: {
            low: { days: 1, hours: 2 },
            medium: { days: 2, hours: 4 },
            high: { days: 3, hours: 6 },
            sophisticated: { days: 4, hours: 8 }
        }
    };

    /**
     * **Property 18: Selective Complexity Application**
     * For any task, complexity calculations should only be applied to Project tasks,
     * while Support and Maintenance tasks should use simple time estimates,
     * ensuring appropriate calculation methods based on task type.
     * **Validates: User Requirement - Remove Complexity Calculation except for Project Task**
     */
    test('Property 18: Selective Complexity Application', () => {
        fc.assert(fc.property(
            fc.record({
                category: fc.constantFrom('Project', 'Support', 'Maintenance', 'Terminal', 'Unknown'),
                complexity: fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
                tierLevel: fc.integer({ min: 1, max: 5 }),
                allocationPercentage: fc.float({ min: Math.fround(0.1), max: Math.fround(1.0) })
            }),
            (data) => {
                // Test the classification logic
                const shouldUseComplexity = shouldUseComplexityCalculation(data.category);
                const shouldUseSimple = shouldUseSimpleTimeEstimate(data.category);
                const calculationMethod = getCalculationMethod(data.category);

                // Property: Only Project tasks should use complexity calculations
                if (data.category === 'Project') {
                    expect(shouldUseComplexity).toBe(true);
                    expect(shouldUseSimple).toBe(false);
                    expect(calculationMethod).toBe('complexity');
                } else {
                    // All non-Project tasks should use simple time estimates
                    expect(shouldUseComplexity).toBe(false);
                    expect(shouldUseSimple).toBe(true);
                    expect(calculationMethod).toBe('simple');
                }

                // Test the actual calculation behavior
                const projectResult = calculateEnhancedProjectCost(
                    data.complexity,
                    'RES-001',
                    defaultComplexity,
                    mockResourceCosts,
                    data.tierLevel,
                    data.allocationPercentage,
                    'Project', // Force Project category
                    null
                );

                const nonProjectResult = calculateEnhancedProjectCost(
                    data.complexity,
                    'RES-001',
                    defaultComplexity,
                    mockResourceCosts,
                    data.tierLevel,
                    data.allocationPercentage,
                    data.category === 'Project' ? 'Support' : data.category, // Use non-Project category
                    mockTaskTemplate
                );

                // Property: Project tasks should generally have different effort calculations
                // than non-Project tasks due to complexity multipliers
                if (data.category !== 'Project') {
                    // Non-Project tasks should use simple time estimates from template
                    const expectedHours = mockTaskTemplate.estimates[data.complexity]?.hours || 0;
                    if (expectedHours > 0) {
                        expect(nonProjectResult.effortHours).toBe(expectedHours);
                        expect(nonProjectResult.breakdown.skillMultiplier).toBe(1.0);
                        expect(nonProjectResult.breakdown.complexityMultiplier).toBe(1.0);
                        expect(nonProjectResult.breakdown.riskMultiplier).toBe(1.0);
                    }
                }

                // Property: Project tasks should use complexity-based calculations
                if (data.category === 'Project') {
                    expect(projectResult.effortHours).toBeGreaterThan(0);
                    expect(projectResult.breakdown.baseEffortHours).toBeGreaterThan(0);
                    
                    // Should use the base effort hours from complexity model
                    const complexityConfig = defaultComplexity[data.complexity];
                    if (complexityConfig && complexityConfig.baseEffortHours) {
                        expect(projectResult.breakdown.baseEffortHours).toBe(complexityConfig.baseEffortHours);
                    }
                }

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Property: Task category classification consistency
     * For any valid task category, the classification functions should be consistent
     */
    test('Property: Task category classification consistency', () => {
        fc.assert(fc.property(
            fc.constantFrom(...Object.values(TASK_CATEGORIES), 'Unknown', 'Invalid'),
            (category) => {
                const useComplexity = shouldUseComplexityCalculation(category);
                const useSimple = shouldUseSimpleTimeEstimate(category);
                const method = getCalculationMethod(category);

                // Property: Exactly one calculation method should be true
                expect(useComplexity !== useSimple).toBe(true);

                // Property: Method should match the boolean flags
                if (useComplexity) {
                    expect(method).toBe('complexity');
                } else {
                    expect(method).toBe('simple');
                }

                return true;
            }
        ), { numRuns: 50 });
    });

    /**
     * Property: Cost calculation consistency across task types
     * For any task parameters, the cost calculation should be deterministic and consistent
     */
    test('Property: Cost calculation consistency across task types', () => {
        fc.assert(fc.property(
            fc.record({
                complexity: fc.constantFrom('low', 'medium', 'high', 'sophisticated'),
                tierLevel: fc.integer({ min: 1, max: 5 }),
                allocationPercentage: fc.float({ min: Math.fround(0.1), max: Math.fround(1.0) }),
                category: fc.constantFrom('Project', 'Support', 'Maintenance')
            }),
            (data) => {
                const result1 = calculateProjectCost(
                    data.complexity,
                    'RES-001',
                    defaultComplexity,
                    mockResourceCosts,
                    data.tierLevel,
                    data.allocationPercentage,
                    false, // Enhanced calculation
                    data.category,
                    mockTaskTemplate
                );

                const result2 = calculateProjectCost(
                    data.complexity,
                    'RES-001',
                    defaultComplexity,
                    mockResourceCosts,
                    data.tierLevel,
                    data.allocationPercentage,
                    false, // Enhanced calculation
                    data.category,
                    mockTaskTemplate
                );

                // Property: Same inputs should produce same outputs (deterministic)
                expect(result1).toBe(result2);

                // Property: Cost should be non-negative
                expect(result1).toBeGreaterThanOrEqual(0);

                // Property: Support/Maintenance tasks with template should use template hours
                if (data.category !== 'Project') {
                    const expectedHours = mockTaskTemplate.estimates[data.complexity]?.hours || 0;
                    const expectedCost = expectedHours * mockResourceCosts[0].perHourCost;
                    if (expectedHours > 0) {
                        expect(result1).toBe(expectedCost);
                    }
                }

                return true;
            }
        ), { numRuns: 100 });
    });

    /**
     * Property: Task object vs category string equivalence
     * For any task category, passing it as a string or as part of a task object should yield the same result
     */
    test('Property: Task object vs category string equivalence', () => {
        fc.assert(fc.property(
            fc.record({
                category: fc.constantFrom('Project', 'Support', 'Maintenance', 'Terminal'),
                complexity: fc.constantFrom('low', 'medium', 'high'),
                tierLevel: fc.integer({ min: 1, max: 5 })
            }),
            (data) => {
                const taskObject = {
                    id: 'TEST-001',
                    name: 'Test Task',
                    category: data.category
                };

                const resultFromString = calculateEnhancedProjectCost(
                    data.complexity,
                    'RES-001',
                    defaultComplexity,
                    mockResourceCosts,
                    data.tierLevel,
                    1.0,
                    data.category, // Category as string
                    mockTaskTemplate
                );

                const resultFromObject = calculateEnhancedProjectCost(
                    data.complexity,
                    'RES-001',
                    defaultComplexity,
                    mockResourceCosts,
                    data.tierLevel,
                    1.0,
                    taskObject, // Category from task object
                    mockTaskTemplate
                );

                // Property: Both approaches should yield identical results
                expect(resultFromString.totalCost).toBe(resultFromObject.totalCost);
                expect(resultFromString.effortHours).toBe(resultFromObject.effortHours);
                expect(resultFromString.breakdown).toEqual(resultFromObject.breakdown);

                return true;
            }
        ), { numRuns: 50 });
    });
});