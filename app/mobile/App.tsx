import App from '@ebtest/mobile-app'
import { barePlatform } from './src/platform'

export default function BareMobileApp() {
  return <App platform={barePlatform} />
}
