import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("V20.2.11 keeps troika SDF and zero canvas world text", async () => {
  const worldText = await readFile(join(root, "app/game/visuals/worldText.ts"), "utf8");
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");

  assert.match(worldText, /WORLD_TEXT_ENGINE = "TROIKA_SDF"/);
  assert.match(labels, /countCanvasWorldTextSprites/);
  const labelsSansCounter = labels.replace(/export function countCanvasWorldTextSprites[\s\S]*$/, "");
  assert.doesNotMatch(labelsSansCounter, /new THREE\.CanvasTexture|createTextSprite|THREE\.Sprite/);
});

test("V20.2.11 player calibration is smaller than V20.2.10 baseline", async () => {
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");

  assert.match(labels, /PLAYER_LABEL_CALIBRATION/);
  assert.match(labels, /nameBasePx: 10\.5/);
  assert.match(labels, /hpBarBaseW: 80/);
  assert.match(labels, /hpBarBaseH: 3\.75/);
  assert.match(labels, /shieldBarBaseH: 3/);
  assert.doesNotMatch(labels, /13\.5 \* z, 12, 15/);
  assert.doesNotMatch(labels, /102 \* z, 90, 115/);
  assert.match(labels, /fontWeight: 550/);
  assert.doesNotMatch(labels, /fontWeight: 700/);
  assert.doesNotMatch(labels, /fontWeight: 600/);
});

test("V20.2.11 NPC and POI are smaller than player", async () => {
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");

  assert.match(labels, /NPC_LABEL_CALIBRATION/);
  assert.match(labels, /POI_LABEL_CALIBRATION/);
  assert.match(labels, /layoutCompactNameLevel/);
  assert.match(labels, /levelTag\.mesh\.visible = true/);
  assert.doesNotMatch(labels, /\$\{name\}   LV \$\{level\}/);

  const playerName = labels.match(/nameBasePx: ([\d.]+)/)?.[1];
  const npcName = labels.match(/NPC_LABEL_CALIBRATION[\s\S]*?nameBasePx: ([\d.]+)/)?.[1];
  const poiName = labels.match(/POI_LABEL_CALIBRATION[\s\S]*?nameBasePx: ([\d.]+)/)?.[1];
  assert.ok(Number(npcName) < Number(playerName));
  assert.ok(Number(poiName) <= Number(playerName));
});

test("V20.2.11 no HP/shield labels or numbers in world labels", async () => {
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");

  assert.doesNotMatch(labels, /"(HP|SCHILD|HULL|SHIELD)"/i);
  assert.doesNotMatch(labels, /`HP |`SCHILD|`SHIELD/);
  assert.doesNotMatch(labels, /100\.000|50\.000/);
  assert.match(labels, /guildTag\.mesh\.visible = false/);
  assert.match(labels, /pirateRank\.mesh\.visible = false/);
  assert.match(labels, /extensionRow\.visible = false/);
  assert.match(labels, /progressRow\.visible = false/);
  assert.match(labels, /qualityRow\.visible = false/);
  assert.doesNotMatch(labels, /\[LoL\]|LEGENDARY|BROSKY/);
});

test("V20.2.11 label zoom factor and debug metrics", async () => {
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(labels, /return 0\.82 \+ t \* 0\.18/);
  assert.match(labels, /nameCssHeight/);
  assert.match(labels, /totalLabelHeightCss/);
  assert.match(renderer, /computeRotationSafePlayerLabelAnchor/);
  assert.match(renderer, /shipToLabelGapCss/);
});
