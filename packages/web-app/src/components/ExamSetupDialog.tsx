import { useLayoutEffect, useRef } from "react";
import { appIds, useRuntime, useSubscription } from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";
import { LandSelect } from "./LandSelect";
import { UiIcon } from "./UiIcon";

export function ExamSetupDialog() {
  const runtime = useRuntime();
  const land = useSubscription(
    [appIds.subscriptions.preferencesSelectedLand],
    "ExamSetupDialog",
  );
  const { t } = useI18n("ExamSetupDialog");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const close = () => runtime.dispatch([appIds.events.navigationExamClosed]);
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    title.current?.focus({ preventScroll: true });
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className="exam-dialog"
      aria-labelledby="exam-setup-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="dialog-heading">
        <span className="icon-tile">
          <UiIcon name="exam" size={28} />
        </span>
        <button
          className="icon-button"
          aria-label={t("cancel")}
          onClick={close}
        >
          <UiIcon name="close" />
        </button>
      </div>
      <p className="eyebrow">{t("mockExam")}</p>
      <h2 id="exam-setup-title" ref={title} tabIndex={-1}>
        {t("chooseFederalState")}
      </h2>
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
        onClick={() => runtime.dispatch([appIds.events.testSessionStarted])}
      >
        {t("startExam")}
        <UiIcon name="arrow" />
      </button>
    </dialog>
  );
}
