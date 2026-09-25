import { memo } from "react";
import { appIds, useSubscription } from "@ebtest/shared/uklad";
import { categoryDisplayName, useI18n } from "@ebtest/shared/i18n";
import { StarButton } from "./StarButton";
import { AnswerList } from "./AnswerList";
import "../styles/QuestionCard.css";
export const QuestionCard = memo(({ question }) => {
  const { language, t } = useI18n("QuestionCard");
  const learn = useSubscription(
    [appIds.subscriptions.navigationIsLearnMode],
    "QuestionCard",
  );
  const exam = useSubscription(
    [appIds.subscriptions.navigationIsTestMode],
    "QuestionCard",
  );
  const translation =
    learn && language !== "de" ? question[language] : undefined;
  const explanation = translation?.explanation || question.explanation;
  return (
    <article className="question-card">
      <div className="question-meta">
        <span>
          #{String(question.globalIndex).padStart(3, "0")}{" "}
          <span className="question-topic">
            / {categoryDisplayName(question.category, language)}
          </span>
        </span>
        {!exam && <StarButton globalIndex={question.globalIndex} />}
      </div>
      <div className="question-header">
        <h2 className="question-text" lang="de" dir="ltr">
          {question.question}
        </h2>
        {translation?.question && (
          <p className="question-translation">{translation.question}</p>
        )}
      </div>
      {question.img && (
        <figure className="question-image-container">
          <img
            loading="lazy"
            src={`/assets/img/${question.img.url}.png`}
            alt={
              question.img.text ||
              `Question ${question.globalIndex} illustration`
            }
            className="question-image"
          />
          {question.img.text && (
            <figcaption className="question-image-text" lang="de">
              {question.img.text}
            </figcaption>
          )}
        </figure>
      )}
      <AnswerList
        question={question}
        translatedAnswers={translation?.answers}
      />
      {learn && explanation && (
        <div className="question-explanation">
          <h3>{t("explanation")}</h3>
          <p>{explanation}</p>
        </div>
      )}
    </article>
  );
});
