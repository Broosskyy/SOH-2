import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("V20.3.2 reduces isolated open-sea micro props", async () => {
  const composition = await readFile(join(root, "app/game/visuals/worldComposition.ts"), "utf8");
  assert.doesNotMatch(composition, /macroLandmark/);
  assert.doesNotMatch(composition, /gridX/);
  assert.match(composition, /pushSparseLaneMarkers/);
  const crateMatches = composition.match(/kind: "crate"/g) ?? [];
  const barrelMatches = composition.match(/kind: "barrel"/g) ?? [];
  assert.ok(crateMatches.length <= 12);
  assert.ok(barrelMatches.length <= 12);
});

test("V20.3.2 micro props require cluster context helpers", async () => {
  const hierarchy = await readFile(join(root, "app/game/visuals/worldCompositionHierarchy.ts"), "utf8");
  assert.match(hierarchy, /countIsolatedMicroProps/);
  assert.match(hierarchy, /clusterRadius/);
});
