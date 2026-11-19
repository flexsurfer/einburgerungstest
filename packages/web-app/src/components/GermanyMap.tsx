import {
  GERMANY_MAP_PATHS,
  GERMANY_MAP_VIEW_BOX,
  SMALL_LAND_BUTTON_HEIGHT,
  SMALL_LAND_CALLOUTS,
} from "@ebtest/shared/germany-map";
import type { FederalLand } from "@ebtest/shared/uklad";
import { useI18n } from "@ebtest/shared/i18n";

interface GermanyMapProps {
  value: FederalLand | null;
  onChange: (land: FederalLand) => void;
}

export default function GermanyMap({ value, onChange }: GermanyMapProps) {
  const { t } = useI18n("GermanyMap");
  return (
    <svg
      className="germany-map"
      viewBox={GERMANY_MAP_VIEW_BOX}
      role="img"
      aria-label={t("germanyMap")}
      focusable="false"
    >
      {GERMANY_MAP_PATHS.map(({ land, d }) => (
        <path
          key={land}
          d={d}
          className={land === value ? "selected" : undefined}
          onClick={() => onChange(land)}
        >
          <title>{land}</title>
        </path>
      ))}
      {SMALL_LAND_CALLOUTS.map(({ land, x, y, width, targetX, targetY }) => (
        <g
          key={land}
          className={land === value ? "selected" : undefined}
          onClick={() => onChange(land)}
        >
          <line
            x1={targetX}
            y1={targetY}
            x2={x + width / 2}
            y2={y + SMALL_LAND_BUTTON_HEIGHT / 2}
          />
          <circle cx={targetX} cy={targetY} r={5} />
          <rect
            x={x}
            y={y}
            width={width}
            height={SMALL_LAND_BUTTON_HEIGHT}
            rx={SMALL_LAND_BUTTON_HEIGHT / 2}
          />
          <text
            x={x + width / 2}
            y={y + SMALL_LAND_BUTTON_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="central"
            lang="de"
          >
            {land}
          </text>
        </g>
      ))}
    </svg>
  );
}
