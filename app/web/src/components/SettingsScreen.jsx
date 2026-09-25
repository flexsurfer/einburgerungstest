import {
  appIds,
  LANGUAGES,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";
import { LandSelect } from "./LandSelect";
import { UiIcon } from "./UiIcon";
export function SettingsScreen() {
  const runtime = useRuntime();
  const { language, t } = useI18n("SettingsScreen");
  const theme = useSubscription(
    [appIds.subscriptions.preferencesThemeSelection],
    "SettingsScreen",
  );
  return (
    <div className="settings-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">EBTEST / {t("settings")}</p>
          <h1>{t("settings")}</h1>
        </div>
      </header>
      <div className="settings-card">
        <section className="setting-row">
          <span className="icon-tile">
            <UiIcon name="globe" />
          </span>
          <div>
            <label htmlFor="app-language">{t("language")}</label>
            <p>{t("languageDescription")}</p>
          </div>
          <select
            id="app-language"
            value={language}
            onChange={(e) =>
              runtime.dispatch([
                appIds.events.preferencesLanguageSelected,
                e.target.value,
              ])
            }
          >
            {Object.entries(LANGUAGES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </section>
        <section className="setting-row">
          <span className="icon-tile">
            <UiIcon name="map" />
          </span>
          <div>
            <label htmlFor="settings-land">{t("federalState")}</label>
            <p>{t("federalStateDescription")}</p>
          </div>
          <LandSelect id="settings-land" />
        </section>
        <section className="appearance-setting">
          <h2>{t("appearance")}</h2>
          <p>{t("appearanceDescription")}</p>
          <div className="theme-options">
            {["light", "dark", "system"].map((value) => (
              <button
                key={value}
                className={`theme-option ${theme === value ? "selected" : ""}`}
                aria-pressed={theme === value}
                onClick={() =>
                  runtime.dispatch([
                    appIds.events.preferencesThemeSelected,
                    value,
                  ])
                }
              >
                <span className={`theme-preview ${value}`}>
                  <i />
                  <i />
                  <i />
                </span>
                <span>
                  {t(value)}
                  {theme === value && <UiIcon name="check" size={17} />}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="setting-row">
          <div>
            <h2>{t("clearProgress")}</h2>
            <p>{t("clearProgressMessage")}</p>
          </div>
          <button
            className="danger-button"
            onClick={() =>
              runtime.dispatch([appIds.events.practiceClearAnswersRequested])
            }
          >
            {t("clearProgress")}
          </button>
        </section>
      </div>
    </div>
  );
}
