import { detectPlatform } from "../platform/detection";

export type QualityLevel = "LOW" | "MEDIUM" | "HIGH" | "ULTRA";
export type QualityPreference = "AUTO" | QualityLevel;

export type QualityProfile = {
  id: QualityLevel;
  renderScale: number;
  shadows: boolean;
  shadowMapSize: number;
  particles: number;
  waterSegments: number;
  reflections: boolean;
  postProcessing: boolean;
  viewDistance: number;
  lodBias: number;
  effectComplexity: number;
  textureQuality: number;
  /** Scales island/open-ocean prop counts (LOW reduces density). */
  worldPropDensity: number;
};

export const QUALITY_PROFILES: Record<QualityLevel, QualityProfile> = {
  LOW: {
    id: "LOW",
    renderScale: 0.75,
    shadows: false,
    shadowMapSize: 512,
    particles: 0.35,
    waterSegments: 42,
    reflections: false,
    postProcessing: false,
    viewDistance: 0.7,
    lodBias: 1.8,
    effectComplexity: 0.4,
    textureQuality: 0.5,
    worldPropDensity: 0.55,
  },
  MEDIUM: {
    id: "MEDIUM",
    renderScale: 1,
    shadows: true,
    shadowMapSize: 1024,
    particles: 0.65,
    waterSegments: 64,
    reflections: false,
    postProcessing: false,
    viewDistance: 0.85,
    lodBias: 1.25,
    effectComplexity: 0.7,
    textureQuality: 0.75,
    worldPropDensity: 0.82,
  },
  HIGH: {
    id: "HIGH",
    renderScale: 1.25,
    shadows: true,
    shadowMapSize: 1536,
    particles: 1,
    waterSegments: 96,
    reflections: true,
    postProcessing: true,
    viewDistance: 1,
    lodBias: 1,
    effectComplexity: 1,
    textureQuality: 1,
    worldPropDensity: 1,
  },
  ULTRA: {
    id: "ULTRA",
    renderScale: 1.6,
    shadows: true,
    shadowMapSize: 2048,
    particles: 1.35,
    waterSegments: 128,
    reflections: true,
    postProcessing: true,
    viewDistance: 1.2,
    lodBias: 0.7,
    effectComplexity: 1.25,
    textureQuality: 1,
    worldPropDensity: 1.18,
  },
};

const STORAGE_KEY = "abyssal-quality-profile";

export function recommendedQuality(): QualityLevel {
  const platform = detectPlatform();
  if (platform.platform === "web-mobile") {
    if ((platform.deviceMemoryGb ?? 4) <= 4 || platform.logicalCores <= 4)
      return "LOW";
    return "MEDIUM";
  }
  if ((platform.deviceMemoryGb ?? 8) >= 12 && platform.logicalCores >= 8)
    return "ULTRA";
  return "HIGH";
}

export function resolveQuality(preference: QualityPreference): QualityProfile {
  return QUALITY_PROFILES[
    preference === "AUTO" ? recommendedQuality() : preference
  ];
}

export function loadQualityPreference(): QualityPreference {
  if (typeof localStorage === "undefined") return "AUTO";
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "LOW" ||
    value === "MEDIUM" ||
    value === "HIGH" ||
    value === "ULTRA"
    ? value
    : "AUTO";
}

export function saveQualityPreference(preference: QualityPreference) {
  localStorage.setItem(STORAGE_KEY, preference);
}

