import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("world labels use screen-space sizing and separated hp bars", async () => {
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(labels, /worldUnitsPerPixel/);
  assert.match(labels, /generateMipmaps = false/);
  assert.match(labels, /createHpBar/);
  assert.match(labels, /updatePlayerWorldLabel/);
  assert.match(labels, /updateNpcWorldLabel/);
  assert.match(labels, /updatePoiWorldLabel/);
  assert.match(labels, /ctx\.setTransform\(1, 0, 0, 1, 0, 0\)/);
  assert.doesNotMatch(labels, /fillRect\(/);

  assert.match(renderer, /updatePlayerWorldLabel/);
  assert.match(renderer, /updateNpcWorldLabel/);
  assert.match(renderer, /updatePoiWorldLabel/);
  assert.match(labels, /frame\.playerName/);
  assert.match(renderer, /KRAKEN_PLAYER_DISPLAY_NAME/);
  assert.doesNotMatch(renderer, /paintPlayerMarker/);
  assert.doesNotMatch(renderer, /paintHealthMarker/);
  assert.doesNotMatch(renderer, /paintIslandMarker/);
});

test("label debug harness exposes projected metrics", async () => {
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");
  assert.match(renderer, /labelDebugEnabled/);
  assert.match(renderer, /labels:this\.labelDebugEntries/);
  assert.match(renderer, /worldUnitsPerPixel\(this\.camera,this\.renderer/);
});

test("kraken hero scale calibrated for mid presence", async () => {
  const shipVisuals = await readFile(join(root, "app/game/visuals/shipVisuals.ts"), "utf8");
  assert.match(shipVisuals, /scale: 66/);
});
