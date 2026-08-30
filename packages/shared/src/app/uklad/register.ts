import type {
  UkladDisposer,
  UkladModule,
  UkladRegistrar,
  UkladRuntime,
} from "@ukladjs/core/vanilla";
import type { AppContracts } from "./contracts.js";

export type AppModule<TContracts extends AppContracts = AppContracts> =
  UkladModule<UkladRegistrar<TContracts>>;

/** Install the shared feature/platform modules on one runtime owner. */
export function registerAppModules<TContracts extends AppContracts>(
  runtime: UkladRuntime<TContracts>,
  modules: readonly AppModule<TContracts>[],
): readonly UkladDisposer[] {
  return modules.map((module) => runtime.registerModule(module));
}
