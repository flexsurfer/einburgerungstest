import { memo, useCallback } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { LeftArrow, RightArrow, DownArrow } from "./Icons";
import {
  ExamAnsweredProgress,
  ExamTimer,
  FinishExamButton,
} from "./ExamControls.jsx";
import "../styles/NavigationControls.css";

export const NavigationControls = memo(({ isVisible = true }) => {
  const runtime = useRuntime();
  const currentQuestionIndex = useSubscription(
    [appIds.subscriptions.navigationCurrentQuestionIndex],
    "NavigationControls",
  );
  const filteredQuestionsCount = useSubscription(
    [appIds.subscriptions.practiceFilteredQuestionsCount],
    "NavigationControls",
  );
  const isTestMode = useSubscription(
    [appIds.subscriptions.navigationIsTestMode],
    "NavigationControls",
  );

  const currentIndex = currentQuestionIndex || 0;
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === filteredQuestionsCount - 1;

  const handlePrevious = useCallback(() => {
    if (!isFirstQuestion) {
      runtime.dispatch([appIds.events.navigationPrevious]);
    }
  }, [runtime, isFirstQuestion]);

  const handleNext = useCallback(() => {
    if (!isLastQuestion) {
      runtime.dispatch([appIds.events.navigationNext]);
    }
  }, [runtime, isLastQuestion]);

  const handleQuestionNumberPress = useCallback(() => {
    runtime.dispatch([appIds.events.navigationQuestionPickerShown, true]);
  }, [runtime]);

  if (!isVisible) {
    return null;
  }

  const navigationRow = (
    <div className="navigation-controls">
      <button
        className={`nav-button ${isFirstQuestion ? "disabled" : ""}`}
        onClick={handlePrevious}
        disabled={isFirstQuestion}
        title="Previous question (← or h key)"
      >
        <LeftArrow />
        Prev
      </button>

      {isTestMode ? (
        <ExamTimer />
      ) : (
        <button
          className="question-number-button"
          onClick={handleQuestionNumberPress}
        >
          <span className="question-number-text">
            {currentIndex + 1} of {filteredQuestionsCount}
          </span>
          <DownArrow />
        </button>
      )}

      <button
        className={`nav-button ${isLastQuestion ? "disabled" : ""}`}
        onClick={handleNext}
        disabled={isLastQuestion}
        title="Next question (→ or l key)"
      >
        Next
        <RightArrow />
      </button>
    </div>
  );

  if (isTestMode) {
    return (
      <div className="mobile-exam-controls">
        {navigationRow}
        <ExamAnsweredProgress />
        <FinishExamButton />
      </div>
    );
  }

  return navigationRow;
});
