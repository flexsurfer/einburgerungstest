import { useCallback, memo, useState, useEffect, useRef } from "react";
import {
  appIds,
  useRuntime,
  useSubscription,
} from "@ebtest/shared/uklad";
import { FavoritesButton } from "./FavoritesButton.jsx";
import "../styles/Header.css";

export const Categories = memo(() => {
  const runtime = useRuntime();
  const questions = useSubscription(
    [appIds.subscriptions.questionsItems],
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

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const popupRef = useRef(null);

  const handleCategoryClick = useCallback(
    (category) => {
      runtime.dispatch([appIds.events.navigationCategorySelected, category]);
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
    if (isPopupOpen) {
      setOverFlow("hidden");
    } else {
      setOverFlow("auto");
    }
  }, [isPopupOpen, setOverFlow]);

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

  return (
    <div className="categories-container">
      <div className="category-select-wrapper">
        <button
          className="category-select-button"
          onClick={() => setIsPopupOpen(!isPopupOpen)}
        >
          {selectedCategory === null
            ? `All Questions (${questions.length})`
            : selectedCategory === "favorites"
              ? `Favorites (${favoriteCount})`
              : selectedCategory === "wrong"
                ? `Wrong answers (${wrongCount})`
                : selectedCategory === "test"
                  ? `Test (30)`
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
              All Questions ({questions.length})
            </button>
            <button
              key="test"
              onClick={() => {
                handleCategoryClick("test");
                setIsPopupOpen(false);
              }}
              className={`category-button ${selectedCategory === "test" ? "active" : ""}`}
            >
              Start Test (30)
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
    </div>
  );
});
