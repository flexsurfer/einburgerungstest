import { StyleSheet, View, Appearance } from 'react-native'
import { useEffect } from 'react'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { dispatch, useSubscription } from '@flexsurfer/reflex'
import { EVENT_IDS } from '@ebtest/shared/event-ids'
import { useColors, type Colors } from './theme'
import { QuestionView } from './components/QuestionView'
import { Header } from './components/Header'
import { Statistics } from './components/Statistics'
import { SUB_IDS } from '@ebtest/shared/sub-ids'
import type { MobilePlatform } from './platform'

interface AppProps {
  platform: MobilePlatform
}

function AppContent({ platform }: AppProps) {
  const theme = useSubscription([SUB_IDS.THEME])
  const themeColors = useColors()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch([EVENT_IDS.SYSTEM_THEME_CHANGED, colorScheme])
    })
    return () => listener.remove()
  }, [])

  useEffect(() => {
    void platform.applySystemBarTheme(theme === 'dark' ? 'dark' : 'light')
  }, [platform, theme])

  return (
    <View style={styles(themeColors, insets).appContainer}>
      {/* <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      /> */}
      <Header style={{ zIndex: 1 }} />
      <View style={{ flex: 1, zIndex: 0 }}>
        <QuestionView />
      </View>
      <Statistics />
    </View>
  )
}

function App({ platform }: AppProps) {
  return (
    <SafeAreaProvider>
      <AppContent platform={platform} />
    </SafeAreaProvider>
  )
}

const styles = (colors: Colors, insets: { top: number; bottom: number; left: number; right: number }) => StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.bgColor,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  }
})

export default App
