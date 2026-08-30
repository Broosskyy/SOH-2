class_name ConsumablesBlockV2
extends HBoxContainer

const ITEMS := [["OIL", "32"], ["POT", "21"], ["BMB", "18"], ["H2O", "24"]]

func _init() -> void:
	name = "ConsumablesBlock"
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	alignment = BoxContainer.ALIGNMENT_CENTER

func apply_viewport(viewport: Vector2) -> void:
	for child in get_children():
		child.queue_free()
	var diameter := minf(size.y - 2.0, (size.x - 12.0) / float(ITEMS.size()))
	for item in ITEMS:
		var button := Button.new()
		button.text = "%s\n%s" % [item[0], item[1]]
		button.disabled = true
		button.focus_mode = Control.FOCUS_NONE
		button.custom_minimum_size = Vector2(diameter, diameter)
		button.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.SECONDARY_ACTION))
		var style := PresentationTheme.round_button(diameter * 0.5)
		button.add_theme_stylebox_override("normal", style)
		button.add_theme_stylebox_override("disabled", style)
		add_child(button)
