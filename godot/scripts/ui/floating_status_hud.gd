class_name FloatingStatusHud
extends CanvasLayer

@export var target_path: NodePath
@export var camera_path: NodePath
@export var compact := false
@export var priority := 100

@onready var target: Node3D = get_node(target_path)
@onready var camera: Camera3D = get_node(camera_path)
@onready var ui_anchor: Marker3D = target.get_node("UIAnchor")

var panel: PanelContainer
var player_name: Label
var hp_bar: ProgressBar
var shield_bar: ProgressBar
var _profile: ShipPresentationProfile
var _panel_style: StyleBoxFlat

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
		float(ship_data.get("hp", 1250.0)),
		float(ship_data.get("hp", 1250.0)),
		float(ship_data.get("shield", 350.0)),
		float(ship_data.get("shield", 350.0))
	)

func _build_hud() -> void:
	panel = PanelContainer.new()
	panel.custom_minimum_size = Vector2(188, 58) if compact else Vector2(220, 66)
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_panel_style = StyleBoxFlat.new()
	_panel_style.bg_color = Color(0.01, 0.055, 0.075, 0.78)
	_panel_style.border_color = Color(0.72, 0.57, 0.27, 0.72)
	_panel_style.set_border_width_all(1)
	_panel_style.set_corner_radius_all(5)
	_panel_style.content_margin_left = 8
	_panel_style.content_margin_right = 8
	_panel_style.content_margin_top = 4
	_panel_style.content_margin_bottom = 5
	panel.add_theme_stylebox_override("panel", _panel_style)
	var stack := VBoxContainer.new()
	stack.add_theme_constant_override("separation", 2)
	panel.add_child(stack)
	player_name = Label.new()
	player_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	player_name.add_theme_font_size_override("font_size", 15 if compact else 18)
	player_name.add_theme_color_override("font_color", Color(0.95, 0.89, 0.7))
	stack.add_child(player_name)
	hp_bar = _make_bar(Color(0.35, 0.9, 0.55), 8 if compact else 10)
	shield_bar = _make_bar(Color(0.28, 0.78, 1.0), 6 if compact else 8)
	stack.add_child(hp_bar)
	stack.add_child(shield_bar)
	add_child(panel)

func _make_bar(color: Color, height: float) -> ProgressBar:
	var bar := ProgressBar.new()
	bar.custom_minimum_size.y = height
	bar.show_percentage = false
	var background := StyleBoxFlat.new()
	background.bg_color = Color(0.01, 0.025, 0.04, 0.9)
	background.set_corner_radius_all(3)
	var fill := StyleBoxFlat.new()
	fill.bg_color = color
	fill.set_corner_radius_all(3)
	bar.add_theme_stylebox_override("background", background)
	bar.add_theme_stylebox_override("fill", fill)
	return bar

func _process(_delta: float) -> void:
	if panel == null or not is_instance_valid(target) or not is_instance_valid(camera):
		return
	if camera.is_position_behind(ui_anchor.global_position):
		panel.visible = false
		return
	panel.visible = true
	var screen_position := camera.unproject_position(ui_anchor.global_position)
	var desired := screen_position + _profile.nameplate_offset
	desired -= Vector2(panel.size.x * 0.5, panel.size.y + _profile.ui_safe_gap)
	var viewport_size := get_viewport().get_visible_rect().size
	var safe_rect := PlatformService.safe_rect(viewport_size)
	var inset := 8.0
	panel.position = Vector2(
		clampf(
			desired.x,
			safe_rect.position.x + inset,
			maxf(safe_rect.position.x + inset, safe_rect.end.x - panel.size.x - inset)
		),
		clampf(
			desired.y,
			safe_rect.position.y + inset,
			maxf(safe_rect.position.y + inset, safe_rect.end.y - panel.size.y - inset)
		)
	)

func set_status(name: String, hp: float, max_hp: float, shield: float, max_shield: float) -> void:
	if panel == null:
		return
	player_name.text = name.to_upper()
	hp_bar.max_value = maxf(1.0, max_hp)
	hp_bar.value = clampf(hp, 0.0, hp_bar.max_value)
	shield_bar.max_value = maxf(1.0, max_shield)
	shield_bar.value = clampf(shield, 0.0, shield_bar.max_value)

func set_debug_bounds_visible(enabled: bool) -> void:
	if _panel_style == null:
		return
	_panel_style.border_color = Color(1.0, 0.2, 0.85, 1.0) if enabled else Color(0.72, 0.57, 0.27, 0.72)
	_panel_style.set_border_width_all(3 if enabled else 1)
