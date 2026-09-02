import { useState, useEffect, useRef, memo, useCallback } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { QuestionCard } from "./QuestionCard.jsx";
import { DesktopExamControls } from "./ExamControls.jsx";
import "../styles/QuestionList.css";

export const QuestionListView = memo(() => {
  const runtime = useRuntime();
  const filteredQuestions = useSubscription(
    [appIds.subscriptions.practiceFilteredQuestions],
    "QuestionList",
  );
  const isTestMode = useSubscription(
    [appIds.subscriptions.navigationIsTestMode],
    "QuestionList",
  );

  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setVisibleCount(20);
  }, [filteredQuestions]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          visibleCount < filteredQuestions.length
        ) {
          setVisibleCount((prev) =>
            Math.min(prev + 20, filteredQuestions.length),
          );
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [visibleCount, filteredQuestions.length]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    runtime.dispatch([appIds.events.uiScrollToTop, "smooth"]);
  }, [runtime]);

  if (!filteredQuestions || filteredQuestions.length === 0) {
    return (
      <div className="empty-questions">
        <p>No questions available</p>
      </div>
    );
  }

  const visibleQuestions = filteredQuestions.slice(0, visibleCount);

  return (
    <div className="question-list-container">
      {isTestMode && <DesktopExamControls />}
      <div className="questions-grid">
        {visibleQuestions.map((question) => (
          <QuestionCard key={question.globalIndex} question={question} />
        ))}
        {visibleCount < filteredQuestions.length && (
          <div ref={loadMoreRef} style={{ height: "60px" }} />
        )}
      </div>
      {showScrollTop && (
        <button className="scroll-top-button" onClick={scrollToTop}>
          ↑
        </button>
      )}
    </div>
  );
});
