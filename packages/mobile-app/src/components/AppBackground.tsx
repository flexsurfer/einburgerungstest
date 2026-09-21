import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { appIds, useSubscription } from "@ebtest/shared/uklad";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";
import images from "../assets/images";
import { useColors, type Colors } from "../theme";

import { backgroundImageWidth, HOME_IMAGE_ASPECT_RATIO } from "../layout";

function PageGradient({ colors }: { colors: Colors }) {
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="appPageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={colors.pageGradientStart} />
          <Stop offset="48%" stopColor={colors.pageGradientMiddle} />
          <Stop offset="100%" stopColor={colors.pageGradientEnd} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#appPageGradient)" />
    </Svg>
  );
}

function ImageBottomFade({ colors }: { colors: Colors }) {
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient
          id="appImageBottomFade"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <Stop offset="0%" stopColor={colors.pageColor} stopOpacity={0} />
          <Stop offset="100%" stopColor={colors.pageColor} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#appImageBottomFade)" />
    </Svg>
  );
}

function ImageSideFade({ colors }: { colors: Colors }) {
  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height="100%"
      style={StyleSheet.absoluteFill}
    >
      <Defs>
        <LinearGradient id="appImageSideFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop
            offset="0%"
            stopColor={colors.pageGradientStart}
            stopOpacity={1}
          />
          <Stop
            offset="18%"
            stopColor={colors.pageGradientStart}
            stopOpacity={0}
          />
          <Stop
            offset="82%"
            stopColor={colors.pageGradientStart}
            stopOpacity={0}
          />
          <Stop
            offset="100%"
            stopColor={colors.pageGradientStart}
            stopOpacity={1}
          />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#appImageSideFade)" />
    </Svg>
  );
}

const NIGHT_STARS = [
  { x: 7, y: 10, radius: 0.35, opacity: 0.76 },
  { x: 13, y: 19, radius: 0.22, opacity: 0.62 },
  { x: 19, y: 8, radius: 0.24, opacity: 0.78 },
  { x: 25, y: 15, radius: 0.42, opacity: 0.86 },
  { x: 31, y: 6, radius: 0.2, opacity: 0.62 },
  { x: 36, y: 21, radius: 0.28, opacity: 0.72 },
  { x: 42, y: 11, radius: 0.24, opacity: 0.7 },
  { x: 48, y: 18, radius: 0.36, opacity: 0.78 },
  { x: 54, y: 7, radius: 0.2, opacity: 0.64 },
  { x: 60, y: 15, radius: 0.3, opacity: 0.76 },
  { x: 67, y: 5, radius: 0.22, opacity: 0.7 },
  { x: 72, y: 23, radius: 0.38, opacity: 0.72 },
  { x: 84, y: 8, radius: 0.24, opacity: 0.7 },
  { x: 91, y: 18, radius: 0.32, opacity: 0.72 },
  { x: 96, y: 11, radius: 0.2, opacity: 0.62 },
  { x: 10, y: 30, radius: 0.2, opacity: 0.54 },
  { x: 22, y: 27, radius: 0.26, opacity: 0.62 },
  { x: 30, y: 34, radius: 0.2, opacity: 0.52 },
  { x: 45, y: 29, radius: 0.22, opacity: 0.58 },
  { x: 58, y: 34, radius: 0.2, opacity: 0.56 },
  { x: 69, y: 31, radius: 0.24, opacity: 0.62 },
  { x: 88, y: 29, radius: 0.2, opacity: 0.58 },
] as const;

function NightSky() {
  return (
    <Svg
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      viewBox="0 0 100 50"
    >
      <Defs>
        <LinearGradient id="appNightTint" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#06152F" stopOpacity={0.9} />
          <Stop offset="58%" stopColor="#0A2541" stopOpacity={0.74} />
          <Stop offset="100%" stopColor="#0C2B38" stopOpacity={0.48} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#appNightTint)" />
      <G fill="#FFF4C2">
        {NIGHT_STARS.map((star, index) => (
          <Circle
            key={`${star.x}-${star.y}-${index}`}
            cx={star.x}
            cy={star.y}
            r={star.radius}
            opacity={star.opacity}
          />
        ))}
      </G>
    </Svg>
  );
}

export function AppBackground() {
  const colors = useColors();
  const theme = useSubscription(
    [appIds.subscriptions.preferencesTheme],
    "AppBackground",
  );
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const contentWidth = Math.max(0, width - insets.left - insets.right);
  const imageWidth = backgroundImageWidth(contentWidth, height);

  return (
    <View pointerEvents="none" style={styles.root}>
      <PageGradient colors={colors} />
      <View
        style={[
          styles.imageLayer,
          {
            left: insets.left + (contentWidth - imageWidth) / 2,
            width: imageWidth,
          },
        ]}
      >
        <Image resizeMode="contain" source={images.home} style={styles.image} />
        {theme === "dark" ? <NightSky /> : null}
        {imageWidth < contentWidth ? <ImageSideFade colors={colors} /> : null}
        <View style={styles.imageFade}>
          <ImageBottomFade colors={colors} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },
  imageLayer: {
    position: "absolute",
    top: 0,
    aspectRatio: HOME_IMAGE_ASPECT_RATIO,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFade: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    height: "40%",
  },
});
