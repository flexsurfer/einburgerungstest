import { StrictMode, Fragment } from 'react'
import ReactDOM from 'react-dom/client'

import './styles/index.css'

import './db'
import './events'
import './effects'
import './subs'

import App from './App'
import { enableTracing, enableTracePrint, dispatch, HotReloadWrapper, setDebugEnabled } from '@flexsurfer/reflex'

if (import.meta.env.MODE === 'development') {
  setDebugEnabled(true)
  enableTracing()
  enableTracePrint()
}

dispatch(['initializeApp'])

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
