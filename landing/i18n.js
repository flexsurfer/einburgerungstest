class I18n {
  constructor() {
    // Every URL keeps its language, including English search results at /.
    // A language change requires an explicit selector/link or legacy parameter.
    this.currentLanguage = document.documentElement.lang;
    this.translations = JSON.parse(
      document.getElementById("landing-translations").textContent,
    );
    this.ready = Promise.resolve();
    const legacyLanguage = new URLSearchParams(location.search).get("lang");
    if (legacyLanguage && this.languageLink(legacyLanguage)) {
      // An explicit English choice also works when browser storage is blocked.
      if (legacyLanguage !== this.currentLanguage) {
        this.switchLanguage(legacyLanguage, true, true);
      }
      return;
    }
  }

  languageLink(language) {
    return [...document.querySelectorAll("[data-language]")].find(
      (link) => link.dataset.language === language,
    );
  }

  getNestedTranslation(key) {
    return key
      .split(".")
      .reduce((value, part) => value?.[part], this.translations);
  }

  switchLanguage(language, save = true, replace = false) {
    const link = this.languageLink(language);
    if (!link) return;
    let storageBlocked = false;
    if (save) {
      try {
        localStorage.setItem("ebtest-language", language);
      } catch {
        storageBlocked = true;
      }
    }
    const url = new URL(link.href);
    url.search = location.search;
    url.searchParams.delete("lang");
    if (storageBlocked && language === "en") url.searchParams.set("lang", "en");
    url.hash = location.hash;
    if (replace) location.replace(url.href);
    else location.assign(url.href);
  }
}

window.i18n = new I18n();
document
  .getElementById("language-selector")
  .addEventListener("change", (event) => {
    window.i18n.switchLanguage(event.target.value);
  });
document.querySelectorAll("[data-language]").forEach((link) => {
  link.addEventListener("click", (event) => {
    try {
      localStorage.setItem("ebtest-language", link.dataset.language);
    } catch {
      if (link.dataset.language === "en") {
        event.preventDefault();
        window.i18n.switchLanguage("en");
      }
    }
  });
});
