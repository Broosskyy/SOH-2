import { clamp, normalizeAngle } from "../core/math";

export type NavalTurnMode = "forward" | "arc" | "tight" | "hard";

export type NavalTurnProfile = {
  relativeTargetAngleDeg: number;
  turnMode: NavalTurnMode;
  turnAuthority: number;
  forwardThrustFactor: number;
};

/** Relative angle between ship forward and target (0–180°). */
export function relativeTargetAngleDeg(shipAngle: number, targetAngle: number) {
  const diff = Math.abs(normalizeAngle(targetAngle - shipAngle));
  return (diff * 180) / Math.PI;
}

/**
 * V20.3.1 hybrid naval turning — forward-only, tighter hard turns behind ship.
 * Parameters are intentionally grouped for future CLASSIC/RESPONSIVE modes.
 */
export function resolveNavalTurnProfile(
  shipAngle: number,
  targetAngle: number,
): NavalTurnProfile {
  const deg = relativeTargetAngleDeg(shipAngle, targetAngle);

  if (deg <= 45) {
    return {
      relativeTargetAngleDeg: deg,
      turnMode: "forward",
      turnAuthority: 1,
      forwardThrustFactor: 1,
    };
  }
  if (deg <= 100) {
    const t = (deg - 45) / 55;
    return {
      relativeTargetAngleDeg: deg,
      turnMode: "arc",
      turnAuthority: 1 + t * 0.12,
      forwardThrustFactor: 1 - t * 0.22,
    };
  }
  if (deg <= 140) {
    const t = (deg - 100) / 40;
    return {
      relativeTargetAngleDeg: deg,
      turnMode: "tight",
      turnAuthority: 1.12 + t * 0.38,
      forwardThrustFactor: 0.78 - t * 0.38,
    };
  }
  const t = clamp((deg - 140) / 40, 0, 1);
  return {
    relativeTargetAngleDeg: deg,
    turnMode: "hard",
    turnAuthority: 1.5 + t * 0.35,
    forwardThrustFactor: 0.4 - t * 0.2,
  };
}

export function applyNavalTurnInput(
  angleDiff: number,
  profile: NavalTurnProfile,
  baseTurnGain = 2.4,
) {
  const turn = clamp(angleDiff * baseTurnGain * profile.turnAuthority, -1, 1);
  return { turn, thrustScale: clamp(profile.forwardThrustFactor, 0.2, 1) };
}
