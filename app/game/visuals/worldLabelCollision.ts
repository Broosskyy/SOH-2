import * as THREE from "three";

export type ScreenRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LabelCollisionEntry = {
  id: string;
  priority: number;
  rect: ScreenRect;
  screenOffsetY: number;
  hidden: boolean;
  reduced: boolean;
};

const MAX_STACK_PX = 20;

function rectsOverlap(a: ScreenRect, b: ScreenRect, pad = 2) {
  return !(
    a.x + a.width + pad < b.x ||
    b.x + b.width + pad < a.x ||
    a.y + a.height + pad < b.y ||
    b.y + b.height + pad < a.y
  );
}

export function projectWorldLabelRect(
  worldPosition: THREE.Vector3,
  camera: THREE.PerspectiveCamera,
  canvasWidth: number,
  canvasHeight: number,
  widthCss: number,
  heightCss: number,
  screenOffsetY = 0,
): ScreenRect {
  const center = worldPosition.clone();
  center.project(camera);
  const cx = ((center.x + 1) * 0.5) * canvasWidth;
  const cy = (1 - center.y) * 0.5 * canvasHeight + screenOffsetY;
  return {
    x: cx - widthCss * 0.5,
    y: cy - heightCss * 0.5,
    width: widthCss,
    height: heightCss,
  };
}

/**
 * Resolve NPC/POI label stacking in screen space.
 * Higher priority wins; lower priority labels stack down or hide.
 */
export function resolveWorldLabelCollisions(
  entries: Array<Omit<LabelCollisionEntry, "screenOffsetY" | "hidden" | "reduced">>,
): LabelCollisionEntry[] {
  const sorted = [...entries].sort((a, b) => b.priority - a.priority);
  const placed: LabelCollisionEntry[] = [];

  for (const entry of sorted) {
    let screenOffsetY = 0;
    let hidden = false;
    let reduced = false;
    const baseRect = entry.rect;

    for (let attempt = 0; attempt < 4; attempt++) {
      const candidate: ScreenRect = {
        ...baseRect,
        y: baseRect.y + screenOffsetY,
      };
      const collision = placed.some((p) => !p.hidden && rectsOverlap(candidate, {
        ...p.rect,
        y: p.rect.y + p.screenOffsetY,
      }));
      if (!collision) {
        placed.push({ ...entry, screenOffsetY, hidden, reduced });
        break;
      }
      screenOffsetY += 6;
      if (screenOffsetY > MAX_STACK_PX) {
        if (entry.priority < 80) {
          hidden = true;
          reduced = true;
        } else {
          reduced = entry.priority < 100;
        }
        placed.push({ ...entry, screenOffsetY: Math.min(screenOffsetY, MAX_STACK_PX), hidden, reduced });
        break;
      }
    }
  }

  return placed;
}

export function screenOffsetToWorldDelta(
  camera: THREE.PerspectiveCamera,
  origin: THREE.Vector3,
  screenOffsetY: number,
  canvasWidth: number,
  canvasHeight: number,
  groundY = 8,
) {
  if (Math.abs(screenOffsetY) < 0.5) return new THREE.Vector3(0, 0, 0);
  const base = origin.clone().project(camera);
  const sx = ((base.x + 1) * 0.5) * canvasWidth;
  const sy = (1 - base.y) * 0.5 * canvasHeight;
  const ndcA = new THREE.Vector3((sx / canvasWidth) * 2 - 1, 1 - (sy / canvasHeight) * 2, 0.5);
  const ndcB = new THREE.Vector3((sx / canvasWidth) * 2 - 1, 1 - ((sy + screenOffsetY) / canvasHeight) * 2, 0.5);
  const worldA = ndcA.unproject(camera);
  const worldB = ndcB.unproject(camera);
  const dirA = worldA.sub(camera.position).normalize();
  const dirB = worldB.sub(camera.position).normalize();
  const tA = (groundY - camera.position.y) / dirA.y;
  const tB = (groundY - camera.position.y) / dirB.y;
  const groundA = camera.position.clone().add(dirA.multiplyScalar(Math.max(0, tA)));
  const groundB = camera.position.clone().add(dirB.multiplyScalar(Math.max(0, tB)));
  return groundB.sub(groundA);
}
