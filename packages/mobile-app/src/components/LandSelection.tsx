import { memo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Circle,
  G,
  Line,
  Path as SvgPath,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { FEDERAL_LANDS, type FederalLand } from "@ebtest/shared/uklad";
import { useColors, type Colors } from "../theme";
import { useI18n } from "../i18n";
import { GERMANY_MAP_PATHS } from "./GermanyMap.paths";
import { CheckIcon } from "./Icons";

const LAND_ABBREVIATIONS: Record<FederalLand, string> = {
  "Baden-Württemberg": "BW",
  Bayern: "BY",
  Berlin: "BE",
  Brandenburg: "BB",
  Bremen: "HB",
  Hamburg: "HH",
  Hessen: "HE",
  "Mecklenburg-Vorpommern": "MV",
  Niedersachsen: "NI",
  "Nordrhein-Westfalen": "NW",
  "Rheinland-Pfalz": "RP",
  Saarland: "SL",
  Sachsen: "SN",
  "Sachsen-Anhalt": "ST",
  "Schleswig-Holstein": "SH",
  Thüringen: "TH",
};

export interface LandSelectionProps {
  readonly selectedLand: FederalLand | null;
  readonly onSelect: (land: FederalLand) => void;
}

type SelectionMode = "list" | "map";

const MAP_ASPECT_RATIO = 800.504 / 591.504;
const SMALL_LAND_BUTTON_HEIGHT = 58;

const SMALL_LAND_CALLOUTS: readonly {
  land: FederalLand;
  x: number;
  y: number;
  width: number;
  targetX: number;
  targetY: number;
}[] = [
  {
    land: "Bremen",
    x: 8,
    y: 76,
    width: 154,
    targetX: 179,
    targetY: 177,
  },
  {
    land: "Hamburg",
    x: 320,
    y: 6,
    width: 154,
    targetX: 278,
    targetY: 154,
  },
  {
    land: "Berlin",
    x: 430,
    y: 190,
    width: 144,
    targetX: 483,
    targetY: 263,
  },
  {
    land: "Saarland",
    x: 2,
    y: 620,
    width: 150,
    targetX: 60,
    targetY: 579,
  },
];

function ModeIcon({
  mode,
  color,
}: {
  readonly mode: SelectionMode;
  readonly color: string;
}) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      {mode === "list" ? (
        <>
          <SvgPath
            d="M9 6h11M9 12h11M9 18h11"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={1.9}
          />
          <SvgPath
            d="M4.5 6h.01M4.5 12h.01M4.5 18h.01"
            stroke={color}
            strokeLinecap="round"
            strokeWidth={3}
          />
        </>
      ) : (
        <SvgPath
          d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Zm5-2v14m6-12v14"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
        />
      )}
    </Svg>
  );
}

export const LandSelection = memo(
  ({ selectedLand, onSelect }: LandSelectionProps) => {
    const colors = useColors();
    const { t } = useI18n("LandSelection");
    const { width } = useWindowDimensions();
    const styleSheet = styles(colors);
    const [mode, setMode] = useState<SelectionMode>("map");
    const mapWidth = Math.min(width, 680);
    const mapHeight = Math.round(mapWidth * MAP_ASPECT_RATIO);
    const selectedPath = GERMANY_MAP_PATHS.find(
      ({ land }) => land === selectedLand,
    );

    return (
      <View>
        <View
          accessibilityLabel={t("federalStateSelectionView")}
          style={styleSheet.modeSwitch}
        >
          {(["map", "list"] as const).map((selectionMode) => {
            const active = mode === selectionMode;
            return (
              <TouchableOpacity
                accessibilityLabel={
                  selectionMode === "map" ? t("mapView") : t("listView")
                }
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                activeOpacity={0.72}
                key={selectionMode}
                onPress={() => setMode(selectionMode)}
                style={[
                  styleSheet.modeOption,
                  active ? styleSheet.modeOptionActive : null,
                ]}
              >
                <ModeIcon
                  color={active ? colors.primaryColor : colors.textMutedColor}
                  mode={selectionMode}
                />
                <Text
                  style={[
                    styleSheet.modeLabel,
                    active ? styleSheet.modeLabelActive : null,
                  ]}
                >
                  {selectionMode === "list" ? t("list") : t("map")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {mode === "map" ? (
          <>
            <View style={styleSheet.mapSelectionSummary}>
              <View
                style={[
                  styleSheet.mapSelectionDot,
                  selectedLand === null
                    ? styleSheet.mapSelectionDotEmpty
                    : null,
                ]}
              />
              <View style={styleSheet.mapSelectionCopy}>
                <Text style={styleSheet.mapSelectionEyebrow}>
                  {selectedLand === null ? t("selectALand") : t("selectedLand")}
                </Text>
                <Text style={styleSheet.mapSelectionName}>
                  {selectedLand === null ? t("tapStateOnMap") : selectedLand}
                </Text>
              </View>
            </View>

            <Svg
              accessibilityLabel={t("germanyMap")}
              height={mapHeight}
              preserveAspectRatio="xMidYMid meet"
              style={styleSheet.map}
              viewBox="0 0 591.504 800.504"
              width={mapWidth}
            >
              {GERMANY_MAP_PATHS.filter(
                ({ land }) => land !== selectedLand,
              ).map(({ land, d }) => (
                <SvgPath
                  d={d}
                  fill={colors.surfaceSoftColor}
                  key={land}
                  onPress={() => onSelect(land)}
                  stroke={colors.textMutedColor}
                  strokeOpacity={0.62}
                  strokeWidth={1.15}
                />
              ))}
              {selectedPath === undefined ? null : (
                <SvgPath
                  d={selectedPath.d}
                  fill={colors.primaryColor}
                  onPress={() => onSelect(selectedPath.land)}
                  stroke={colors.primaryDarkColor}
                  strokeWidth={2.8}
                />
              )}

              {SMALL_LAND_CALLOUTS.map(
                ({ land, x, y, width: buttonWidth, targetX, targetY }) => {
                  const selected = selectedLand === land;
                  const buttonEdgeX = Math.max(
                    x,
                    Math.min(targetX, x + buttonWidth),
                  );
                  const buttonEdgeY = Math.max(
                    y,
                    Math.min(targetY, y + SMALL_LAND_BUTTON_HEIGHT),
                  );

                  return (
                    <G
                      accessibilityLabel={t("selectState", {
                        state: land,
                      })}
                      key={land}
                      onPress={() => onSelect(land)}
                    >
                      <Line
                        stroke={
                          selected
                            ? colors.primaryDarkColor
                            : colors.textMutedColor
                        }
                        strokeWidth={selected ? 2.2 : 1.5}
                        x1={targetX}
                        x2={buttonEdgeX}
                        y1={targetY}
                        y2={buttonEdgeY}
                      />
                      <Circle
                        cx={targetX}
                        cy={targetY}
                        fill={
                          selected ? colors.primaryDarkColor : colors.textColor
                        }
                        r={selected ? 4.5 : 3.5}
                      />
                      <Rect
                        fill={
                          selected ? colors.primaryColor : colors.surfaceColor
                        }
                        height={SMALL_LAND_BUTTON_HEIGHT}
                        rx={SMALL_LAND_BUTTON_HEIGHT / 2}
                        stroke={
                          selected
                            ? colors.primaryDarkColor
                            : colors.borderColor
                        }
                        strokeWidth={selected ? 2 : 1.4}
                        width={buttonWidth}
                        x={x}
                        y={y}
                      />
                      <SvgText
                        fill={
                          selected ? colors.primaryTextColor : colors.textColor
                        }
                        fontSize={19}
                        fontWeight="700"
                        textAnchor="middle"
                        x={x + buttonWidth / 2}
                        y={y + 36}
                      >
                        {land}
                      </SvgText>
                    </G>
                  );
                },
              )}
            </Svg>
          </>
        ) : (
          <View accessibilityRole="radiogroup" style={styleSheet.grid}>
            {FEDERAL_LANDS.map((land) => {
              const selected = selectedLand === land;
              return (
                <TouchableOpacity
                  accessibilityLabel={land}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  activeOpacity={0.74}
                  key={land}
                  onPress={() => onSelect(land)}
                  style={[
                    styleSheet.option,
                    selected ? styleSheet.optionSelected : null,
                  ]}
                >
                  <View
                    style={[
                      styleSheet.badge,
                      selected ? styleSheet.badgeSelected : null,
                    ]}
                  >
                    <Text
                      style={[
                        styleSheet.badgeText,
                        selected ? styleSheet.badgeTextSelected : null,
                      ]}
                    >
                      {LAND_ABBREVIATIONS[land]}
                    </Text>
                  </View>
                  <Text numberOfLines={2} style={styleSheet.label}>
                    {land}
                  </Text>
                  <View style={styleSheet.checkSlot}>
                    {selected ? (
                      <View style={styleSheet.check}>
                        <CheckIcon color={colors.primaryTextColor} size={12} />
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  },
);

const styles = (colors: Colors) =>
  StyleSheet.create({
    modeSwitch: {
      width: "100%",
      flexDirection: "row",
      padding: 2,
      marginBottom: 5,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.surfaceSoftColor,
    },
    modeOption: {
      minHeight: 32,
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingHorizontal: 6,
      borderRadius: 9,
    },
    modeOptionActive: {
      backgroundColor: colors.surfaceColor,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.14,
      shadowRadius: 3,
      elevation: 1,
    },
    modeLabel: {
      color: colors.textMutedColor,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "700",
    },
    modeLabelActive: {
      color: colors.primaryColor,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 10,
    },
    option: {
      width: "48%",
      minHeight: 70,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.surfaceColor,
    },
    optionSelected: {
      borderWidth: 2,
      borderColor: colors.primaryColor,
      backgroundColor: colors.primaryPale,
      paddingHorizontal: 9,
      paddingVertical: 9,
    },
    badge: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 11,
      backgroundColor: colors.surfaceSoftColor,
      marginRight: 9,
    },
    badgeSelected: {
      backgroundColor: colors.primaryColor,
    },
    badgeText: {
      color: colors.textMutedColor,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    badgeTextSelected: {
      color: colors.primaryTextColor,
    },
    label: {
      flex: 1,
      color: colors.textColor,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "700",
    },
    checkSlot: {
      width: 16,
      height: 16,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 3,
    },
    check: {
      width: 16,
      height: 16,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: colors.primaryColor,
    },
    map: {
      alignSelf: "center",
    },
    mapSelectionSummary: {
      width: "100%",
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      paddingHorizontal: 11,
      paddingVertical: 6,
      marginBottom: 4,
      borderRadius: 12,
      backgroundColor: colors.surfaceSoftColor,
    },
    mapSelectionDot: {
      width: 9,
      height: 9,
      borderRadius: 4.5,
      marginRight: 8,
      backgroundColor: colors.primaryColor,
    },
    mapSelectionDotEmpty: {
      borderWidth: 1.5,
      borderColor: colors.textMutedColor,
      backgroundColor: "transparent",
    },
    mapSelectionCopy: {
      flex: 1,
      minWidth: 0,
    },
    mapSelectionEyebrow: {
      color: colors.primaryColor,
      fontSize: 8,
      lineHeight: 10,
      fontWeight: "900",
      letterSpacing: 0.7,
    },
    mapSelectionName: {
      color: colors.textColor,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "700",
      marginTop: 0,
    },
  });
