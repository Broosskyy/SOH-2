import type { SaveGame } from "../save/model";

export type ShopPurchase = "repair" | "iron" | "piercing" | "cannon" | "harpoon" | "mojo" | "hull" | "sails" | "crew";

export function purchasePrice(what: ShopPurchase, save: SaveGame): number {
  const prices: Record<ShopPurchase, number> = {
    repair: 600,
    iron: 300,
    piercing: 850,
    cannon: 1600 * save.cannonLevel,
    harpoon: 1400 * save.harpoonLevel,
    mojo: 500,
    hull: 1250 * (save.hullLevel ?? 1),
    sails: 1100 * (save.sailLevel ?? 1),
    crew: 1500 * (save.crewLevel ?? 1),
  };
  return prices[what];
}
