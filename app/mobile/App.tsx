import App from '@ebtest/mobile-app';
import { bootstrapMobileApp } from '@ebtest/mobile-app/bootstrap';
import { barePlatform } from './src/platform';

const mobileApp = bootstrapMobileApp({ platform: barePlatform });

export default function BareMobileApp() {
  return <App app={mobileApp} />;
}
