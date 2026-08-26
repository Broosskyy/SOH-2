import { AMMO, CANNONS, ENTITY_DATA, SHIPS, type AmmoId, type CannonId, type EntityKind, type ShipId } from "../../gameData";

export type WeaponSnapshot = {
  ammoId: AmmoId;
  cannonId: CannonId;
  shipId: ShipId;
  cannonLevel: number;
  harpoonLevel: number;
  crewLevel: number;
  deckLevel: number;
  targetKind: EntityKind;
};

export function calculateBroadside(snapshot: WeaponSnapshot) {
  const ammo = AMMO[snapshot.ammoId];
  const cannon = CANNONS[snapshot.cannonId];
  const ship = SHIPS[snapshot.shipId];
  const crewBonus = 1 + Math.max(0, snapshot.crewLevel - 1) * 0.035;
  const weaponLevel = snapshot.ammoId === "harpoon" ? snapshot.harpoonLevel : snapshot.cannonLevel;
  const armorBonus = snapshot.ammoId === "piercing" && ENTITY_DATA[snapshot.targetKind].armored ? 1.35 : 1;
  const projectileCount = snapshot.ammoId === "harpoon" ? 1 : Math.min(4, 2 + Math.floor((snapshot.deckLevel - 1) / 2));
  const broadsideDamage = ammo.damage * cannon.damage * ship.damage * crewBonus * (1 + (weaponLevel - 1) * 0.12) * armorBonus;

  return {
    reloadMs: ammo.reload * cannon.reload * 1000 / (1 + (snapshot.cannonLevel - 1) * 0.04) / crewBonus,
    range: ammo.range * cannon.range,
    projectileCount,
    projectileDamage: broadsideDamage * (snapshot.ammoId === "harpoon" ? 1 : 2 / projectileCount),
  };
}
