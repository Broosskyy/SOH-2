import type { SaveGame } from "../save/model";

const GOLD_REWARDS: Record<string, number> = {
  "first-blood": 900,
  salvager: 1200,
  cartographer: 1500,
  shipwright: 2000,
};

const PEARL_REWARDS: Record<string, number> = {
  "deep-hunt": 40,
  "storm-vanguard": 75,
  shipwright: 5,
};

export function grantMissionReward(save: SaveGame, missionId: string): void {
  save.gold += GOLD_REWARDS[missionId] ?? 0;
  save.pearls += PEARL_REWARDS[missionId] ?? 0;
  if (missionId === "ritualist") save.mapFragments = (save.mapFragments ?? 0) + 1;
  save.xp += missionId === "first-blood" ? 250 : missionId === "deep-hunt" || missionId === "ritualist" ? 350 : 200;
}
