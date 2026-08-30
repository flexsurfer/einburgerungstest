import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  UkladProvider,
  appIds,
  useSubscription,
} from "@ebtest/shared/uklad";
import type { MobileApp, MobileHydrationResult } from "./bootstrap";
import { useColors, type Colors } from "./theme";
import { QuestionView } from "./components/QuestionView";
import { Header } from "./components/Header";
import { Statistics } from "./components/Statistics";

export interface AppProps {
  app: MobileApp;
}

export function AppContent() {
  const questionsLoaded = useSubscription(
    [appIds.subscriptions.questionsLoaded],
    "App",
  );
  const themeColors = useColors();
  const insets = useSafeAreaInsets();

  if (!questionsLoaded) return null;

  return (
    <View style={styles(themeColors, insets).appContainer}>
      <Header style={{ zIndex: 1 }} />
      <View style={{ flex: 1, zIndex: 0 }}>
        <QuestionView />
      </View>
      <Statistics />
    </View>
  );
}

type HydrationViewState =
  | { readonly status: "loading" }
  | { readonly status: "ready" }
  | { readonly status: "failed"; readonly error: unknown };

function resultToState(result: MobileHydrationResult): HydrationViewState {
  if (result.ok === false) {
    return { status: "failed", error: result.error };
  }
  return { status: "ready" };
}

function MobileHydrationGate({ app }: { app: MobileApp }) {
  const [state, setState] = useState<HydrationViewState>({
    status: "loading",
  });

  useEffect(() => {
    let mounted = true;
    const handleResult = (result: MobileHydrationResult) => {
      if (mounted) setState(resultToState(result));
    };
    const handleUnexpectedFailure = (error: unknown) => {
      handleResult({ ok: false, error });
    };

    void app.hydration.then(handleResult, handleUnexpectedFailure);
    return () => {
      mounted = false;
    };
  }, [app]);

  const retry = () => {
    setState({ status: "loading" });
    void app.retryHydration().then(
      (result) => setState(resultToState(result)),
      (error) => setState({ status: "failed", error }),
    );
  };

  if (state.status === "loading") {
    return (
      <View style={hydrationStyles.container} accessibilityLiveRegion="polite">
        <Text>Loading saved data…</Text>
      </View>
    );
  }

  if (state.status === "failed") {
    return (
      <View
        style={hydrationStyles.container}
        accessibilityLiveRegion="assertive"
      >
        <Text style={hydrationStyles.message}>
          We couldn’t restore your saved data. It has not been deleted. Please
          try again.
        </Text>
        <Button title="Retry" onPress={retry} />
      </View>
    );
  }

  return <AppContent />;
}

function App({ app }: AppProps) {
  return (
    <UkladProvider runtime={app.runtime}>
      <SafeAreaProvider>
        <MobileHydrationGate app={app} />
      </SafeAreaProvider>
    </UkladProvider>
  );
}

const hydrationStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  message: {
    marginBottom: 16,
    textAlign: "center",
  },
});

const styles = (
  colors: Colors,
  insets: { top: number; bottom: number; left: number; right: number },
) =>
  StyleSheet.create({
    appContainer: {
      flex: 1,
      backgroundColor: colors.bgColor,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
  });

export default App;
