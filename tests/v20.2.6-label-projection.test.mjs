import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("label projection uses screen-space sizing and troika world text", async () => {
  const source = await readFile(join(root, "app/game/visuals/worldLabels.ts"), "utf8");
  const worldText = await readFile(join(root, "app/game/visuals/worldText.ts"), "utf8");
  assert.match(source, /function worldUnitsPerPixel/);
  assert.match(source, /labelZoomFactor/);
  assert.match(source, /createWorldText/);
  assert.match(worldText, /troika-three-text/);
  assert.doesNotMatch(source, /new THREE\.CanvasTexture|createTextSprite/);
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

test("visual debug exposes viewport renderer and label metrics", async () => {
  const source = await readFile(join(root, "app/threeRenderer.ts"), "utf8");
  assert.match(source, /visualViewportWidth/);
  assert.match(source, /drawingBufferWidth/);
  assert.match(source, /hpBarScreenWidth/);
  assert.match(source, /shieldBarScreenWidth/);
  assert.match(source, /unitsPerPixel:labelUnitsPerPixel/);
});
