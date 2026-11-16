import { FEDERAL_LANDS, type QuestionInput } from "@ebtest/shared/uklad";

function question(category: string, number: number): QuestionInput {
  return {
    question: `Fixture question ${category} ${number}`,
    category,
    correct: number % 4,
    answers: ["Answer A", "Answer B", "Answer C", "Answer D"],
    explanation: "Fixture explanation",
  };
}

// Keep realistic counts and indices for navigation/exam tests without shipping
// the real catalogue or depending on an application host.
export const fixtureQuestions: QuestionInput[] = [
  ...Array.from({ length: 300 }, (_, index) =>
    question(index % 2 === 0 ? "Politik" : "Recht", index + 1),
  ),
  ...FEDERAL_LANDS.flatMap((land) =>
    Array.from({ length: 10 }, (_, index) => question(land, index + 1)),
  ),
];
