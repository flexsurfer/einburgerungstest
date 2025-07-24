// Fisher–Yates
export function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Simple proportional allocation - distributes questions across topics by size
 * Ensures each topic gets at least 1 question when possible
 */
export function calcAllocation(topicSizes, sampleSize) {
    const topics = Object.keys(topicSizes)
    const total = topics.reduce((sum, topic) => sum + topicSizes[topic], 0);
    const allocation = {};

    // Step 1: Give each topic at least 1 question
    topics.forEach(topic => {
        allocation[topic] = 1;
    });

    // Step 2: Distribute remaining questions proportionally
    const remaining = sampleSize - topics.length;
    if (remaining > 0) {
        let allocated = 0;

        topics.forEach((topic, index) => {
            if (index === topics.length - 1) {
                // Last topic gets remaining questions
                allocation[topic] += remaining - allocated;
            } else {
                const share = Math.round(topicSizes[topic] / total * remaining);
                allocation[topic] += Math.max(0, share);
                allocated += Math.max(0, share);
            }
        });
    }

    return allocation;
}

/**
 * Simple test generation - auto-resets topic usage when exhausted
 */
export function generateTest(draftDb, sampleSize = 30) {

    const themes = draftDb.categories.find(g => g.title === 'Themes')?.items.map(([cat]) => cat) || [];
    const questionsByTopic = {};
    themes.forEach(theme => {
      questionsByTopic[theme] = draftDb.questions.filter(q => q.category === theme).map(q => ({ ...q, id: q.globalIndex }));
    });

    const topics = Object.keys(questionsByTopic);

    // Calculate topic sizes (total questions per topic)
    const topicSizes = {};
    topics.forEach(topic => {
        topicSizes[topic] = questionsByTopic[topic].length;
    });

    const allocation = calcAllocation(topicSizes, sampleSize);

    const usedQuestions = draftDb.usedTestQuestions;

    // Select questions for each topic
    const selectedQuestions = [];
    topics.forEach(topic => {
        const topicQuestions = [...questionsByTopic[topic]];
        const allocatedNumber = allocation[topic];
        const currentTopicUsed = usedQuestions[topic];

        let fresh;
        if (currentTopicUsed) {
            fresh = topicQuestions.filter(q => !currentTopicUsed[String(q.id)]);
        } else {
            fresh = topicQuestions;
        }

        let selected;
        if (fresh.length >= allocatedNumber) {
            // Enough fresh questions available
            shuffle(fresh);
            selected = fresh.slice(0, allocatedNumber);
            if (!currentTopicUsed) {
                usedQuestions[topic] = {};
            }
        } else {
            // Not enough fresh questions - reset topic usage and start over
            const remaining = topicQuestions.filter(q => !fresh.includes(q));
            shuffle(remaining);
            selected = [...fresh, ...remaining.slice(0, allocatedNumber - fresh.length)];
            // Reset usage for this topic
            usedQuestions[topic] = {};
        }

        selected.forEach(q => usedQuestions[topic][String(q.id)] = true);
        selectedQuestions.push(...selected);
    });

    selectedQuestions.sort((a, b) => a.globalIndex - b.globalIndex);

    draftDb.testQuestions = selectedQuestions;
    draftDb.testAnswers = {};
}

