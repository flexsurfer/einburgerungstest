import { StrictMode, Fragment } from "react";
import ReactDOM from "react-dom/client";

import "./styles/index.css";
import { UkladProvider } from "@ebtest/shared/uklad";
import { createWebApp } from "./bootstrap.js";
import { HydrationGate } from "./HydrationGate.jsx";

const webApp = createWebApp({
  onHydrationError: (error) => {
    console.error("Failed to hydrate web persistence:", error);
  },
});

const useStrictMode = false;
const Wrapper = useStrictMode ? StrictMode : Fragment;

ReactDOM.createRoot(document.getElementById("root")).render(
  <Wrapper>
    <UkladProvider runtime={webApp.runtime}>
      <HydrationGate app={webApp} />
    </UkladProvider>
  </Wrapper>,
);
