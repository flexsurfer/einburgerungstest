import { Star } from "./Star.jsx";
import {
  appIds,
  useSubscription,
} from "@ebtest/shared/uklad";

export const FavoritesButton = ({ onCategoryClick }) => {
  const selectedCategory = useSubscription(
    [appIds.subscriptions.navigationSelectedCategory],
    "FavoritesButton",
  );
  const favoriteCount = useSubscription(
    [appIds.subscriptions.practiceFavoriteCount],
    "FavoritesButton",
  );

  return (
    <button
      onClick={() => onCategoryClick("favorites")}
      className={`category-button ${selectedCategory === "favorites" ? "active" : ""}`}
    >
      <Star />
      Favorites ({favoriteCount})
    </button>
  );
};
