import { useEffect, useRef, useState } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { categoryDisplayName, useI18n } from "@ebtest/shared/i18n";
import { QuestionListView } from "./QuestionListView";
import { QuestionCardView } from "./QuestionCardView";
import { ExamResultScreen } from "./ExamResultScreen";
import { ExamReviewScreen } from "./ExamReviewScreen";
import { UiIcon } from "./UiIcon";
export function QuestionView() {
  const runtime = useRuntime();
  const heading = useRef<HTMLHeadingElement>(null);
  const { t, language } = useI18n("QuestionView");
  const [list, setList] = useState(false);
  const exam = useSubscription(
    [appIds.subscriptions.navigationIsTestMode],
    "QuestionView",
  );
  const learn = useSubscription(
    [appIds.subscriptions.navigationIsLearnMode],
    "QuestionView",
  );
  const category = useSubscription(
    [appIds.subscriptions.navigationSelectedCategory],
    "QuestionView",
  );
  const status = useSubscription(
    [appIds.subscriptions.testSessionStatus],
    "QuestionView",
  );
  const reviewing = useSubscription(
    [appIds.subscriptions.testSessionReviewVisible],
    "QuestionView",
  );
  useEffect(() => {
    if (exam && status === "in-progress")
      heading.current?.focus({ preventScroll: true });
  }, [exam, status]);
  if (exam && status === "completed")
    return reviewing ? <ExamReviewScreen /> : <ExamResultScreen />;
  const title = learn
    ? t("studyQuestions")
    : exam
      ? t("mockExam")
      : category === "favorites"
        ? t("savedQuestions")
        : category === "wrong"
          ? t("reviewMistakes")
          : category
            ? categoryDisplayName(category, language)
            : t("allQuestions");
  return (
    <div className={`practice-page ${list && !exam ? "list-mode" : ""}`}>
      <header className="page-heading">
        <div>
          <p className="eyebrow">
            {t(learn ? "learnMode" : exam ? "examMode" : "practiceMode")}
          </p>
          <h1 ref={heading} tabIndex={exam ? -1 : undefined}>
            {title}
          </h1>
        </div>
        <div className="practice-tools">
          {exam ? (
            <button
              className="text-button"
              onClick={() =>
                runtime.dispatch([appIds.events.navigationExamClosed])
              }
            >
              {t("leaveExam")}
            </button>
          ) : (
            <button
              className={`icon-button ${list ? "selected" : ""}`}
              aria-label={t("listView")}
              aria-pressed={list}
              title={t("listView")}
              onClick={() => setList(!list)}
            >
              <UiIcon name="grid" />
            </button>
          )}
        </div>
      </header>
      {list && !exam ? <QuestionListView /> : <QuestionCardView />}
    </div>
  );
}
