import { describe, expect, it } from "vitest";
import { FEDERAL_LANDS } from "@ebtest/shared/uklad";
import { GERMANY_MAP_PATHS } from "../src/components/GermanyMap.paths";

describe("Germany Land map", () => {
  it("contains one SVG path for every selectable federal state", () => {
    expect(GERMANY_MAP_PATHS).toHaveLength(FEDERAL_LANDS.length);
    expect(GERMANY_MAP_PATHS.map(({ land }) => land).sort()).toEqual(
      [...FEDERAL_LANDS].sort(),
    );
    expect(GERMANY_MAP_PATHS.every(({ d }) => d.startsWith("M"))).toBe(true);
  });
});
