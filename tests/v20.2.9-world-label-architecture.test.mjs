import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("V20.2.9 world label group architecture", async () => {
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(labels, /PlayerWorldLabelGroup/);
  assert.match(labels, /NpcWorldLabelGroup/);
  assert.match(labels, /PoiWorldLabelGroup/);
  assert.match(labels, /createStatusBar/);
  assert.match(labels, /PlaneGeometry/);
  assert.match(labels, /frame\.playerName|playerName/);
  assert.match(labels, /shieldBar/);
  assert.match(labels, /extensionRow/);
  assert.match(labels, /progressRow/);
  assert.match(labels, /guildTag/);
  assert.match(labels, /pirateRank/);
  assert.match(labels, /generateMipmaps = false/);

  assert.doesNotMatch(labels, /fillRect\(.*hp|hpGradient|strokeRect\(18,22/);
  assert.doesNotMatch(renderer, /createPlayerMarker|createHealthMarker|createIslandMarker/);
  assert.doesNotMatch(renderer, /paintPlayerMarker|paintHealthMarker/);
  assert.doesNotMatch(renderer, /KRAKEN_PLAYER_DISPLAY_NAME/);

  assert.match(renderer, /createPlayerWorldLabel/);
  assert.match(renderer, /createNpcWorldLabel/);
  assert.match(renderer, /createPoiWorldLabel/);
  assert.match(renderer, /updatePlayerWorldLabel/);
  assert.match(renderer, /frame\.player\.shield/);
  assert.match(renderer, /frame\.player\.maxShield/);
  assert.match(renderer, /frame\.playerName/);
});

test("V20.2.9 labels avoid composite canvas HP bars", async () => {
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");
  const paintBlock = labels.split("function paintPlayerIdentity")[0];
  assert.doesNotMatch(paintBlock, /fillRect\(/);
  assert.match(labels, /setStatusBarSize\(label\.hpBar/);
  assert.match(labels, /setStatusBarSize\(label\.shieldBar/);
});

test("V20.2.9 POI labels have no HP geometry", async () => {
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");
  const poiBlock = labels.split("export function createPoiWorldLabel")[1]?.split("export function disposePoiWorldLabel")[0] ?? "";
  assert.doesNotMatch(poiBlock, /hpBar|shieldBar|StatusBar/);
  assert.match(poiBlock, /nameLine/);
  assert.match(poiBlock, /levelTag/);
});

test("V20.2.9 future rows stay hidden without fake data", async () => {
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");
  assert.match(labels, /extensionRow\.visible = false/);
  assert.match(labels, /progressRow\.visible = false/);
  assert.match(labels, /guildTag\.sprite\.visible = false/);
  assert.match(labels, /pirateRank\.sprite\.visible = false/);
});
