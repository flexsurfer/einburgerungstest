import { StrictMode, Fragment } from 'react'
import ReactDOM from 'react-dom/client'

import './styles/index.css'

import '@ebtest/shared/db'
import '@ebtest/shared/events'
import '@ebtest/shared/subs'

import './events'
import './effects'

import App from './App'
import { enableTracing, enableTracePrint, dispatch } from '@flexsurfer/reflex'
import { EVENT_IDS } from '@ebtest/shared/event-ids.js'
import { enableDevtools } from '@flexsurfer/reflex-devtools'

if (import.meta.env.MODE === 'development') {
  enableTracing()
  //enableTracePrint()
  enableDevtools();
}

dispatch([EVENT_IDS.INITIALIZE_APP])

const useStrictMode = false
const Wrapper = useStrictMode ? StrictMode : Fragment;

ReactDOM.createRoot(document.getElementById('root')).render(
  <Wrapper>
    <App />
  </Wrapper>
)
