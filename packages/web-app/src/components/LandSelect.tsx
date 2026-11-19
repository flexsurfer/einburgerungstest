import {
  appIds,
  FEDERAL_LANDS,
  type FederalLand,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";
interface LandSelectProps {
  id?: string;
}

export function LandSelect({ id }: LandSelectProps) {
  const runtime = useRuntime();
  const land = useSubscription(
    [appIds.subscriptions.preferencesSelectedLand],
    "LandSelect",
  );
  return (
    <LandSelectField
      id={id}
      value={land}
      onChange={(selected) =>
        runtime.dispatch([appIds.events.preferencesLandSelected, selected])
      }
    />
  );
}

interface LandSelectFieldProps extends LandSelectProps {
  value: FederalLand | null;
  onChange: (land: FederalLand) => void;
}

export function LandSelectField({ id, value, onChange }: LandSelectFieldProps) {
  const { t } = useI18n("LandSelectField");
  return (
    <select
      id={id}
      aria-label={t("chooseFederalState")}
      value={value ?? ""}
      onChange={(e) => {
        const selected = FEDERAL_LANDS.find(
          (value) => value === e.target.value,
        );
        if (selected) onChange(selected);
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
