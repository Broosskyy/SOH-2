import type { AmmoId, EntityKind, MapId, ShipId } from "../../gameData";

/** Simulation coordinate: x maps to world X, y maps to world Z. */
export type Vec2 = { x: number; y: number };

export type Entity = Vec2 & {
  id: number;
  kind: EntityKind;
  angle: number;
  hp: number;
  maxHp: number;
  fireAt: number;
  hitAt: number;
  statusUntil: number;
  phase: number;
};

export type Shot = Vec2 & {
  vx: number;
  vy: number;
  ttl: number;
  enemy: boolean;
  damage: number;
  ammo: AmmoId;
  targetId?: number;
  hit?: boolean;
};

export type Loot = Vec2 & {
  id: number;
  gold: number;
  pearls: number;
  materials: number;
  born: number;
};

export type Toast = {
  id: number;
  text: string;
  kind: "gold" | "danger" | "info";
};

export type Panel =
  | "missions"
  | "map"
  | "port"
  | "shipyard"
  | "cauldron"
  | "inventory"
  | "events"
  | "settings"
  | null;

export type RendererFrame = {
  mapId: MapId;
  zoom: number;
  cameraPan: Vec2;
  selectedId: number | null;
  destination: Vec2 | null;
  shipId: ShipId;
  playerName: string;
  playerLevel: number;
  deckLevel: number;
  weaponSlots: number;
  expansionSlots: number;
  player: Vec2 & { angle: number; speed: number; hp: number; maxHp: number };
  entities: Entity[];
  shots: Shot[];
  loot: Loot[];
  wake: Array<Vec2 & { ttl: number; angle: number; strength: number }>;
  lastHit: number;
};

export type ThreeRendererHandle = {
  render: (frame: RendererFrame, time: number) => void;
  pickEntity: (clientX: number, clientY: number) => number | null;
  pointFromEvent: (clientX: number, clientY: number) => Vec2 | null;
  dispose: () => void;
};
