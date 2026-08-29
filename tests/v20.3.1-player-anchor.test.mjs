import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("V20.3.1 player anchor superseded by V20.3.2 heading profile", async () => {
  const anchor = await readFile(join(root, "app/game/visuals/playerLabelAnchor.ts"), "utf8");
  const profile = await readFile(join(root, "app/game/visuals/playerStatusAnchorProfile.ts"), "utf8");

  assert.match(profile, /PLAYER_STATUS_ANCHOR_PROFILE/);
  assert.match(anchor, /headingProfile/);
  assert.doesNotMatch(anchor, /collectVisualHullScreenSamples/);
});

test("V20.3.1 visual debug exposes anchor hardware fields", async () => {
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(renderer, /heading:game\?\.player\?\.angle/);
  assert.match(renderer, /statusScale/);
  assert.match(renderer, /anchorProfileSector/);
});
