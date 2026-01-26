/**
 * Property-Based Tests for Demand Number Search Functionality
 * 
 * Feature: business-logic-optimization
 * Task: 7.5 Add demand number search for Support issues
 * 
 * **Property 22: Demand Number Search Capability**
 * *For any* Support issue with a demand number, the search functionality should allow 
 * finding related issues by demand number, supporting both exact matches and related 
 * demand lookups.
 * **Validates: User Requirement - Add Search Demand Number for Support Issue**
 */

import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { DashboardEngine } from './dashboardEngine.js';

describe('Property 22: Demand Number Search Capability', () => {
    const engine = new DashboardEngine();

    // Generator for Support issues with demand numbers
    const supportIssueGen = fc.record({
        id: fc.string({ minLength: 5, maxLength: 15 }),
        category: fc.constant('Support'),
        demandNumber: fc.option(fc.oneof(
            // Standard demand number patterns
            fc.tuple(
                fc.constantFrom('DEM', 'REQ', 'URGENT', 'MAINT'),
                fc.integer({ min: 2020, max: 2030 }),
                fc.integer({ min: 1, max: 999 }).map(n => n.toString().padStart(3, '0'))
            ).map(([prefix, year, num]) => `${prefix}-${year}-${num}`),
            // Alternative patterns
            fc.tuple(
                fc.constantFrom('TKT', 'INC', 'CHG'),
                fc.integer({ min: 1, max: 9999 }).map(n => n.toString().padStart(4, '0'))
            ).map(([prefix, num]) => `${prefix}-${num}`)
        )),
        ticketId: fc.option(fc.string({ minLength: 5, maxLength: 15 })),
        activityName: fc.string({ minLength: 10, maxLength: 50 }),
        description: fc.string({ minLength: 20, max: 100 })
    });

    // Generator for mixed category issues
    const mixedIssueGen = fc.record({
        id: fc.string({ minLength: 5, maxLength: 15 }),
        category: fc.constantFrom('Support', 'Project', 'Maintenance'),
        demandNumber: fc.option(fc.string({ minLength: 5, maxLength: 20 })),
        ticketId: fc.option(fc.string({ minLength: 5, maxLength: 15 })),
        activityName: fc.string({ minLength: 10, maxLength: 50 }),
        description: fc.string({ minLength: 20, max: 100 })
    });

    it('should find Support issues by exact demand number match', () => {
        fc.assert(fc.property(
            fc.array(supportIssueGen, { minLength: 1, maxLength: 20 }),
            fc.string({ minLength: 3, maxLength: 15 }),
            (issues, searchTerm) => {
                const results = engine.searchByDemandNumber(issues, searchTerm, { exactMatch: true });
                
                // All results should be exact matches
                results.forEach(issue => {
                    expect(issue.category).toBe('Support');
                    if (issue.demandNumber) {
                        expect(issue.demandNumber.toLowerCase()).toBe(searchTerm.toLowerCase());
                    }
                });
                
                return true;
            }
        ), { numRuns: 50 });
    });

    it('should find Support issues by partial demand number match', () => {
        fc.assert(fc.property(
            fc.array(supportIssueGen, { minLength: 1, maxLength: 20 }),
            fc.string({ minLength: 2, maxLength: 10 }).filter(s => s.trim().length > 0), // Ensure non-empty search term
            (issues, searchTerm) => {
                const results = engine.searchByDemandNumber(issues, searchTerm, { exactMatch: false });
                
                // All results should contain the search term (case insensitive)
                results.forEach(issue => {
                    expect(issue.category).toBe('Support');
                    
                    // Should match in at least one searchable field
                    const demandMatch = issue.demandNumber?.toLowerCase().includes(searchTerm.toLowerCase());
                    const ticketMatch = issue.ticketId?.toLowerCase().includes(searchTerm.toLowerCase());
                    const activityMatch = issue.activityName?.toLowerCase().includes(searchTerm.toLowerCase());
                    
                    expect(demandMatch || ticketMatch || activityMatch).toBe(true);
                });
                
                return true;
            }
        ), { numRuns: 50 });
    });

    it('should search across ticket IDs and activity names when enabled', () => {
        fc.assert(fc.property(
            fc.array(supportIssueGen, { minLength: 1, maxLength: 15 }),
            fc.string({ minLength: 3, maxLength: 8 }),
            (issues, searchTerm) => {
                const results = engine.searchByDemandNumber(issues, searchTerm, {
                    searchInTicketId: true,
                    searchInActivityName: true,
                    exactMatch: false
                });
                
                // All results should be Support category
                results.forEach(issue => {
                    expect(issue.category).toBe('Support');
                    
                    // Should match in at least one field
                    const matchesDemand = issue.demandNumber?.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesTicket = issue.ticketId?.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesActivity = issue.activityName?.toLowerCase().includes(searchTerm.toLowerCase());
                    
                    expect(matchesDemand || matchesTicket || matchesActivity).toBe(true);
                });
                
                return true;
            }
        ), { numRuns: 50 });
    });

    it('should provide enhanced search results with proper structure', () => {
        fc.assert(fc.property(
            fc.array(mixedIssueGen, { minLength: 1, maxLength: 20 }),
            fc.string({ minLength: 3, maxLength: 10 }),
            (issues, searchTerm) => {
                const results = engine.searchByDemandNumberEnhanced(issues, searchTerm, {
                    includeAllCategories: true,
                    includeRelated: true
                });
                
                // Verify result structure
                expect(results).toHaveProperty('mainMatches');
                expect(results).toHaveProperty('relatedMatches');
                expect(results).toHaveProperty('searchTerm');
                expect(results).toHaveProperty('totalResults');
                expect(results).toHaveProperty('hasExactMatch');
                expect(results).toHaveProperty('hasPartialMatch');
                expect(results).toHaveProperty('hasRelatedMatch');
                
                // Verify data types
                expect(Array.isArray(results.mainMatches)).toBe(true);
                expect(Array.isArray(results.relatedMatches)).toBe(true);
                expect(typeof results.searchTerm).toBe('string');
                expect(typeof results.totalResults).toBe('number');
                expect(typeof results.hasExactMatch).toBe('boolean');
                expect(typeof results.hasPartialMatch).toBe('boolean');
                expect(typeof results.hasRelatedMatch).toBe('boolean');
                
                // Verify calculations
                expect(results.totalResults).toBe(results.mainMatches.length + results.relatedMatches.length);
                expect(results.searchTerm).toBe(searchTerm);
                
                return true;
            }
        ), { numRuns: 50 });
    });

    it('should not have duplicate results between main and related matches', () => {
        fc.assert(fc.property(
            fc.array(mixedIssueGen, { minLength: 1, maxLength: 20 }),
            fc.string({ minLength: 3, maxLength: 10 }),
            (issues, searchTerm) => {
                const results = engine.searchByDemandNumberEnhanced(issues, searchTerm, {
                    includeAllCategories: true,
                    includeRelated: true
                });
                
                // Extract IDs from both result sets
                const mainIds = results.mainMatches.map(issue => issue.id);
                const relatedIds = results.relatedMatches.map(issue => issue.id);
                
                // Check for overlaps
                const overlaps = mainIds.filter(id => relatedIds.includes(id));
                expect(overlaps).toHaveLength(0);
                
                // Check for duplicates within each set
                const uniqueMainIds = [...new Set(mainIds)];
                const uniqueRelatedIds = [...new Set(relatedIds)];
                
                expect(mainIds.length).toBe(uniqueMainIds.length);
                expect(relatedIds.length).toBe(uniqueRelatedIds.length);
                
                return true;
            }
        ), { numRuns: 50 });
    });

    it('should respect category filtering options', () => {
        fc.assert(fc.property(
            fc.array(mixedIssueGen, { minLength: 1, maxLength: 20 }),
            fc.string({ minLength: 3, maxLength: 10 }),
            fc.boolean(),
            (issues, searchTerm, includeAllCategories) => {
                const results = engine.searchByDemandNumber(issues, searchTerm, {
                    includeAllCategories,
                    exactMatch: false
                });
                
                if (includeAllCategories) {
                    // Can include any category
                    const categories = [...new Set(results.map(issue => issue.category))];
                    const allCategories = [...new Set(issues.map(issue => issue.category))];
                    
                    categories.forEach(cat => {
                        expect(allCategories).toContain(cat);
                    });
                } else {
                    // Should only include Support category
                    results.forEach(issue => {
                        expect(issue.category).toBe('Support');
                    });
                }
                
                return true;
            }
        ), { numRuns: 50 });
    });

    it('should handle case sensitivity correctly', () => {
        fc.assert(fc.property(
            fc.array(supportIssueGen, { minLength: 1, maxLength: 15 }),
            fc.string({ minLength: 3, maxLength: 10 }),
            (issues, searchTerm) => {
                const caseInsensitiveResults = engine.searchByDemandNumber(issues, searchTerm, {
                    caseSensitive: false
                });
                
                const caseSensitiveResults = engine.searchByDemandNumber(issues, searchTerm, {
                    caseSensitive: true
                });
                
                // Case insensitive should return same or more results
                expect(caseInsensitiveResults.length).toBeGreaterThanOrEqual(caseSensitiveResults.length);
                
                // Case sensitive results should be subset of case insensitive
                caseSensitiveResults.forEach(issue => {
                    expect(caseInsensitiveResults.some(ci => ci.id === issue.id)).toBe(true);
                });
                
                return true;
            }
        ), { numRuns: 50 });
    });

    it('should extract meaningful patterns from demand numbers', () => {
        fc.assert(fc.property(
            fc.oneof(
                // Standard patterns
                fc.tuple(
                    fc.constantFrom('DEM', 'REQ', 'URGENT', 'MAINT'),
                    fc.integer({ min: 2020, max: 2030 }),
                    fc.integer({ min: 1, max: 999 }).map(n => n.toString().padStart(3, '0'))
                ).map(([prefix, year, num]) => `${prefix}-${year}-${num}`),
                // Simple patterns
                fc.string({ minLength: 5, maxLength: 15 })
            ),
            (demandNumber) => {
                const patterns = engine.extractDemandPatterns(demandNumber);
                
                // Should always include the original term (lowercased)
                expect(patterns).toContain(demandNumber.toLowerCase());
                
                // Should be an array with no duplicates
                expect(Array.isArray(patterns)).toBe(true);
                const uniquePatterns = [...new Set(patterns)];
                expect(patterns.length).toBe(uniquePatterns.length);
                
                // Should extract year patterns when present
                const yearMatch = demandNumber.match(/\b(20\d{2})\b/);
                if (yearMatch) {
                    expect(patterns).toContain(yearMatch[1]);
                }
                
                // Should extract prefix patterns when present
                const prefixMatch = demandNumber.match(/^([A-Z]+)/i);
                if (prefixMatch && prefixMatch[1].length >= 2) {
                    expect(patterns).toContain(prefixMatch[1].toLowerCase());
                }
                
                return true;
            }
        ), { numRuns: 50 });
    });

    it('should handle empty and invalid inputs gracefully', () => {
        fc.assert(fc.property(
            fc.array(supportIssueGen, { minLength: 0, maxLength: 10 }),
            fc.oneof(
                fc.constant(''),
                fc.constant(null),
                fc.constant(undefined),
                fc.string({ minLength: 1, maxLength: 5 })
            ),
            (issues, searchTerm) => {
                // Should not throw errors
                expect(() => {
                    const results = engine.searchByDemandNumber(issues, searchTerm);
                    expect(Array.isArray(results)).toBe(true);
                }).not.toThrow();
                
                expect(() => {
                    const enhancedResults = engine.searchByDemandNumberEnhanced(issues, searchTerm);
                    expect(typeof enhancedResults).toBe('object');
                    expect(enhancedResults).toHaveProperty('mainMatches');
                    expect(enhancedResults).toHaveProperty('relatedMatches');
                }).not.toThrow();
                
                return true;
            }
        ), { numRuns: 30 });
    });

    it('should maintain search result consistency across multiple calls', () => {
        fc.assert(fc.property(
            fc.array(supportIssueGen, { minLength: 1, maxLength: 15 }),
            fc.string({ minLength: 3, maxLength: 10 }),
            (issues, searchTerm) => {
                // Multiple calls with same parameters should return identical results
                const result1 = engine.searchByDemandNumber(issues, searchTerm);
                const result2 = engine.searchByDemandNumber(issues, searchTerm);
                
                expect(result1.length).toBe(result2.length);
                expect(result1.map(i => i.id).sort()).toEqual(result2.map(i => i.id).sort());
                
                // Enhanced search should also be consistent
                const enhanced1 = engine.searchByDemandNumberEnhanced(issues, searchTerm);
                const enhanced2 = engine.searchByDemandNumberEnhanced(issues, searchTerm);
                
                expect(enhanced1.totalResults).toBe(enhanced2.totalResults);
                expect(enhanced1.hasExactMatch).toBe(enhanced2.hasExactMatch);
                expect(enhanced1.hasPartialMatch).toBe(enhanced2.hasPartialMatch);
                
                return true;
            }
        ), { numRuns: 30 });
    });
});