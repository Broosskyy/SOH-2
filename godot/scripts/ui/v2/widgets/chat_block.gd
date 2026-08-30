class_name ChatBlockV2
extends PanelContainer

func _init() -> void:
	name = "ChatBlock"
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_theme_stylebox_override("panel", PresentationTheme.compact_panel())

func apply_viewport(viewport: Vector2) -> void:
	for child in get_children():
		child.queue_free()
	var stack := VBoxContainer.new()
	stack.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	stack.add_theme_constant_override("separation", 0)
	var tabs := HBoxContainer.new()
	for tab in ["Global", "Guild", "System"]:
		var label := Label.new()
		label.text = tab
		label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		label.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.CHAT))
		label.add_theme_color_override("font_color", PresentationTheme.label_color("gold" if tab == "Global" else "muted"))
		tabs.add_child(label)
	stack.add_child(tabs)
	var preview := Label.new()
	preview.text = "[Global] CaptainX: Welcome aboard."
	preview.clip_text = true
	preview.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	preview.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.CHAT))
	preview.add_theme_color_override("font_color", PresentationTheme.label_color("default"))
	stack.add_child(preview)
	var input_hint := Label.new()
	input_hint.text = "Tap to chat..."
	input_hint.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.CHAT))
	input_hint.add_theme_color_override("font_color", PresentationTheme.label_color("muted"))
	stack.add_child(input_hint)
	add_child(stack)
