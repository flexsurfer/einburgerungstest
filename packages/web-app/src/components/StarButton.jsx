import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";
import { UiIcon } from "./UiIcon";
export function StarButton({ globalIndex }) {
  const runtime = useRuntime();
  const favorite = useSubscription(
    [appIds.subscriptions.practiceIsFavoriteByGlobalIndex, globalIndex],
    "StarButton",
  );
  const { t } = useI18n("StarButton");
  return (
    <button
      className={`icon-button bookmark-button ${favorite ? "selected" : ""}`}
      aria-pressed={favorite}
      aria-label={t(favorite ? "removeBookmark" : "addBookmark")}
      onClick={() =>
        runtime.dispatch([appIds.events.practiceFavoriteToggled, globalIndex])
      }
    >
      <UiIcon name="bookmark" fill={favorite ? "currentColor" : "none"} />
    </button>
  );
}
