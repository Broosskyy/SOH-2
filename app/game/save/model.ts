import type {
  AmmoId,
  CannonId,
  MapId,
  ShipId,
} from "../../gameData";
import type { QualityPreference } from "../quality/qualityProfiles";

export const CURRENT_SAVE_VERSION = 4 as const;

export type SaveGame = {
  version: typeof CURRENT_SAVE_VERSION;
  playerName: string;
  level: number;
  xp: number;
  gold: number;
  pearls: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  mapId: MapId;
  ammo: Record<AmmoId, number>;
  cannonLevel: number;
  harpoonLevel: number;
  repairKits: number;
  progress: Record<string, number>;
  completed: string[];
  visited: MapId[];
  materials: number;
  shipId?: ShipId;
  ownedShips?: ShipId[];
  cannonId?: CannonId;
  ownedCannons?: CannonId[];
  mojos?: number;
  cauldronPity?: number;
  mapFragments?: number;
  lastFreeRitual?: string;
  deckLevel?: number;
  hullLevel?: number;
  sailLevel?: number;
  crewLevel?: number;
  talentPoints?: number;
  settings?: {
    qualityProfile?: QualityPreference;
  };
};

export type LegacySaveGame = Partial<Omit<SaveGame, "version">> & {
  version?: number;
};

export function migrateSave(raw: LegacySaveGame): SaveGame {
  const defaults: SaveGame = {
    version: CURRENT_SAVE_VERSION,
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
  };

  return {
    ...defaults,
    ...raw,
    version: CURRENT_SAVE_VERSION,
    ammo: { ...defaults.ammo, ...raw.ammo },
    progress: { ...defaults.progress, ...raw.progress },
    completed: [...(raw.completed ?? defaults.completed)],
    visited: [...(raw.visited ?? defaults.visited)],
    ownedShips: [...(raw.ownedShips ?? defaults.ownedShips ?? ["sovereign"])],
    ownedCannons: [
      ...(raw.ownedCannons ?? defaults.ownedCannons ?? ["bronze"]),
    ],
    settings: { ...defaults.settings, ...raw.settings },
  };
}

