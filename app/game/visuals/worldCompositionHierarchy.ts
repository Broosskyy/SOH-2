import type { PropKind } from "./worldComposition";

export type CompositionTier = "macro" | "meso" | "micro";

export const MICRO_PROP_KINDS = new Set<PropKind>(["crate", "barrel", "driftwood"]);
export const MESO_PROP_KINDS = new Set<PropKind>(["buoy", "mast", "rock", "reef", "pier"]);
export const MACRO_PROP_KINDS = new Set<PropKind>(["wreck", "lighthouse", "ruin"]);

export function classifyPropTier(kind: PropKind): CompositionTier {
  if (MACRO_PROP_KINDS.has(kind)) return "macro";
  if (MICRO_PROP_KINDS.has(kind)) return "micro";
  return "meso";
}

export type CompositionPropEntry = {
  kind: PropKind;
  x: number;
  z: number;
  rotationY: number;
  scale: number;
  zone: string;
  tier: CompositionTier;
  y?: number;
  seed: number;
  clusterId?: string;
};

export function countPropsByTier(
  props: CompositionPropEntry[],
  x: number,
  z: number,
  radius = 520,
) {
  const macro = { count: 0 };
  const meso = { count: 0 };
  const micro = { count: 0 };
  for (const prop of props) {
    if (Math.hypot(prop.x - x, prop.z - z) > radius) continue;
    if (prop.tier === "macro") macro.count++;
    else if (prop.tier === "meso") meso.count++;
    else micro.count++;
  }
  return { macro: macro.count, meso: meso.count, micro: micro.count };
}

export function countIsolatedMicroProps(props: CompositionPropEntry[], clusterRadius = 48) {
  let isolated = 0;
  for (const prop of props) {
    if (prop.tier !== "micro") continue;
    const hasContext = props.some(
      (other) =>
        other !== prop &&
        (other.tier === "macro" || other.tier === "meso") &&
        Math.hypot(other.x - prop.x, other.z - prop.z) <= clusterRadius,
    );
    if (!hasContext) isolated++;
  }
  return isolated;
}

export function nearestMacroFeature(
  props: CompositionPropEntry[],
  x: number,
  z: number,
) {
  let best: { kind: PropKind; x: number; z: number; distance: number } | null = null;
  for (const prop of props) {
    if (prop.tier !== "macro") continue;
    const distance = Math.hypot(prop.x - x, prop.z - z);
    if (!best || distance < best.distance) {
      best = { kind: prop.kind, x: prop.x, z: prop.z, distance };
    }
  }
  return best;
}
