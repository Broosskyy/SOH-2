class_name ResponsiveHudMetrics
extends RefCounted

## G0.5.4 — logical UI space vs render buffer separation.
## Layout/profile uses logical browser game area on Web.
## Presentation root maps logical layout → render coordinates via measured scale.

enum Profile { DESKTOP_TABLET, PHONE_LANDSCAPE }

const BUILD_LABEL := "G0.5.4-LOGICAL-UI"
const MIN_TOUCH_PX := 48.0
const PHONE_SHORT_EDGE_MAX := 520.0
const PHONE_MIN_ASPECT := 1.55
const PRESENTATION_SCALE_TOLERANCE := 0.05

static func render_viewport_size(node: Node = null) -> Vector2:
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

static func logical_ui_viewport_size(node: Node = null) -> Vector2:
	if OS.get_name() == "Web":
		var logical := browser_content_viewport()
		if logical.x >= 320.0 and logical.y >= 240.0:
			return logical
	return render_viewport_size(node)

static func ui_viewport(node: Node = null) -> Vector2:
	return logical_ui_viewport_size(node)

static func presentation_scale_uniform(node: Node = null) -> float:
	var logical := logical_ui_viewport_size(node)
	var render := render_viewport_size(node)
	if logical.x < 1.0 or logical.y < 1.0 or render.x < 1.0 or render.y < 1.0:
		return 1.0
	if OS.get_name() != "Web":
		return 1.0
	var sx := render.x / logical.x
	var sy := render.y / logical.y
	if absf(sx - sy) <= PRESENTATION_SCALE_TOLERANCE:
		return (sx + sy) * 0.5
	return minf(sx, sy)

static func presentation_scale(node: Node = null) -> Vector2:
	var uniform := presentation_scale_uniform(node)
	return Vector2.ONE * uniform

static func render_size_from_logical(logical_size: float, node: Node = null) -> float:
	return logical_size * presentation_scale_uniform(node)

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
	apply_web_presentation_sync(window)

static func install_web_canvas_contract() -> void:
	if OS.get_name() != "Web" or not ClassDB.class_exists("JavaScriptBridge"):
		return
	JavaScriptBridge.eval("window.AbyssalWebViewport?.install?.()")

static func web_metrics() -> Dictionary:
	if OS.get_name() != "Web" or not ClassDB.class_exists("JavaScriptBridge"):
		return {}
	install_web_canvas_contract()
	var raw: Variant = JavaScriptBridge.eval(
		"JSON.stringify(window.AbyssalWebViewport?.readMetrics?.() || {})"
	)
	if raw is String and not raw.is_empty():
		var parsed: Variant = JSON.parse_string(raw)
		if parsed is Dictionary:
			return parsed
	return {}

static func browser_content_viewport() -> Vector2:
	var metrics := web_metrics()
	var container: Variant = metrics.get("container", {})
	if container is Dictionary:
		var w := float(container.get("w", 0))
		var h := float(container.get("h", 0))
		if w >= 320.0 and h >= 240.0:
			return Vector2(w, h)
	var canvas: Dictionary = metrics.get("canvas", {}) if metrics.get("canvas") is Dictionary else {}
	if not canvas.is_empty():
		var cw := float(canvas.get("w", 0))
		var ch := float(canvas.get("h", 0))
		if cw >= 320.0 and ch >= 240.0:
			return Vector2(cw, ch)
	return css_viewport()

static func canvas_coverage() -> Vector2:
	var metrics := web_metrics()
	var coverage: Variant = metrics.get("coverage", {})
	if coverage is Dictionary:
		return Vector2(float(coverage.get("x", 0)), float(coverage.get("y", 0)))
	return Vector2.ZERO

static func apply_web_presentation_sync(_window: Window) -> void:
	if OS.get_name() != "Web":
		return
	install_web_canvas_contract()

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
			"""(() => {
				const vv = window.visualViewport;
				if (vv) return JSON.stringify({ w: vv.width || 0, h: vv.height || 0 });
				return JSON.stringify({ w: window.innerWidth || 0, h: window.innerHeight || 0 });
			})()"""
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

static func audit_lines(node: Node = null) -> PackedStringArray:
	var logical := logical_ui_viewport_size(node)
	var render := render_viewport_size(node)
	var pscale := presentation_scale_uniform(node)
	var metrics := web_metrics()
	var inner: Dictionary = metrics.get("inner", {})
	var visual: Dictionary = metrics.get("visual", {}) if metrics.get("visual") is Dictionary else {}
	var client: Dictionary = metrics.get("client", {})
	var canvas: Dictionary = metrics.get("canvas", {}) if metrics.get("canvas") is Dictionary else {}
	var coverage := canvas_coverage()
	return PackedStringArray([
		"PROFILE: %s" % profile_name(logical),
		"LOGICAL_UI: %dx%d" % [int(logical.x), int(logical.y)],
		"RENDER_VIEWPORT: %dx%d" % [int(render.x), int(render.y)],
		"PRESENTATION_SCALE: %.3f" % pscale,
		"INNER: %dx%d" % [int(inner.get("w", 0)), int(inner.get("h", 0))],
		"VISUAL: %dx%d" % [int(visual.get("w", 0)), int(visual.get("h", 0))],
		"CLIENT: %dx%d" % [int(client.get("w", 0)), int(client.get("h", 0))],
		"CANVAS_CSS: %.0f,%.0f,%.0f,%.0f" % [
			float(canvas.get("x", 0)),
			float(canvas.get("y", 0)),
			float(canvas.get("w", 0)),
			float(canvas.get("h", 0)),
		],
		"CANVAS_BUFFER: %dx%d" % [int(canvas.get("bufferW", 0)), int(canvas.get("bufferH", 0))],
		"GODOT_WINDOW: %dx%d" % [int(window_size().x), int(window_size().y)],
		"GODOT_VIEWPORT: %dx%d" % [int(render.x), int(render.y)],
		"HUD_VIEWPORT: %dx%d" % [int(logical.x), int(logical.y)],
		"DPR: %.2f" % device_pixel_ratio(),
		"CONTENT_SCALE_MODE: %s" % content_scale_mode_name(),
		"FULLSCREEN: %s" % fullscreen_state(),
		"CANVAS_COVERAGE_X: %.1f%%" % coverage.x,
		"CANVAS_COVERAGE_Y: %.1f%%" % coverage.y,
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
