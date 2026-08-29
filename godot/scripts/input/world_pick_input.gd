class_name WorldPickInput
extends Node

@export var camera_path: NodePath
@export var input_source_path: NodePath
@export var region_runtime_path: NodePath

@onready var camera: Camera3D = get_node(camera_path)
@onready var input_source: PlayerInputSource = get_node(input_source_path)
@onready var region_runtime: Node = get_node_or_null(region_runtime_path)

var _touch_starts: Dictionary = {}
var _cancelled_touches: Dictionary = {}

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
			_handle_pick(event.position)
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
					_handle_pick(event.position)

func _handle_pick(screen_position: Vector2) -> void:
	var target := _pick_target(screen_position)
	if target != null:
		TargetingSystem.set_target(target)
		return
	var destination: Variant = _raycast_water(screen_position)
	if destination == null:
		return
	input_source.set_destination(destination)

func _pick_target(screen_position: Vector2) -> Node3D:
	var space_state := camera.get_world_3d().direct_space_state
	var origin := camera.project_ray_origin(screen_position)
	var direction := camera.project_ray_normal(screen_position)
	var query := PhysicsRayQueryParameters3D.create(origin, origin + direction * 4000.0)
	query.collide_with_areas = false
	var hit := space_state.intersect_ray(query)
	if hit.is_empty():
		return null
	var collider := hit.collider as Node
	while collider != null:
		if collider.is_in_group("npc_ships"):
			return collider as Node3D
		collider = collider.get_parent()
	return null

func _raycast_water(screen_position: Vector2) -> Variant:
	var origin := camera.project_ray_origin(screen_position)
	var direction := camera.project_ray_normal(screen_position)
	if absf(direction.y) < 0.0001:
		return null
	var distance := (GameplayPlane.WATER_Y - origin.y) / direction.y
	if distance <= 0.0:
		return null
	var destination := origin + direction * distance
	if region_runtime != null and region_runtime.has_method("navigation_boundaries"):
		for boundary in region_runtime.call("navigation_boundaries"):
			if boundary is IslandEntity and boundary.blocks_point(destination):
				return null
	return destination
