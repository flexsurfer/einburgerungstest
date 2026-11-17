import {
  appIds,
  FEDERAL_LANDS,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";
/** @param {{ id?: string }} props */
export function LandSelect({ id = undefined }) {
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
      onChange={(e) => {
        const selected = FEDERAL_LANDS.find(
          (value) => value === e.target.value,
        );
        if (selected)
          runtime.dispatch([appIds.events.preferencesLandSelected, selected]);
      }}
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
