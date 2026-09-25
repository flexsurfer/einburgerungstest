const themeButton = document.getElementById("theme-toggle");
let theme;
try {
  theme = localStorage.getItem("ebtest-landing-theme");
} catch {
  /* Optional preference. */
}
if (!theme)
  theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
function applyTheme() {
  document.documentElement.classList.toggle("dark", theme === "dark");
  themeButton.setAttribute("aria-pressed", String(theme === "dark"));
  const key =
    theme === "dark"
      ? "navigation.themeToggleLight"
      : "navigation.themeToggleDark";
  themeButton.setAttribute(
    "aria-label",
    window.i18n?.getNestedTranslation(key) || "Toggle color theme",
  );
}
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
document.getElementById("year").textContent = new Date().getFullYear();
let questions = [];
let current = 0;
let selected = null;
const answers = document.getElementById("demo-answers");
const feedback = document.getElementById("demo-feedback");
const next = document.getElementById("demo-next");
const text = (key, fallback) =>
  window.i18n?.getNestedTranslation(key) || fallback;
function renderDemo() {
  if (!questions.length) return;
  const question = questions[current];
  document.getElementById("demo-question").textContent = question.question;
  document.getElementById("demo-number").textContent =
    `${String(current + 1).padStart(2, "0")} / 03`;
  answers.replaceChildren();
  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.lang = "de";
    button.dir = "ltr";
    button.setAttribute("aria-pressed", String(selected === index));
    const letter = document.createElement("span");
    letter.textContent = String.fromCharCode(65 + index);
    letter.setAttribute("aria-hidden", "true");
    button.append(letter, document.createTextNode(answer));
    if (selected !== null) {
      button.disabled = true;
      if (index === question.correct) button.classList.add("correct");
      else if (index === selected) button.classList.add("wrong");
    }
    button.addEventListener("click", () => {
      selected = index;
      renderDemo();
    });
    answers.append(button);
  });
  feedback.textContent =
    selected === null
      ? text("demo.hint", "Go on, give it a try.")
      : selected === question.correct
        ? text("demo.correct", "That’s right. A good start!")
        : text("demo.wrong", "A little more learned. Keep going.");
}
next.addEventListener("click", () => {
  if (!questions.length) return;
  current = (current + 1) % questions.length;
  selected = null;
  renderDemo();
});
document.addEventListener("languagechange", () => {
  applyTheme();
  renderDemo();
});
fetch("/landing/sample-questions.json")
  .then((response) => {
    if (!response.ok) throw new Error("Unavailable");
    return response.json();
  })
  .then((data) => {
    questions = data;
    renderDemo();
  })
  .catch(() => {
    feedback.textContent = text("hero.ctaPrimary", "Start practicing");
    next.hidden = true;
    const link = document.createElement("a");
    link.href = "/app/";
    link.className = "text-button";
    link.textContent = text("navigation.webApp", "Open web app");
    answers.append(link);
  });
