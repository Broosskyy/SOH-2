class_name PlayerShip
extends Node3D

@onready var gameplay_root: Node3D = $GameplayRoot
@onready var visual_root: Node3D = $GameplayRoot/VisualRoot
@onready var controller: PlayerShipController = $PlayerShipController
@onready var desktop_input: DesktopInputSource = $DesktopInputSource

var input_source: InputSource

func _ready() -> void:
	add_to_group("player_ship")
	KrakenPresentation.apply_to_visual_root(visual_root)
	controller.bind_body(gameplay_root)
	if PlatformInfo.is_touch_primary():
		input_source = null
	else:
		set_input_source(desktop_input)

func set_input_source(source: InputSource) -> void:
	input_source = source
	if input_source != null:
		if not input_source.command_changed.is_connected(_on_command_changed):
			input_source.command_changed.connect(_on_command_changed)
		_on_command_changed(input_source.poll_command())

func _physics_process(delta: float) -> void:
	if input_source != null:
		controller.apply_command(input_source.poll_command())
	controller.physics_tick(delta)
	global_transform = gameplay_root.global_transform

func _on_command_changed(command: PlayerCommand) -> void:
	controller.apply_command(command)

func heading_degrees() -> float:
	return controller.heading_degrees

func current_speed() -> float:
	return controller.speed
