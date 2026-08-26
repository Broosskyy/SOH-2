import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "shared/game-data/catalog.v1.json");
const destination = resolve(root, "godot/data/catalog.v1.json");

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
console.log("Synchronized platform-neutral game data for Godot.");

