import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("island presentation avoids negative sprite scale", async () => {
  const source = await readFile(join(root, "app/threeRenderer.ts"), "utf8");
  assert.match(source, /PlaneGeometry\(baseWidth,baseHeight\)/);
  assert.doesNotMatch(source, /sprite\.scale\.set\(seed%2\?-baseWidth/);
});

test("geometry safety validates finite vertices", async () => {
  const source = await readFile(
    join(root, "app/game/visuals/geometrySafety.ts"),
    "utf8",
  );
  assert.match(source, /isFiniteVertexValue/);
  assert.match(source, /finalizeBufferGeometry/);
  assert.match(source, /computeBoundingSphere/);
});

test("kraken player uses dedicated material tuning", async () => {
  const source = await readFile(join(root, "app/threeRenderer.ts"), "utf8");
  assert.match(source, /tuneKrakenPlayerMaterial/);
  assert.match(source, /createHullWaterInteraction\(96,33,true\)/);
});
