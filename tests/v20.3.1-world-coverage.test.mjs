import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("V20.3.1 world composition baseline retained in V20.3.2", async () => {
  const composition = await readFile(join(root, "app/game/visuals/worldComposition.ts"), "utf8");
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(composition, /queryNearestCompositionCluster/);
  assert.match(composition, /countVisibleCompositionNear/);
  assert.match(renderer, /visibleCompositionProps/);
  assert.match(renderer, /visibleMacroFeatures/);
});

test("V20.3.1 world composition superseded by V20.3.2 macro hierarchy", async () => {
  const composition = await readFile(join(root, "app/game/visuals/worldComposition.ts"), "utf8");
  assert.match(composition, /addWreckScene/);
  assert.match(composition, /addRockFormation/);
  assert.match(composition, /worldCompositionHierarchy/);
});
