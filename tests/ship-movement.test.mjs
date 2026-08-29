import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
const normalizeAngle = (angle) => {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};

function insideIsland(x, y, island, margin) {
  const dx = (x - island.x) / island.rx;
  const dy = (y - island.y) / island.ry;
  return dx * dx + dy * dy < margin * margin;
}

function segmentBlocked(a, b, islands, margin = 0.82) {
  const len = distance(a, b);
  const steps = Math.max(6, Math.ceil(len / 36));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    if (islands.some((island) => insideIsland(x, y, island, margin))) return true;
  }
  return false;
}

test("navigation module defines detour planning and stuck recovery", async () => {
  const source = await readFile(
    join(root, "app/game/navigation/shipMovement.ts"),
    "utf8",
  );
  assert.match(source, /planNavigationTo/);
  assert.match(source, /stepShipMovement/);
  assert.match(source, /findDetour/);
  assert.match(source, /STUCK_SECONDS/);
  assert.match(source, /resolveNavalTurnProfile/);
  assert.match(source, /applyNavalTurnInput/);
  assert.match(source, /movementDebug/);
});

test("hard rear target uses reduced thrust in naval turn profile", () => {
  const angleDiff = normalizeAngle(Math.PI - 0);
  const deg = (Math.abs(angleDiff) * 180) / Math.PI;
  assert.ok(deg >= 170);
  const hardThrust = 0.4 - ((deg - 140) / 40) * 0.2;
  assert.ok(hardThrust <= 0.35);
  const smallDiff = normalizeAngle(0.2);
  const softDeg = (Math.abs(smallDiff) * 180) / Math.PI;
  assert.ok(softDeg < 45);
});

test("camera settings module exposes persisted preference keys", async () => {
  const cameraSettings = await readFile(
    join(root, "app/game/settings/cameraSettings.ts"),
    "utf8",
  );
  assert.match(cameraSettings, /abyssal-camera-pan-speed/);
  assert.match(cameraSettings, /abyssal-zoom-sensitivity/);
  assert.match(cameraSettings, /slow: 520/);
  assert.match(cameraSettings, /fast: 1080/);
});

test("page integrates mobile calibration modules", async () => {
  const page = await readFile(join(root, "app/page.tsx"), "utf8");
  assert.match(page, /stepShipMovement/);
  assert.match(page, /planNavigationTo/);
  assert.match(page, /resolveCameraPanSpeed/);
  assert.match(page, /resolveZoomSensitivity/);
  assert.match(page, /recenter-ship-btn/);
  assert.match(page, /panel === "settings"/);
  assert.match(page, /combat-cluster/);
  assert.match(page, /Math\.pow\(ratio,sens\)/);
});
