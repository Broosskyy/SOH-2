extends CanvasLayer

var _label: Label

func _ready() -> void:
	if not MobileWebDiagnostics.query_flag("qa"):
		visible = false
		set_process(false)
		return
	layer = 250
	_label = Label.new()
	_label.add_theme_font_size_override("font_size", 11)
	_label.add_theme_color_override("font_color", Color(0.92, 0.98, 0.55))
	_label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.95))
	_label.position = Vector2(8, 8)
	add_child(_label)
	get_viewport().size_changed.connect(_refresh)
	_refresh()

func _process(_delta: float) -> void:
	if Engine.get_frames_drawn() % 30 == 0:
		_refresh()

func _refresh() -> void:
	if _label == null:
		return
	var viewport := get_viewport().get_visible_rect().size
	var css := HudLayoutProfile.css_viewport()
	var hud_owner := "GameplayPresentationRoot"
	for node in get_tree().get_nodes_in_group("gameplay_presentation_root"):
		if node != null:
			hud_owner = str(node.get_class())
			break
	_label.text = "\n".join([
		"BUILD: %s" % PresentationLayout.BUILD_LABEL,
		"GIT: %s" % PresentationLayout.GIT_SHA,
		"LAYOUT: %s" % HudLayoutProfile.profile_name(viewport),
		"VIEWPORT: %dx%d" % [int(viewport.x), int(viewport.y)],
		"CSS: %dx%d" % [int(css.x), int(css.y)],
		"DPR: %.2f" % HudLayoutProfile.device_pixel_ratio(),
		"PLATFORM: %s" % PlatformService.platform_name(),
		"HUD OWNER: %s" % hud_owner,
	])
