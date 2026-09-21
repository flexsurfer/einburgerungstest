export const TABLET_BREAKPOINT = 600;
export const HOME_IMAGE_ASPECT_RATIO = 1774 / 887;
export const MAP_ASPECT_RATIO = 800.504 / 591.504;

// Keep phone artwork unchanged; tablet artwork should not grow with the window.
export function backgroundImageWidth(width: number, height: number): number {
  return width < TABLET_BREAKPOINT
    ? width
    : Math.min(width, 560, height * 0.32 * HOME_IMAGE_ASPECT_RATIO);
}

export function tabletMapWidth(containerWidth: number, height: number): number {
  return Math.max(
    0,
    Math.min(containerWidth, 480, (height * 0.6) / MAP_ASPECT_RATIO),
  );
}
