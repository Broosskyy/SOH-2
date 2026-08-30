class_name ZoomBlockV2
extends VBoxContainer

func _init() -> void:
	name = "ZoomBlock"
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	alignment = BoxContainer.ALIGNMENT_CENTER

func apply_viewport(viewport: Vector2, zoom_in_cb: Callable, zoom_out_cb: Callable, zoom_mid_cb: Callable) -> void:
	for child in get_children():
		child.queue_free()
	var font_px := HudV2Typography.font_size(viewport, HudV2Typography.Tier.ZOOM)
	var btn_h := maxf(10.0, (size.y - 8.0) / 5.0)
	for spec in [["+", zoom_in_cb], ["-", zoom_out_cb], ["OUT", zoom_out_cb], ["MID", zoom_mid_cb], ["IN", zoom_in_cb]]:
		var button := Button.new()
		button.text = spec[0]
		button.custom_minimum_size = Vector2(size.x - 2.0, btn_h)
		button.add_theme_font_size_override("font_size", font_px)
		var style := PresentationTheme.compact_nav_button(true)
		button.add_theme_stylebox_override("normal", style)
		button.pressed.connect(spec[1])
		add_child(button)
