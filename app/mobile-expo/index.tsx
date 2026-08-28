import { registerRootComponent } from 'expo'
import App from '@ebtest/mobile-app'
import { bootstrapMobileApp } from '@ebtest/mobile-app/bootstrap'
import { expoPlatform } from './src/platform'

bootstrapMobileApp()

function ExpoMobileApp() {
  return <App platform={expoPlatform} />
}

registerRootComponent(ExpoMobileApp)
