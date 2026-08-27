import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("wake patch avoids tube and ring geometry fan", async () => {
  const source = await readFile(join(root, "app/threeRenderer.ts"), "utf8");
  assert.match(source, /function createWakePatch/);
  assert.match(source, /userData\.visualEffectType="wake"/);
  const wakeBlock = source.split("function createWakePatch")[1]?.split("function ")[0] ?? "";
  assert.doesNotMatch(wakeBlock, /TubeGeometry|RingGeometry/);
  assert.match(source, /wakeSampleCount/);
  assert.match(source, /activeWakeMeshes/);
});

test("player label maps player name not ship class", async () => {
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");
  assert.match(renderer, /frame\.playerName\.toUpperCase\(\)/);
  assert.match(renderer, /LV \$\{frame\.playerLevel\}/);
  assert.match(renderer, /KRAKEN_PLAYER_DISPLAY_NAME/);
  assert.doesNotMatch(renderer, /SHIPS\[frame\.shipId\]\.name\.split/);
});

test("combat cluster v25 structure is complete", async () => {
  const page = await readFile(join(root, "app/page.tsx"), "utf8");
  assert.match(page, /combat-cluster-v25/);
  assert.match(page, /combat-skill-row/);
  assert.match(page, /combat-primary-row/);
  assert.match(page, /combat-ammo-row/);
  assert.match(page, /repair-button/);
  assert.match(page, /fire-button/);
  assert.match(page, /adjustZoom\(0\.12\)/);
  assert.doesNotMatch(page, /position:fixed[\s\S]*ammo-select/);
});

test("camera control group and default mid zoom", async () => {
  const page = await readFile(join(root, "app/page.tsx"), "utf8");
  const state = await readFile(join(root, "app/game/core/state.ts"), "utf8");
  const css = await readFile(join(root, "app/globals.css"), "utf8");
  assert.match(page, /camera-control-group/);
  assert.match(css, /\.camera-control-group/);
  assert.match(state, /zoom: 0\.96/);
});

test("world composition encounter clusters", async () => {
  const source = await readFile(join(root, "app/threeRenderer.ts"), "utf8");
  assert.match(source, /compositionZone="encounter"/);
  assert.match(source, /compositionZone="transition"/);
});

test("player aura no large additive ring", async () => {
  const source = await readFile(join(root, "app/threeRenderer.ts"), "utf8");
  assert.doesNotMatch(source, /RingGeometry\(55,\s*60/);
  assert.match(source, /auraLight\.userData\.visualEffectType="aura"/);
});

test("kraken scale calibrated to 65", async () => {
  const source = await readFile(
    join(root, "app/game/visuals/shipVisuals.ts"),
    "utf8",
  );
  assert.match(source, /scale: 65/);
});
