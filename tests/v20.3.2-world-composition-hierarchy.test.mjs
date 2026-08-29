import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("V20.3.2 world composition uses macro-first hierarchy", async () => {
  const composition = await readFile(join(root, "app/game/visuals/worldComposition.ts"), "utf8");
  const hierarchy = await readFile(join(root, "app/game/visuals/worldCompositionHierarchy.ts"), "utf8");

  assert.match(hierarchy, /CompositionTier/);
  assert.match(hierarchy, /classifyPropTier/);
  assert.match(composition, /addWreckScene/);
  assert.match(composition, /addRockFormation/);
  assert.match(composition, /addNavigationNode/);
  assert.match(composition, /pushSparseLaneMarkers/);
  assert.doesNotMatch(composition, /openSeaCluster/);
  assert.match(composition, /"openSea"/);
});

test("V20.3.2 composition classifies macro meso micro tiers", async () => {
  const hierarchy = await readFile(join(root, "app/game/visuals/worldCompositionHierarchy.ts"), "utf8");
  assert.match(hierarchy, /MICRO_PROP_KINDS/);
  assert.match(hierarchy, /MACRO_PROP_KINDS/);
  assert.match(hierarchy, /countIsolatedMicroProps/);
});

test("V20.3.2 asset inventory documents island gap", async () => {
  const inventory = await readFile(join(root, "app/game/visuals/worldAssetInventory.ts"), "utf8");
  assert.match(inventory, /assetGaps/);
  assert.match(inventory, /GLB island/);
});
