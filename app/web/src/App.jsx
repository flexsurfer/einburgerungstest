import {
  appIds,
  useSubscription,
} from "@ebtest/shared/uklad";
import { Header } from "./components/Header.jsx";
import { QuestionView } from "./components/QuestionView.jsx";
import { Vocabulary } from "./components/Vocabulary.jsx";
import { Statistics } from "./components/Statistics.jsx";
import "./styles/App.css";

function App() {
  const vocabularyRender = useSubscription(
    [appIds.subscriptions.vocabularyRendered],
    "App",
  );
  const questionsLoaded = useSubscription(
    [appIds.subscriptions.questionsLoaded],
    "App",
  );

  if (!questionsLoaded) return null;

  return (
    <div className="app-container">
      <Header />
      <QuestionView />
      <Statistics />
      {vocabularyRender && <Vocabulary />}
    </div>
  );
}

export default App;
