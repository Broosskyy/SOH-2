/**
 * G0.6 — JavaScript mirror of HudV2Layout + HudV2Metrics for automated tests.
 */

const PHONE_SHORT_EDGE_MAX = 520;
const PHONE_MIN_ASPECT = 1.55;

export function shortEdge(w, h) {
  return Math.min(w, h);
}

export function detectProfile(w, h) {
  const short = shortEdge(w, h);
  const aspect = Math.max(w, h) / Math.max(short, 1);
  if (w > h && aspect >= PHONE_MIN_ASPECT && short <= PHONE_SHORT_EDGE_MAX) {
    return "PHONE_LANDSCAPE";
  }
  return "DESKTOP_TABLET";
}

export function safeEdgeMargin(w, h) {
  const short = shortEdge(w, h);
  const phone = detectProfile(w, h) === "PHONE_LANDSCAPE";
  if (phone) return Math.min(14, Math.max(5, short * 0.014));
  return Math.min(20, Math.max(6, short * 0.014));
}

export function safeRect(w, h) {
  const m = safeEdgeMargin(w, h);
  return { x: m, y: m, w: w - m * 2, h: h - m * 2 };
}

export function solveHudV2Layout(w, h) {
  const phone = detectProfile(w, h) === "PHONE_LANDSCAPE";
  const safe = safeRect(w, h);
  const short = shortEdge(w, h);
  const gap = phone ? 2 : 4;

  const topH = clamp(short * (phone ? 0.095 : 0.078), phone ? 22 : 30, phone ? 48 : 72);
  const mapSize = clamp(topH * (phone ? 1.55 : 1.35), phone ? 34 : 52, safe.h * 0.34);
  const minimap = { x: safe.x + safe.w - mapSize, y: safe.y, w: mapSize, h: mapSize };

  const fsSize = clamp(topH * 0.52, 14, 20);
  const fullscreen = { x: minimap.x - fsSize - gap, y: safe.y, w: fsSize, h: fsSize };

  const profileW = clamp(safe.w * (phone ? 0.105 : 0.13), phone ? 70 : 110, 170);
  const profile = { x: safe.x, y: safe.y, w: profileW, h: topH };

  const statusW = clamp(safe.w * (phone ? 0.152 : 0.17), phone ? 96 : 130, 210);
  const status = { x: profile.x + profile.w + gap, y: safe.y, w: statusW, h: topH };

  const navX = status.x + status.w + gap;
  const navW = Math.max(24, fullscreen.x - gap - navX);
  const nav = { x: navX, y: safe.y, w: navW, h: topH };

  const topBottom = safe.y + topH + gap;
  const missionH = clamp(short * (phone ? 0.125 : 0.11), phone ? 36 : 46, 68);
  const mission = { x: safe.x, y: topBottom, w: profileW, h: missionH };

  const combatSize = clamp(short * (phone ? 0.128 : 0.105), phone ? 40 : 54, 96);
  const combat = { x: safe.x + safe.w - combatSize, y: safe.y + safe.h - combatSize, w: combatSize, h: combatSize };

  const consH = clamp(short * (phone ? 0.082 : 0.07), phone ? 26 : 34, 46);
  const consW = clamp(safe.w * (phone ? 0.21 : 0.18), phone ? 118 : 150, 240);
  const consumables = { x: safe.x + (safe.w - consW) * 0.5, y: safe.y + safe.h - consH, w: consW, h: consH };

  const chatH = clamp(short * (phone ? 0.098 : 0.085), phone ? 28 : 38, 54);
  const chatW = clamp(safe.w * (phone ? 0.19 : 0.16), phone ? 108 : 150, 280);
  const chat = { x: safe.x, y: safe.y + safe.h - chatH, w: chatW, h: chatH };

  const moveSize = clamp(short * (phone ? 0.098 : 0.085), phone ? 32 : 44, 62);
  const movement = { x: safe.x, y: chat.y - moveSize - gap, w: moveSize + 6, h: moveSize };

  const zoomW = clamp(short * (phone ? 0.088 : 0.075), phone ? 28 : 36, 46);
  const zoomTop = mission.y + mission.h + gap;
  const zoomBottom = movement.y - gap;
  const zoomH = Math.max(36, zoomBottom - zoomTop);
  const zoom = { x: safe.x, y: zoomTop, w: zoomW, h: zoomH };

  const insetX = Math.max(profile.x + profile.w, status.x + status.w) + safe.w * (phone ? 0.02 : 0.03);
  const insetTop = topBottom + gap;
  const insetBottom = Math.min(chat.y, movement.y) - gap;
  const insetRight = Math.min(nav.x + nav.w, minimap.x) - gap;
  const centerSafe = {
    x: insetX,
    y: insetTop,
    w: Math.max(40, insetRight - insetX),
    h: Math.max(40, insetBottom - insetTop),
  };

  return {
    safe,
    top_band: { x: safe.x, y: safe.y, w: safe.w, h: topH },
    profile,
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
    profile_name: phone ? "PHONE_LANDSCAPE" : "DESKTOP_TABLET",
  };
}

export function feuerRect(layout) {
  const combat = layout.combat;
  const pad = 2;
  const inner = {
    x: combat.x + pad,
    y: combat.y + pad,
    w: combat.w - pad * 2,
    h: combat.h - pad * 2,
  };
  const fire = Math.max(18, Math.min(inner.w, inner.h) * 0.62);
  return { x: inner.x + inner.w - fire, y: inner.y + inner.h - fire, w: fire, h: fire };
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function rectEnd(r) {
  return { x: r.x + r.w, y: r.y + r.h };
}

function encloses(outer, inner, tol = 0.5) {
  const end = rectEnd(outer);
  const iend = rectEnd(inner);
  return inner.x >= outer.x - tol && inner.y >= outer.y - tol && iend.x <= end.x + tol && iend.y <= end.y + tol;
}

function majorOverlap(a, b, threshold = 0.12) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  if (x2 <= x1 || y2 <= y1) return false;
  const inter = (x2 - x1) * (y2 - y1);
  const minArea = Math.min(a.w * a.h, b.w * b.h);
  return inter / Math.max(minArea, 1) > threshold;
}

const MAJOR_KEYS = [
  "profile", "status", "nav", "minimap",
  "mission", "zoom", "movement", "chat", "consumables", "combat",
];

export function auditHudV2Layout(w, h) {
  const layout = solveHudV2Layout(w, h);
  const safe = layout.safe;
  const overlaps = [];
  const offscreen = [];

  for (const key of MAJOR_KEYS) {
    const rect = layout[key];
    if (!encloses(safe, rect)) offscreen.push(key);
  }

  for (let i = 0; i < MAJOR_KEYS.length; i++) {
    for (let j = i + 1; j < MAJOR_KEYS.length; j++) {
      const a = layout[MAJOR_KEYS[i]];
      const b = layout[MAJOR_KEYS[j]];
      if (majorOverlap(a, b)) overlaps.push(`${MAJOR_KEYS[i]}+${MAJOR_KEYS[j]}`);
    }
  }

  const feuer = feuerRect(layout);
  if (!encloses(safe, feuer)) offscreen.push("feuer");

  const missionBelowTop = layout.mission.y >= layout.top_band.y + layout.top_band.h - 0.5;

  return {
    layout,
    overlapCount: overlaps.length,
    overlaps,
    offscreenCount: offscreen.length,
    offscreen,
    feuerOnscreen: encloses(safe, feuer),
    missionBelowTopBand: missionBelowTop,
  };
}
