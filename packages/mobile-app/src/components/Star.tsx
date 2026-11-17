import { Text } from "react-native";
import { useColors, type Colors } from "../theme";

export const Star = () => {
  const colors = useColors();
  return <Text style={styles(colors).star}>★</Text>;
};

const styles = (colors: Colors) => ({
  star: {
    fontSize: 20,
    color: colors.accentColor,
  },
});
