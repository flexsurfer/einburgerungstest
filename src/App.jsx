import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { Header } from './components/Header'
import { QuestionList } from './components/QuestionList'
import { Welcome } from './components/Welcome'
import { Vocabulary } from './components/Vocabulary'
import { Statistics } from './components/Statistics'
import './styles/App.css'

function App() {

  const showWelcome = useSubscription(['showWelcome'])
  const mode = useSubscription(['mode'])

  if (showWelcome) {
    return <Welcome onStart={() => dispatch(['setShowWelcome', false])} />
  }

  return (
    <div className="app-container">
      <Header />

      {mode === 'vocabulary' &&
        <Vocabulary />}

      {mode !== 'vocabulary' && (
        <>
          <QuestionList />
          {mode === 'testing' &&
            <Statistics />}
        </>
      )}
    </div>
  )
}

export default App
