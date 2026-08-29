class_name ResponsiveHudMetrics
extends RefCounted

## G0.5.2 — single authoritative native UI viewport metrics.
## All HUD layout uses Godot UI coordinates from the actual available viewport.
## CSS / DPR are diagnostic only — never used for Control positioning.

enum Profile { DESKTOP_TABLET, PHONE_LANDSCAPE }

const BUILD_LABEL := "G0.5.2-NATIVE-RESPONSIVE-HUD"
const MIN_TOUCH_PX := 48.0
const PHONE_SHORT_EDGE_MAX := 520.0
const PHONE_MIN_ASPECT := 1.55

static func ui_viewport(node: Node = null) -> Vector2:
	if node != null and is_instance_valid(node) and node.get_viewport() != null:
		var size := node.get_viewport().get_visible_rect().size
		if size.x > 1.0 and size.y > 1.0:
			return size
	var tree := Engine.get_main_loop()
	if tree is SceneTree:
		var size := (tree as SceneTree).root.get_viewport().get_visible_rect().size
		if size.x > 1.0 and size.y > 1.0:
			return size
	return Vector2(
		float(ProjectSettings.get_setting("display/window/size/viewport_width", 1920)),
		float(ProjectSettings.get_setting("display/window/size/viewport_height", 1080))
	)

static func short_edge(viewport: Vector2) -> float:
	return minf(viewport.x, viewport.y)

static func long_edge(viewport: Vector2) -> float:
	return maxf(viewport.x, viewport.y)

static func aspect(viewport: Vector2) -> float:
	return long_edge(viewport) / maxf(short_edge(viewport), 1.0)

static func detect_profile(viewport: Vector2) -> Profile:
	var short := short_edge(viewport)
	var wide := viewport.x > viewport.y and aspect(viewport) >= PHONE_MIN_ASPECT
	if wide and short <= PHONE_SHORT_EDGE_MAX:
		return Profile.PHONE_LANDSCAPE
	return Profile.DESKTOP_TABLET

static func profile_name(viewport: Vector2) -> String:
	return "PHONE_LANDSCAPE" if detect_profile(viewport) == Profile.PHONE_LANDSCAPE else "DESKTOP_TABLET"

static func margin(viewport: Vector2) -> float:
	return clampf(short_edge(viewport) * 0.014, 6.0, 20.0)

static func length(viewport: Vector2, ratio: float, axis := "y") -> float:
	if axis == "x":
		return viewport.x * ratio
	return viewport.y * ratio

static func clamp_length(viewport: Vector2, ratio: float, axis := "y", min_px := 0.0, max_ratio := 0.3) -> float:
	var base := length(viewport, ratio, axis)
	var cap := (viewport.x if axis == "x" else viewport.y) * max_ratio
	var floor_px := min_px if min_px > 0.0 else margin(viewport)
	return clampf(base, floor_px, cap)

static func touch_diameter(viewport: Vector2, ratio: float, min_px := MIN_TOUCH_PX, max_ratio := 0.22) -> float:
	return clamp_length(viewport, ratio, "y", min_px, max_ratio)

static func font_px(viewport: Vector2, ratio: float, min_px := 10, max_px := 28) -> int:
	return int(clampf(short_edge(viewport) * ratio, float(min_px), float(max_px)))

static func min_touch_px(viewport: Vector2) -> float:
	return maxf(MIN_TOUCH_PX, short_edge(viewport) * 0.044)

static func safe_rect(viewport: Vector2) -> Rect2:
	return PlatformService.safe_rect(viewport)

static func apply_web_window_size(window: Window) -> void:
	if OS.get_name() != "Web" or window == null:
		return
	var css := css_viewport()
	if css.x >= 320.0 and css.y >= 240.0:
		window.size = Vector2i(int(css.x), int(css.y))

static func content_scale_mode_name() -> String:
	var tree := Engine.get_main_loop()
	if tree is SceneTree:
		match (tree as SceneTree).root.content_scale_mode:
			Window.CONTENT_SCALE_MODE_DISABLED:
				return "disabled"
			Window.CONTENT_SCALE_MODE_CANVAS_ITEMS:
				return "canvas_items"
			Window.CONTENT_SCALE_MODE_VIEWPORT:
				return "viewport"
	return "unknown"

static func css_viewport() -> Vector2:
	if OS.get_name() == "Web" and ClassDB.class_exists("JavaScriptBridge"):
		var raw: Variant = JavaScriptBridge.eval(
			"(() => JSON.stringify({ w: window.innerWidth || 0, h: window.innerHeight || 0 }))()"
		)
		if raw is String and not raw.is_empty():
			var parsed: Variant = JSON.parse_string(raw)
			if parsed is Dictionary:
				return Vector2(float(parsed.get("w", 0)), float(parsed.get("h", 0)))
	return Vector2.ZERO

static func window_size() -> Vector2:
	var tree := Engine.get_main_loop()
	if tree is SceneTree:
		return (tree as SceneTree).root.size
	return DisplayServer.window_get_size()

static func device_pixel_ratio() -> float:
	if OS.get_name() == "Web" and ClassDB.class_exists("JavaScriptBridge"):
		return float(JavaScriptBridge.eval("window.devicePixelRatio || 1"))
	return 1.0

static func fullscreen_state() -> String:
	if OS.get_name() == "Web" and ClassDB.class_exists("JavaScriptBridge"):
		return "yes" if bool(JavaScriptBridge.eval("!!document.fullscreenElement")) else "no"
	return "n/a"

static func audit_lines(viewport: Vector2) -> PackedStringArray:
	var css := css_viewport()
	return PackedStringArray([
		"PROFILE: %s" % profile_name(viewport),
		"UI_VIEWPORT: %dx%d" % [int(viewport.x), int(viewport.y)],
		"ASPECT: %.2f" % aspect(viewport),
		"SHORT_EDGE: %.0f" % short_edge(viewport),
		"WINDOW: %dx%d" % [int(window_size().x), int(window_size().y)],
		"CSS: %dx%d" % [int(css.x), int(css.y)],
		"DPR: %.2f" % device_pixel_ratio(),
		"CONTENT_SCALE_MODE: %s" % content_scale_mode_name(),
		"FULLSCREEN: %s" % fullscreen_state(),
	])

static func zone_visible(rect: Rect2, viewport: Vector2) -> bool:
	if rect.size.x <= 1.0 or rect.size.y <= 1.0:
		return false
	if is_nan(rect.position.x) or is_nan(rect.position.y):
		return false
	if is_inf(rect.size.x) or is_inf(rect.size.y):
		return false
	var bounds := Rect2(Vector2.ZERO, viewport)
	return bounds.encloses(rect) or bounds.intersects(rect)
