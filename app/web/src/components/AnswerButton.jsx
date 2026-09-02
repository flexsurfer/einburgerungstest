import { useCallback } from "react";
import "../styles/AnswerButton.css";

export const AnswerButton = ({
  answer,
  index,
  isCorrect,
  isSelected,
  showAnswers,
  disabled,
  isExamMode,
  onClick,
  userAnswer,
}) => {
  const getClassName = useCallback(() => {
    const classes = ["answer-button"];

    if (isExamMode) {
      classes.push("exam-mode");
      if (isSelected) {
        classes.push("selected");
      }
    } else if (showAnswers) {
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

    return classes.join(" ");
  }, [showAnswers, isCorrect, userAnswer, isSelected, isExamMode]);

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
      {answer}
    </button>
  );
};
