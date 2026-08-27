import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("label sprites preserve canvas texture aspect ratio with screen-space sizing", async () => {
  const source = await readFile(join(root, "app/threeRenderer.ts"), "utf8");
  assert.match(source, /function applyLabelSpriteScreenSize/);
  assert.match(source, /function worldUnitsPerPixel/);
  assert.match(source, /canvasTextureAspect/);
  assert.match(source, /sprite\.scale\.set\(h\*aspect,h,1\)/);
  assert.doesNotMatch(source, /playerMarker\.sprite\.scale\.set\(108/);
  assert.doesNotMatch(source, /marker\.sprite\.scale\.set\(\(selected\?118/);
  assert.doesNotMatch(source, /islandMarkers\)marker\.sprite\.scale\.set\(118/);
  assert.match(source, /applyLabelSpriteScreenSize\(this\.playerMarker\.sprite/);
  assert.match(source, /applyLabelSpriteScreenSize\(marker\.sprite,marker\.canvas/);
  assert.match(source, /createLabelCanvas/);
  assert.match(source, /generateMipmaps=false/);
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
  assert.match(source, /textureAspect:canvasTextureAspect/);
  assert.match(source, /spriteAspect:pm\.scale\.x\/pm\.scale\.y/);
  assert.match(source, /projectedScreenHeight/);
  assert.match(source, /unitsPerPixel:labelUnitsPerPixel/);
});
