import { StyleSheet, SafeAreaView, View } from 'react-native'
import { QuestionList } from './src/components/QuestionList'
import { Header } from './src/components/Header'

function App() {
  return (
    <SafeAreaView style={styles.appContainer}>
      <Header style={{ zIndex: 1 }} />
      <View style={{ flex: 1, zIndex: 0 }}>
        <QuestionList />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  }
})

export default App
