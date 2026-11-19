import { lazy, Suspense, useLayoutEffect, useRef, useState } from "react";
import {
  appIds,
  type FederalLand,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";
import { LandSelectField } from "./LandSelect";
import { UiIcon } from "./UiIcon";
import "../styles/LandOnboardingDialog.css";

function MapPlaceholder() {
  return <UiIcon name="map" size={40} className="land-map-placeholder" />;
}

// The native selector stays usable while the optional map loads or if it fails.
const GermanyMap = lazy(() =>
  import("./GermanyMap").catch(() => ({ default: MapPlaceholder })),
);

export function LandOnboardingDialog() {
  const runtime = useRuntime();
  const { t } = useI18n("LandOnboardingDialog");
  const savedLand = useSubscription(
    [appIds.subscriptions.preferencesSelectedLand],
    "LandOnboardingDialog",
  );
  const dismissed = useSubscription(
    [appIds.subscriptions.preferencesLandPromptDismissed],
    "LandOnboardingDialog",
  );
  const [choice, setChoice] = useState<FederalLand | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const visible = savedLand === null && !dismissed;
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    titleRef.current?.focus({ preventScroll: true });
    return () => dialog.close();
  }, [visible]);

  if (!visible) return null;
  const defer = () =>
    runtime.dispatch([appIds.events.preferencesLandPromptDismissed]);
  return (
    <dialog
      className="land-prompt"
      ref={dialogRef}
      aria-labelledby="land-prompt-title"
      aria-describedby="land-prompt-description"
      onCancel={(event) => {
        event.preventDefault();
        defer();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) defer();
      }}
    >
      <div className="land-prompt-layout">
        <header>
          <h2 id="land-prompt-title" tabIndex={-1} ref={titleRef}>
            {t("chooseFederalState")}
          </h2>
          <p id="land-prompt-description">{t("landPromptDescription")}</p>
        </header>
        <div className="land-prompt-map">
          <Suspense fallback={<MapPlaceholder />}>
            <GermanyMap value={choice} onChange={setChoice} />
          </Suspense>
        </div>
        <div className="land-prompt-field">
          <LandSelectField value={choice} onChange={setChoice} />
          <p>{t("onboardingFooter")}</p>
        </div>
        <footer>
          <button type="button" className="text-button" onClick={defer}>
            {t("later")}
          </button>
          <button
            type="button"
            className="primary-button"
            disabled={choice === null}
            onClick={() => {
              if (choice)
                runtime.dispatch([
                  appIds.events.preferencesLandSelected,
                  choice,
                ]);
            }}
          >
            {t("continue")}
          </button>
        </footer>
      </div>
    </dialog>
  );
}
