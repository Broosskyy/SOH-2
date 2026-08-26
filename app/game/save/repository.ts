import type { SaveGame } from "./model";

export interface SaveGameRepository {
  load(profileId?: string): Promise<SaveGame | null>;
  write(save: SaveGame, profileId?: string): Promise<void>;
  remove(profileId?: string): Promise<void>;
}

export interface CloudSaveRepository extends SaveGameRepository {
  synchronize(local: SaveGame): Promise<SaveGame>;
}

