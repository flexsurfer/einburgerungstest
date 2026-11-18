import { useCallback } from "react";
import {
  DEFAULT_LANGUAGE,
  formatMistakeCount,
  translate,
} from "@ebtest/shared/i18n";
import type { AppLanguage } from "@ebtest/shared/uklad";
import "../styles/AnswerButton.css";

interface AnswerButtonProps {
  answer: string;
  translation?: string;
  language?: AppLanguage;
  index: number;
  isCorrect: boolean;
  isSelected: boolean;
  showAnswers: boolean;
  disabled: boolean;
  isExamMode: boolean;
  onClick: (index: number) => void;
  userAnswer: number | undefined;
  mistakeCount?: number;
  revealCorrectAnswer?: boolean;
}

export const AnswerButton = ({
  answer,
  translation,
  language = DEFAULT_LANGUAGE,
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
}: AnswerButtonProps) => {
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

  const showSelection = isSelected && (isExamMode || !showAnswers);
  const showCorrect =
    !isExamMode &&
    isCorrect &&
    (showAnswers || revealCorrectAnswer || userAnswer !== undefined);

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
      {(showSelection || showCorrect) && (
        <span className="answer-feedback">
          <span aria-hidden="true">
            {isExamMode ? "●" : isCorrect ? "✓" : "×"}
          </span>
          {!isExamMode && (
            <span className="visually-hidden">
              {translate(
                language,
                isCorrect ? "correctAnswer" : "yourIncorrectAnswer",
              )}
            </span>
          )}
        </span>
      )}
      {mistakeCount > 0 && (
        <span className="mistake-count">
          {formatMistakeCount(language, mistakeCount)}
        </span>
      )}
    </button>
  );
};
