import type { AppModule } from "../../app/uklad/register.js";
import { appIds } from "../../app/uklad/catalog.js";
import { registerTestSessionEvents } from "./events.js";
import { registerTestSessionSubscriptions } from "./subscriptions.js";

export const registerTestSessionModule: AppModule = (registrar) => {
  // Randomness is injected as a coeffect so test generation remains a pure
  // synchronous event turn. Deterministic runtimes can provide another
  // test-session module when they need a fixed sequence.
  registrar.regCoeffect(appIds.coeffects.systemRandom, () => Math.random);
  registerTestSessionEvents(registrar);
  registerTestSessionSubscriptions(registrar);
};
