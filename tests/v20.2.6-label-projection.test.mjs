import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("label sprites preserve canvas texture aspect ratio", async () => {
  const labels = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");
  assert.match(labels, /setTextSpriteScreenSize/);
  assert.match(labels, /canvas\.width \/ canvas\.height/);
  assert.match(labels, /sprite\.scale\.set\(width \* unitsPerPixel, height \* unitsPerPixel, 1\)/);
});

test("renderer resize tracks css layout and camera aspect", async () => {
  const source = await readFile(join(root, "app/threeRenderer.ts"), "utf8");
  assert.match(source, /this\.canvas\.clientWidth/);
  assert.match(source, /this\.camera\.aspect=width\/height/);
  assert.match(source, /this\.camera\.updateProjectionMatrix\(\)/);
  assert.match(source, /ResizeObserver/);
  assert.match(source, /visualViewport/);
  assert.match(source, /lastLayoutWidth/);
  assert.doesNotMatch(
    source.match(/private resize\(\)[\s\S]*?pointFromEvent/)?.[0] ?? "",
    /this\.canvas\.width!==/,
  );
});

test("visual debug exposes viewport renderer and label aspect metrics", async () => {
  const source = await readFile(join(root, "app/threeRenderer.ts"), "utf8");
  assert.match(source, /visualViewportWidth/);
  assert.match(source, /drawingBufferWidth/);
  assert.match(source, /labels:this\.labelDebugEntries/);
  assert.match(source, /worldUnitsPerPixel/);
});
