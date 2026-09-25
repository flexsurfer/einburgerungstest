import { useEffect, useRef } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";
import { UiIcon } from "./UiIcon";
import "../styles/QuestionPicker.css";
export function QuestionPicker() {
  const runtime = useRuntime();
  const { t } = useI18n("QuestionPicker");
  const visible = useSubscription(
    [appIds.subscriptions.navigationQuestionPickerVisible],
    "QuestionPicker",
  );
  const items = useSubscription(
    [appIds.subscriptions.navigationQuestionPickerItems],
    "QuestionPicker",
  );
  const ref = useRef(null);
  const gridRef = useRef(null);
  const close = () =>
    runtime.dispatch([appIds.events.navigationQuestionPickerShown, false]);
  useEffect(() => {
    if (visible && !ref.current.open) {
      ref.current.showModal();
      const selected = gridRef.current.querySelector('[aria-current="true"]');
      if (selected) {
        const grid = gridRef.current;
        grid.scrollTop +=
          selected.getBoundingClientRect().top -
          grid.getBoundingClientRect().top -
          (grid.clientHeight - selected.offsetHeight) / 2;
      }
    } else if (!visible && ref.current.open) ref.current.close();
  }, [visible]);
  return (
    <dialog
      ref={ref}
      className="picker-dialog"
      aria-labelledby="question-picker-title"
      aria-describedby="question-picker-subtitle"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="question-picker-modal">
        <header className="question-picker-header">
          <div>
            <h2 id="question-picker-title" className="question-picker-title">
              {t("selectQuestion")}
            </h2>
            <p
              id="question-picker-subtitle"
              className="question-picker-subtitle"
            >
              {t("jumpToQuestion")}
            </p>
          </div>
          <button
            className="icon-button question-picker-close"
            onClick={close}
            aria-label={t("closeQuestionPicker")}
          >
            <UiIcon name="close" />
          </button>
        </header>
        <div className="question-picker-legend">
          {["correct", "incorrect", "unanswered", "current"].map((status) => (
            <div className={`legend-item ${status}`} key={status}>
              <span className="legend-icon" aria-hidden="true">
                {
                  {
                    correct: "✓",
                    incorrect: "×",
                    unanswered: "",
                    current: "•",
                  }[status]
                }
              </span>
              <span>{t(status)}</span>
            </div>
          ))}
        </div>
        <div ref={gridRef} className="question-picker-grid">
          {items.map((item) => (
            <button
              key={item.key}
              className={item.className}
              aria-current={item.isSelected ? "true" : undefined}
              aria-label={t("questionPickerItem", {
                index: item.filteredIndex + 1,
                number: item.number,
                status: t(
                  item.isAnswered
                    ? item.isCorrect
                      ? "answeredCorrectly"
                      : "answeredIncorrectly"
                    : "unansweredStatus",
                ),
                current: item.isSelected ? t("currentQuestion") : "",
              })}
              onClick={() =>
                runtime.dispatch([
                  appIds.events.navigationQuestionSelected,
                  item.filteredIndex,
                ])
              }
            >
              <span className="question-item-number">
                {item.filteredIndex + 1}
              </span>
              <span className="question-item-global-number">
                #{item.number}
              </span>
              {item.isAnswered ? (
                <span
                  className={`picker-status-badge ${item.isCorrect ? "correct" : "incorrect"}`}
                  aria-hidden="true"
                >
                  {item.isCorrect ? "✓" : "×"}
                </span>
              ) : item.isSelected ? (
                <span
                  className="picker-status-badge current"
                  aria-hidden="true"
                >
                  •
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}
