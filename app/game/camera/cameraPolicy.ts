import type { MapId } from "../../gameData";

/**
 * Binding presentation contract for every Abyssal Dominion client.
 *
 * The renderer is genuinely 3D, while navigation, targeting and combat remain
 * on the horizontal X/Z water plane. No user-controlled orbit or third-person
 * chase camera is part of the game action contract.
 */
export const GAMEPLAY_CAMERA_POLICY = {
  gameplayPlane: "XZ" as const,
  waterLevel: 0,
  projection: "fixed-oblique-perspective" as const,
  fieldOfViewDegrees: 35,
  // Zoom OUT ~0.55–0.72 · MID master ~0.88–1.02 · Zoom IN ~1.12–1.38
  minZoom: 0.55,
  maxZoom: 1.38,
  baseHeight: 720,
  minHeight: 520,
  maxHeight: 1220,
  baseBackDistance: 400,
  minBackDistance: 260,
  maxBackDistance: 720,
  fixedLateralRatio: -0.16,
  targetOffsetX: 24,
  targetOffsetZ: -72,
  bossOverviewMultiplier: 1.3,
  eventOverviewMultiplier: 1.14,
  followSmoothing: 0.09,
  maxShake: 7,
  playerOrbitEnabled: false,
  thirdPersonChaseEnabled: false,
} as const;

export type CameraSituation = {
  zoom: number;
  mapId: MapId;
  bossSelected: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function resolveCameraPresentation(situation: CameraSituation) {
  const policy = GAMEPLAY_CAMERA_POLICY;
  const zoom = clamp(situation.zoom, policy.minZoom, policy.maxZoom);
  const overview = situation.bossSelected
    ? policy.bossOverviewMultiplier
    : situation.mapId === "abyss"
      ? policy.eventOverviewMultiplier
      : 1;

  return {
    zoom,
    overview,
    height:
      clamp(
        policy.baseHeight / zoom,
        policy.minHeight,
        policy.maxHeight,
      ) * overview,
    backDistance:
      clamp(
        policy.baseBackDistance / zoom,
        policy.minBackDistance,
        policy.maxBackDistance,
      ) * overview,
  };
}
