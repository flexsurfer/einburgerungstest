(() => {
  const languages = ["de", "en", "ru", "uk", "tr", "ar"];
  let lastPage;

  // Umami observes History API changes. Only a new screen or language counts
  // as a pageview, even when practice replaces the URL for every question.
  window.ebtestPageview = (type, payload) => {
    if (type !== "event" || !payload?.url || payload.name) return false;
    const page = new URL(payload.url, location.origin);
    let url = page.pathname.replace(/\/index\.html$/, "/");
    if (url.startsWith("/app/")) {
      const language = page.searchParams.get("lang");
      // Hydration supplies the saved language when a link omits it.
      if (!languages.includes(language)) return false;
      url += `?lang=${language}`;
    }
    if (url === lastPage) return false;
    const referrer =
      payload.referrer && new URL(payload.referrer, location.origin);
    lastPage = url;
    return {
      website: payload.website,
      hostname: payload.hostname,
      screen: payload.screen,
      language: payload.language,
      url,
      referrer:
        referrer && ["http:", "https:"].includes(referrer.protocol)
          ? referrer.origin
          : "",
    };
  };

  const tracker = document.createElement("script");
  tracker.src = "https://cloud.umami.is/script.js";
  tracker.referrerPolicy = "strict-origin";
  tracker.dataset.websiteId = "acc7c2d5-7613-4161-8d68-7eec39770b16";
  tracker.dataset.beforeSend = "ebtestPageview";
  tracker.dataset.excludeHash = "true";
  document.head.append(tracker);
})();
