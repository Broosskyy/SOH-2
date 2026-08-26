import { IndexedDbSaveGameRepository } from "./game/save/indexedDbRepository";

export type { LegacySaveGame, SaveGame } from "./game/save/model";
export { CURRENT_SAVE_VERSION, migrateSave } from "./game/save/model";
export type {
  CloudSaveRepository,
  SaveGameRepository,
} from "./game/save/repository";

const repository = new IndexedDbSaveGameRepository();

// Compatibility facade for the V15 React client. Gameplay depends on the
// repository contract now, not directly on IndexedDB.
export const loadSave = () => repository.load();
export const writeSave = (save: import("./game/save/model").SaveGame) =>
  repository.write(save);
export const resetSave = () => repository.remove();
