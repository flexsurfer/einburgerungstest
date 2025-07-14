import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { Header } from './components/Header'
import { QuestionList } from './components/QuestionList'
import { Welcome } from './components/Welcome'
import { Vocabulary } from './components/Vocabulary'
import { Statistics } from './components/Statistics'
import { EVENT_IDS } from './event-ids.js'
import { SUB_IDS } from './sub-ids.js'
import './styles/App.css'

function App() {

  const showWelcome = useSubscription([SUB_IDS.SHOW_WELCOME])
  const mode = useSubscription([SUB_IDS.MODE])
  const vocabularyRender = useSubscription([SUB_IDS.VOCABULARY_RENDER])
  const questionsLoaded = useSubscription([SUB_IDS.QUESTIONS_LOADED])
  
  if (showWelcome) {
    return <Welcome onStart={() => dispatch([EVENT_IDS.SET_SHOW_WELCOME, false])} />
  }

  if (questionsLoaded) {
    return (
      <div className="app-container">
        <Header />

        <QuestionList />
        {mode === 'testing' &&
          <Statistics />}

        {vocabularyRender && (
          <Vocabulary />
        )}
      </div>
    )
  }
}

export default App
