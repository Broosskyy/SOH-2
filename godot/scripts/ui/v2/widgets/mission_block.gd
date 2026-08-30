class_name MissionBlockV2
extends PanelContainer

func _init() -> void:
	name = "MissionBlock"
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_theme_stylebox_override("panel", PresentationTheme.compact_panel())

func apply_viewport(viewport: Vector2) -> void:
	for child in get_children():
		child.queue_free()
	var stack := VBoxContainer.new()
	stack.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	stack.add_theme_constant_override("separation", 0)
	var header := Label.new()
	header.text = "AKTIVE MISSION"
	header.add_theme_color_override("font_color", PresentationTheme.label_color("mission"))
	header.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.MISSION))
	stack.add_child(header)
	var title := Label.new()
	title.text = MockupCompositionProfile.HUD_MISSION_TITLE
	title.add_theme_color_override("font_color", PresentationTheme.label_color("name"))
	title.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.MISSION))
	stack.add_child(title)
	var objective := Label.new()
	objective.text = MockupCompositionProfile.HUD_MISSION_OBJECTIVE
	objective.clip_text = true
	objective.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	objective.add_theme_color_override("font_color", PresentationTheme.label_color("muted"))
	objective.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.MISSION))
	stack.add_child(objective)
	var progress := ProgressBar.new()
	progress.max_value = 1.0
	progress.value = 0.0
	progress.custom_minimum_size.y = maxf(4.0, size.y * 0.12)
	progress.add_theme_stylebox_override("background", PresentationTheme.bar_background())
	progress.add_theme_stylebox_override("fill", PresentationTheme.bar_fill(Color(0.82, 0.42, 0.28)))
	stack.add_child(progress)
	add_child(stack)
