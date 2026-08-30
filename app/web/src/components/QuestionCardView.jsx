import { memo } from "react";
import {
  appIds,
  useSubscription,
} from "@ebtest/shared/uklad";
import { QuestionCard } from "./QuestionCard.jsx";
import { NavigationControls } from "./NavigationControls.jsx";
import { QuestionPicker } from "./QuestionPicker.jsx";
import "../styles/QuestionList.css";

export const QuestionCardView = memo(() => {
  const currentQuestion = useSubscription(
    [appIds.subscriptions.navigationCurrentQuestion],
    "QuestionCardView",
  );

  if (!currentQuestion) {
    return (
      <div className="loading-question">
        <p>Loading question...</p>
      </div>
    );
  }

  return (
    <div className="mobile-question-container">
      <div className="single-question-wrapper">
        <QuestionCard
          key={currentQuestion.globalIndex}
          question={currentQuestion}
        />
      </div>
      <NavigationControls isVisible={true} />
      <QuestionPicker />
    </div>
  );
});
