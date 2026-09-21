import { describe, expect, it } from "vitest";
import {
  backgroundImageWidth,
  HOME_IMAGE_ASPECT_RATIO,
  MAP_ASPECT_RATIO,
  tabletMapWidth,
} from "../src/layout";

describe("responsive mobile layout", () => {
  it.each([320, 375, 390, 430, 599])(
    "preserves phone artwork and hero height at %i points",
    (width) => {
      expect(backgroundImageWidth(width, 844)).toBe(width);
      expect(backgroundImageWidth(width, 844) / HOME_IMAGE_ASPECT_RATIO).toBe(
        width / 2,
      );
    },
  );

  it.each([
    [600, 960],
    [768, 1024],
    [820, 1180],
    [1024, 768],
    [1366, 1024],
  ])("bounds artwork and maps at %i × %i", (width, height) => {
    const imageWidth = backgroundImageWidth(width, height);
    expect(imageWidth).toBeLessThanOrEqual(560);
    expect(imageWidth / HOME_IMAGE_ASPECT_RATIO).toBeLessThanOrEqual(
      height * 0.32,
    );

    // The settings sheet has a 680-point cap and 28-point inner gutters.
    const containerWidth = Math.min(width, 680) - 56;
    const mapWidth = tabletMapWidth(containerWidth, height);
    expect(mapWidth).toBeLessThanOrEqual(containerWidth);
    expect(mapWidth * MAP_ASPECT_RATIO).toBeLessThanOrEqual(
      height * 0.6 + 0.01,
    );
  });

  it("fits the map inside a constrained tablet panel", () => {
    expect(tabletMapWidth(300, 1024)).toBe(300);
    expect(tabletMapWidth(0, 1024)).toBe(0);
  });
});
