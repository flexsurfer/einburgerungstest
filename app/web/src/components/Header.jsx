import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";
import { UiIcon } from "./UiIcon";
import { Statistics } from "./Statistics";
import { ExamLauncher } from "./ExamLauncher";
export function Header() {
  const runtime = useRuntime();
  const { t } = useI18n("Header");
  const screen = useSubscription(
    [appIds.subscriptions.navigationActiveScreen],
    "Header",
  );
  const category = useSubscription(
    [appIds.subscriptions.navigationSelectedCategory],
    "Header",
  );
  const learn = useSubscription(
    [appIds.subscriptions.navigationIsLearnMode],
    "Header",
  );
  const favorites = useSubscription(
    [appIds.subscriptions.practiceFavoriteCount],
    "Header",
  );
  const mistakes = useSubscription(
    [appIds.subscriptions.practiceWrongCount],
    "Header",
  );
  const theme = useSubscription(
    [appIds.subscriptions.preferencesTheme],
    "Header",
  );
  const item = (icon, label, event, active, count) => (
    <button
      className={`side-link ${active ? "active" : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={() => runtime.dispatch(event)}
    >
      <UiIcon name={icon} />
      <span>{label}</span>
      {count !== undefined && <span className="nav-count">{count}</span>}
    </button>
  );
  return (
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="EBTest home">
        <img
          className="brand-mark"
          src="/landing/logo.png"
          alt=""
          width="42"
          height="42"
        />
        <span>
          einbürgerungs
          <span className="brand-bottom">
            test<span className="brand-dot">.</span>
          </span>
        </span>
      </a>
      <nav aria-label="Main navigation" className="main-nav">
        {item(
          "home",
          t("home"),
          [appIds.events.navigationHomeOpened],
          screen === "home",
        )}
        {item(
          "book",
          t("study"),
          [appIds.events.navigationLearnOpened],
          screen === "questions" && learn,
        )}
        {item(
          "play",
          t("practiceMode"),
          [appIds.events.navigationPracticeResumed],
          screen === "questions" && !learn && category === null,
        )}
        <span className="nav-section-label">{t("review")}</span>
        {item(
          "bookmark",
          t("savedQuestions"),
          [appIds.events.navigationCategorySelected, "favorites"],
          screen === "questions" && category === "favorites",
          favorites,
        )}
        {item(
          "mistakes",
          t("mistakes"),
          [appIds.events.navigationCategorySelected, "wrong"],
          screen === "questions" && category === "wrong",
          mistakes,
        )}
        <ExamLauncher
          className={`side-link ${screen === "questions" && category === "test" ? "active" : ""}`}
        />
      </nav>
      {screen === "questions" && category !== "test" && <Statistics />}
      <div className="sidebar-bottom">
        {item(
          "settings",
          t("settings"),
          [appIds.events.navigationSettingsOpened],
          screen === "settings",
        )}
        <div className="sidebar-meta">
          <a
            href="https://github.com/flexsurfer/einburgerungstest"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
          <button
            className="icon-button"
            onClick={() =>
              runtime.dispatch([appIds.events.preferencesThemeToggled])
            }
            aria-label={t("switchTheme", {
              theme: t(theme === "dark" ? "light" : "dark"),
            })}
          >
            <UiIcon name={theme === "dark" ? "sun" : "moon"} size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
