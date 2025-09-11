import { useSubscription, dispatch } from '@flexsurfer/reflex'
import { Header } from './components/Header.jsx'
import { QuestionView } from './components/QuestionView.jsx'
import { Vocabulary } from './components/Vocabulary.jsx'
import { Statistics } from './components/Statistics.jsx'
import { SUB_IDS } from 'shared/sub-ids'
import './styles/App.css'

function App() {

  const vocabularyRender = useSubscription([SUB_IDS.VOCABULARY_RENDER], "App")
  const questionsLoaded = useSubscription([SUB_IDS.QUESTIONS_LOADED], "App")
  
  if (questionsLoaded) {
    return (
      <div className="app-container">
        <Header />
        <QuestionView />
        <Statistics />
        {vocabularyRender && (
          <Vocabulary />
        )}
      </div>
    )
  }
}

export default App
