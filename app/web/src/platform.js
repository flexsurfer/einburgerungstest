import {
  appIds,
  registerAppModules,
  stateKeys,
} from "@ebtest/shared/uklad";

const DATA_URLS = Object.freeze({
  questions: "/assets/data.json",
  vocabulary: "/assets/vocabulary_multilang.json",
});

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function themeFromMediaQuery() {
  if (typeof globalThis.matchMedia !== "function") return null;

  try {
    return globalThis.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light";
  } catch {
    return null;
  }
}

async function fetchJson({ dataType, url, method }, runtime) {
  try {
    if (typeof globalThis.fetch !== "function") {
      throw new Error("Fetch is not available in this browser");
    }

    const response = await globalThis.fetch(url || DATA_URLS[dataType], {
      method: method || "GET",
    });

    if (response.ok === false) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (dataType === "questions" && !Array.isArray(data)) {
      throw new Error("Questions response must be an array");
    }
    if (
      dataType === "vocabulary" &&
      (typeof data !== "object" || data === null || Array.isArray(data))
    ) {
      throw new Error("Vocabulary response must be an object");
    }

    const event =
      dataType === "questions"
        ? appIds.events.questionsFetchSucceeded
        : appIds.events.vocabularyFetchSucceeded;
    runtime.dispatch([event, data]);
  } catch (error) {
    const event =
      dataType === "questions"
        ? appIds.events.questionsFetchFailed
        : appIds.events.vocabularyFetchFailed;
    runtime.dispatch([event, errorMessage(error)]);
  }
}

/** Register browser-only effects and coeffects on one Uklad runtime. */
export function registerWebPlatform(runtime) {
  return registerAppModules(runtime, [
    (registrar) => {
      registrar.regCoeffect(
        appIds.coeffects.systemColorScheme,
        themeFromMediaQuery,
      );

      registrar.regEvent(
        appIds.events.appInitialize,
        ({ draftState, coeffects: { system } }) => {
          const followsSystem =
            draftState[stateKeys.preferencesUseSystemTheme];
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
          void fetchJson(payload || {}, effectRuntime);
        },
      );

      registrar.regEffect(
        appIds.effects.dataLoadLocal,
        (payload, effectRuntime) => {
          void fetchJson(payload || {}, effectRuntime);
        },
      );

      registrar.regEffect(appIds.effects.uiScrollToTop, ({ behavior } = {}) => {
        if (typeof globalThis.scrollTo === "function") {
          globalThis.scrollTo({ top: 0, behavior: behavior || "auto" });
        }
      });

      registrar.regEffect(
        appIds.effects.uiConfirmClear,
        (_payload, effectRuntime) => {
          if (
            typeof globalThis.confirm === "function" &&
            globalThis.confirm(
              "Are you sure you want to clear ALL your progress?",
            )
          ) {
            effectRuntime.dispatch([appIds.events.practiceAnswersCleared]);
          }
        },
      );

      registrar.regEffect(appIds.effects.uiSetBodyTheme, ({ theme } = {}) => {
        if (typeof document === "undefined" || !document.body) return;

        document.body.classList.remove("light", "dark");
        document.body.classList.add(theme);
        document.documentElement.style.colorScheme = theme;
      });

      registrar.regEffect(
        appIds.effects.uiSetBodyOverflow,
        ({ value } = {}) => {
          if (typeof document !== "undefined" && document.body) {
            document.body.style.overflow = value;
          }
        },
      );
    },
  ]);
}

/** Keep system-following theme in sync after persistence hydration. */
export function watchWebSystemTheme(runtime) {
  if (typeof globalThis.matchMedia !== "function") return () => {};

  let mediaQuery;
  try {
    mediaQuery = globalThis.matchMedia(COLOR_SCHEME_QUERY);
  } catch {
    return () => {};
  }

  const handleChange = (event) => {
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
