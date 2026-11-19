import {
  appIds,
  LANGUAGES,
  type AppLanguage,
  type NavigationRoute,
  type AppContracts,
  type AppRuntime,
} from "@ebtest/shared/uklad";
import { appHref, appPaths } from "./routes";

export function createBrowserNavigation(runtime: AppRuntime) {
  let started = false;
  let disposed = false;
  let lastLocation = "";
  const openLocation = (traversing: boolean) => {
    const location = window.location.pathname + window.location.search;
    // In-page anchors also produce history events. Leave their focus/scroll
    // behavior alone when the app destination has not changed.
    if (location === lastLocation) return;
    lastLocation = location;
    const route = routeFromUrl(new URL(window.location.href));
    // A fresh shared link can choose the language. An entry the app previously
    // rendered should use the learner's latest preference, including on reload.
    if (traversing || window.history.state?.ebtestAppRoute)
      delete route.language;
    runtime.dispatch([appIds.events.navigationRouteOpened, route]);
  };
  const restoreLocation = () => openLocation(true);
  const leaveCachedExam = (event: PageTransitionEvent) => {
    // A document restored from the back/forward cache keeps its JS runtime.
    // Discard the attempt on departure, just as a fresh load would.
    if (event.persisted && window.location.pathname === appPaths.exam) {
      runtime.dispatch([
        appIds.events.navigationRouteOpened,
        { screen: "exam" },
      ]);
    }
  };
  return {
    /** Called after hydration and after the questions result has been queued. */
    start() {
      if (
        started ||
        disposed ||
        typeof window === "undefined" ||
        !/^\/app(?:\/|$)/.test(window.location.pathname)
      )
        return;
      started = true;
      window.addEventListener("popstate", restoreLocation);
      window.addEventListener("pagehide", leaveCachedExam);
      openLocation(false);
    },
    sync({
      route,
      history,
    }: AppContracts["effects"][typeof appIds.effects.navigationRouteChanged]) {
      if (!started || disposed) return;
      const current = new URL(window.location.href);
      if (history === "dismiss" && window.history.state?.ebtestExamOpener) {
        window.history.back();
        return;
      }
      const destination = new URL(appHref(route), current);
      if (
        history === "restore" ||
        (route.screen === "exam" && current.pathname === appPaths.exam)
      )
        destination.hash = current.hash;
      // Carry non-routing parameters such as referrals across app navigation.
      for (const [key, value] of current.searchParams) {
        if (!["lang", "category", "question", "filter"].includes(key))
          destination.searchParams.append(key, value);
      }
      lastLocation = destination.pathname + destination.search;
      const sameUrl = destination.href === current.href;
      if (sameUrl && window.history.state?.ebtestAppRoute) return;
      const push = history === "push" && !sameUrl;
      window.history[push ? "pushState" : "replaceState"](
        {
          ...window.history.state,
          ebtestAppRoute: true,
          // Dismissing an in-app exam returns to its opener. Direct links fall back to Home.
          ebtestExamOpener:
            route.screen === "exam" &&
            (push || window.history.state?.ebtestExamOpener === true),
        },
        "",
        destination,
      );
    },
    dispose() {
      disposed = true;
      if (started) {
        window.removeEventListener("popstate", restoreLocation);
        window.removeEventListener("pagehide", leaveCachedExam);
      }
    },
  };
}

/** Validate external URL input before it crosses the Uklad event boundary. */
export function routeFromUrl(url: URL): NavigationRoute {
  const pathname = url.pathname
    .replace(/\/index\.html$/, "/")
    .replace(/\/?$/, "/");
  const screen =
    (Object.keys(appPaths) as NavigationRoute["screen"][]).find(
      (key) => appPaths[key] === pathname,
    ) ?? "home";
  const route: NavigationRoute = { screen };
  const language = url.searchParams.get("lang");
  if (language && Object.keys(LANGUAGES).includes(language))
    route.language = language as AppLanguage;
  if (screen === "learn" || screen === "practice") {
    const category = url.searchParams.get("category");
    if (category) route.category = category;
  }
  if (["learn", "practice", "favorites", "mistakes"].includes(screen)) {
    const question = url.searchParams.get("question") ?? "";
    if (/^[1-9]\d*$/.test(question) && Number.isSafeInteger(Number(question)))
      route.question = Number(question);
  }
  return route;
}
