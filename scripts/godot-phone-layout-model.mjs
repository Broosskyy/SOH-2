/**
 * Mirrors G0.5.5 phone landscape zone layout for automated overlap tests.
 */

const PHONE_SHORT_EDGE_MAX = 520;
const PHONE_MIN_ASPECT = 1.55;

const PHONE = {
  TOP_BAR_H: 0.076,
  PROFILE_W: 0.14,
  STATUS_BAR_W: 0.23,
  MISSION_W: 0.20,
  MISSION_H: 0.24,
  MINIMAP_D: 0.20,
  ZOOM_W: 0.052,
  ZOOM_H: 0.20,
  CHAT_W: 0.22,
  CHAT_H: 0.26,
  CONSUMABLE_ROW_W: 0.24,
  CONSUMABLE_D: 0.11,
  FIRE_D: 0.20,
  COMBAT_CLUSTER_SCALE: 1.32,
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

function centralSafeRect(viewport) {
  const m = margin(viewport);
  const insetX = viewport.w * 0.17;
  const insetTop = viewport.h * 0.20;
  const insetBottom = viewport.h * 0.24;
  return {
    x: m + insetX,
    y: m + insetTop,
    w: Math.max(40, viewport.w - m * 2 - insetX * 2),
    h: Math.max(40, viewport.h - m * 2 - insetTop - insetBottom),
  };
}

export function phoneZoneRects(w, h) {
  const viewport = { w, h };
  const m = margin(viewport);
  const area = { x: m, y: m, w: w - m * 2, h: h - m * 2 };
  const topH = clampLength(viewport, PHONE.TOP_BAR_H, "y", 18, 0.10);
  const profileW = clampLength(viewport, PHONE.PROFILE_W, "x", 84, 0.16);
  const statusW = clampLength(viewport, PHONE.STATUS_BAR_W, "x", 100, 0.26);
  const minimapD = touchDiameter(viewport, PHONE.MINIMAP_D, minTouchPx(viewport), 0.22);
  const missionH = clampLength(viewport, PHONE.MISSION_H, "y", 52, 0.28);
  const consumableH = touchDiameter(viewport, PHONE.CONSUMABLE_D, minTouchPx(viewport), 0.13);
  const combatSize = touchDiameter(viewport, PHONE.FIRE_D, minTouchPx(viewport), 0.22) * PHONE.COMBAT_CLUSTER_SCALE;
  const chatH = clampLength(viewport, PHONE.CHAT_H, "y", 52, 0.30);
  const chatW = clampLength(viewport, PHONE.CHAT_W, "x", 96, 0.26);
  const missionW = clampLength(viewport, PHONE.MISSION_W, "x", 96, 0.24);
  const zoomW = clampLength(viewport, PHONE.ZOOM_W, "x", 30, 0.07);
  const zoomH = clampLength(viewport, PHONE.ZOOM_H, "y", 52, 0.28);
  const consumableRowW = clampLength(viewport, PHONE.CONSUMABLE_ROW_W, "x", 96, 0.26);

  return {
    PROFILE: { x: area.x, y: area.y, w: profileW, h: topH },
    STATUS: { x: area.x + profileW + m * 1.5, y: area.y, w: statusW, h: topH },
    NAV: {
      x: area.x + profileW + statusW + m * 2,
      y: area.y,
      w: Math.max(80, area.x + area.w - minimapD - m * 1.5 - (area.x + profileW + statusW + m * 2)),
      h: topH,
    },
    MISSION: { x: area.x, y: area.y + topH + m * 0.5, w: missionW, h: missionH },
    MINIMAP: { x: area.x + area.w - minimapD, y: area.y, w: minimapD, h: minimapD },
    ZOOM: { x: area.x, y: area.y + topH + missionH + m, w: zoomW, h: zoomH },
    CHAT: {
      x: area.x,
      y: area.y + area.h - chatH - consumableH * 0.35,
      w: chatW,
      h: chatH,
    },
    CONSUMABLES: {
      x: area.x + area.w * 0.5 - consumableRowW * 0.5,
      y: area.y + area.h - consumableH,
      w: consumableRowW,
      h: consumableH,
    },
    COMBAT: {
      x: area.x + area.w - combatSize,
      y: area.y + area.h - combatSize,
      w: combatSize,
      h: combatSize,
    },
    CENTRAL_SAFE: centralSafeRect(viewport),
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

export function majorOverlap(a, b, threshold = 0.18) {
  return overlapRatio(a, b) > threshold;
}

export function insideViewport(rect, w, h, m = 0) {
  return rect.x >= -m && rect.y >= -m && rect.x + rect.w <= w + m && rect.y + rect.h <= h + m;
}

export function centralObstruction(zones, threshold = 0.22) {
  const safe = zones.CENTRAL_SAFE;
  let blocked = 0;
  for (const key of ["PROFILE", "STATUS", "NAV", "MISSION", "CHAT", "CONSUMABLES", "COMBAT"]) {
    if (overlapRatio(zones[key], safe) > threshold) blocked += 1;
  }
  return blocked;
}
