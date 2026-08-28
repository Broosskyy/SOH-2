declare module "troika-three-text" {
  import { Mesh, MeshBasicMaterial } from "three";

  export class Text extends Mesh {
    text: string;
    fontSize: number;
    maxWidth?: number;
    color: string | number;
    outlineWidth: number | string;
    outlineColor: string | number;
    fontWeight: number | string;
    anchorX: "left" | "center" | "right" | number | string;
    anchorY: "top" | "middle" | "bottom" | number | string;
    glyphGeometryDetail: number;
    curveRadius: number;
    renderOrder: number;
    material: MeshBasicMaterial;
    textRenderInfo?: { blockBounds?: [number, number, number, number] };
    sync(callback?: () => void): void;
    dispose(): void;
  }
}
