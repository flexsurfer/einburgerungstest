import type { AppModule } from "../../app/uklad/register.js";
import { registerUiEvents } from "./events.js";
import { registerUiSubscriptions } from "./subscriptions.js";

export const registerUiModule: AppModule = (registrar) => {
  registerUiSubscriptions(registrar);
  registerUiEvents(registrar);
};
