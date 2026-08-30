import { useMemo, useEffect, memo } from "react";
import {
  appIds,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";
import "../styles/Vocabulary.css";

const AVAILABLE_LANGUAGES = [
  { id: "en", label: "English" },
  { id: "ru", label: "Русский" },
  { id: "ar", label: "العربية" },
  { id: "tr", label: "Türkçe" },
];

export const Vocabulary = memo(function Vocabulary() {
  const runtime = useRuntime();
  const selectedLanguage = useSubscription(
    [appIds.subscriptions.preferencesSelectedLanguage],
    "Vocabulary",
  );
  const vocabularyData = useSubscription(
    [appIds.subscriptions.vocabularyData],
    "Vocabulary",
  );
  const showVocabulary = useSubscription(
    [appIds.subscriptions.vocabularyVisible],
    "Vocabulary",
  );

  // Handle unmounting after closing animation
  useEffect(() => {
    if (!showVocabulary) {
      const timer = setTimeout(() => {
        runtime.dispatch([appIds.events.vocabularyUnmounted]);
      }, 300); // Match animation duration

      return () => clearTimeout(timer);
    }
  }, [runtime, showVocabulary]);

  // Fetch vocabulary data on component mount
  useEffect(() => {
    if (!vocabularyData) {
      runtime.dispatch([appIds.events.vocabularyFetchRequested]);
    }
  }, [runtime, vocabularyData]);

  const vocabularyItems = useMemo(() => {
    if (!vocabularyData) return [];
    const items = [];
    Object.entries(vocabularyData).forEach(([category, words]) => {
      items.push({ type: "category", text: category });
      words.forEach((word) => {
        items.push({
          type: "word",
          de: word.de,
          translation: word[selectedLanguage],
        });
      });
    });
    return items;
  }, [vocabularyData, selectedLanguage]);

  const languageButtons = useMemo(
    () =>
      AVAILABLE_LANGUAGES.map((lang) => (
        <button
          key={lang.id}
          onClick={() =>
            runtime.dispatch([
              appIds.events.preferencesLanguageSelected,
              lang.id,
            ])
          }
          className={`lang-button ${selectedLanguage === lang.id ? "active" : ""}`}
          lang={lang.id}
        >
          {lang.label}
        </button>
      )),
    [runtime, selectedLanguage],
  );

  const closeVocabulary = () => {
    runtime.dispatch([appIds.events.vocabularyToggled]);
  };

  return (
    <div className={`vocabulary-overlay ${!showVocabulary ? "closing" : ""}`}>
      <div className="vocabulary-backdrop" onClick={closeVocabulary}></div>
      <div
        className={`vocabulary-container ${!showVocabulary ? "closing" : ""}`}
      >
        <div className="vocabulary-header">
          <h2>Vocabulary</h2>
          <button className="close-button" onClick={closeVocabulary}>
            ×
          </button>
        </div>
        <div className="language-switcher">{languageButtons}</div>
        <div className="vocabulary-list">
          {vocabularyItems.map((item, index) =>
            item.type === "category" ? (
              <div key={index} className="vocabulary-item category">
                {item.text}
              </div>
            ) : (
              <div key={index} className="vocabulary-item word">
                {item.de} <span className="separator"> – </span>{" "}
                <span lang={selectedLanguage}>{item.translation}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
});
