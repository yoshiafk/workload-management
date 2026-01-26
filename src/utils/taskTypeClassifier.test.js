/**
 * Unit Tests for Task Type Classifier
 * Tests selective complexity calculation based on task category
 */

import { 
    TASK_CATEGORIES,
    shouldUseComplexityCalculation,
    shouldUseSimpleTimeEstimate,
    getCalculationMethod,
    getTaskCategory,
    isValidTaskCategory,
    getSupportedCategories
} from './taskTypeClassifier.js';

describe('TaskTypeClassifier', () => {
    describe('shouldUseComplexityCalculation', () => {
        test('should return true for Project tasks', () => {
            expect(shouldUseComplexityCalculation('Project')).toBe(true);
            expect(shouldUseComplexityCalculation({ category: 'Project' })).toBe(true);
        });

        test('should return false for Support tasks', () => {
            expect(shouldUseComplexityCalculation('Support')).toBe(false);
            expect(shouldUseComplexityCalculation({ category: 'Support' })).toBe(false);
        });

        test('should return false for Maintenance tasks', () => {
            expect(shouldUseComplexityCalculation('Maintenance')).toBe(false);
            expect(shouldUseComplexityCalculation({ category: 'Maintenance' })).toBe(false);
        });

        test('should return false for Terminal tasks', () => {
            expect(shouldUseComplexityCalculation('Terminal')).toBe(false);
            expect(shouldUseComplexityCalculation({ category: 'Terminal' })).toBe(false);
        });

        test('should return false for unknown categories', () => {
            expect(shouldUseComplexityCalculation('Unknown')).toBe(false);
            expect(shouldUseComplexityCalculation(null)).toBe(false);
            expect(shouldUseComplexityCalculation(undefined)).toBe(false);
            expect(shouldUseComplexityCalculation({})).toBe(false);
        });
    });

    describe('shouldUseSimpleTimeEstimate', () => {
        test('should return false for Project tasks', () => {
            expect(shouldUseSimpleTimeEstimate('Project')).toBe(false);
            expect(shouldUseSimpleTimeEstimate({ category: 'Project' })).toBe(false);
        });

        test('should return true for Support tasks', () => {
            expect(shouldUseSimpleTimeEstimate('Support')).toBe(true);
            expect(shouldUseSimpleTimeEstimate({ category: 'Support' })).toBe(true);
        });

        test('should return true for Maintenance tasks', () => {
            expect(shouldUseSimpleTimeEstimate('Maintenance')).toBe(true);
            expect(shouldUseSimpleTimeEstimate({ category: 'Maintenance' })).toBe(true);
        });

        test('should return true for Terminal tasks', () => {
            expect(shouldUseSimpleTimeEstimate('Terminal')).toBe(true);
            expect(shouldUseSimpleTimeEstimate({ category: 'Terminal' })).toBe(true);
        });

        test('should return true for unknown categories', () => {
            expect(shouldUseSimpleTimeEstimate('Unknown')).toBe(true);
            expect(shouldUseSimpleTimeEstimate(null)).toBe(true);
            expect(shouldUseSimpleTimeEstimate(undefined)).toBe(true);
            expect(shouldUseSimpleTimeEstimate({})).toBe(true);
        });
    });

    describe('getCalculationMethod', () => {
        test('should return "complexity" for Project tasks', () => {
            expect(getCalculationMethod('Project')).toBe('complexity');
            expect(getCalculationMethod({ category: 'Project' })).toBe('complexity');
        });

        test('should return "simple" for non-Project tasks', () => {
            expect(getCalculationMethod('Support')).toBe('simple');
            expect(getCalculationMethod('Maintenance')).toBe('simple');
            expect(getCalculationMethod('Terminal')).toBe('simple');
            expect(getCalculationMethod('Unknown')).toBe('simple');
        });
    });

    describe('getTaskCategory', () => {
        const taskTemplates = [
            { id: 'T001', name: 'Project Charter', category: 'Project' },
            { id: 'T101', name: 'Incident Resolution', category: 'Support' },
            { id: 'T201', name: 'System Maintenance', category: 'Maintenance' }
        ];

        test('should return category from string input', () => {
            expect(getTaskCategory('Project')).toBe('Project');
            expect(getTaskCategory('Support')).toBe('Support');
        });

        test('should return category from task object', () => {
            expect(getTaskCategory({ category: 'Project' })).toBe('Project');
            expect(getTaskCategory({ category: 'Support' })).toBe('Support');
        });

        test('should lookup category from task templates by name', () => {
            expect(getTaskCategory('Project Charter', taskTemplates)).toBe('Project');
            expect(getTaskCategory('Incident Resolution', taskTemplates)).toBe('Support');
        });

        test('should lookup category from task templates by id', () => {
            expect(getTaskCategory('T001', taskTemplates)).toBe('Project');
            expect(getTaskCategory('T101', taskTemplates)).toBe('Support');
        });

        test('should return null for unknown tasks', () => {
            expect(getTaskCategory('Unknown Task', taskTemplates)).toBe(null);
            expect(getTaskCategory('T999', taskTemplates)).toBe(null);
        });
    });

    describe('isValidTaskCategory', () => {
        test('should return true for valid categories', () => {
            expect(isValidTaskCategory('Project')).toBe(true);
            expect(isValidTaskCategory('Support')).toBe(true);
            expect(isValidTaskCategory('Maintenance')).toBe(true);
            expect(isValidTaskCategory('Terminal')).toBe(true);
        });

        test('should return false for invalid categories', () => {
            expect(isValidTaskCategory('Unknown')).toBe(false);
            expect(isValidTaskCategory('')).toBe(false);
            expect(isValidTaskCategory(null)).toBe(false);
            expect(isValidTaskCategory(undefined)).toBe(false);
        });
    });

    describe('getSupportedCategories', () => {
        test('should return all supported categories', () => {
            const categories = getSupportedCategories();
            expect(categories).toContain('Project');
            expect(categories).toContain('Support');
            expect(categories).toContain('Maintenance');
            expect(categories).toContain('Terminal');
            expect(categories).toHaveLength(4);
        });
    });
});