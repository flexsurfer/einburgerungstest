import { expect, it } from "vitest";
import { formatMistakeCount } from "../src/i18n.ts";

it.each([
  ["en", 1, "1 mistake"],
  ["en", 2, "2 mistakes"],
  ["de", 2, "2 Fehler"],
  ["tr", 5, "5 hata"],
  ["ru", 1, "1 ошибка"],
  ["ru", 2, "2 ошибки"],
  ["ru", 5, "5 ошибок"],
  ["ru", 11, "11 ошибок"],
  ["ru", 21, "21 ошибка"],
  ["uk", 22, "22 помилки"],
  ["uk", 25, "25 помилок"],
  ["ar", 1, "خطأ واحد"],
  ["ar", 2, "خطآن"],
  ["ar", 3, `${(3).toLocaleString("ar")} أخطاء`],
  ["ar", 11, `${(11).toLocaleString("ar")} خطأً`],
])(
  "formats the %s mistake badge for %i attempts",
  (language, count, expected) => {
    expect(formatMistakeCount(language, count)).toBe(expected);
  },
);
