extends CanvasLayer

@export var camera_path: NodePath

var camera: NavalCameraController
var joystick_center := Vector2.ZERO
var joystick_pointer := -1
var joystick_radius := 110.0
var root: Control
var joystick_area: Panel
var fire_button: Button
var ability_buttons: Array[Button] = []
var _last_viewport_size := Vector2.ZERO
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
	joystick_area.custom_minimum_size = Vector2(220, 220)
	var joystick_style := StyleBoxFlat.new()
	joystick_style.bg_color = Color(0.02, 0.09, 0.13, 0.48)
	joystick_style.border_color = Color(0.35, 0.9, 0.92, 0.58)
	joystick_style.set_border_width_all(3)
	joystick_style.set_corner_radius_all(110)
	joystick_area.add_theme_stylebox_override("panel", joystick_style)
	root.add_child(joystick_area)
	fire_button = Button.new()
	fire_button.text = "FEUER"
	fire_button.custom_minimum_size = Vector2(150, 150)
	fire_button.button_down.connect(func(): Input.action_press("primaryFire"))
	fire_button.button_up.connect(func(): Input.action_release("primaryFire"))
	root.add_child(fire_button)
	for index in 3:
		var ability := Button.new()
		ability.text = str(index + 1)
		ability.custom_minimum_size = Vector2(82, 82)
		var action := "ability%d" % (index + 1)
		ability.pressed.connect(func(): _pulse_action(action))
		ability_buttons.append(ability)
		root.add_child(ability)

func _layout_touch_hud() -> void:
	if root == null:
		return
	var viewport_size := get_viewport().get_visible_rect().size
	var margins := PlatformService.safe_margins(viewport_size)
	var left := maxf(24.0, margins.x + 20.0)
	var right_safe := margins.z
	var bottom_safe := margins.w
	joystick_area.position = Vector2(left, viewport_size.y - bottom_safe - 244.0)
	fire_button.position = Vector2(viewport_size.x - right_safe - 174.0, viewport_size.y - bottom_safe - 184.0)
	for index in ability_buttons.size():
		ability_buttons[index].position = Vector2(
			viewport_size.x - right_safe - 278.0 - index * 92.0,
			viewport_size.y - bottom_safe - 96.0
		)

func _unhandled_input(event: InputEvent) -> void:
	if not visible:
		return
	if event is InputEventScreenTouch:
		if event.pressed and event.position.x < get_viewport().get_visible_rect().size.x * 0.42:
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

func _pulse_action(action: StringName) -> void:
	Input.action_press(action)
	await get_tree().process_frame
	Input.action_release(action)

func _update_pinch_distance() -> void:
	if _pinch_touches.size() != 2:
		_pinch_distance = 0.0
		return
	var points := _pinch_touches.values()
	_pinch_distance = (points[0] as Vector2).distance_to(points[1] as Vector2)

