import { stateKeys } from "../../app/uklad/catalog.js";
import type {
  CategoryGroup,
  FederalLand,
  Question,
  TestUsedQuestions,
} from "../../app/uklad/contracts.js";

export interface TestSessionDraftState {
  [stateKeys.questionsItems]: Question[];
  [stateKeys.questionsCategories]: CategoryGroup[];
  [stateKeys.testSessionQuestions]: Question[];
  [stateKeys.testSessionAnswers]: Record<number, number>;
  [stateKeys.testSessionUsedQuestions]: TestUsedQuestions;
  [stateKeys.preferencesSelectedLand]: FederalLand | null;
}

const LAND_QUESTION_COUNT = 3;

export function shuffle<T>(
  values: T[],
  random: () => number = Math.random,
): T[] {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values;
}

export function calculateAllocation(
  topicSizes: Record<string, number>,
  sampleSize: number,
): Record<string, number> {
  const topics = Object.keys(topicSizes);
  const total = topics.reduce((sum, topic) => sum + topicSizes[topic], 0);
  const allocation: Record<string, number> = {};

  topics.forEach((topic) => {
    allocation[topic] = 1;
  });

  const remaining = sampleSize - topics.length;
  if (remaining <= 0) return allocation;

  let allocated = 0;
  topics.forEach((topic, index) => {
    if (index === topics.length - 1) {
      allocation[topic] += remaining - allocated;
      return;
    }

    const share =
      total === 0 ? 0 : Math.round((topicSizes[topic] / total) * remaining);
    const safeShare = Math.max(0, share);
    allocation[topic] += safeShare;
    allocated += safeShare;
  });

  return allocation;
}

function selectTopicQuestions(
  topic: string,
  topicQuestions: Question[],
  allocatedNumber: number,
  usedQuestions: TestUsedQuestions,
  random: () => number,
): Question[] {
  const currentTopicUsed = usedQuestions[topic];
  const fresh = currentTopicUsed
    ? topicQuestions.filter(
        (question) => !currentTopicUsed[String(question.id)],
      )
    : topicQuestions;

  let selected: Question[];
  if (fresh.length >= allocatedNumber) {
    shuffle(fresh, random);
    selected = fresh.slice(0, allocatedNumber);
    if (!currentTopicUsed) usedQuestions[topic] = {};
  } else {
    const remaining = topicQuestions.filter(
      (question) => !fresh.includes(question),
    );
    shuffle(remaining, random);
    selected = [
      ...fresh,
      ...remaining.slice(0, allocatedNumber - fresh.length),
    ];
    usedQuestions[topic] = {};
  }

  selected.forEach((question) => {
    usedQuestions[topic][String(question.id)] = true;
  });
  return selected;
}

/**
 * Generate 30 general questions, then append three randomized questions from
 * the selected Land. Without a selected Land, preserve the generic sampler so
 * headless fixtures and pre-onboarding state remain deterministic.
 */
export function generateTest(
  draftState: TestSessionDraftState,
  sampleSize = 30,
  random: () => number = Math.random,
): void {
  const selectedLand = draftState[stateKeys.preferencesSelectedLand];
  const themes =
    draftState[stateKeys.questionsCategories]
      .find((group) => group.title === "Themes")
      ?.items.map(([category]) => category)
      .filter((category) => category !== selectedLand) ?? [];
  const questionsByTopic: Record<string, Question[]> = {};

  themes.forEach((theme) => {
    questionsByTopic[theme] = draftState[stateKeys.questionsItems]
      .filter((question) => question.category === theme)
      .map((question) => ({ ...question, id: question.globalIndex }));
  });

  const topics = Object.keys(questionsByTopic);
  const topicSizes = Object.fromEntries(
    topics.map((topic) => [topic, questionsByTopic[topic].length]),
  );
  const allocation = calculateAllocation(topicSizes, sampleSize);
  const usedQuestions = draftState[stateKeys.testSessionUsedQuestions];
  const selectedQuestions: Question[] = [];

  topics.forEach((topic) => {
    const topicQuestions = [...questionsByTopic[topic]];
    const allocatedNumber = allocation[topic];
    selectedQuestions.push(
      ...selectTopicQuestions(
        topic,
        topicQuestions,
        allocatedNumber,
        usedQuestions,
        random,
      ),
    );
  });

  selectedQuestions.sort((left, right) => left.globalIndex - right.globalIndex);

  if (selectedLand) {
    const landQuestions = draftState[stateKeys.questionsItems]
      .filter((question) => question.category === selectedLand)
      .map((question) => ({ ...question, id: question.globalIndex }));
    selectedQuestions.push(
      ...selectTopicQuestions(
        selectedLand,
        landQuestions,
        Math.min(LAND_QUESTION_COUNT, landQuestions.length),
        usedQuestions,
        random,
      ),
    );
  }

  draftState[stateKeys.testSessionQuestions] = selectedQuestions;
  draftState[stateKeys.testSessionAnswers] = {};
}
