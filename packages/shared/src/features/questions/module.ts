import type { AppModule } from "../../app/uklad/register.js";
import { registerQuestionsEvents } from "./events.js";
import { registerQuestionsSubscriptions } from "./subscriptions.js";

export const registerQuestionsModule: AppModule = (registrar) => {
  registerQuestionsSubscriptions(registrar);
  registerQuestionsEvents(registrar);
};
