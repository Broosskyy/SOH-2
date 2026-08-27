export type CameraPanSpeed = "slow" | "normal" | "fast";
export type ZoomSensitivity = "low" | "normal" | "high";

export const CAMERA_PAN_SPEEDS: Record<CameraPanSpeed, number> = {
  slow: 520,
  normal: 760,
  fast: 1080,
};

export const ZOOM_SENSITIVITY: Record<ZoomSensitivity, number> = {
  low: 0.82,
  normal: 1,
  high: 1.22,
};

const CAMERA_PAN_KEY = "abyssal-camera-pan-speed";
const ZOOM_SENS_KEY = "abyssal-zoom-sensitivity";

export function resolveCameraPanSpeed(preference: CameraPanSpeed) {
  return CAMERA_PAN_SPEEDS[preference] ?? CAMERA_PAN_SPEEDS.normal;
}

export function resolveZoomSensitivity(preference: ZoomSensitivity) {
  return ZOOM_SENSITIVITY[preference] ?? ZOOM_SENSITIVITY.normal;
}

export function loadCameraPanSpeed(): CameraPanSpeed {
  if (typeof localStorage === "undefined") return "normal";
  const value = localStorage.getItem(CAMERA_PAN_KEY);
  return value === "slow" || value === "fast" ? value : "normal";
}

export function saveCameraPanSpeed(value: CameraPanSpeed) {
  if (typeof localStorage !== "undefined") localStorage.setItem(CAMERA_PAN_KEY, value);
}

export function loadZoomSensitivity(): ZoomSensitivity {
  if (typeof localStorage === "undefined") return "normal";
  const value = localStorage.getItem(ZOOM_SENS_KEY);
  return value === "low" || value === "high" ? value : "normal";
}

export function saveZoomSensitivity(value: ZoomSensitivity) {
  if (typeof localStorage !== "undefined") localStorage.setItem(ZOOM_SENS_KEY, value);
}
