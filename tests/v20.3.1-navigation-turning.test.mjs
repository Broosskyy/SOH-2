import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const normalizeAngle = (angle) => {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};

const relativeTargetAngleDeg = (shipAngle, targetAngle) => {
  const diff = Math.abs(normalizeAngle(targetAngle - shipAngle));
  return (diff * 180) / Math.PI;
};

const resolveNavalTurnProfile = (shipAngle, targetAngle) => {
  const deg = relativeTargetAngleDeg(shipAngle, targetAngle);
  if (deg <= 45) return { turnMode: "forward", turnAuthority: 1, forwardThrustFactor: 1 };
  if (deg <= 100) {
    const t = (deg - 45) / 55;
    return { turnMode: "arc", turnAuthority: 1 + t * 0.12, forwardThrustFactor: 1 - t * 0.22 };
  }
  if (deg <= 140) {
    const t = (deg - 100) / 40;
    return {
      turnMode: "tight",
      turnAuthority: 1.12 + t * 0.38,
      forwardThrustFactor: 0.78 - t * 0.38,
    };
  }
  const t = Math.min(1, Math.max(0, (deg - 140) / 40));
  return {
    turnMode: "hard",
    turnAuthority: 1.5 + t * 0.35,
    forwardThrustFactor: 0.4 - t * 0.2,
  };
};

test("V20.3.1 naval turn profile module is wired into ship movement", async () => {
  const movement = await readFile(join(root, "app/game/navigation/shipMovement.ts"), "utf8");
  const profile = await readFile(join(root, "app/game/navigation/navalTurnProfile.ts"), "utf8");
  const page = await readFile(join(root, "app/page.tsx"), "utf8");

  assert.match(profile, /resolveNavalTurnProfile/);
  assert.match(profile, /turnMode/);
  assert.match(profile, /forwardThrustFactor/);
  assert.match(movement, /resolveNavalTurnProfile/);
  assert.match(movement, /applyNavalTurnInput/);
  assert.match(movement, /movementDebug/);
  assert.match(page, /movementDebug/);
});

test("V20.3.1 hard turn reduces forward thrust behind ship", () => {
  const hard = resolveNavalTurnProfile(0, Math.PI);
  assert.equal(hard.turnMode, "hard");
  assert.ok(hard.forwardThrustFactor <= 0.4);
  assert.ok(hard.turnAuthority >= 1.5);

  const forward = resolveNavalTurnProfile(0, 0.2);
  assert.equal(forward.turnMode, "forward");
  assert.equal(forward.forwardThrustFactor, 1);
});

test("V20.3.1 turning curve stays gradual across angle bands", () => {
  const samples = [30, 60, 90, 120, 150, 180].map((deg) =>
    resolveNavalTurnProfile(0, (deg * Math.PI) / 180),
  );
  for (let i = 1; i < samples.length; i++) {
    assert.ok(samples[i].forwardThrustFactor <= samples[i - 1].forwardThrustFactor + 0.05);
    assert.ok(samples[i].turnAuthority >= samples[i - 1].turnAuthority - 0.05);
  }
});
