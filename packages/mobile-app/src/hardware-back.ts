import { BackHandler, Platform } from "react-native";
import { appIds, type AppRuntime } from "@ebtest/shared/uklad";

/** Match the in-app Home action; Android retains its default behavior at root. */
export function watchMobileBack(
  runtime: Pick<AppRuntime, "dispatch">,
  canGoBack: boolean,
): (() => void) | undefined {
  if (Platform.OS !== "android" || !canGoBack) return;

  // Native Modals receive onRequestClose instead of hardwareBackPress, so an
  // open picker closes first and the underlying screen stays in place.
  const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
    runtime.dispatch([appIds.events.navigationHomeOpened]);
    return true;
  });

  return () => subscription.remove();
}
