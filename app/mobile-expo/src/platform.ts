import { Platform } from 'react-native'
import { NavigationBar } from 'expo-navigation-bar'
import { setStatusBarStyle } from 'expo-status-bar'
import { getLocales } from 'expo-localization'
import type { MobilePlatform } from '@ebtest/mobile-app/platform'

export const expoPlatform: MobilePlatform = {
  getDeviceLanguage() {
    return getLocales()[0]?.languageCode ?? null
  },
  applySystemBarTheme(theme) {
    const style = theme === 'dark' ? 'light' : 'dark'

    setStatusBarStyle(style, true)
    if (Platform.OS === 'android') {
      NavigationBar.setStyle(style)
    }
  },
}
