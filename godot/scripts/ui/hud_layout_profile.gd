class_name HudLayoutProfile
extends RefCounted

## Normalized HUD measurements derived from target mockups (1920×1080 reference).

enum Profile { DESKTOP, MOBILE_LANDSCAPE, MOBILE_PORTRAIT }

const BUILD_LABEL := "G0.5.1-MOBILE-WEB-UI-METRICS"
const GIT_SHA := "21b570d"

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

static func detect(viewport: Vector2) -> Profile:
	if not PlatformService.mobile and minf(viewport.x, viewport.y) >= 620.0:
		return Profile.DESKTOP
	if viewport.x >= viewport.y:
		return Profile.MOBILE_LANDSCAPE
	return Profile.MOBILE_PORTRAIT

static func profile_name(viewport: Vector2) -> String:
	match detect(viewport):
		Profile.MOBILE_LANDSCAPE:
			return "MOBILE_LANDSCAPE"
		Profile.MOBILE_PORTRAIT:
			return "MOBILE_PORTRAIT"
		_:
			return "DESKTOP"

static func css_viewport() -> Vector2:
	if OS.get_name() == "Web" and ClassDB.class_exists("JavaScriptBridge"):
		var raw: Variant = JavaScriptBridge.eval(
			"(() => JSON.stringify({ w: window.innerWidth || 0, h: window.innerHeight || 0, dpr: window.devicePixelRatio || 1 }))()"
		)
		if raw is String and not raw.is_empty():
			var parsed: Variant = JSON.parse_string(raw)
			if parsed is Dictionary:
				return Vector2(float(parsed.get("w", 0)), float(parsed.get("h", 0)))
	return Vector2.ZERO

static func device_pixel_ratio() -> float:
	if OS.get_name() == "Web" and ClassDB.class_exists("JavaScriptBridge"):
		return float(JavaScriptBridge.eval("window.devicePixelRatio || 1"))
	return 1.0

static func px(viewport: Vector2, width_ratio: float = 0.0, height_ratio: float = 0.0) -> Vector2:
	return Vector2(
		viewport.x * width_ratio if width_ratio > 0.0 else 0.0,
		viewport.y * height_ratio if height_ratio > 0.0 else 0.0
	)

static func length(viewport: Vector2, ratio: float, axis := "y") -> float:
	if axis == "x":
		return viewport.x * ratio
	return viewport.y * ratio

static func touch_floor(viewport: Vector2, ratio: float, axis := "y") -> float:
	return maxf(UiMetrics.min_touch_render_px(viewport), length(viewport, ratio, axis))
