import type { AppModule } from "../../app/uklad/register.js";
import { registerPreferencesEvents } from "./events.js";
import { registerPreferencesSubscriptions } from "./subscriptions.js";

export const registerPreferencesModule: AppModule = (registrar) => {
  registerPreferencesSubscriptions(registrar);
  registerPreferencesEvents(registrar);
};
