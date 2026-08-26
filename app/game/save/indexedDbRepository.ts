import { migrateSave, type LegacySaveGame, type SaveGame } from "./model";
import type { SaveGameRepository } from "./repository";

const DATABASE_NAME = "abyssal-dominion";
const STORE_NAME = "profiles";
const DEFAULT_PROFILE = "captain";

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 3);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME))
        request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export class IndexedDbSaveGameRepository implements SaveGameRepository {
  async load(profileId = DEFAULT_PROFILE): Promise<SaveGame | null> {
    try {
      const database = await openDatabase();
      const raw = await new Promise<LegacySaveGame | null>((resolve, reject) => {
        const request = database
          .transaction(STORE_NAME)
          .objectStore(STORE_NAME)
          .get(profileId);
        request.onsuccess = () =>
          resolve((request.result as LegacySaveGame | undefined) ?? null);
        request.onerror = () => reject(request.error);
      });
      return raw ? migrateSave(raw) : null;
    } catch {
      return null;
    }
  }

  async write(save: SaveGame, profileId = DEFAULT_PROFILE): Promise<void> {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const request = database
        .transaction(STORE_NAME, "readwrite")
        .objectStore(STORE_NAME)
        .put(migrateSave(save), profileId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async remove(profileId = DEFAULT_PROFILE): Promise<void> {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const request = database
        .transaction(STORE_NAME, "readwrite")
        .objectStore(STORE_NAME)
        .delete(profileId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

