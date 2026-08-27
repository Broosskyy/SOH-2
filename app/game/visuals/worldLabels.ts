import * as THREE from "three";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const LABEL_CANVAS_DPR_CAP = 2;
const LABEL_RENDER_ORDER = { player: 92, npc: 82, poi: 72 } as const;

export type LabelDebugEntry = {
  type: "player" | "npc" | "poi";
  name: string;
  level?: number;
  hpRatio?: number;
  shieldRatio?: number;
  screenWidth: number;
  screenHeight: number;
  hpBarScreenWidth?: number;
  hpBarScreenHeight?: number;
  shieldBarScreenWidth?: number;
  shieldBarScreenHeight?: number;
};

type TextSprite = {
  sprite: THREE.Sprite;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  dpr: number;
  cssWidth: number;
  cssHeight: number;
};

type StatusBar = {
  group: THREE.Group;
  bg: THREE.Mesh;
  fill: THREE.Mesh;
};

function labelCanvasDpr() {
  return typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, LABEL_CANVAS_DPR_CAP) : 1;
}

function createLabelCanvas(cssWidth: number, cssHeight: number) {
  const dpr = labelCanvasDpr();
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(cssWidth * dpr));
  canvas.height = Math.max(1, Math.round(cssHeight * dpr));
  return { canvas, dpr };
}

function configureLabelTexture(texture: THREE.CanvasTexture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.premultiplyAlpha = false;
  return texture;
}

function beginLabelPaint(ctx: CanvasRenderingContext2D, dpr: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
}

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

/** MID zoom (~0.96) = 1.0 · OUT (~0.55) ≈ 0.82 · IN (~1.38) ≈ 1.08 */
export function labelZoomFactor(zoom: number) {
  const z = clamp(zoom, 0.55, 1.38);
  const mid = 0.96;
  if (z <= mid) {
    const t = (z - 0.55) / (mid - 0.55);
    return 0.82 + t * 0.18;
  }
  const t = (z - mid) / (1.38 - mid);
  return 1 + t * 0.08;
}

export function labelScreenPixels(zoom: number, base: number, min: number, max: number) {
  return clamp(base * labelZoomFactor(zoom), min, max);
}

export function billboardToCamera(object: THREE.Object3D, camera: THREE.Camera) {
  object.quaternion.copy(camera.quaternion);
}

function canvasTextureAspect(canvas: HTMLCanvasElement) {
  return canvas.width / canvas.height;
}

function setTextSpriteScreenSize(
  sprite: THREE.Sprite,
  canvas: HTMLCanvasElement,
  unitsPerPixel: number,
  pixelHeight: number,
) {
  const aspect = canvasTextureAspect(canvas);
  const h = Math.max(1, pixelHeight) * unitsPerPixel;
  sprite.scale.set(h * aspect, h, 1);
}

function createTextSprite(cssWidth: number, cssHeight: number, renderOrder: number): TextSprite {
  const { canvas, dpr } = createLabelCanvas(cssWidth, cssHeight);
  const texture = configureLabelTexture(new THREE.CanvasTexture(canvas));
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.center.set(0.5, 0.5);
  sprite.renderOrder = renderOrder;
  return { sprite, canvas, texture, dpr, cssWidth, cssHeight };
}

function paintOutlinedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fill: string,
  font: string,
  align: CanvasTextAlign = "center",
) {
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.font = font;
  ctx.strokeStyle = "rgba(0,0,0,.88)";
  ctx.lineWidth = 3;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

function measureText(font: string, text: string) {
  if (typeof document === "undefined") return text.length * 8;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * 8;
  ctx.font = font;
  return ctx.measureText(text).width;
}

function paintPlayerIdentity(sprite: TextSprite, playerName: string, level: number) {
  const nameText = playerName.toUpperCase();
  const levelText = `LV ${level}`;
  const nameFont = "700 14px Georgia,serif";
  const levelFont = "600 10px system-ui,sans-serif";
  const nameWidth = Math.ceil(measureText(nameFont, nameText));
  const levelWidth = Math.ceil(measureText(levelFont, levelText));
  const cssWidth = Math.max(80, nameWidth + levelWidth + 16);
  const cssHeight = 18;
  if (cssWidth !== sprite.cssWidth || cssHeight !== sprite.cssHeight) {
    sprite.cssWidth = cssWidth;
    sprite.cssHeight = cssHeight;
    sprite.canvas.width = Math.round(cssWidth * sprite.dpr);
    sprite.canvas.height = Math.round(cssHeight * sprite.dpr);
  }
  const ctx = sprite.canvas.getContext("2d");
  if (!ctx) return;
  beginLabelPaint(ctx, sprite.dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  paintOutlinedText(ctx, nameText, 6, cssHeight * 0.5, "#f4ead8", nameFont, "left");
  if (level > 0) paintOutlinedText(ctx, levelText, cssWidth - 6, cssHeight * 0.5, "rgba(188,210,205,.82)", levelFont, "right");
  sprite.texture.needsUpdate = true;
}

function paintNpcIdentity(sprite: TextSprite, name: string, level: number, selected: boolean) {
  const text = `${name}   LV ${level}`;
  const font = selected ? "700 13px system-ui,sans-serif" : "700 12px system-ui,sans-serif";
  resizeTextSprite(sprite, text, font, selected ? "#fff4dc" : "#f8ead1", 5, 2);
}

function resizeTextSprite(sprite: TextSprite, text: string, font: string, fill: string, padX = 6, padY = 3) {
  const textWidth = Math.ceil(measureText(font, text));
  const cssWidth = Math.max(24, textWidth + padX * 2);
  const cssHeight = Math.max(14, Math.ceil(parseInt(font, 10) || 14) + padY * 2);
  if (cssWidth !== sprite.cssWidth || cssHeight !== sprite.cssHeight) {
    sprite.cssWidth = cssWidth;
    sprite.cssHeight = cssHeight;
    sprite.canvas.width = Math.round(cssWidth * sprite.dpr);
    sprite.canvas.height = Math.round(cssHeight * sprite.dpr);
    sprite.texture.needsUpdate = true;
  }
  const ctx = sprite.canvas.getContext("2d");
  if (!ctx) return;
  beginLabelPaint(ctx, sprite.dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  paintOutlinedText(ctx, text, cssWidth * 0.5, cssHeight * 0.5, fill, font);
  sprite.texture.needsUpdate = true;
}

function createStatusBar(fillColor: number, borderColor: number): StatusBar {
  const group = new THREE.Group();
  const geometry = new THREE.PlaneGeometry(1, 1);
  const bg = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0x02120c, transparent: true, opacity: 0.92, depthTest: false, depthWrite: false }),
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
  const inset = Math.max(0.5, 1 * unitsPerPixel);
  bar.bg.scale.set(width, height, 1);
  const fillWidth = Math.max(inset, (width - inset * 2) * safeRatio);
  bar.fill.scale.set(fillWidth, Math.max(inset, height - inset * 2), 1);
  bar.fill.position.set((-width + fillWidth) * 0.5 + inset, 0, 0.01);
}

function stackLabelParts(
  parts: Array<{ object: THREE.Object3D; pixelHeight: number; visible?: boolean }>,
  unitsPerPixel: number,
  anchorY: number,
  gapPx = 2,
) {
  let cursor = anchorY;
  for (const part of parts) {
    if (part.visible === false) continue;
    const height = Math.max(1, part.pixelHeight) * unitsPerPixel;
    part.object.position.set(0, cursor - height * 0.5, 0);
    cursor -= height + gapPx * unitsPerPixel;
  }
}

function disposeTextSprite(sprite: TextSprite) {
  sprite.texture.dispose();
  sprite.sprite.material.dispose();
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
  guildTag: TextSprite;
  playerName: TextSprite;
  pirateRank: TextSprite;
  levelTag: TextSprite;
  hpBar: StatusBar;
  shieldBar: StatusBar;
  progressRow: THREE.Group;
  extensionRow: THREE.Group;
  lastKey: string;
};

export function createPlayerWorldLabel(): PlayerWorldLabel {
  const group = new THREE.Group();
  group.name = "PlayerWorldLabelGroup";
  const order = LABEL_RENDER_ORDER.player;
  const guildTag = createTextSprite(32, 14, order);
  const playerName = createTextSprite(120, 18, order + 1);
  const pirateRank = createTextSprite(32, 14, order + 2);
  const levelTag = createTextSprite(40, 12, order + 3);
  const hpBar = createStatusBar(0x3cb654, 0xd6bc78);
  const shieldBar = createStatusBar(0x3a8ec8, 0x8ad4e8);
  const progressRow = new THREE.Group();
  progressRow.name = "ProgressStatus";
  progressRow.visible = false;
  const extensionRow = new THREE.Group();
  extensionRow.name = "ExtensionRow";
  extensionRow.visible = false;
  guildTag.sprite.visible = false;
  pirateRank.sprite.visible = false;
  group.add(
    guildTag.sprite,
    playerName.sprite,
    pirateRank.sprite,
    levelTag.sprite,
    hpBar.group,
    shieldBar.group,
    progressRow,
    extensionRow,
  );
  return {
    group,
    guildTag,
    playerName,
    pirateRank,
    levelTag,
    hpBar,
    shieldBar,
    progressRow,
    extensionRow,
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
  const key = `${frame.playerName}|${frame.playerLevel}|${hp}|${shield}|${showShield ? 1 : 0}`;
  if (key !== label.lastKey) {
    label.lastKey = key;
    paintPlayerIdentity(label.playerName, frame.playerName, frame.playerLevel);
  }

  const unitsPerPixel = worldUnitsPerPixel(camera, renderer, worldPosition);
  const z = labelZoomFactor(zoom);
  const namePx = labelScreenPixels(zoom, 14 * z, 12, 16);
  const hpBarW = labelScreenPixels(zoom, 118 * z, 90, 140);
  const hpBarH = labelScreenPixels(zoom, 7 * z, 5, 9);
  const shieldBarW = hpBarW;
  const shieldBarH = labelScreenPixels(zoom, 6 * z, 4, 8);

  setTextSpriteScreenSize(label.playerName.sprite, label.playerName.canvas, unitsPerPixel, namePx);
  label.levelTag.sprite.visible = false;

  setStatusBarSize(label.hpBar, unitsPerPixel, hpBarW, hpBarH, hpRatio);
  if (showShield) {
    setStatusBarSize(label.shieldBar, unitsPerPixel, shieldBarW, shieldBarH, shieldRatio);
    label.shieldBar.group.visible = true;
  } else {
    label.shieldBar.group.visible = false;
  }

  billboardToCamera(label.group, camera);

  const gap = 2;
  const totalPx = namePx + gap + hpBarH + gap + (showShield ? shieldBarH + gap : 0);
  const anchorY = totalPx * unitsPerPixel * 0.5;
  stackLabelParts(
    [
      { object: label.playerName.sprite, pixelHeight: namePx },
      { object: label.hpBar.group, pixelHeight: hpBarH },
      { object: label.shieldBar.group, pixelHeight: shieldBarH, visible: showShield },
    ],
    unitsPerPixel,
    anchorY,
    gap,
  );

  label.group.position.copy(worldPosition);

  const screenHeight = totalPx;
  const screenWidth = Math.max(hpBarW, label.playerName.cssWidth);

  return {
    type: "player",
    name: frame.playerName,
    level: frame.playerLevel,
    hpRatio,
    shieldRatio: showShield ? shieldRatio : undefined,
    screenWidth,
    screenHeight,
    hpBarScreenWidth: hpBarW,
    hpBarScreenHeight: hpBarH,
    shieldBarScreenWidth: showShield ? shieldBarW : undefined,
    shieldBarScreenHeight: showShield ? shieldBarH : undefined,
  };
}

export function disposePlayerWorldLabel(label: PlayerWorldLabel) {
  disposeTextSprite(label.guildTag);
  disposeTextSprite(label.playerName);
  disposeTextSprite(label.pirateRank);
  disposeTextSprite(label.levelTag);
  disposeStatusBar(label.hpBar);
  disposeStatusBar(label.shieldBar);
}

// ─── NPC ──────────────────────────────────────────────────────────────────────

export type NpcWorldLabel = {
  group: THREE.Group;
  nameLine: TextSprite;
  levelTag: TextSprite;
  hpBar: StatusBar;
  shieldBar: StatusBar;
  lastKey: string;
};

export function createNpcWorldLabel(hostile: boolean): NpcWorldLabel {
  const group = new THREE.Group();
  group.name = "NpcWorldLabelGroup";
  const order = LABEL_RENDER_ORDER.npc;
  const nameLine = createTextSprite(100, 16, order);
  const levelTag = createTextSprite(36, 12, order + 1);
  const hpBar = createStatusBar(hostile ? 0xd84c45 : 0x3cb654, hostile ? 0xff9a58 : 0xc1dead);
  const shieldBar = createStatusBar(0x3a8ec8, 0x8ad4e8);
  shieldBar.group.visible = false;
  group.add(nameLine.sprite, levelTag.sprite, hpBar.group, shieldBar.group);
  return { group, nameLine, levelTag, hpBar, shieldBar, lastKey: "" };
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
  const key = `${name}|${level}|${hp}|${selected ? 1 : 0}`;
  if (key !== label.lastKey) {
    label.lastKey = key;
    paintNpcIdentity(label.nameLine, name, level, selected);
  }

  const unitsPerPixel = worldUnitsPerPixel(camera, renderer, worldPosition);
  const z = labelZoomFactor(zoom);
  const namePx = labelScreenPixels(zoom, (selected ? 14 : 13) * z, 11, 16);
  const barW = labelScreenPixels(zoom, (selected ? 100 : 92) * z, 80, 110);
  const barH = labelScreenPixels(zoom, 6 * z, 5, 7);

  setTextSpriteScreenSize(label.nameLine.sprite, label.nameLine.canvas, unitsPerPixel, namePx);
  label.levelTag.sprite.visible = false;
  setStatusBarSize(label.hpBar, unitsPerPixel, barW, barH, ratio);
  billboardToCamera(label.group, camera);

  const gap = 2;
  const totalPx = namePx + gap + barH;
  const anchorY = totalPx * unitsPerPixel * 0.5;
  stackLabelParts(
    [
      { object: label.nameLine.sprite, pixelHeight: namePx },
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
    hpBarScreenWidth: barW,
    hpBarScreenHeight: barH,
  };
}

export function disposeNpcWorldLabel(label: NpcWorldLabel) {
  disposeTextSprite(label.nameLine);
  disposeTextSprite(label.levelTag);
  disposeStatusBar(label.hpBar);
  disposeStatusBar(label.shieldBar);
}

// ─── POI / Island ─────────────────────────────────────────────────────────────

export type PoiWorldLabel = {
  group: THREE.Group;
  nameLine: TextSprite;
  levelTag: TextSprite;
  poiName: string;
  poiLevel: number;
  lastKey: string;
};

export function createPoiWorldLabel(name = "", level = 1): PoiWorldLabel {
  const group = new THREE.Group();
  group.name = "PoiWorldLabelGroup";
  const order = LABEL_RENDER_ORDER.poi;
  const nameLine = createTextSprite(100, 18, order);
  const levelTag = createTextSprite(48, 12, order + 1);
  group.add(nameLine.sprite, levelTag.sprite);
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
    resizeTextSprite(label.nameLine, name.toUpperCase(), "700 14px system-ui,sans-serif", "#e8f6f8", 6, 3);
    resizeTextSprite(label.levelTag, `LV ${level}`, "600 11px system-ui,sans-serif", "rgba(180,220,228,.9)", 4, 2);
  }

  const unitsPerPixel = worldUnitsPerPixel(camera, renderer, worldPosition);
  const z = labelZoomFactor(zoom);
  const namePx = labelScreenPixels(zoom, 15 * z, 13, 17);
  const levelPx = labelScreenPixels(zoom, 11 * z, 10, 13);

  setTextSpriteScreenSize(label.nameLine.sprite, label.nameLine.canvas, unitsPerPixel, namePx);
  setTextSpriteScreenSize(label.levelTag.sprite, label.levelTag.canvas, unitsPerPixel, levelPx);
  billboardToCamera(label.group, camera);

  const gap = 2;
  const totalPx = namePx + gap + levelPx;
  const anchorY = totalPx * unitsPerPixel * 0.5;
  stackLabelParts(
    [
      { object: label.nameLine.sprite, pixelHeight: namePx },
      { object: label.levelTag.sprite, pixelHeight: levelPx },
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
    screenWidth: Math.max(label.nameLine.cssWidth, label.levelTag.cssWidth),
    screenHeight: totalPx,
  };
}

export function disposePoiWorldLabel(label: PoiWorldLabel) {
  disposeTextSprite(label.nameLine);
  disposeTextSprite(label.levelTag);
}
