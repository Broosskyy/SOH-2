import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("V20.3 rotation-safe player label anchor exists", async () => {
  const anchor = await readFile(join(root, "app/game/visuals/playerLabelAnchor.ts"), "utf8");
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(renderer, /computeRotationSafePlayerLabelAnchor/);
  assert.match(anchor, /headingProfile/);
  assert.doesNotMatch(renderer, /frame\.player\.y\+50/);
});

test("V20.3 keeps troika SDF and zero canvas world text", async () => {
  const worldText = await readFile(join(root, "app/game/visuals/worldText.ts"), "utf8");
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");

  assert.match(worldText, /WORLD_TEXT_ENGINE = "TROIKA_SDF"/);
  const labelsSansCounter = labels.replace(/export function countCanvasWorldTextSprites[\s\S]*$/, "");
  assert.doesNotMatch(labelsSansCounter, /new THREE\.CanvasTexture/);
});

test("V20.3 player label calibration is compact", async () => {
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");

  assert.match(labels, /nameBasePx: 10\.5/);
  assert.match(labels, /hpBarBaseW: 80/);
  assert.match(labels, /NPC_LABEL_CALIBRATION[\s\S]*nameBasePx: 9/);
  assert.match(labels, /POI_LABEL_CALIBRATION[\s\S]*nameBasePx: 9/);
  assert.doesNotMatch(labels, /nameBasePx: 11\.5/);
});

test("V20.3 world composition module covers gameplay zones", async () => {
  const composition = await readFile(join(root, "app/game/visuals/worldComposition.ts"), "utf8");
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(composition, /buildMapCompositionPlan/);
  assert.match(composition, /wreckScene/);
  assert.match(composition, /rockFormation/);
  assert.match(composition, /navigationNode/);
  assert.match(composition, /encounter/);
  assert.match(composition, /lootSalvage/);
  assert.match(composition, /navigationNode/);
  assert.match(renderer, /buildMapCompositionPlan/);
});

test("V20.3 shallow coast uses rings not flat cyan disc", async () => {
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(renderer, /RingGeometry\(isle\.rx\*ring\.r/);
  assert.doesNotMatch(renderer, /CircleGeometry\(isle\.rx\*1\.12/);
  assert.match(renderer, /coast\*\.28/);
});

test("V20.3 no HP/shield numbers in world labels", async () => {
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");

  assert.doesNotMatch(labels, /"(HP|SCHILD|HULL|SHIELD)"/i);
  assert.doesNotMatch(labels, /100\.000|50\.000/);
});
