class_name HudLayout
extends RefCounted

const DESIGN_SHORT_EDGE := 1080.0
const MIN_TOUCH_PX := 48.0

static func is_mobile_layout(viewport: Vector2) -> bool:
	return PlatformService.mobile or minf(viewport.x, viewport.y) < 620.0 or viewport.x < 960.0

static func scale_factor(viewport: Vector2) -> float:
	var short_edge := minf(viewport.x, viewport.y)
	var normalized := short_edge / DESIGN_SHORT_EDGE
	if is_mobile_layout(viewport):
		return clampf(normalized * 1.85, 1.45, 2.25)
	return clampf(normalized, 0.95, 1.15)

static func font_size(viewport: Vector2, desktop_px: float) -> int:
	return maxi(8, int(round(desktop_px * scale_factor(viewport))))

static func touch_size(viewport: Vector2, desired: float) -> float:
	return maxf(desired * scale_factor(viewport), MIN_TOUCH_PX)

static func panel_margin(viewport: Vector2) -> float:
	return 10.0 * scale_factor(viewport)
