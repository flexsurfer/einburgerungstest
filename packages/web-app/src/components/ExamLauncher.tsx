import type { ReactNode } from "react";
import { useI18n } from "@ebtest/shared/i18n";
import { AppLink } from "./AppLink";
import { UiIcon } from "./UiIcon";

interface ExamLauncherProps {
  className?: string;
  children?: ReactNode;
}

export function ExamLauncher({
  className = "primary-button",
  children,
}: ExamLauncherProps) {
  const { t } = useI18n("ExamLauncher");
  return (
    <AppLink className={className} route={{ screen: "exam" }}>
      {children || (
        <>
          <UiIcon name="exam" />
          {t("mockExam")}
        </>
      )}
    </AppLink>
  );
}
