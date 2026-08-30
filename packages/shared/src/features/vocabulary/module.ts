import type { AppModule } from "../../app/uklad/register.js";
import { registerVocabularyEvents } from "./events.js";
import { registerVocabularySubscriptions } from "./subscriptions.js";

export const registerVocabularyModule: AppModule = (registrar) => {
  registerVocabularySubscriptions(registrar);
  registerVocabularyEvents(registrar);
};
