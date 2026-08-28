export interface MobilePlatform {
  applySystemBarTheme(theme: 'light' | 'dark'): void | Promise<void>
}
