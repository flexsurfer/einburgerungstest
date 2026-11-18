import { translate } from "@ebtest/shared/i18n";
import {
  appIds,
  createExamDeadlineTimer,
  registerAppModules,
  stateKeys,
  type AppContracts,
  type AppRuntime,
  type ColorScheme,
} from "@ebtest/shared/uklad";
import type { createBrowserNavigation } from "./navigation";

const DATA_URLS = Object.freeze({
  questions: "/assets/data.json",
});

export interface WebPlatformOptions {
  /** Content-hashed JSON URL; its contents must never change at the same URL. */
  readonly questionsAssetUrl?: string;
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function themeFromMediaQuery(): ColorScheme {
  if (typeof globalThis.matchMedia !== "function") return null;

  try {
    return globalThis.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light";
  } catch {
    return null;
  }
}

async function fetchJson(
  {
    dataType,
    url,
    method,
  }: AppContracts["effects"][typeof appIds.effects.dataFetch],
  runtime: Pick<AppRuntime, "dispatch">,
  { questionsAssetUrl }: WebPlatformOptions,
  navigation?: ReturnType<typeof createBrowserNavigation>,
) {
  try {
    if (typeof globalThis.fetch !== "function") {
      throw new Error("Fetch is not available in this browser");
    }

    const requestUrl = url || questionsAssetUrl || DATA_URLS[dataType];
    const requestMethod = method || "GET";
    const response = await globalThis.fetch(requestUrl, {
      method: requestMethod,
      ...(questionsAssetUrl &&
      requestUrl === questionsAssetUrl &&
      requestMethod === "GET"
        ? { cache: "force-cache" as const }
        : {}),
    });

    if (response.ok === false) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Questions response must be an array");
    }
    runtime.dispatch([appIds.events.questionsFetchSucceeded, data]);
    navigation?.start();
  } catch (error) {
    runtime.dispatch([appIds.events.questionsFetchFailed, errorMessage(error)]);
  }
}

/** Register browser-only effects and coeffects on one Uklad runtime. */
export function registerWebPlatform(
  runtime: AppRuntime,
  options: WebPlatformOptions = {},
  navigation?: ReturnType<typeof createBrowserNavigation>,
) {
  return registerAppModules(runtime, [
    (registrar) => {
      // Standalone platform fixtures have no attached browser history owner.
      registrar.regEffect(appIds.effects.navigationRouteChanged, (payload) =>
        navigation?.sync(payload),
      );
      registrar.regCoeffect(
        appIds.coeffects.systemColorScheme,
        themeFromMediaQuery,
      );
      registrar.regCoeffect(appIds.coeffects.systemNow, () => Date.now());

      registrar.regEvent(
        appIds.events.appInitialize,
        ({ draftState, coeffects: { system } }) => {
          const followsSystem = draftState[stateKeys.preferencesUseSystemTheme];
          const theme = followsSystem
            ? system || draftState[stateKeys.preferencesTheme]
            : draftState[stateKeys.preferencesTheme];

          if (followsSystem) {
            draftState[stateKeys.preferencesTheme] = theme;
          }

          return [[appIds.effects.uiSetBodyTheme, { theme }]];
        },
        { coeffects: { system: appIds.coeffects.systemColorScheme } },
      );

      registrar.regEffect(
        appIds.effects.dataFetch,
        (payload, effectRuntime) => {
          void fetchJson(payload, effectRuntime, options, navigation);
        },
      );

      registrar.regEffect(
        appIds.effects.dataLoadLocal,
        (payload, effectRuntime) => {
          void fetchJson(payload, effectRuntime, options, navigation);
        },
      );

      registrar.regEffect(appIds.effects.uiScrollToTop, ({ behavior }) => {
        const fragment = globalThis.window?.location.hash.slice(1);
        if (fragment && behavior === "auto") {
          let id = fragment;
          try {
            id = decodeURIComponent(fragment);
          } catch {
            // A literal percent sign can also be part of an element's ID.
          }
          const target = document.getElementById(id);
          if (target) {
            target.focus({ preventScroll: true });
            target.scrollIntoView?.();
            return;
          }
        }
        if (typeof globalThis.scrollTo === "function") {
          globalThis.scrollTo({ top: 0, behavior: behavior || "auto" });
        }
      });

      registrar.regEffect(
        appIds.effects.uiConfirmClear,
        ({ language }, effectRuntime) => {
          if (
            typeof globalThis.confirm === "function" &&
            globalThis.confirm(translate(language, "clearProgressMessage"))
          ) {
            effectRuntime.dispatch([appIds.events.practiceAnswersCleared]);
          }
        },
      );

      registrar.regEffect(appIds.effects.uiSetBodyTheme, ({ theme }) => {
        if (typeof document === "undefined" || !document.body) return;

        document.body.classList.remove("light", "dark");
        document.body.classList.add(theme);
        document.documentElement.style.colorScheme = theme;
        const headerColor = getComputedStyle(document.body)
          .getPropertyValue("--bg-color")
          .trim();
        if (headerColor) {
          document
            .querySelectorAll('meta[name="theme-color"]')
            .forEach((meta) => meta.setAttribute("content", headerColor));
        }
      });

      registrar.regEffect(appIds.effects.uiSetBodyOverflow, ({ value }) => {
        if (typeof document !== "undefined" && document.body) {
          document.body.style.overflow = value;
        }
      });

      const deadline = createExamDeadlineTimer(runtime);
      registrar.regEffect(
        appIds.effects.testSessionSetDeadline,
        deadline.setDeadline,
      );
      globalThis.window?.addEventListener("focus", deadline.reconcile);
      globalThis.window?.addEventListener("pageshow", deadline.reconcile);
      globalThis.document?.addEventListener(
        "visibilitychange",
        deadline.reconcile,
      );
      return () => {
        deadline.setDeadline(null);
        globalThis.window?.removeEventListener("focus", deadline.reconcile);
        globalThis.window?.removeEventListener("pageshow", deadline.reconcile);
        globalThis.document?.removeEventListener(
          "visibilitychange",
          deadline.reconcile,
        );
      };
    },
  ]);
}

/** Keep system-following theme in sync after persistence hydration. */
export function watchWebSystemTheme(runtime: AppRuntime): () => void {
  if (typeof globalThis.matchMedia !== "function") return () => {};

  let mediaQuery;
  try {
    mediaQuery = globalThis.matchMedia(COLOR_SCHEME_QUERY);
  } catch {
    return () => {};
  }

  const handleChange = (event: MediaQueryListEvent) => {
    runtime.dispatch([
      appIds.events.preferencesSystemThemeChanged,
      event.matches ? "dark" : "light",
    ]);
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener?.("change", handleChange);
    };
  }

  if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleChange);
    return () => {
      mediaQuery.removeListener?.(handleChange);
    };
  }

  return () => {};
}
