import { StrictMode, Fragment } from 'react'
import ReactDOM from 'react-dom/client'

import './styles/index.css'

import 'shared/db'
import 'shared/events'
import 'shared/subs'

import './events'
import './effects'

import App from './App'
import { enableTracing, enableTracePrint, dispatch, HotReloadWrapper, setDebugEnabled } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids.js'

if (import.meta.env.MODE === 'development') {
  //setDebugEnabled(true)
  //enableTracing()
  //enableTracePrint()
}

dispatch([EVENT_IDS.INITIALIZE_APP])

const useStrictMode = false
const Wrapper = useStrictMode ? StrictMode : Fragment;

ReactDOM.createRoot(document.getElementById('root')).render(
  <Wrapper>
    {/* HotReloadWrapper is used to force re-mount the app when subs are hot reloaded */}
    <HotReloadWrapper>
      <App />
    </HotReloadWrapper>
  </Wrapper>
)
