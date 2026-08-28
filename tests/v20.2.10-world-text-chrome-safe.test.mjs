import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("V20.2.10 world text uses troika SDF, not CanvasTexture", async () => {
  const worldText = await readFile(join(root, "app/game/visuals/worldText.ts"), "utf8");
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(worldText, /troika-three-text/);
  assert.match(worldText, /WORLD_TEXT_ENGINE = "TROIKA_SDF"/);
  assert.match(labels, /from "\.\/worldText"/);
  assert.match(labels, /countCanvasWorldTextSprites/);

  const labelsSansCounter = labels.replace(/export function countCanvasWorldTextSprites[\s\S]*$/, "");
  assert.doesNotMatch(labelsSansCounter, /new THREE\.CanvasTexture|createTextSprite|paintOutlinedText|THREE\.Sprite/);
  assert.doesNotMatch(labels, /LV \$\{frame\.playerLevel\}/);
  assert.doesNotMatch(labels, /LV \$\{frame\.playerLevel\}|paintPlayerIdentity/);

  assert.match(labels, /PlaneGeometry/);
  assert.match(labels, /setStatusBarSize\(label\.hpBar/);
  assert.match(labels, /setStatusBarSize\(label\.shieldBar/);
  assert.match(labels, /extensionRow\.visible = false/);
  assert.match(labels, /progressRow\.visible = false/);
  assert.match(labels, /qualityRow\.visible = false/);
  assert.match(labels, /guildTag\.mesh\.visible = false/);
  assert.match(labels, /pirateRank\.mesh\.visible = false/);

  assert.match(renderer, /WORLD_TEXT_ENGINE/);
  assert.match(renderer, /canvasWorldTextCount/);
  assert.match(renderer, /frame\.playerName/);
});

test("V20.2.10 POI and NPC avoid canvas world text", async () => {
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");
  const poiBlock = labels.split("export function createPoiWorldLabel")[1]?.split("export function disposePoiWorldLabel")[0] ?? "";
  const npcBlock = labels.split("export function createNpcWorldLabel")[1]?.split("export function updateNpcWorldLabel")[0] ?? "";

  assert.doesNotMatch(poiBlock, /CanvasTexture|Sprite/);
  assert.doesNotMatch(npcBlock, /CanvasTexture|Sprite/);
  assert.match(npcBlock, /createWorldText/);
  assert.match(poiBlock, /createWorldText/);
  assert.doesNotMatch(poiBlock, /hpBar|shieldBar/);
});
