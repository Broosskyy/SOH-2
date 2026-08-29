extends CanvasLayer

@export var input_source_path: NodePath

var input_source: PlayerInputSource
var joystick_center := Vector2.ZERO
var joystick_pointer := -1
var joystick_radius := 110.0
var root: Control
var joystick_area: Panel
var fire_button: Button
var ability_buttons: Array[Button] = []
var _last_viewport_size := Vector2.ZERO

func _ready() -> void:
	input_source = get_node(input_source_path)
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
	var safe := PlatformService.safe_area()
	if safe.size == Vector2i.ZERO:
		safe = Rect2i(Vector2i.ZERO, Vector2i(viewport_size))
	var left := maxf(24.0, float(safe.position.x) + 20.0)
	var right_safe := maxf(0.0, viewport_size.x - float(safe.end.x))
	var bottom_safe := maxf(0.0, viewport_size.y - float(safe.end.y))
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
		elif not event.pressed and event.index == joystick_pointer:
			joystick_pointer = -1
			input_source.set_touch_vector(Vector2.ZERO)
	elif event is InputEventScreenDrag and event.index == joystick_pointer:
		input_source.set_touch_vector((event.position - joystick_center) / joystick_radius)

func _pulse_action(action: StringName) -> void:
	Input.action_press(action)
	await get_tree().process_frame
	Input.action_release(action)

