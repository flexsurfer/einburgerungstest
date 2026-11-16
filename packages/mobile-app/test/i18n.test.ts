import { describe, expect, it } from "vitest";
import { categoryDisplayName, resolveLanguage, translate } from "../src/i18n";

describe("mobile localization", () => {
  it("normalizes supported device locales and falls back to English", () => {
    expect(resolveLanguage("de-DE")).toBe("de");
    expect(resolveLanguage("AR_sa")).toBe("ar");
    expect(resolveLanguage("uk-UA")).toBe("uk");
    expect(resolveLanguage(" UK_ua ")).toBe("uk");
    expect(resolveLanguage("ua")).toBe("en");
    expect(resolveLanguage("fr-FR")).toBe("en");
    expect(resolveLanguage(null)).toBe("en");
  });

  it("translates labels and interpolates values", () => {
    expect(translate("ru", "settings")).toBe("Настройки");
    expect(translate("tr", "itemOfTotal", { current: 3, total: 10 })).toBe(
      "10 sorudan 3",
    );
    expect(categoryDisplayName("Politik", "ar")).toBe("السياسة");
    expect(translate("uk", "settings")).toBe("Налаштування");
    expect(translate("uk", "itemOfTotal", { current: 3, total: 10 })).toBe(
      "3 із 10",
    );
    expect(categoryDisplayName("Politik", "uk")).toBe("Політика");
  });

  it.each([
    [2, "помилки"],
    [5, "помилок"],
    [11, "помилок"],
    [14, "помилок"],
    [21, "помилка"],
    [22, "помилки"],
    [25, "помилок"],
    [112, "помилок"],
  ])("uses the Ukrainian mistake ending for %i attempts", (count, label) => {
    expect(translate("uk", "mistakesPlural", { count })).toBe(label);
  });
});
