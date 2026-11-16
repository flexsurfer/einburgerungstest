import { useRef } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";
import { LandSelect } from "./LandSelect";
import { UiIcon } from "./UiIcon";
export function ExamLauncher({ className = "primary-button", children }) {
  const runtime = useRuntime();
  const land = useSubscription(
    [appIds.subscriptions.preferencesSelectedLand],
    "ExamLauncher",
  );
  const { t } = useI18n("ExamLauncher");
  const dialog = useRef(null);
  return (
    <>
      <button className={className} onClick={() => dialog.current.showModal()}>
        {children || (
          <>
            <UiIcon name="exam" />
            {t("mockExam")}
          </>
        )}
      </button>
      <dialog
        ref={dialog}
        aria-label={t("startMockExam")}
        className="exam-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current.close();
        }}
      >
        <div className="dialog-heading">
          <span className="icon-tile">
            <UiIcon name="exam" size={28} />
          </span>
          <button
            className="icon-button"
            aria-label={t("cancel")}
            onClick={() => dialog.current.close()}
          >
            <UiIcon name="close" />
          </button>
        </div>
        <p className="eyebrow">{t("mockExam")}</p>
        <h2>{t("chooseFederalState")}</h2>
        <p>{t("federalStateDescription")}</p>
        <LandSelect />
        <div className="exam-facts">
          <span>
            <UiIcon name="book" />
            {t("questionsCount", { count: 33 })}
          </span>
          <span>
            <UiIcon name="clock" />
            {t("minutesCount", { count: 60 })}
          </span>
        </div>
        <button
          className="primary-button"
          disabled={!land}
          onClick={() => {
            dialog.current.close();
            runtime.dispatch([appIds.events.testSessionStarted]);
          }}
        >
          {t("startExam")}
          <UiIcon name="arrow" />
        </button>
      </dialog>
    </>
  );
}
