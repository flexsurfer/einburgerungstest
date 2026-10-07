import { memo, useCallback, useEffect, useRef } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import "../styles/ExamResult.css";
import { useI18n } from "@ebtest/shared/i18n";

const ResultStat = ({ className, label, value, onClick, reviewLabel }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`${reviewLabel}: ${label} (${value})`}
    className={`exam-result-stat ${className}`}
  >
    <span aria-hidden="true" className="exam-result-stat-dot" />
    <strong>{value}</strong>
    <span>{label}</span>
  </button>
);

export const ExamResultScreen = memo(() => {
  const runtime = useRuntime();
  const { t } = useI18n("ExamResultScreen");
  const titleRef = useRef(null);
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);
  const result = useSubscription(
    [appIds.subscriptions.testSessionResult],
    "ExamResultScreen",
  );
  const finishReason = useSubscription(
    [appIds.subscriptions.testSessionFinishReason],
    "ExamResultScreen",
  );

  const startAgain = useCallback(() => {
    runtime.dispatch([appIds.events.testSessionStarted]);
  }, [runtime]);

  const returnToQuestions = useCallback(() => {
    runtime.dispatch([appIds.events.navigationHomeOpened]);
  }, [runtime]);

  return (
    <section className="exam-result-screen">
      <section className="exam-result-card">
        <p className="exam-result-eyebrow">{t("examResult")}</p>
        <div
          className={`exam-result-score ${result.passed ? "passed" : "failed"}`}
        >
          <strong>{result.correct}</strong>
          <span>{t("scoreOf", { total: result.total })}</span>
        </div>

        <h1 ref={titleRef} tabIndex={-1}>
          {t(result.passed ? "passed" : "notPassed")}
        </h1>
        <p className="exam-result-message">
          {finishReason === "time-expired"
            ? t("timeUp")
            : t("answersEvaluated")}
        </p>
        {result.incorrect > 0 && (
          <p className="exam-result-message">{t("examMistakesSaved")}</p>
        )}

        <div className="exam-result-requirement">
          <strong>{result.requiredCorrect}</strong>
          <span>{t("requiredCorrect")}</span>
        </div>

        <div className="exam-result-stats">
          <ResultStat
            className="correct"
            label={t("correct")}
            value={result.correct}
            reviewLabel={t("reviewAnswers")}
            onClick={() =>
              runtime.dispatch([
                appIds.events.testSessionReviewOpened,
                "correct",
              ])
            }
          />
          <ResultStat
            className="incorrect"
            label={t("incorrect")}
            value={result.incorrect}
            reviewLabel={t("reviewAnswers")}
            onClick={() =>
              runtime.dispatch([
                appIds.events.testSessionReviewOpened,
                "incorrect",
              ])
            }
          />
          <ResultStat
            className="unanswered"
            label={t("unanswered")}
            value={result.unanswered}
            reviewLabel={t("reviewAnswers")}
            onClick={() =>
              runtime.dispatch([
                appIds.events.testSessionReviewOpened,
                "unanswered",
              ])
            }
          />
        </div>

        <button
          className="exam-result-primary"
          onClick={() =>
            runtime.dispatch([appIds.events.testSessionReviewOpened])
          }
          type="button"
        >
          {t("reviewAnswers")}
        </button>
        <button
          className="exam-result-secondary"
          onClick={startAgain}
          type="button"
        >
          {t("takeAnotherExam")}
        </button>
        <button
          className="exam-result-home"
          onClick={returnToQuestions}
          type="button"
        >
          {t("backToHome")}
        </button>
      </section>
    </section>
  );
});
