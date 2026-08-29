import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("quality profiles expose worldPropDensity tiers", async () => {
  const source = await readFile(
    join(root, "app/game/quality/qualityProfiles.ts"),
    "utf8",
  );
  assert.match(source, /worldPropDensity/);
  assert.match(source, /LOW:[\s\S]*worldPropDensity: 0\.55/);
  assert.match(source, /HIGH:[\s\S]*worldPropDensity: 1/);
});

test("world density resolver scales with map area and quality", async () => {
  const modulePath = join(root, "app/game/visuals/worldDensity.ts");
  const source = await readFile(modulePath, "utf8");
  assert.match(source, /resolveWorldDensityCounts/);
  assert.match(source, /islandPropsPerIsland/);
  assert.match(source, /openOceanProps/);
  assert.match(source, /LOW: \{ island: 4, open: 8/);
  assert.match(source, /HIGH: \{ island: 6, open: 12/);
  assert.match(source, /REFERENCE_MAP_AREA/);
});

test("renderer uses tiered world density and NPC procedural markers", async () => {
  const source = await readFile(join(root, "app/threeRenderer.ts"), "utf8");
  assert.match(source, /resolveWorldDensityCounts/);
  assert.match(source, /worldPropCount/);
  assert.match(source, /proceduralShip/);
  assert.match(source, /lighthouse/);
  assert.match(source, /PlaneGeometry\(baseWidth,baseHeight\)/);
  assert.match(source, /SHIP_MAP_SCALE=\.88/);
});

test("HUD exposes visible zoom controls", async () => {
  const page = await readFile(join(root, "app/page.tsx"), "utf8");
  assert.match(page, /zoom-controls/);
  assert.match(page, /adjustZoom/);
});
