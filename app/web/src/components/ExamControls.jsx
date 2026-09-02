import { memo, useCallback, useEffect, useRef, useState } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { examSecondsRemaining, formatExamTime } from "../exam-time.js";
import "../styles/ExamControls.css";

function useExamCountdown() {
  const runtime = useRuntime();
  const status = useSubscription(
    [appIds.subscriptions.testSessionStatus],
    "ExamTimer",
  );
  const endsAt = useSubscription(
    [appIds.subscriptions.testSessionEndsAt],
    "ExamTimer",
  );
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    endsAt === null ? 0 : examSecondsRemaining(endsAt, Date.now()),
  );
  const expiryDispatched = useRef(false);

  useEffect(() => {
    expiryDispatched.current = false;
    if (status !== "in-progress" || endsAt === null) return undefined;

    const update = () => {
      const nextRemaining = examSecondsRemaining(endsAt, Date.now());
      setRemainingSeconds(nextRemaining);
      if (nextRemaining === 0 && !expiryDispatched.current) {
        expiryDispatched.current = true;
        runtime.dispatch([appIds.events.testSessionFinished, "time-expired"]);
      }
    };

    update();
    const interval = globalThis.setInterval(update, 250);
    return () => globalThis.clearInterval(interval);
  }, [endsAt, runtime, status]);

  return remainingSeconds;
}

export const ExamTimer = memo(() => {
  const remainingSeconds = useExamCountdown();
  const isUrgent = remainingSeconds <= 5 * 60;

  return (
    <div
      aria-label={`${formatExamTime(remainingSeconds)} remaining`}
      className={`exam-timer ${isUrgent ? "urgent" : ""}`}
      role="timer"
    >
      <span aria-hidden="true" className="exam-timer-icon">
        ◷
      </span>
      <span>{formatExamTime(remainingSeconds)}</span>
    </div>
  );
});

export const ExamAnsweredProgress = memo(() => {
  const result = useSubscription(
    [appIds.subscriptions.testSessionResult],
    "ExamAnsweredProgress",
  );
  const progress =
    result.total === 0
      ? 0
      : Math.min(100, Math.round((result.answered / result.total) * 100));

  return (
    <div
      aria-label={`${result.answered} of ${result.total} questions answered`}
      aria-valuemax={result.total}
      aria-valuemin={0}
      aria-valuenow={result.answered}
      aria-valuetext={`${result.answered} of ${result.total} answered`}
      className="exam-answered-progress"
      role="progressbar"
    >
      <div className="exam-progress-track">
        <div className="exam-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="exam-progress-value">
        {result.answered} / {result.total}
      </span>
    </div>
  );
});

export const FinishExamButton = memo(() => {
  const runtime = useRuntime();
  const finishExam = useCallback(() => {
    runtime.dispatch([appIds.events.testSessionFinished, "finished"]);
  }, [runtime]);

  return (
    <button
      aria-label="Finish exam and show result"
      className="finish-exam-button"
      onClick={finishExam}
      type="button"
    >
      Finish exam
    </button>
  );
});

export const DesktopExamControls = memo(() => (
  <div className="desktop-exam-controls">
    <ExamTimer />
    <ExamAnsweredProgress />
    <FinishExamButton />
  </div>
));
