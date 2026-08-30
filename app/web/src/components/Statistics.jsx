import { useCallback, memo } from "react";
import {
  appIds,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";
import "../styles/Statistics.css";

export const Statistics = memo(() => {
  const runtime = useRuntime();
  const stats = useSubscription(
    [appIds.subscriptions.practiceStatistics],
    "Statistics",
  );
  const showAnswers = useSubscription(
    [appIds.subscriptions.uiShowAnswers],
    "Statistics",
  );

  const handleClearAnswers = useCallback(() => {
    runtime.dispatch([appIds.events.practiceClearAnswersRequested]);
  }, [runtime]);
  const handleToggleShowAnswers = useCallback(() => {
    runtime.dispatch([appIds.events.uiShowAnswersToggled]);
  }, [runtime]);

  return (
    <div className="statistics-container">
      <div className="statistics-card">
        <div className="statistics-content">
          <div className="stat-item correct">
            <div className="stat-icon">✓</div>
            <span className="stat-number">{stats.correct}</span>
          </div>
          <div className="stat-item incorrect">
            <div className="stat-icon">X</div>
            <span className="stat-number">{stats.incorrect}</span>
          </div>
          <div className="stat-item accuracy" title="Точность ответов">
            <div className="stat-icon">{stats.passed ? "👍" : "😔"}</div>
            <span
              className={`stat-number ${stats.passed ? "stat-number-green" : "stat-number-red"}`}
            >
              {stats.accuracy}%
            </span>
          </div>
          <div className="buttons-group">
            <button
              className={`toggle-button ${showAnswers ? "active" : ""}`}
              onClick={handleToggleShowAnswers}
              title={showAnswers ? "Hide answers" : "Show answers"}
            >
              {showAnswers ? "🙈" : "👁️"} Answers
            </button>
            <button
              className="clear-button"
              onClick={handleClearAnswers}
              title="Clear all answers"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="statistics-footer">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(stats.totalAnswered / stats.totalVisible) * 100}%`,
              }}
            ></div>
          </div>
          <span className="progress-text">
            {stats.totalAnswered}/{stats.totalVisible}
          </span>
        </div>
      </div>
    </div>
  );
});
