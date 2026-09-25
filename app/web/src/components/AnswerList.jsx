import { useCallback } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";
import { AnswerButton } from "./AnswerButton.jsx";

export const AnswerList = ({ question, translatedAnswers }) => {
  const runtime = useRuntime();
  const { t } = useI18n("AnswerList");
  const showAnswers = useSubscription(
    [appIds.subscriptions.uiShowAnswers],
    "AnswerList",
  );
  const userAnswer = useSubscription(
    [
      appIds.subscriptions.practiceUserAnswerByQuestionIndex,
      question.globalIndex,
    ],
    "AnswerList",
  );
  const mistakeSummary = useSubscription(
    [
      appIds.subscriptions.practiceMistakeSummaryByQuestionIndex,
      question.globalIndex,
    ],
    "AnswerList",
  );
  const isTestMode = useSubscription(
    [appIds.subscriptions.navigationIsTestMode],
    "AnswerList",
  );
  const selectedCategory = useSubscription(
    [appIds.subscriptions.navigationSelectedCategory],
    "AnswerList",
  );
  const testSessionStatus = useSubscription(
    [appIds.subscriptions.testSessionStatus],
    "AnswerList",
  );

  const handleAnswerClick = useCallback(
    (index) => {
      if (isTestMode && testSessionStatus === "in-progress") {
        runtime.dispatch([
          appIds.events.testSessionAnswerSelected,
          question.globalIndex,
          index,
        ]);
        return;
      }

      if (!showAnswers && userAnswer === undefined) {
        runtime.dispatch([
          appIds.events.practiceQuestionAnswered,
          question.globalIndex,
          index,
        ]);
      }
    },
    [
      runtime,
      showAnswers,
      userAnswer,
      isTestMode,
      testSessionStatus,
      question.globalIndex,
    ],
  );

  const wrongAnswersMode = selectedCategory === "wrong";
  const showAnswerAction =
    !isTestMode &&
    (wrongAnswersMode
      ? mistakeSummary.totalAttempts > 0
      : userAnswer !== undefined);

  const handleAnswerAction = useCallback(() => {
    runtime.dispatch([
      wrongAnswersMode
        ? appIds.events.practiceMistakeRemoved
        : appIds.events.practiceQuestionAnswerCleared,
      question.globalIndex,
    ]);
  }, [runtime, wrongAnswersMode, question.globalIndex]);

  return (
    <div className="answers-container">
      {wrongAnswersMode && mistakeSummary.totalAttempts > 0 && (
        <div className="mistake-summary">
          {t("wrongAttempts", { count: mistakeSummary.totalAttempts })}
        </div>
      )}
      {question.answers.map((answer, index) => (
        <AnswerButton
          key={index}
          answer={answer}
          translation={translatedAnswers?.[index]}
          index={index}
          isCorrect={question.correct === index}
          isSelected={userAnswer === index}
          showAnswers={showAnswers}
          revealCorrectAnswer={wrongAnswersMode}
          disabled={
            isTestMode
              ? testSessionStatus !== "in-progress" || showAnswers
              : wrongAnswersMode || userAnswer !== undefined || showAnswers
          }
          isExamMode={isTestMode}
          onClick={handleAnswerClick}
          userAnswer={userAnswer}
          mistakeCount={
            wrongAnswersMode ? mistakeSummary.answerCounts[index] || 0 : 0
          }
        />
      ))}
      {showAnswerAction && (
        <button
          className={`answer-action-button ${
            wrongAnswersMode ? "remove-mistake" : "clear-answer"
          }`}
          onClick={handleAnswerAction}
        >
          {t(wrongAnswersMode ? "removeFromMistakes" : "clearAnswer")}
        </button>
      )}
    </div>
  );
};
