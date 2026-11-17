import { memo, useEffect, useLayoutEffect, useRef } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { QuestionCard } from "./QuestionCard";
import { NavigationControls } from "./NavigationControls";
import { QuestionPicker } from "./QuestionPicker";
import "../styles/QuestionList.css";
import { useI18n } from "@ebtest/shared/i18n";

function BottomNavigation() {
  const panelRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const spacer = spacerRef.current;
    if (!panel || !spacer) return;
    const updateHeight = () => {
      spacer.style.height = `${panel.getBoundingClientRect().height}px`;
    };
    updateHeight();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }
    const observer = new ResizeObserver(updateHeight);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={spacerRef}
        className="question-navigation-spacer"
        aria-hidden="true"
      />
      <div ref={panelRef} className="question-navigation-panel">
        <div className="question-navigation-inner">
          <NavigationControls isVisible={true} />
        </div>
      </div>
    </>
  );
}

export const QuestionCardView = memo(() => {
  const runtime = useRuntime();
  const { t } = useI18n("QuestionCardView");
  const currentQuestion = useSubscription(
    [appIds.subscriptions.navigationCurrentQuestion],
    "QuestionCardView",
  );
  useEffect(() => {
    runtime.dispatch([appIds.events.uiScrollToTop, "auto"]);
  }, [runtime, currentQuestion?.globalIndex]);

  if (!currentQuestion) {
    return (
      <div className="loading-question">
        <p>{t("noQuestions")}</p>
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
      <BottomNavigation />
      <QuestionPicker />
    </div>
  );
});
