import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { enableTracing } from '@flexsurfer/reflex'
import { enableDevtools } from '@flexsurfer/reflex-devtools'
import { bootstrapMobileApp } from '@ebtest/mobile-app/bootstrap'

if (process.env.NODE_ENV === 'development') {
    enableTracing();
    enableDevtools();
}

bootstrapMobileApp()

AppRegistry.registerComponent(appName, () => App);
