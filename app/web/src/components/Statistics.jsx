import { appIds, useSubscription } from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";
import { UiIcon } from "./UiIcon";
export function Statistics() {
  const { t } = useI18n("Statistics");
  const stats = useSubscription(
    [appIds.subscriptions.practiceStatistics],
    "Statistics",
  );
  return (
    <section className="practice-statistics" aria-label={t("accuracy")}>
      <span className="correct-stat">
        <UiIcon name="check" size={17} />
        {stats.correct} {t("correct")}
      </span>
      <span className="incorrect-stat">
        <UiIcon name="close" size={17} />
        {stats.incorrect} {t("incorrect")}
      </span>
      <span className="accuracy-stat">
        {stats.accuracy}% {t("accuracy")}
      </span>
    </section>
  );
}
