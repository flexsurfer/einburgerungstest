import React, { memo } from "react";
import { QuestionListView } from "./QuestionListView";
import { QuestionCardView } from "./QuestionCardView";
import { useIsTablet } from "../hooks/useIsTablet";
import { appIds, useSubscription } from "@ebtest/shared/uklad";
import { ExamResultScreen } from "./ExamResultScreen";

export const QuestionView = memo(() => {
  const isTabletDevice = useIsTablet();
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
  if (isTabletDevice) {
    return <QuestionListView />;
  } else {
    return <QuestionCardView />;
  }
});
