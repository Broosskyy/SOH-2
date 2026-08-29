/**
 * Static inventory of composable world assets (V20.3.2).
 * Islands use procedural textured meshes — no additional GLB island library yet.
 */
export const WORLD_ASSET_INVENTORY = {
  islands: {
    usable: 3,
    variants: ["tropical", "storm", "abyss"],
    notes: "Procedural island presentation with art textures; no separate GLB island meshes.",
  },
  rocks: { usable: 2, variants: ["rock", "reef"] },
  ports: { usable: 2, variants: ["pier", "lighthouse"] },
  wrecks: { usable: 2, variants: ["wreck", "mast"] },
  cargo: { usable: 3, variants: ["crate", "barrel", "driftwood"] },
  navigation: { usable: 2, variants: ["buoy", "mast"] },
  ruins: { usable: 1, variants: ["ruin"] },
  ships: { usable: 0, variants: [], notes: "NPC ships use procedural createShip, not composition props." },
  boats: { usable: 0, variants: [] },
  monsters: { usable: 0, variants: [], notes: "Kraken/serpent via entity system only." },
  landmarks: { usable: 2, variants: ["lighthouse", "ruin"] },
  assetGaps: [
    "No dedicated GLB island size variants (large/medium/small) — procedural only.",
    "No fort/tower prop kind in createWorldProp.",
    "No boat prop mesh — buoys/masts used as navigation markers.",
  ],
} as const;
