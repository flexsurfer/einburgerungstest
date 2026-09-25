import { Alert, Appearance } from "react-native";
import {
  appIds,
  registerAppModules,
  stateKeys,
  type AppRuntime,
  type ColorScheme,
  type DataKind,
  type QuestionInput,
  type ScrollMode,
  type Theme,
} from "@ebtest/shared/uklad";
import questionsData from "../assets/data.json";
import { questionListRef } from "./refs";
import { translate } from "./i18n";

export interface MobilePlatform {
  applySystemBarTheme(theme: Theme): void | Promise<void>;
  getDeviceLanguage?(): string | null;
}

export const mobileQuestionsData = questionsData as QuestionInput[];

const localData: Record<DataKind, unknown> = {
  questions: mobileQuestionsData,
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function validateData(dataType: DataKind, data: unknown): void {
  if (dataType === "questions" && !Array.isArray(data)) {
    throw new Error("Questions data must be an array");
  }
}

function localDataFor(dataType: DataKind): unknown {
  if (dataType !== "questions") {
    throw new Error(`Unknown data type: ${String(dataType)}`);
  }
  const data = localData[dataType];
  validateData(dataType, data);
  return data;
}

type MobileEffectRuntime = Pick<AppRuntime, "dispatch">;

/** Register the effects and coeffects supplied by bare RN and Expo hosts. */
export function registerMobilePlatform(
  runtime: AppRuntime,
  platform: MobilePlatform,
) {
  return registerAppModules(runtime, [
    (registrar) => {
      registrar.regCoeffect(
        appIds.coeffects.systemColorScheme,
        (): ColorScheme => Appearance.getColorScheme(),
      );
      registrar.regCoeffect(appIds.coeffects.systemNow, () => Date.now());

      registrar.regEvent(
        appIds.events.appInitialize,
        ({ draftState, coeffects: { system } }) => {
          const followsSystem = draftState[stateKeys.preferencesUseSystemTheme];
          const theme = followsSystem
            ? system || "light"
            : draftState[stateKeys.preferencesTheme];

          // Native views derive their colors from the Uklad theme root, so
          // mirror the initial system choice before the first render.
          if (followsSystem) {
            draftState[stateKeys.preferencesTheme] = theme;
          }

          return [[appIds.effects.uiSetBodyTheme, { theme }]];
        },
        { coeffects: { system: appIds.coeffects.systemColorScheme } },
      );

      const loadLocalData = (
        payload: { dataType: DataKind } = { dataType: "questions" },
        effectRuntime: MobileEffectRuntime,
      ) => {
        try {
          const data = localDataFor(payload.dataType) as QuestionInput[];
          effectRuntime.dispatch([appIds.events.questionsFetchSucceeded, data]);
        } catch (error) {
          effectRuntime.dispatch([
            appIds.events.questionsFetchFailed,
            errorMessage(error),
          ]);
        }
      };

      // Native ships bundled questions. Keep both effects registered so
      // shared request events remain platform-neutral.
      registrar.regEffect(appIds.effects.dataFetch, loadLocalData);
      registrar.regEffect(appIds.effects.dataLoadLocal, loadLocalData);

      registrar.regEffect(
        appIds.effects.uiScrollToTop,
        ({ behavior }: { behavior?: ScrollMode } = {}) => {
          // Category changes commit before the list re-renders. Match the
          // legacy behavior by allowing the new list ref to mount first.
          setTimeout(() => {
            questionListRef.current?.scrollToOffset({
              offset: 0,
              animated: behavior === "smooth",
            });
          }, 400);
        },
      );

      registrar.regEffect(
        appIds.effects.uiConfirmClear,
        ({ language }, effectRuntime) => {
          Alert.alert(
            translate(language, "clearProgress"),
            translate(language, "clearProgressMessage"),
            [
              { text: translate(language, "cancel"), style: "cancel" },
              {
                text: translate(language, "ok"),
                onPress: () =>
                  effectRuntime.dispatch([
                    appIds.events.practiceAnswersCleared,
                  ]),
              },
            ],
          );
        },
      );

      registrar.regEffect(
        appIds.effects.uiSetBodyTheme,
        ({ theme }: { theme: Theme }) => {
          void Promise.resolve(platform.applySystemBarTheme(theme)).catch(
            () => undefined,
          );
        },
      );

      // There is no document body in React Native. The event remains
      // registered because shared UI/navigation modules are reused.
      registrar.regEffect(appIds.effects.uiSetBodyOverflow, () => undefined);
    },
  ]);
}

/** Keep system-following theme in sync after persistence hydration. */
export function watchMobileSystemTheme(runtime: AppRuntime): () => void {
  if (typeof Appearance.addChangeListener !== "function") return () => {};

  const subscription = Appearance.addChangeListener(({ colorScheme }) => {
    runtime.dispatch([
      appIds.events.preferencesSystemThemeChanged,
      colorScheme,
    ]);
  });

  return () => subscription.remove();
}
