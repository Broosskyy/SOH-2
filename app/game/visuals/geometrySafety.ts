import type * as THREE from "three";

const MAX_ABS_VERTEX = 50000;

export function isFiniteVertexValue(value: number) {
  return Number.isFinite(value) && Math.abs(value) <= MAX_ABS_VERTEX;
}

export function validateBufferGeometry(
  geometry: THREE.BufferGeometry,
  label = "geometry",
): boolean {
  const position = geometry.getAttribute("position");
  if (!position) return true;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    if (!isFiniteVertexValue(x) || !isFiniteVertexValue(y) || !isFiniteVertexValue(z)) {
      console.warn(`[Abyssal][Geometry] Invalid vertex in ${label}`, { x, y, z, index: i });
      return false;
    }
  }
  return true;
}

export function finalizeBufferGeometry(
  geometry: THREE.BufferGeometry,
  label = "geometry",
) {
  if (!validateBufferGeometry(geometry, label)) {
    geometry.dispose();
    throw new Error(`Invalid geometry generated for ${label}`);
  }
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

export function cloneBufferGeometry(geometry: THREE.BufferGeometry) {
  return geometry.clone();
}
