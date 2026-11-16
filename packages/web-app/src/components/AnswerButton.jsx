import { useCallback } from "react";
import "../styles/AnswerButton.css";

export const AnswerButton = ({
  answer,
  translation,
  index,
  isCorrect,
  isSelected,
  showAnswers,
  disabled,
  isExamMode,
  onClick,
  userAnswer,
  mistakeCount = 0,
  revealCorrectAnswer = false,
}) => {
  const getClassName = useCallback(() => {
    const classes = ["answer-button"];

    if (isExamMode) {
      classes.push("exam-mode");
      if (isSelected) {
        classes.push("selected");
      }
    } else if (showAnswers || revealCorrectAnswer) {
      classes.push("review-mode");
      if (isCorrect) {
        classes.push("correct");
      }
    } else if (userAnswer !== undefined) {
      classes.push("test-mode");
      if (isSelected && !isCorrect) {
        classes.push("incorrect");
      } else if (isCorrect) {
        classes.push("correct");
      }
    }

    if (!isCorrect && mistakeCount > 0) {
      classes.push("mistake");
    }

    return classes.join(" ");
  }, [
    showAnswers,
    isCorrect,
    userAnswer,
    isSelected,
    isExamMode,
    mistakeCount,
    revealCorrectAnswer,
  ]);

  const handleClick = useCallback(() => {
    if (
      !disabled &&
      (isExamMode || (!showAnswers && userAnswer === undefined))
    ) {
      onClick(index);
    }
  }, [disabled, isExamMode, showAnswers, userAnswer, onClick, index]);

  return (
    <button
      className={getClassName()}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={isSelected}
    >
      <span className="answer-copy">
        <span lang="de" dir="ltr">
          {answer}
        </span>
        {translation && <small>{translation}</small>}
      </span>
      {((isSelected && (isExamMode || !showAnswers)) ||
        (!isExamMode &&
          isCorrect &&
          (showAnswers ||
            revealCorrectAnswer ||
            userAnswer !== undefined))) && (
        <span className="answer-feedback" aria-hidden="true">
          {isExamMode ? "●" : isCorrect ? "✓" : "×"}
        </span>
      )}
      {mistakeCount > 0 && (
        <span className="mistake-count">
          {mistakeCount} {mistakeCount === 1 ? "mistake" : "mistakes"}
        </span>
      )}
    </button>
  );
};
