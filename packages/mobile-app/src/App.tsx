import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Button,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { UkladProvider, appIds, useSubscription } from "@ebtest/shared/uklad";
import type { MobileApp, MobileHydrationResult } from "./bootstrap";
import { useColors, type Colors } from "./theme";
import { QuestionView } from "./components/QuestionView";
import { Header } from "./components/Header";
import { HomeScreen } from "./components/HomeScreen";
import { AppBackground } from "./components/AppBackground";

export interface AppProps {
  app: MobileApp;
}

export function AppContent({
  interactive = true,
}: { interactive?: boolean } = {}) {
  const questionsLoaded = useSubscription(
    [appIds.subscriptions.questionsLoaded],
    "App",
  );
  const activeScreen = useSubscription(
    [appIds.subscriptions.navigationActiveScreen],
    "App",
  );
  const themeColors = useColors();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const screenProgress = useRef(
    new Animated.Value(activeScreen === "home" ? 0 : 1),
  ).current;

  useEffect(() => {
    screenProgress.stopAnimation();
    Animated.timing(screenProgress, {
      toValue: activeScreen === "home" ? 0 : 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeScreen, screenProgress]);

  if (!questionsLoaded) return null;

  const styleSheet = styles(themeColors, insets);
  const translateY = screenProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height],
  });

  return (
    <View
      pointerEvents={interactive ? "auto" : "none"}
      style={styleSheet.appContainer}
    >
      <StatusBar animated />
      <AppBackground />
      <Animated.View
        style={[
          styleSheet.screenRail,
          { height: height * 2, transform: [{ translateY }] },
        ]}
      >
        <View
          accessibilityElementsHidden={activeScreen !== "home"}
          importantForAccessibility={
            activeScreen === "home" ? "auto" : "no-hide-descendants"
          }
          pointerEvents={activeScreen === "home" ? "auto" : "none"}
          style={[styleSheet.screen, styleSheet.homeScreen, { height }]}
        >
          <HomeScreen />
        </View>
        <View
          accessibilityElementsHidden={activeScreen === "home"}
          importantForAccessibility={
            activeScreen === "home" ? "no-hide-descendants" : "auto"
          }
          pointerEvents={activeScreen === "home" ? "none" : "auto"}
          style={[styleSheet.screen, styleSheet.practiceScreen, { height }]}
        >
          <Header style={{ zIndex: 1 }} />
          <View style={{ flex: 1, zIndex: 0 }}>
            <QuestionView />
          </View>
        </View>
      </Animated.View>
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

  return <AppContent interactive={state.status === "ready"} />;
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
      backgroundColor: colors.pageColor,
      overflow: "hidden",
    },
    screenRail: {
      width: "100%",
    },
    screen: {
      width: "100%",
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
      backgroundColor: "transparent",
    },
    homeScreen: {
      paddingTop: 0,
    },
    practiceScreen: {
      paddingTop: insets.top,
    },
  });

export default App;
