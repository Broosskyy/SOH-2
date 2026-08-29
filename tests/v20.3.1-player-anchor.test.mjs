import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("V20.3.1 player anchor uses visual hull samples not full AABB corners", async () => {
  const anchor = await readFile(join(root, "app/game/visuals/playerLabelAnchor.ts"), "utf8");
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(anchor, /collectVisualHullScreenSamples/);
  assert.match(anchor, /hullCeiling/);
  assert.match(anchor, /EXCLUDED_MESH_NAME_RE/);
  assert.match(anchor, /visualGapCss/);
  assert.match(anchor, /projectedVisualBottom/);
  assert.match(anchor, /statusVisualTop/);
  assert.match(anchor, /anchorSource/);
  assert.doesNotMatch(anchor, /boxCorners\(hullBox/);
  assert.match(renderer, /gapCss:8/);
  assert.match(renderer, /projectedVisualBottom/);
});

test("V20.3.1 visual debug exposes anchor hardware fields", async () => {
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(renderer, /shipHeading/);
  assert.match(renderer, /statusScale/);
  assert.match(renderer, /anchorSource/);
});
