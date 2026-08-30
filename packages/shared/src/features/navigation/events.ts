import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";
import { generateTest } from "../test-session/generate.js";

export const registerNavigationEvents: AppModule = (registrar) => {
  registrar.regEvent(
    appIds.events.navigationCategorySelected,
    ({ draftState, coeffects: { random } }, category) => {
      draftState[stateKeys.navigationSelectedCategory] = category;
      if (category === "test") generateTest(draftState, 30, random);

      draftState[stateKeys.navigationCurrentQuestionIndex] = 0;
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
      return [[appIds.effects.uiScrollToTop, { behavior: "auto" }]];
    },
    { coeffects: { random: appIds.coeffects.systemRandom } },
  );

  registrar.regEvent(
    appIds.events.navigationQuestionSelected,
    ({ draftState }, questionIndex) => {
      draftState[stateKeys.navigationCurrentQuestionIndex] = questionIndex;
      draftState[stateKeys.navigationQuestionPickerVisible] = false;
    },
  );

  registrar.regEvent(appIds.events.navigationNext, ({ draftState }) => {
    const currentIndex =
      draftState[stateKeys.navigationCurrentQuestionIndex] || 0;
    const nextIndex = Math.min(
      currentIndex + 1,
      draftState[stateKeys.questionsItems].length - 1,
    );
    draftState[stateKeys.navigationCurrentQuestionIndex] = nextIndex;
  });

  registrar.regEvent(appIds.events.navigationPrevious, ({ draftState }) => {
    const currentIndex =
      draftState[stateKeys.navigationCurrentQuestionIndex] || 0;
    draftState[stateKeys.navigationCurrentQuestionIndex] = Math.max(
      currentIndex - 1,
      0,
    );
  });

  registrar.regEvent(
    appIds.events.navigationQuestionPickerShown,
    ({ draftState }, show) => {
      draftState[stateKeys.navigationQuestionPickerVisible] = show;
    },
  );
};
