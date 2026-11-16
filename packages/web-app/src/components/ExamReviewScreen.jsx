import { useEffect, useRef, useState } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { categoryDisplayName, useI18n } from "@ebtest/shared/i18n";
import { useIsMobile } from "../hooks/useIsMobile";
import { StarButton } from "./StarButton";
import { UiIcon } from "./UiIcon";
import "../styles/ExamReview.css";

const statusSymbols = { correct: "✓", incorrect: "×", unanswered: "–" };
const emptyTitles = {
  all: "noQuestions",
  incorrect: "noIncorrectAnswers",
  unanswered: "noUnansweredAnswers",
  correct: "noCorrectAnswers",
};

export function ExamReviewScreen() {
  const runtime = useRuntime();
  const { t, language } = useI18n("ExamReviewScreen");
  const review = useSubscription(
    [appIds.subscriptions.testSessionReview],
    "ExamReviewScreen",
  );
  const filter = useSubscription(
    [appIds.subscriptions.testSessionReviewFilter],
    "ExamReviewScreen",
  );
  const result = useSubscription(
    [appIds.subscriptions.testSessionResult],
    "ExamReviewScreen",
  );
  const compact = useIsMobile(1100);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const titleRef = useRef(null);
  const questionRef = useRef(null);
  const focusQuestion = useRef(false);
  const { current, items, position } = review;
  const question = current?.question;
  const translation = language !== "de" ? question?.[language] : undefined;
  const explanation = translation?.explanation || question?.explanation;

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    if (focusQuestion.current && questionRef.current) {
      questionRef.current.focus({ preventScroll: true });
      questionRef.current.scrollIntoView?.({
        block: "start",
        behavior: "instant",
      });
      focusQuestion.current = false;
    }
  }, [current?.questionIndex]);

  const navigate = (event) => {
    focusQuestion.current = true;
    setOverviewOpen(false);
    runtime.dispatch(event);
  };
  const close = () => runtime.dispatch([appIds.events.testSessionReviewClosed]);

  return (
    <section className="exam-review-screen">
      <button className="exam-review-back" onClick={close} type="button">
        <UiIcon name="arrow" size={18} />
        {t("backToResult")}
      </button>
      <header className="exam-review-heading">
        <div>
          <p className="eyebrow">{t("examResult")}</p>
          <h1 ref={titleRef} tabIndex={-1}>
            {t("answerReview")}
          </h1>
          <p>{t("reviewDescription")}</p>
        </div>
        <span
          className={`exam-review-score ${result.passed ? "correct" : "incorrect"}`}
        >
          <strong>
            {result.correct} / {result.total}
          </strong>
          {t(result.passed ? "passed" : "notPassed")}
        </span>
      </header>

      <div
        className="exam-review-filters"
        role="group"
        aria-label={t("reviewFilterLabel")}
      >
        {["all", "incorrect", "unanswered", "correct"].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() =>
              runtime.dispatch([
                appIds.events.testSessionReviewFilterSelected,
                value,
              ])
            }
          >
            {t(value === "all" ? "allQuestions" : value)}
            <span>{value === "all" ? result.total : result[value]}</span>
          </button>
        ))}
      </div>

      <div className="exam-review-layout">
        <details
          className="exam-review-overview"
          open={!compact || overviewOpen}
        >
          <summary
            onClick={(event) => {
              event.preventDefault();
              if (compact) setOverviewOpen(!overviewOpen);
            }}
          >
            <span>{t("questionOverview")}</span>
            <span>
              {items.length}
              <UiIcon name="chevron" size={16} />
            </span>
          </summary>
          <div className="exam-review-grid" aria-label={t("selectQuestion")}>
            {items.map((item) => (
              <button
                key={item.questionIndex}
                type="button"
                className={`exam-review-number ${item.status}`}
                aria-current={
                  item.questionIndex === current?.questionIndex
                    ? "step"
                    : undefined
                }
                aria-label={t("reviewQuestionLabel", {
                  number: item.questionIndex + 1,
                  status: t(item.status),
                })}
                onClick={() =>
                  navigate([
                    appIds.events.testSessionReviewQuestionSelected,
                    item.questionIndex,
                  ])
                }
              >
                {item.questionIndex + 1}
                <small aria-hidden="true">{statusSymbols[item.status]}</small>
              </button>
            ))}
          </div>
          <div className="exam-review-legend">
            {["correct", "incorrect", "unanswered"].map((status) => (
              <span key={status}>
                <b className={status} aria-hidden="true">
                  {statusSymbols[status]}
                </b>
                {t(status)}
              </span>
            ))}
          </div>
        </details>

        <div className="exam-review-detail">
          {current ? (
            <article className="exam-review-card">
              <div className="exam-review-question-meta">
                <span>
                  {t("questionOfTotal", {
                    current: current.questionIndex + 1,
                    total: result.total,
                  })}
                </span>
                <StarButton globalIndex={question.globalIndex} />
              </div>
              <div className="exam-review-question-status">
                <span className={`exam-review-status ${current.status}`}>
                  <b aria-hidden="true">{statusSymbols[current.status]}</b>
                  {t(current.status)}
                </span>
                <span>
                  #{String(question.globalIndex).padStart(3, "0")} ·{" "}
                  {categoryDisplayName(question.category, language)}
                </span>
              </div>
              <h2 ref={questionRef} tabIndex={-1} lang="de" dir="ltr">
                {question.question}
              </h2>
              {translation?.question && (
                <p className="exam-review-translation">
                  {translation.question}
                </p>
              )}
              {question.img && (
                <figure className="exam-review-image">
                  <img
                    src={`/assets/img/${question.img.url}.png`}
                    alt={
                      question.img.text ||
                      t("questionImage", { number: current.questionIndex + 1 })
                    }
                  />
                  {question.img.text && (
                    <figcaption lang="de" dir="ltr">
                      {question.img.text}
                    </figcaption>
                  )}
                </figure>
              )}
              {current.status === "unanswered" && (
                <p className="exam-review-unanswered">
                  {t("noAnswerSelected")}
                </p>
              )}
              <ol className="exam-review-answers">
                {question.answers.map((answer, index) => {
                  const correct = index === question.correct;
                  const selected = index === current.answerIndex;
                  return (
                    <li
                      key={index}
                      className={`exam-review-answer ${correct ? "correct" : selected ? "incorrect" : ""}`}
                    >
                      <span
                        className="exam-review-answer-letter"
                        aria-hidden="true"
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <div>
                        {(correct || selected) && (
                          <span className="exam-review-answer-label">
                            {correct
                              ? t(
                                  selected
                                    ? "yourCorrectAnswer"
                                    : "correctAnswer",
                                )
                              : t("yourAnswer")}
                          </span>
                        )}
                        <p lang="de" dir="ltr">
                          {answer}
                        </p>
                        {translation?.answers?.[index] && (
                          <p className="exam-review-translation">
                            {translation.answers[index]}
                          </p>
                        )}
                      </div>
                      {(correct || selected) && (
                        <b
                          className="exam-review-answer-symbol"
                          aria-hidden="true"
                        >
                          {correct ? "✓" : "×"}
                        </b>
                      )}
                    </li>
                  );
                })}
              </ol>
              {explanation && (
                <section className="exam-review-explanation">
                  <h3>{t("explanation")}</h3>
                  <p
                    lang={translation?.explanation ? language : "de"}
                    dir={
                      translation?.explanation && language === "ar"
                        ? "rtl"
                        : "ltr"
                    }
                  >
                    {explanation}
                  </p>
                </section>
              )}
            </article>
          ) : (
            <div className="exam-review-empty" role="status">
              <UiIcon
                name={filter === "correct" ? "book" : "check"}
                size={32}
              />
              <h2>{t(emptyTitles[filter])}</h2>
              <p>{t("noReviewQuestions")}</p>
              <button
                className="primary-button"
                onClick={() =>
                  runtime.dispatch([
                    appIds.events.testSessionReviewFilterSelected,
                    "all",
                  ])
                }
              >
                {t("allQuestions")}
              </button>
            </div>
          )}
        </div>
      </div>

      {current && (
        <nav className="exam-review-navigation" aria-label={t("answerReview")}>
          <button
            type="button"
            disabled={position <= 0}
            aria-label={t("previousQuestion")}
            onClick={() =>
              navigate([appIds.events.testSessionReviewStepped, -1])
            }
          >
            <UiIcon name="chevron" size={18} className="review-previous-icon" />
            {t("previous")}
          </button>
          <span aria-live="polite">
            {t("reviewPosition", {
              current: position + 1,
              total: items.length,
            })}
          </span>
          {position < items.length - 1 ? (
            <button
              className="exam-review-next"
              type="button"
              aria-label={t("nextQuestion")}
              onClick={() =>
                navigate([appIds.events.testSessionReviewStepped, 1])
              }
            >
              {t("next")}
              <UiIcon name="chevron" size={18} />
            </button>
          ) : (
            <button className="exam-review-next" type="button" onClick={close}>
              {t("backToResult")}
            </button>
          )}
        </nav>
      )}
    </section>
  );
}
