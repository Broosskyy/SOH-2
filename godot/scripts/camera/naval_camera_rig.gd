class_name NavalCameraRig
extends Node3D

@export var target_path: NodePath
@export var camera_path: NodePath
@export var fov := 35.0
@export var follow_height := 560.0
@export var follow_back := 360.0
@export var follow_lateral := -58.0
@export var target_height := 12.0
@export var target_forward := -52.0
@export var follow_smoothing := 5.5
@export var min_zoom := 0.55
@export var max_zoom := 1.38

var zoom := 0.94
var _target: Node3D
var _camera: Camera3D
var _pinch_distance := 0.0

func _ready() -> void:
	_target = get_node_or_null(target_path)
	_camera = get_node_or_null(camera_path)
	if _camera != null:
		_camera.fov = fov
		_camera.current = true

func _process(delta: float) -> void:
	if _target == null or _camera == null:
		return
	if Input.is_action_just_pressed("zoomIn"):
		zoom = clampf(zoom + 0.08, min_zoom, max_zoom)
	if Input.is_action_just_pressed("zoomOut"):
		zoom = clampf(zoom - 0.08, min_zoom, max_zoom)
	var target_pos := _target.global_position
	var offset := Vector3(follow_lateral, follow_height, follow_back) * zoom
	var desired := target_pos + offset
	global_position = global_position.lerp(desired, 1.0 - exp(-follow_smoothing * delta))
	var look_target := target_pos + Vector3(0.0, target_height, target_forward)
	_camera.look_at(look_target, Vector3.UP)


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMagnifyGesture:
		var magnify := event as InputEventMagnifyGesture
		zoom = clampf(zoom / magnify.factor, min_zoom, max_zoom)
