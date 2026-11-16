import { createContext, useContext, type ReactNode } from "react";
import type { ImageSourcePropType } from "react-native";

export type MobileImages = Readonly<Record<string, ImageSourcePropType>> & {
  readonly home: ImageSourcePropType;
};

const MobileImagesContext = createContext<MobileImages | null>(null);

/** Native image handles belong to the host, outside the Uklad state graph. */
export function MobileImagesProvider({
  images,
  children,
}: {
  images: MobileImages;
  children: ReactNode;
}) {
  return (
    <MobileImagesContext.Provider value={images}>
      {children}
    </MobileImagesContext.Provider>
  );
}

export function useMobileImages(): MobileImages {
  const images = useContext(MobileImagesContext);
  if (!images) {
    throw new Error("Mobile images must be supplied by the app host.");
  }
  return images;
}
