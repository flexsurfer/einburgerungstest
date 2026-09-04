import {
  createUkladRuntime,
  type CreateUkladRuntimeOptions,
  type UkladRuntime,
} from "@ukladjs/core/vanilla";
import { createAppState, type CreateAppStateOptions } from "./initial-state.js";
import type { AppContracts } from "./contracts.js";

export type AppRuntimeOptions = Omit<
  CreateUkladRuntimeOptions<AppContracts["state"]>,
  "initialState"
> &
  CreateAppStateOptions;

export type AppRuntime = UkladRuntime<AppContracts>;

/**
 * Create one isolated Uklad runtime for a web/native app, SSR request, or test
 * fixture. Feature modules are installed by the execution owner.
 */
export function createAppRuntime(
  options: AppRuntimeOptions = {},
): UkladRuntime<AppContracts> {
  const {
    runtimeId = "einburgerungstest",
    name = "Einbürgerungstest",
    initialQuestions,
    initialLanguage,
    ...runtimeOptions
  } = options;

  return createUkladRuntime<AppContracts>({
    initialState: createAppState({ initialQuestions, initialLanguage }),
    runtimeId,
    name,
    ...runtimeOptions,
  });
}
