import { registerRootComponent } from "expo";
import App from "@ebtest/mobile-app";
import { bootstrapMobileApp } from "@ebtest/mobile-app/bootstrap";
import { expoPlatform } from "./src/platform";
import { attachExpoPersistence } from "./src/persistence";

const mobileApp = bootstrapMobileApp({
  platform: expoPlatform,
  persistenceFactory: attachExpoPersistence,
});

function ExpoMobileApp() {
  return <App app={mobileApp} />;
}

registerRootComponent(ExpoMobileApp);
