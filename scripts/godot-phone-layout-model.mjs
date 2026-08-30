/**
 * Mirrors G0.5.7 ResponsiveHudLayoutSolver for automated overlap tests.
 */

const PHONE_SHORT_EDGE_MAX = 520;
const PHONE_MIN_ASPECT = 1.55;

const PHONE = {
  SAFE_EDGE_RATIO: 0.018,
};

export function detectProfile(w, h) {
  const short = Math.min(w, h);
  const long = Math.max(w, h);
  const aspect = long / Math.max(short, 1);
  const wide = w > h && aspect >= PHONE_MIN_ASPECT;
  if (wide && short <= PHONE_SHORT_EDGE_MAX) return "PHONE_LANDSCAPE";
  return "DESKTOP_TABLET";
}

function shortEdge(viewport) {
  return Math.min(viewport.w, viewport.h);
}

function margin(viewport) {
  return Math.min(Math.max(shortEdge(viewport) * 0.014, 6), 20);
}

function safeEdgeMargin(viewport) {
  if (detectProfile(viewport.w, viewport.h) === "PHONE_LANDSCAPE") {
    return Math.min(Math.max(shortEdge(viewport) * PHONE.SAFE_EDGE_RATIO, 5), 14);
  }
  return margin(viewport);
}

function safeRect(viewport) {
  const m = margin(viewport);
  return { x: m, y: m, w: viewport.w - m * 2, h: viewport.h - m * 2 };
}

function clampLength(viewport, ratio, axis, minPx, maxRatio) {
  const base = axis === "x" ? viewport.w * ratio : viewport.h * ratio;
  const cap = (axis === "x" ? viewport.w : viewport.h) * maxRatio;
  const floorPx = minPx > 0 ? minPx : margin(viewport);
  return Math.min(Math.max(base, floorPx), cap);
}

function touchDiameter(viewport, ratio, minPx, maxRatio) {
  return clampLength(viewport, ratio, "y", minPx, maxRatio);
}

function minTouchPx(viewport) {
  if (detectProfile(viewport.w, viewport.h) === "PHONE_LANDSCAPE") {
    return Math.min(Math.max(shortEdge(viewport) * 0.10, 26), 34);
  }
  return Math.max(48, shortEdge(viewport) * 0.044);
}

export function majorOverlap(a, b, threshold = 0.12) {
  const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const inter = ix * iy;
  const minArea = Math.min(a.w * a.h, b.w * b.h);
  if (minArea <= 0) return false;
  return inter / minArea > threshold;
}

function centerSafeFromRegions(safe, identity, mission, zoom, movement, chat, consumables, combat, minimap, status, nav) {
  const pad = margin({ w: safe.w, h: safe.h });
  const left = Math.max(identity.x + identity.w, mission.x + mission.w, zoom.x + zoom.w, movement.x + movement.w) + pad * 0.5;
  const right = Math.min(combat.x, minimap.x, nav.x) - pad * 0.5;
  const top = Math.max(identity.y + identity.h, status.y + status.h, nav.y + nav.h, minimap.y + minimap.h) + pad * 0.35;
  const bottom = Math.min(consumables.y, combat.y, chat.y) - pad * 0.35;
  return { x: left, y: top, w: Math.max(24, right - left), h: Math.max(24, bottom - top) };
}

export function solvePhoneLayout(w, h) {
  const viewport = { w, h };
  const safe = safeRect(viewport);
  const m = margin(viewport);
  const edge = safeEdgeMargin(viewport);
  const gap = m * 0.45;

  const topRowH = clampLength(viewport, 0.062, "y", 16, 0.085);
  const currencyH = clampLength(viewport, 0.034, "y", 10, 0.06);
  const identityW = clampLength(viewport, 0.105, "x", 68, 0.14);
  const identityH = topRowH + currencyH + gap * 0.5;

  const statusW = clampLength(viewport, 0.152, "x", 90, 0.19);
  const minimapD = touchDiameter(viewport, 0.125, minTouchPx(viewport) * 0.8, 0.14);
  const fsD = touchDiameter(viewport, 0.032, 18, 0.05);

  const identity = { x: safe.x, y: safe.y, w: identityW, h: identityH };
  const status = { x: identity.x + identity.w + gap, y: safe.y, w: statusW, h: topRowH };
  const minimap = { x: safe.x + safe.w - minimapD, y: safe.y, w: minimapD, h: minimapD };
  const fullscreen = { x: minimap.x - fsD - gap * 0.5, y: safe.y, w: fsD, h: fsD };

  const navLeft = status.x + status.w + gap;
  const navRight = fullscreen.x - gap;
  const nav = { x: navLeft, y: safe.y, w: Math.max(36, navRight - navLeft), h: topRowH };

  const topBandBottom = identity.y + identity.h + gap;
  const missionH = clampLength(viewport, 0.13, "y", 34, 0.18);
  const mission = { x: safe.x, y: topBandBottom, w: identityW, h: missionH };

  const zoomW = clampLength(viewport, 0.044, "x", 24, 0.055);
  const zoomH = clampLength(viewport, 0.12, "y", 34, 0.18);
  const zoom = { x: safe.x, y: mission.y + mission.h + gap, w: zoomW, h: zoomH };

  const movementH = clampLength(viewport, 0.10, "y", 28, 0.14);
  const movement = { x: safe.x, y: zoom.y + zoom.h + gap, w: zoomW * 1.15, h: movementH };

  const consumableH = touchDiameter(viewport, 0.085, minTouchPx(viewport) * 0.75, 0.10);
  const consumableW = clampLength(viewport, 0.21, "x", 84, 0.24);
  const combatSize = touchDiameter(viewport, 0.13, minTouchPx(viewport) * 0.85, 0.16);

  const chatH = clampLength(viewport, 0.10, "y", 30, 0.16);
  const chatW = clampLength(viewport, 0.19, "x", 80, 0.22);
  const bottomY = safe.y + safe.h - edge;

  const consumables = {
    x: safe.x + safe.w * 0.5 - consumableW * 0.5,
    y: bottomY - consumableH,
    w: consumableW,
    h: consumableH,
  };
  const combat = { x: safe.x + safe.w - combatSize - edge, y: bottomY - combatSize, w: combatSize, h: combatSize };

  const chatY = Math.max(movement.y + movement.h + gap, bottomY - chatH);
  const chat = { x: safe.x, y: chatY, w: chatW, h: Math.min(chatH, bottomY - chatY) };

  const centerSafe = centerSafeFromRegions(safe, identity, mission, zoom, movement, chat, consumables, combat, minimap, status, nav);

  return {
    safe,
    identity,
    status,
    nav,
    minimap,
    fullscreen,
    mission,
    zoom,
    movement,
    chat,
    consumables,
    combat,
    center_safe: centerSafe,
  };
}

export function phoneZoneRects(w, h) {
  const s = solvePhoneLayout(w, h);
  return {
    PROFILE: s.identity,
    IDENTITY: s.identity,
    STATUS: s.status,
    NAV: s.nav,
    CURRENCY: s.identity,
    MISSION: s.mission,
    MINIMAP: s.minimap,
    FULLSCREEN: s.fullscreen,
    ZOOM: s.zoom,
    MOVEMENT: s.movement,
    CHAT: s.chat,
    CONSUMABLES: s.consumables,
    COMBAT: s.combat,
    PLAYER_SAFE: s.center_safe,
    CENTER_SAFE: s.center_safe,
  };
}

export function regionOverlapCount(solution) {
  const keys = ["identity", "status", "nav", "minimap", "mission", "zoom", "movement", "chat", "consumables", "combat"];
  let count = 0;
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      if (majorOverlap(solution[keys[i]], solution[keys[j]])) count += 1;
    }
  }
  return count;
}

export function feuerOnscreen(solution, viewport) {
  const edge = safeEdgeMargin(viewport);
  const safe = solution.safe;
  const combat = solution.combat;
  return (
    combat.x >= safe.x - 1 &&
    combat.y >= safe.y - 1 &&
    combat.x + combat.w <= safe.x + safe.w + edge * 0.25 &&
    combat.y + combat.h <= safe.y + safe.h + edge * 0.25
  );
}

export function insideSafe(rect, safe, edge = 0) {
  return (
    rect.x >= safe.x - 1 &&
    rect.y >= safe.y - 1 &&
    rect.x + rect.w <= safe.x + safe.w + edge * 0.25 &&
    rect.y + rect.h <= safe.y + safe.h + edge * 0.25
  );
}

export function validateSolution(w, h) {
  const viewport = { w, h };
  const solution = solvePhoneLayout(w, h);
  const edge = safeEdgeMargin(viewport);
  const keys = ["identity", "status", "nav", "minimap", "mission", "zoom", "movement", "chat", "consumables", "combat"];
  const offscreen = [];
  for (const key of keys) {
    if (!insideSafe(solution[key], solution.safe, edge)) offscreen.push(key);
  }
  return {
    solution,
    overlaps: regionOverlapCount(solution),
    offscreen,
    feuerOnscreen: feuerOnscreen(solution, viewport),
    missionBelowTopBand: solution.mission.y >= solution.identity.y + solution.identity.h,
  };
}

export function overlapRatio(a, b) {
  const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const inter = ix * iy;
  const minArea = Math.min(a.w * a.h, b.w * b.h);
  if (minArea <= 0) return 0;
  return inter / minArea;
}

export function insideViewport(rect, w, h, m = 0) {
  return rect.x >= -m && rect.y >= -m && rect.x + rect.w <= w + m && rect.y + rect.h <= h + m;
}

export function phoneContentBounds(w, h) {
  const zones = phoneZoneRects(w, h);
  const bounds = {};
  for (const key of ["PROFILE", "STATUS", "NAV", "MISSION", "MINIMAP", "ZOOM", "MOVEMENT", "CHAT", "CONSUMABLES", "COMBAT"]) {
    bounds[key] = { ...zones[key] };
  }
  bounds.PLAYER_SAFE = zones.CENTER_SAFE;
  return bounds;
}

export function contentOverlapCount(bounds) {
  const pairs = [
    ["PROFILE", "STATUS"],
    ["PROFILE", "MISSION"],
    ["STATUS", "NAV"],
    ["NAV", "MINIMAP"],
    ["MISSION", "ZOOM"],
    ["ZOOM", "MOVEMENT"],
    ["MOVEMENT", "CHAT"],
    ["CHAT", "CONSUMABLES"],
    ["CONSUMABLES", "COMBAT"],
    ["COMBAT", "MINIMAP"],
  ];
  let count = 0;
  for (const [a, b] of pairs) {
    if (majorOverlap(bounds[a], bounds[b])) count += 1;
  }
  return count;
}

export function consumablesOutsidePlayerSafe(bounds) {
  return overlapRatio(bounds.CONSUMABLES, bounds.PLAYER_SAFE) <= 0.08;
}

export function centralObstruction(zones, threshold = 0.15) {
  const safe = zones.PLAYER_SAFE;
  let blocked = 0;
  for (const key of ["PROFILE", "STATUS", "NAV", "MISSION", "CHAT", "CONSUMABLES", "COMBAT"]) {
    if (overlapRatio(zones[key], safe) > threshold) blocked += 1;
  }
  return blocked;
}

export function compositionSnapshot(w, h) {
  const validation = validateSolution(w, h);
  const zones = phoneZoneRects(w, h);
  const bounds = phoneContentBounds(w, h);
  return {
    viewport: { w, h, profile: detectProfile(w, h) },
    zones,
    solution: validation.solution,
    contentBounds: bounds,
    regionOverlapCount: validation.overlaps,
    overlapCount: contentOverlapCount(bounds),
    offscreen: validation.offscreen,
    feuerOnscreen: validation.feuerOnscreen,
    missionBelowTopBand: validation.missionBelowTopBand,
    playerSafe: bounds.PLAYER_SAFE,
    centralObstruction: centralObstruction(zones),
    consumablesOutsidePlayerSafe: consumablesOutsidePlayerSafe(bounds),
  };
}
