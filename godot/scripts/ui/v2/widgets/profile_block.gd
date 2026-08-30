class_name ProfileBlockV2
extends PanelContainer

func _init() -> void:
	name = "ProfileBlock"
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_theme_stylebox_override("panel", PresentationTheme.compact_panel())

func apply_viewport(viewport: Vector2) -> void:
	for child in get_children():
		child.queue_free()
	var row := HBoxContainer.new()
	row.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	row.add_theme_constant_override("separation", 3)
	var avatar := PanelContainer.new()
	var av_size := minf(size.y - 4.0, size.x * 0.28)
	avatar.custom_minimum_size = Vector2(av_size, av_size)
	avatar.add_theme_stylebox_override("panel", PresentationTheme.round_button(av_size * 0.5))
	var mark := Label.new()
	mark.text = "SK"
	mark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	mark.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	mark.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mark.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.PROFILE_SECONDARY))
	avatar.add_child(mark)
	row.add_child(avatar)
	var copy := VBoxContainer.new()
	copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	copy.add_theme_constant_override("separation", 0)
	var name_row := HBoxContainer.new()
	name_row.add_theme_constant_override("separation", 4)
	var name_label := Label.new()
	name_label.text = MockupCompositionProfile.HUD_PLAYER_NAME
	name_label.add_theme_color_override("font_color", PresentationTheme.label_color("name"))
	name_label.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.PROFILE_PRIMARY))
	name_row.add_child(name_label)
	var level_label := Label.new()
	level_label.text = "Lv.%d" % MockupCompositionProfile.HUD_PLAYER_LEVEL
	level_label.add_theme_color_override("font_color", PresentationTheme.label_color("gold"))
	level_label.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.PROFILE_SECONDARY))
	name_row.add_child(level_label)
	copy.add_child(name_row)
	var guild := Label.new()
	guild.text = MockupCompositionProfile.HUD_GUILD_TAG
	guild.add_theme_color_override("font_color", PresentationTheme.label_color("guild"))
	guild.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.PROFILE_SECONDARY))
	copy.add_child(guild)
	var currencies := Label.new()
	currencies.text = "G 815K | X 12K | D 3250"
	currencies.add_theme_color_override("font_color", PresentationTheme.label_color("muted"))
	currencies.add_theme_font_size_override("font_size", HudV2Typography.font_size(viewport, HudV2Typography.Tier.PROFILE_SECONDARY))
	copy.add_child(currencies)
	row.add_child(copy)
	add_child(row)
