extends CanvasLayer

var _player: PlayerShip
var _label: Label
var _joystick: VirtualJoystick
var _mobile_input: MobileInputSource
var _root: Control

func _ready() -> void:
	layer = 10
	_root = Control.new()
	_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_root)
	_label = Label.new()
	_label.position = Vector2(12, 12)
	_label.add_theme_font_size_override("font_size", 14)
	_label.add_theme_color_override("font_color", Color(0.86, 0.94, 0.98))
	_root.add_child(_label)
	_setup_joystick()
	set_process(true)

func bind(player: PlayerShip) -> void:
	_player = player
	if _mobile_input != null:
		_player.set_input_source(_mobile_input)

func _setup_joystick() -> void:
	if not PlatformInfo.is_touch_primary():
		return
	var inset := PlatformInfo.safe_inset()
	_joystick = VirtualJoystick.new()
	_joystick.name = "VirtualJoystick"
	_joystick.position = Vector2(inset.x + 8.0, _root.size.y - inset.w - 168.0)
	_joystick.custom_minimum_size = Vector2(160, 160)
	_joystick.size = _joystick.custom_minimum_size
	_root.add_child(_joystick)
	_mobile_input = MobileInputSource.new()
	_mobile_input.name = "MobileInputSource"
	_mobile_input.joystick_path = _joystick.get_path()
	add_child(_mobile_input)
	if _player != null:
		_player.set_input_source(_mobile_input)

func _notification(what: int) -> void:
	if what == NOTIFICATION_RESIZED and _joystick != null:
		var inset := PlatformInfo.safe_inset()
		_joystick.position = Vector2(inset.x + 8.0, _root.size.y - inset.w - 168.0)

func _process(_delta: float) -> void:
	if _label == null:
		return
	var fps := Engine.get_frames_per_second()
	var speed := _player.current_speed() if _player != null else 0.0
	var heading := _player.heading_degrees() if _player != null else 0.0
	_label.text = "%s\nFPS: %d\nPLATFORM: %s\nINPUT: %s\nSPEED: %.1f\nHEADING: %.0f°" % [
		BuildInfo.label(),
		int(fps),
		PlatformInfo.platform_name(),
		PlatformInfo.input_mode_name(),
		speed,
		heading,
	]
