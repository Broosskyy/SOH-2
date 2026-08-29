class_name UiMetrics
extends RefCounted

## Single authoritative UI metric source for G0.5.1+.
## Layout coordinates: Godot render/design viewport (project 1920×1080 on Web).
## CSS viewport: browser logical pixels — used only for conversion + QA audit.

const BUILD_LABEL := "G0.5.1-MOBILE-WEB-UI-METRICS"
const CSS_MIN_TOUCH_PX := 48.0

static func render_viewport(node: Node = null) -> Vector2:
	if node != null and is_instance_valid(node) and node.get_viewport() != null:
		return node.get_viewport().get_visible_rect().size
	var tree := Engine.get_main_loop()
	if tree is SceneTree:
		return (tree as SceneTree).root.get_viewport().get_visible_rect().size
	return DisplayServer.window_get_size()

static func css_viewport() -> Vector2:
	return HudLayoutProfile.css_viewport()

static func visual_viewport() -> Vector2:
	if OS.get_name() == "Web" and ClassDB.class_exists("JavaScriptBridge"):
		var raw: Variant = JavaScriptBridge.eval(
			"(() => JSON.stringify({ w: window.visualViewport?.width || 0, h: window.visualViewport?.height || 0 }))()"
		)
		if raw is String and not raw.is_empty():
			var parsed: Variant = JSON.parse_string(raw)
			if parsed is Dictionary:
				return Vector2(float(parsed.get("w", 0)), float(parsed.get("h", 0)))
	return Vector2.ZERO

static func device_pixel_ratio() -> float:
	return HudLayoutProfile.device_pixel_ratio()

static func logical_viewport(render_size: Vector2) -> Vector2:
	# Controls are placed in render/design viewport space.
	return render_size

static func effective_ui_scale(render_size: Vector2) -> float:
	# Ratio-based layout owns sizing; no second global mobile shrink.
	return 1.0

static func css_to_render(length_css: float, render_size: Vector2) -> float:
	var css := css_viewport()
	if length_css <= 0.0 or css.y <= 0.0 or render_size.y <= 0.0:
		return length_css
	if OS.get_name() == "Web" and PlatformService.mobile:
		return length_css * (render_size.y / css.y)
	return length_css

static func min_touch_render_px(render_size: Vector2) -> float:
	return maxf(HudLayout.MIN_TOUCH_PX, css_to_render(CSS_MIN_TOUCH_PX, render_size))

static func content_scale_size() -> Vector2:
	var tree := Engine.get_main_loop()
	if tree is SceneTree:
		return (tree as SceneTree).root.content_scale_size
	return Vector2.ZERO

static func content_scale_factor(render_size: Vector2) -> Vector2:
	var css := css_viewport()
	if css.x <= 0.0 or css.y <= 0.0 or render_size.x <= 0.0 or render_size.y <= 0.0:
		return Vector2.ONE
	return Vector2(render_size.x / css.x, render_size.y / css.y)

static func occupancy_ratio(control_size: Vector2, render_size: Vector2, axis := "both") -> float:
	if render_size.x <= 0.0 or render_size.y <= 0.0:
		return 0.0
	match axis:
		"x":
			return control_size.x / render_size.x
		"y":
			return control_size.y / render_size.y
		_:
			return maxf(control_size.x / render_size.x, control_size.y / render_size.y)

static func audit_dict(render_size: Vector2) -> Dictionary:
	var css := css_viewport()
	var visual := visual_viewport()
	var scale := content_scale_factor(render_size)
	return {
		"build": BUILD_LABEL,
		"render_viewport": render_size,
		"logical_viewport": logical_viewport(render_size),
		"css_viewport": css,
		"visual_viewport": visual,
		"content_scale_size": content_scale_size(),
		"content_scale_factor": scale,
		"dpr": device_pixel_ratio(),
		"effective_ui_scale": effective_ui_scale(render_size),
		"min_touch_render_px": min_touch_render_px(render_size),
		"platform": PlatformService.platform_name(),
		"fullscreen": _fullscreen_state(),
	}

static func audit_lines(render_size: Vector2) -> PackedStringArray:
	var data := audit_dict(render_size)
	var css: Vector2 = data["css_viewport"]
	var visual: Vector2 = data["visual_viewport"]
	var scale: Vector2 = data["content_scale_factor"]
	return PackedStringArray([
		"BUILD: %s" % data["build"],
		"RENDER: %dx%d" % [int(render_size.x), int(render_size.y)],
		"CSS: %dx%d" % [int(css.x), int(css.y)],
		"VISUAL: %dx%d" % [int(visual.x), int(visual.y)],
		"CONTENT_SCALE: %dx%d" % [int(data["content_scale_size"].x), int(data["content_scale_size"].y)],
		"FACTOR: %.2fx %.2fy" % [scale.x, scale.y],
		"DPR: %.2f" % data["dpr"],
		"UI_SCALE: %.2f" % data["effective_ui_scale"],
		"MIN_TOUCH_RPX: %.0f" % data["min_touch_render_px"],
		"FULLSCREEN: %s" % data["fullscreen"],
	])

static func _fullscreen_state() -> String:
	if OS.get_name() == "Web" and ClassDB.class_exists("JavaScriptBridge"):
		return "yes" if bool(JavaScriptBridge.eval("!!document.fullscreenElement")) else "no"
	return "n/a"
