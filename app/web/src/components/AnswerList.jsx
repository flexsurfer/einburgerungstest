import { useCallback } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { AnswerButton } from "./AnswerButton.jsx";

export const AnswerList = ({ question }) => {
  const runtime = useRuntime();
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

  const isIncorrect =
    !isTestMode &&
    userAnswer !== undefined &&
    userAnswer !== question.correct &&
    !showAnswers;
  const wrongAnswersMode = selectedCategory === "wrong";

  return (
    <div className="answers-container">
      {question.answers.map((answer, index) => (
        <AnswerButton
          key={index}
          answer={answer}
          index={index}
          isCorrect={question.correct === index}
          isSelected={userAnswer === index}
          showAnswers={showAnswers}
          disabled={
            isTestMode
              ? testSessionStatus !== "in-progress" || showAnswers
              : userAnswer !== undefined || showAnswers
          }
          isExamMode={isTestMode}
          onClick={handleAnswerClick}
          userAnswer={userAnswer}
        />
      ))}
      {isIncorrect && (
        <button
          className="try-again-button"
          onClick={() =>
            runtime.dispatch([
              appIds.events.practiceQuestionAnswerCleared,
              question.globalIndex,
            ])
          }
        >
          {wrongAnswersMode ? "Clear answer" : "Try again"}
        </button>
      )}
    </div>
  );
};
