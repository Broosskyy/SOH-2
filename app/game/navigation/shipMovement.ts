import { clamp, distance, normalizeAngle } from "../core/math";

export type Point = { x: number; y: number };
export type IslandShape = { x: number; y: number; rx: number; ry: number };

export type NavigationState = {
  ultimateDestination: Point | null;
  detourWaypoint: Point | null;
  stuckTimer: number;
  stuckAnchorX: number;
  stuckAnchorY: number;
};

export type ShipMovementConfig = {
  dt: number;
  player: Point & { angle: number; speed: number };
  destination: Point | null;
  navigation: NavigationState;
  islands: IslandShape[];
  mapWidth: number;
  mapHeight: number;
  shipTurnRate: number;
  shipMaxSpeed: number;
  sailBonus: number;
  surgeMultiplier: number;
  keyboardTurn: number;
  keyboardThrust: number;
};

export type ShipMovementResult = {
  player: Point & { angle: number; speed: number };
  destination: Point | null;
  navigation: NavigationState;
};

const ARRIVAL_RADIUS = 36;
const STUCK_SECONDS = 1.35;
const STUCK_MIN_PROGRESS = 14;
const ISLAND_MARGIN = 0.82;
const ISLAND_SOFT = 0.9;

function insideIsland(
  x: number,
  y: number,
  island: IslandShape,
  margin: number,
) {
  const dx = (x - island.x) / island.rx;
  const dy = (y - island.y) / island.ry;
  return dx * dx + dy * dy < margin * margin;
}

function blockedAt(x: number, y: number, islands: IslandShape[], margin = ISLAND_MARGIN) {
  return islands.some((island) => insideIsland(x, y, island, margin));
}

function segmentBlocked(a: Point, b: Point, islands: IslandShape[]) {
  const len = distance(a, b);
  const steps = Math.max(6, Math.ceil(len / 36));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    if (blockedAt(x, y, islands)) return true;
  }
  return false;
}

function findDetour(from: Point, goal: Point, islands: IslandShape[]): Point | null {
  const blocking = islands.filter((island) => segmentBlocked(from, goal, [island]));
  if (!blocking.length) return null;

  const isle = blocking.reduce((best, island) => {
    const d = distance({ x: island.x, y: island.y }, from);
    return !best || d < distance({ x: best.x, y: best.y }, from) ? island : best;
  }, blocking[0]);

  const perpX = goal.y - from.y;
  const perpY = -(goal.x - from.x);
  const perpLen = Math.hypot(perpX, perpY) || 1;
  const pad = Math.max(isle.rx, isle.ry) * 1.22;

  const candidates: Point[] = [
    { x: isle.x + (perpX / perpLen) * pad, y: isle.y + (perpY / perpLen) * pad },
    { x: isle.x - (perpX / perpLen) * pad, y: isle.y - (perpY / perpLen) * pad },
    {
      x: isle.x + ((from.x - isle.x) / Math.hypot(from.x - isle.x, from.y - isle.y) || 1) * pad,
      y: isle.y + ((from.y - isle.y) / Math.hypot(from.x - isle.x, from.y - isle.y) || 1) * pad,
    },
  ];

  for (const candidate of candidates) {
    if (blockedAt(candidate.x, candidate.y, islands, ISLAND_SOFT)) continue;
    if (
      !segmentBlocked(from, candidate, islands) &&
      !segmentBlocked(candidate, goal, islands)
    ) {
      return candidate;
    }
  }

  const dx = from.x - isle.x;
  const dy = from.y - isle.y;
  const dlen = Math.hypot(dx, dy) || 1;
  return { x: isle.x + (dx / dlen) * pad, y: isle.y + (dy / dlen) * pad };
}

export function createNavigationState(anchor: Point): NavigationState {
  return {
    ultimateDestination: null,
    detourWaypoint: null,
    stuckTimer: 0,
    stuckAnchorX: anchor.x,
    stuckAnchorY: anchor.y,
  };
}

export function planNavigationTo(
  goal: Point,
  from: Point,
  islands: IslandShape[],
): { destination: Point; navigation: NavigationState } {
  const navigation = createNavigationState(from);
  navigation.ultimateDestination = goal;
  if (!segmentBlocked(from, goal, islands)) {
    return { destination: goal, navigation };
  }
  const detour = findDetour(from, goal, islands);
  if (!detour) {
    return { destination: goal, navigation };
  }
  navigation.detourWaypoint = detour;
  return { destination: detour, navigation };
}

export function stepShipMovement(config: ShipMovementConfig): ShipMovementResult {
  const player = { ...config.player };
  const navigation = { ...config.navigation };
  let destination = config.destination;
  let turn = config.keyboardTurn;
  let thrust = config.keyboardThrust;

  if (destination) {
    const d = distance(player, destination);
    const targetAngle = Math.atan2(destination.y - player.y, destination.x - player.x);
    const angleDiff = normalizeAngle(targetAngle - player.angle);
    turn = clamp(angleDiff * 2.4, -1, 1);
    const turningFactor = clamp(1 - Math.abs(angleDiff) / Math.PI * 0.72, 0.28, 1);
    thrust = d > ARRIVAL_RADIUS ? turningFactor : 0;
    if (d < ARRIVAL_RADIUS) {
      if (navigation.detourWaypoint && navigation.ultimateDestination) {
        navigation.detourWaypoint = null;
        destination = navigation.ultimateDestination;
      } else {
        destination = null;
        navigation.ultimateDestination = null;
        player.speed *= 0.5;
      }
    }
  }

  player.angle += turn * config.shipTurnRate * config.dt;
  const desiredSpeed =
    thrust * config.shipMaxSpeed * config.sailBonus * config.surgeMultiplier;
  player.speed += (desiredSpeed - player.speed) * config.dt * 2.55;
  player.speed *= Math.pow(0.991, config.dt * 60);

  const nx = player.x + Math.cos(player.angle) * player.speed * config.dt;
  const ny = player.y + Math.sin(player.angle) * player.speed * config.dt;

  if (!blockedAt(nx, ny, config.islands)) {
    player.x = clamp(nx, 50, config.mapWidth - 50);
    player.y = clamp(ny, 50, config.mapHeight - 50);
    const moved = distance(
      { x: navigation.stuckAnchorX, y: navigation.stuckAnchorY },
      player,
    );
    if (moved > STUCK_MIN_PROGRESS || Math.abs(player.speed) < 8) {
      navigation.stuckTimer = 0;
      navigation.stuckAnchorX = player.x;
      navigation.stuckAnchorY = player.y;
    } else if (destination && Math.abs(player.speed) > 12) {
      navigation.stuckTimer += config.dt;
    }
  } else {
    player.speed *= -0.12;
    navigation.stuckTimer += config.dt;
    if (
      navigation.stuckTimer > STUCK_SECONDS &&
      navigation.ultimateDestination
    ) {
      const replanned = planNavigationTo(
        navigation.ultimateDestination,
        player,
        config.islands,
      );
      destination = replanned.destination;
      navigation.ultimateDestination = replanned.navigation.ultimateDestination;
      navigation.detourWaypoint = replanned.navigation.detourWaypoint;
      navigation.stuckTimer = 0;
      navigation.stuckAnchorX = player.x;
      navigation.stuckAnchorY = player.y;
    } else if (navigation.ultimateDestination && !navigation.detourWaypoint) {
      const detour = findDetour(player, navigation.ultimateDestination, config.islands);
      if (detour) {
        navigation.detourWaypoint = detour;
        destination = detour;
      }
    }
  }

  return { player, destination, navigation };
}
