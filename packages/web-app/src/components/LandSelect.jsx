import {
  appIds,
  FEDERAL_LANDS,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";
export function LandSelect({ id }) {
  const runtime = useRuntime();
  const land = useSubscription(
    [appIds.subscriptions.preferencesSelectedLand],
    "LandSelect",
  );
  const { t } = useI18n("LandSelect");
  return (
    <select
      id={id}
      aria-label={t("chooseFederalState")}
      value={land || ""}
      onChange={(e) =>
        runtime.dispatch([
          appIds.events.preferencesLandSelected,
          e.target.value,
        ])
      }
    >
      <option value="" disabled>
        {t("chooseFederalState")}
      </option>
      {FEDERAL_LANDS.map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </select>
  );
}
