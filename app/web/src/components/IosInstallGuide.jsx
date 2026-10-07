import { useEffect, useRef, useState } from "react";
import { resolveLanguage, useI18n } from "@ebtest/shared/i18n";
import { isIosDevice, isStandalone } from "../home-screen.js";
import { installTranslations } from "../install-translations.js";
import "../styles/IosInstallGuide.css";

export function IosInstallGuide() {
  const { language: appLanguage } = useI18n("IosInstallGuide");
  const dialogRef = useRef(null);
  const [request] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      show: params.get("install") === "ios" && isIosDevice() && !isStandalone(),
      language: params.get("install-language"),
    };
  });
  const language = request.language
    ? resolveLanguage(request.language)
    : appLanguage;
  const t = (key) => installTranslations(language)[key];

  useEffect(() => {
    // Keep the saved Home Screen URL clean and avoid reopening on refresh.
    const url = new URL(window.location.href);
    if (url.searchParams.get("install") === "ios") {
      url.searchParams.delete("install");
      url.searchParams.delete("install-language");
      window.history.replaceState(window.history.state, "", url);
    }
    if (!request.show) return;
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, [request.show]);

  if (!request.show) return null;

  return (
    <dialog
      ref={dialogRef}
      className="ios-install-dialog"
      aria-labelledby="ios-install-title"
      aria-describedby="ios-install-description"
      lang={language}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <img src="/apple-touch-icon.png" alt="" width="64" height="64" />
      <h2 id="ios-install-title">{t("installTitle")}</h2>
      <p id="ios-install-description">{t("installDescription")}</p>
      <ol>
        <li>
          <svg
            className="ios-share-icon"
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 16V3m-4 4 4-4 4 4M7 10H4v11h16V10h-3" />
          </svg>
          {t("installShare")}
        </li>
        <li>{t("installAdd")}</li>
        <li>{t("installConfirm")}</li>
      </ol>
      <p className="ios-install-note">{t("installSafari")}</p>
      <button
        type="button"
        className="primary-button"
        onClick={() => dialogRef.current.close()}
        autoFocus
      >
        {t("installDismiss")}
      </button>
    </dialog>
  );
}
