import { useState } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { categoryDisplayName, useI18n } from "@ebtest/shared/i18n";
import { UiIcon } from "./UiIcon";
import { ExamLauncher } from "./ExamLauncher";
export function HomeScreen() {
  const runtime = useRuntime();
  const { language, t } = useI18n("HomeScreen");
  const overview = useSubscription(
    [appIds.subscriptions.practiceOverview],
    "HomeScreen",
  );
  const progress = useSubscription(
    [appIds.subscriptions.practiceCategoryProgress],
    "HomeScreen",
  );
  const categories = useSubscription(
    [appIds.subscriptions.questionsCategories],
    "HomeScreen",
  );
  const favorites = useSubscription(
    [appIds.subscriptions.practiceFavoriteCount],
    "HomeScreen",
  );
  const mistakes = useSubscription(
    [appIds.subscriptions.practiceWrongCount],
    "HomeScreen",
  );
  const cursor = useSubscription(
    [appIds.subscriptions.practiceGlobalIndex],
    "HomeScreen",
  );
  const land = useSubscription(
    [appIds.subscriptions.preferencesSelectedLand],
    "HomeScreen",
  );
  const [allTopics, setAllTopics] = useState(false);
  const topics =
    categories.find((group) => group.title === "Themes")?.items || [];
  const [allStates, setAllStates] = useState(false);
  const states = [
    ...(categories.find((group) => group.title === "Bundesländer")?.items ||
      []),
  ].sort(([left], [right]) => (left === land ? -1 : right === land ? 1 : 0));
  const openCategory = (category) =>
    runtime.dispatch([appIds.events.navigationCategorySelected, category]);
  const headings = {
    en: [
      "YOUR LEARNING SPACE",
      "A little closer, every day.",
      "Your progress",
      "Make yourself at home.",
    ],
    de: [
      "DEIN LERNBEREICH",
      "Jeden Tag ein Stück weiter.",
      "Dein Fortschritt",
      "Mach dich mit Deutschland vertraut.",
    ],
    ru: [
      "ВАШЕ ОБУЧЕНИЕ",
      "Каждый день на шаг ближе.",
      "Ваш прогресс",
      "Узнайте свою новую страну.",
    ],
    tr: [
      "ÖĞRENME ALANINIZ",
      "Her gün bir adım daha yakın.",
      "İlerlemeniz",
      "Yeni ülkenizi tanıyın.",
    ],
    ar: [
      "مساحة التعلّم",
      "كل يوم، أقرب بخطوة.",
      "تقدّمك",
      "تعرّف على وطنك الجديد.",
    ],
  };
  const copy = headings[language] || headings.en;
  return (
    <div className="dashboard">
      <header className="page-heading">
        <div>
          <p className="eyebrow">{copy[0]}</p>
          <h1>{copy[1]}</h1>
        </div>
      </header>
      <div className="dashboard-landscape">
        <img src="/assets/img/home.jpg" alt="" />
        <span>{copy[3]}</span>
      </div>
      <section className="progress-panel" aria-label={copy[2]}>
        <div
          className="progress-ring"
          role="img"
          aria-label={t("progressSummary", {
            answered: overview.totalAnswered,
            total: overview.totalQuestions,
            correct: overview.correct,
            incorrect: overview.incorrect,
          })}
          style={{
            "--progress": `${overview.progress}%`,
            "--correct": `${overview.totalQuestions ? (overview.correct / overview.totalQuestions) * 100 : 0}%`,
          }}
        >
          <div>
            <strong>
              {overview.totalAnswered}
              <small> / {overview.totalQuestions}</small>
            </strong>
            <span>{t("questionsCount", { count: "" }).trim()}</span>
          </div>
        </div>
        <div className="progress-summary">
          <p className="eyebrow">{copy[2]}</p>
          <div className="progress-metrics">
            <div>
              <strong>
                {overview.accuracy}
                <small>%</small>
              </strong>
              <span>{t("accuracy")}</span>
            </div>
            <div>
              <strong>{overview.remaining}</strong>
              <span>{t("remainingQuestions")}</span>
            </div>
          </div>
        </div>
        <div className="progress-actions">
          <button
            className="cream-button"
            onClick={() =>
              runtime.dispatch([appIds.events.navigationPracticeResumed])
            }
          >
            <UiIcon name="play" size={18} />
            {t(cursor === null ? "startPractice" : "continuePractice")}
            <UiIcon name="arrow" size={18} />
          </button>
          <button
            className="hero-text-button"
            onClick={() =>
              runtime.dispatch([appIds.events.navigationLearnOpened])
            }
          >
            <UiIcon name="book" size={18} />
            {t("studyQuestions")}
            <UiIcon name="arrow" size={18} />
          </button>
        </div>
      </section>
      <section className="home-review-section">
        <div className="section-heading">
          <h2>{t("review")}</h2>
        </div>
        <div className="review-actions">
          <button
            className="review-card"
            disabled={!favorites}
            onClick={() => openCategory("favorites")}
          >
            <span className="icon-tile tone-1">
              <UiIcon name="bookmark" />
            </span>
            <strong>{t("savedQuestions")}</strong>
            <span className="review-count">{favorites}</span>
            <UiIcon name="chevron" size={17} />
          </button>
          <button
            className="review-card"
            disabled={!mistakes}
            onClick={() => openCategory("wrong")}
          >
            <span className="icon-tile tone-2">
              <UiIcon name="mistakes" />
            </span>
            <strong>{t("mistakes")}</strong>
            <span className="review-count">{mistakes}</span>
            <UiIcon name="chevron" size={17} />
          </button>
        </div>
      </section>
      <section className="mock-exam-banner">
        <span className="icon-tile">
          <UiIcon name="exam" size={29} />
        </span>
        <div>
          <h2>{t("mockExam")}</h2>
          <p>
            {t("questionsCount", { count: 33 })}
            <span>·</span>
            {t("minutesCount", { count: 60 })}
          </p>
        </div>
        <ExamLauncher>
          {t("startExam")}
          <UiIcon name="arrow" size={18} />
        </ExamLauncher>
      </section>
      <div className="dashboard-columns">
        <section>
          <div className="section-heading">
            <h2>{t("focusAreas")}</h2>
            <button
              className="text-button"
              onClick={() => setAllTopics(!allTopics)}
            >
              {t(allTopics ? "showLess" : "viewAll")}
              <UiIcon name="chevron" size={15} />
            </button>
          </div>
          <div className="topic-list">
            {(allTopics ? topics : topics.slice(0, 4)).map(
              ([category, total], index) => (
                <button
                  className="topic-row"
                  key={category}
                  onClick={() => openCategory(category)}
                >
                  <span className={`icon-tile tone-${index % 4}`}>
                    <UiIcon name={index % 2 ? "building" : "book"} />
                  </span>
                  <span className="topic-details">
                    <strong>{categoryDisplayName(category, language)}</strong>
                    <span className="topic-progress">
                      <span>
                        <i
                          style={{
                            width: `${progress[category]?.progress || 0}%`,
                          }}
                        />
                      </span>
                      <small>
                        {progress[category]?.answered || 0} / {total}
                      </small>
                    </span>
                  </span>
                  <UiIcon name="chevron" size={17} />
                </button>
              ),
            )}
          </div>
        </section>
        <section className="states-section">
          <div className="section-heading">
            <h2>{t("federalStates")}</h2>
            <button
              className="text-button"
              aria-expanded={allStates}
              onClick={() => setAllStates(!allStates)}
            >
              {t(allStates ? "showLess" : "viewAll")}
              <UiIcon name="chevron" size={15} />
            </button>
          </div>
          <div className="topic-list">
            {(allStates ? states : states.slice(0, 3)).map(
              ([category, total]) => (
                <button
                  className={`topic-row ${category === land ? "selected-state" : ""}`}
                  key={category}
                  onClick={() => openCategory(category)}
                >
                  <span className="icon-tile">
                    <UiIcon name="map" />
                  </span>
                  <span className="topic-details">
                    <strong>{categoryDisplayName(category, language)}</strong>
                    {category === land && (
                      <small className="state-label">{t("yourState")}</small>
                    )}
                    <span className="topic-progress">
                      <span>
                        <i
                          style={{
                            width: `${progress[category]?.progress || 0}%`,
                          }}
                        />
                      </span>
                      <small>
                        {progress[category]?.answered || 0} / {total}
                      </small>
                    </span>
                  </span>
                  <UiIcon name="chevron" size={17} />
                </button>
              ),
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
