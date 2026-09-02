import { memo } from "react";
import { QuestionListView } from "./QuestionListView.jsx";
import { QuestionCardView } from "./QuestionCardView.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { appIds, useSubscription } from "@ebtest/shared/uklad";
import { ExamResultScreen } from "./ExamResultScreen.jsx";

export const QuestionView = memo(() => {
  const isMobile = useIsMobile();
  const isTestMode = useSubscription(
    [appIds.subscriptions.navigationIsTestMode],
    "QuestionView",
  );
  const testSessionStatus = useSubscription(
    [appIds.subscriptions.testSessionStatus],
    "QuestionView",
  );

  if (isTestMode && testSessionStatus === "completed") {
    return <ExamResultScreen />;
  }

  // Render appropriate view based on device type
  if (isMobile) {
    return <QuestionCardView />;
  } else {
    return <QuestionListView />;
  }
});
