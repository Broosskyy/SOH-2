/**
 * Mirrors G0.5.6 phone landscape zone layout for automated overlap tests.
 * MASTER VISUAL REFERENCE IS RESOLUTION-INDEPENDENT — viewport is layout authority.
 */

const PHONE_SHORT_EDGE_MAX = 520;
const PHONE_MIN_ASPECT = 1.55;

const PHONE = {
  TOP_BAR_H: 0.068,
  PROFILE_W: 0.11,
  STATUS_BAR_W: 0.16,
  MISSION_H: 0.16,
  MINIMAP_D: 0.14,
  ZOOM_W: 0.048,
  ZOOM_H: 0.16,
  CHAT_W: 0.20,
  CHAT_H: 0.18,
  CONSUMABLE_ROW_W: 0.22,
  CONSUMABLE_D: 0.09,
  FIRE_D: 0.15,
  COMBAT_CLUSTER_SCALE: 1.0,
  SAFE_EDGE_RATIO: 0.018,
};

const CONTENT_INSET = {
  PROFILE: { x: 2, y: 2 },
  STATUS: { x: 2, y: 2 },
  NAV: { x: 1, y: 1 },
  MISSION: { x: 2, y: 2 },
  MINIMAP: { x: 0, y: 0 },
  ZOOM: { x: 1, y: 1 },
  CHAT: { x: 2, y: 2 },
  CONSUMABLES: { x: 2, y: 2 },
  COMBAT: { x: 4, y: 4 },
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

function playerSafeRect(viewport) {
  const m = margin(viewport);
  const area = { x: m, y: m, w: viewport.w - m * 2, h: viewport.h - m * 2 };
  const insetX = area.w * 0.19;
  const insetTop = area.h * 0.22;
  const insetBottom = area.h * 0.26;
  return {
    x: area.x + insetX,
    y: area.y + insetTop,
    w: Math.max(40, area.w - insetX * 2),
    h: Math.max(40, area.h - insetTop - insetBottom),
  };
}

export function phoneZoneRects(w, h) {
  const viewport = { w, h };
  const m = margin(viewport);
  const edge = safeEdgeMargin(viewport);
  const area = { x: m, y: m, w: w - m * 2, h: h - m * 2 };
  const topH = clampLength(viewport, PHONE.TOP_BAR_H, "y", 16, 0.09);
  const profileW = clampLength(viewport, PHONE.PROFILE_W, "x", 72, 0.14);
  const statusW = clampLength(viewport, PHONE.STATUS_BAR_W, "x", 88, 0.20);
  const minimapD = touchDiameter(viewport, PHONE.MINIMAP_D, minTouchPx(viewport) * 0.85, 0.16);
  const missionH = clampLength(viewport, PHONE.MISSION_H, "y", 40, 0.20);
  const missionW = profileW;
  const consumableH = touchDiameter(viewport, PHONE.CONSUMABLE_D, minTouchPx(viewport) * 0.8, 0.11);
  const combatSize =
    touchDiameter(viewport, PHONE.FIRE_D, minTouchPx(viewport) * 0.9, 0.18) * PHONE.COMBAT_CLUSTER_SCALE;
  const chatH = clampLength(viewport, PHONE.CHAT_H, "y", 40, 0.22);
  const chatW = clampLength(viewport, PHONE.CHAT_W, "x", 88, 0.24);
  const zoomW = clampLength(viewport, PHONE.ZOOM_W, "x", 26, 0.06);
  const zoomH = clampLength(viewport, PHONE.ZOOM_H, "y", 42, 0.22);
  const consumableRowW = clampLength(viewport, PHONE.CONSUMABLE_ROW_W, "x", 88, 0.24);
  const topY = area.y;
  const currencyH = topH * 0.55;

  return {
    PROFILE: { x: area.x, y: topY, w: profileW, h: topH },
    STATUS: { x: area.x + profileW + m * 1.2, y: topY, w: statusW, h: topH },
    NAV: {
      x: area.x + profileW + statusW + m * 2,
      y: topY,
      w: Math.max(60, area.x + area.w - minimapD - m * 1.2 - (area.x + profileW + statusW + m * 2)),
      h: topH,
    },
    CURRENCY: { x: area.x, y: topY + topH, w: profileW, h: currencyH },
    MISSION: { x: area.x, y: topY + topH + currencyH + m * 0.35, w: missionW, h: missionH },
    MINIMAP: { x: area.x + area.w - minimapD, y: topY, w: minimapD, h: minimapD },
    ZOOM: { x: area.x, y: topY + topH + currencyH + missionH + m * 0.6, w: zoomW, h: zoomH },
    CHAT: {
      x: area.x,
      y: area.y + area.h - chatH - edge - consumableH * 0.2,
      w: chatW,
      h: chatH,
    },
    CONSUMABLES: {
      x: area.x + area.w * 0.5 - consumableRowW * 0.5,
      y: area.y + area.h - consumableH - edge,
      w: consumableRowW,
      h: consumableH,
    },
    COMBAT: {
      x: area.x + area.w - combatSize - edge,
      y: area.y + area.h - combatSize - edge,
      w: combatSize,
      h: combatSize,
    },
    PLAYER_SAFE: playerSafeRect(viewport),
  };
}

export function contentBoundsForZone(zoneKey, zoneRect) {
  const inset = CONTENT_INSET[zoneKey] || { x: 2, y: 2 };
  return {
    x: zoneRect.x + inset.x,
    y: zoneRect.y + inset.y,
    w: Math.max(1, zoneRect.w - inset.x * 2),
    h: Math.max(1, zoneRect.h - inset.y * 2),
  };
}

export function phoneContentBounds(w, h) {
  const zones = phoneZoneRects(w, h);
  const bounds = {};
  for (const key of ["PROFILE", "STATUS", "NAV", "MISSION", "MINIMAP", "ZOOM", "CHAT", "CONSUMABLES", "COMBAT"]) {
    bounds[key] = contentBoundsForZone(key, zones[key]);
  }
  bounds.PLAYER_SAFE = zones.PLAYER_SAFE;
  return bounds;
}

export function overlapRatio(a, b) {
  const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const inter = ix * iy;
  const minArea = Math.min(a.w * a.h, b.w * b.h);
  if (minArea <= 0) return 0;
  return inter / minArea;
}

export function majorOverlap(a, b, threshold = 0.12) {
  return overlapRatio(a, b) > threshold;
}

export function insideViewport(rect, w, h, m = 0) {
  return rect.x >= -m && rect.y >= -m && rect.x + rect.w <= w + m && rect.y + rect.h <= h + m;
}

export function centralObstruction(zones, threshold = 0.15) {
  const safe = zones.PLAYER_SAFE;
  let blocked = 0;
  for (const key of ["PROFILE", "STATUS", "NAV", "MISSION", "CHAT", "CONSUMABLES", "COMBAT"]) {
    if (overlapRatio(zones[key], safe) > threshold) blocked += 1;
  }
  return blocked;
}

export function contentOverlapCount(bounds) {
  const pairs = [
    ["PROFILE", "STATUS"],
    ["PROFILE", "MISSION"],
    ["STATUS", "MISSION"],
    ["STATUS", "NAV"],
    ["NAV", "MINIMAP"],
    ["MISSION", "ZOOM"],
    ["MISSION", "CHAT"],
    ["CHAT", "ZOOM"],
    ["CONSUMABLES", "COMBAT"],
    ["CONSUMABLES", "CHAT"],
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

export function compositionSnapshot(w, h) {
  const zones = phoneZoneRects(w, h);
  const bounds = phoneContentBounds(w, h);
  return {
    viewport: { w, h, profile: detectProfile(w, h) },
    zones,
    contentBounds: bounds,
    overlapCount: contentOverlapCount(bounds),
    playerSafe: bounds.PLAYER_SAFE,
    centralObstruction: centralObstruction(zones),
    consumablesOutsidePlayerSafe: consumablesOutsidePlayerSafe(bounds),
  };
}
