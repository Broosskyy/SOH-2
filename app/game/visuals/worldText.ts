import * as THREE from "three";
import { Text } from "troika-three-text";

/** Chrome-safe SDF world text — no CanvasTexture. */
export const WORLD_TEXT_ENGINE = "TROIKA_SDF" as const;

export type WorldTextAnchor = "left" | "center" | "right";

export type WorldTextStyle = {
  color?: string | number;
  outlineWidth?: number;
  outlineColor?: string | number;
  fontWeight?: number | string;
  anchorX?: WorldTextAnchor;
  anchorY?: "top" | "middle" | "bottom";
};

export type WorldText = {
  mesh: Text;
  cssFontSize: number;
  renderOrder: number;
};

const DEFAULT_OUTLINE = 0.08;

function configureTextMaterial(text: Text) {
  text.material.depthTest = false;
  text.material.depthWrite = false;
  text.material.transparent = true;
}

export function createWorldText(renderOrder: number, style: WorldTextStyle = {}): WorldText {
  const mesh = new Text();
  mesh.anchorX = style.anchorX ?? "center";
  mesh.anchorY = style.anchorY ?? "middle";
  mesh.color = style.color ?? "#f4ead8";
  mesh.outlineWidth = style.outlineWidth ?? DEFAULT_OUTLINE;
  mesh.outlineColor = style.outlineColor ?? 0x000000;
  mesh.fontWeight = style.fontWeight ?? 600;
  mesh.glyphGeometryDetail = 12;
  mesh.renderOrder = renderOrder;
  mesh.curveRadius = 0;
  configureTextMaterial(mesh);
  return { mesh, cssFontSize: 12, renderOrder };
}

export function updateWorldText(
  worldText: WorldText,
  content: string,
  unitsPerPixel: number,
  cssFontSize: number,
  style?: Partial<WorldTextStyle> & { maxWidthCss?: number },
) {
  const mesh = worldText.mesh;
  mesh.text = content;
  mesh.fontSize = Math.max(0.001, cssFontSize * unitsPerPixel);
  if (style?.maxWidthCss !== undefined) {
    mesh.maxWidth = style.maxWidthCss > 0 ? style.maxWidthCss * unitsPerPixel : undefined;
  }
  if (style?.color !== undefined) mesh.color = style.color;
  if (style?.fontWeight !== undefined) mesh.fontWeight = style.fontWeight;
  if (style?.outlineWidth !== undefined) mesh.outlineWidth = style.outlineWidth;
  if (style?.outlineColor !== undefined) mesh.outlineColor = style.outlineColor;
  mesh.sync();
  worldText.cssFontSize = cssFontSize;
}

export function worldTextBlockWidthCssPx(mesh: Text, unitsPerPixel: number) {
  const bounds = mesh.textRenderInfo?.blockBounds;
  if (!bounds || unitsPerPixel <= 0) return 0;
  return (bounds[2] - bounds[0]) / unitsPerPixel;
}

export function worldTextLineHeightPx(worldText: WorldText) {
  return worldText.cssFontSize * 1.12;
}

export function worldTextWorldHeight(worldText: WorldText, unitsPerPixel: number) {
  return worldTextLineHeightPx(worldText) * unitsPerPixel;
}

export function disposeWorldText(worldText: WorldText) {
  worldText.mesh.dispose();
}
