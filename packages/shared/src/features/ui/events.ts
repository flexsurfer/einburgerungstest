import type { AppModule } from "../../app/uklad/register.js";
import { appIds, stateKeys } from "../../app/uklad/catalog.js";

export const registerUiEvents: AppModule = (registrar) => {
  registrar.regEvent(appIds.events.uiShowAnswersToggled, ({ draftState }) => {
    draftState[stateKeys.uiShowAnswers] = !draftState[stateKeys.uiShowAnswers];
  });

  registrar.regEvent(
    appIds.events.uiScrollToTop,
    (_context, behavior = "auto") => {
      return [[appIds.effects.uiScrollToTop, { behavior }]];
    },
  );

  registrar.regEvent(appIds.events.uiBodyOverflowSet, (_context, value) => {
    return [[appIds.effects.uiSetBodyOverflow, { value }]];
  });
};
