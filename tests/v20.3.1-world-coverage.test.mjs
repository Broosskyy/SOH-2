import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("V20.3.1 world composition adds navigation lanes and macro landmarks", async () => {
  const composition = await readFile(join(root, "app/game/visuals/worldComposition.ts"), "utf8");
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(composition, /navigationLane/);
  assert.match(composition, /macroLandmark/);
  assert.match(composition, /pushLaneProps/);
  assert.match(composition, /queryNearestCompositionCluster/);
  assert.match(composition, /countVisibleCompositionNear/);
  assert.match(renderer, /visibleCompositionProps/);
  assert.match(renderer, /nearestClusterType/);
});

test("V20.3.1 aster map composition improves gameplay coverage", async () => {
  const composition = await readFile(join(root, "app/game/visuals/worldComposition.ts"), "utf8");
  const laneMatches = composition.match(/navigationLane/g) ?? [];
  const macroMatches = composition.match(/macroLandmark/g) ?? [];

  assert.ok(laneMatches.length >= 2);
  assert.ok(macroMatches.length >= 2);
  assert.match(composition, /for \(let a = 0; a < map\.islands\.length; a\+\+\)/);
});
