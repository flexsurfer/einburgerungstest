import { StyleSheet, SafeAreaView } from 'react-native'
import { QuestionList } from './src/components/QuestionList'

function App() {
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
