import type { MapConfig } from "../../gameData";
import type { WorldDensityCounts } from "./worldDensity";
import {
  classifyPropTier,
  countIsolatedMicroProps,
  countPropsByTier,
  nearestMacroFeature,
  type CompositionPropEntry,
  type CompositionTier,
} from "./worldCompositionHierarchy";

export type PropKind =
  | "rock"
  | "reef"
  | "buoy"
  | "crate"
  | "barrel"
  | "driftwood"
  | "wreck"
  | "mast"
  | "pier"
  | "ruin"
  | "lighthouse";

export type CompositionZone =
  | "portCluster"
  | "shoreline"
  | "coastalTransition"
  | "navigationLane"
  | "openSea"
  | "rockFormation"
  | "wreckScene"
  | "navigationNode"
  | "encounter"
  | "lootSalvage"
  | "islandRing";

export const seeded = (seed: number) => {
  const x = Math.sin(seed * 91.731) * 43758.5453;
  return x - Math.floor(x);
};

function islandNormDistance(
  x: number,
  z: number,
  isle: MapConfig["islands"][number],
) {
  return Math.hypot((x - isle.x) / isle.rx, (z - isle.y) / isle.ry);
}

function nearestIslandDistance(x: number, z: number, islands: MapConfig["islands"]) {
  if (!islands.length) return Number.POSITIVE_INFINITY;
  return Math.min(...islands.map((isle) => islandNormDistance(x, z, isle)));
}

function pointOnIslandRing(
  isle: MapConfig["islands"][number],
  angle: number,
  radiusScale: number,
) {
  return {
    x: isle.x + Math.cos(angle) * isle.rx * radiusScale,
    z: isle.y + Math.sin(angle) * isle.ry * radiusScale,
  };
}

export type CompositionPlan = {
  props: CompositionPropEntry[];
};

export type CompositionClusterInfo = {
  type: CompositionZone;
  x: number;
  z: number;
  distance: number;
};

type PropInput = Omit<CompositionPropEntry, "tier"> & { tier?: CompositionTier };

function pushProp(props: CompositionPropEntry[], entry: PropInput) {
  props.push({
    ...entry,
    tier: entry.tier ?? classifyPropTier(entry.kind),
  });
}

function addRockFormation(
  props: CompositionPropEntry[],
  x: number,
  z: number,
  seed: number,
  zone: CompositionZone = "rockFormation",
  clusterId?: string,
) {
  const count = 4 + Math.floor(seeded(seed) * 3);
  for (let i = 0; i < count; i++) {
    const angle = seeded(seed + i * 7) * Math.PI * 2;
    const radius = 18 + seeded(seed + i * 11) * 42;
    pushProp(props, {
      kind: i % 3 === 0 ? "reef" : "rock",
      x: x + Math.cos(angle) * radius,
      z: z + Math.sin(angle) * radius,
      rotationY: angle + seeded(seed + i * 3) * 0.4,
      scale: 0.72 + seeded(seed + i * 5) * 0.38,
      zone,
      y: i % 3 === 0 ? -1 : 0,
      seed: seed + i,
      clusterId,
    });
  }
}

function addWreckScene(
  props: CompositionPropEntry[],
  x: number,
  z: number,
  seed: number,
  zone: CompositionZone = "wreckScene",
  clusterId?: string,
) {
  pushProp(props, {
    kind: "wreck",
    x,
    z,
    rotationY: seeded(seed) * Math.PI * 2,
    scale: 0.92 + seeded(seed + 1) * 0.18,
    zone,
    tier: "macro",
    seed,
    clusterId,
  });
  const microKinds: PropKind[] = ["crate", "barrel", "driftwood"];
  for (let i = 0; i < 3; i++) {
    const angle = seeded(seed + 20 + i) * Math.PI * 2;
    const radius = 22 + i * 9;
    pushProp(props, {
      kind: microKinds[i],
      x: x + Math.cos(angle) * radius,
      z: z + Math.sin(angle) * radius,
      rotationY: angle,
      scale: 0.62 + seeded(seed + 30 + i) * 0.2,
      zone,
      seed: seed + 20 + i,
      clusterId,
    });
  }
}

function addNavigationNode(
  props: CompositionPropEntry[],
  x: number,
  z: number,
  seed: number,
  clusterId?: string,
) {
  pushProp(props, {
    kind: "buoy",
    x,
    z,
    rotationY: seeded(seed) * Math.PI * 2,
    scale: 0.78 + seeded(seed + 2) * 0.16,
    zone: "navigationNode",
    seed,
    clusterId,
  });
  if (seeded(seed + 4) > 0.45) {
    const offset = 28 + seeded(seed + 5) * 18;
    const angle = seeded(seed + 6) * Math.PI * 2;
    pushProp(props, {
      kind: "mast",
      x: x + Math.cos(angle) * offset,
      z: z + Math.sin(angle) * offset,
      rotationY: angle,
      scale: 0.66 + seeded(seed + 7) * 0.18,
      zone: "navigationNode",
      seed: seed + 8,
      clusterId,
    });
  }
}

function pushSparseLaneMarkers(
  props: CompositionPropEntry[],
  from: { x: number; z: number },
  to: { x: number; z: number },
  seedCursor: { value: number },
  step = 280,
) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const len = Math.hypot(dx, dz);
  const steps = Math.max(2, Math.floor(len / step));
  for (let s = 1; s < steps; s++) {
    if (s % 2 !== 0) continue;
    const t = s / steps;
    const x = from.x + dx * t;
    const z = from.z + dz * t;
    const side = seeded(seedCursor.value++) > 0.5 ? 1 : -1;
    const offset = 72 + seeded(seedCursor.value++) * 36;
    const perpX = (-dz / len) * offset * side;
    const perpZ = (dx / len) * offset * side;
    addNavigationNode(props, x + perpX, z + perpZ, seedCursor.value++, `lane-${Math.round(x)}-${Math.round(z)}`);
    seedCursor.value += 2;
  }
}

export function queryNearestCompositionCluster(
  plan: CompositionPlan,
  x: number,
  z: number,
): CompositionClusterInfo | null {
  const macro = nearestMacroFeature(plan.props, x, z);
  if (!macro) return null;
  const zone =
    macro.kind === "wreck"
      ? "wreckScene"
      : macro.kind === "lighthouse" || macro.kind === "ruin"
        ? "portCluster"
        : "rockFormation";
  return { type: zone, x: macro.x, z: macro.z, distance: macro.distance };
}

export function countVisibleCompositionNear(
  plan: CompositionPlan,
  x: number,
  z: number,
  radius = 520,
) {
  return plan.props.filter((prop) => Math.hypot(prop.x - x, prop.z - z) <= radius).length;
}

export { countPropsByTier, countIsolatedMicroProps, nearestMacroFeature };

export function buildMapCompositionPlan(
  map: MapConfig,
  density: WorldDensityCounts,
): CompositionPlan {
  const props: CompositionPropEntry[] = [];
  let seedCursor = map.id.length * 97;

  for (const [index, isle] of map.islands.entries()) {
    const portClusterId = `port-${index}`;
    if (isle.port) {
      const pierAngle = index * 0.55 + 0.2;
      const pier = pointOnIslandRing(isle, pierAngle, 0.92);
      pushProp(props, {
        kind: "pier",
        x: pier.x,
        z: pier.z,
        rotationY: pierAngle + Math.PI * 0.5,
        scale: 1,
        zone: "portCluster",
        tier: "macro",
        seed: seedCursor++,
        clusterId: portClusterId,
      });
      const dockMicro: PropKind[] = ["crate", "barrel"];
      const dockCount = Math.min(3, Math.max(2, Math.round(density.islandPropsPerIsland * 0.45)));
      for (let c = 0; c < dockCount; c++) {
        const a = pierAngle + (c - dockCount * 0.5) * 0.18;
        const p = pointOnIslandRing(isle, a, 1.02);
        pushProp(props, {
          kind: dockMicro[c % dockMicro.length],
          x: p.x + (seeded(seedCursor) - 0.5) * 12,
          z: p.z + (seeded(seedCursor + 1) - 0.5) * 12,
          rotationY: a + seeded(seedCursor + 2) * 0.3,
          scale: 0.8 + seeded(seedCursor + 3) * 0.2,
          zone: "portCluster",
          seed: seedCursor,
          clusterId: portClusterId,
        });
        seedCursor += 4;
      }
      pushProp(props, {
        kind: "lighthouse",
        x: isle.x + Math.cos(pierAngle + 1.1) * isle.rx * 0.72,
        z: isle.y + Math.sin(pierAngle + 1.1) * isle.ry * 0.72,
        rotationY: pierAngle,
        scale: 0.88 + seeded(seedCursor) * 0.12,
        zone: "portCluster",
        tier: "macro",
        seed: seedCursor++,
        clusterId: portClusterId,
      });
      for (let b = 0; b < 2; b++) {
        const a = pierAngle + (b === 0 ? -0.35 : 0.35);
        const p = pointOnIslandRing(isle, a, 1.08);
        pushProp(props, {
          kind: "buoy",
          x: p.x,
          z: p.z,
          rotationY: a,
          scale: 0.72 + seeded(seedCursor + b) * 0.16,
          zone: "portCluster",
          seed: seedCursor++,
          clusterId: portClusterId,
        });
      }
    }

    const ringKinds: PropKind[] = isle.port
      ? ["buoy", "rock", "reef", "wreck", "mast"]
      : ["rock", "reef", "wreck", "mast", "buoy"];
    for (let p = 0; p < density.islandPropsPerIsland; p++) {
      const a = index * 0.83 + p * ((Math.PI * 2) / Math.max(4, density.islandPropsPerIsland));
      const point = pointOnIslandRing(isle, a, 1.04 + (p % 2) * 0.05);
      const kind = ringKinds[p % ringKinds.length];
      pushProp(props, {
        kind,
        x: point.x,
        z: point.z,
        rotationY: a + seeded(seedCursor) * 0.35,
        scale: 0.78 + seeded(seedCursor + 1) * 0.3,
        zone: "islandRing",
        y: kind === "reef" ? -1 : 0,
        seed: seedCursor,
        clusterId: `isle-${index}`,
      });
      seedCursor += 2;
    }

    for (let s = 0; s < density.shorelinePropsPerIsland; s++) {
      const a = index * 0.67 + s * 1.23;
      const point = pointOnIslandRing(isle, a, 1.14 + (s % 2) * 0.04);
      const kind = (["rock", "reef", "buoy", "wreck", "mast"] as PropKind[])[(s + index) % 5];
      pushProp(props, {
        kind,
        x: point.x,
        z: point.z,
        rotationY: a + seeded(seedCursor) * 0.3,
        scale: 0.72 + seeded(seedCursor + 1) * 0.26,
        zone: "shoreline",
        y: kind === "reef" ? -1 : 0,
        seed: seedCursor,
        clusterId: `shore-${index}`,
      });
      seedCursor += 2;
    }
  }

  const graphNodes: Array<{ x: number; z: number; seed: number }> = [];
  const seedRef = { value: seedCursor };
  for (let a = 0; a < map.islands.length; a++) {
    for (let b = a + 1; b < map.islands.length; b++) {
      const from = { x: map.islands[a].x, z: map.islands[a].y };
      const to = { x: map.islands[b].x, z: map.islands[b].y };
      const mid = { x: (from.x + to.x) * 0.5, z: (from.z + to.z) * 0.5 };
      const dist = nearestIslandDistance(mid.x, mid.z, map.islands);
      if (dist > 1.05 && dist < 3.2) {
        graphNodes.push({ x: mid.x, z: mid.z, seed: seedRef.value++ });
      }
      pushSparseLaneMarkers(props, from, to, seedRef, 300);
    }
  }
  seedCursor = seedRef.value;

  for (const [idx, node] of graphNodes.entries()) {
    const clusterId = `graph-${idx}`;
    const roll = seeded(node.seed);
    if (roll < 0.34) {
      addWreckScene(props, node.x, node.z, node.seed, "wreckScene", clusterId);
    } else if (roll < 0.72) {
      addRockFormation(props, node.x, node.z, node.seed, "rockFormation", clusterId);
    } else {
      addNavigationNode(props, node.x, node.z, node.seed, clusterId);
    }
  }

  const openSceneCount = Math.max(3, Math.round(density.openOceanProps / 5));
  for (let i = 0; i < openSceneCount; i++) {
    const node = graphNodes[i % Math.max(1, graphNodes.length)];
    const x = node
      ? node.x + (seeded(i + 81) - 0.5) * 220
      : map.width * (0.2 + seeded(i + 81) * 0.6);
    const z = node
      ? node.z + (seeded(i + 121) - 0.5) * 180
      : map.height * (0.18 + seeded(i + 121) * 0.64);
    const dist = nearestIslandDistance(x, z, map.islands);
    if (dist < 1.2 || dist > 3.5) continue;
    const clusterId = `open-${i}`;
    if (i % 3 === 0) {
      addWreckScene(props, x, z, seedCursor, "openSea", clusterId);
    } else if (i % 3 === 1) {
      addRockFormation(props, x, z, seedCursor, "openSea", clusterId);
    } else {
      addNavigationNode(props, x, z, seedCursor, clusterId);
    }
    seedCursor += 12;
  }

  for (const [idx, spawn] of map.enemies.entries()) {
    const clusterId = `encounter-${idx}`;
    addWreckScene(props, spawn.x + 34, spawn.y + 28, seedCursor + idx, "encounter", clusterId);
    for (let c = 0; c < 2; c++) {
      const angle = seeded(idx * 13 + c) * Math.PI * 2;
      pushProp(props, {
        kind: (["rock", "buoy"] as PropKind[])[c],
        x: spawn.x + Math.cos(angle) * (58 + c * 16),
        z: spawn.y + Math.sin(angle) * (58 + c * 16),
        rotationY: angle,
        scale: 0.68 + seeded(idx * 17 + c) * 0.2,
        zone: "encounter",
        seed: seedCursor++,
        clusterId,
      });
    }
    if (idx % 2 === 0) {
      addWreckScene(
        props,
        spawn.x + 72,
        spawn.y - 48,
        seedCursor + idx * 3,
        "lootSalvage",
        `salvage-${idx}`,
      );
    }
  }

  return { props };
}
