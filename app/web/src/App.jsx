import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { Header } from './components/Header.jsx'
import { QuestionList } from './components/QuestionList.jsx'
import { Welcome } from './components/Welcome.jsx'
import { Vocabulary } from './components/Vocabulary.jsx'
import { Statistics } from './components/Statistics.jsx'
import { EVENT_IDS } from 'shared/event-ids'
import { SUB_IDS } from 'shared/sub-ids'
import './styles/App.css'

function App() {

  const showWelcome = useSubscription([SUB_IDS.SHOW_WELCOME], "App")
  const vocabularyRender = useSubscription([SUB_IDS.VOCABULARY_RENDER], "App")
  const questionsLoaded = useSubscription([SUB_IDS.QUESTIONS_LOADED], "App")
  
  if (showWelcome) {
    return <Welcome onStart={() => dispatch([EVENT_IDS.SET_SHOW_WELCOME, false])} />
  }

  if (questionsLoaded) {
    return (
      <div className="app-container">
        <Header />
        <QuestionList />
        <Statistics />
        {vocabularyRender && (
          <Vocabulary />
        )}
      </div>
    )
  }
}

export default App
