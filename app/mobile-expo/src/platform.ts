import { Platform } from 'react-native'
import { NavigationBar } from 'expo-navigation-bar'
import { setStatusBarStyle } from 'expo-status-bar'
import type { MobilePlatform } from '@ebtest/mobile-app/platform'

export const expoPlatform: MobilePlatform = {
  applySystemBarTheme(theme) {
    const style = theme === 'dark' ? 'light' : 'dark'

    setStatusBarStyle(style, true)
    if (Platform.OS === 'android') {
      NavigationBar.setStyle(style)
    }
  },
}
