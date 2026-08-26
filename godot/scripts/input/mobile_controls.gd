extends CanvasLayer

@export var player_path: NodePath

var player: Node
var joystick_center := Vector2.ZERO
var joystick_pointer := -1
var joystick_radius := 110.0

func _ready() -> void:
	player = get_node(player_path)
	visible = PlatformService.mobile
	_build_touch_hud()

func _build_touch_hud() -> void:
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)
	var fire := Button.new()
	fire.text = "FEUER"
	fire.custom_minimum_size = Vector2(150, 150)
	fire.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	fire.position = Vector2(-200, -190)
	fire.button_down.connect(func(): Input.action_press("primaryFire"))
	fire.button_up.connect(func(): Input.action_release("primaryFire"))
	root.add_child(fire)
	for index in 3:
		var ability := Button.new()
		ability.text = str(index + 1)
		ability.custom_minimum_size = Vector2(82, 82)
		ability.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
		ability.position = Vector2(-350 - index * 92, -118)
		var action := "ability%d" % (index + 1)
		ability.pressed.connect(func(): _pulse_action(action))
		root.add_child(ability)

func _unhandled_input(event: InputEvent) -> void:
	if not visible:
		return
	if event is InputEventScreenTouch:
		if event.pressed and event.position.x < get_viewport().get_visible_rect().size.x * 0.42:
			joystick_pointer = event.index
			joystick_center = event.position
		elif not event.pressed and event.index == joystick_pointer:
			joystick_pointer = -1
			player.set_touch_vector(Vector2.ZERO)
	elif event is InputEventScreenDrag and event.index == joystick_pointer:
		player.set_touch_vector((event.position - joystick_center) / joystick_radius)

func _pulse_action(action: StringName) -> void:
	Input.action_press(action)
	await get_tree().process_frame
	Input.action_release(action)

