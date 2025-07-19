import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { dispatch } from '@flexsurfer/reflex'
import { EVENT_IDS } from 'shared/event-ids'

import 'shared/db'
import 'shared/events'
import 'shared/subs'

import './src/events'
import './src/effects'

dispatch([EVENT_IDS.INITIALIZE_APP])

AppRegistry.registerComponent(appName, () => App);
