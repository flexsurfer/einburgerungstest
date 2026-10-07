import { BackHandler, Platform } from "react-native";
import { appIds, type AppRuntime } from "@ebtest/shared/uklad";

/** Review returns to its result; other screens return Home; root uses Android Back. */
export function watchMobileBack(
  runtime: Pick<AppRuntime, "dispatch">,
  canGoBack: boolean,
  reviewingExam = false,
): (() => void) | undefined {
  if (Platform.OS !== "android" || !canGoBack) return;

  // Native Modals receive onRequestClose instead of hardwareBackPress, so an
  // open picker closes first and the underlying screen stays in place.
  const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
    runtime.dispatch([
      reviewingExam
        ? appIds.events.testSessionReviewClosed
        : appIds.events.navigationHomeOpened,
    ]);
    return true;
  });

  return () => subscription.remove();
}
