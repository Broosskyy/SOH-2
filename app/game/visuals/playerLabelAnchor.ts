import * as THREE from "three";
import { PLAYER_SHIP_VISUALS, type ShipVisualDefinition } from "./shipVisuals";
import type { ShipId } from "../../gameData";

const EXCLUDED_ANCESTOR_NAMES = new Set(["HullWaterInteraction", "ShipVisualDebug"]);

export type PlayerLabelAnchorDebug = {
  anchor: { x: number; y: number; z: number };
  shipScreenBottomY: number;
  labelCenterScreenY: number;
  gapCss: number;
  headingDeg: number;
  usedProjectedBounds: boolean;
  hullCornerCount: number;
};

function isHullMesh(object: THREE.Object3D): object is THREE.Mesh {
  if (!(object instanceof THREE.Mesh)) return false;
  if (object.userData.visualFallback) return false;
  if (object.userData.visualEffectType) return false;
  let node: THREE.Object3D | null = object;
  while (node) {
    if (EXCLUDED_ANCESTOR_NAMES.has(node.name)) return false;
    node = node.parent;
  }
  return true;
}

function boxCorners(box: THREE.Box3, target: THREE.Vector3[]) {
  const { min, max } = box;
  target[0].set(min.x, min.y, min.z);
  target[1].set(max.x, min.y, min.z);
  target[2].set(min.x, max.y, min.z);
  target[3].set(max.x, max.y, min.z);
  target[4].set(min.x, min.y, max.z);
  target[5].set(max.x, min.y, max.z);
  target[6].set(min.x, max.y, max.z);
  target[7].set(max.x, max.y, max.z);
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
    new THREE.Vector3(halfForward, definition.waterlineOffset * 0.35, 0),
    new THREE.Vector3(-halfForward, definition.waterlineOffset * 0.35, 0),
  ];
  player.updateMatrixWorld(true);
  for (let i = 0; i < local.length; i++) {
    corners[i].copy(local[i]).applyMatrix4(player.matrixWorld);
  }
  return local.length;
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
    gapCss = 5,
    groundY = 8,
  } = options;

  const cornerPool = Array.from({ length: 8 }, () => new THREE.Vector3());
  const hullWorld: THREE.Vector3[] = [];
  const hullBox = new THREE.Box3();
  let hasHull = false;

  player.updateMatrixWorld(true);
  playerVisualRoot.updateMatrixWorld(true);
  playerVisualRoot.traverse((object) => {
    if (!isHullMesh(object)) return;
    const meshBox = new THREE.Box3().setFromObject(object);
    if (meshBox.isEmpty()) return;
    hullBox.union(meshBox);
    hasHull = true;
  });

  if (hasHull && !hullBox.isEmpty()) {
    boxCorners(hullBox, cornerPool);
    for (const corner of cornerPool) {
      hullWorld.push(corner.clone());
    }
  } else {
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

  const bestScreenX =
    ((best.clone().project(camera).x + 1) * 0.5 * canvasWidth) || canvasWidth * 0.5;
  const labelCenterScreenY = bestScreenY + gapCss + labelTotalHeightCss * 0.5;
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
      shipScreenBottomY: bestScreenY,
      labelCenterScreenY,
      gapCss,
      headingDeg: Math.round((heading * 180) / Math.PI) % 360,
      usedProjectedBounds: hasHull,
      hullCornerCount: hullWorld.length,
    },
  };
}
