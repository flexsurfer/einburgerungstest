import { memo, useCallback } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import "../styles/ExamResult.css";

const ResultStat = ({ className, label, value }) => (
  <div className={`exam-result-stat ${className}`}>
    <span aria-hidden="true" className="exam-result-stat-dot" />
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
);

export const ExamResultScreen = memo(() => {
  const runtime = useRuntime();
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
    runtime.dispatch([appIds.events.navigationCategorySelected, null]);
  }, [runtime]);

  return (
    <main className="exam-result-screen">
      <section className="exam-result-card">
        <p className="exam-result-eyebrow">EXAM RESULT</p>
        <div
          className={`exam-result-score ${result.passed ? "passed" : "failed"}`}
        >
          <strong>{result.correct}</strong>
          <span>of {result.total}</span>
        </div>

        <h1>{result.passed ? "You passed" : "Not passed yet"}</h1>
        <p className="exam-result-message">
          {finishReason === "time-expired"
            ? "Time is up. Your saved answers have been evaluated."
            : "Your saved answers have been evaluated."}
        </p>

        <div className="exam-result-requirement">
          <strong>{result.requiredCorrect}</strong>
          <span>correct answers are required to pass the official test.</span>
        </div>

        <div className="exam-result-stats">
          <ResultStat
            className="correct"
            label="Correct"
            value={result.correct}
          />
          <ResultStat
            className="incorrect"
            label="Incorrect"
            value={result.incorrect}
          />
          <ResultStat
            className="unanswered"
            label="Unanswered"
            value={result.unanswered}
          />
        </div>

        <button
          className="exam-result-primary"
          onClick={startAgain}
          type="button"
        >
          Take another exam
        </button>
        <button
          className="exam-result-secondary"
          onClick={returnToQuestions}
          type="button"
        >
          Return to all questions
        </button>
      </section>
    </main>
  );
});
