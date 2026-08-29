extends Control

var _label: Label
var _offset := Vector2(0.0, -18.0)

func configure(text: String, color: Color) -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_label = Label.new()
	_label.text = text
	_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_label.add_theme_font_size_override("font_size", 14)
	_label.add_theme_color_override("font_color", color)
	_label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.9))
	add_child(_label)

func update_projection(camera: Camera3D, world_position: Vector3) -> void:
	if camera.is_position_behind(world_position):
		visible = false
		return
	visible = true
	var screen_position := camera.unproject_position(world_position)
	position = screen_position + _offset - Vector2(_label.size.x * 0.5, _label.size.y)
