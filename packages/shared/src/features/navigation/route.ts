import { appIds } from "../../app/uklad/catalog.js";
import type {
  AppContracts,
  NavigationRoute,
} from "../../app/uklad/contracts.js";
import { selectPracticeQuestions } from "../practice/selection.js";

/** Describe a destination without depending on a browser or URL format. */
export function navigationRoute(state: AppContracts["state"]): NavigationRoute {
  const language = state.preferencesSelectedLanguage;
  if (
    state.navigationExamSetupVisible ||
    (state.navigationActiveScreen === "questions" &&
      state.navigationSelectedCategory === "test")
  ) {
    return { screen: "exam", language };
  }
  if (state.navigationActiveScreen !== "questions") {
    return { screen: state.navigationActiveScreen, language };
  }
  const category = state.navigationSelectedCategory;
  const questions = selectPracticeQuestions(state);
  const cursor = state.navigationIsLearnMode
    ? state.practiceLearnGlobalIndex
    : state.practiceGlobalIndex;
  const question =
    (category === null
      ? questions.find((item) => item.globalIndex === cursor)
      : undefined) ??
    questions[
      Math.min(state.navigationCurrentQuestionIndex, questions.length - 1)
    ];
  return {
    screen: state.navigationIsLearnMode
      ? "learn"
      : category === "favorites"
        ? "favorites"
        : category === "wrong"
          ? "mistakes"
          : "practice",
    language,
    ...(category && category !== "favorites" && category !== "wrong"
      ? { category }
      : {}),
    ...(question ? { question: question.globalIndex } : {}),
  };
}

type RouteChange =
  AppContracts["effects"][typeof appIds.effects.navigationRouteChanged];

export function navigationEffect(
  state: AppContracts["state"],
  history: RouteChange["history"] = "push",
): [typeof appIds.effects.navigationRouteChanged, RouteChange] {
  return [
    appIds.effects.navigationRouteChanged,
    { route: navigationRoute(state), history },
  ];
}
