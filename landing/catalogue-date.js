// Keep the existing source paragraphs current, including cached static pages.
(() => {
  const language = document.documentElement.lang || "en";
  const formatter = new Intl.DateTimeFormat(
    language === "en" ? "en-GB" : language,
    { dateStyle: "long", timeZone: "Europe/Berlin" },
  );
  let displayedDate;
  const updateDate = () => {
    const date = formatter.format(new Date());
    if (date === displayedDate) return;
    for (const element of document.querySelectorAll(
      "[data-current-date-template]",
    )) {
      element.textContent = element.dataset.currentDateTemplate.replaceAll(
        "{currentDate}",
        date,
      );
    }
    displayedDate = date;
  };
  updateDate();
  window.addEventListener("pageshow", updateDate);
  document.addEventListener("visibilitychange", updateDate);
  window.setInterval(updateDate, 60_000);
})();
