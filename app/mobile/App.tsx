import { StyleSheet, SafeAreaView, View, Appearance } from 'react-native'
import { useEffect } from 'react'
import { dispatch } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'
import { useColors, type Colors } from './src/theme'
import { QuestionList } from './src/components/QuestionList'
import { Header } from './src/components/Header'

function App() {
  const themeColors = useColors()

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch([EVENT_IDS.SYSTEM_THEME_CHANGED, colorScheme])
    })
    return () => listener.remove()
  }, [])

  return (
    <SafeAreaView style={styles(themeColors).appContainer}>
      <Header style={{ zIndex: 1 }} />
      <View style={{ flex: 1, zIndex: 0 }}>
        <QuestionList />
      </View>
    </SafeAreaView>
  )
}

const styles = (colors: Colors) => StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.bgColor,
  }
})

export default App
