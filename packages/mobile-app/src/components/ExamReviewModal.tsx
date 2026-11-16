import { Modal, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useColors } from "../theme";
import { useI18n } from "../i18n";
import { ExamReviewScreen } from "./ExamReviewScreen";

export function ExamReviewModal() {
  const runtime = useRuntime();
  const colors = useColors();
  const { isRtl } = useI18n("ExamReviewModal");
  const visible = useSubscription(
    [appIds.subscriptions.testSessionReviewVisible],
    "ExamReviewModal",
  );
  const close = () => runtime.dispatch([appIds.events.testSessionReviewClosed]);

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      allowSwipeDismissal
      onRequestClose={close}
      supportedOrientations={["portrait", "landscape"]}
      visible={visible}
    >
      <SafeAreaProvider style={{ backgroundColor: colors.pageColor }}>
        <SafeAreaView
          accessibilityViewIsModal
          onAccessibilityEscape={close}
          style={[styles.screen, { direction: isRtl ? "rtl" : "ltr" }]}
        >
          <ExamReviewScreen onClose={close} />
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
