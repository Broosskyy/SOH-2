import * as THREE from "three";
import {
  createWorldText,
  disposeWorldText,
  updateWorldText,
  WORLD_TEXT_ENGINE,
  worldTextBlockWidthCssPx,
  worldTextLineHeightPx,
  type WorldText,
} from "./worldText";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const LABEL_RENDER_ORDER = { player: 92, npc: 82, poi: 72 } as const;

/** V20.3 screen-space calibration anchors (MID zoom = 1.0). */
export const PLAYER_LABEL_CALIBRATION = {
  nameBasePx: 10.5,
  nameMinPx: 7.5,
  nameMaxPx: 13,
  nameMaxWidthPx: 92,
  hpBarBaseW: 80,
  hpBarMinW: 62,
  hpBarMaxW: 94,
  hpBarBaseH: 3.75,
  hpBarMinH: 2.75,
  hpBarMaxH: 4.75,
  shieldBarBaseH: 3,
  shieldBarMinH: 2.25,
  shieldBarMaxH: 3.75,
  identityToHpGapPx: 2.5,
  barGapPx: 1.25,
} as const;

export const NPC_LABEL_CALIBRATION = {
  nameBasePx: 9,
  nameMinPx: 6.5,
  nameMaxPx: 10,
  levelBasePx: 7.5,
  levelMinPx: 6.5,
  levelMaxPx: 9,
  nameLevelGapPx: 3.5,
  barBaseW: 62,
  barMinW: 54,
  barMaxW: 70,
  barBaseH: 3.25,
  barMinH: 2.75,
  barMaxH: 3.75,
} as const;

export const POI_LABEL_CALIBRATION = {
  nameBasePx: 9,
  nameMinPx: 6.5,
  nameMaxPx: 10,
  levelBasePx: 7.25,
  levelMinPx: 6.5,
  levelMaxPx: 8.5,
} as const;

export { WORLD_TEXT_ENGINE };

export type LabelDebugEntry = {
  type: "player" | "npc" | "poi";
  name: string;
  level?: number;
  hpRatio?: number;
  shieldRatio?: number;
  screenWidth: number;
  screenHeight: number;
  textScreenWidth?: number;
  textScreenHeight?: number;
  hpBarScreenWidth?: number;
  hpBarScreenHeight?: number;
  shieldBarScreenWidth?: number;
  shieldBarScreenHeight?: number;
  nameCssHeight?: number;
  nameCssWidth?: number;
  hpCssWidth?: number;
  hpCssHeight?: number;
  shieldCssWidth?: number;
  shieldCssHeight?: number;
  totalLabelHeightCss?: number;
  zoomFactor?: number;
};

type StatusBar = {
  group: THREE.Group;
  bg: THREE.Mesh;
  fill: THREE.Mesh;
};

export function worldUnitsPerPixel(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  worldPosition: THREE.Vector3,
) {
  const distance = camera.position.distanceTo(worldPosition);
  const vFov = (camera.fov * Math.PI) / 180;
  const visibleHeight = 2 * Math.tan(vFov / 2) * distance;
  const cssHeight = renderer.domElement.clientHeight || 1;
  const units = visibleHeight / cssHeight;
  return Number.isFinite(units) && units > 0 ? units : 0.01;
}

/** MID zoom (~0.96) = 1.0 · OUT (~0.55) ≈ 0.82–0.85 · IN (~1.38) ≈ 1.03–1.07 */
export function labelZoomFactor(zoom: number) {
  const z = clamp(zoom, 0.55, 1.38);
  const mid = 0.96;
  if (z <= mid) {
    const t = (z - 0.55) / (mid - 0.55);
    return 0.82 + t * 0.18;
  }
  const t = (z - mid) / (1.38 - mid);
  return 1 + t * 0.07;
}

export function labelScreenPixels(zoom: number, base: number, min: number, max: number) {
  return clamp(base * labelZoomFactor(zoom), min, max);
}

export function billboardToCamera(object: THREE.Object3D, camera: THREE.Camera) {
  object.quaternion.copy(camera.quaternion);
}

function createStatusBar(fillColor: number): StatusBar {
  const group = new THREE.Group();
  const geometry = new THREE.PlaneGeometry(1, 1);
  const bg = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0x02120c, transparent: true, opacity: 0.88, depthTest: false, depthWrite: false }),
  );
  const fill = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: fillColor, transparent: true, opacity: 1, depthTest: false, depthWrite: false }),
  );
  fill.position.z = 0.01;
  group.add(bg, fill);
  return { group, bg, fill };
}

function setStatusBarSize(bar: StatusBar, unitsPerPixel: number, pixelWidth: number, pixelHeight: number, ratio: number) {
  const safeRatio = clamp(ratio, 0, 1);
  const width = Math.max(4, pixelWidth) * unitsPerPixel;
  const height = Math.max(2, pixelHeight) * unitsPerPixel;
  const inset = Math.max(0.4, 0.8 * unitsPerPixel);
  bar.bg.scale.set(width, height, 1);
  const fillWidth = Math.max(inset, (width - inset * 2) * safeRatio);
  bar.fill.scale.set(fillWidth, Math.max(inset, height - inset * 2), 1);
  bar.fill.position.set((-width + fillWidth) * 0.5 + inset, 0, 0.01);
}

function stackLabelParts(
  parts: Array<{ object: THREE.Object3D; pixelHeight: number; visible?: boolean; gapAfter?: number }>,
  unitsPerPixel: number,
  anchorY: number,
  gapPx = 1,
) {
  let cursor = anchorY;
  for (const part of parts) {
    if (part.visible === false) continue;
    const height = Math.max(1, part.pixelHeight) * unitsPerPixel;
    part.object.position.set(0, cursor - height * 0.5, 0);
    const gap = part.gapAfter ?? gapPx;
    cursor -= height + gap * unitsPerPixel;
  }
}

function layoutCompactNameLevel(
  nameText: WorldText,
  levelText: WorldText,
  unitsPerPixel: number,
  gapPx: number,
) {
  const nameW = worldTextBlockWidthCssPx(nameText.mesh, unitsPerPixel);
  const levelW = worldTextBlockWidthCssPx(levelText.mesh, unitsPerPixel);
  nameText.mesh.position.set((-(levelW + gapPx) * 0.5) * unitsPerPixel, 0, 0);
  levelText.mesh.position.set(((nameW + gapPx) * 0.5) * unitsPerPixel, 0, 0);
}

function disposeStatusBar(bar: StatusBar) {
  bar.bg.geometry.dispose();
  bar.fill.geometry.dispose();
  (bar.bg.material as THREE.Material).dispose();
  (bar.fill.material as THREE.Material).dispose();
}

// ─── Player ───────────────────────────────────────────────────────────────────

export type PlayerWorldLabel = {
  group: THREE.Group;
  identityRow: THREE.Group;
  guildTag: WorldText;
  playerName: WorldText;
  pirateRank: WorldText;
  hpBar: StatusBar;
  shieldBar: StatusBar;
  progressRow: THREE.Group;
  extensionRow: THREE.Group;
  qualityRow: THREE.Group;
  qualityTag: WorldText;
  lastKey: string;
};

export function createPlayerWorldLabel(): PlayerWorldLabel {
  const group = new THREE.Group();
  group.name = "PlayerWorldLabelGroup";
  const order = LABEL_RENDER_ORDER.player;
  const identityRow = new THREE.Group();
  identityRow.name = "IdentityRow";
  const guildTag = createWorldText(order, { color: "#b8c8c4", fontWeight: 500, anchorX: "right", outlineWidth: 0.07 });
  const playerName = createWorldText(order + 1, { color: "#f4ead8", fontWeight: 550, outlineWidth: 0.08 });
  const pirateRank = createWorldText(order + 2, { color: "#c8d8dc", fontWeight: 500, anchorX: "left", outlineWidth: 0.07 });
  const hpBar = createStatusBar(0x3cb654);
  const shieldBar = createStatusBar(0x3a8ec8);
  const progressRow = new THREE.Group();
  progressRow.name = "ProgressStatus";
  progressRow.visible = false;
  const extensionRow = new THREE.Group();
  extensionRow.name = "ExtensionRow";
  extensionRow.visible = false;
  const qualityRow = new THREE.Group();
  qualityRow.name = "QualityRow";
  qualityRow.visible = false;
  const qualityTag = createWorldText(order + 5, { color: "#9ab4b8", fontWeight: 500, outlineWidth: 0.08 });
  qualityTag.mesh.visible = false;
  guildTag.mesh.visible = false;
  pirateRank.mesh.visible = false;
  identityRow.add(guildTag.mesh, playerName.mesh, pirateRank.mesh);
  qualityRow.add(qualityTag.mesh);
  group.add(identityRow, hpBar.group, shieldBar.group, progressRow, extensionRow, qualityRow);
  return {
    group,
    identityRow,
    guildTag,
    playerName,
    pirateRank,
    hpBar,
    shieldBar,
    progressRow,
    extensionRow,
    qualityRow,
    qualityTag,
    lastKey: "",
  };
}

export type PlayerLabelFrame = {
  playerName: string;
  playerLevel: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
};

export function updatePlayerWorldLabel(
  label: PlayerWorldLabel,
  frame: PlayerLabelFrame,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  zoom: number,
  worldPosition: THREE.Vector3,
): LabelDebugEntry {
  const hp = Math.max(0, Math.round(frame.hp));
  const maxHp = Math.max(1, frame.maxHp);
  const shield = Math.max(0, Math.round(frame.shield));
  const maxShield = Math.max(0, frame.maxShield);
  const hpRatio = clamp(hp / maxHp, 0, 1);
  const shieldRatio = maxShield > 0 ? clamp(shield / maxShield, 0, 1) : 0;
  const showShield = maxShield > 0;
  const key = `${frame.playerName}|${hp}|${shield}|${showShield ? 1 : 0}`;
  if (key !== label.lastKey) {
    label.lastKey = key;
    updateWorldText(label.playerName, frame.playerName.toUpperCase(), 1, label.playerName.cssFontSize);
  }

  const unitsPerPixel = worldUnitsPerPixel(camera, renderer, worldPosition);
  const z = labelZoomFactor(zoom);
  const cal = PLAYER_LABEL_CALIBRATION;
  const namePx = labelScreenPixels(zoom, cal.nameBasePx * z, cal.nameMinPx, cal.nameMaxPx);
  const hpBarW = labelScreenPixels(zoom, cal.hpBarBaseW * z, cal.hpBarMinW, cal.hpBarMaxW);
  const hpBarH = labelScreenPixels(zoom, cal.hpBarBaseH * z, cal.hpBarMinH, cal.hpBarMaxH);
  const shieldBarW = hpBarW;
  const shieldBarH = labelScreenPixels(zoom, cal.shieldBarBaseH * z, cal.shieldBarMinH, cal.shieldBarMaxH);

  updateWorldText(label.playerName, frame.playerName.toUpperCase(), unitsPerPixel, namePx, {
    color: "#f4ead8",
    fontWeight: 550,
    outlineWidth: 0.08,
    maxWidthCss: cal.nameMaxWidthPx,
  });

  setStatusBarSize(label.hpBar, unitsPerPixel, hpBarW, hpBarH, hpRatio);
  if (showShield) {
    setStatusBarSize(label.shieldBar, unitsPerPixel, shieldBarW, shieldBarH, shieldRatio);
    label.shieldBar.group.visible = true;
  } else {
    label.shieldBar.group.visible = false;
  }

  billboardToCamera(label.group, camera);

  const nameLinePx = worldTextLineHeightPx(label.playerName);
  const nameWidthPx = worldTextBlockWidthCssPx(label.playerName.mesh, unitsPerPixel);
  const totalPx =
    nameLinePx +
    cal.identityToHpGapPx +
    hpBarH +
    (showShield ? cal.barGapPx + shieldBarH : 0);
  const anchorY = totalPx * unitsPerPixel * 0.5;
  stackLabelParts(
    [
      { object: label.identityRow, pixelHeight: nameLinePx, gapAfter: cal.identityToHpGapPx },
      { object: label.hpBar.group, pixelHeight: hpBarH, gapAfter: showShield ? cal.barGapPx : 0 },
      { object: label.shieldBar.group, pixelHeight: shieldBarH, visible: showShield },
    ],
    unitsPerPixel,
    anchorY,
    cal.barGapPx,
  );

  return {
    type: "player",
    name: frame.playerName,
    level: frame.playerLevel,
    hpRatio,
    shieldRatio: showShield ? shieldRatio : undefined,
    screenWidth: hpBarW,
    screenHeight: totalPx,
    textScreenWidth: nameWidthPx,
    textScreenHeight: nameLinePx,
    hpBarScreenWidth: hpBarW,
    hpBarScreenHeight: hpBarH,
    shieldBarScreenWidth: showShield ? shieldBarW : undefined,
    shieldBarScreenHeight: showShield ? shieldBarH : undefined,
    nameCssHeight: nameLinePx,
    nameCssWidth: nameWidthPx,
    hpCssWidth: hpBarW,
    hpCssHeight: hpBarH,
    shieldCssWidth: showShield ? shieldBarW : undefined,
    shieldCssHeight: showShield ? shieldBarH : undefined,
    totalLabelHeightCss: totalPx,
    zoomFactor: z,
  };
}

export function disposePlayerWorldLabel(label: PlayerWorldLabel) {
  disposeWorldText(label.guildTag);
  disposeWorldText(label.playerName);
  disposeWorldText(label.pirateRank);
  disposeWorldText(label.qualityTag);
  disposeStatusBar(label.hpBar);
  disposeStatusBar(label.shieldBar);
}

// ─── NPC ──────────────────────────────────────────────────────────────────────

export type NpcWorldLabel = {
  group: THREE.Group;
  identityRow: THREE.Group;
  nameLine: WorldText;
  levelTag: WorldText;
  hpBar: StatusBar;
  shieldBar: StatusBar;
  lastKey: string;
};

export function createNpcWorldLabel(hostile: boolean): NpcWorldLabel {
  const group = new THREE.Group();
  group.name = "NpcWorldLabelGroup";
  const order = LABEL_RENDER_ORDER.npc;
  const identityRow = new THREE.Group();
  identityRow.name = "IdentityRow";
  const nameLine = createWorldText(order, { color: hostile ? "#f0e4d4" : "#dceee0", fontWeight: 500, outlineWidth: 0.07 });
  const levelTag = createWorldText(order + 1, { color: "#a8beb8", fontWeight: 500, outlineWidth: 0.06, anchorX: "center" });
  const hpBar = createStatusBar(hostile ? 0xd84c45 : 0x3cb654);
  const shieldBar = createStatusBar(0x3a8ec8);
  shieldBar.group.visible = false;
  identityRow.add(nameLine.mesh, levelTag.mesh);
  group.add(identityRow, hpBar.group, shieldBar.group);
  return { group, identityRow, nameLine, levelTag, hpBar, shieldBar, lastKey: "" };
}

export function updateNpcWorldLabel(
  label: NpcWorldLabel,
  name: string,
  level: number,
  hp: number,
  maxHp: number,
  selected: boolean,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  zoom: number,
  worldPosition: THREE.Vector3,
): LabelDebugEntry {
  const ratio = clamp(hp / Math.max(1, maxHp), 0, 1);
  const levelText = `LV ${level}`;
  const key = `${name}|${levelText}|${hp}|${selected ? 1 : 0}`;
  if (key !== label.lastKey) {
    label.lastKey = key;
    updateWorldText(label.nameLine, name, 1, label.nameLine.cssFontSize);
    updateWorldText(label.levelTag, levelText, 1, label.levelTag.cssFontSize);
  }

  const unitsPerPixel = worldUnitsPerPixel(camera, renderer, worldPosition);
  const z = labelZoomFactor(zoom);
  const cal = NPC_LABEL_CALIBRATION;
  const namePx = labelScreenPixels(zoom, (selected ? cal.nameBasePx + 0.5 : cal.nameBasePx) * z, cal.nameMinPx, cal.nameMaxPx);
  const levelPx = labelScreenPixels(zoom, cal.levelBasePx * z, cal.levelMinPx, cal.levelMaxPx);
  const barW = labelScreenPixels(zoom, (selected ? cal.barBaseW + 4 : cal.barBaseW) * z, cal.barMinW, cal.barMaxW);
  const barH = labelScreenPixels(zoom, cal.barBaseH * z, cal.barMinH, cal.barMaxH);

  updateWorldText(label.nameLine, name, unitsPerPixel, namePx, {
    color: selected ? "#fff0dc" : "#f0e4d4",
    fontWeight: selected ? 550 : 500,
    outlineWidth: 0.07,
  });
  updateWorldText(label.levelTag, levelText, unitsPerPixel, levelPx, {
    color: "#a8beb8",
    fontWeight: 500,
    outlineWidth: 0.06,
  });
  label.levelTag.mesh.visible = true;
  layoutCompactNameLevel(label.nameLine, label.levelTag, unitsPerPixel, cal.nameLevelGapPx);

  setStatusBarSize(label.hpBar, unitsPerPixel, barW, barH, ratio);
  billboardToCamera(label.group, camera);

  const nameLinePx = worldTextLineHeightPx(label.nameLine);
  const identityWidthPx =
    worldTextBlockWidthCssPx(label.nameLine.mesh, unitsPerPixel) +
    cal.nameLevelGapPx +
    worldTextBlockWidthCssPx(label.levelTag.mesh, unitsPerPixel);
  const gap = 2;
  const totalPx = nameLinePx + gap + barH;
  const anchorY = totalPx * unitsPerPixel * 0.5;
  stackLabelParts(
    [
      { object: label.identityRow, pixelHeight: nameLinePx, gapAfter: gap },
      { object: label.hpBar.group, pixelHeight: barH },
    ],
    unitsPerPixel,
    anchorY,
    gap,
  );

  label.group.position.copy(worldPosition);

  return {
    type: "npc",
    name,
    level,
    hpRatio: ratio,
    screenWidth: barW,
    screenHeight: totalPx,
    textScreenWidth: identityWidthPx,
    textScreenHeight: nameLinePx,
    hpBarScreenWidth: barW,
    hpBarScreenHeight: barH,
    nameCssHeight: nameLinePx,
    nameCssWidth: identityWidthPx,
    hpCssWidth: barW,
    hpCssHeight: barH,
    totalLabelHeightCss: totalPx,
    zoomFactor: z,
  };
}

export function disposeNpcWorldLabel(label: NpcWorldLabel) {
  disposeWorldText(label.nameLine);
  disposeWorldText(label.levelTag);
  disposeStatusBar(label.hpBar);
  disposeStatusBar(label.shieldBar);
}

// ─── POI / Island ─────────────────────────────────────────────────────────────

export type PoiWorldLabel = {
  group: THREE.Group;
  nameLine: WorldText;
  levelTag: WorldText;
  poiName: string;
  poiLevel: number;
  lastKey: string;
};

export function createPoiWorldLabel(name = "", level = 1): PoiWorldLabel {
  const group = new THREE.Group();
  group.name = "PoiWorldLabelGroup";
  const order = LABEL_RENDER_ORDER.poi;
  const nameLine = createWorldText(order, { color: "#d8ecee", fontWeight: 500, outlineWidth: 0.07 });
  const levelTag = createWorldText(order + 1, { color: "#9ab4bc", fontWeight: 450, outlineWidth: 0.06 });
  group.add(nameLine.mesh, levelTag.mesh);
  return { group, nameLine, levelTag, poiName: name, poiLevel: level, lastKey: "" };
}

export function updatePoiWorldLabel(
  label: PoiWorldLabel,
  name: string,
  level: number,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  zoom: number,
  worldPosition: THREE.Vector3,
): LabelDebugEntry {
  const key = `${name}|${level}`;
  if (key !== label.lastKey) {
    label.lastKey = key;
    updateWorldText(label.nameLine, name.toUpperCase(), 1, label.nameLine.cssFontSize);
    updateWorldText(label.levelTag, `LV ${level}`, 1, label.levelTag.cssFontSize);
  }

  const unitsPerPixel = worldUnitsPerPixel(camera, renderer, worldPosition);
  const z = labelZoomFactor(zoom);
  const cal = POI_LABEL_CALIBRATION;
  const namePx = labelScreenPixels(zoom, cal.nameBasePx * z, cal.nameMinPx, cal.nameMaxPx);
  const levelPx = labelScreenPixels(zoom, cal.levelBasePx * z, cal.levelMinPx, cal.levelMaxPx);

  updateWorldText(label.nameLine, name.toUpperCase(), unitsPerPixel, namePx, {
    fontWeight: 500,
    outlineWidth: 0.07,
  });
  updateWorldText(label.levelTag, `LV ${level}`, unitsPerPixel, levelPx, {
    fontWeight: 450,
    outlineWidth: 0.06,
  });

  billboardToCamera(label.group, camera);

  const gap = 1;
  const nameLinePx = worldTextLineHeightPx(label.nameLine);
  const levelLinePx = worldTextLineHeightPx(label.levelTag);
  const nameWidthPx = worldTextBlockWidthCssPx(label.nameLine.mesh, unitsPerPixel);
  const totalPx = nameLinePx + gap + levelLinePx;
  const anchorY = totalPx * unitsPerPixel * 0.5;
  stackLabelParts(
    [
      { object: label.nameLine.mesh, pixelHeight: nameLinePx, gapAfter: gap },
      { object: label.levelTag.mesh, pixelHeight: levelLinePx },
    ],
    unitsPerPixel,
    anchorY,
    gap,
  );

  label.group.position.copy(worldPosition);

  return {
    type: "poi",
    name,
    level,
    screenWidth: Math.max(nameWidthPx, levelPx * 2),
    screenHeight: totalPx,
    textScreenWidth: nameWidthPx,
    textScreenHeight: totalPx,
    nameCssHeight: nameLinePx,
    nameCssWidth: nameWidthPx,
    totalLabelHeightCss: totalPx,
    zoomFactor: z,
  };
}

export function disposePoiWorldLabel(label: PoiWorldLabel) {
  disposeWorldText(label.nameLine);
  disposeWorldText(label.levelTag);
}

/** Count CanvasTexture-based world label sprites — must stay 0. */
export function countCanvasWorldTextSprites(root: THREE.Object3D) {
  let count = 0;
  root.traverse((object) => {
    if (object instanceof THREE.Sprite) {
      const map = (object.material as THREE.SpriteMaterial).map;
      if (map instanceof THREE.CanvasTexture) count += 1;
    }
  });
  return count;
}
