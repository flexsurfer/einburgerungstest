// All learning content and links are in the HTML. This script only enhances
// the catalogue search and remembers the same theme as the landing pages.
const themeButton = document.getElementById("resource-theme");
let theme;
try {
  theme = localStorage.getItem("ebtest-landing-theme");
} catch {
  /* Optional preference. */
}
if (!theme)
  theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
const applyTheme = () => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  themeButton.setAttribute("aria-pressed", String(theme === "dark"));
};
applyTheme();
themeButton.addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  applyTheme();
  try {
    localStorage.setItem("ebtest-landing-theme", theme);
  } catch {
    /* Optional preference. */
  }
});

const search = document.getElementById("question-search");
if (search) {
  const count = document.getElementById("search-count");
  const groups = [...document.querySelectorAll(".question-group")];
  const normalise = (value) =>
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .replace(/ı/g, "i")
      .replace(/ـ/g, "")
      .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
  const entries = groups.map((group) => ({
    group,
    open: false,
    questions: [...group.querySelectorAll("[data-search]")].map((item) => ({
      item,
      text: normalise(item.dataset.search),
    })),
  }));
  let searching = false;
  search.closest(".catalogue-search").hidden = false;
  search.addEventListener("input", () => {
    const words = normalise(search.value).trim().split(/\s+/).filter(Boolean);
    let matches = 0;
    for (const entry of entries) {
      if (!searching) entry.open = entry.group.open;
      let visible = 0;
      for (const { item, text } of entry.questions) {
        item.hidden = !words.every((word) => text.includes(word));
        if (!item.hidden) visible++;
      }
      entry.group.hidden = visible === 0;
      entry.group.open = words.length ? visible > 0 : entry.open;
      matches += visible;
    }
    searching = words.length > 0;
    count.textContent = count.dataset.label.replace("{count}", String(matches));
  });
}
