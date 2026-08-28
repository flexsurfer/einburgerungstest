import { StatusBar } from 'react-native'
import SystemNavigationBar from 'react-native-system-navigation-bar'
import type { MobilePlatform } from '@ebtest/mobile-app/platform'

export const barePlatform: MobilePlatform = {
  applySystemBarTheme(theme) {
    StatusBar.setBarStyle(theme === 'dark' ? 'light-content' : 'dark-content', true)
    void SystemNavigationBar.setBarMode(theme === 'dark' ? 'light' : 'dark')
  },
}
