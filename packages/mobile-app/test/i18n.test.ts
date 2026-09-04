import { describe, expect, it } from "vitest";
import { categoryDisplayName, resolveLanguage, translate } from "../src/i18n";

describe("mobile localization", () => {
  it("normalizes supported device locales and falls back to English", () => {
    expect(resolveLanguage("de-DE")).toBe("de");
    expect(resolveLanguage("AR_sa")).toBe("ar");
    expect(resolveLanguage("fr-FR")).toBe("en");
    expect(resolveLanguage(null)).toBe("en");
  });

  it("translates labels and interpolates values", () => {
    expect(translate("ru", "settings")).toBe("Настройки");
    expect(translate("tr", "itemOfTotal", { current: 3, total: 10 })).toBe(
      "10 sorudan 3",
    );
    expect(categoryDisplayName("Politik", "ar")).toBe("السياسة");
  });
});
