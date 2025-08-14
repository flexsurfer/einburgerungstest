import { StyleSheet, View, Appearance, StatusBar, Platform } from 'react-native'
import { useEffect } from 'react'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { dispatch, useSubscription } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { useColors, type Colors } from './src/theme'
import { QuestionView } from './src/components/QuestionView'
import { Header } from './src/components/Header'
import { Statistics } from './src/components/Statistics'
import { SUB_IDS } from 'shared/sub-ids'
import SystemNavigationBar from 'react-native-system-navigation-bar'

function AppContent() {
  const theme = useSubscription([SUB_IDS.THEME])
  const themeColors = useColors()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch([EVENT_IDS.SYSTEM_THEME_CHANGED, colorScheme])
    })
    return () => listener.remove()
  }, [])

  if (Platform.OS === 'android') {
    useEffect(() => {
      StatusBar.setBarStyle(theme === 'dark' ? 'light-content' : 'dark-content', true);
      SystemNavigationBar.setBarMode(theme === 'dark' ? 'light' : 'dark');
    }, [theme]);
  }

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

function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
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
