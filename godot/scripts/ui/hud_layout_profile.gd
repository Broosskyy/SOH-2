class_name HudLayoutProfile
extends RefCounted

## Normalized HUD measurements derived from Master reference ratios.
## G0.5.5 — phone landscape uses separate occupancy constants.

enum Profile { DESKTOP, MOBILE_LANDSCAPE, MOBILE_PORTRAIT }

const BUILD_LABEL := "G0.5.5-PHONE-COMPOSITION"
const GIT_SHA := "d4b76d5"

const RATIO_TOP_BAR_H := 0.072
const RATIO_PROFILE_W := 0.12
const RATIO_STATUS_BAR_W := 0.14
const RATIO_MISSION_W := 0.11
const RATIO_MINIMAP_D := 0.17
const RATIO_ZOOM_W := 0.042
const RATIO_CAMERA_D := 0.15
const RATIO_CHAT_W := 0.18
const RATIO_CONSUMABLE_ROW_W := 0.16
const RATIO_FIRE_D := 0.11
const RATIO_ABILITY_D := 0.058
const RATIO_FLOATING_PLAYER_W := 0.1
const MAX_PANEL_COVERAGE := 0.22

const PHONE_RATIO_TOP_BAR_H := 0.076
const PHONE_RATIO_PROFILE_W := 0.14
const PHONE_RATIO_STATUS_BAR_W := 0.23
const PHONE_RATIO_MISSION_W := 0.20
const PHONE_RATIO_MISSION_H := 0.24
const PHONE_RATIO_MINIMAP_D := 0.20
const PHONE_RATIO_ZOOM_W := 0.052
const PHONE_RATIO_ZOOM_H := 0.20
const PHONE_RATIO_CHAT_W := 0.22
const PHONE_RATIO_CHAT_H := 0.26
const PHONE_RATIO_CONSUMABLE_ROW_W := 0.24
const PHONE_RATIO_CONSUMABLE_D := 0.11
const PHONE_RATIO_FIRE_D := 0.20
const PHONE_RATIO_ABILITY_D := 0.11
const PHONE_RATIO_FLOATING_PLAYER_W := 0.085
const PHONE_RATIO_AVATAR_D := 0.10
const PHONE_COMBAT_CLUSTER_SCALE := 1.32

static func is_phone(viewport: Vector2) -> bool:
	return ResponsiveHudMetrics.detect_profile(viewport) == ResponsiveHudMetrics.Profile.PHONE_LANDSCAPE

static func pick(viewport: Vector2, desktop: float, phone: float) -> float:
	return phone if is_phone(viewport) else desktop

static func detect(viewport: Vector2) -> Profile:
	match ResponsiveHudMetrics.detect_profile(viewport):
		ResponsiveHudMetrics.Profile.PHONE_LANDSCAPE:
			return Profile.MOBILE_LANDSCAPE if viewport.x >= viewport.y else Profile.MOBILE_PORTRAIT
		_:
			return Profile.DESKTOP

static func profile_name(viewport: Vector2) -> String:
	return ResponsiveHudMetrics.profile_name(viewport)

static func css_viewport() -> Vector2:
	return ResponsiveHudMetrics.css_viewport()

static func device_pixel_ratio() -> float:
	return ResponsiveHudMetrics.device_pixel_ratio()

static func px(viewport: Vector2, width_ratio: float = 0.0, height_ratio: float = 0.0) -> Vector2:
	return Vector2(
		viewport.x * width_ratio if width_ratio > 0.0 else 0.0,
		viewport.y * height_ratio if height_ratio > 0.0 else 0.0
	)

static func length(viewport: Vector2, ratio: float, axis := "y") -> float:
	return ResponsiveHudMetrics.length(viewport, ratio, axis)

static func touch_floor(viewport: Vector2, ratio: float, axis := "y") -> float:
	return ResponsiveHudMetrics.clamp_length(viewport, ratio, axis, ResponsiveHudMetrics.min_touch_px(viewport))
