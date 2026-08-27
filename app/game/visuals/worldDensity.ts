import type { QualityProfile } from "../quality/qualityProfiles";

export type WorldDensityCounts = {
  islandPropsPerIsland: number;
  openOceanProps: number;
  islandRockCount: number;
  shorelinePropsPerIsland: number;
};

const DENSITY_TIERS: Record<
  QualityProfile["id"],
  { island: number; open: number; rocks: number; shoreline: number }
> = {
  LOW: { island: 4, open: 9, rocks: 8, shoreline: 2 },
  MEDIUM: { island: 6, open: 14, rocks: 10, shoreline: 3 },
  HIGH: { island: 7, open: 18, rocks: 12, shoreline: 4 },
  ULTRA: { island: 8, open: 22, rocks: 14, shoreline: 5 },
};

/** Map-area reference: Azurwacht (aster) baseline. */
const REFERENCE_MAP_AREA = 3000 * 1900;

export function resolveWorldDensityCounts(
  quality: QualityProfile,
  mapWidth: number,
  mapHeight: number,
): WorldDensityCounts {
  const tier = DENSITY_TIERS[quality.id] ?? DENSITY_TIERS.HIGH;
  const density = quality.worldPropDensity;
  const areaFactor = Math.min(
    1.35,
    Math.max(0.85, Math.sqrt((mapWidth * mapHeight) / REFERENCE_MAP_AREA)),
  );

  return {
    islandPropsPerIsland: Math.max(3, Math.round(tier.island * density)),
    openOceanProps: Math.max(6, Math.round(tier.open * areaFactor * density)),
    islandRockCount: Math.max(6, Math.round(tier.rocks * Math.max(0.75, density))),
    shorelinePropsPerIsland: Math.max(
      1,
      Math.round(tier.shoreline * Math.max(0.8, density)),
    ),
  };
}
