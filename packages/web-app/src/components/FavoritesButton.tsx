import { Star } from "./Star";
import { appIds, useSubscription } from "@ebtest/shared/uklad";

interface FavoritesButtonProps {
  onCategoryClick: (category: "favorites") => void;
}

export const FavoritesButton = ({ onCategoryClick }: FavoritesButtonProps) => {
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
