import {
  DECK_LEVELS,
  ENTITY_DATA,
  MAPS,
  SHIPS,
  type EntityKind,
  type MapId,
  type ShipId,
} from "../../gameData";
import type { SaveGame } from "../save/model";
import { clamp } from "./math";
import type { Entity, Loot, Shot } from "./types";
import type { GameAction } from "../input/actions";

export const MONSTER_KINDS = new Set<EntityKind>([
  "kraken",
  "serpent",
  "leviathan",
  "boss",
]);

export const deckData = (level: number) =>
  DECK_LEVELS[
    clamp(Math.round(level), 1, 6) as keyof typeof DECK_LEVELS
  ];

export const durability = (
  shipId: ShipId,
  deckLevel: number,
  hullLevel = 1,
) => {
  const ship = SHIPS[shipId];
  const deck = deckData(deckLevel);
  const hullBonus = Math.max(0, hullLevel - 1) * 0.08;
  return {
    hp: Math.round(ship.hp * (1 + deck.hpBonus + hullBonus)),
    shield: Math.round(
      ship.shield * (1 + deck.shieldBonus + hullBonus * 0.45),
    ),
  };
};

export const freshSave = (): SaveGame => ({
  version: 4,
  playerName: "Captain Rowan",
  level: 1,
  xp: 0,
  gold: 2600,
  pearls: 30,
  hp: 1250,
  maxHp: 1250,
  shield: 350,
  maxShield: 350,
  mapId: "aster",
  ammo: { iron: 999, piercing: 45, fire: 35, frost: 25, harpoon: 80 },
  cannonLevel: 1,
  harpoonLevel: 1,
  repairKits: 3,
  progress: {},
  completed: [],
  visited: ["aster"],
  materials: 0,
  shipId: "sovereign",
  ownedShips: ["sovereign"],
  cannonId: "bronze",
  ownedCannons: ["bronze"],
  mojos: 3,
  cauldronPity: 0,
  mapFragments: 0,
  lastFreeRitual: "",
  deckLevel: 1,
  hullLevel: 1,
  sailLevel: 1,
  crewLevel: 1,
  talentPoints: 0,
  settings: { qualityProfile: "AUTO" },
});

export function spawnMap(mapId: MapId, bonusBoss = false): Entity[] {
  const spawned = MAPS[mapId].enemies.map((spawn, index) => {
    const definition = ENTITY_DATA[spawn.kind];
    return {
      id: Date.now() + index,
      kind: spawn.kind,
      x: spawn.x,
      y: spawn.y,
      angle: index * 0.9,
      hp: definition.hp,
      maxHp: definition.hp,
      fireAt: 0,
      hitAt: 0,
      statusUntil: 0,
      phase: 1,
    };
  });

  if (bonusBoss) {
    const boss = ENTITY_DATA.boss;
    spawned.push({
      id: Date.now() + 99,
      kind: "boss",
      x: 2350,
      y: 900,
      angle: Math.PI,
      hp: boss.hp,
      maxHp: boss.hp,
      fireAt: 0,
      hitAt: 0,
      statusUntil: 0,
      phase: 1,
    });
  }
  return spawned;
}

export type RuntimeGameState = {
  running: boolean;
  mapId: MapId;
  shipId: ShipId;
  playerName: string;
  playerLevel: number;
  deckLevel: number;
  weaponSlots: number;
  expansionSlots: number;
  player: {
    /** Simulation x/y are rendered as world X/Z; height is never gameplay state. */
    x: number;
    y: number;
    angle: number;
    hp: number;
    maxHp: number;
    shield: number;
    maxShield: number;
    speed: number;
  };
  destination: { x: number; y: number } | null;
  entities: Entity[];
  shots: Shot[];
  loot: Loot[];
  wake: Array<{ x: number; y: number; ttl: number; angle: number; strength: number }>;
  actions: Set<GameAction>;
  selectedId: number | null;
  autoFire: boolean;
  lastShot: number;
  lastHit: number;
  lastTime: number;
  kills: number;
  monsterKills: number;
  lootCount: number;
  wave: number;
  zoom: number;
  cameraPan: { x: number; y: number };
  joystick: { x: number; y: number };
  surgeUntil: number;
  surgeReady: number;
  aegisReady: number;
  volleyReady: number;
};

export const createRuntimeState = (): RuntimeGameState => ({
  running: false,
  mapId: "aster",
  shipId: "sovereign",
  playerName: "Captain Rowan",
  playerLevel: 1,
  deckLevel: 1,
  weaponSlots: 12,
  expansionSlots: 6,
  player: {
    x: 680,
    y: 900,
    angle: 0,
    hp: 1250,
    maxHp: 1250,
    shield: 350,
    maxShield: 350,
    speed: 0,
  },
  destination: null,
  entities: spawnMap("aster"),
  shots: [],
  loot: [],
  wake: [],
  actions: new Set<GameAction>(),
  selectedId: null,
  autoFire: false,
  lastShot: 0,
  lastHit: 0,
  lastTime: 0,
  kills: 0,
  monsterKills: 0,
  lootCount: 0,
  wave: 1,
  zoom: 0.96,
  cameraPan: { x: 0, y: 0 },
  joystick: { x: 0, y: 0 },
  surgeUntil: 0,
  surgeReady: 0,
  aegisReady: 0,
  volleyReady: 0,
});
