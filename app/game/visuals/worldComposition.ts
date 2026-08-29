import * as THREE from "three";
import type { MapConfig } from "../../gameData";
import type { WorldDensityCounts } from "./worldDensity";

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
  | "openSea"
  | "openSeaCluster"
  | "encounter"
  | "lootSalvage"
  | "islandRing";

export type PlacedProp = {
  prop: THREE.Group;
  zone: CompositionZone;
};

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
  props: Array<{
    kind: PropKind;
    x: number;
    z: number;
    rotationY: number;
    scale: number;
    zone: CompositionZone;
    y?: number;
    seed: number;
  }>;
};

export function buildMapCompositionPlan(
  map: MapConfig,
  density: WorldDensityCounts,
): CompositionPlan {
  const props: CompositionPlan["props"] = [];
  let seedCursor = map.id.length * 97;

  for (const [index, isle] of map.islands.entries()) {
    if (isle.port) {
      const pierAngle = index * 0.55 + 0.2;
      const pier = pointOnIslandRing(isle, pierAngle, 0.92);
      props.push({
        kind: "pier",
        x: pier.x,
        z: pier.z,
        rotationY: pierAngle + Math.PI * 0.5,
        scale: 1,
        zone: "portCluster",
        seed: seedCursor++,
      });
      const clusterKinds: PropKind[] = ["crate", "barrel", "buoy", "crate", "barrel", "lighthouse"];
      const clusterCount = Math.min(6, density.islandPropsPerIsland + 1);
      for (let c = 0; c < clusterCount; c++) {
        const a = pierAngle + (c - clusterCount * 0.5) * 0.22;
        const r = isle.rx * (1.02 + (c % 2) * 0.05);
        const p = pointOnIslandRing(isle, a, r / isle.rx);
        props.push({
          kind: clusterKinds[c % clusterKinds.length],
          x: p.x + (seeded(seedCursor) - 0.5) * 18,
          z: p.z + (seeded(seedCursor + 1) - 0.5) * 18,
          rotationY: a + seeded(seedCursor + 2) * 0.4,
          scale: 0.82 + seeded(seedCursor + 3) * 0.28,
          zone: "portCluster",
          seed: seedCursor,
        });
        seedCursor += 4;
      }
    }

    const ringKinds: PropKind[] = isle.port
      ? ["buoy", "rock", "reef", "driftwood", "wreck", "mast"]
      : ["rock", "reef", "driftwood", "wreck", "mast", "buoy"];
    for (let p = 0; p < density.islandPropsPerIsland; p++) {
      const a = index * 0.83 + p * ((Math.PI * 2) / Math.max(4, density.islandPropsPerIsland));
      const r = 1.04 + (p % 3) * 0.06;
      const point = pointOnIslandRing(isle, a, r);
      props.push({
        kind: ringKinds[p % ringKinds.length],
        x: point.x,
        z: point.z,
        rotationY: a + seeded(seedCursor) * 0.45,
        scale: 0.78 + seeded(seedCursor + 1) * 0.34,
        zone: "islandRing",
        y: ringKinds[p % ringKinds.length] === "reef" ? -1 : 0,
        seed: seedCursor,
      });
      seedCursor += 2;
    }

    for (let s = 0; s < density.shorelinePropsPerIsland; s++) {
      const a = index * 0.67 + s * 1.23;
      const point = pointOnIslandRing(isle, a, 1.16 + (s % 2) * 0.05);
      const kind = (["rock", "reef", "buoy", "driftwood", "wreck", "mast"] as PropKind[])[
        (s + index) % 6
      ];
      props.push({
        kind,
        x: point.x,
        z: point.z,
        rotationY: a + seeded(seedCursor) * 0.35,
        scale: 0.7 + seeded(seedCursor + 1) * 0.28,
        zone: "shoreline",
        y: kind === "reef" ? -1 : 0,
        seed: seedCursor,
      });
      seedCursor += 2;
    }
  }

  const lanes: Array<{ x: number; z: number }> = [];
  for (let t = 0; t < Math.min(4, map.islands.length - 1); t++) {
    const a = map.islands[t];
    const b = map.islands[(t + 1) % map.islands.length];
    lanes.push({ x: (a.x + b.x) * 0.5, z: (a.y + b.y) * 0.5 });
    for (let c = 0; c < 2; c++) {
      const angle = seeded(t * 11 + c) * Math.PI * 2;
      const radius = 34 + seeded(t * 13 + c) * 48;
      props.push({
        kind: (["wreck", "driftwood", "crate", "barrel"] as PropKind[])[(t + c) % 4],
        x: lanes[lanes.length - 1].x + Math.cos(angle) * radius,
        z: lanes[lanes.length - 1].z + Math.sin(angle) * radius,
        rotationY: angle,
        scale: 0.66 + seeded(t * 15 + c) * 0.24,
        zone: "coastalTransition",
        seed: seedCursor++,
      });
    }
  }

  const openKinds: PropKind[] = ["crate", "barrel", "driftwood", "wreck", "buoy", "mast", "reef"];
  const clusterCenters: Array<{ x: number; z: number }> = [];
  for (let i = 0; i < Math.max(4, Math.round(density.openOceanProps / 4)); i++) {
    const lane = lanes[i % Math.max(1, lanes.length)];
    const x = lane
      ? lane.x + (seeded(i + 81) - 0.5) * map.width * 0.18
      : map.width * (0.14 + seeded(i + 81) * 0.72);
    const z = lane
      ? lane.z + (seeded(i + 121) - 0.5) * map.height * 0.18
      : map.height * (0.12 + seeded(i + 121) * 0.76);
    const dist = nearestIslandDistance(x, z, map.islands);
    if (dist < 1.18 || dist > 2.4) continue;
    clusterCenters.push({ x, z });
    const clusterSize = 2 + Math.floor(seeded(i + 201) * 2);
    for (let c = 0; c < clusterSize; c++) {
      const angle = seeded(i * 17 + c) * Math.PI * 2;
      const radius = 16 + seeded(i * 19 + c) * 34;
      props.push({
        kind: openKinds[(i + c) % openKinds.length],
        x: x + Math.cos(angle) * radius,
        z: z + Math.sin(angle) * radius,
        rotationY: seeded(i * 221 + c) * Math.PI * 2,
        scale: 0.62 + seeded(i * 301 + c) * 0.34,
        zone: "openSeaCluster",
        seed: seedCursor++,
      });
    }
  }

  const encounterKinds: PropKind[] = ["wreck", "crate", "barrel", "rock", "reef", "driftwood", "buoy"];
  for (const [idx, spawn] of map.enemies.entries()) {
    for (let c = 0; c < 4; c++) {
      const angle = seeded(idx * 13 + c) * Math.PI * 2;
      const radius = 24 + seeded(idx * 17 + c) * 58;
      props.push({
        kind: encounterKinds[(idx + c) % encounterKinds.length],
        x: spawn.x + Math.cos(angle) * radius,
        z: spawn.y + Math.sin(angle) * radius,
        rotationY: angle + seeded(idx * 29 + c) * 0.5,
        scale: 0.68 + seeded(idx * 31 + c) * 0.3,
        zone: "encounter",
        y: encounterKinds[(idx + c) % encounterKinds.length] === "reef" ? -1 : 0,
        seed: seedCursor++,
      });
    }
    if (idx % 2 === 0) {
      const salvageAngle = seeded(idx * 41) * Math.PI * 2;
      for (let s = 0; s < 3; s++) {
        const a = salvageAngle + s * 0.55;
        const r = 42 + s * 11;
        props.push({
          kind: (["wreck", "crate", "barrel"] as PropKind[])[s],
          x: spawn.x + Math.cos(a) * r,
          z: spawn.y + Math.sin(a) * r,
          rotationY: a,
          scale: 0.72 + seeded(idx * 51 + s) * 0.22,
          zone: "lootSalvage",
          seed: seedCursor++,
        });
      }
    }
  }

  return { props };
}
