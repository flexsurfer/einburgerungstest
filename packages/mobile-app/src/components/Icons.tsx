import Svg, { Circle, Path } from "react-native-svg";

type IconProps = { color: string; size?: number };

export const LeftArrow = ({ color }: { color: string }) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    style={{ marginRight: 5 }}
  >
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const RightArrow = ({ color }: { color: string }) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    style={{ marginLeft: 5 }}
  >
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const DownArrow = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9L12 15L18 9"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronRight = ({ color, size = 18 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m9 18 6-6-6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HomeIcon = ({ color, size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 21v-8h6v8"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MenuIcon = ({ color, size = 25 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 6h16M4 12h16M4 18h16"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

export const PlayIcon = ({ color, size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="m8 5 11 7-11 7V5Z" fill={color} />
  </Svg>
);

export const CheckCircleIcon = ({ color, size = 23 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.9} />
    <Path
      d="m8 12 2.6 2.6L16.5 9"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const TargetIcon = ({ color, size = 23 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={1.8} />
    <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={1.8} />
    <Path
      d="M12 2v3M12 19v3M2 12h3M19 12h3"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const DocumentIcon = ({ color, size = 25 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M14 3v5h5M8 12h8M8 16h6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ScaleIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4v16M7 4h10M5 7h14M8 20h8"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="m5 7-3 6a3 3 0 0 0 6 0L5 7ZM19 7l-3 6a3 3 0 0 0 6 0l-3-6Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BuildingIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m3 9 9-5 9 5M4 9h16M5 9v10M9 9v10M15 9v10M19 9v10M3 20h18"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M12 4v-1" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const PeopleIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="3" stroke={color} strokeWidth={1.8} />
    <Circle cx="5.5" cy="10" r="2.2" stroke={color} strokeWidth={1.8} />
    <Circle cx="18.5" cy="10" r="2.2" stroke={color} strokeWidth={1.8} />
    <Path
      d="M6 21v-2.2a6 6 0 0 1 12 0V21M2.5 20v-1.2a3.2 3.2 0 0 1 5-2.6M21.5 20v-1.2a3.2 3.2 0 0 0-5-2.6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BookmarkIcon = ({ color, size = 25 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-3.5L6 22V4Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="m12 6 .8 1.7 1.9.3-1.4 1.4.3 1.9-1.6-.9-1.6.9.3-1.9-1.4-1.4 1.9-.3L12 6Z"
      fill={color}
    />
  </Svg>
);

export const LockIcon = ({ color, size = 23 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 10h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2ZM8 10V7a4 4 0 0 1 8 0v3"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BookOpenIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v16H5.5A2.5 2.5 0 0 0 3 21.5v-16ZM21 5.5A2.5 2.5 0 0 0 18.5 3H13v16h5.5a2.5 2.5 0 0 1 2.5 2.5v-16Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ExamIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 4h8M9 2h6a1 1 0 0 1 1 1v3H8V3a1 1 0 0 1 1-1Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M7.5 12l2 2 4-4M7.5 18h9"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HeartIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ReviewIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
    <Path
      d="M12 7v6M12 17h.01"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export const SunIcon = ({ color, size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={1.8} />
    <Path
      d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

export const MoonIcon = ({ color, size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
