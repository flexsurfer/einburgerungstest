import { createUkladHooks, type UkladBindings } from "@ukladjs/core/react";
import type { AppContracts } from "./contracts.js";

/** One contract-bound provider/hooks pair shared by web and native views. */
const appBindings: UkladBindings<AppContracts> =
  createUkladHooks<AppContracts>();

export const UkladProvider: UkladBindings<AppContracts>["UkladProvider"] =
  appBindings.UkladProvider;
export const useRuntime: UkladBindings<AppContracts>["useRuntime"] =
  appBindings.useRuntime;
export const useSubscription: UkladBindings<AppContracts>["useSubscription"] =
  appBindings.useSubscription;
