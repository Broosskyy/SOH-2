import * as THREE from "three";
import { PLAYER_SHIP_VISUALS, type ShipVisualDefinition } from "./shipVisuals";
import type { ShipId } from "../../gameData";

const EXCLUDED_ANCESTOR_NAMES = new Set(["HullWaterInteraction", "ShipVisualDebug"]);
const EXCLUDED_MESH_NAME_RE =
  /sail|mast|rig|rope|cord|line|flag|lantern|light|wake|foam|aura|vfx|debug|collision|helper/i;

export type PlayerLabelAnchorDebug = {
  anchor: { x: number; y: number; z: number };
  shipScreenBottomY: number;
  projectedVisualBottom: number;
  statusVisualTop: number;
  labelCenterScreenY: number;
  gapCss: number;
  visualGapCss: number;
  headingDeg: number;
  usedProjectedBounds: boolean;
  anchorSource: "visualHullSamples" | "fallbackFootprint";
  hullSampleCount: number;
  statusScale: number;
};

function isHullMesh(object: THREE.Object3D): object is THREE.Mesh {
  if (!(object instanceof THREE.Mesh)) return false;
  if (!object.visible) return false;
  if (object.userData.visualFallback) return false;
  if (object.userData.visualEffectType) return false;
  if (EXCLUDED_MESH_NAME_RE.test(object.name)) return false;
  let node: THREE.Object3D | null = object;
  while (node) {
    if (EXCLUDED_ANCESTOR_NAMES.has(node.name)) return false;
    if (EXCLUDED_MESH_NAME_RE.test(node.name)) return false;
    node = node.parent;
  }
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  for (const material of materials) {
    if (!material) continue;
    if ("visible" in material && material.visible === false) return false;
    if ("opacity" in material && typeof material.opacity === "number" && material.opacity < 0.08) {
      return false;
    }
  }
  return true;
}

function projectScreenY(point: THREE.Vector3, camera: THREE.Camera, canvasHeight: number) {
  const projected = point.clone().project(camera);
  return (1 - projected.y) * 0.5 * canvasHeight;
}

function unprojectScreenToGround(
  camera: THREE.PerspectiveCamera,
  screenX: number,
  screenY: number,
  canvasWidth: number,
  canvasHeight: number,
  groundY: number,
) {
  const ndc = new THREE.Vector3(
    (screenX / canvasWidth) * 2 - 1,
    1 - (screenY / canvasHeight) * 2,
    0.5,
  );
  const world = ndc.unproject(camera);
  const origin = camera.position.clone();
  const dir = world.sub(origin).normalize();
  const denom = dir.y;
  if (Math.abs(denom) < 1e-5) return new THREE.Vector3(origin.x, groundY, origin.z);
  const t = (groundY - origin.y) / denom;
  return origin.add(dir.multiplyScalar(Math.max(0, t)));
}

function fallbackFootprintCorners(
  player: THREE.Group,
  definition: ShipVisualDefinition,
  corners: THREE.Vector3[],
) {
  const halfForward = definition.scale * 0.42;
  const halfLateral = definition.scale * 0.22;
  const local = [
    new THREE.Vector3(halfForward, 0, halfLateral),
    new THREE.Vector3(halfForward, 0, -halfLateral),
    new THREE.Vector3(-halfForward, 0, halfLateral),
    new THREE.Vector3(-halfForward, 0, -halfLateral),
    new THREE.Vector3(halfForward * 0.55, definition.waterlineOffset * 0.22, 0),
    new THREE.Vector3(-halfForward * 0.55, definition.waterlineOffset * 0.22, 0),
  ];
  player.updateMatrixWorld(true);
  for (let i = 0; i < local.length; i++) {
    corners[i].copy(local[i]).applyMatrix4(player.matrixWorld);
  }
  return local.length;
}

function collectVisualHullScreenSamples(
  playerVisualRoot: THREE.Object3D,
  camera: THREE.Camera,
  canvasHeight: number,
  out: THREE.Vector3[],
) {
  const samplePoint = new THREE.Vector3();
  const meshBox = new THREE.Box3();

  playerVisualRoot.updateMatrixWorld(true);
  playerVisualRoot.traverse((object) => {
    if (!isHullMesh(object)) return;
    const geometry = object.geometry;
    if (!geometry?.attributes?.position) return;

    meshBox.setFromBufferAttribute(geometry.attributes.position as THREE.BufferAttribute);
    if (meshBox.isEmpty()) return;

    const spanY = meshBox.max.y - meshBox.min.y;
    const hullCeiling = meshBox.min.y + spanY * 0.38;
    const positions = geometry.attributes.position;
    const stride = Math.max(1, Math.floor(positions.count / 48));

    for (let i = 0; i < positions.count; i += stride) {
      samplePoint.fromBufferAttribute(positions, i);
      if (samplePoint.y > hullCeiling) continue;
      samplePoint.applyMatrix4(object.matrixWorld);
      out.push(samplePoint.clone());
    }
  });
}

export function computeRotationSafePlayerLabelAnchor(options: {
  player: THREE.Group;
  playerVisualRoot: THREE.Object3D;
  shipId: ShipId;
  heading: number;
  camera: THREE.PerspectiveCamera;
  canvasWidth: number;
  canvasHeight: number;
  labelTotalHeightCss: number;
  gapCss?: number;
  groundY?: number;
  statusScale?: number;
}): { position: THREE.Vector3; debug: PlayerLabelAnchorDebug } {
  const {
    player,
    playerVisualRoot,
    shipId,
    heading,
    camera,
    canvasWidth,
    canvasHeight,
    labelTotalHeightCss,
    gapCss = 8,
    groundY = 8,
    statusScale = 1,
  } = options;

  const hullWorld: THREE.Vector3[] = [];
  let anchorSource: PlayerLabelAnchorDebug["anchorSource"] = "visualHullSamples";

  collectVisualHullScreenSamples(playerVisualRoot, camera, canvasHeight, hullWorld);

  if (!hullWorld.length) {
    anchorSource = "fallbackFootprint";
    const cornerPool = Array.from({ length: 8 }, () => new THREE.Vector3());
    const definition = PLAYER_SHIP_VISUALS[shipId];
    const count = fallbackFootprintCorners(player, definition, cornerPool);
    for (let i = 0; i < count; i++) hullWorld.push(cornerPool[i].clone());
  }

  let best = hullWorld[0];
  let bestScreenY = projectScreenY(best, camera, canvasHeight);
  for (let i = 1; i < hullWorld.length; i++) {
    const screenY = projectScreenY(hullWorld[i], camera, canvasHeight);
    if (screenY > bestScreenY) {
      bestScreenY = screenY;
      best = hullWorld[i];
    }
  }

  const projectedVisualBottom = bestScreenY;
  const statusVisualTop = projectedVisualBottom + gapCss;
  const bestScreenX =
    ((best.clone().project(camera).x + 1) * 0.5 * canvasWidth) || canvasWidth * 0.5;
  const labelCenterScreenY = statusVisualTop + labelTotalHeightCss * 0.5;
  const position = unprojectScreenToGround(
    camera,
    bestScreenX,
    labelCenterScreenY,
    canvasWidth,
    canvasHeight,
    groundY,
  );

  return {
    position,
    debug: {
      anchor: { x: position.x, y: position.y, z: position.z },
      shipScreenBottomY: projectedVisualBottom,
      projectedVisualBottom,
      statusVisualTop,
      labelCenterScreenY,
      gapCss,
      visualGapCss: statusVisualTop - projectedVisualBottom,
      headingDeg: Math.round((heading * 180) / Math.PI) % 360,
      usedProjectedBounds: anchorSource === "visualHullSamples",
      anchorSource,
      hullSampleCount: hullWorld.length,
      statusScale,
    },
  };
}
