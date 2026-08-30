class_name VirtualJoystick
extends Control

signal moved(vector: Vector2)

@export var deadzone := 0.12
@export var radius := 72.0

var _active := false
var _center := Vector2.ZERO
var _vector := Vector2.ZERO
var _pointer := -1

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	resized.connect(_on_resized)
	_on_resized()

func _on_resized() -> void:
	_center = size * 0.5

func output_vector() -> Vector2:
	return _vector

func _gui_input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		_handle_touch(event as InputEventScreenTouch)
	elif event is InputEventScreenDrag:
		_handle_drag(event as InputEventScreenDrag)

func _handle_touch(event: InputEventScreenTouch) -> void:
	if event.pressed:
		_active = true
		_pointer = event.index
		_update_vector(event.position)
	else:
		if event.index == _pointer:
			_active = false
			_pointer = -1
			_vector = Vector2.ZERO
			moved.emit(_vector)

func _handle_drag(event: InputEventScreenDrag) -> void:
	if _active and event.index == _pointer:
		_update_vector(event.position)

func _update_vector(local_pos: Vector2) -> void:
	var offset := local_pos - _center
	var max_r := minf(radius, minf(size.x, size.y) * 0.45)
	if offset.length() > max_r:
		offset = offset.normalized() * max_r
	_vector = offset / maxf(max_r, 1.0)
	if _vector.length() < deadzone:
		_vector = Vector2.ZERO
	moved.emit(_vector)

func _draw() -> void:
	var max_r := minf(radius, minf(size.x, size.y) * 0.45)
	draw_circle(_center, max_r, Color(0.04, 0.1, 0.14, 0.55))
	draw_arc(_center, max_r, 0.0, TAU, 48, Color(0.62, 0.48, 0.24, 0.65), 2.0)
	var knob := _center + _vector * max_r
	draw_circle(knob, max_r * 0.28, Color(0.72, 0.57, 0.27, 0.85))
