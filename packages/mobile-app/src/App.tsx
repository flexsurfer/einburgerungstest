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
import {
  UkladProvider,
  appIds,
  useSubscription,
  type NavigationScreen,
} from "@ebtest/shared/uklad";
import type { MobileApp, MobileHydrationResult } from "./bootstrap";
import { useColors, type Colors } from "./theme";
import { QuestionView } from "./components/QuestionView";
import { Header } from "./components/Header";
import { HomeScreen } from "./components/HomeScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { AppBackground } from "./components/AppBackground";

export interface AppProps {
  app: MobileApp;
}

const SCREEN_POSITION: Record<NavigationScreen, number> = {
  settings: 0,
  home: 1,
  questions: 2,
};

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
  const selectedLand = useSubscription(
    [appIds.subscriptions.preferencesSelectedLand],
    "App",
  );
  const themeColors = useColors();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const screenProgress = useRef(
    new Animated.Value(SCREEN_POSITION[activeScreen]),
  ).current;

  useEffect(() => {
    screenProgress.stopAnimation();
    Animated.timing(screenProgress, {
      toValue: SCREEN_POSITION[activeScreen],
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeScreen, screenProgress]);

  const styleSheet = styles(themeColors, insets);
  if (!questionsLoaded) return null;

  if (selectedLand === null) {
    return (
      <View
        pointerEvents={interactive ? "auto" : "none"}
        style={styleSheet.appContainer}
      >
        <StatusBar animated />
        <AppBackground />
        <OnboardingScreen />
      </View>
    );
  }

  const translateY = screenProgress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -height, -height * 2],
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
          { height: height * 3, transform: [{ translateY }] },
        ]}
      >
        <View
          accessibilityElementsHidden={activeScreen !== "settings"}
          importantForAccessibility={
            activeScreen === "settings" ? "auto" : "no-hide-descendants"
          }
          pointerEvents={activeScreen === "settings" ? "auto" : "none"}
          style={[styleSheet.screen, styleSheet.settingsScreen, { height }]}
        >
          <SettingsScreen />
        </View>
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
          accessibilityElementsHidden={activeScreen !== "questions"}
          importantForAccessibility={
            activeScreen === "questions" ? "auto" : "no-hide-descendants"
          }
          pointerEvents={activeScreen === "questions" ? "auto" : "none"}
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
    settingsScreen: {
      paddingTop: 0,
    },
    practiceScreen: {
      paddingTop: insets.top,
    },
  });

export default App;
