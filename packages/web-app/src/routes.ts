import type { NavigationRoute } from "@ebtest/shared/uklad/contracts";

export const appPaths = {
  home: "/app/",
  learn: "/app/learn/",
  practice: "/app/practice/",
  favorites: "/app/favorites/",
  mistakes: "/app/mistakes/",
  settings: "/app/settings/",
  exam: "/app/exam/",
} as const satisfies Record<NavigationRoute["screen"], string>;

export function appHref(route: NavigationRoute): string {
  const params = new URLSearchParams();
  if (route.language) params.set("lang", route.language);
  if (route.category) params.set("category", route.category);
  if (route.question) params.set("question", String(route.question));
  return appPaths[route.screen] + (params.size ? `?${params}` : "");
}
