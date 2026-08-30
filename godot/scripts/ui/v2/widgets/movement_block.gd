class_name MovementBlockV2
extends Control

func _init() -> void:
	name = "MovementBlock"
	mouse_filter = Control.MOUSE_FILTER_IGNORE

func apply_viewport(viewport: Vector2, recenter_cb: Callable) -> void:
	for child in get_children():
		child.queue_free()
	var diameter := minf(size.x, size.y) * 0.92
	var wheel := PanelContainer.new()
	wheel.custom_minimum_size = Vector2(diameter, diameter)
	wheel.position = Vector2((size.x - diameter) * 0.5, (size.y - diameter) * 0.5)
	wheel.add_theme_stylebox_override("panel", PresentationTheme.round_button(diameter * 0.5, Color(0.52, 0.62, 0.72, 0.75)))
	var spokes := Label.new()
	spokes.text = "◎"
	spokes.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	spokes.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	spokes.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	spokes.add_theme_font_size_override("font_size", int(diameter * 0.42))
	spokes.add_theme_color_override("font_color", Color(0.72, 0.82, 0.9))
	wheel.add_child(spokes)
	add_child(wheel)
	var ship_btn := Button.new()
	ship_btn.text = "SHIP"
	ship_btn.position = Vector2(size.x - 28.0, size.y - 18.0)
	ship_btn.custom_minimum_size = Vector2(26.0, 16.0)
	ship_btn.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.SECONDARY_ACTION))
	var style := PresentationTheme.compact_nav_button(true)
	ship_btn.add_theme_stylebox_override("normal", style)
	ship_btn.pressed.connect(recenter_cb)
	add_child(ship_btn)
