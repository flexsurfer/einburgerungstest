import React, { memo } from "react";
import { QuestionListView } from "./QuestionListView";
import { QuestionCardView } from "./QuestionCardView";
import { useIsTablet } from "../hooks/useIsTablet";
import { appIds, useSubscription } from "@ebtest/shared/uklad";
import { ExamResultScreen } from "./ExamResultScreen";
import { ExamReviewScreen } from "./ExamReviewScreen";

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

  const reviewing = useSubscription(
    [appIds.subscriptions.testSessionReviewVisible],
    "QuestionView",
  );
  if (isTestMode && testSessionStatus === "completed") {
    return reviewing ? <ExamReviewScreen /> : <ExamResultScreen />;
  }

  // Render appropriate view based on device type
  if (isTabletDevice) {
    return <QuestionListView />;
  } else {
    return <QuestionCardView />;
  }
});
