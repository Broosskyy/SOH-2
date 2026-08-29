extends CanvasLayer

var _label: Label
var _collapsed := false

func _ready() -> void:
	if not MobileWebDiagnostics.query_flag("qa"):
		visible = false
		set_process(false)
		return
	layer = 250
	_label = Label.new()
	_label.add_theme_font_size_override("font_size", 10)
	_label.add_theme_color_override("font_color", Color(0.92, 0.98, 0.55))
	_label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.95))
	_label.mouse_filter = Control.MOUSE_FILTER_STOP
	_label.gui_input.connect(_on_label_input)
	add_child(_label)
	get_viewport().size_changed.connect(_refresh)
	_refresh()

func _process(_delta: float) -> void:
	if Engine.get_frames_drawn() % 30 == 0:
		_refresh()

func _on_label_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_collapsed = not _collapsed
		_refresh()

func _refresh() -> void:
	if _label == null:
		return
	var viewport := get_viewport().get_visible_rect().size
	var safe := PlatformService.safe_rect(viewport)
	_label.anchor_left = 1.0
	_label.anchor_right = 1.0
	_label.anchor_top = 1.0
	_label.anchor_bottom = 1.0
	_label.offset_right = -(safe.size.x - safe.end.x + 8.0)
	_label.offset_bottom = -(safe.size.y - safe.end.y + 8.0)
	_label.offset_left = _label.offset_right - 280.0
	_label.offset_top = _label.offset_bottom - 120.0
	_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	if _collapsed:
		_label.text = "QA ▶"
		return
	var hud_owner := "GameplayPresentationRoot"
	for node in get_tree().get_nodes_in_group("gameplay_presentation_root"):
		if node != null:
			hud_owner = str(node.get_class())
			break
	var lines := UiMetrics.audit_lines(viewport)
	lines.append("HUD OWNER: %s" % hud_owner)
	lines.append("GIT: %s" % PresentationLayout.GIT_SHA)
	lines.append("(tap to collapse)")
	_label.text = "\n".join(lines)
