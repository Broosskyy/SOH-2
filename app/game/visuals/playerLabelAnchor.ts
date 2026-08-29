import * as THREE from "three";
import { PLAYER_SHIP_VISUALS } from "./shipVisuals";
import type { ShipId } from "../../gameData";
import {
  buildDeterministicFootprintLocal,
  interpolateAnchorProfile,
  normalizeHeadingDeg,
  resolveAnchorGapCss,
} from "./playerStatusAnchorProfile";

export type PlayerLabelAnchorDebug = {
  anchor: { x: number; y: number; z: number };
  shipScreenBottomY: number;
  projectedVisualBottom: number;
  statusVisualTop: number;
  statusTopCss: number;
  labelCenterScreenY: number;
  gapCss: number;
  visualGapCss: number;
  headingDeg: number;
  anchorSource: "headingProfile";
  anchorProfileSector: number;
  anchorInterpolation: number;
  hullSampleCount: number;
  statusScale: number;
};

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

export function computeRotationSafePlayerLabelAnchor(options: {
  player: THREE.Group;
  shipId: ShipId;
  heading: number;
  camera: THREE.PerspectiveCamera;
  canvasWidth: number;
  canvasHeight: number;
  labelTotalHeightCss: number;
  zoom?: number;
  groundY?: number;
  statusScale?: number;
}): { position: THREE.Vector3; debug: PlayerLabelAnchorDebug } {
  const {
    player,
    shipId,
    heading,
    camera,
    canvasWidth,
    canvasHeight,
    labelTotalHeightCss,
    zoom = 0.96,
    groundY = 8,
    statusScale = 1,
  } = options;

  const definition = PLAYER_SHIP_VISUALS[shipId];
  const profile = interpolateAnchorProfile(heading);
  const gapCss = resolveAnchorGapCss(zoom);
  const localPoints = buildDeterministicFootprintLocal(definition, profile);
  const worldPoint = new THREE.Vector3();

  player.updateMatrixWorld(true);
  let bestScreenY = Number.NEGATIVE_INFINITY;
  let bestScreenX = canvasWidth * 0.5;
  for (const local of localPoints) {
    worldPoint.set(local.x, local.y, local.z).applyMatrix4(player.matrixWorld);
    const screenY = projectScreenY(worldPoint, camera, canvasHeight);
    if (screenY > bestScreenY) {
      bestScreenY = screenY;
      bestScreenX = ((worldPoint.clone().project(camera).x + 1) * 0.5 * canvasWidth) || bestScreenX;
    }
  }

  const projectedVisualBottom = bestScreenY - profile.bottomLiftCss;
  const statusVisualTop = projectedVisualBottom + gapCss;
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
      statusTopCss: statusVisualTop,
      labelCenterScreenY,
      gapCss,
      visualGapCss: statusVisualTop - projectedVisualBottom,
      headingDeg: Math.round(normalizeHeadingDeg(heading)),
      anchorSource: "headingProfile",
      anchorProfileSector: profile.sectorStart,
      anchorInterpolation: profile.interpolationT,
      hullSampleCount: localPoints.length,
      statusScale,
    },
  };
}
