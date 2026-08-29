class_name WorldPickInput
extends Node

@export var camera_path: NodePath
@export var input_source_path: NodePath

@onready var camera: Camera3D = get_node(camera_path)
@onready var input_source: PlayerInputSource = get_node(input_source_path)

var _touch_starts: Dictionary = {}
var _cancelled_touches: Dictionary = {}

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
			_set_destination_from_screen(event.position)
	elif event is InputEventScreenTouch:
		if event.pressed:
			if not _touch_starts.is_empty():
				for touch_index in _touch_starts:
					_cancelled_touches[touch_index] = true
				_cancelled_touches[event.index] = true
			_touch_starts[event.index] = event.position
		elif _touch_starts.has(event.index):
			var start := _touch_starts[event.index] as Vector2
			_touch_starts.erase(event.index)
			var was_cancelled := _cancelled_touches.has(event.index)
			_cancelled_touches.erase(event.index)
			if not was_cancelled and start.distance_to(event.position) <= 14.0:
				var viewport_width := get_viewport().get_visible_rect().size.x
				if not PlatformService.mobile or event.position.x >= viewport_width * 0.42:
					_set_destination_from_screen(event.position)

func _set_destination_from_screen(screen_position: Vector2) -> void:
	var origin := camera.project_ray_origin(screen_position)
	var direction := camera.project_ray_normal(screen_position)
	if absf(direction.y) < 0.0001:
		return
	var distance := (GameplayPlane.WATER_Y - origin.y) / direction.y
	if distance <= 0.0:
		return
	input_source.set_destination(origin + direction * distance)
