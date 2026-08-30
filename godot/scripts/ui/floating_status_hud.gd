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
	set_status(
		MockupCompositionProfile.HUD_FLOATING_NAME,
		0,
		MockupCompositionProfile.HUD_RUMPF_CURRENT,
		MockupCompositionProfile.HUD_RUMPF_MAX,
		MockupCompositionProfile.HUD_SCHUTZ_CURRENT,
		MockupCompositionProfile.HUD_SCHUTZ_MAX
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
	var logical := ResponsiveHudMetrics.logical_ui_viewport_size(self)
	var render := ResponsiveHudMetrics.render_viewport_size(self)
	var pscale := ResponsiveHudMetrics.presentation_scale_uniform(self)
	var is_phone := HudLayout.is_mobile_landscape(logical)
	var width := HudLayout.floating_width(logical, true) * pscale
	player_name.add_theme_font_size_override(
		"font_size",
		int(round(HudLayout.font_size(logical, 11.0, HudLayout.Semantic.FLOATING_PLAYER) * pscale))
	)
	level_label.add_theme_font_size_override(
		"font_size",
		int(round(HudLayout.font_size(logical, 9.0, HudLayout.Semantic.FLOATING_PLAYER) * pscale))
	)
	var bar_h_hp := maxf(3.0 if is_phone else 4.0, logical.y * (0.004 if is_phone else 0.006)) * pscale
	var bar_h_shield := maxf(2.0 if is_phone else 3.0, logical.y * (0.0035 if is_phone else 0.005)) * pscale
	hp_bar.custom_minimum_size = Vector2(width, bar_h_hp)
	shield_bar.custom_minimum_size = Vector2(width, bar_h_shield)
	root.custom_minimum_size = Vector2(width, maxf(22.0 if is_phone else 28.0, logical.y * (0.04 if is_phone else 0.05)) * pscale)
	var screen_position := camera.unproject_position(ui_anchor.global_position)
	var desired := screen_position + _profile.nameplate_offset
	desired -= Vector2(width * 0.5, root.size.y + _profile.ui_safe_gap * pscale)
	var safe_rect := PlatformService.safe_rect(render)
	var inset := 6.0
	root.position = Vector2(
		clampf(desired.x, safe_rect.position.x + inset, maxf(safe_rect.position.x + inset, safe_rect.end.x - width - inset)),
		clampf(desired.y, safe_rect.position.y + inset, maxf(safe_rect.position.y + inset, safe_rect.end.y - root.size.y - inset))
	)
	if Engine.get_frames_drawn() % 15 == 0 and target is ShipEntity:
		var ship := target as ShipEntity
		if ship.health != null:
			hp_bar.max_value = ship.health.max_health
			hp_bar.value = ship.health.current_health

func set_status(name: String, level: int, hp: float, max_hp: float, shield: float, max_shield: float) -> void:
	if root == null:
		return
	player_name.text = name.to_upper()
	level_label.text = "LV %d" % level
	level_label.visible = level > 0 and not compact
	hp_bar.max_value = maxf(1.0, max_hp)
	hp_bar.value = clampf(hp, 0.0, hp_bar.max_value)
	shield_bar.max_value = maxf(1.0, max_shield)
	shield_bar.value = clampf(shield, 0.0, shield_bar.max_value)
	shield_bar.visible = max_shield > 0.0

func set_debug_bounds_visible(enabled: bool) -> void:
	if root == null:
		return
	root.modulate = Color(1.0, 0.4, 0.9) if enabled else Color.WHITE
