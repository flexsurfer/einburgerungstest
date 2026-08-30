import { useCallback, useEffect } from "react";
import {
  appIds,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";
import "../styles/QuestionPicker.css";

export const QuestionPicker = () => {
  const runtime = useRuntime();
  const showQuestionPicker = useSubscription(
    [appIds.subscriptions.navigationQuestionPickerVisible],
    "QuestionPicker",
  );
  const pickerItems = useSubscription(
    [appIds.subscriptions.navigationQuestionPickerItems],
    "QuestionPicker",
  );

  const handleQuestionSelect = useCallback(
    (index) => {
      runtime.dispatch([appIds.events.navigationQuestionSelected, index]);
    },
    [runtime],
  );

  const handleClose = useCallback(() => {
    runtime.dispatch([appIds.events.navigationQuestionPickerShown, false]);
  }, [runtime]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose],
  );

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showQuestionPicker) {
        handleClose();
      }
    };

    if (showQuestionPicker) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [handleClose, showQuestionPicker]);

  if (!showQuestionPicker || !pickerItems || pickerItems.length === 0) {
    return null;
  }

  return (
    <div className="question-picker-overlay" onClick={handleOverlayClick}>
      <div className="question-picker-modal">
        <div className="question-picker-header">
          <h2 className="question-picker-title">Select Question</h2>
          <button
            className="question-picker-close"
            onClick={handleClose}
            aria-label="Close question picker"
          >
            ✕
          </button>
        </div>

        <div className="question-picker-legend">
          <div className="legend-item">
            <div className="legend-dot correct"></div>
            <span>Correct</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot incorrect"></div>
            <span>Incorrect</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot unanswered"></div>
            <span>Unanswered</span>
          </div>
        </div>

        <div className="question-picker-grid">
          {pickerItems.map((item) => (
            <button
              key={item.key}
              className={item.className}
              onClick={() => handleQuestionSelect(item.filteredIndex)}
              aria-label={item.ariaLabel}
            >
              <span className="question-item-number">{item.number}</span>
              {item.isAnswered && <div className={item.indicatorClass} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
