document.documentElement.toggleAttribute(
  "data-ios",
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS can identify itself as a Mac when requesting desktop websites.
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1),
);
