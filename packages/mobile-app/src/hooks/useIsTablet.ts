import { useWindowDimensions } from "react-native";

export const useIsTablet = (breakpoint = 600) => {
  const { width } = useWindowDimensions();
  return width >= breakpoint;
};
