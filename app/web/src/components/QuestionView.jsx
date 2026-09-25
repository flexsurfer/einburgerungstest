import { useState } from "react";
import { appIds, useSubscription } from "@ebtest/shared/uklad";
import { categoryDisplayName, useI18n } from "@ebtest/shared/i18n";
import { QuestionListView } from "./QuestionListView";
import { QuestionCardView } from "./QuestionCardView";
import { ExamResultScreen } from "./ExamResultScreen";
import { UiIcon } from "./UiIcon";
export function QuestionView() {
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
  if (exam && status === "completed") return <ExamResultScreen />;
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
          <h1>{title}</h1>
        </div>
        <div className="practice-tools">
          {!exam && (
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
