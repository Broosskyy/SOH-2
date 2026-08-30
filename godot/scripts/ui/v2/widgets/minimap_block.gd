class_name MinimapBlockV2
extends Control

var _minimap: Minimap
var _utility_row: HBoxContainer

func _init() -> void:
	name = "MinimapBlock"
	mouse_filter = Control.MOUSE_FILTER_IGNORE

func setup_minimap(minimap: Minimap) -> void:
	_minimap = minimap
	_minimap.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(_minimap)

func apply_viewport(viewport: Vector2, fullscreen_button: Button) -> void:
	if _utility_row != null:
		_utility_row.queue_free()
	_utility_row = HBoxContainer.new()
	_utility_row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_utility_row.add_theme_constant_override("separation", 2)
	if fullscreen_button.get_parent() != null:
		fullscreen_button.get_parent().remove_child(fullscreen_button)
	fullscreen_button.custom_minimum_size = Vector2(16.0, 16.0)
	fullscreen_button.size = fullscreen_button.custom_minimum_size
	fullscreen_button.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.SECONDARY_ACTION))
	_utility_row.add_child(fullscreen_button)
	add_child(_utility_row)
	if _minimap != null:
		_minimap.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		_minimap.position = Vector2.ZERO
		_minimap.size = size
		_minimap.fill_parent_zone()
	var util_h := 16.0
	_utility_row.position = Vector2(2.0, 2.0)
	_utility_row.size = Vector2(size.x - 4.0, util_h)
