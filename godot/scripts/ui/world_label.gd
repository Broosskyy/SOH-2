extends Control

var _label: Label
var _hp_bar: ProgressBar
var _offset := Vector2(0.0, -18.0)
var _max_hp := 0.0

func configure(text: String, color: Color) -> void:
	_configure_base(text, color, false)

func configure_npc(text: String, color: Color, max_hp: float) -> void:
	_configure_base(text, color, true)
	_max_hp = max_hp
	if _hp_bar != null:
		_hp_bar.max_value = maxf(1.0, max_hp)
		_hp_bar.value = max_hp

func update_hp(current: float, max_hp: float) -> void:
	if _hp_bar == null:
		return
	_max_hp = max_hp
	_hp_bar.max_value = maxf(1.0, max_hp)
	_hp_bar.value = clampf(current, 0.0, _hp_bar.max_value)

func _configure_base(text: String, color: Color, with_hp: bool) -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_label = Label.new()
	_label.text = text
	_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_label.add_theme_color_override("font_color", color)
	_label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.9))
	_label.add_theme_constant_override("shadow_offset_x", 1)
	_label.add_theme_constant_override("shadow_offset_y", 1)
	add_child(_label)
	if with_hp:
		_hp_bar = ProgressBar.new()
		_hp_bar.show_percentage = false
		_hp_bar.custom_minimum_size = Vector2(72, 4)
		var background := StyleBoxFlat.new()
		background.bg_color = Color(0.02, 0.04, 0.06, 0.75)
		background.set_corner_radius_all(2)
		var fill := StyleBoxFlat.new()
		fill.bg_color = Color(0.92, 0.28, 0.22)
		fill.set_corner_radius_all(2)
		_hp_bar.add_theme_stylebox_override("background", background)
		_hp_bar.add_theme_stylebox_override("fill", fill)
		add_child(_hp_bar)

func update_projection(camera: Camera3D, world_position: Vector3) -> void:
	if camera.is_position_behind(world_position):
		visible = false
		return
	visible = true
	var logical := ResponsiveHudMetrics.logical_ui_viewport_size(self)
	var render := ResponsiveHudMetrics.render_viewport_size(self)
	var pscale := ResponsiveHudMetrics.presentation_scale_uniform(self)
	var font_px := HudLayout.font_size(
		logical,
		16.0 if HudLayout.is_mobile_landscape(logical) else 12.0,
		HudLayout.Semantic.FLOATING_NPC
	)
	_label.add_theme_font_size_override("font_size", int(round(font_px * pscale)))
	if _hp_bar != null:
		_hp_bar.custom_minimum_size = Vector2(
			HudLayout.floating_width(logical, false) * pscale,
			maxf(5.0, logical.y * 0.006) * pscale
		)
	var screen_position := camera.unproject_position(world_position)
	var height := _label.size.y + (_hp_bar.custom_minimum_size.y if _hp_bar != null else 0.0)
	position = screen_position + _offset - Vector2(_label.size.x * 0.5, height)
