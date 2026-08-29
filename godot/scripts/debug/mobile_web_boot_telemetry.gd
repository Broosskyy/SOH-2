extends CanvasLayer

const STAGE_ORDER := [
	"ENGINE READY",
	"MAIN READY",
	"WORLD READY",
	"CAMERA READY",
	"PLAYER READY",
	"KRAKEN READY",
	"RENDER READY",
]

var _enabled := false
var _stages: Dictionary = {}
var _errors: PackedStringArray = []
var _label: Label
var _webgl_info: Dictionary = {}

func _ready() -> void:
	_enabled = _should_show()
	if not _enabled:
		return
	layer = 200
	process_mode = Node.PROCESS_MODE_ALWAYS
	var root := MarginContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_theme_constant_override("margin_left", 8)
	root.add_theme_constant_override("margin_top", 8)
	root.add_theme_constant_override("margin_right", 8)
	add_child(root)
	_label = Label.new()
	_label.add_theme_font_size_override("font_size", 13)
	_label.add_theme_color_override("font_color", Color(0.92, 0.98, 1.0))
	_label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.95))
	_label.add_theme_constant_override("shadow_offset_x", 1)
	_label.add_theme_constant_override("shadow_offset_y", 1)
	_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	root.add_child(_label)
	mark_stage("ENGINE READY")
	if OS.get_name() == "Web":
		_install_webgl_hooks()
	call_deferred("_watch_render_ready")

func enabled() -> bool:
	return _enabled

func mark_stage(stage: String, detail: String = "") -> void:
	if not _enabled:
		return
	_stages[stage] = detail
	_refresh()

func report_error(message: String) -> void:
	if not _enabled:
		return
	_errors.append(message)
	_refresh()

func _should_show() -> bool:
	if OS.get_environment("ABYSSAL_BOOT_TELEMETRY") == "1":
		return true
	if OS.get_name() != "Web":
		return false
	return MobileWebDiagnostics.query_flag("diag")

func _install_webgl_hooks() -> void:
	if not ClassDB.class_exists("JavaScriptBridge"):
		return
	var payload: Variant = JavaScriptBridge.eval(
		"""(() => {
			const canvas = document.getElementById('canvas');
			if (!canvas) return JSON.stringify({ error: 'canvas-missing' });
			const report = (type) => {
				if (window.__abyssalBootTelemetry) window.__abyssalBootTelemetry(type);
			};
			canvas.addEventListener('webglcontextlost', (event) => {
				event.preventDefault();
				report('webglcontextlost');
			}, false);
			canvas.addEventListener('webglcontextrestored', () => report('webglcontextrestored'), false);
			const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
			if (!gl) return JSON.stringify({ error: 'webgl-missing' });
			const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
			return JSON.stringify({
				dpr: window.devicePixelRatio || 1,
				canvasWidth: canvas.width,
				canvasHeight: canvas.height,
				clientWidth: canvas.clientWidth,
				clientHeight: canvas.clientHeight,
				renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown',
				vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown',
				maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
				secureContext: window.isSecureContext === true,
			});
		})()"""
	)
	if payload is String and not payload.is_empty():
		var parsed: Variant = JSON.parse_string(payload)
		if parsed is Dictionary:
			_webgl_info = parsed
			if parsed.has("error"):
				report_error(str(parsed["error"]))
	_refresh()

func _watch_render_ready() -> void:
	if not _enabled:
		return
	for _frame in 12:
		await get_tree().process_frame
	var viewport := get_tree().root.get_viewport()
	var viewport_size := viewport.get_visible_rect().size
	var camera := _find_current_camera()
	var detail := "viewport=%dx%d draws=%d mem=%.1fMiB" % [
		int(viewport_size.x),
		int(viewport_size.y),
		int(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)),
		Performance.get_monitor(Performance.MEMORY_STATIC) / 1048576.0,
	]
	if camera != null:
		detail += " cam=%s pos=%s" % [
			camera.name,
			_format_vec3(camera.global_position),
		]
		if _has_invalid_transform(camera):
			report_error("camera transform invalid")
	mark_stage("RENDER READY", detail)

func _find_current_camera() -> Camera3D:
	for node in get_tree().get_nodes_in_group("boot_camera"):
		if node is Camera3D:
			return node
	return get_viewport().get_camera_3d()

func _has_invalid_transform(node: Node3D) -> bool:
	return not node.global_position.is_finite() or not node.global_basis.is_finite()

func _format_vec3(value: Vector3) -> String:
	return "(%.1f, %.1f, %.1f)" % [value.x, value.y, value.z]

func _refresh() -> void:
	if _label == null:
		return
	var lines: PackedStringArray = ["MOBILE WEB BOOT", "QUALITY: %s" % QualityManager.profile_name()]
	if not _webgl_info.is_empty():
		lines.append(
			"WEBGL %sx%s dpr=%s tex=%s" % [
				str(_webgl_info.get("canvasWidth", "?")),
				str(_webgl_info.get("canvasHeight", "?")),
				str(_webgl_info.get("dpr", "?")),
				str(_webgl_info.get("maxTextureSize", "?")),
			]
		)
		if _webgl_info.has("renderer"):
			lines.append("GPU: %s" % str(_webgl_info.get("renderer", "unknown")))
	for stage in STAGE_ORDER:
		if _stages.has(stage):
			var detail := str(_stages[stage])
			lines.append("%s%s" % [stage, "" if detail.is_empty() else " — %s" % detail])
	for error in _stages.keys():
		if not error in STAGE_ORDER:
			lines.append("%s" % error)
	for error in _errors:
		lines.append("ERR: %s" % error)
	_label.text = "\n".join(lines)
