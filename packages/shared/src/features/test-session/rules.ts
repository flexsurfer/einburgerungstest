/**
 * Official Einbürgerungstest rules.
 *
 * Sources:
 * - https://www.gesetze-im-internet.de/einbtestv/__1.html
 * - https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Einbuergerung/einbuergerung-node.html
 */
export const EINBUERGERUNGSTEST_RULES = Object.freeze({
  generalQuestionCount: 30,
  landQuestionCount: 3,
  totalQuestionCount: 33,
  answerOptionsPerQuestion: 4,
  durationMinutes: 60,
  passingCorrectAnswerCount: 17,
});

export const EINBUERGERUNGSTEST_DURATION_MS =
  EINBUERGERUNGSTEST_RULES.durationMinutes * 60 * 1_000;
