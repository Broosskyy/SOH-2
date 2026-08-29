import type { ShipVisualDefinition } from "./shipVisuals";

export const ANCHOR_PROFILE_SECTORS = [0, 45, 90, 135, 180, 225, 270, 315] as const;

export type AnchorProfileSector = {
  headingDeg: number;
  /** Pull screen-bottom upward (subtract from screen Y) after footprint projection. */
  bottomLiftCss: number;
  forwardScale: number;
  lateralScale: number;
};

/**
 * Kraken player visual footprint calibration per 45° sector.
 * Tuned for scale ~65 oblique camera — replaces GLB/vertex sampling.
 */
export const PLAYER_STATUS_ANCHOR_PROFILE: AnchorProfileSector[] = [
  { headingDeg: 0, bottomLiftCss: 0, forwardScale: 1, lateralScale: 1 },
  { headingDeg: 45, bottomLiftCss: 3, forwardScale: 0.98, lateralScale: 1.02 },
  { headingDeg: 90, bottomLiftCss: 14, forwardScale: 0.92, lateralScale: 1.08 },
  { headingDeg: 135, bottomLiftCss: 5, forwardScale: 0.96, lateralScale: 1.04 },
  { headingDeg: 180, bottomLiftCss: 1, forwardScale: 1, lateralScale: 1 },
  { headingDeg: 225, bottomLiftCss: 5, forwardScale: 0.96, lateralScale: 1.04 },
  { headingDeg: 270, bottomLiftCss: 18, forwardScale: 0.9, lateralScale: 1.1 },
  { headingDeg: 315, bottomLiftCss: 3, forwardScale: 0.98, lateralScale: 1.02 },
];

export function normalizeHeadingDeg(headingRad: number) {
  let deg = (headingRad * 180) / Math.PI;
  deg %= 360;
  if (deg < 0) deg += 360;
  return deg;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export type InterpolatedAnchorProfile = AnchorProfileSector & {
  sectorStart: number;
  sectorEnd: number;
  interpolationT: number;
};

export function interpolateAnchorProfile(headingRad: number): InterpolatedAnchorProfile {
  const deg = normalizeHeadingDeg(headingRad);
  const sectors = PLAYER_STATUS_ANCHOR_PROFILE;
  const startIdx = Math.floor(deg / 45) % sectors.length;
  const endIdx = (startIdx + 1) % sectors.length;
  const start = sectors[startIdx];
  const end = sectors[endIdx];
  const span = end.headingDeg > start.headingDeg ? end.headingDeg - start.headingDeg : 360 - start.headingDeg + end.headingDeg;
  const t = span <= 0 ? 0 : ((deg - start.headingDeg + 360) % 360) / span;

  return {
    headingDeg: deg,
    bottomLiftCss: lerp(start.bottomLiftCss, end.bottomLiftCss, t),
    forwardScale: lerp(start.forwardScale, end.forwardScale, t),
    lateralScale: lerp(start.lateralScale, end.lateralScale, t),
    sectorStart: start.headingDeg,
    sectorEnd: end.headingDeg,
    interpolationT: t,
  };
}

export function resolveAnchorGapCss(zoom: number) {
  if (zoom < 0.75) return 6;
  if (zoom > 1.1) return 9;
  return 7;
}

export function buildDeterministicFootprintLocal(
  definition: ShipVisualDefinition,
  profile: InterpolatedAnchorProfile,
) {
  const halfForward = definition.scale * 0.4 * profile.forwardScale;
  const halfLateral = definition.scale * 0.2 * profile.lateralScale;
  const keelY = definition.waterlineOffset * 0.12;
  return [
    { x: halfForward, y: keelY, z: halfLateral },
    { x: halfForward, y: keelY, z: -halfLateral },
    { x: -halfForward * 0.88, y: keelY, z: halfLateral * 0.92 },
    { x: -halfForward * 0.88, y: keelY, z: -halfLateral * 0.92 },
    { x: halfForward * 0.5, y: keelY * 0.5, z: 0 },
    { x: -halfForward * 0.5, y: keelY * 0.5, z: 0 },
    { x: 0, y: 0, z: 0 },
  ];
}
