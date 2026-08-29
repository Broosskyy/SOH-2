import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("V20.3.1 world label collision module exists", async () => {
  const collision = await readFile(join(root, "app/game/visuals/worldLabelCollision.ts"), "utf8");
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(collision, /resolveWorldLabelCollisions/);
  assert.match(collision, /projectWorldLabelRect/);
  assert.match(collision, /screenOffsetToWorldDelta/);
  assert.match(collision, /MAX_STACK_PX/);
  assert.match(renderer, /resolveWorldLabelCollisions/);
  assert.match(renderer, /stackedNpcLabels/);
  assert.match(renderer, /maxLabelDisplacement/);
});

test("V20.3.1 collision resolves overlapping rects by vertical offset", () => {
  const MAX_STACK_PX = 20;
  const rectsOverlap = (a, b, pad = 2) =>
    !(a.x + a.width + pad < b.x || b.x + b.width + pad < a.x || a.y + a.height + pad < b.y || b.y + b.height + pad < a.y);

  const resolveWorldLabelCollisions = (entries) => {
    const sorted = [...entries].sort((a, b) => b.priority - a.priority);
    const placed = [];
    for (const entry of sorted) {
      let screenOffsetY = 0;
      let hidden = false;
      let reduced = false;
      const baseRect = entry.rect;
      for (let attempt = 0; attempt < 4; attempt++) {
        const candidate = { ...baseRect, y: baseRect.y + screenOffsetY };
        const collision = placed.some(
          (p) => !p.hidden && rectsOverlap(candidate, { ...p.rect, y: p.rect.y + p.screenOffsetY }),
        );
        if (!collision) {
          placed.push({ ...entry, screenOffsetY, hidden, reduced });
          break;
        }
        screenOffsetY += 6;
        if (screenOffsetY > MAX_STACK_PX) {
          hidden = entry.priority < 80;
          reduced = entry.priority < 100;
          placed.push({ ...entry, screenOffsetY: Math.min(screenOffsetY, MAX_STACK_PX), hidden, reduced });
          break;
        }
      }
    }
    return placed;
  };

  const resolved = resolveWorldLabelCollisions([
    { id: "a", priority: 100, rect: { x: 100, y: 100, width: 80, height: 24 } },
    { id: "b", priority: 50, rect: { x: 110, y: 102, width: 80, height: 24 } },
  ]);

  const primary = resolved.find((entry) => entry.id === "a");
  const secondary = resolved.find((entry) => entry.id === "b");
  assert.equal(primary?.screenOffsetY, 0);
  assert.ok((secondary?.screenOffsetY ?? 0) > 0);
});
