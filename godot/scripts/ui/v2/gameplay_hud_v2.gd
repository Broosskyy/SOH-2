class_name GameplayHUDV2
extends CanvasLayer

## G0.6 — Clean responsive gameplay HUD. Replaces legacy GameplayPresentationRoot at runtime.

@export var player_path: NodePath
@export var camera_path: NodePath
@export var region_runtime_path: NodePath

@onready var player: PlayerShip = get_node(player_path)
@onready var camera: NavalCameraController = get_node(camera_path)
@onready var region_runtime: Node = get_node(region_runtime_path)

var _root: Control
var _blocks: Dictionary = {}
var _layout: Dictionary = {}
var _last_logical := Vector2.ZERO
var _last_scale := 1.0
var _last_audit: Dictionary = {}
var _qa_layer: Control
var _fullscreen_button: Button
var _minimap: Minimap

func _ready() -> void:
	add_to_group("gameplay_presentation_root")
	add_to_group("gameplay_hud_v2")
	layer = 5
	scale = Vector2.ONE
	_build()
	TargetingSystem.target_changed.connect(func(_t): pass)
	TargetingSystem.target_cleared.connect(func(): pass)
	get_viewport().size_changed.connect(_on_viewport_changed)
	if OS.get_name() == "Web":
		WebViewportContract.presentation_resized.connect(_on_viewport_changed)
	call_deferred("_on_viewport_changed")

func _on_viewport_changed() -> void:
	var logical := ResponsiveHudMetrics.logical_ui_viewport_size(self)
	var pscale := ResponsiveHudMetrics.presentation_scale_uniform(self)
	if logical == _last_logical and is_equal_approx(pscale, _last_scale):
		return
	_last_logical = logical
	_last_scale = pscale
	_apply_presentation_transform(logical, pscale)
	_apply_layout(logical)

func _apply_presentation_transform(logical: Vector2, pscale: float) -> void:
	scale = Vector2.ONE
	_root.position = Vector2.ZERO
	_root.custom_minimum_size = logical
	_root.size = logical
	_root.scale = Vector2.ONE * pscale

func _build() -> void:
	_root = Control.new()
	_root.name = "HudV2Root"
	_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(_root)

	var floating := Control.new()
	floating.name = "FloatingHudLayer"
	floating.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(floating)

	_blocks["profile"] = ProfileBlockV2.new()
	_blocks["status"] = StatusBlockV2.new()
	_blocks["nav"] = NavigationBlockV2.new()
	_blocks["mission"] = MissionBlockV2.new()
	_blocks["zoom"] = ZoomBlockV2.new()
	_blocks["movement"] = MovementBlockV2.new()
	_blocks["chat"] = ChatBlockV2.new()
	_blocks["consumables"] = ConsumablesBlockV2.new()
	_blocks["combat"] = CombatBlockV2.new()

	_minimap = Minimap.new()
	_minimap.region_runtime_path = region_runtime.get_path()
	_minimap.player_path = player.get_path()
	var minimap_block := MinimapBlockV2.new()
	minimap_block.setup_minimap(_minimap)
	_blocks["minimap"] = minimap_block

	_fullscreen_button = Button.new()
	_fullscreen_button.text = "FS"
	_fullscreen_button.tooltip_text = "Fullscreen"
	_fullscreen_button.pressed.connect(_toggle_fullscreen)

	for key in _blocks.keys():
		var block: Control = _blocks[key]
		block.mouse_filter = Control.MOUSE_FILTER_IGNORE if key != "minimap" else Control.MOUSE_FILTER_PASS
		_root.add_child(block)

	_qa_layer = Control.new()
	_qa_layer.name = "QaOverlay"
	_qa_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_qa_layer.visible = false
	_root.add_child(_qa_layer)

func _apply_layout(logical: Vector2) -> void:
	_layout = HudV2Layout.solve(logical)
	for key in HudV2Layout.BLOCK_KEYS:
		if not _blocks.has(key):
			continue
		HudV2Metrics.apply_block_rect(_blocks[key], _layout.get(key, Rect2()))

	(_blocks["profile"] as ProfileBlockV2).apply_viewport(logical)
	(_blocks["status"] as StatusBlockV2).apply_viewport(logical)
	(_blocks["nav"] as NavigationBlockV2).apply_viewport(logical)
	(_blocks["mission"] as MissionBlockV2).apply_viewport(logical)
	(_blocks["zoom"] as ZoomBlockV2).apply_viewport(
		logical,
		func(): camera.adjust_zoom(0.08),
		func(): camera.adjust_zoom(-0.08),
		func(): camera.zoom = MockupCompositionProfile.DEFAULT_CAMERA_ZOOM
	)
	(_blocks["movement"] as MovementBlockV2).apply_viewport(logical, func(): camera.reset_pan())
	(_blocks["chat"] as ChatBlockV2).apply_viewport(logical)
	(_blocks["consumables"] as ConsumablesBlockV2).apply_viewport(logical)
	(_blocks["combat"] as CombatBlockV2).apply_viewport(logical)
	(_blocks["minimap"] as MinimapBlockV2).apply_viewport(logical, _fullscreen_button)

	_last_audit = HudV2Metrics.audit(_layout, logical)
	_refresh_qa_overlay(logical)

func _refresh_qa_overlay(logical: Vector2) -> void:
	var qa := MobileWebDiagnostics.query_flag("qa")
	_qa_layer.visible = qa
	if not qa:
		return
	for child in _qa_layer.get_children():
		child.queue_free()
	for key in HudV2Layout.BLOCK_KEYS:
		if key == "fullscreen":
			continue
		var rect: Rect2 = _layout.get(key, Rect2())
		if rect.size == Vector2.ZERO:
			continue
		var outline := ColorRect.new()
		outline.mouse_filter = Control.MOUSE_FILTER_IGNORE
		outline.color = Color(0.95, 0.55, 0.12, 0.22)
		outline.position = rect.position
		outline.size = rect.size
		_qa_layer.add_child(outline)
		var label := Label.new()
		label.text = key.to_upper()
		label.position = rect.position + Vector2(2, 1)
		label.add_theme_font_size_override("font_size", 7)
		label.add_theme_color_override("font_color", Color(0.95, 0.82, 0.32))
		label.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_qa_layer.add_child(label)

func get_zones() -> Dictionary:
	var zones := {}
	for key in HudV2Layout.BLOCK_KEYS:
		if _blocks.has(key):
			zones[key] = _blocks[key]
	zones["identity"] = _blocks.get("profile")
	return zones

func get_layout_rects() -> Dictionary:
	return _layout.duplicate(true)

func get_containment_audit() -> Dictionary:
	return _last_audit.duplicate(true)

func _toggle_fullscreen() -> void:
	if OS.get_name() == "Web":
		JavaScriptBridge.eval("if(document.documentElement.requestFullscreen){document.documentElement.requestFullscreen()}", true)
		WebViewportContract.request_sync()
	else:
		var mode := DisplayServer.window_get_mode()
		if mode == DisplayServer.WINDOW_MODE_FULLSCREEN:
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
		else:
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
