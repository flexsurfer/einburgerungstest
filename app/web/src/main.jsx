import { StrictMode, Fragment } from 'react'
import ReactDOM from 'react-dom/client'

import './styles/index.css'

import 'shared/db'
import 'shared/events'
import 'shared/subs'

import './events'
import './effects'

import App from './App'
import { enableTracing, enableTracePrint, dispatch, setDebugEnabled } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids.js'

if (import.meta.env.MODE === 'development') {
  //setDebugEnabled(true)
  //enableTracing()
  //enableTracePrint()
}

dispatch([EVENT_IDS.INITIALIZE_APP])

const useStrictMode = true
const Wrapper = useStrictMode ? StrictMode : Fragment;

ReactDOM.createRoot(document.getElementById('root')).render(
  <Wrapper>
    <App />
  </Wrapper>
)
