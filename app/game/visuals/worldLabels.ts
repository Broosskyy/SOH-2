import * as THREE from "three";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export type LabelDebugEntry = {
  type: "player" | "npc" | "poi";
  name: string;
  level?: number;
  hpRatio?: number;
  textureWidth?: number;
  textureHeight?: number;
  targetPixelWidth: number;
  targetPixelHeight: number;
  projectedScreenWidth: number;
  projectedScreenHeight: number;
};

type TextSprite = {
  sprite: THREE.Sprite;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
};

type HpBar = {
  group: THREE.Group;
  bg: THREE.Mesh;
  fill: THREE.Mesh;
  border: THREE.LineSegments;
};

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

function createLabelCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function createTextSprite(canvasWidth: number, canvasHeight: number, renderOrder: number): TextSprite {
  const canvas = createLabelCanvas(canvasWidth, canvasHeight);
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
  return { sprite, canvas, texture };
}

function createHpBar(fillColor: number, borderColor: number): HpBar {
  const group = new THREE.Group();
  const geometry = new THREE.PlaneGeometry(1, 1);
  const bg = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0x02120c, transparent: true, opacity: 0.92, depthTest: false, depthWrite: false }),
  );
  bg.renderOrder = 81;
  const fill = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: fillColor, transparent: true, opacity: 1, depthTest: false, depthWrite: false }),
  );
  fill.renderOrder = 82;
  fill.position.z = 0.01;
  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: borderColor, transparent: true, depthTest: false, depthWrite: false }),
  );
  border.renderOrder = 83;
  group.add(bg, fill, border);
  return { group, bg, fill, border };
}

function paintCanvas(canvas: HTMLCanvasElement, draw: (ctx: CanvasRenderingContext2D) => void) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw(ctx);
}

function drawOutlinedText(
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
  ctx.lineWidth = 4;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
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

export function zoomLabelPixels(zoom: number, base: number, min: number, max: number) {
  const factor = clamp(0.96 / zoom, 0.82, 1.14);
  return clamp(base * factor, min, max);
}

export function billboardToCamera(object: THREE.Object3D, camera: THREE.Camera) {
  object.quaternion.copy(camera.quaternion);
}

function setTextSpriteScreenSize(
  sprite: THREE.Sprite,
  canvas: HTMLCanvasElement,
  unitsPerPixel: number,
  pixelWidth: number,
  pixelHeight: number,
) {
  const aspect = canvas.width / canvas.height;
  const height = Math.max(1, pixelHeight);
  const width = Math.max(1, pixelWidth || height * aspect);
  sprite.scale.set(width * unitsPerPixel, height * unitsPerPixel, 1);
}

function setHpBarScreenSize(bar: HpBar, unitsPerPixel: number, pixelWidth: number, pixelHeight: number, ratio: number) {
  const safeRatio = clamp(ratio, 0, 1);
  const width = Math.max(8, pixelWidth) * unitsPerPixel;
  const height = Math.max(4, pixelHeight) * unitsPerPixel;
  const inset = 2 * unitsPerPixel;
  bar.bg.scale.set(width, height, 1);
  const fillWidth = Math.max(inset, (width - inset * 2) * safeRatio);
  bar.fill.scale.set(fillWidth, Math.max(inset, height - inset * 2), 1);
  bar.fill.position.set((-width + fillWidth) * 0.5 + inset, 0, 0.01);
  bar.border.scale.set(width, height, 1);
}

function stackLabelParts(
  parts: Array<{ object: THREE.Object3D; pixelHeight: number; visible?: boolean }>,
  unitsPerPixel: number,
  anchorY: number,
) {
  let cursor = anchorY;
  for (const part of parts) {
    if (part.visible === false) continue;
    const height = Math.max(1, part.pixelHeight) * unitsPerPixel;
    part.object.position.set(0, cursor - height * 0.5, 0);
    cursor -= height + 2 * unitsPerPixel;
  }
}

export type PlayerWorldLabel = {
  group: THREE.Group;
  nameLine: TextSprite;
  shipLine: TextSprite;
  hpBar: HpBar;
  debugBox: THREE.LineSegments | null;
  lastKey: string;
};

export function createPlayerWorldLabel(debugBoxes = false): PlayerWorldLabel {
  const group = new THREE.Group();
  group.name = "PlayerWorldLabel";
  const nameLine = createTextSprite(256, 32, 91);
  const shipLine = createTextSprite(256, 24, 92);
  const hpBar = createHpBar(0x3cb654, 0xd6bc78);
  const debugBox = debugBoxes
    ? new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)),
        new THREE.LineBasicMaterial({ color: 0x53f4e5, depthTest: false }),
      )
    : null;
  group.add(nameLine.sprite, shipLine.sprite, hpBar.group);
  if (debugBox) group.add(debugBox);
  return { group, nameLine, shipLine, hpBar, debugBox, lastKey: "" };
}

export function updatePlayerWorldLabel(
  label: PlayerWorldLabel,
  frame: { playerName: string; playerLevel: number; player: { hp: number; maxHp: number } },
  shipDisplayName: string,
  showShipName: boolean,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  zoom: number,
  worldPosition: THREE.Vector3,
): LabelDebugEntry {
  const hp = Math.max(0, Math.round(frame.player.hp));
  const ratio = clamp(hp / Math.max(1, frame.player.maxHp), 0, 1);
  const key = `${frame.playerName}|${frame.playerLevel}|${hp}|${showShipName ? 1 : 0}`;
  if (key !== label.lastKey) {
    label.lastKey = key;
    paintCanvas(label.nameLine.canvas, (ctx) => {
      drawOutlinedText(ctx, frame.playerName.toUpperCase(), 118, 16, "#f4ead8", "700 20px system-ui,sans-serif", "left");
      drawOutlinedText(ctx, `LV ${frame.playerLevel}`, 244, 16, "rgba(188,210,205,.95)", "600 14px system-ui,sans-serif", "right");
    });
    label.nameLine.texture.needsUpdate = true;
    paintCanvas(label.shipLine.canvas, (ctx) => {
      if (!showShipName) return;
      drawOutlinedText(ctx, shipDisplayName.toUpperCase(), 128, 12, "rgba(188,210,205,.78)", "600 12px system-ui,sans-serif");
    });
    label.shipLine.texture.needsUpdate = true;
  }
  label.shipLine.sprite.visible = showShipName;

  const unitsPerPixel = worldUnitsPerPixel(camera, renderer, worldPosition);
  const nameHeight = zoomLabelPixels(zoom, 24, 20, 28);
  const nameWidth = zoomLabelPixels(zoom, 148, 120, 168);
  const shipHeight = zoomLabelPixels(zoom, 16, 13, 19);
  const barWidth = zoomLabelPixels(zoom, 128, 104, 140);
  const barHeight = 9;

  setTextSpriteScreenSize(label.nameLine.sprite, label.nameLine.canvas, unitsPerPixel, nameWidth, nameHeight);
  setTextSpriteScreenSize(label.shipLine.sprite, label.shipLine.canvas, unitsPerPixel, nameWidth * 0.88, shipHeight);
  setHpBarScreenSize(label.hpBar, unitsPerPixel, barWidth, barHeight, ratio);
  billboardToCamera(label.hpBar.group, camera);

  const anchorY = (nameHeight + (showShipName ? shipHeight + 4 : 0) + barHeight + 6) * unitsPerPixel * 0.5;
  stackLabelParts(
    [
      { object: label.nameLine.sprite, pixelHeight: nameHeight },
      { object: label.shipLine.sprite, pixelHeight: shipHeight, visible: showShipName },
      { object: label.hpBar.group, pixelHeight: barHeight },
    ],
    unitsPerPixel,
    anchorY,
  );

  label.group.position.copy(worldPosition);
  if (label.debugBox) {
    const totalHeight = nameHeight + (showShipName ? shipHeight + 4 : 0) + barHeight + 6;
    label.debugBox.scale.set(nameWidth * unitsPerPixel, totalHeight * unitsPerPixel, 1);
    label.debugBox.position.set(0, 0, 0.02);
  }

  return {
    type: "player",
    name: frame.playerName,
    level: frame.playerLevel,
    hpRatio: ratio,
    textureWidth: label.nameLine.canvas.width,
    textureHeight: label.nameLine.canvas.height,
    targetPixelWidth: nameWidth,
    targetPixelHeight: nameHeight,
    projectedScreenWidth: nameWidth,
    projectedScreenHeight: nameHeight,
  };
}

export function disposePlayerWorldLabel(label: PlayerWorldLabel) {
  label.nameLine.texture.dispose();
  label.shipLine.texture.dispose();
  label.nameLine.sprite.material.dispose();
  label.shipLine.sprite.material.dispose();
  label.hpBar.bg.geometry.dispose();
  label.hpBar.fill.geometry.dispose();
  label.hpBar.border.geometry.dispose();
  (label.hpBar.bg.material as THREE.Material).dispose();
  (label.hpBar.fill.material as THREE.Material).dispose();
  (label.hpBar.border.material as THREE.Material).dispose();
}

export type NpcWorldLabel = {
  group: THREE.Group;
  nameLine: TextSprite;
  hpBar: HpBar;
  debugBox: THREE.LineSegments | null;
  lastKey: string;
};

export function createNpcWorldLabel(hostile: boolean, debugBoxes = false): NpcWorldLabel {
  const group = new THREE.Group();
  group.name = "NpcWorldLabel";
  const nameLine = createTextSprite(256, 32, 80);
  const hpBar = createHpBar(hostile ? 0xd84c45 : 0x3cb654, hostile ? 0xff9a58 : 0xc1dead);
  const debugBox = debugBoxes
    ? new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)),
        new THREE.LineBasicMaterial({ color: 0xff765c, depthTest: false }),
      )
    : null;
  group.add(nameLine.sprite, hpBar.group);
  if (debugBox) group.add(debugBox);
  return { group, nameLine, hpBar, debugBox, lastKey: "" };
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
    paintCanvas(label.nameLine.canvas, (ctx) => {
      drawOutlinedText(ctx, name, 118, 16, "#f8ead1", "700 17px system-ui,sans-serif", "left");
      drawOutlinedText(ctx, `LV ${level}`, 244, 16, "rgba(193,222,218,.9)", "600 13px system-ui,sans-serif", "right");
    });
    label.nameLine.texture.needsUpdate = true;
  }

  const unitsPerPixel = worldUnitsPerPixel(camera, renderer, worldPosition);
  const nameHeight = zoomLabelPixels(zoom, selected ? 20 : 18, 15, 22);
  const nameWidth = zoomLabelPixels(zoom, selected ? 112 : 96, 80, 120);
  const barWidth = zoomLabelPixels(zoom, selected ? 104 : 92, 72, 112);
  const barHeight = 7;

  setTextSpriteScreenSize(label.nameLine.sprite, label.nameLine.canvas, unitsPerPixel, nameWidth, nameHeight);
  setHpBarScreenSize(label.hpBar, unitsPerPixel, barWidth, barHeight, ratio);
  billboardToCamera(label.hpBar.group, camera);

  const anchorY = (nameHeight + barHeight + 4) * unitsPerPixel * 0.5;
  stackLabelParts(
    [
      { object: label.nameLine.sprite, pixelHeight: nameHeight },
      { object: label.hpBar.group, pixelHeight: barHeight },
    ],
    unitsPerPixel,
    anchorY,
  );

  label.group.position.copy(worldPosition);
  if (label.debugBox) {
    const totalHeight = nameHeight + barHeight + 4;
    label.debugBox.scale.set(nameWidth * unitsPerPixel, totalHeight * unitsPerPixel, 1);
  }

  return {
    type: "npc",
    name,
    level,
    hpRatio: ratio,
    textureWidth: label.nameLine.canvas.width,
    textureHeight: label.nameLine.canvas.height,
    targetPixelWidth: nameWidth,
    targetPixelHeight: nameHeight,
    projectedScreenWidth: nameWidth,
    projectedScreenHeight: nameHeight,
  };
}

export function disposeNpcWorldLabel(label: NpcWorldLabel) {
  label.nameLine.texture.dispose();
  label.nameLine.sprite.material.dispose();
  label.hpBar.bg.geometry.dispose();
  label.hpBar.fill.geometry.dispose();
  label.hpBar.border.geometry.dispose();
  (label.hpBar.bg.material as THREE.Material).dispose();
  (label.hpBar.fill.material as THREE.Material).dispose();
  (label.hpBar.border.material as THREE.Material).dispose();
}

export type PoiWorldLabel = {
  group: THREE.Group;
  nameLine: TextSprite;
  debugBox: THREE.LineSegments | null;
  lastKey: string;
};

export function createPoiWorldLabel(debugBoxes = false): PoiWorldLabel {
  const group = new THREE.Group();
  group.name = "PoiWorldLabel";
  const nameLine = createTextSprite(256, 48, 70);
  const debugBox = debugBoxes
    ? new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)),
        new THREE.LineBasicMaterial({ color: 0x8ad4e0, depthTest: false }),
      )
    : null;
  group.add(nameLine.sprite);
  if (debugBox) group.add(debugBox);
  return { group, nameLine, debugBox, lastKey: "" };
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
    paintCanvas(label.nameLine.canvas, (ctx) => {
      drawOutlinedText(ctx, name.toUpperCase(), 128, 16, "#e8f6f8", "700 17px system-ui,sans-serif");
      drawOutlinedText(ctx, `LV ${level}`, 128, 34, "rgba(180,220,228,.9)", "600 13px system-ui,sans-serif");
    });
    label.nameLine.texture.needsUpdate = true;
  }

  const unitsPerPixel = worldUnitsPerPixel(camera, renderer, worldPosition);
  const pixelHeight = zoomLabelPixels(zoom, 34, 28, 40);
  const pixelWidth = zoomLabelPixels(zoom, 108, 80, 140);
  setTextSpriteScreenSize(label.nameLine.sprite, label.nameLine.canvas, unitsPerPixel, pixelWidth, pixelHeight);
  label.group.position.copy(worldPosition);
  if (label.debugBox) {
    label.debugBox.scale.set(pixelWidth * unitsPerPixel, pixelHeight * unitsPerPixel, 1);
  }

  return {
    type: "poi",
    name,
    level,
    textureWidth: label.nameLine.canvas.width,
    textureHeight: label.nameLine.canvas.height,
    targetPixelWidth: pixelWidth,
    targetPixelHeight: pixelHeight,
    projectedScreenWidth: pixelWidth,
    projectedScreenHeight: pixelHeight,
  };
}

export function disposePoiWorldLabel(label: PoiWorldLabel) {
  label.nameLine.texture.dispose();
  label.nameLine.sprite.material.dispose();
}
