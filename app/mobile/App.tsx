import { useSubscription } from '@flexsurfer/reflex'
import { StyleSheet, SafeAreaView } from 'react-native'

import { SUB_IDS } from 'shared/sub-ids'
import { QuestionList } from './src/components/QuestionList'

function App() {
  const showWelcome = useSubscription([SUB_IDS.SHOW_WELCOME])

  return (
    <SafeAreaView style={styles.appContainer}>
      <QuestionList />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  }
})

export default App
