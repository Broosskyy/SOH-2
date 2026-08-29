import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("V20.3.2 uses deterministic heading anchor profile", async () => {
  const profile = await readFile(join(root, "app/game/visuals/playerStatusAnchorProfile.ts"), "utf8");
  const anchor = await readFile(join(root, "app/game/visuals/playerLabelAnchor.ts"), "utf8");
  const renderer = await readFile(join(root, "app/threeRenderer.ts"), "utf8");

  assert.match(profile, /PLAYER_STATUS_ANCHOR_PROFILE/);
  assert.match(profile, /interpolateAnchorProfile/);
  assert.match(profile, /resolveAnchorGapCss/);
  assert.match(anchor, /headingProfile/);
  assert.match(anchor, /interpolateAnchorProfile/);
  assert.doesNotMatch(anchor, /collectVisualHullScreenSamples/);
  assert.doesNotMatch(anchor, /playerVisualRoot/);
  assert.match(renderer, /anchorProfileSector/);
  assert.match(renderer, /statusTopCss/);
});

test("V20.3.2 anchor profile interpolates intermediate headings", () => {
  const sectors = [
    { headingDeg: 0, bottomLiftCss: 0, forwardScale: 1, lateralScale: 1 },
    { headingDeg: 45, bottomLiftCss: 3, forwardScale: 0.98, lateralScale: 1.02 },
    { headingDeg: 90, bottomLiftCss: 14, forwardScale: 0.92, lateralScale: 1.08 },
    { headingDeg: 135, bottomLiftCss: 5, forwardScale: 0.96, lateralScale: 1.04 },
    { headingDeg: 180, bottomLiftCss: 1, forwardScale: 1, lateralScale: 1 },
    { headingDeg: 225, bottomLiftCss: 5, forwardScale: 0.96, lateralScale: 1.04 },
    { headingDeg: 270, bottomLiftCss: 18, forwardScale: 0.9, lateralScale: 1.1 },
    { headingDeg: 315, bottomLiftCss: 3, forwardScale: 0.98, lateralScale: 1.02 },
  ];
  const lerp = (a, b, t) => a + (b - a) * t;
  const interpolate = (deg) => {
    const startIdx = Math.floor(deg / 45) % sectors.length;
    const endIdx = (startIdx + 1) % sectors.length;
    const start = sectors[startIdx];
    const end = sectors[endIdx];
    const span = end.headingDeg > start.headingDeg ? end.headingDeg - start.headingDeg : 360 - start.headingDeg + end.headingDeg;
    const t = span <= 0 ? 0 : ((deg - start.headingDeg + 360) % 360) / span;
    return {
      bottomLiftCss: lerp(start.bottomLiftCss, end.bottomLiftCss, t),
      forwardScale: lerp(start.forwardScale, end.forwardScale, t),
      lateralScale: lerp(start.lateralScale, end.lateralScale, t),
      interpolationT: t,
    };
  };

  assert.equal(sectors.length, 8);
  for (const deg of [0, 22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5]) {
    const profile = interpolate(deg);
    assert.ok(Number.isFinite(profile.bottomLiftCss));
    assert.ok(profile.forwardScale > 0);
    assert.ok(profile.lateralScale > 0);
    assert.ok(profile.interpolationT >= 0 && profile.interpolationT <= 1);
  }
});

test("V20.3.2 status top uses name-top pivot not competing anchor paths", async () => {
  const anchor = await readFile(join(root, "app/game/visuals/playerLabelAnchor.ts"), "utf8");
  assert.match(anchor, /statusVisualTop = projectedVisualBottom \+ gapCss/);
  assert.match(anchor, /labelCenterScreenY = statusVisualTop \+ labelTotalHeightCss \* 0\.5/);
  assert.doesNotMatch(anchor, /visualHullSamples/);
});
