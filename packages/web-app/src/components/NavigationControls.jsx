import { memo, useCallback } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { LeftArrow, RightArrow, DownArrow } from "./Icons";
import {
  ExamAnsweredProgress,
  ExamTimer,
  FinishExamButton,
} from "./ExamControls.jsx";
import "../styles/NavigationControls.css";
import { useI18n } from "@ebtest/shared/i18n";

export const NavigationControls = memo(({ isVisible = true }) => {
  const runtime = useRuntime();
  const { t } = useI18n("NavigationControls");
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
        title={t("previousQuestion")}
        aria-label={t("previousQuestion")}
      >
        <LeftArrow />
        {t("previous")}
      </button>

      {isTestMode ? (
        <ExamTimer />
      ) : (
        <button
          className="question-number-button"
          onClick={handleQuestionNumberPress}
        >
          <span className="question-number-text">
            {t("itemOfTotal", {
              current: currentIndex + 1,
              total: filteredQuestionsCount,
            })}
          </span>
          <DownArrow />
        </button>
      )}

      <button
        className={`nav-button ${isLastQuestion ? "disabled" : ""}`}
        onClick={handleNext}
        disabled={isLastQuestion}
        title={t("nextQuestion")}
        aria-label={t("nextQuestion")}
      >
        {t("next")}
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
