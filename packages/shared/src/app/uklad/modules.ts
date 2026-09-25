import type { UkladDisposer, UkladRuntime } from "@ukladjs/core/vanilla";
import { registerNavigationModule } from "../../features/navigation/module.js";
import { registerPreferencesModule } from "../../features/preferences/module.js";
import { registerPracticeModule } from "../../features/practice/module.js";
import { registerQuestionsModule } from "../../features/questions/module.js";
import { registerTestSessionModule } from "../../features/test-session/module.js";
import { registerUiModule } from "../../features/ui/module.js";
import { registerAppModules, type AppModule } from "./register.js";
import type { AppContracts } from "./contracts.js";

/** Shared state graph installed by every application execution owner. */
export const sharedAppModules: readonly AppModule[] = [
  registerUiModule,
  registerPreferencesModule,
  registerQuestionsModule,
  registerTestSessionModule,
  registerPracticeModule,
  registerNavigationModule,
];

export function registerSharedModules<TContracts extends AppContracts>(
  runtime: UkladRuntime<TContracts>,
): readonly UkladDisposer[] {
  // Shared feature handlers only use the base app contract. Persist extends
  // it with protocol roots/events, so the composed runtime can host the same
  // modules while platform modules may still be authored against TContracts.
  return registerAppModules(
    runtime,
    sharedAppModules as unknown as readonly AppModule<TContracts>[],
  );
}
