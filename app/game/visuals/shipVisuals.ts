import type { ShipId } from "../../gameData";

export type ShipVisualDefinition = {
  id: string;
  assetPath: string;
  scale: number;
  rotationOffsetY: number;
  waterlineOffset: number;
  wakeOffset: { forward: number; lateral: number };
  cannonOffsets: {
    port: Array<{ forward: number; lateral: number; height: number }>;
    starboard: Array<{ forward: number; lateral: number; height: number }>;
    bow?: { forward: number; lateral: number; height: number };
  };
  shadow: { cast: boolean; receive: boolean };
};

/**
 * Meshy source axis: +Z bow, +Y up.
 * MODEL_YAW_OFFSET = Math.PI / 2 maps GLB +Z bow to gameplay +X forward
 * without rotating physics, navigation or heading.
 */
export const KRAKEN_MODEL_YAW_OFFSET = Math.PI / 2;

export const KRAKEN_PLAYER_VISUAL: ShipVisualDefinition = {
  id: "kraken-player-30k",
  assetPath: "/assets/3d/ships/player/kraken/Kraken_ship_player_30k.glb",
  scale: 63,
  rotationOffsetY: KRAKEN_MODEL_YAW_OFFSET,
  waterlineOffset: 22,
  wakeOffset: { forward: -62, lateral: 0 },
  cannonOffsets: {
    port: [
      { forward: -18, lateral: 17, height: 10 },
      { forward: 0, lateral: 17, height: 10 },
      { forward: 18, lateral: 17, height: 10 },
    ],
    starboard: [
      { forward: -18, lateral: -17, height: 10 },
      { forward: 0, lateral: -17, height: 10 },
      { forward: 18, lateral: -17, height: 10 },
    ],
    bow: { forward: 45, lateral: 0, height: 9 },
  },
  shadow: { cast: true, receive: true },
};

/**
 * V20.1 is a visual integration test: the Kraken replaces the visual of the
 * currently selected player ship, while the selected ShipId continues to own
 * all gameplay stats and save data. Keep every current player id routed to the
 * same visual definition until a later skin/LOD system is introduced.
 */
export const PLAYER_SHIP_VISUALS: Record<ShipId, ShipVisualDefinition> = {
  sovereign: KRAKEN_PLAYER_VISUAL,
  tempest: KRAKEN_PLAYER_VISUAL,
  ironclad: KRAKEN_PLAYER_VISUAL,
  arcanum: KRAKEN_PLAYER_VISUAL,
};

export function validateShipVisualDefinition(definition: ShipVisualDefinition) {
  return (
    definition.assetPath.endsWith(".glb") &&
    Number.isFinite(definition.scale) &&
    definition.scale > 0 &&
    Number.isFinite(definition.rotationOffsetY) &&
    Number.isFinite(definition.waterlineOffset) &&
    Number.isFinite(definition.wakeOffset.forward) &&
    Number.isFinite(definition.wakeOffset.lateral)
  );
}

export function worldOffset(
  origin: { x: number; y: number },
  heading: number,
  offset: { forward: number; lateral: number },
) {
  return {
    x:
      origin.x +
      Math.cos(heading) * offset.forward -
      Math.sin(heading) * offset.lateral,
    y:
      origin.y +
      Math.sin(heading) * offset.forward +
      Math.cos(heading) * offset.lateral,
  };
}
