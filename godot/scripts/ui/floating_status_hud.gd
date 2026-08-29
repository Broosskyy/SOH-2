class_name FloatingStatusHud
extends CanvasLayer

@export var target_path: NodePath
@export var camera_path: NodePath
@export var compact := true
@export var priority := 100

@onready var target: Node3D = get_node(target_path)
@onready var camera: Camera3D = get_node(camera_path)
@onready var ui_anchor: Marker3D = target.get_node("UIAnchor")

var root: Control
var player_name: Label
var level_label: Label
var hp_bar: ProgressBar
var shield_bar: ProgressBar
var _profile: ShipPresentationProfile

func _ready() -> void:
	_profile = target.get("presentation_profile") as ShipPresentationProfile
	if _profile == null:
		push_error("FloatingStatusHud target requires a ShipPresentationProfile")
		return
	_build_hud()
	var ship_id := str(GameState.save_data.get("shipId", "sovereign"))
	var ship_data: Dictionary = GameState.catalog.get("ships", {}).get(ship_id, {})
	set_status(
		str(GameState.save_data.get("playerName", "Captain Rowan")),
		int(GameState.save_data.get("level", 1)),
		float(ship_data.get("hp", 1250.0)),
		float(ship_data.get("hp", 1250.0)),
		float(ship_data.get("shield", 350.0)),
		float(ship_data.get("shield", 350.0))
	)

func _build_hud() -> void:
	root = Control.new()
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)
	var stack := VBoxContainer.new()
	stack.add_theme_constant_override("separation", 1)
	stack.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(stack)
	player_name = Label.new()
	player_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	player_name.add_theme_color_override("font_color", Color(0.95, 0.9, 0.74))
	player_name.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.85))
	player_name.add_theme_constant_override("shadow_offset_x", 1)
	player_name.add_theme_constant_override("shadow_offset_y", 1)
	stack.add_child(player_name)
	level_label = Label.new()
	level_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	level_label.add_theme_color_override("font_color", Color(0.72, 0.82, 0.78))
	level_label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.8))
	stack.add_child(level_label)
	hp_bar = _make_bar(Color(0.35, 0.88, 0.48))
	shield_bar = _make_bar(Color(0.28, 0.72, 0.95))
	stack.add_child(hp_bar)
	stack.add_child(shield_bar)

func _make_bar(color: Color) -> ProgressBar:
	var bar := ProgressBar.new()
	bar.show_percentage = false
	var background := StyleBoxFlat.new()
	background.bg_color = Color(0.02, 0.05, 0.07, 0.72)
	background.set_corner_radius_all(2)
	var fill := StyleBoxFlat.new()
	fill.bg_color = color
	fill.set_corner_radius_all(2)
	bar.add_theme_stylebox_override("background", background)
	bar.add_theme_stylebox_override("fill", fill)
	return bar

func _process(_delta: float) -> void:
	if root == null or not is_instance_valid(target) or not is_instance_valid(camera):
		return
	if camera.is_position_behind(ui_anchor.global_position):
		root.visible = false
		return
	root.visible = true
	var viewport_size := get_viewport().get_visible_rect().size
	var scale := HudLayout.semantic_scale(viewport_size, HudLayout.Semantic.FLOATING_PLAYER)
	var width := HudLayout.floating_width(viewport_size, true)
	player_name.add_theme_font_size_override("font_size", HudLayout.font_size(viewport_size, 11.0, HudLayout.Semantic.FLOATING_PLAYER))
	level_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport_size, 9.0, HudLayout.Semantic.FLOATING_PLAYER))
	hp_bar.custom_minimum_size = Vector2(width, 4.0 * scale)
	shield_bar.custom_minimum_size = Vector2(width, 3.0 * scale)
	root.custom_minimum_size = Vector2(width, 36.0 * scale)
	var screen_position := camera.unproject_position(ui_anchor.global_position)
	var desired := screen_position + _profile.nameplate_offset
	desired -= Vector2(width * 0.5, root.size.y + _profile.ui_safe_gap)
	var safe_rect := PlatformService.safe_rect(viewport_size)
	var inset := 6.0
	root.position = Vector2(
		clampf(desired.x, safe_rect.position.x + inset, maxf(safe_rect.position.x + inset, safe_rect.end.x - width - inset)),
		clampf(desired.y, safe_rect.position.y + inset, maxf(safe_rect.position.y + inset, safe_rect.end.y - root.size.y - inset))
	)

func set_status(name: String, level: int, hp: float, max_hp: float, shield: float, max_shield: float) -> void:
	if root == null:
		return
	player_name.text = name.to_upper()
	level_label.text = "LV %d" % level
	level_label.visible = level > 0
	hp_bar.max_value = maxf(1.0, max_hp)
	hp_bar.value = clampf(hp, 0.0, hp_bar.max_value)
	shield_bar.max_value = maxf(1.0, max_shield)
	shield_bar.value = clampf(shield, 0.0, shield_bar.max_value)
	shield_bar.visible = max_shield > 0.0

func set_debug_bounds_visible(enabled: bool) -> void:
	if root == null:
		return
	root.modulate = Color(1.0, 0.4, 0.9) if enabled else Color.WHITE
