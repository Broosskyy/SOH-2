class_name StatusBlockV2
extends PanelContainer

func _init() -> void:
	name = "StatusBlock"
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_theme_stylebox_override("panel", PresentationTheme.compact_panel())

func apply_viewport(viewport: Vector2) -> void:
	for child in get_children():
		child.queue_free()
	var stack := VBoxContainer.new()
	stack.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	stack.add_theme_constant_override("separation", 0)
	var row_h := maxf(4.0, (size.y - 2.0) / 3.0)
	stack.add_child(_status_row(viewport, "EXP", MockupCompositionProfile.HUD_EXP_CURRENT, MockupCompositionProfile.HUD_EXP_MAX, Color(0.92, 0.78, 0.28), row_h))
	stack.add_child(_status_row(viewport, "RUMPF", MockupCompositionProfile.HUD_RUMPF_CURRENT, MockupCompositionProfile.HUD_RUMPF_MAX, Color(0.28, 0.62, 0.95), row_h))
	stack.add_child(_status_row(viewport, "SCHUTZ", MockupCompositionProfile.HUD_SCHUTZ_CURRENT, MockupCompositionProfile.HUD_SCHUTZ_MAX, Color(0.32, 0.88, 0.52), row_h))
	add_child(stack)

func _status_row(viewport: Vector2, title: String, current: float, max_value: float, color: Color, row_h: float) -> HBoxContainer:
	var row := HBoxContainer.new()
	row.custom_minimum_size.y = row_h
	row.add_theme_constant_override("separation", 3)
	var label := Label.new()
	label.text = title
	label.custom_minimum_size.x = 34.0
	label.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.STATUS))
	label.add_theme_color_override("font_color", PresentationTheme.label_color("muted"))
	row.add_child(label)
	var bar := ProgressBar.new()
	bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	bar.custom_minimum_size.y = maxf(3.0, row_h - 2.0)
	bar.max_value = max_value
	bar.value = current
	bar.show_percentage = false
	bar.add_theme_stylebox_override("background", PresentationTheme.bar_background())
	bar.add_theme_stylebox_override("fill", PresentationTheme.bar_fill(color))
	row.add_child(bar)
	var value := Label.new()
	value.text = "%s / %s" % [_fmt(current), _fmt(max_value)]
	value.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.STATUS))
	value.add_theme_color_override("font_color", PresentationTheme.label_color("default"))
	row.add_child(value)
	return row

func _fmt(value: float) -> String:
	var text := str(int(value))
	var out := ""
	for i in range(text.length()):
		if i > 0 and (text.length() - i) % 3 == 0:
			out += "."
		out += text[i]
	return out
