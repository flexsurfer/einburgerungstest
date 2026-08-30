import type { AppModule } from "../../app/uklad/register.js";
import { registerPracticeEvents } from "./events.js";
import { registerPracticeSubscriptions } from "./subscriptions.js";

export const registerPracticeModule: AppModule = (registrar) => {
  registerPracticeSubscriptions(registrar);
  registerPracticeEvents(registrar);
};
