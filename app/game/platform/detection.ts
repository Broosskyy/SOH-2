export type RuntimePlatform = "web-desktop" | "web-mobile";

export type PlatformCapabilities = {
  platform: RuntimePlatform;
  touch: boolean;
  coarsePointer: boolean;
  reducedMotion: boolean;
  deviceMemoryGb: number | null;
  logicalCores: number;
};

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

export function detectPlatform(): PlatformCapabilities {
  if (typeof window === "undefined") {
    return {
      platform: "web-desktop",
      touch: false,
      coarsePointer: false,
      reducedMotion: false,
      deviceMemoryGb: null,
      logicalCores: 4,
    };
  }

  const touch = navigator.maxTouchPoints > 0;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  return {
    platform: touch || coarsePointer ? "web-mobile" : "web-desktop",
    touch,
    coarsePointer,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    deviceMemoryGb: (navigator as NavigatorWithMemory).deviceMemory ?? null,
    logicalCores: navigator.hardwareConcurrency || 4,
  };
}

