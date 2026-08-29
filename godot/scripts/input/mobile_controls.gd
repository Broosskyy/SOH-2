extends CanvasLayer

## Single authoritative mobile control layer — camera pan joystick + pinch zoom only.
## Combat controls live in GameplayHud (disabled until G0.4).

@export var camera_path: NodePath

var camera: NavalCameraController
var joystick_center := Vector2.ZERO
var joystick_pointer := -1
var joystick_radius := 110.0
var root: Control
var joystick_area: Panel
var joystick_label: Label
var _pinch_touches: Dictionary = {}
var _pinch_distance := 0.0

func _ready() -> void:
	camera = get_node(camera_path)
	visible = PlatformService.mobile
	_build_touch_hud()
	get_viewport().size_changed.connect(_layout_touch_hud)
	_layout_touch_hud()

func _build_touch_hud() -> void:
	root = Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)
	joystick_area = Panel.new()
	joystick_area.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var joystick_style := StyleBoxFlat.new()
	joystick_style.bg_color = Color(0.02, 0.09, 0.13, 0.52)
	joystick_style.border_color = Color(0.62, 0.48, 0.24, 0.72)
	joystick_style.set_border_width_all(3)
	joystick_style.set_corner_radius_all(110)
	joystick_area.add_theme_stylebox_override("panel", joystick_style)
	root.add_child(joystick_area)
	joystick_label = Label.new()
	joystick_label.text = "⚓\nKAMERA"
	joystick_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	joystick_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	joystick_label.add_theme_color_override("font_color", Color(0.86, 0.78, 0.58))
	joystick_area.add_child(joystick_label)

func _layout_touch_hud() -> void:
	if root == null:
		return
	var viewport_size := get_viewport().get_visible_rect().size
	var scale := HudLayout.semantic_scale(viewport_size, HudLayout.Semantic.NAVIGATION)
	var margins := PlatformService.safe_margins(viewport_size)
	var size := HudLayout.touch_size(viewport_size, 180.0, HudLayout.Semantic.NAVIGATION)
	joystick_area.custom_minimum_size = Vector2(size, size)
	joystick_area.size = Vector2(size, size)
	joystick_style_radius(joystick_area, size * 0.5)
	joystick_area.position = Vector2(
		maxf(18.0, margins.x + 14.0),
		viewport_size.y - margins.w - size - 72.0
	)
	joystick_radius = size * 0.42
	joystick_label.add_theme_font_size_override("font_size", HudLayout.font_size(viewport_size, 10.0, HudLayout.Semantic.NAVIGATION))
	joystick_label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)

func joystick_style_radius(panel: Panel, radius: float) -> void:
	var style := panel.get_theme_stylebox("panel") as StyleBoxFlat
	if style != null:
		style.set_corner_radius_all(int(radius))

func _unhandled_input(event: InputEvent) -> void:
	if not visible:
		return
	if event is InputEventScreenTouch:
		if event.pressed and _is_joystick_zone(event.position):
			joystick_pointer = event.index
			joystick_center = event.position
			camera.reset_pan()
		elif event.pressed:
			_pinch_touches[event.index] = event.position
			_update_pinch_distance()
		elif not event.pressed and event.index == joystick_pointer:
			joystick_pointer = -1
			camera.set_pan_input(Vector2.ZERO)
		elif not event.pressed:
			_pinch_touches.erase(event.index)
			_update_pinch_distance()
	elif event is InputEventScreenDrag:
		if event.index == joystick_pointer:
			camera.set_pan_input((event.position - joystick_center) / joystick_radius)
		elif _pinch_touches.has(event.index):
			_pinch_touches[event.index] = event.position
			if _pinch_touches.size() == 2:
				var points := _pinch_touches.values()
				var distance := (points[0] as Vector2).distance_to(points[1] as Vector2)
				if _pinch_distance > 0.0:
					camera.adjust_zoom((distance - _pinch_distance) / 560.0)
				_pinch_distance = distance

func _is_joystick_zone(position: Vector2) -> bool:
	return joystick_area.get_global_rect().has_point(position)

func _update_pinch_distance() -> void:
	if _pinch_touches.size() != 2:
		_pinch_distance = 0.0
		return
	var points := _pinch_touches.values()
	_pinch_distance = (points[0] as Vector2).distance_to(points[1] as Vector2)
