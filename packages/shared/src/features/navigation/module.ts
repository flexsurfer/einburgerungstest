import type { AppModule } from "../../app/uklad/register.js";
import { registerNavigationEvents } from "./events.js";
import { registerNavigationSubscriptions } from "./subscriptions.js";

export const registerNavigationModule: AppModule = (registrar) => {
  registerNavigationSubscriptions(registrar);
  registerNavigationEvents(registrar);
};
