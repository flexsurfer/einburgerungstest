import { describe, it, expect } from 'vitest';
import { shuffle, calcAllocation, generateTest } from '../src/test';

// Helper function to create mock draftDb with the expected structure
function createMockDraftDb(questionsData, usedTestQuestions = {}) {
    // Convert old question format to new format
    const questions = [];
    const categoryItems = [];
    let globalIndex = 1;
    
    Object.entries(questionsData).forEach(([category, categoryQuestions]) => {
        categoryItems.push([category, categoryQuestions.length]);
        categoryQuestions.forEach(q => {
            // Add category and globalIndex to original question object, not a copy
            q.category = category;
            q.globalIndex = q.id || globalIndex++;
            questions.push(q);
        });
    });

    return {
        categories: [
            { title: 'Themes', items: categoryItems }
        ],
        questions,
        usedTestQuestions,
        testQuestions: [],
        testAnswers: {}
    };
}

describe('shuffle', () => {
    it('shuffles an array', () => {
        const arr = [1, 2, 3, 4, 5];
        const original = [...arr];
        shuffle(arr);
        expect(arr).not.toEqual(original);
        expect(arr.sort()).toEqual(original.sort());
    });
});

describe('calcAllocation', () => {
    it('allocates proportionally with simple rounding', () => {
        const topicSizes = { A: 10, B: 20, C: 30 };
        const result = calcAllocation(topicSizes, 15);
        // Simple proportional: A=10/60*15=2.5→3, B=20/60*15=5, C gets remainder=7
        expect(result.A).toBe(3);
        expect(result.B).toBe(5);
        expect(result.C).toBe(7);
    });

    it('allocates all to largest topic when others are too small', () => {
        const topicSizes = { A: 1, B: 1, C: 100 };
        const result = calcAllocation(topicSizes, 5);
        // With minimum 1 per topic: A=1, B=1, remaining 3 go mostly to C
        expect(result.A).toBe(1);
        expect(result.B).toBe(1);
        expect(result.C).toBe(3);
    });
});

describe('generateTest', () => {
    const mockQuestions = {
        Topic1: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        Topic2: [{ id: 5 }, { id: 6 }]
    };
    const mockUsed = { Topic1: {"1": true, "2": true}, Topic2: {} };

    it('generates test with fresh questions', () => {
        const draftDb = createMockDraftDb(mockQuestions, mockUsed);
        generateTest(draftDb, 4);
        expect(draftDb.testQuestions.length).toBe(4);
        // With minimum 1 per topic: Topic1 gets 2, Topic2 gets 2
        // Topic1: 2 existing + 2 selected = 4 total, Topic2: 2 selected
        expect(Object.keys(draftDb.usedTestQuestions.Topic1).length).toBe(4); // 2 existing + 2 new = all 4 questions
        expect(Object.keys(draftDb.usedTestQuestions.Topic2).length).toBe(2); // 2 new
    });

    it('falls back to used when fresh are insufficient', () => {
        const smallMock = { Topic1: [{ id: 1 }, { id: 2 }] };
        const allUsed = { Topic1: {"1": true, "2": true} };
        const draftDb = createMockDraftDb(smallMock, allUsed);
        generateTest(draftDb, 2);
        expect(draftDb.testQuestions.length).toBe(2);
        // Should reset usage and reuse all questions
        expect(Object.keys(draftDb.usedTestQuestions.Topic1).length).toBe(2);
    });

    it('updates used correctly', () => {
        const draftDb = createMockDraftDb(mockQuestions, {});
        generateTest(draftDb, 3);
        // Topic1 gets 2 questions, Topic2 gets 1 question (min 1 per topic)
        expect(Object.keys(draftDb.usedTestQuestions.Topic1).length).toBe(2);
        expect(Object.keys(draftDb.usedTestQuestions.Topic2).length).toBe(1);
    });

    it('handles multiple generations correctly', () => {
        let used = { Topic1: {"1": true, "2": true}, Topic2: {} };
        const draftDb1 = createMockDraftDb(mockQuestions, used);
        generateTest(draftDb1, 4);
        expect(draftDb1.testQuestions.length).toBe(4);
        // With equal distribution: Topic1 gets 2, Topic2 gets 2
        // Topic1: 2 existing + 2 selected = 4 total, Topic2: 2 selected
        expect(Object.keys(draftDb1.usedTestQuestions.Topic1).length).toBe(4);
        expect(Object.keys(draftDb1.usedTestQuestions.Topic2).length).toBe(2);

        const draftDb2 = createMockDraftDb(mockQuestions, draftDb1.usedTestQuestions);
        generateTest(draftDb2, 2);
        expect(draftDb2.testQuestions.length).toBe(2);
        // After second generation, both topics exhausted and reset
        expect(Object.keys(draftDb2.usedTestQuestions.Topic1).length).toBe(1);
        expect(Object.keys(draftDb2.usedTestQuestions.Topic2).length).toBe(1);
    });

    // === NEW COMPREHENSIVE TESTS ===

    describe('Edge cases and boundary conditions', () => {
        it('handles empty topics', () => {
            const questionsData = { EmptyTopic: [{ id: 1 }] };
            const draftDb = createMockDraftDb(questionsData, {});
            generateTest(draftDb, 2);

            // Can only generate 1 question since that's all that exists in the topic
            expect(draftDb.testQuestions.length).toBe(1);
            expect(draftDb.testQuestions.every(q => q.id === 1)).toBe(true);
        });

        it('handles requesting more questions than available', () => {
            const questionsData = { Topic: [{ id: 1 }, { id: 2 }] };
            const draftDb = createMockDraftDb(questionsData, {});
            generateTest(draftDb, 10);

            expect(draftDb.testQuestions.length).toBe(2);
        });

    });

    describe('Fresh vs used question selection', () => {
        it('prioritizes fresh questions over used ones', () => {
            const questionsData = {
                Topic: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
            };
            const used = { Topic: {"1": true, "2": true} }; // IDs 1,2 are used
            const draftDb = createMockDraftDb(questionsData, used);
            generateTest(draftDb, 2);

            // Should get fresh questions (IDs 3,4) not used ones (IDs 1,2)
            expect(draftDb.testQuestions.length).toBe(2);
            const resultIds = draftDb.testQuestions.map(q => q.id);
            expect(resultIds.includes(3) || resultIds.includes(4)).toBe(true);
        });

        it('falls back to used questions when fresh are exhausted', () => {
            const questionsData = {
                Topic: [{ id: 1 }, { id: 2 }]
            };
            const used = { Topic: {"1": true} }; // Only ID 1 is used, ID 2 is fresh
            const draftDb = createMockDraftDb(questionsData, used);
            generateTest(draftDb, 2);

            expect(draftDb.testQuestions.length).toBe(2);
            const resultIds = draftDb.testQuestions.map(q => q.id);
            expect(resultIds).toContain(2); // Fresh question
            expect(resultIds).toContain(1); // Used question (fallback)
        });

        it('handles all questions being used', () => {
            const questionsData = {
                Topic1: [{ id: 1 }, { id: 2 }],
                Topic2: [{ id: 3 }, { id: 4 }]
            };
            const used = {
                Topic1: {"1": true, "2": true},
                Topic2: {"3": true, "4": true}
            }; // All questions used

            const draftDb = createMockDraftDb(questionsData, used);
            generateTest(draftDb, 3);
            expect(draftDb.testQuestions.length).toBe(3);
        });
    });

    describe('Real-world German citizenship test scenarios', () => {
        // Simulate real German citizenship test structure
        const germanTestQuestions = {
            'Leben in der Demokratie': Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })),
            'Geschichte und Verantwortung': Array.from({ length: 50 }, (_, i) => ({ id: i + 51 })),
            'Mensch und Gesellschaft': Array.from({ length: 50 }, (_, i) => ({ id: i + 101 })),
            'Baden-Württemberg': Array.from({ length: 10 }, (_, i) => ({ id: i + 151 }))  // State-specific
        };

        it('generates standard 33-question test', () => {
            const draftDb = createMockDraftDb(germanTestQuestions, {});
            generateTest(draftDb, 33);

            expect(draftDb.testQuestions.length).toBe(33);

            // Check that questions come from all topics
            const questionIds = draftDb.testQuestions.map(q => q.id);
            expect(questionIds.some(id => id <= 50)).toBe(true); // Leben in der Demokratie
            expect(questionIds.some(id => id > 50 && id <= 100)).toBe(true); // Geschichte
            expect(questionIds.some(id => id > 100 && id <= 150)).toBe(true); // Mensch und Gesellschaft
            expect(questionIds.some(id => id > 150)).toBe(true); // Baden-Württemberg
        });

        it('handles repeated test taking with auto-reset behavior', () => {
            let currentUsed = {};
            const testResults = [];

            // Simulate taking 5 tests
            for (let i = 0; i < 5; i++) {
                const draftDb = createMockDraftDb(germanTestQuestions, currentUsed);
                generateTest(draftDb, 33);
                testResults.push({questions: draftDb.testQuestions});
                currentUsed = draftDb.usedTestQuestions;
            }

            // Each test should have 33 questions
            testResults.forEach(result => {
                expect(result.questions.length).toBe(33);
            });

            // With auto-reset logic, topics reset when exhausted, so we won't necessarily
            // have all 160 questions marked as used simultaneously
            const totalUsedAfter5Tests = Object.values(currentUsed)
                .reduce((sum, topicUsed) => sum + Object.keys(topicUsed).length, 0);

            // Should have used a significant portion of questions, but topics may have reset
            expect(totalUsedAfter5Tests).toBeGreaterThanOrEqual(100);
            expect(totalUsedAfter5Tests).toBeLessThanOrEqual(160);

            // All topics should have some questions marked as used
            Object.keys(germanTestQuestions).forEach(topic => {
                expect(currentUsed[topic]).toBeDefined();
                expect(Object.keys(currentUsed[topic]).length).toBeGreaterThan(0);
            });
        });

        it('handles uneven topic sizes correctly', () => {
            const unevenQuestions = {
                'Large Topic': Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })),
                'Small Topic': Array.from({ length: 5 }, (_, i) => ({ id: i + 101 }))
            };

            const draftDb = createMockDraftDb(unevenQuestions, {});
            generateTest(draftDb, 30);
            expect(draftDb.testQuestions.length).toBe(30);

            // With minimum 1 per topic: Large gets 28, Small gets 2
            const largeQuestions = draftDb.testQuestions.filter(q => q.id <= 100);
            const smallQuestions = draftDb.testQuestions.filter(q => q.id > 100);

            expect(largeQuestions.length).toBe(28);
            expect(smallQuestions.length).toBe(2);
        });
    });

    describe('updatedUsed tracking correctness', () => {
        it('preserves existing used questions and adds new ones or resets when exhausted', () => {
            const questionsData = {
                Topic: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
            };
            const used = { Topic: {"1": true, "2": true} }; // 2 questions already used

            const draftDb = createMockDraftDb(questionsData, used);
            generateTest(draftDb, 3);
            expect(draftDb.testQuestions.length).toBe(3);

            console.log("Object.keys(draftDb.usedTestQuestions.Topic)", Object.keys(draftDb.usedTestQuestions.Topic));
            // With 4 total questions, 2 already used, requesting 3 questions:
            // Topic gets all 3 questions allocated, but only 2 fresh available
            expect(Object.keys(draftDb.usedTestQuestions.Topic).length).toBe(3);
        });

        it('converts all ID formats to strings for consistency', () => {
            const questionsData = {
                Topic: [{ id: 1 }, { id: 2 }, { id: 3 }]
            };
            const used = { Topic: {"1": true, "2": true} }; // String IDs as keys with boolean values

            const draftDb = createMockDraftDb(questionsData, used);
            generateTest(draftDb, 2);

            // All keys should be strings
            Object.keys(draftDb.usedTestQuestions.Topic).forEach(id => {
                expect(typeof id).toBe('string');
            });
        });
    });

    describe('Randomization and distribution', () => {
        it('produces different question orders on multiple runs', () => {
            const questionsData = {
                Topic: Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }))
            };

            const draftDb1 = createMockDraftDb(questionsData, {});
            generateTest(draftDb1, 10);
            const draftDb2 = createMockDraftDb(questionsData, {});
            generateTest(draftDb2, 10);

            const ids1 = draftDb1.testQuestions.map(q => q.id);
            const ids2 = draftDb2.testQuestions.map(q => q.id);

            // Very unlikely to get same order twice with proper shuffling
            expect(ids1).not.toEqual(ids2);
        });

        it('maintains proportional distribution across topics', () => {
            const questionsData = {
                BigTopic: Array.from({ length: 60 }, (_, i) => ({ id: i + 1 })),
                MediumTopic: Array.from({ length: 30 }, (_, i) => ({ id: i + 61 })),
                SmallTopic: Array.from({ length: 10 }, (_, i) => ({ id: i + 91 }))
            };

            const draftDb = createMockDraftDb(questionsData, {});
            generateTest(draftDb, 30);

            const bigTopicCount = draftDb.testQuestions.filter(q => q.id <= 60).length;
            const mediumTopicCount = draftDb.testQuestions.filter(q => q.id > 60 && q.id <= 90).length;
            const smallTopicCount = draftDb.testQuestions.filter(q => q.id > 90).length;

            // BigTopic should get roughly 60% of questions (18/30)
            expect(bigTopicCount).toBeGreaterThan(15);
            expect(bigTopicCount).toBeLessThan(21);

            // MediumTopic should get roughly 30% of questions (9/30)
            expect(mediumTopicCount).toBeGreaterThan(6);
            expect(mediumTopicCount).toBeLessThan(12);

            // SmallTopic should get at least 1 question
            expect(smallTopicCount).toBeGreaterThan(0);
        });
    });

    describe('Performance and memory considerations', () => {
        it('handles large question sets efficiently', () => {
            const largeQuestions = {
                Topic1: Array.from({ length: 1000 }, (_, i) => ({ id: i + 1 })),
                Topic2: Array.from({ length: 1000 }, (_, i) => ({ id: i + 1001 }))
            };

            const startTime = Date.now();
            const draftDb = createMockDraftDb(largeQuestions, {});
            generateTest(draftDb, 100);
            const endTime = Date.now();

            expect(draftDb.testQuestions.length).toBe(100);
            expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
        });

        it('creates shallow copies of question objects', () => {
            const originalQuestion = { id: 1, text: 'Original text', metadata: { difficulty: 'hard' } };
            const questionsData = { Topic: [originalQuestion] };

            const draftDb = createMockDraftDb(questionsData, {});
            generateTest(draftDb, 1);

            const resultQuestion = draftDb.testQuestions[0];
            // Should be a different object (shallow copy)
            expect(resultQuestion).not.toBe(originalQuestion);
            // Primitive properties copied
            expect(resultQuestion.text).toBe(originalQuestion.text);
            // Object references preserved (shallow)
            expect(resultQuestion.metadata).toBe(originalQuestion.metadata);
            // Added id property
            expect(resultQuestion.id).toBe(1);
        });
    });

    // === ADDITIONAL EDGE CASES AND STRESS TESTS ===

    describe('Additional edge cases and stress tests', () => {
        it('handles topics with single questions correctly', () => {
            const questionsData = {
                SingleQuestion: [{ id: 1 }],
                AnotherSingle: [{ id: 2 }],
                RegularTopic: [{ id: 3 }, { id: 4 }, { id: 5 }]
            };

            const draftDb = createMockDraftDb(questionsData, {});
            generateTest(draftDb, 4);
            expect(draftDb.testQuestions.length).toBe(4);

            // Each single-question topic should contribute exactly 1 question
            const questionIds = draftDb.testQuestions.map(q => q.id);
            expect(questionIds).toContain(1);
            expect(questionIds).toContain(2);
        });

        it('handles very large sample sizes gracefully', () => {
            const questionsData = {
                SmallTopic: [{ id: 1 }, { id: 2 }]
            };

            const draftDb = createMockDraftDb(questionsData, {});
            generateTest(draftDb, 1000);
            expect(draftDb.testQuestions.length).toBe(2); // Can't generate more than available
        });

        it('maintains randomness across multiple small generations', () => {
            const questionsData = {
                Topic: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }))
            };

            const results = [];
            for (let i = 0; i < 10; i++) {
                const draftDb = createMockDraftDb(questionsData, {});
                generateTest(draftDb, 3);
                results.push(draftDb.testQuestions.map(q => q.id).sort());
            }

            // Check that we get different combinations
            const uniqueResults = new Set(results.map(r => r.join(',')));
            expect(uniqueResults.size).toBeGreaterThan(1);
        });

        it('handles partial topic exhaustion correctly', () => {
            const questionsData = {
                ExhaustedTopic: [{ id: 1 }, { id: 2 }],
                FreshTopic: [{ id: 10 }, { id: 11 }, { id: 12 }, { id: 13 }]
            };
            const used = { ExhaustedTopic: {"1": true, "2": true}, FreshTopic: {} };

            const draftDb = createMockDraftDb(questionsData, used);
            generateTest(draftDb, 4);
            expect(draftDb.testQuestions.length).toBe(4);

            // With minimum 1 per topic: both topics get 2 questions each
            // ExhaustedTopic resets and uses any 2, FreshTopic uses 2 fresh
            const questionIds = draftDb.testQuestions.map(q => q.id);
            expect(questionIds.filter(id => id >= 10).length).toBe(2); // 2 from FreshTopic
            expect(questionIds.filter(id => id <= 2).length).toBe(2);  // 2 from ExhaustedTopic (reset)
        });
    });

    describe('German citizenship test realistic scenarios', () => {
        // Based on real German citizenship test requirements
        const realGermanTestStructure = {
            'Leben in der Demokratie': Array.from({ length: 70 }, (_, i) => ({
                id: i + 1,
                difficulty: i % 3 === 0 ? 'hard' : 'medium'
            })),
            'Geschichte und Verantwortung': Array.from({ length: 60 }, (_, i) => ({
                id: i + 71,
                difficulty: i % 4 === 0 ? 'hard' : 'easy'
            })),
            'Mensch und Gesellschaft': Array.from({ length: 70 }, (_, i) => ({
                id: i + 131,
                difficulty: 'medium'
            })),
            'Bayern': Array.from({ length: 10 }, (_, i) => ({
                id: i + 201,
                state: 'Bayern'
            }))
        };

        it('simulates realistic user progression through multiple test sessions', () => {
            let currentUsed = {};
            const testSessions = [];

            // Simulate 10 test sessions over time
            for (let session = 1; session <= 10; session++) {
                const draftDb = createMockDraftDb(realGermanTestStructure, currentUsed);
                generateTest(draftDb, 33);
                const questions = draftDb.testQuestions;
                testSessions.push({
                    session,
                    questions: questions.length,
                    categories: {
                        democracy: questions.filter(q => q.id >= 1 && q.id <= 70).length,
                        history: questions.filter(q => q.id >= 71 && q.id <= 130).length,
                        society: questions.filter(q => q.id >= 131 && q.id <= 200).length,
                        regional: questions.filter(q => q.id >= 201).length
                    }
                });
                currentUsed = draftDb.usedTestQuestions;
            }

            // Each session should have 33 questions
            testSessions.forEach(session => {
                expect(session.questions).toBe(33);
                // Regional questions should always be present (Bayern state)
                expect(session.categories.regional).toBeGreaterThan(0);
                // Should have questions from multiple categories
                const categoriesWithQuestions = Object.values(session.categories).filter(count => count > 0).length;
                expect(categoriesWithQuestions).toBeGreaterThanOrEqual(3);
            });
        });

        it('handles state-specific question requirements', () => {
            const stateQuestions = {
                'National Topic 1': Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })),
                'National Topic 2': Array.from({ length: 100 }, (_, i) => ({ id: i + 101 })),
                'Baden-Württemberg': Array.from({ length: 10 }, (_, i) => ({ id: i + 201, state: 'BW' })),
                'Bayern': Array.from({ length: 10 }, (_, i) => ({ id: i + 211, state: 'BY' }))
            };

            const draftDb = createMockDraftDb(stateQuestions, {});
            generateTest(draftDb, 33);

            // Should include questions from both national topics and at least one state
            const questionIds = draftDb.testQuestions.map(q => q.id);
            const hasNational1 = questionIds.some(id => id >= 1 && id <= 100);
            const hasNational2 = questionIds.some(id => id >= 101 && id <= 200);
            const hasStateQuestions = questionIds.some(id => id >= 201);

            expect(hasNational1).toBe(true);
            expect(hasNational2).toBe(true);
            expect(hasStateQuestions).toBe(true);
        });

        it('maintains question distribution with progressive difficulty', () => {
            const difficultyBasedQuestions = {
                'Easy Questions': Array.from({ length: 50 }, (_, i) => ({
                    id: i + 1,
                    difficulty: 'easy'
                })),
                'Medium Questions': Array.from({ length: 100 }, (_, i) => ({
                    id: i + 51,
                    difficulty: 'medium'
                })),
                'Hard Questions': Array.from({ length: 30 }, (_, i) => ({
                    id: i + 151,
                    difficulty: 'hard'
                }))
            };

            const draftDb = createMockDraftDb(difficultyBasedQuestions, {});
            generateTest(draftDb, 30);

            // Should have a good mix of difficulties
            const difficulties = draftDb.testQuestions.map(q => q.difficulty);
            const easyCount = difficulties.filter(d => d === 'easy').length;
            const mediumCount = difficulties.filter(d => d === 'medium').length;
            const hardCount = difficulties.filter(d => d === 'hard').length;

            // Medium should be most common (largest pool)
            expect(mediumCount).toBeGreaterThan(easyCount);
            expect(mediumCount).toBeGreaterThan(hardCount);

            // All difficulties should be represented
            expect(easyCount).toBeGreaterThan(0);
            expect(mediumCount).toBeGreaterThan(0);
            expect(hardCount).toBeGreaterThan(0);
        });
    });
}); 