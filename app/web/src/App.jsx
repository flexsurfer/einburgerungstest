import { useEffect } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";
import { Header } from "./components/Header.jsx";
import { HomeScreen } from "./components/HomeScreen.jsx";
import { SettingsScreen } from "./components/SettingsScreen.jsx";
import { QuestionView } from "./components/QuestionView.jsx";
import "./styles/App.css";
function App() {
  const runtime = useRuntime();
  const { language, isRtl, t } = useI18n("App");
  const questionsLoaded = useSubscription(
    [appIds.subscriptions.questionsLoaded],
    "App",
  );
  const error = useSubscription([appIds.subscriptions.questionsError], "App");
  const screen = useSubscription(
    [appIds.subscriptions.navigationActiveScreen],
    "App",
  );
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [language, isRtl]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);
  if (!questionsLoaded)
    return (
      <div className="hydration-gate" role="status">
        <h1>Einbürgerungstest</h1>
        <p>{error || t("loadingQuestion")}</p>
        {error && (
          <button
            className="primary-button"
            onClick={() =>
              runtime.dispatch([appIds.events.questionsFetchRequested])
            }
          >
            {t("retry")}
          </button>
        )}
      </div>
    );
  return (
    <div className="app-container">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="app-main">
        {screen === "home" ? (
          <HomeScreen />
        ) : screen === "settings" ? (
          <SettingsScreen />
        ) : (
          <QuestionView />
        )}
      </main>
    </div>
  );
}
export default App;
