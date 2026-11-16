import { useCallback, memo, useState, useEffect, useRef } from "react";
import {
  appIds,
  FEDERAL_LANDS,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";
import { FavoritesButton } from "./FavoritesButton.jsx";
import "../styles/Header.css";

export const Categories = memo(() => {
  const runtime = useRuntime();
  const practiceQuestionCount = useSubscription(
    [appIds.subscriptions.practiceFilteredQuestionsCount],
    "Categories",
  );
  const categories = useSubscription(
    [appIds.subscriptions.questionsCategories],
    "Categories",
  );
  const selectedCategory = useSubscription(
    [appIds.subscriptions.navigationSelectedCategory],
    "Categories",
  );
  const favoriteCount = useSubscription(
    [appIds.subscriptions.practiceFavoriteCount],
    "Categories",
  );
  const wrongCount = useSubscription(
    [appIds.subscriptions.practiceWrongCount],
    "Categories",
  );
  const selectedCount = useSubscription(
    [appIds.subscriptions.navigationSelectedCategoryCount],
    "Categories",
  );
  const selectedLand = useSubscription(
    [appIds.subscriptions.preferencesSelectedLand],
    "Categories",
  );

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLandPickerOpen, setIsLandPickerOpen] = useState(false);

  const popupRef = useRef(null);

  const handleCategoryClick = useCallback(
    (category) => {
      if (category === "test") {
        setIsLandPickerOpen(true);
        return;
      }
      runtime.dispatch([appIds.events.navigationCategorySelected, category]);
    },
    [runtime],
  );
  const startExam = useCallback(
    (land) => {
      runtime.dispatch([appIds.events.preferencesLandSelected, land]);
      runtime.dispatch([appIds.events.testSessionStarted]);
      setIsLandPickerOpen(false);
    },
    [runtime],
  );
  const setOverFlow = useCallback(
    (value) => {
      runtime.dispatch([appIds.events.uiBodyOverflowSet, value]);
    },
    [runtime],
  );

  useEffect(() => {
    if (isPopupOpen || isLandPickerOpen) {
      setOverFlow("hidden");
    } else {
      setOverFlow("auto");
    }
  }, [isLandPickerOpen, isPopupOpen, setOverFlow]);

  useEffect(() => {
    if (!isPopupOpen) return;

    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopupOpen]);

  useEffect(() => {
    if (!isLandPickerOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsLandPickerOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isLandPickerOpen]);

  return (
    <div className="categories-container">
      <div className="category-select-wrapper">
        <button
          className="category-select-button"
          onClick={() => setIsPopupOpen(!isPopupOpen)}
        >
          {selectedCategory === null
            ? `All Questions (${practiceQuestionCount})`
            : selectedCategory === "favorites"
              ? `Favorites (${favoriteCount})`
              : selectedCategory === "wrong"
                ? `Wrong answers (${wrongCount})`
                : selectedCategory === "test"
                  ? `Test (33)`
                  : `${selectedCategory} (${selectedCount})`}
          <span className="filter-icon">▼</span>
        </button>

        {isPopupOpen && (
          <div className="category-popup" ref={popupRef}>
            <button
              onClick={() => {
                handleCategoryClick(null);
                setIsPopupOpen(false);
              }}
              className={`category-button ${selectedCategory === null ? "active" : ""}`}
            >
              All Questions ({practiceQuestionCount})
            </button>
            <button
              key="test"
              onClick={() => {
                handleCategoryClick("test");
                setIsPopupOpen(false);
              }}
              className={`category-button ${selectedCategory === "test" ? "active" : ""}`}
            >
              Start Test (33)
            </button>
            <FavoritesButton
              key="favorites"
              onCategoryClick={(cat) => {
                handleCategoryClick(cat);
                setIsPopupOpen(false);
              }}
            />
            <button
              key="wrong"
              onClick={() => {
                handleCategoryClick("wrong");
                setIsPopupOpen(false);
              }}
              className={`category-button ${selectedCategory === "wrong" ? "active" : ""}`}
            >
              Wrong answers ({wrongCount})
            </button>

            {categories.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3>{group.title}</h3>
                {group.items.map(([category, count]) => (
                  <button
                    key={category}
                    onClick={() => {
                      handleCategoryClick(category);
                      setIsPopupOpen(false);
                    }}
                    className={`category-button ${selectedCategory === category ? "active" : ""}`}
                  >
                    {category} ({count})
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {isLandPickerOpen && (
        <div
          className="exam-land-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsLandPickerOpen(false);
            }
          }}
        >
          <div
            aria-labelledby="exam-land-title"
            aria-modal="true"
            className="exam-land-dialog"
            role="dialog"
          >
            <div className="exam-land-header">
              <div>
                <p>MOCK EXAM</p>
                <h2 id="exam-land-title">Choose your Bundesland</h2>
              </div>
              <button
                aria-label="Close Bundesland selection"
                className="exam-land-close"
                onClick={() => setIsLandPickerOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <p className="exam-land-copy">
              The official exam includes three questions for the Land where you
              live.
            </p>
            <div className="exam-land-grid">
              {FEDERAL_LANDS.map((land) => (
                <button
                  className={`exam-land-option ${selectedLand === land ? "selected" : ""}`}
                  key={land}
                  onClick={() => startExam(land)}
                  type="button"
                >
                  {land}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
